#! /usr/bin/env node
// ####################################################################################################


//                    Copyright meme.js Authors
//     Distributed under the Boost Software License, Version 1.1.
// (See accompanying file LICENSE or copy at https://mjs.red/LICENSE)


/* Importaciones */
const http              = require( 'node:http'  );
const http2             = require( 'node:http2' );
const zlib              = require( 'node:zlib'  );
const { ConnectClient } = require( '../02_Libs/courier.js' );

const {
	Hash,
	Mime,
	Typeof,
	ParsePath,
} = require( '../02_Libs/lib' );

const {
	LoadConfig,
	GetIdProject,
	GetPortDriver,
} = require( '../02_Libs/config' );

const {
	MesageProc,
	ConfigureTitle,
	ConfigureConfig,
} = require( '../02_Libs/log' );
// ####################################################################################################


/* Declaraciones */
let   ID;
let   ETAG;
let   CONFIG;
let   DRIVER;
const FILES = {};
// ####################################################################################################


/* Funciones */
async function ConfigureCONFIG( project ) {
	if ( !CONFIG ) {
		CONFIG = await LoadConfig( project.path, project.environments );
		CONFIG = Object.assign( CONFIG, CONFIG.res );

		ConfigureConfig( CONFIG );
	}
}
// ####################################################################################################


