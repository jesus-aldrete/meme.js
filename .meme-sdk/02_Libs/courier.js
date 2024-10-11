/* Declaraciones */
const net      = require( 'node:net' );
const { Hash } = require( './lib.js' );
// ####################################################################################################


/* Funciones */
function ConnectServer({ host, port, onEnd }) {
	/* Declaraciones */
	let   client     ;
	const events     = {};
	const conections = {};
	const earrings   = {};

	let   input_proc  = false;
	const input_queue = [];

	let   output_proc  = false;
	const output_queue = [];

	/* Eventos */
	async function onData( socket, data ) {
		data = data.toString();

		if ( ( end=data.indexOf( '⎭' ) )>-1 ) {
			input_queue.push( socket.buffer + data.slice( 0, end ) );

			socket.buffer = '';
			data          = data.slice( end + 1 );

			await ProcessInputQueue( socket );

			data && onData( socket, data );
		}
		else socket.buffer+= data;
	}

	/* Actions */
	async function ActionResult( socket, jso ) {
		const ear = earrings[jso.id];

		if ( !ear ) return

		delete earrings[jso.id];

		if ( ear.id_trigger ) {
			output_queue.push({ socket:ear.socket, data:JSON.stringify({ id:ear.id_trigger, type:'result', result:jso.result }) });
			ProcessOutputQueue();
		}
		else ear.resolve( ...( jso.result || [] ) );
	}
	async function ActionTrigger( socket, jso ) {
		const evns = events[jso.event] || [];

		if ( !evns.length ) {
			output_queue.push({ socket, data:JSON.stringify({ id:jso.id, type:'result' }) });
			ProcessOutputQueue();
			return;
		}

		let res, soc, obj;

		for ( const eve of evns ) {
			if      ( typeof eve.func==='function' ) { soc = socket; res = await eve.func( ...jso.params )                                            ; obj = { id:jso.id, type:'result', result:[res] } }
			else if ( eve.driver                   ) { soc = socket; res = await eve.driver.Trigger( jso.event, ...jso.params ).catch( console.error ); obj = { id:jso.id, type:'result', result:[res] } }
			else                                     {
				const id     = Hash();
				soc          = eve.socket;
				obj          =
				earrings[id] = { id, socket, id_trigger:jso.id, event:jso.event, params:jso.params, type:'trigger' };
			}

			output_queue.push({ socket:soc, data:JSON.stringify( obj ) });
		}

		ProcessOutputQueue();
	}
	async function ActionRemove( socket, jso ) {
		for ( const [_key,_val] of Object.entries( events ) ) {
			for ( const [i,v] of _val.entries() ) {
				if ( v.id_event && v.id_event===jso.event ) {
					_val.splice( i, 1 );
				}
			}

			if ( !_val.length ) delete events[_key];
		}

		delete events[jso.event];

		output_queue.push({ socket, data:JSON.stringify({ id:jso.id, type:'result' }) });
		ProcessOutputQueue();
	}
	async function ActionEvents( socket, jso ) {
		events[jso.event]??= [];
		jso.socket         = socket;

		events[jso.event].push( jso );

		output_queue.push({ socket, data:JSON.stringify({ id:jso.id, type:'result' }) })
		ProcessOutputQueue();
	}
	async function ActionConnect( socket, jso ) {
		const ty = typeof jso.token==='string' ? 'string' : 'object';
		const id = Hash( ty==='string' ? jso.token : JSON.stringify( jso ) );

		if ( ty==='string' ) {
			try   { jso.token = JSON.parse( jso.token ) }
			catch { jso.token = {} }
		}

		if ( !conections[id] ) {
			const cof      = jso.token;
			const con      =
			conections[id] = { id };

			con.driver = await ConnectClient({ host:cof.host, port:cof.port, onEnd:()=>{ delete conections[id] } }).catch( console.log );

			if ( !con.driver ) {
				console.Error( `No se pudo conectar al driver a el cliente, host: ${cof.host}, port: ${cof.port}` );
				return;
			}

			const list = await con.driver.Trigger( 'courier/get_events' );

			for ( const eve of list ) {
				if ( eve.match( /project|courier/ ) ) continue;

				events[eve]??= [];
				events[eve].push({ id, driver:con.driver });
			}
		}

		output_queue.push({ socket, data:JSON.stringify({ id:jso.id, type:'result' }) });
		ProcessOutputQueue();
	}

	/* Funciones */
	async function ProcessInputQueue( socket ) {
		if ( !input_queue.length || input_proc ) return;

		input_proc = true;
		const data = input_queue.shift();
		let   jso;

		try         { jso = JSON.parse( data ) }
		catch ( e ) { jso = {}; console.Error( e ) }

		input_proc = false;

		input_queue.length>0 && ProcessInputQueue( socket );

		switch ( jso.type ) {
			case 'events' : await ActionEvents ( socket, jso ); break;
			case 'result' : await ActionResult ( socket, jso ); break;
			case 'remove' : await ActionRemove ( socket, jso ); break;
			case 'trigger': await ActionTrigger( socket, jso ); break;
			case 'connect': await ActionConnect( socket, jso ); break;

			default: debugger
		}
	}
	async function ProcessOutputQueue() {
		if ( !output_queue.length || output_proc ) return;

		output_proc = true;

		let   pos    = 0;
		const size   = 5 * ( 1024 * 1024 );
		const output = output_queue.shift();
		const data   = output.data;
		const client = output.socket;

		for ( ;( pos+size )<data.length; pos+=size ) {
			client.write( data.slice( pos, pos+size ) );
		}

		client.write( data.slice( pos ) );
		client.write( '⎭' );

		output_proc = false;

		output_queue.length>0 && ProcessOutputQueue();
	}

	/* Api */
	async function Events( event, func ) {
		if ( typeof event==='string' ) event = { [event]:func };

		for ( const [eve,fun] of Object.entries( event ) ) {
			events[eve]??= [];

			events[eve].push({ func:fun });
		}
	}
	async function Trigger( event, ...params ) {
		const res = [];
		const prs = [];

		for ( const eve of events[event]??[] ) {
			if ( typeof eve.func==='function' ) {
				res.push(
					await eve.func( ...params )
				);
			}
			else {
				prs.push(
					new Promise( ( run, err ) => {
						const id     = Hash();
						const obj    =
						earrings[id] = { id, event, params, type:'trigger', resolve:run, reject:err };

						output_queue.push({ socket:eve.socket, data:JSON.stringify( obj ) });
					})
				);
			}
		}

		ProcessOutputQueue();

		res.push( ...await Promise.all( prs ) );

		return res.length===1 ? res[0] : res;
	}

	/* Inicio */
	return new Promise( ( run, err ) => {
		/* Eventos de courier */
		events['courier/get_events'] = [{ func:()=>Object.keys( events ) }];

		/* Creando Servidor */
		onEnd??= ()=>{};
		client = net.createServer(
			socket => {
				const id      =
				socket.id     = Hash();
				socket.buffer = '';

				socket.on( 'data' , ( d ) => onData( socket, d ) );
				socket.on( 'error', ( e ) => console.Error( `Error en la conexión: ${e.message}` ) );
				socket.on( 'end'  , (   ) => {
					for ( const array_eve of Object.values( events ) ) {
						for ( let i=array_eve.length; i--; ) {
							const eve = array_eve[i];

							if ( eve.socket && eve.socket.id===id ) {
								array_eve.splice( i, 1 );
							}
						}
					}

					for ( const [key, ear] of Object.entries( earrings ) ) {
						if ( ear.socket && ear.socket.id===id ) {
							delete earrings[key];

							if ( ear.reject ) ear.reject();
						}
					}
				});
			}
		);

		client.listen(
			port,
			host,
			()=>run({ port, Events, Trigger })
		);

		client.on( 'end'  , onEnd );
		client.on( 'error', err   );
	});
}
function ConnectClient({ port, host, onEnd }) {
	/* Declaraciones */
	let   client   ;
	let   buffer   = '';
	const events   = {};
	const earrings = {};

	let   input_proc  = false;
	const input_queue = [];

	let   output_proc  = false;
	const output_queue = [];

	/* Eventos */
	function onData( data ) {
		data = data.toString();

		if ( ( end=data.indexOf( '⎭' ) )>-1 ) {
			input_queue.push( buffer + data.slice( 0, end ) );

			buffer = '';
			data   = data.slice( end + 1 );

			ProcessInputQueue();

			data && onData( data );
		}
		else buffer+= data;
	}

	/* Acciones */
	async function ActionTrigger( jso ) {
		let result;

		for ( const eve of events[jso.event] ?? [] ) {
			if ( typeof eve.func!=='function' ) continue;

			result = await eve.func( ...jso.params );

			output_queue.push(
				JSON.stringify(
					{
						result: [result],
						id    : jso.id,
						type  : 'result',
					}
				)
			);
		}

		ProcessOutputQueue();
	}
	async function ActionResult( jso ) {
		let ear;

		if ( ear=earrings[jso.id] ) {
			delete earrings[jso.id];

			ear.resolve( ...( jso.result||[] ) );
		}
	}

	/* Proceso de colas */
	async function ProcessInputQueue() {
		if ( !input_queue.length || input_proc ) return;

		input_proc = true;
		const data = input_queue.shift();
		let   jso  ;

		try         { jso = JSON.parse( data ) }
		catch ( e ) { jso = {}; console.Error( e ) }

		input_proc = false;

		input_queue.length>0 && ProcessInputQueue();

		switch ( jso.type ) {
			case 'trigger': return await ActionTrigger( jso );
			case 'result' : return await ActionResult ( jso );

			default: debugger
		}
	}
	async function ProcessOutputQueue() {
		if ( !output_queue.length || output_proc ) return;

		output_proc = true;

		let   pos  = 0;
		const size = 5 * ( 1024 * 1024 );
		const data = output_queue.shift();

		for ( ;( pos+size )<data.length; pos+=size ) {
			client.write( data.slice( pos, pos+size ) );
		}

		client.write( data.slice( pos ) );
		client.write( '⎭' );

		output_proc = false;

		output_queue.length>0 && await ProcessOutputQueue();
	}

	/* Api */
	function Events( event, func ) {
		if ( typeof event==='string' ) event = { [event]:func };

		const prs = [];
		const ide = event.id;

		delete event.id;

		for ( const [key,fun] of Object.entries( event ) ) {
			prs.push(
				new Promise( ( run, err ) => {
					if ( fun===false ) {
						for ( const [_key,_val] of Object.entries( events ) ) {
							for ( const [i,v] of _val.entries() ) {
								if ( v.id_event && v.id_event===( ide||key ) ) {
									_val.splice( i, 1 );
								}
							}

							if ( !_val.length ) delete events[_key];
						}

						delete events[ide];
					}
					else {
						events[key]??= [];
						events[key].push({ id_event:ide, event:key, func:fun });
					}

					const id     = Hash();
					const obj    =
					earrings[id] = { id, id_event:ide, event:key, func:fun, type:( fun===false ? 'remove' : 'events' ), resolve:run, reject:err };

					output_queue.push( JSON.stringify( obj ) );
				})
			);
		}

		ProcessOutputQueue();

		return Promise.all( prs );
	}
	function Trigger( event, ...params ) {
		return new Promise(
			( run, err ) => {
				const id     = Hash();
				const obj    =
				earrings[id] = { id, event, params, type:'trigger', resolve:run, reject:err };

				output_queue.push( JSON.stringify( obj ) );
				ProcessOutputQueue();
			}
		);
	}
	function Connect( token ) {
		return new Promise(
			( run, err ) => {
				const id     = Hash();
				const obj    =
				earrings[id] = { id, token, type:'connect', resolve:run, reject:err };

				output_queue.push( JSON.stringify( obj ) );
				ProcessOutputQueue();
			}
		);
	}

	/* Inicio */
	return new Promise( ( run, err ) => {
		client = net.createConnection({ port, host }, () => run({ port, client, Trigger, Events, Connect }) );
		onEnd??= ()=>{};

		client.on( 'end'  , onEnd  );
		client.on( 'data' , onData );
		client.on( 'error', err    );
	});
}
// ####################################################################################################


/* Exportaciones */
module.exports = { ConnectServer, ConnectClient };
// ####################################################################################################