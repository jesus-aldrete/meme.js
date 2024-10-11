#! /usr/bin/env node
// ####################################################################################################


//                    Copyright meme.js Authors
//     Distributed under the Boost Software License, Version 1.1.
// (See accompanying file LICENSE or copy at https://mjs.red/LICENSE)


/* Importaciones */
const http                                            = require( 'node:http'              );
const http2                                           = require( 'node:http2'             );
const crypto                                          = require( 'node:crypto'            );
const { isUtf8                                      } = require( 'node:buffer'            );
const compilers                                       = require( '../02_Libs/transpilers' );
const { ConnectClient                               } = require( '../02_Libs/courier'     );
const { LoadConfig, GetPortDriver, GetIdProject     } = require( '../02_Libs/config'      );
const { MesageProc, ConfigureTitle, ConfigureConfig } = require( '../02_Libs/log'         );

const {
	Hash,
	Mime,
	Typeof,
	ParsePath,
	ParseParams,
	ParseHeaders,
	ParseCookies,
	StrToDatSocket,
	DecodeBase64Url,
} = require( '../02_Libs/lib' );
// ####################################################################################################


/* Declaraciones */
let   ID            ;
let   CONFIG        ;
let   DRIVER        ;
const URLS          = {};
const FILES         = {};
const COMPILERS     = compilers();
const CACHE_URL     = { tcp:{}, socket:{} };
const CACHE_GATEWAY = { tcp:[], socket:[] };
// ####################################################################################################


/* Funciones */
async function ReadConfig( project ) {
	if ( !CONFIG ) {
		CONFIG = await LoadConfig( project.path, project.environments );
		CONFIG = Object.assign   ( CONFIG, CONFIG.api                 );

		ConfigureConfig( CONFIG );
	}
}
// ####################################################################################################