/* Acciones */
async function Load( project ) {
	/* Funciones */
	function ClearFiles() {
		for ( const k in FILES ) {
			if ( !FILES[k].is_added ) {
				delete FILES[k];
			}
		}
	}

	function Watch() {
		if ( !CONFIG.watch ) return;

		let timer;

		for ( const source of CONFIG.sources ) {
			source.Watch({
				recursive: !CONFIG.read_only_one_level,
				call     : ( ofile ) => {
					const is_filter = !CONFIG.filter.length || CONFIG.filter.some( regex => ofile.path.match( regex ) );
					const is_ignore =                          CONFIG.ignore.some( regex => ofile.path.match( regex ) );

					if ( !is_filter || is_ignore ) return;

					clearTimeout( timer );
					timer = setTimeout( ()=>Inicio( false ), 100 );
				},
			});
		}
	}

	/* Inicio */
	async function Inicio( is_load ) {
		if ( project.id!==ID ) return;

		ETAG     = Hash();
		is_load??= !!project.is_load;

		await ConfigureCONFIG( project );
		ClearFiles();
		is_load && Watch();

		for ( const source of CONFIG.sources ) {
			source.Travel({
				filter   :  CONFIG.filter,
				ignore   :  CONFIG.ignore,
				recursive: !CONFIG.read_only_one_level,
				call     : ( ofile ) => {
					let url    = ofile.path.replace( source.path, '' );
					FILES[url] = ofile;

					is_load && console.Load( `fy[${ url.replace( /\]/g, '\\]' ) }] cd[${ ofile.path.replace( /\]/g, '\\]' ) }]` );
				},
			});
		}

		if ( is_load ) {
			await CONFIG.tasks.Exec({ moment:'load', config:CONFIG, files:FILES });
			DRIVER.Trigger( 'project/load/end', { id:project.id, type:'res' } );
		}
		else {
			await CONFIG.tasks.Exec({ moment:'watch', config:CONFIG, files:FILES });
			console.Loaded( 'Archivos recargados' );
		}
	};return await Inicio( true );
}
async function Server( project ) {
	/* Declaraciones */
	let resolve = 0;

	/* Eventos */
	async function onUpgrade( _, socket ) {
		console.Error( 'protocolo no soportado' );
		socket.end( `HTTP/1.1 401 ${ http.STATUS_CODES[400] }\r\nConnection: close\r\n`, 'ascii' );
	}
	async function onConnect() {
		const port      = this.address().port;
		CONFIG.port     =
		CONFIG.res.port = port;

		await CONFIG.tasks.Exec({ moment:'connect', config:CONFIG, files:FILES })
		DRIVER.Trigger( 'project/connect/end', { port, id:project.id, type:'res' } );
		resolve();
	}

	/* Funciones */
	function ReturnCode( file, accept_encoding ) {
		if      ( accept_encoding?.includes?.( 'br'      ) ) return [200, file.code_compile_br     , file.headers_br     ];
		else if ( accept_encoding?.includes?.( 'gzip'    ) ) return [200, file.code_compile_gzip   , file.headers_gzip   ];
		else if ( accept_encoding?.includes?.( 'deflate' ) ) return [200, file.code_compile_deflate, file.headers_deflate];
		else                                                 return [200, file.code_compile        , file.headers        ];
	}
	function LoadFiles( url, accept_encoding ) {
		if ( !FILES[url]         ) return [];
		if (  FILES[url].is_load ) return ReturnCode( FILES[url], accept_encoding );

		const fil        = FILES[url];
		fil.code_compile = fil.code_compile_br = fil.code_compile_gzip = fil.code_compile_deflate = fil.Read( false );
		fil.headers      = fil.headers_br      = fil.headers_gzip      = fil.headers_deflate      = { 'Content-Type':Mime( fil.ext ) };

		switch ( fil.ext ) {
			case '.js'  :
			case '.css' :
			case '.htm' : case '.html':
			case '.svg' :
			case '.json':
				fil.code_compile_br = zlib.brotliCompressSync( fil.code_compile );
				fil.headers_br      = { 'Content-Type':Mime( fil.ext ), 'content-encoding':'br' };

				fil.code_compile_gzip = zlib.gzipSync( fil.code_compile );
				fil.headers_gzip      = { 'Content-Type':Mime( fil.ext ), 'content-encoding':'gzip' };

				fil.code_compile_deflate = zlib.deflateSync( fil.code_compile );
				fil.headers_deflate      = { 'Content-Type':Mime( fil.ext ), 'content-encoding':'gzip' };
			break
		}

		fil.is_load = true;

		return ReturnCode( fil, accept_encoding );
	}
	function Response( method, url, accept_encoding, if_none_match ) {
		if ( if_none_match==ETAG ) return [304,'',{}];

		if ( CONFIG.read_only_one_level )
		url = '/' + url.split( '/' ).at( -1 );
		url = decodeURIComponent( url );

		console.Petition( method, url );

		let code, body = '', headers = {};

		try {
			switch ( method ) {
				case 'HEAD'   :
				case 'GET'    : [code, body, headers] = LoadFiles( url, accept_encoding ); break;
				case 'OPTIONS': code = 204; break;
			}
		}
		catch( e ) {
			code    = 500;
			body    = http.STATUS_CODES[500];
			headers = { 'Content-Type':'text/plain' };

			console.Error( e.message );
			console.trace(           );
		}

		if ( !code ) {
			code    = 404;
			body    = http.STATUS_CODES[404];
			headers = { 'Content-Type':'text/plain' };
		}

		if ( CONFIG.enabled_cors ?? true )
		headers['Access-Control-Allow-Origin'] = '*';
		headers['Etag'                       ] = ETAG;
		headers['Cache-Control'              ] = 'max-age=31536000, no-cache';
		headers['Vary'                       ] = 'ETag, Content-Encoding';

		console.Response( code, JSON.stringify( headers ) );

		return [code, body, headers];
	}

	/* Servicios */
	function ServerHTTP() {
		/* Eventos */
		async function onRequest( request, response ) {
			let url = request.url;

			if ( url.includes( '?' ) ) url = url.slice( 0, url.indexOf( '?' ) );

			const [code, body, headers] = Response( request.method, url, request.headers['accept-encoding'], request.headers['if-none-match'] );

			response.writeHead( code, headers );
			response.end( body );
		}

		/* Inicio */
		!project.is_one &&
		http
		.createServer( onRequest )
		.on( 'upgrade', onUpgrade )
		.listen( project.port || 0, onConnect );

		return project.is_one ? { onRequest, onUpgrade } : new Promise( ( run ) => { resolve=run } );
	}
	function ServerHTTPS() {
		/* Eventos */
		async function onRequest( _stream, _headers ) {
			let url = _headers[':path'];

			if ( url.includes( '?' ) ) url = url.slice( 0, url.indexOf( '?' ) );

			const [code, body, headers] = Response( _headers[':method'], url, _headers['accept-encoding'], _headers['if_none_match'] );
			headers[':status']          = code;

			_stream.respond( headers                       );
			_stream.end    ( code===204 ? undefined : body );
		}

		/* Inicio */
		!project.is_one &&
		http2
		.createSecureServer({
			cert      : CONFIG.crt,
			key       : CONFIG.key,
			allowHTTP1: true,
		})
		.on( 'stream' , onRequest )
		.on( 'upgrade', onUpgrade )
		.listen( project.port || 0, onConnect );

		return project.is_one ? { onRequest, onUpgrade } : new Promise( ( run ) => { resolve=run } );
	}

	/* Inicio */
	async function Inicio() {
		if ( project.id!==ID || project.type!=='res' ) return;

		await ConfigureCONFIG( project );

		if ( CONFIG.protocol==='http' ) return await ServerHTTP ();
		else                            return await ServerHTTPS();
	};return await Inicio();
}
async function Build( project ) {
	/* Inicio */
	async function Inicio() {
		if ( project.id!==ID ) return;

		if ( await CONFIG.tasks.Exec({ moment:'build', config:CONFIG, files:FILES }) ) {
			for ( const [url, ofile] of Object.entries( FILES ) ) {
				const fil = ParsePath( CONFIG.build.path + url );

				fil.Write( ofile.Read( false ) );
				console.Build( `fy[${ ofile.path }] => cd[${ fil.path }]` );
			}
		}

		DRIVER.Trigger( 'project/build/end', { id:ID, type:'res' } );
	};return await Inicio();
}
async function Add( project ) {
	/* Declaraciones */
	let   view_log  ;
	const array_log = [];

	/* Funciones */
	function AddFile( ofile ) {
		switch ( ofile.data.type.toLowerCase() ) {
			case 'base64': ofile.buffer = Buffer.from( ofile.data.buffer, 'base64' ); break;
			case 'buffer': ofile.buffer = Buffer.from( ofile.data.data             ); break;
		}

		const hash = Hash( ofile.buffer.toString( 'base64' ) );
		const url  = ofile.url || ( '/' + ofile.base );

		if ( FILES[url]?.data_hash===hash ) return;

		ofile.Read      = () => ofile.buffer;
		ofile.is_added  = true;
		ofile.data_hash = hash;
		FILES[url]      = ofile;

		if ( view_log ) console.Load( `fm[${ url.replace( /\]/g, '\\]' ) }] cd[${ ofile.path.replace( /\]/g, '\\]' ) }]` );
		else            array_log.push( ofile.base );
	}

	/* Inicio */
	function Inicio() {
		view_log = !!project.view_log;

		for ( const ofile of project.files ) {
			AddFile( ofile );
		}

		if ( array_log.length ) {
			console.Load( `se añadieron multiplas archivos: fm[${ array_log.join( '], fm[' ) }]` );
		}
	};return Inicio();
}
// ####################################################################################################


