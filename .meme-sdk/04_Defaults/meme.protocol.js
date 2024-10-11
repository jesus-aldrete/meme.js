//                    Copyright meme.js Authors
//     Distributed under the Boost Software License, Version 1.1.
// (See accompanying file LICENSE or copy at https://mjs.red/LICENSE)


/* Declaraciones */
const tcTCP=1, tcSocket=2, tcEdge=3;

/* Funciones */
function MemeProtocolHTTP( host ) {
	/* Declaraciones */
	let   token_socket  ;
	let   errors        = 0;
	let   socket        = null;
	let   is_connect    = false;
	let   buffer_result = '';
	const id_session    = GenerateUUID();
	const earrings      = {};

	let   output_proc  = false;
	const output_queue = [];

	/* Eventos */
	function onClose() {
		if ( !is_connect ) return;

		is_connect = false;

		setTimeout(
			() => {
				if ( errors++<20 ) {
					Connect( token_socket );
				}
			},
			1000
		);

		console.error( 'Socket cerrado' );
	}

	async function onMessage({ data }) {
		switch ( data ) {
			default     : buffer_result+= decodeURIComponent( data ); break;
			case 'START': buffer_result = ''; break;
			case 'END'  :
				let jso;

				try {
					jso = JSON.parse( buffer_result );
				}
				catch ( error ) {
					console.error( 'Error en el parseo del mensaje:', error );

					jso = {};
				}

				if ( jso.event ) {
					const res        = await Trigger( jso.event, jso.params );
					const event_text = JSON.stringify({ id:jso.id, result:[res] });

					output_queue.push( event_text );
					ProcessOutputQueue();
				}
				else {
					const ear = earrings[jso.id];

					delete earrings[jso.id];

					if ( ear ) {
						if ( jso.result ) ear.run( jso.result[0] );
						else              console.error( jso );
					}
				}
			break;
		}
	}

	/* Funciones */
	function GenerateUUID() {
		let d  = new Date().getTime();
		let d2 = ( performance.now?.() ?? 0 ) * 1000;

		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
			/[xy]/g,
			( c ) => {
				let r = Math.random() * 16;

				if ( d>0 ) {
					r = ( d + r ) % 16 | 0;
					d = Math.floor( d / 16 );
				}
				else {
					r  = ( d2 + r ) % 16 | 0;
					d2 = Math.floor( d2 / 16 );
				}

				return ( c==='x' ? r : ( r & 0x3 | 0x8 ) ).toString( 16 );
			}
		);
	}
	function EncodeBase64Url( data ) {
		data = btoa( data )
		.replace ( /=/g , ''  )
		.replace ( /\+/g, '-' )
		.replace ( /\//g, '_' )

		return data.slice( 2 ) + data.slice( 0, 2 )
	}

	function Trigger( event, params ) {
		const evt   = new Event( event, { bubbles:true, cancelable:false } );
		evt._params = params;

		document.body.dispatchEvent( evt );

		return evt._result;
	}
	async function ProcessOutputQueue() {
		if ( !output_queue.length || output_proc ) return;

		output_proc = true;

		const output        = output_queue.shift();
		const chunk_size    = 64 * 1024;
		const total_chunks  = Math.ceil( output.length / chunk_size );
		let   current_chunk = 0;

		socket.send( 'START' );

		while ( current_chunk<total_chunks ) {
			const start = current_chunk * chunk_size;
			const end   = Math.min( start + chunk_size, output.length );
			const chunk = output.slice( start, end );

			socket.send( chunk );

			current_chunk++;
		}

		socket.send( 'END' );

		output_proc = false;

		output_queue.length>0 && ProcessOutputQueue();
	}

	// Metodos de ejecucion
	async function ExecTCP( event, params ) {
		const result = await fetch(
			`${host}/function/${event}`,
			{
				body       : JSON.stringify( params ),
				method     : 'POST',
				headers    : { 'content-type':'application/json', 'id-session':id_session },
				credentials: 'include',
			}
		);

		if ( !result.ok ) {
			console.error( 'error en la consulta del protocolo de meme:', result );
			return;
		}

		return ( await result.json() ).value;
	}
	function ExecSocket( event, params ) {
		return new Promise( async ( run, err ) => {
			if ( !is_connect ) await Connect();

			const obj        = { id:GenerateUUID(), run, err, event, params };
			earrings[obj.id] = obj;
			const event_text = JSON.stringify( obj );

			output_queue.push( event_text );
			ProcessOutputQueue();
		});
	}

	/* Metodos */
	async function Exec( type, event, ...params ) {
		switch ( type ) {
			case tcTCP   : return await ExecTCP   ( event, params );
			case tcSocket: return await ExecSocket( event, params );
		}
	}

	function Connect( token ) {
		return new Promise(
			( run ) => {
				token_socket = token;

				try   { token = JSON.stringify({ id_session, token }) }
				catch { token = JSON.stringify({ id_session        }) }

				token  = EncodeBase64Url( token );
				socket = new WebSocket(
					host.replace( 'https:', 'wss:' ).replace( 'http:', 'ws:' ) + '/meme-socket-protocol'
					,
					[token, 'chat']
				);

				socket.onopen    = (   ) => { run( is_connect=true  ); errors = 0 };
				socket.onerror   = ( e ) => { run( is_connect=false ); console.error( e ) }
				socket.onclose   = onClose;
				socket.onmessage = onMessage;
			}
		);
	}
	function Disconnect() {
		is_connect = false;

		socket?.close();

		socket = null;
	}

	function IsConnect() {
		return is_connect;
	}

	/* Inicio */
	return { Exec, Connect, Disconnect, IsConnect };
}
// ###################################################################################################


/* Inicio */
window._meme_protocol = MemeProtocolHTTP( '[[API]]' );
// ###################################################################################################