/* Comandos */
async function Load( project ) {
	/* Declaraciones */
	let cache;

	/* Funciones */
	function RequireMeme( lib ) {
		const url = `meme:${lib}`;

		if ( !URLS[url] ) {
			console.Error( `no se encontro la libreria: "${url}"` );

			return null;
		}

		if ( !URLS[url].module_exports ) {
			console.Error( `la libreria: "${url}", no esta cargada` );

			return null;
		}

		return URLS[url].module_exports;
	}
	function Cache() {
		/* Declaracione */
		let cache  = {};
		let ocache = ParsePath( CONFIG.constants.work_space.path, 'api.meme.cache' );

		/* Search */
		async function SearchLibme( clase ) {
			if ( URLS[`meme:${clase}`] ) return URLS[`meme:${clase}`];

			let ofile;

			switch ( clase ) {
				case 'lib'      : ofile = ParsePath( __dirname, '..', '02_Libs', 'lib.js'       ); break;
				case 'log'      : ofile = ParsePath( __dirname, '..', '02_Libs', 'log.js'       ); break;
				case 'config'   : ofile = ParsePath( __dirname, '..', '02_Libs', 'config.js'    ); break;
				case 'courier'  : ofile = ParsePath( __dirname, '..', '02_Libs', 'courier.js'   ); break;
				case 'transpile': ofile = ParsePath( __dirname, '..', '02_Libs', 'transpile.js' ); break;
			}

			if ( !ofile ) return null;

			ofile.is_lib = true;

			return ofile;
		}
		async function SearchFiles( clase ) {
			for ( const ofile of Object.values( FILES ) ) {
				if ( ofile.class_name===clase ) {
					return cache[clase] = ParsePath( ofile.path );
				}
			}

			return null;
		}
		async function SearchLocal( clase ) {
			let fil;

			for ( const source of CONFIG.sources ) {
				source.Travel({
					filter: [/\.mj$/i],
					call  : ( ofile ) => {
						if ( ofile.name===clase ) {
							fil = ofile;
							return false;
						}

						const cla = /class\s*([\w\_\-]+)/gm.exec( ofile.Read() );

						if ( cla && cla[1]!=='extends' && clase===cla[1] ) {
							fil = ofile;
							return false;
						}
					},
				});

				if ( fil ) break;
			}

			if ( !fil ) return null;

			return cache[clase] = fil;
		}
		async function SearchRepos( clase ) {
			let fil;

			for ( const orepo of CONFIG.repositories ) {
				switch ( orepo.type ) {
					case 'folder': fil = orepo.Travel({ filter:[`/${clase}\\.mj/i`] })[0]; break;
					case 'url'   : debugger; break;

				}
			}

			if ( !fil ) return null;

			fil.is_repo  = true;
			cache[clase] = fil;

			Save();

			return fil;
		}

		/* Funciones */
		function Load() {
			try {
				if ( ocache.type==='file' ) cache = JSON.parse( cache_file.Read() );
				else                        cache = {};
			}
			catch { cache = {} }
		}
		function Save() {
			const cac = {};

			for ( const [clase, ofile] of Object.entries( cache ) ) {
				if ( ofile.type==='url' ) {
					cac[clase] = ofile;
				}
			}

			if ( Object.keys( cac ).length ) {
				try {
					ocache.Write( JSON.stringify( cac, null, '\t' ) );
				}
				catch ( e ) {
					console.Error( e );
				}

				ocache = ParsePath( ocache.path );
			}
		}
		function Delete() {
			for ( const [key,val] of Object.entries( cache ) ) {
				if ( val.is_repo ) continue;

				delete cache[key];
			}
		}

		async function Get( clase ) {
			let tem;

			if ( tem=cache[clase]               ) return tem;
			if ( tem=await SearchLibme( clase ) ) return tem;
			if ( tem=await SearchFiles( clase ) ) return tem;
			if ( tem=await SearchLocal( clase ) ) return tem;
			if ( tem=await SearchRepos( clase ) ) return tem;

			return null;
		}

		/* Inicio */
		function Inicio() {
			Load();

			return { Save, Delete, Get };
		};return Inicio();
	}

	async function RequireMemeAsync( lib ) {
		const oparse = await cache.Get( lib );
		const url    = `meme:${lib}`;

		if (  URLS[url]?.module_exports ) return URLS[url].module_exports;
		if (  oparse.type!=='file'      ) return null;
		if (  oparse.module_exports     ) return oparse.module_exports;
		if ( !URLS[url]                 ) URLS[url] = oparse;

		const node_modules    = new ( module.constructor )( oparse.path, module );
		node_modules.paths    = ( module.constructor )._nodeModulePaths( oparse.dir );
		node_modules.id       = oparse.path;
		node_modules.filename = oparse.path;

		if ( oparse.ext==='.mj' ) {
			oparse.struct = await COMPILERS.ParseMJ    ( oparse.Read(), oparse );
			oparse.code   = await COMPILERS.WriteModule( oparse.struct, oparse );
		}
		else oparse.code = oparse.Read();

		try {
			node_modules._compile( `module.return=eval( ${ JSON.stringify( oparse.code ) } )`, oparse.path );

			return oparse.module_exports = node_modules.exports;
		}
		catch ( e ) {
			console.Error( `error en "require_meme": ${e.message}` );
			console.Error( e.stack );
		}

		return null;
	}
	async function ExecScripts( code, params ) {
		code = code.replace( /require_meme/gm, 'await require_meme_async' );

		try {
			return await Object.getPrototypeOf( async function() {} )
			.constructor( 'require', 'require_meme', code )
			.call(
				{
					files     : FILES    ,
					config    : CONFIG   ,
					driver    : DRIVER   ,
					compilers : COMPILERS,
					id_project: ID       ,
					...params            ,
				},
				require,
				require_meme
			).catch( e => { throw e });
		}
		catch ( e ) {
			console.Error( e.stack );
		}
	}
	async function Compile( oparse, ya ) {
		/* Transpilacion */
		async function TranspileMH( oparse ) {
			oparse.struct = await COMPILERS.ParseMH( oparse.Read(), oparse );

			for await ( const imp of Object.keys( oparse.imports ) ) {
				const ofile =
				await cache.Get( imp       );
				await Compile  ( ofile, ya );
			}

			FILES[oparse.path] = oparse;
		}
		async function TranspileMJ( oparse ) {
			oparse.struct      = await COMPILERS.ParseMJ( oparse.Read(), oparse );
			FILES[oparse.path] = oparse;

			if ( oparse.struct.extends_class ) {
				const ofi =
				await cache.Get( oparse.struct.extends_class );
				await Compile  ( ofi, ya                     );
			}

			/*/ ***** Requires ***** /*/
			for ( const req of Object.keys( oparse.requires ) ) {
				const ofile          =
				oparse.requires[req] =
				await cache.Get( req       );
				await Compile  ( ofile, ya );
			}

			/*/ ***** Imports ***** /*/
			for ( const imp of Object.keys( oparse.imports ) ) {
				const ofile =
				await cache.Get( imp       );
				await Compile  ( ofile, ya );
			}

			if ( !oparse.struct.is_server_class ) return;

			const is_require = !!oparse.data.match( /module\s*\.\s*exports\s*\=\s*/ );
			oparse.is_require = is_require;

			/*/ ***** Load ***** /*/
			oparse.code = await COMPILERS.WriteModule( oparse.struct, oparse              );
			oparse.code = await COMPILERS.WriteMap   ( oparse.data  , oparse.code, oparse );

			if ( !oparse.module_exports ) {
				const node_modules    = new ( module.constructor )( oparse.path, module );
				node_modules.paths    = ( module.constructor )._nodeModulePaths( oparse.dir );
				node_modules.id       = oparse.path;
				node_modules.filename = oparse.path;

				try {
					node_modules._compile( `module.return=eval( ${ JSON.stringify( oparse.code ) } )`, oparse.path );

					oparse.module_exports = node_modules.exports;

					if (
						!is_require &&
						typeof oparse.module_exports==='function' &&
						oparse.module_exports.prototype &&
						Object.getOwnPropertyNames( oparse.module_exports.prototype ).includes( 'constructor' )
					) {
						oparse.module_instance = new oparse.module_exports;
					}
				}
				catch ( e ) {
					console.Error( `fy[${ oparse.url }] cd[${ oparse.path }]` );
					console.Error( e.stack                                    );
				}
			}

			/*/ ***** Urls ***** /*/
			oparse.url = oparse.struct.statics?.url?.value || oparse.struct.class_name || oparse.name;
			oparse.url = oparse.url.replace( /^([^a-z]+)/i, '' ).toLowerCase();

			if ( is_require ) {
				oparse.url = `meme:${oparse.url}`;
			}
			else if ( oparse.url[0]!=='/' ) {
				oparse.url = '/' + oparse.url;
			}

			URLS[oparse.url] = oparse;

			return oparse;
		}
		async function TranspileJS( oparse ) {
			oparse.code        = oparse.Read();
			oparse.requires    = {};
			oparse.imports     = [];
			oparse.is_lib      = true;
			oparse.url         = `meme:${oparse.name}`;
			URLS [oparse.url ] =
			FILES[oparse.path] = oparse;

			const is_require      = !!oparse.data.match( /module\s*\.\s*exports\s*\=\s*/ );
			const node_modules    = new ( module.constructor )( oparse.path, module );
			node_modules.paths    = ( module.constructor )._nodeModulePaths( oparse.dir );
			node_modules.id       = oparse.path;
			node_modules.filename = oparse.path;

			try {
				node_modules._compile( `module.return=eval( ${ JSON.stringify( oparse.code ) } )`, oparse.path );

				oparse.module_exports = node_modules.exports;

				if ( !is_require ) {
					oparse.module_instance = new oparse.module_exports;
				}
			}
			catch ( e ) {
				console.Error( `fy[${ oparse.url }] cd[${ oparse.path }]` );
				console.Error( e.stack                                    );
			}

			return oparse;
		}

		/* Inicio */
		async function Inicio() {
			if ( !oparse || ya[oparse.path] ) return ya[oparse?.path];

			ya[oparse.path] = oparse;

			switch ( oparse.ext ) {
				case '.mh': return await TranspileMH( oparse );
				case '.mj': return await TranspileMJ( oparse );
				case '.js': return await TranspileJS( oparse );
			}
		};return await Inicio();
	}
	async function Watch() {
		/* Funciones */
		function GetFiles() {
			const ofiles = [];

			for ( const source of CONFIG.sources ) {
				ofiles.push( ...source.Travel({ filter:[/\.m[jh]$/i] }) );
			}

			return ofiles.reduce( ( result, ofile ) => { result[ofile.path]=ofile; return result }, {} );
		}

		async function AddFiles( adds ) {
			if ( !adds.length ) return;

			const ya = {};

			for ( const ofile of adds ) {
				const ofi = await Compile( ofile, ya );

				if ( !ofi || !ofi.url || !ofi.struct?.is_server_class ) continue

				console.Add( `fy[${ ofi.url.replace( /\]/g, '\\]' ) }] cd[${ ofi.path.replace( /\]/g, '\\]' ) }]` );
			}
		}
		async function DeleteFiles( deletes ) {
			if ( !deletes.length ) return;

			for ( const ofile of deletes ) {
				delete URLS [ofile.url ];
				delete FILES[ofile.path];

				console.Delete( `fy[${ ofile.url.replace( /\]/g, '\\]' ) }] cd[${ ofile.path.replace( /\]/g, '\\]' ) }]` );
			}
		}
		async function ModifyFiles( modifys ) {
			if ( !modifys.length ) return;

			const ya = {};

			cache.Delete();

			const update_parent  = [];
			const ya_view_parent = {};
			const view_parent    = ( ofile ) => {
				if ( ya_view_parent[ofile.path]!=null ) return ya_view_parent[ofile.path];

				ya_view_parent[ofile.path] = true;

				let is_child = false;

				for ( const ofi of Object.values( FILES ) ) {
					for ( const req of Object.values( ofi.requires ) ) {
						if ( req.path!==ofile.path ) continue;

						is_child = true;

						if ( view_parent( ofi ) ) {
							update_parent.push( ofi );
						}

						break;
					}
				}

				return !is_child;
			};

			for ( const ofile of modifys ) {
				update_parent.length = 0;

				view_parent( ofile );

				if ( update_parent.length ) {
					console.Modified( `fm[${ ofile.url.replace( /\]/g, '\\]' ) }] cd[${ ofile.path.replace( /\]/g, '\\]' ) }]` );

					for ( const oparent of update_parent ) {
						const ofi = await Compile( oparent, ya );

						if ( !ofi || !ofi.url || !ofi.struct?.is_server_class ) continue;

						console.Modified( `fy[${ ofi.url.replace( /\]/g, '\\]' ) }] cd[${ ofi.path.replace( /\]/g, '\\]' ) }]` );
					}
				}
				else {
					const one = ParsePath( ofile.path );
					const ofi = await Compile( one, ya );

					if ( !ofi || !ofi.url || !ofile.struct?.is_server_class ) continue;

					console.Modified( `fy[${ ofi.url.replace( /\]/g, '\\]' ) }] cd[${ ofi.path.replace( /\]/g, '\\]' ) }]` );
				}
			}
		}

		async function ViewFiles() {
			const files  = GetFiles();
			const changs = { add:[], delete:[], modify:[] };

			for ( const ofile of Object.values( URLS  ) ) !ofile.is_null && !ofile.is_repo && !ofile.is_lib && !files[ofile.path] && changs.delete.push( ofile );
			for ( const ofile of Object.values( files ) ) {
				if ( !ofile.Read().match( /(\/\/\s*(back-private|back-public|back-tcp|back-socket|back-edge)(\n|\r))|(\bmodule\.exports\b\s*\=)/ ) ) continue;

				let ffile;

				for ( const F in URLS ) {
					if ( URLS[F].path===ofile.path ) {
						ffile = URLS[F];
						break;
					}
				}

				if      ( !ffile                   ) changs.add   .push( ofile );
				else if (  ffile.data!==ofile.data ) changs.modify.push( ffile );
			}

			if ( changs.add.length || changs.delete.length || changs.modify.length ) {
				await AddFiles   ( changs.add    );
				await DeleteFiles( changs.delete );
				await ModifyFiles( changs.modify );

				CACHE_URL    .tcp = {}, CACHE_URL    .socket = {};
				CACHE_GATEWAY.tcp = [], CACHE_GATEWAY.socket = [];

				for ( const ofile of Object.values( URLS ) ) {
					if ( ofile.module_instance?.onGatewayTcp?.is_function_tcp===true ) {
						CACHE_GATEWAY.tcp.push( ofile.module_instance.onGatewayTcp );
					}

					if ( ofile.module_instance?.onGatewaySocket?.is_function_socket===true ) {
						CACHE_GATEWAY.socket.push( ofile.module_instance.onGatewaySocket );
					}
				}

				await CONFIG.tasks.Exec({ moment:'watch', config:CONFIG, files:FILES, compilers:COMPILERS });
			}
		}

		/* Inicio */
		function Inicio() {
			if ( !CONFIG.watch ) return;

			let timer;

			for ( const source of CONFIG.sources ) {
				source.Watch({
					call:( ofile ) => {
						clearTimeout( timer );

						const is_filter = !CONFIG.filter.length || CONFIG.filter.some( regex => ofile.path.match( regex ) );
						const is_ignore =                          CONFIG.ignore.some( regex => ofile.path.match( regex ) );

						if ( !is_filter || is_ignore ) return;

						timer = setTimeout( ViewFiles, 50, ofile );
					}
				});
			}
		};return Inicio();
	}

	/* Inicio */
	async function Inicio() {
		if ( project.id!==ID ) return;

		await ReadConfig( project );

		cache                     = Cache();
		global.require_meme       = RequireMeme;
		global.require_meme_async = RequireMemeAsync;

		COMPILERS.Configure({ config:CONFIG, address:project.address, exec:ExecScripts });
		Watch();

		const ya          = {};
		const perf        = performance.now();
		project.view_log??= true;

		for ( const source of CONFIG.sources ) {
			for ( const ofile of source.Travel({ filter:[/\.m[jh]$/i], ignore:CONFIG.ignore }) ) {
				const ofi = await Compile( ofile, ya );

				if ( !ofi || !ofi.url ) continue;

				console.Load( `fy[${ ofi.url.replace( /\]/g, '\\]' ) }] cd[${ ofi.path.replace( /\]/g, '\\]' ) }]` )
			}
		}

		console.Info( `cd[Tiempo total de la carga:] fc[${ performance.now() - perf }]` );

		/* Reset cache */
		CACHE_URL    .tcp = {}, CACHE_URL    .socket = {};
		CACHE_GATEWAY.tcp = [], CACHE_GATEWAY.socket = [];

		for ( const ofile of Object.values( FILES ) ) {
			if ( ofile.module_instance?.onGatewayTcp?.is_function_tcp===true ) {
				CACHE_GATEWAY.tcp.push( ofile.module_instance.onGatewayTcp );
			}

			if ( ofile.module_instance?.onGatewaySocket?.is_function_socket===true ) {
				CACHE_GATEWAY.socket.push( ofile.module_instance.onGatewaySocket );
			}
		}

		await CONFIG.tasks.Exec({ moment:'load', config:CONFIG, driver:DRIVER, files:FILES, compilers:COMPILERS });
		DRIVER.Trigger( 'project/load/end', { id:project.id, type:'api' } );
	};return await Inicio();
}
async function Build( project ) {
	/* Funciones */
	function ParseCode( url, code ) {
		code??= '';

		if ( code.match( /module\.exports\s*\=\s*class/gm ) ) {
			code = code.replace( /module\.exports\s*\=\s*/gm, '' );
			code = code.replace( /require_meme\s*\(\s*\'/gm , "require('./" );

			return `module.exports = {\n\turl: "${url}",\n\tclase: ${code}\n};`;
		}

		return code;
	}
	function ParseApi( code ) {
		code = code.replace(
			/async\s+function\s+Compile\s*\(\s*oparse\,\s*ya\,\s*is_require\,\s*write_log\s*\=\s*true\s*\)\s*\{/m,
			(
				`async function CompileFiles() {\n` +
				`		const oapi = ParsePath( __dirname, '../01_Services' );\n` +
				'\n' +
				`		for ( const ofile of oapi.Travel({}) ) {\n` +
				`			const json = require( ofile.path );\n` +
				'\n' +
				`			if ( !json || !json.clase ) continue;\n` +
				'\n' +
				`			FILES[json.url] = {\n` +
				`				url            : json.url,\n` +
				`				module_instance: new json.clase,\n` +
				`			};\n` +
				'\n' +
				`			console.Load( \`fy[\${ json.url.replace( /\\]/g, '\\\\]' ) }] cd[\${ ofile.path.replace( /\\]/g, '\\\\]' ) }]\` );\n` +
				`		}\n` +
				`	}\n` +
				`	async function Compile( oparse, ya, is_require, write_log=true ) {`
			)
		);

		code = code.replace( /project\.view_log\s*\?\?\=\s*true\;\s*for\s*\(\s*const\s*source\s*of\s*CONFIG\.sources\s*\)\s*\{\s*for\s*\(\s*const\s*ofile\s*of\s*source\.Travel\(\s*\{\s*filter\:\[\/\\\.m\[jh\]\$\/i\]\,\s*ignore\:CONFIG\.ignore \}\) \) \{\s*await Compile\( ofile, ya \)\;\s*\}\s*\}/m, 'project.view_log??= true;\n\n\t\tawait CompileFiles();' );

		return code;
	}

	/* Write */
	function WriteFiles() {
		for ( const ofile of Object.values( FILES ) ) {
			const onew =
			ParsePath(
				CONFIG.build.path,
				'server',
				'01_Services',
				ofile.name.replace( /^([^a-z]+)/i, '' ) + '.js'
			);

			onew.Write( ParseCode( ofile.url, ofile.code ) );
			console.Build( `fy[${ ofile.path }] => cd[${ onew.path }]` );
		}
	}
	function WriteLibs() {
		for ( const ofile of ParsePath( __dirname, '../02_Libs' ).Travel({}) ) {
			const onew = ParsePath(
				CONFIG.build.path,
				'server',
				'02_Libs',
				ofile.base
			);

			onew.Write( ofile.Read( false ) );
			console.Build( `fy[${ ofile.path }] => cd[${ onew.path }]` );
		}
	}
	function WriteExecs() {
		let code =
		ParsePath( __dirname, 'api.js' ).Read();
		ParsePath( CONFIG.build.path, 'server', '03_Execs', 'api.js' ).Write( ParseApi( code ) );

		code =
		ParsePath( __dirname, 'driver.js' ).Read();
		ParsePath( CONFIG.build.path, 'server', '03_Execs', 'driver.js' ).Write( code );

		/* Defaults */
		code =
		ParsePath( __dirname, '../04_Defaults', 'meme.conf' ).Read();
		ParsePath( CONFIG.build.path, 'server', '04_Defaults', 'meme.conf' ).Write( code );
	}
	function WriteDefaults() {
		const code =
		ParsePath( CONFIG.constants.work_space.path, 'meme.conf' ).Read();
		ParsePath( CONFIG.build.path, 'server', 'meme.conf' ).Write( code );

		ParsePath( CONFIG.build.path, 'server', 'desactive.servers.meme.conf' ).Write(
			'module.exports = {\n' +
			'	res:{start:false},\n' +
			'	app:{start:false},\n' +
			'}'
		);
	}
	function WriteServer() {
		ParsePath( CONFIG.build.path, 'server', 'server.js' ).Write(
			`const { ParsePath } = require( './02_Libs/lib.js'     );\n` +
			`const driver        = require( './03_Execs/driver.js' );\n` +
			`\n` +
			`driver(\n` +
			`	{\n` +
			`		id          : 0,\n` +
			`		port        : ${project.port},\n` +
			`		path        : ParsePath( './meme.conf' ).path,\n` +
			`		execs       : ['start', '-no-demon'],\n` +
			`		commands    : [],\n` +
			`		environments: ['start'],\n` +
			`	}\n` +
			`);`
		);
	}

	/* Inicio */
	async function Inicio() {
		if ( project.id!==ID ) return;

		if ( await CONFIG.tasks.Exec({ moment:'build', config:CONFIG, files:FILES, comilers:COMPILERS }) ) {
			WriteFiles   ();
			WriteLibs    ();
			WriteExecs   ();
			WriteDefaults();
			WriteServer  ();
		}

		DRIVER.Trigger( 'project/build/end', { id:ID, type:'api' } );
	};return await Inicio();
}
async function Connect( project ) {
	/* Declaraciones */
	let   resolve  = 0;
	const contexts = {};

	/* Eventos */
	async function onConnect() {
		CONFIG.port     =
		CONFIG.api.port = this.address().port;

		await CONFIG.tasks.Exec({ moment:'connect', config:CONFIG, files:FILES })
		DRIVER.Trigger( 'project/connect/end', { port:CONFIG.port, id:project.id, type:'api' } );
		resolve();
	}

	/* Funciones */
	function Socket( request, socket ) {
		/* Declaraciones */
		const context = {};

		/* Declaraciones - Cola */
		const earrings = {};

		let   output_proc  = false;
		const output_queue = [];

		/* Declaraciones - Procesado */
		const stInfo               = 0, stPayload16=1, stPayload64=2, stMask=3, stData=4, stInflating=5, stDeferEvent=6;
		const fast_buffer          = Buffer[Symbol.species];
		const buffers              = [];
		let   in_loop              = false;
		let   state                = stInfo;
		let   opcode               = 0;
		let   payload_length       = 0;
		let   buffered_bytes       = 0;
		let   fin                  = false;
		let   fragmented           = 0;
		let   is_masked            = false;
		let   mask                 = undefined;
		let   message_length       = 0;
		let   total_payload_length = 0;
		let   fragments            = [];
		let   buffer_string        = 0;

		/* Funciones */
		function RejectSocket( code, message ) {
			console.Error( message );
			socket.end(
				`HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r\n` +
				'Connection: close\r\n' +
				( socket.extra_headers.length ? ( socket.extra_headers.join( '\r\n' ) + '\r\n' ) : '' ) +
				'\r\n',

				'ascii'
			);
		}
		function Trigger( event, ...params ) {
			return new Promise( ( run, err ) => {
				let id       = Hash();
				earrings[id] = { id, run, err };

				output_queue.push({ id, event, params, socket });
				ProcessOutputQueue();
			});
		}
		function TriggerAll( event, ...params ) {
			return new Promise( ( run, err ) => {
				let id       = Hash();
				earrings[id] = { id, run, err };

				for ( const ctx of Object.values( contexts ) ) {
					output_queue.push({ id, event, params, socket:ctx.socket });
				}

				ProcessOutputQueue();
			});
		}
		function TriggerOthers( event, ...params ) {
			return new Promise( ( run, err ) => {
				let id       = Hash();
				earrings[id] = { id, run, err };

				for ( const ctx of Object.values( contexts ) ) {
					if ( ctx.id===context.id ) continue;

					output_queue.push({ id, event, params, socket:ctx.socket });
				}

				ProcessOutputQueue();
			});
		}

		function ExtractBytes( num ) {
			const dst      = Buffer.allocUnsafe( num );
			buffered_bytes-= num;

			if ( num===buffers[0].length ) return buffers.shift();

			if ( num<buffers[0].length ) {
				const buf = buffers[0];

				buffers[0] = new fast_buffer(
					buf.buffer          ,
					buf.byteOffset + num,
					buf.length     - num
				);

				return new fast_buffer( buf.buffer, buf.byteOffset, num );
			}

			do {
				const buf    = buffers[0];
				const offset = dst.length - num;

				if ( num>=buf.length ) dst.set( buffers.shift(), offset );
				else {
					dst.set( new Uint8Array( buf.buffer, buf.byteOffset, num ), offset );

					buffers[0] = new fast_buffer(
						buf.buffer          ,
						buf.byteOffset + num,
						buf.length     - num
					);
				}

				num-= buf.length;
			}
			while ( num>0 );

			return dst;
		}
		function MergeBuffers( list, totalLength ) {
			if ( list.length===0 ) return Buffer.alloc( 0 );
			if ( list.length===1 ) return list[0];

			const target = Buffer.allocUnsafe( totalLength );
			let   offset = 0;

			for ( let i=0; i<list.length; i++ ) {
				const buf = list[i];

				target.set( buf, offset );

				offset+= buf.length;
			}

			if ( offset<totalLength ) {
				return new fast_buffer( target.buffer, target.byteOffset, offset );
			}

			return target;
		}
		function ControlMessage( data ) {
			if ( opcode===0x08 ) {
				if ( data.length===0 ) {
					in_loop = false;

					onEnd();
				}
				else {
					const code = data.readUInt16BE( 0 );

					if ( !IsValidStatusCode( code ) ) throw new RangeError( `invalid status code ${code}` );

					const buf = new fast_buffer(
						data.buffer        ,
						data.byteOffset + 2,
						data.length     - 2
					);

					if ( !IsValidUTF8( buf ) ) throw new Error( 'invalid UTF-8 sequence' );

					in_loop = false;

					onEnd();
				}

				state = stInfo;

				return;
			}

			opcode===0x09 ? onPing( data ) : onPong( data );

			state = stInfo;
		}
		function HaveLength() {
			let max_payload = 104857600;

			if ( payload_length && opcode<0x08 ) {
				total_payload_length+= payload_length;

				if ( total_payload_length>max_payload && max_payload>0 ) throw new RangeError( 'Max payload size exceeded' );
			}

			state = is_masked ? stMask : stData;
		}

		function ProcessOutputQueue() {
			if ( !output_queue.length || output_proc ) return;

			output_proc = true;

			let   output  = output_queue.shift();
			const osocket = output.socket;

			delete output.socket;

			try {
				output = JSON.stringify( output );
			}
			catch ( error ) {
				console.Error( `Error en el parseo de la respuesta: ${error}` );
				console.trace();

				output = null;
			}

			if ( output ) {
				const chunk_size    = 64 * 1024;
				const total_chunks  = Math.ceil( output.length / chunk_size );
				let   current_chunk = 0;

				osocket.write( StrToDatSocket( 'START' ) );

				while ( current_chunk<total_chunks ) {
					const start = current_chunk * chunk_size;
					const end   = Math.min( start + chunk_size, output.length );
					const chunk = output.slice( start, end );

					osocket.write( StrToDatSocket( chunk ) );

					current_chunk++;
				}

				osocket.write( StrToDatSocket( 'END' ) );
			}

			output_proc = false;

			output_queue.length>0 && ProcessOutputQueue();
		}

		/* Socket - Is */
		function IsValidPUTF8( buf ) {
			let   ind = 0;
			const len = buf.length;

			while ( ind<len ) {
				if ( (buf[ind] & 0x80)===0 ) {
					ind++;
				}
				else if ( (buf[ind] & 0xe0)===0xc0 ) {
					if (
						(ind + 1)            ===len  ||
						(buf[ind + 1] & 0xc0)!==0x80 ||
						(buf[ind    ] & 0xfe)===0xc0
					) {
						return false;
					}

					ind+= 2;
				}
				else if ( (buf[ind] & 0xf0)===0xe0 ) {
					if (
						(ind + 2)            >= len  ||
						(buf[ind + 1] & 0xc0)!==0x80 ||
						(buf[ind + 2] & 0xc0)!==0x80 ||
						(buf[ind    ]        ===0xe0 && (buf[ind + 1] & 0xe0)===0x80) ||
						(buf[ind    ]        ===0xed && (buf[ind + 1] & 0xe0)===0xa0)
					) {
						return false;
					}

					ind+= 3;
				}
				else if ( (buf[ind] & 0xf8)===0xf0 ) {
					if (
						(ind + 3)            >= len  ||
						(buf[ind + 1] & 0xc0)!==0x80 ||
						(buf[ind + 2] & 0xc0)!==0x80 ||
						(buf[ind + 3] & 0xc0)!==0x80 ||
						(buf[ind    ]        ===0xf0 && (buf[ind + 1] & 0xf0)===0x80) ||
						(buf[ind    ]        ===0xf4 &&  buf[ind + 1] > 0x8f) ||
						buf[ind    ]        >  0xf4
					) {
						return false;
					}

					ind+= 4;
				}
				else return false;
			}

			return true;
		}
		function IsValidUTF8( buf ) {
			return buf.length<24 ? IsValidPUTF8( buf ) : isUtf8( buf );
		}
		function IsValidStatusCode( code ) {
			return (
				(
					code>= 1000 &&
					code<= 1014 &&
					code!==1004 &&
					code!==1005 &&
					code!==1006
				)
				||
				(
					code>=3000 &&
					code<=4999
				)
			);
		}

		/* Socket - Get */
		function GetInfo() {
			if ( buffered_bytes<2 ) { in_loop = false; return }

			const buf = ExtractBytes( 2 );

			if ( (buf[0] & 0x30)!==0x00 ) throw new RangeError( 'RSV2 and RSV3 must be clear' );

			const compressed = (buf[0] & 0x40)===0x40;
			fin              = (buf[0] & 0x80)===0x80;
			opcode           =  buf[0] & 0x0f        ;
			payload_length   =  buf[1] & 0x7f        ;

			if ( opcode===0x00 ) {
				if (  compressed ) throw new RangeError( 'RSV1 must be clear' );
				if ( !fragmented ) throw new RangeError( 'invalid opcode 0'   );

				opcode = fragmented;
			}
			else if ( opcode===0x01 || opcode===0x02 ) {
				if ( fragmented ) throw new RangeError( `invalid opcode ${opcode}` );

				is_compress = compressed;
			}
			else if ( opcode>0x07 && opcode<0x0b ) {
				if ( !fin                                                          ) throw new RangeError( 'FIN must be set'                          );
				if (  compressed                                                   ) throw new RangeError( 'RSV1 must be clear'                       );
				if (  payload_length>0x7d || (opcode===0x08 && payload_length===1) ) throw new RangeError( `invalid payload length ${payload_length}` );
			}
			else throw new RangeError( `invalid opcode ${opcode}` );

			if ( !fin && !fragmented ) fragmented = opcode;

			is_masked = (buf[1] & 0x80)===0x80;

			if      ( !is_masked            ) throw new RangeError( 'MASK must be set' );
			if      (  payload_length===126 ) state = stPayload16;
			else if (  payload_length===127 ) state = stPayload64;
			else                              HaveLength();
		}
		function GetMask() {
			if ( buffered_bytes<4 ) { in_loop = false; return }

			mask  = ExtractBytes( 4 );
			state = stData;
		}
		function GetData() {
			let data = Buffer.alloc( 0 );

			if ( payload_length ) {
				if ( buffered_bytes<payload_length ) { in_loop = false; return }

				data = ExtractBytes( payload_length );

				if ( is_masked && (mask[0] | mask[1] | mask[2] | mask[3])!==0 ) {
					for ( let i=0; i<data.length; i++ ) {
						data[i]^= mask[i & 3];
					}
				}
			}

			if ( opcode>0x07 ) { ControlMessage( data ); return }

			if ( data.length ) {
				message_length = total_payload_length;

				fragments.push( data );
			}

			if ( !fin ) { state = stInfo; return }

			let buf = MergeBuffers( fragments, message_length );

			total_payload_length =
			message_length       =
			fragmented           = 0;
			fragments            = [];

			if ( opcode!=2 && !IsValidUTF8( buf ) ) throw new Error( 'invalid UTF-8 sequence' );

			buf = buf.toString();

			switch ( buf ) {
				case 'START': buffer_string = ''; break;
				case 'END'  :
					try {
						onMessage( JSON.parse( buffer_string ) );
					}
					catch( error ) {
						console.Error( `Error de parseo de evento: ${error}` );
						console.trace();
					}
				break;

				default: buffer_string+= buf;
			}

			state = stInfo;
		}
		function GetPayloadLength16() {
			if ( buffered_bytes<2 ) { in_loop = false; return }

			payload_length = ExtractBytes( 2 ).readUInt16BE( 0 );

			HaveLength();
		}
		function GetPayloadLength64() {
			if ( buffered_bytes<8 ) { in_loop = false; return }

			const buf = ExtractBytes( 8 );
			const num = buf.readUInt32BE( 0 );

			if ( num>Math.pow( 2, 53 - 32 ) - 1 ) throw new RangeError( 'Unsupported WebSocket frame: payload length > 2^53 - 1' );

			payload_length = num * Math.pow( 2, 32 ) + buf.readUInt32BE( 4 );

			HaveLength();
		}

		/* Execs */
		function ExecResult( id, result ) {
			const ear = earrings[id];

			delete earrings[id];

			if ( ear ) {
				ear.run( result[0] );
			}
		}
		function ExecFunction( id, event, params ) {
			const response = async ( func, mod ) => {
				context.file  = mod;
				context.event = event;
				const res     = await func.apply( context, params );

				output_queue.push({ id, socket, ok:true, code:200, result:[res] });
				ProcessOutputQueue();
			};

			if ( CACHE_URL.socket[event] ) return response( CACHE_URL.socket[event] );

			const pat = event.split( '/' );
			const url = pat.slice( 0, -1 ).join( '/' );
			const mod = URLS['/'+url];
			const nfu = pat.slice( -1 )[0];

			if ( mod ) {
				const fun = mod.module_instance?.[nfu];

				if ( fun && fun.is_function_socket ) return response( fun, mod );
			}

			output_queue.push({ id, socket, ok:false, code:404, error:http.STATUS_CODES[404] });
			ProcessOutputQueue();
		}

		/* Eventos */
		function onData( chunk ) {
			if ( opcode===0x08 && state==stInfo ) return onEnd();

			in_loop        = true;
			buffered_bytes+= chunk.length;

			buffers.push( chunk );

			do {
				switch ( state ) {
					case stInfo     : GetInfo           (); break;
					case stMask     : GetMask           (); break;
					case stData     : GetData           (); break;
					case stPayload16: GetPayloadLength16(); break;
					case stPayload64: GetPayloadLength64(); break;

					case stInflating :
					case stDeferEvent: in_loop = false; return;
				}
			}
			while ( in_loop );
		}
		function onPing() {
			debugger
		}
		function onPong() {
			debugger
		}
		function onEnd() {
			buffered_bytes       = 0;
			buffers.length       = 0;
			fin                  = false;
			fragmented           = 0;
			fragments            = [];
			in_loop              = false;
			is_compress          = false;
			is_masked            = false;
			mask                 = undefined;
			message_length       = 0;
			opcode               = 0;
			payload_length       = 0;
			state                = stInfo;
			total_payload_length = 0;

			context.socket.destroy();

			delete contexts[context.id];
		}

		async function onMessage( json ) {
			const { id, event, params, result } = json;

			if ( result ) ExecResult  ( id, result        );
			else          ExecFunction( id, event, params );
		}

		/* Inicio */
		async function Inicio() {
			const key             =  request.headers['sec-websocket-key'];
			const version         = +request.headers['sec-websocket-version'];
			const protocol        =  request.headers['sec-websocket-protocol'];
			const token           = protocol.split( ',' )[0];
			socket.extra_headers??= [];

			if (  request.method                       !=='GET'       ) return RejectSocket( 405, 'Invalid HTTP method'                             );
			if (  request.headers.upgrade.toLowerCase()!=='websocket' ) return RejectSocket( 400, 'Invalid Upgrade header'                          );
			if ( !key || !/^[+/0-9A-Za-z]{22}==$/.test( key )         ) return RejectSocket( 400, 'Missing or invalid Sec-WebSocket-Key header'     );
			if (  version!==8 && version!==13                         ) return RejectSocket( 400, 'Missing or invalid Sec-WebSocket-Version header' );

			let json = DecodeBase64Url( token );

			try {
				json = JSON.parse( json );
			}
			catch( e ) {
				json = {};

				console.Error( `Error en el parseo del token: ${e.message}` );
				console.trace();
			}

			context.id            = Hash();
			context.token         = json.token;
			context.config        = CONFIG;
			context.socket        = socket;
			context.cookie        = ParseCookies( request.headers );
			context.contexts      = contexts;
			context.Trigger       = Trigger;
			context.TriggerAll    = TriggerAll;
			context.TriggerOthers = TriggerOthers;
			context.id_session    = json.id_session;
			contexts[context.id]  = context;
			socket.extra_headers  = [];

			socket.setNoDelay( true           );
			socket.setTimeout( 0              );
			socket.on        ( 'data', onData );
			socket.on        ( 'end' , onEnd  );

			/*Autenticar socket*/
			for ( const gateway of CACHE_GATEWAY.socket ) {
				if ( !await gateway.call( context, context ) ) {
					return RejectSocket( 401, 'No se autorizó la conexión vía websocket.' );
				}
			}

			// Conectar Socket
			if ( !socket.readable || !socket.writable ) return socket.destroy();

			const digest  = crypto.createHash( 'sha1' ).update( key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11' ).digest( 'base64' );
			const headers = [
				'HTTP/1.1 101 Switching Protocols',
				'Upgrade: websocket',
				'Connection: Upgrade',
				`Sec-WebSocket-Accept: ${digest}`,
				`Sec-WebSocket-Protocol: ${token}`,
				...socket.extra_headers,
			];

			socket.write( headers.concat( '\r\n' ).join( '\r\n' ) );
		};return Inicio();
	}

	/* Funciones - Servidores */
	function ParseResult( result ) {
		switch ( Typeof( result ) ) {
			case 'null'      :
			case 'undefined' : return { code:501, type:'string' , body:http.STATUS_CODES[501]                                 };
			case 'string'    : return { code:200, type:'string' , body:result                                                 };
			case 'number'    : return { code:200, type:'string' , body:result.toString()                                      };
			case 'boolean'   : return { code:200, type:'boolean', body:result.toString()                                      };
			case 'array'     : return { code:200, type:'json'   , body:JSON.stringify( result )                               };
			case 'uint8array': return { code:200, type:'buffer' , body:result, headers:{ 'Content-Length':result.byteLength } };

			default:
				if ( result.is_result_function ) {
					delete result.is_result_function;

					if ( Typeof( result.value )==='object' )
					for ( const [key,val] of Object.entries( result.value ) ) {
						switch ( key ) {
							case '_code'   :
							case '_type'   :
							case '_body'   :
							case '_stream' :
							case '_cookies':
							case '_headers': result[key] = val; delete result.value[key]; break;
						}
					}
				}

				result = {
					code   : result._code,
					type   : result._type,
					body   : result._stream ?? result._body ?? result,
					cookies: result._cookies,
					headers: result._headers ?? {},
				};

				if ( Typeof( result.body )==='object' ) {
					for ( const k in result.body ) {
						switch ( k ) {
							case '_code'   :
							case '_type'   :
							case '_body'   :
							case '_stream' :
							case '_cookies':
							case '_headers': delete result.body[k]; break;
						}
					}
				}

				if ( result.code!==200 && Typeof( result.body )==='object' && !Object.keys( result.body ).length )
					result.body = http.STATUS_CODES[result.code];

				switch ( Typeof( result.body ) ) {
					case 'null'      :
					case 'undefined' : result.code??=501; result.type??='string'; result.body=http.STATUS_CODES[501]; break;
					case 'number'    : result.code??=200; result.type??='string'; result.body=result.body.toString(); break;
					case 'boolean'   : result.code??=200; result.type??='string'; result.body=result.body.toString(); break;
					case 'array'     :
					case 'object'    : result.code??=200; result.type??='json'  ; result.body=JSON.stringify( result.body ); break;
					case 'uint8array': result.code??=200; result.type??='buffer'; result.headers={ 'Content-Length':result.body.byteLength }; break;
				}

			return result;
		}
	}
	function ParseHTTP( request, response ) { return new Promise( ( run, err ) => {
		let   ind;
		let   url     = decodeURIComponent( request.url );
		const headers = ParseHeaders( request.rawHeaders );
		const cookies = ParseCookies( headers );
		const result  = {
			headers  ,
			cookies  ,
			host     : request.headers.host,
			method   : request.method.toUpperCase(),
			raw_url  : url,
			params   : ParseParams( url ),
			protocol : 'http',
			files    : FILES,
			config   : CONFIG,
			compilers: COMPILERS,
		};

		if ( ( ind=url.indexOf( '?' ) )>-1 ) url = url.slice( 0, ind );

		result.url        = url;
		result.url_method = ( url + result.method ).toLowerCase();
		url               = url.split( '/' ).splice( 1 );

		if ( url.length===1 && url[0]==='' ) url = [];

		result.path     = url;
		result.petition = { request, response };
		result.stream   = request;

		const get_buffer = () => new Promise( ( run, err )=>{
			const body = [];

			request
			.on( 'error', err                           )
			.on( 'data' , data => { body.push( data ) } )
			.on( 'end'  , () => {
				const array = Buffer.concat( body );

				run( array );
			});
		});

		result.GetBodyBuffer = get_buffer;
		result.GetBodyText   = async () => ( await get_buffer() ).toString( 'utf8' );
		result.GetBodyJson   = async () => {
			let jso = ( await get_buffer() ).toString( 'utf8' );

			try { return JSON.parse( jso ) }
			catch ( e ) {
				console.Error( e.message );
				console.trace();

				return {};
			}
		};

		run( result );
	})}

	function ResponseCookies( cookies ) {
		let res = [];

		if ( !Array.isArray( cookies ) ) {
			cookies = [cookies];
		}

		for ( const cookie of cookies ) {
			let htt='', max='', nam='', dom='', pat='', exp='', sec='', sam='';

			for ( const [key,vat] of Object.entries( cookie ) ) {
				switch ( key ) {
					case 'maxAge'  : max = `; Max-Age=${vat}`              ; break;
					case 'domain'  : dom = `; Domain=${vat}`               ; break;
					case 'path'    : pat = `; Path=${vat}`                 ; break;
					case 'expires' : exp = `; Expires=${vat.toUTCString()}`; break;
					case 'httpOnly': htt = '; HttpOnly'                    ; break;
					case 'secure'  : sec = '; Secure'                      ; break;
					case 'sameSite': sam = `; SameSite=${vat}`             ; break;
					default        : nam = `${key}=${vat}`;
				}
			}

			res.push( nam + max + dom + pat + exp + htt + sec + sam );
		}

		return res;
	}

	async function ModuleResponseFunction( context ) {
		let   ofile         ;
		const function_name = context.path[context.path.length - 1];
		const url           =  '/' + context.path.slice( 1, -1 ).join( '/' );

		if ( ( ofile=URLS[url] ) && ofile.module_instance?.[function_name]?.is_function_tcp ) {
			CACHE_URL.tcp[context.url_method] = async ( c ) => {
				c.file = ofile;

				return {
					is_result_function: true,
					value             : await ofile.module_instance[function_name].apply( c, await c.GetBodyJson() ),
				};
			};

			return await CACHE_URL.tcp[context.url_method].call( context, context );
		}

		CACHE_URL.tcp[context.url_method]=()=>({ _code:404 });

		return CACHE_URL.tcp[context.url_method]();
	}
	async function ModuleResponse( context ) {
		for ( const gateway of CACHE_GATEWAY.tcp )
			if ( !await gateway.call( context, context ) ) return { _code:401 };

		if ( CACHE_URL.tcp[context.url_method] )
			return await CACHE_URL.tcp[context.url_method].call( context, context );

		if ( context.path[0]==='function' )
			return await ModuleResponseFunction( context );

		let pat = '';
		for ( const [index, path_folder] of context.path.entries() ) {
			pat       = pat + '/' + path_folder;
			const fil = URLS[pat];

			if ( fil ) {
				let   fun;
				const nam = context.method;
				const nap = context.path[index + 1];

				if      ( fil.module_instance[nap]   ?.is_function_tcp ) fun = fil.module_instance[nap]   ;
				else if ( fil.module_instance[nam]   ?.is_function_tcp ) fun = fil.module_instance[nam]   ;
				else if ( fil.module_instance.Request?.is_function_tcp ) fun = fil.module_instance.Request;

				if ( typeof fun==='function' ) {
					return await ( CACHE_URL.tcp[context.url_method]=fun ).call( context, context );
				}

				break;
			}
		}

		return ( CACHE_URL.tcp[context.url_method]=()=>({ _code:404 }) )();
	}

	/* Servicios */
	function ServerHTTP() {
		/* Funciones */
		function Response( context, result ) {
			let hea = Object.assign(
				{ 'Content-Type': Mime( result.type ) },
				( result.cookies ? { 'Set-Cookie':ResponseCookies( result.cookies ) } : null ),
				( CONFIG.enabled_cors ? {
					'Access-Control-Allow-Origin'     : ( context.headers.origin ?? '*' ),
					'Access-Control-Allow-Methods'    : 'GET, POST, PUT, DELETE, OPTIONS',
					'Access-Control-Allow-Headers'    : 'Content-Type, Authorization, id-session, X-Requested-With, Accept, Origin',
					'Access-Control-Allow-Credentials': 'true'
				} : null ),
				result.headers,
			);

			console.Response                   ( result.code, hea                            );
			context.petition.response.writeHead( result.code, hea                            );
			context.petition.response.end      ( result.code===204 ? undefined : result.body );
		}

		/* Eventos */
		function onRequest( request, response ) {
			ParseHTTP( request, response )
			.then( ctx => {
				console.Petition( ctx.method, ctx.url );

				if ( ctx.method==='OPTIONS' && CONFIG.enabled_cors ) Response( ctx, { code:204, body:'' } );
				else {
					ctx.Send = reu => Response( ctx, ParseResult( reu ) );

					ModuleResponse( ctx )
					.then( res => {
						if      ( res===undefined           ) ctx.Send({ _code:501 });
						else if ( Typeof( res )==='promise' ) res.then( ctx.Send ).catch( e => { throw e } );
						else                                  ctx.Send( res );
					})
					.catch( e => { throw e } );
				}
			} )
			.catch( e => {
				console .Error    ( e.stack                               );
				console .Response ( 500, { 'Content-Type': 'text/plain' } );
				response.writeHead( 500, { 'Content-Type': 'text/plain' } );
				response.end      ( 'Error interno en el servidor'        );
			});
		}

		/* Inicio */
		!project.is_one &&
		http
		.createServer( onRequest                    )
		.on          ( 'upgrade', Socket            )
		.listen      ( project.port || 0, onConnect );

		return project.is_one ? { onRequest, onUpgrade } : new Promise( ( run ) => { resolve=run } );
	}
	function ServerHTTPS() {
		/* Funciones */
		function Parse( stream, headers, headers_number, array_headers ) { return new Promise( ( run, err ) => {
			let   ind;
			const hea    = ParseHeaders( array_headers );
			const coo    = ParseCookies( hea           );
			let   url    = decodeURIComponent( hea.path );
			const result = {
				headers  : hea,
				cookies  : coo,
				host     : hea.origin || hea.authority || '*',
				method   : hea.method.toUpperCase(),
				raw_url  : url,
				params   : ParseParams( hea.path ),
				protocol : 'http2',
				files    : FILES,
				config   : CONFIG,
				compilers: COMPILERS,
			};

			if ( ( ind=url.indexOf( '?' ) )>-1 ) url = url.slice( 0, ind );

			result.url        = url;
			result.url_method = ( url + result.method ).toLowerCase();
			url               = url.split( '/' ).splice( 1 );

			if ( url.length===1 && url[0]==='' ) url = [];

			result.path   = url;
			result.stream = stream;

			/*BODY*/
			const get_buffer = () => new Promise( ( run, err )=>{
				const body = [];

				stream
				.on( 'error', err                           )
				.on( 'data' , data => { body.push( data ) } )
				.on( 'end'  , () => {
					const array = Buffer.concat( body );

					run( array );
				});
			});

			result.GetBodyBuffer = get_buffer;
			result.GetBodyText   = async () => ( await get_buffer() ).toString( 'utf8' );
			result.GetBodyJson   = async () => {
				let jso = ( await get_buffer() ).toString( 'utf8' );

				try { return JSON.parse( jso ) }
				catch ( e ) {
					console.Error( e.message );
					console.trace();

					return {};
				}
			};

			run( result );
		})}
		function Response( context, result ) {
			const hea = Object.assign(
				{ ':status'     : result.code         },
				{ 'Content-Type': Mime( result.type ) },
				( result.cookies      ? { 'Set-Cookie':ResponseCookies( result.cookies ) } : null ),
				( CONFIG.enabled_cors ? {
					'Access-Control-Allow-Origin'     : ( context.headers.origin ?? '*' ),
					'Access-Control-Allow-Methods'    : 'GET, POST, PUT, DELETE, OPTIONS',
					'Access-Control-Allow-Headers'    : 'Content-Type, Authorization, id-session, X-Requested-With, Accept, Origin',
					'Access-Control-Allow-Credentials': 'true'
				} : null ),
				result.headers,
			);

			if ( !context.stream.destroyed && !context.stream.headersSent ) {
				console.Response      ( result.code, hea                            );
				context.stream.respond( hea                                         );
				context.stream.end    ( result.code===204 ? undefined : result.body );
			}
		}

		/* Eventos */
		function onRequest( stream, headers, headers_number, array_headers ) {
			Parse( stream, headers, headers_number, array_headers )
			.then( ctx => {
				console.Petition( ctx.method, ctx.url );

				if ( ctx.method==='OPTIONS' && CONFIG.enabled_cors ) Response( ctx, { code:204, body:'' } );
				else {
					ctx.Send = reu => Response( ctx, ParseResult( reu ) );

					ModuleResponse( ctx )
					.then( res => {
						if      ( res===undefined           ) ctx.Send({ _code:501 });
						else if ( Typeof( res )==='promise' ) res.then( ctx.Send ).catch( e => { throw e } );
						else                                  ctx.Send( res );
					})
					.catch( e => { throw e } );
				}
			})
			.catch( e => {
				console.Error   ( e.stack                                              );
				console.Response( 500, { 'Content-Type': 'text/plain' }                );
				stream .respond (      { 'Content-Type': 'text/plain', ':status':500 } );
				stream .end     ( 'Error interno en el servidor'                       );
			});
		}

		/* Inicio */
		!project.is_one &&
		http2
		.createSecureServer({
			cert      : CONFIG.crt,
			key       : CONFIG.key,
			allowHTTP1: true,
		})
		.on    ( 'stream'         , onRequest )
		.on    ( 'upgrade'        , Socket    )
		.listen( project.port || 0, onConnect );

		return project.is_one ? { onRequest, onUpgrade } : new Promise( ( run ) => { resolve=run } );
	}

	/* Inicio */
	async function Inicio() {
		if ( project.id!==ID || project.type!=='api' ) return;

		await ReadConfig( project );

		if ( CONFIG.protocol==='http' ) return await ServerHTTP ();
		else                            return await ServerHTTPS();
	};return await Inicio();
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
		process.title = `meme.js API${ port ? ` [${port}]` : '' }`;
		global.driver =
		DRIVER        = await ConnectClient({ port, onEnd:()=>process.exit( 1 ) }).catch( e => console.Error( e ) );

		ConfigureTitle( 'fb[\\[API\\]]'                           );
		DRIVER.Events ( 'project/connect' , Connect               );
		DRIVER.Events ( 'project/load'    , Load                  );
		DRIVER.Events ( 'project/build'   , Build                 );
		DRIVER.Trigger( 'project/init/end', { id:ID, type:'api' } );
	};return Inicio();
};       Inicio();
// ####################################################################################################


/* Exportaciones */
module.exports = async function( config, project ) {
	ID     = project.id;
	CONFIG = Object.assign( {}, config, config.api );
	DRIVER = { Trigger:()=>{} };

	await  Load  ( project );
	return Server( project );
};
// ####################################################################################################