/* Inicio */
function Inicio() {
	/* Funciones */
	function RunForParams() {
		let par = {};

		for ( let i = 3; i<process.argv.length; i++ ) {
			const v = process.argv[i++];
			par[v]  = process.argv[i  ];
		}

		if ( !Object.keys( par ).length ) return false;

		par.address = {
			res:{ protocol:par['address-res-protocol'], host:par['address-res-host'], port:par['address-res-port'], start:par['address-res-start'] },
			api:{ protocol:par['address-api-protocol'], host:par['address-api-host'], port:par['address-api-port'], start:par['address-api-start'] },
			app:{ protocol:par['address-app-protocol'], host:par['address-app-host'], port:par['address-app-port'], start:par['address-app-start'] },
		};

		par.port         = parseInt( par.port ) || 0;
		par.environments = JSON.parse( par.environments );
		par              = Object.assign( par, ParsePath( par.path, 'meme.conf' ) );

		process.Send = data => {
			if ( data.command==='connect' )
				console.Cmd( MesageProc({ name:'res', protocol:data.protocol, host:data.host, port:data.port }) );
		};

		( par.command==='start' ? Start : Build )( par );

		return true;
	}
	// **************************************************

	/* Inicio */
	async function Inicio() {
		if ( process.argv.includes( '-one-server'     )                   ) return;
		if ( process.argv.includes( '-run-for-params' ) && RunForParams() ) return;

		ID            = GetIdProject ();
		const port    = GetPortDriver();
		process.title = `meme.js RES${ port ? ` [${port}]` : '' }`;
		global.driver =
		DRIVER        = await ConnectClient({ port, onEnd:()=>process.exit( 1 ) }).catch( e => console.Error( e ) );

		ConfigureTitle( 'fb[\\[RES\\]]'                           );
		DRIVER.Events ( 'project/connect' , Server                );
		DRIVER.Events ( 'project/load'    , Load                  );
		DRIVER.Events ( 'project/build'   , Build                 );
		DRIVER.Events ( 'project/res/add' , Add                   );
		DRIVER.Trigger( 'project/init/end', { id:ID, type:'res' } );
	};return Inicio();
};       Inicio();
// ####################################################################################################


/* Exportaciones */
module.exports = async function( config, project ) {
	ID     = project.id;
	CONFIG = Object.assign( {}, config, config.res );
	DRIVER = { Trigger:()=>{} };

	await  Load  ( project );
	return Server( project );
};
// ####################################################################################################