#! /usr/bin/env node
process.title = 'meme.js DRIVER';
// ###################################################################################################


//                    Copyright meme.js Authors
//     Distributed under the Boost Software License, Version 1.1.
// (See accompanying file LICENSE or copy at https://mjs.red/LICENSE)


/* Importaciones */
const http              = require( 'node:http'          );
const http2             = require( 'node:http2'         );
const { fork          } = require( 'node:child_process' );
const { KillProcess   } = require( '../02_Libs/lib'     );
const { ConnectServer } = require( '../02_Libs/courier' );

const {
	LoadConfig,
	GetPortDriver,
} = require( '../02_Libs/config' );

const {
	MesageProc,
	ConfigureTitle,
	ConfigureConfig,
} = require( '../02_Libs/log' );
// ###################################################################################################


/* Declaraciones */
let   COURIER  ;
const PROJECTS = {};
// ###################################################################################################


/* Comandos */
async function Start( project ) {
	console.Cmd( '\nby[Start]' );

	/* Eventos */
	function onExit( proc, _, type ) {
		if ( proc.is_close || type==='SIGKILL' ) return;

		if ( !proc.is_connect || !proc.is_load ) {
			proc.is_error = true;

			COURIER.Trigger( 'project/error', { id:project.id, type:proc.name } );

			ProcessLoadQueue();
		}

		if ( proc.is_alive ) {
			clearTimeout( project.reload_timer );

			proc                  =
			project[proc.name]    = { ...project.config[proc.name], crt:undefined, key:undefined, port:proc.port, name:proc.name };
			project.reload_count??= 0;
			project.reload_timer  = setTimeout( ()=>{ project.reload_count = 0 }, 3000 );

			if ( project.reload_count++<10 ) {
				const col = proc.name==='res' ? 'fb' : ( proc.name==='api' ? 'fm' : 'fg' );

				console.Cmd( `\ncv[fr[Restaurando Proceso ${col}[${proc.name.toUpperCase()}]:]]` );
				StartProccess( proc.name );
			}
		}
	}

	function onInit({ id, type }) {
		if ( project.id!==id ) return;

		COURIER.Trigger(
			'project/connect',
			{
				id          ,
				type        ,
				path        : project.path,
				port        : project[type].port,
				environments: project.environments,
			}
		);
	}
	function onConnect({ id, type, port }) {
		if ( project.id!==id ) return;

		project[type].port       = port;
		project[type].is_connect = true;

		const { res, app, api } = project;

		if ( !res.is_error && res.start && !res.is_connect ) return;
		if ( !app.is_error && app.start && !app.is_connect ) return;
		if ( !api.is_error && api.start && !api.is_connect ) return;

		const address = {
			app: { protocol:app.protocol, host:app.host, port:app.port, pid:app.pid, start:app.start },
			api: { protocol:api.protocol, host:api.host, port:api.port, pid:api.pid, start:api.start },
			res: { protocol:res.protocol, host:res.host, port:res.port, pid:res.pid, start:res.start },
		};

		COURIER.Trigger( 'project/load', { type, address, id:project.id, port:res.port, path:project.path, environments:project.environments } );
	}
	function onLoad({ id, type }) {
		if ( project.id!==id ) return;

		project[type].is_load = true;

		ProcessLoadQueue();
	}

	/* Funciones */
	function ProcessLoadQueue() {
		const { res, app, api } = project;

		if ( !res.is_error && res.start && !res.is_load ) return;
		if ( !app.is_error && app.start && !app.is_load ) return;
		if ( !api.is_error && api.start && !api.is_load ) return;

		app.is_alive =
		api.is_alive =
		res.is_alive = true;

		console.Cmd(
			'\ncv[fg[Servidores:]]' +
			MesageProc( app ) +
			MesageProc( api ) +
			MesageProc( res ) +

			'\n\ncv[fm[Modificaciones:]]'
		);

		PaintServers();
	}

	function PaintServers() {
		const { res, app, api } = PROJECTS[project.path];

		COURIER.Trigger(
			'project/command/start/end',
			{
				id : project.id,
				res: { protocol:res.protocol, host:res.host, port:res.port, is_error:res.is_error, start:res.start, is_alive:res.is_alive },
				app: { protocol:app.protocol, host:app.host, port:app.port, is_error:app.is_error, start:app.start, is_alive:app.is_alive },
				api: { protocol:api.protocol, host:api.host, port:api.port, is_error:api.is_error, start:api.start, is_alive:api.is_alive },
			}
		);
	}
	function StartProccess( name ) {
		const oproc = project[name];

		if ( !oproc.start ) {
			COURIER.Trigger( 'project/disabled', { id:project.id, type:name });
			return;
		}

		const pro   =
		oproc.proc  = fork( `${ __dirname }/${ name }.js`, [`-driver_port=${project.port}`, `-project_id=${project.id}`], { detached:false } );
		pro.name    = name;

		pro.on( 'exit', onExit.bind( this, oproc ) );
	}

	/* Inicio */
	async function Inicio() {
		const key = project.path;

		if ( PROJECTS[key] ) PaintServers();
		else {
			await COURIER.Events({
				'project/init/end'   : onInit   ,
				'project/load/end'   : onLoad   ,
				'project/connect/end': onConnect,
			});

			PROJECTS[key]  = project;
			project.key    = key;
			project.origin = { ...project };
			project.config = await LoadConfig( project.path, project.environments, true );
			project.res    = { ...project.config.res, crt:undefined, key:undefined, name:'res' };
			project.app    = { ...project.config.app, crt:undefined, key:undefined, name:'app' };
			project.api    = { ...project.config.api, crt:undefined, key:undefined, name:'api' };

			console.Cmd( '\ncv[fb[Procesos:]]' );

			// WatchOptions(       );
			StartProccess( 'app' );
			StartProccess( 'api' );
			StartProccess( 'res' );
		}
	};return await Inicio();
}
async function Stop( project ) {
	console.Cmd( '\nby[Stop]' );

	/* Funciones */
	async function TerminateProject( proj ) {
		if ( !proj ) return;

		delete PROJECTS[proj.key];

		proj.app.is_close = true;
		proj.api.is_close = true;
		proj.res.is_close = true;

		await KillProcess( proj.app.proc?.pid ).catch( ()=>{} );
		await KillProcess( proj.api.proc?.pid ).catch( ()=>{} );
		await KillProcess( proj.res.proc?.pid ).catch( ()=>{} );
	}

	/* Inicio */
	async function Inicio() {
		if ( project.execs.includes( '-all' ) ) {
			for ( const proj of Object.values( PROJECTS ) ) {
				await TerminateProject( proj );
			}
		}
		else await TerminateProject( PROJECTS[project.key||project.path] );

		COURIER.Trigger( 'project/command/stop/end', { id:project.id });

		setTimeout(
			()=>{ !Object.keys( PROJECTS ).length && process.exit( 0 ) },
			500
		);
	};return await Inicio();
}
async function Build( project ) {
	console.Cmd( '\nby[Build]' );

	/* Eventos */
	function onExit( proc ) {
		if ( proc.is_close ) return;

		proc.is_error = true;

		COURIER.Trigger( 'project/error', { id:project.id, type:proc.name } );
		ProcessBuildQueue();
	}

	function onInit({ id, type }) {
		if ( project.id!==id ) return;

		project[type].is_init   = true;
		const { res, app, api } = project;

		if ( !res.is_error && res.start && !res.is_init ) return;
		if ( !app.is_error && app.start && !app.is_init ) return;
		if ( !api.is_error && api.start && !api.is_init ) return;

		const address = {
			app: { protocol:app.protocol, host:app.host, port:app.port, pid:app.pid, start:app.start },
			api: { protocol:api.protocol, host:api.host, port:api.port, pid:api.pid, start:api.start },
			res: { protocol:res.protocol, host:res.host, port:res.port, pid:res.pid, start:res.start },
		};

		COURIER.Trigger( 'project/load', { type, address, id:project.id, port:res.port, path:project.path, environments:project.environments } );
	}
	function onLoad({ id, type }) {
		if ( project.id!==id ) return;

		const { res, app, api } = project;
		project[type].is_load   = true;

		if ( !res.is_error && res.start && !res.is_load ) return;
		if ( !app.is_error && app.start && !app.is_load ) return;
		if ( !api.is_error && api.start && !api.is_load ) return;

		COURIER.Trigger( 'project/build', { type, id:project.id, port:res.port, path:project.path, environments:project.environments } );
	}
	async function onBuild({ id, type }) {
		if ( project.id!==id ) return;

		project[type].is_build = true;

		ProcessBuildQueue();
	}

	/* Funciones */
	function ProcessBuildQueue() {
		const { res, app, api } = project;

		if ( !res.is_error && res.start && !res.is_build ) return;
		if ( !app.is_error && app.start && !app.is_build ) return;
		if ( !api.is_error && api.start && !api.is_build ) return;

		if ( res.is_error || api.is_error || app.is_error ) console.Cmd( '\nbr[Error al construir el proyecto]' );
		else                                                console.Cmd( '\nbg[Proyecto construido]' );

		COURIER.Trigger(
			'project/command/build/end',
			{
				id : project.id,
				res: { protocol:res.protocol, host:res.host, port:res.port, is_error:res.is_error, start:res.start, is_build:res.is_build },
				app: { protocol:app.protocol, host:app.host, port:app.port, is_error:app.is_error, start:app.start, is_build:app.is_build },
				api: { protocol:api.protocol, host:api.host, port:api.port, is_error:api.is_error, start:api.start, is_build:api.is_build },
			}
		);

		Stop( project );
	}

	function StartProccess( name ) {
		const oproc = project[name];

		if ( !oproc.start ) {
			COURIER.Trigger( 'project/disabled', { id:project.id, type:name });
			return;
		}

		const pro   =
		oproc.proc  = fork( `${ __dirname }/${ name }.js`, [`-driver_port=${project.port}`, `-project_id=${project.id}`], { detached:false } );
		pro.name    = name;

		pro.on( 'exit', onExit.bind( this, oproc ) );
	}

	/* Inicio */
	async function Inicio() {
		const key = project.path + '_build';

		COURIER.Events({
			'project/init/end' : onInit ,
			'project/load/end' : onLoad ,
			'project/build/end': onBuild,
		});

		PROJECTS[key]  = project;
		project.key    = key;
		project.origin = { ...project };
		project.config = await LoadConfig( project.path, project.environments, true );
		project.res    = { ...project.config.res, crt:undefined, key:undefined, name:'res' };
		project.app    = { ...project.config.app, crt:undefined, key:undefined, name:'app' };
		project.api    = { ...project.config.api, crt:undefined, key:undefined, name:'api' };

		console.Cmd( '\ncv[fb[Procesos:]]' );

		StartProccess( 'app' );
		StartProccess( 'api' );
		StartProccess( 'res' );
	};return await Inicio();
}
async function Reset( project ) {
	console.Cmd( '\nby[Reset]' );

	/* Funciones */
	async function ResetProject( proj ) {
		if ( !proj ) {
			COURIER.Trigger( 'project/error'            , { id:project.id, type:'api'    } );
			COURIER.Trigger( 'project/error'            , { id:project.id, type:'app'    } );
			COURIER.Trigger( 'project/error'            , { id:project.id, type:'res'    } );
			COURIER.Trigger( 'project/command/start/end', { id:project.id, is_error:true } );
			return;
		}

		delete PROJECTS[proj.key];

		proj.app.is_close = true;
		proj.api.is_close = true;
		proj.res.is_close = true;

		await KillProcess( proj.app.proc?.pid ).catch( ()=>{} );
		await KillProcess( proj.api.proc?.pid ).catch( ()=>{} );
		await KillProcess( proj.res.proc?.pid ).catch( ()=>{} );

		await Start( project );
	}

	/* Inicio */
	async function Inicio() {
		if ( project.execs.includes( '-all' ) ) {
			for ( const proj of Object.values( PROJECTS ) ) {
				await ResetProject( proj );
			}
		}
		else await ResetProject( PROJECTS[project.key||project.path] );
	};return await Inicio();
}
async function Ls( project ) {
	console.Cmd( '\nby[Ls]' );

	const data = [];

	for ( const p of Object.values( PROJECTS ) ) {
		data.push({
			path         : p.path,
			configs_paths: p.config.configs_paths,
			res          : { protocol:p.res?.protocol, host:p.res?.host, port:p.res?.port, pid:p.res?.pid, start:p.res?.start },
			api          : { protocol:p.api?.protocol, host:p.api?.host, port:p.api?.port, pid:p.api?.pid, start:p.api?.start },
			app          : { protocol:p.app?.protocol, host:p.app?.host, port:p.app?.port, pid:p.app?.pid, start:p.app?.start },
		});
	}

	COURIER.Trigger( 'project/command/ls/end', { data, id:project.id } );

	setTimeout(
		()=>{ !Object.keys( PROJECTS ).length && process.exit( 0 ) },
		500
	);
}
// ####################################################################################################


/* Metodos */
async function Inicio( driver_port, driver_host ) {
	const host    = driver_host || '0.0.0.0';
	const port    = driver_port || GetPortDriver();
	process.title = `meme.js DRIVER [${port}]`;

	ConfigureTitle( 'fb[\\[DRIVER\\]]' );

	COURIER = await ConnectServer({ host, port });

	console.Info( `Courier conectado, host: fy[${host}], port: fy[${port}]` );

	COURIER.Events( 'project/command/start', Start );
	COURIER.Events( 'project/command/stop' , Stop  );
	COURIER.Events( 'project/command/build', Build );
	COURIER.Events( 'project/command/reset', Reset );
	COURIER.Events( 'project/command/ls'   , Ls    );
};!process.argv.includes( '-no-demon' ) && !process.argv.includes( '-one-server' ) && Inicio();
// ####################################################################################################


/* Exportaciones */
module.exports = async function( project ) {
	/* Declaraciones */
	const one = {};

	/* Eventos */
	async function onUpgrade( request, socket ) {
		let url = request.url.split( '/' );

		switch ( url[1].toLowerCase() ) {
			case 'res': one.res?.onUpgrade( request, socket ); break;
			case 'api': one.api?.onUpgrade( request, socket ); break;
			default   : one.app?.onUpgrade( request, socket ); break;
		}
	}
	async function onConnect() {
		const por = this.address().port;

		await one.res?.Load?.();

		await one.api?.Load?.({
			address:{
				res:{ protocol:one.options.protocol, host:one.options.host, port:por },
				api:{ protocol:one.options.protocol, host:one.options.host, port:por },
				app:{ protocol:one.options.protocol, host:one.options.host, port:por },
			}
		});

		await one.app?.Load?.({
			address:{
				res:{ protocol:one.options.protocol, host:one.options.host, port:por },
				api:{ protocol:one.options.protocol, host:one.options.host, port:por },
				app:{ protocol:one.options.protocol, host:one.options.host, port:por },
			}
		});

		console.info();
		console.Cmd( 'cv[fg[Servidores:]]' );
		console.Info(
			`servidor fc["ONE"] fg[conectado] cd[(` +
				`p: ${ one.options.protocol }, ` +
				`u: ${ por }, ` +
				`w: ]fy[${ one.options.protocol }://${ one.options.host }:${ por }` +
			`]cd[)]`
		);
		console.Cmd( '\ncv[fm[Modificaciones:]]' );
	}

	/* Funciones */
	function ServerHTTP() {
		/* Eventos */
		function Send404( response ) {
			response.writeHead( 404, { 'Content-Type':'text/plain' } );
			response.end( http.STATUS_CODES[404] );
		}
		function onRequest( request, response ) {
			const url = request.url.split( '/' );
			const ser = url[1].toLowerCase();

			if ( url.length>2 ) {
				url.splice( 1, 1 );
			}

			request.url = url.join( '/' );

			switch ( ser ) {
				case 'res': if ( one.res ) one.res.onRequest( request, response ); else Send404( response ); break;
				case 'api': if ( one.api ) one.api.onRequest( request, response ); else Send404( response ); break;
				default   : if ( one.app ) one.app.onRequest( request, response ); else Send404( response ); break;
			}
		}

		/* Inicio */
		http
		.createServer( onRequest )
		.on( 'upgrade', onUpgrade )
		.listen( one.specific.port||0, onConnect );
	}
	function ServerHTTPS() {
		/* Eventos */
		function Send404( stream, headers ) {
			headers[':status'] = 404;

			stream.respond({ 'Content-Type':'text/plain' });
			stream.end    ( HttpCode( 404 ) );
		}
		function onRequest( _stream, _headers, ...par ) {
			let   url = _headers[':path']; url.includes( '?' ) && ( url = url.substring( 0, url.indexOf( '?' ) ) );
			const rex = /^\/\w+/.exec( url.toLowerCase() );

			switch ( rex?.[0] ) {
				case '/res': if ( one.res ) one.res.onRequest( _stream, _headers, ...par ); else Send404( _stream, _headers ); break;
				case '/api': if ( one.api ) one.api.onRequest( _stream, _headers, ...par ); else Send404( _stream, _headers ); break;
				default    : if ( one.app ) one.app.onRequest( _stream, _headers, ...par ); else Send404( _stream, _headers ); break;
			}
		}

		/* Inicio */
		http2
		.createSecureServer({
			cert      : one.specific.crt,
			key       : one.specific.key,
			allowHTTP1: true,
		})
		.on( 'stream' , onRequest )
		.on( 'upgrade', onUpgrade )
		.listen( one.specific.port||0, onConnect );
	}

	/* Metodos */
	async function OneServer() {
		project.is_one = true;
		one.options    = await LoadConfig( project.path, project.environments );
		one.specific   = Object.assign( one.options, one.options.one );

		ConfigureTitle( 'fc[\\[ONE\\]]' );
		console.Cmd( 'cv[fb[Procesos:]]' );
		ConfigureConfig( one.options );

		one.options.res.start && ( one.res = await require( './res.js' )( one.specific, project ) );
		one.options.api.start && ( one.api = await require( './api.js' )( one.specific, project ) );
		one.options.app.start && ( one.app = await require( './app.js' )( one.specific, project ) );

		if ( one.options.protocol==='http' ) return ServerHTTP();
		else                                 return ServerHTTPS();
	}
	async function NoDemon() {
		console.Cmd( 'cv[fy[ no-demon ]]' );

		await Inicio( project.port, project.host );
		await Start ( project                    );
	}

	/* Inicio */
	async function InicioRequire() {
		if ( project.execs.includes( '-one-server' ) ) OneServer();
		else                                           NoDemon();
	};return await InicioRequire();
};
// ####################################################################################################