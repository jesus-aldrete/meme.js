#! /usr/bin/env node
// ####################################################################################################


//                    Copyright meme.js Authors
//     Distributed under the Boost Software License, Version 1.1.
// (See accompanying file LICENSE or copy at https://mjs.red/LICENSE)


/* Importaciones */
const vm                                              = require( 'node:vm'                );
const zlib                                            = require( 'node:zlib'              );
const http                                            = require( 'node:http'              );
const http2                                           = require( 'node:http2'             );
const transpilers                                     = require( '../02_Libs/transpilers' );
const { ConnectClient                               } = require( '../02_Libs/courier'     );
const { LoadConfig, GetPortDriver, GetIdProject     } = require( '../02_Libs/config'      );
const { MesageProc, ConfigureTitle, ConfigureConfig } = require( '../02_Libs/log'         );

const {
	Hash,
	Mime,
	Typeof,
	ParsePath,
	VlqEncode,
	ClassToTag,
	ParseParams,
	ParseHeaders,
} = require( '../02_Libs/lib' );
// ####################################################################################################


/* Declaraciones */
let   ID             ;
let   ETAG           ;
let   CONFIG         ;
let   DRIVER         ;
let   REFRESHER      = [];
let   CACHE_URL      = {};
let   IS_LOAD        = false;
const WATCHERS       = {};
const URLS           = {};
const FILES          = {};
const TRANSPILERS    = transpilers();
const MODIFIED_FILES = {};
// ####################################################################################################


/* Comandos */
async function Connect( project ) {
	/* Declaraciones */
	let resolve = 0;

	/* Eventos */
	async function onConnect() {
		const port      = this.address().port;
		CONFIG.port     =
		CONFIG.api.port = port;

		await CONFIG.tasks.Exec({ moment:'connect', config:CONFIG, files:FILES })
		DRIVER.Trigger( 'project/connect/end', { port, id:project.id, type:'app' } );
		resolve();
	}

	/* Funciones */
	function ResponseFiles( cfile, accept_encoding ) {
		if      ( accept_encoding.includes( 'br'      ) ) return cfile.compress_br      || ( cfile.compress_br      = [200, zlib.brotliCompressSync( cfile.ofile.code ), { 'Content-Type':Mime( cfile.ofile.ext ), 'content-encoding':'br'      }] );
		else if ( accept_encoding.includes( 'gzip'    ) ) return cfile.compress_gzip    || ( cfile.compress_gzip    = [200, zlib.gzipSync          ( cfile.ofile.code ), { 'Content-Type':Mime( cfile.ofile.ext ), 'content-encoding':'gzip'    }] );
		else if ( accept_encoding.includes( 'deflate' ) ) return cfile.compress_deflate || ( cfile.compress_deflate = [200, zlib.deflateSync       ( cfile.ofile.code ), { 'Content-Type':Mime( cfile.ofile.ext ), 'content-encoding':'deflate' }] );
		else                                              return cfile.compress         || ( cfile.compress         = [200,                          cfile.ofile.code  , { 'Content-Type':Mime( cfile.ofile.ext ),                              }] );
	}

	async function LoadFiles( ctx ) {
		const accept_encoding = ctx.headers.acceptEncoding ?? '';

		if ( CACHE_URL[ctx.raw_url] )
			return ResponseFiles( CACHE_URL[ctx.raw_url], accept_encoding );

		let ofile = URLS[ctx.raw_url];

		if ( !ofile || ofile.not_available ) {
			if (
				ctx.raw_url.match( /\.(\w+)$/gmi ) ||
				CONFIG.type!=='spa'
			) return [];

			ofile = URLS['/index'];

			if ( !ofile || ofile.is_null ) return [];
		}

		if ( ofile.is_ssr ) {
			let code = await ofile.Render( ctx );

			if      ( accept_encoding.includes( 'br'      ) ) return [200, zlib.brotliCompressSync( code ), { 'Content-Type':Mime( ofile.ext ), 'content-encoding':'br'      }];
			else if ( accept_encoding.includes( 'gzip'    ) ) return [200, zlib.gzipSync          ( code ), { 'Content-Type':Mime( ofile.ext ), 'content-encoding':'gzip'    }];
			else if ( accept_encoding.includes( 'deflate' ) ) return [200, zlib.deflateSync       ( code ), { 'Content-Type':Mime( ofile.ext ), 'content-encoding':'deflate' }];
			else                                              return [200, code                           , { 'Content-Type':Mime( ofile.ext ),                              }];
		}

		return ResponseFiles( CACHE_URL[ctx.raw_url]={ofile}, accept_encoding );
	}
	async function Response( ctx ) {
		console.Petition( ctx.method, ctx.url );

		let code, body = '', headers = { 'Content-Type':'text/plain; charset=utf-8' };

		try {
			switch ( ctx.method ) {
				case 'GET'    : [code, body, headers] = await LoadFiles( ctx ); break;
				case 'OPTIONS': code = 204; break;
			}
		}
		catch( e ) {
			code = 500;
			body = http.STATUS_CODES[500];

			console.Error( e );
			console.trace(   );
		}

		if ( !code ) {
			code    = 404;
			body    = `<h1>${http.STATUS_CODES[404]}</h1>`;
			headers = { 'Content-Type':'text/html; charset=utf-8' };
		}

		if ( CONFIG.enabled_cors )
		headers['Access-Control-Allow-Origin'] = '*';
		headers['Etag'                       ] = ETAG;
		headers['Cache-Control'              ] = 'max-age=31536000, no-cache';
		headers['Vary'                       ] = 'ETag, Content-Encoding';

		console.Response( code, JSON.stringify( headers ) );

		return [code, body, headers];
	}

	/* Servicios */
	function ServerHTTP() {
		/* Funciones */
		function Parse( request, response ) {
			let   ind;
			let   url     = decodeURIComponent( request.url ).toLowerCase();
			const headers = ParseHeaders( request.rawHeaders );
			const result  = {
				host    : request.headers.host,
				method  : request.method.toUpperCase(),
				raw_url : url,
				params  : ParseParams( url ),
				headers : headers,
				protocol: 'http',
			};

			if ( ( ind=url.indexOf( '?' ) )>-1 ) url = url.slice( 0, ind );

			result.url = url;
			url        = url.split( '/' ).splice( 1 );

			if ( url.length===1 && url[0]==='' ) url = [];

			result.path     = url;
			result.petition = { request, response };

			return result;
		}
		function Refresh( request, response ) {
			if ( !IS_LOAD ) {
				setTimeout( ()=>Refresh( request, response ), 100 );
				return;
			}

			REFRESHER.push( ()=>response.write( 'data: refresh\n\n' ) );
			response.writeHead( 200, { 'Content-Type':'text/event-stream; charset=utf-8', 'Cache-Control':'no-cache', 'Connection':'keep-alive' } );
			response.write( 'data: connected\n\n' );
		}

		/* Eventos */
		async function onRequest( request, response ) {
			const ctx = Parse( request, response );

			if ( ctx.raw_url==='/meme-refresh' ) {
				Refresh( request, response );
				return;
			}

			try {
				const [code, body, headers] = await Response( ctx );

				response.writeHead( code, headers );
				response.end      ( body          );
			}
			catch ( e ) {
				console .Error    ( e                                    );
				console .Response ( 500, { 'Content-Type':'text/plain' } );
				response.writeHead( 500, { 'Content-Type':'text/plain' } );
				response.end      ( 'Error interno en el servidor'       );
			}
		}

		/* Inicio */
		ETAG = Hash();

		!project.is_one &&
		http
		.createServer( onRequest                    )
		.listen      ( project.port || 0, onConnect );

		return project.is_one ? { onRequest, onUpgrade } : new Promise( ( run ) => { resolve=run } );
	}
	function ServerHTTPS() {
		/* Funciones */
		function Parse( stream, headers, headers_number, array_headers ) {
			let   ind;
			const hea    = ParseHeaders( array_headers );
			let   url    = decodeURIComponent( hea.path ).toLowerCase();
			const result = {
				host    : hea.origin || hea.authority || '*',
				method  : hea.method.toUpperCase(),
				raw_url : url,
				params  : ParseParams( hea.path ),
				headers : hea,
				protocol: 'http2',
			};

			if ( ( ind=url.indexOf( '?' ) )>-1 ) url = url.slice( 0, ind );

			result.url = url;
			url        = url.split( '/' ).splice( 1 );

			if ( url.length===1 && url[0]==='' ) url = [];

			result.path   = url;
			result.stream = stream;

			return result;
		}

		/* Eventos */
		async function onRequest( stream, headers, headers_number, array_headers ) {
			const ctx = Parse( stream, headers, headers_number, array_headers );

			if ( ctx.raw_url==='/meme-refresh' ) {
				REFRESHER.push( () => stream.write(`data: refresh\n\n`) );
				stream.respond({ 'content-type':'text/event-stream; charset=utf-8', 'cache-control':'no-cache', ':status':200 });
				stream.write( 'data: connected\n\n' );

				return;
			}

			try {
				const [code, body, headers] = await Response( ctx );
				headers[':status']          = code;

				stream.respond( headers );
				stream.end    ( body    );
			}
			catch ( e ) {
				console.Error   ( e                                                   );
				console.Response( 500, { 'Content-Type': 'text/plain'                });
				stream .respond (      { 'Content-Type': 'text/plain', ':status':500 });
				stream .end     ( 'Error interno en el servidor'                      );
			}
		}

		/* Inicio */
		ETAG = Hash();

		!project.is_one &&
		http2
		.createSecureServer({ cert:CONFIG.crt, key:CONFIG.key })
		.on                ( 'stream', onRequest               )
		.listen            ( project.port || 0, onConnect      );

		return project.is_one ? { onRequest, onUpgrade } : new Promise( ( run ) => { resolve=run } );
	}

	/* Inicio */
	async function Inicio() {
		if ( project.id!==ID || project.type!=='app' ) return;

		if ( !CONFIG ) {
			CONFIG = await LoadConfig( project.path, project.environments );
			CONFIG = Object.assign( CONFIG, CONFIG.app );

			ConfigureConfig( CONFIG );
		}

		if ( CONFIG.protocol==='http' ) return await ServerHTTP ();
		else                            return await ServerHTTPS();
	};return await Inicio();
}
async function Load( project ) {
	/* Declaraciones */
	let   cache               ;
	let   is_void             = !Object.keys( FILES ).length;
	let   all_elements_groups = {};
	const hash_load           = Hash();
	const all_elements        = [];
	const files_of_server     = {};

	/* Funciones */
	function Cache() {
		let cache = null;

		async function SearchLmeme( clase ) {
			if ( FILES[`meme:${clase}`] ) return FILES[`meme:${clase}`];

			let ofile;

			switch ( clase ) {
				case 'config'   : ofile = ParsePath( __dirname, '..', '02_Libs' , 'config.js'    ); break;
				case 'lib'      : ofile = ParsePath( __dirname, '..', '02_Libs' , 'lib.js'       ); break;
				case 'log'      : ofile = ParsePath( __dirname, '..', '02_Libs' , 'log.js'       ); break;
				case 'transpile': ofile = ParsePath( __dirname, '..', '02_Libs' , 'transpile.js' ); break;
				case 'courier'  : ofile = ParsePath( __dirname, '..', '03_Execs', 'courier.js'   ); break;
			}

			ofile && ( ofile.is_lib=true );

			return ofile;
		}
		async function SearchFiles( clase ) {
			for ( const ofile of Object.values( FILES ) ) {
				if ( ofile.class_name===clase )
					return cache[clase] = ofile;
			}
		}
		async function SearchLocal( clase ) {
			let fil = null;

			for ( const source of CONFIG.sources ) {
				source.Travel({
					filter: [/\.mj$/i],
					call  : ( ofile ) => {
						if ( ofile.base.match( new RegExp( clase + '.mj$' ), 'i' ) ) {
							fil = ofile;
							return false;
						}

						const cla = /class\s([\w\_\-]+)/gm.exec( ofile.Read() );

						if ( cla && cla[1]!=='extends' && clase===cla[1] ) {
							fil = ofile;
							return false;
						}
					},
				});
			}

			return cache[clase] = fil;
		}
		async function SearchRepos( clase ) {
			let fil;

			for_files:
			for ( const orepo of CONFIG.repositories ) {
				switch ( orepo.type ) {
					case 'folder':
						fil = orepo.Travel({ filter:[`/${clase}\\.mj/i`] })[0];

						if ( fil ) break for_files;
					break;

					case 'url':
						let url = orepo.path + ( orepo.path.at( -1 )==='/' ? '' : '/' ) + clase + '.mj';
						let res = await fetch( url );

						if ( res.ok ) {
							res = await res.text();
							fil = { clase, name:clase, ext:'.mj', type:'url', path:url, data:res, Read:()=>res };
							console.Info( `cd[Download source:] fc[${ url }]` );
							break for_files;
						}
					break;
				}
			}

			if ( !fil ) return null;

			cache[clase]         = fil;
			cache[clase].is_repo = true;

			Writer();

			return cache[clase];
		}
		async function Get( clase ) {
			let tem;

			if ( tem = cache[clase]               ) return tem;
			if ( tem = await SearchLmeme( clase ) ) return tem;
			if ( tem = await SearchFiles( clase ) ) return tem;
			if ( tem = await SearchLocal( clase ) ) return tem;
			if ( tem = await SearchRepos( clase ) ) return tem;

			return null;
		}

		function Writer() {
			const cac  = {};
			const file = ParsePath( CONFIG.constants.work_space.path, 'app.meme.cache' );

			for ( const [clase,ofile] of Object.entries( cache ) ) {
				if ( ofile?.type==='url' ) {
					cac[clase] = {
						ext    : ofile.ext  ,
						path   : ofile.path ,
						data   : ofile.data ,
						type   : ofile.type ,
						name   : ofile.name ,
						clase  : ofile.clase,
						is_repo: true       ,
					};
				}
			}

			if ( Object.keys( cac ).length ) {
				try {
					file.Write( JSON.stringify( cac, null, '\t' ) );
				}
				catch ( e ) {
					debugger
					console.Error( e );
				}
			}
		}

		function Inicio() {
			const file = ParsePath( CONFIG.constants.work_space.path, 'app.meme.cache' );

			try {
				if ( file.type==='file' ) {
					cache = JSON.parse( file.Read() );

					for ( const val of Object.values( cache ) ) {
						val.Read = () => val.data;
					}
				}
				else cache = {};
			}
			catch { cache = {} }

			return { Get };
		};return Inicio();
	}
	function Watch() {
		/* Declaraciones */
		let timer;

		/* Eventos */
		function onChangeFiles( ofile ) {
			clearTimeout( timer );

			timer = setTimeout( () => {
				ViewFiles();
			}, 80 );
		}

		/* Funciones */
		function GetFiles() {
			const ofiles = [];

			for ( const source of CONFIG.sources ) {
				source.Travel({
					filter: CONFIG.filter,
					ignore: CONFIG.ignore,
					call  : ( ofile ) => {
						ofile.data_hash = Hash( ofile.Read() );

						ofiles.push( ofile );
					},
				});
			}

			return ofiles.reduce( ( result, ofile ) => { result[ofile.path]=ofile; return result }, {} );
		}

		function CreateWatchersImport() {
			for ( const ofile of Object.values( FILES ) ) {
				for ( const [path, value] of Object.entries( ofile.refreshers ) ) {
					const orefresh = ParsePath( path );

					if ( orefresh.type!=='file'                       ) continue;
					if ( WATCHERS[orefresh.path] || !value.is_include ) continue;

					orefresh.Read();

					WATCHERS[orefresh.path]         = orefresh;
					WATCHERS[orefresh.path].watcher = orefresh.Watch({ call:onChangeFiles });
				}
			}
		}

		async function ViewFilesDelete( deletes ) {
			if ( !deletes.length ) return;

			for ( const deleted of deletes ) {
				const ofile = FILES[deleted.path];

				if ( !ofile ) {
					console.Error( `cd[no se elimino el archivo de trabajo:] ${deleted.path}` );
					continue;
				}

				for ( const ourl of Object.values( URLS ) ) {
					if ( ourl.path===ofile.path ) {
						delete URLS[ourl.url];
					}
				}

				delete FILES[deleted.path];

				console.Delete( `fy[${ ofile.url }] cd[${ ofile.path }]` );
			}
		}
		async function ViewFilesAdd( adds ) {
			if ( !adds.length ) return;

			const ya = {};

			for ( let ofile of adds ) {
				const ores = await Compile( ofile, false, ya );

				if ( !ores ) {
					if ( !ofile.struct?.is_client_class ) continue;

					console.Error( `Error al compilar el archivo: fy[${ofile.path}]` );
				}
				else {
					console.Add( `fy[${ ofile.url.replace( /\]/g, '\\]' ) }] cd[${ ofile.path.replace( /\]/g, '\\]' ) }]` );
				}
			}

			await Write();
		}
		async function ModifyFiles( modifys ) {
			if ( !modifys.length ) return;

			const clean_cache_pre_render = ( ofile ) => {
				ofile.pre_render_sandbox = undefined;

				for ( const ofi of Object.values( FILES ) ) {
					if ( ofi.path===ofile.path || ofi.ext!=='.mj' ) continue;

					if ( ofi.imports[ofile.struct.class_name] ) {
						clean_cache_pre_render( ofi );
					}
				}
			};

			const ya = {};

			for ( let ofile of modifys ) {
				ofile = await Compile( ofile, false, ya );

				clean_cache_pre_render( ofile );

				if ( !ofile ) console.Error   ( `Error al compilar el archivo: fy[${ofile.path}]` );
				else          console.Modified( `fy[${ ofile.url.replace( /\]/g, '\\]' ) }] cd[${ ofile.path.replace( /\]/g, '\\]' ) }]` );
			}

			await Write();
		}

		async function ViewFiles() {
			const changs = { add:[], delete:[], modify:[], imports:[] };
			const files  = GetFiles();

			for ( const ofile of Object.values( FILES ) ) !ofile.is_repo && !ofile.is_default && !ofile.is_lib && !files[ofile.path] && changs.delete.push( ofile );
			for ( const ofile of Object.values( files ) ) {
				let oold_file = FILES[ofile.path];

				if      ( !oold_file                             ) changs.add   .push( ofile );
				else if (  oold_file.data_hash!==ofile.data_hash ) changs.modify.push( ofile );
			}

			for ( const ofile of Object.values( WATCHERS ) ) {
				const onew = ParsePath( ofile.path );

				if ( onew.type!=='file' ) {
					ofile.watcher.close();
					changs.imports.push( ofile );

					delete WATCHERS[ofile.path];
				}
				else if ( ofile.data!==ofile.Read() ) {
					changs.imports.push( ofile );
				}
			}

			if ( changs.add.length || changs.delete.length || changs.modify.length || changs.imports.length ) {
				CreateWatchersImport();

				await ViewFilesDelete( changs.delete );
				await ViewFilesAdd   ( changs.add    );
				await ModifyFiles    ( changs.modify );

				ETAG      = Hash();
				CACHE_URL = {};

				await CONFIG.tasks.Exec({ moment:'watch', config:CONFIG, urls:URLS, files:FILES, transpilers:TRANSPILERS });

				for ( const ref of REFRESHER ) ref();
			}
		}

		/* Inicio */
		function Inicio() {
			if ( !CONFIG.watch ) return;

			for ( const source of CONFIG.sources )
				source.Watch({ call:onChangeFiles });

			CreateWatchersImport();
		};return Inicio();
	}
	function WriteMapFunction( origin, generate, ofile ) {
		/* GET */
		function GetStartPositionInGenerate( cad ) {
			let   pos = 0, con = true, pov;

			for ( ;pos<cad.length && con; pos++ ) {
				switch ( cad[pos] ) {
					case '/':
						if ( cad[pos+1]==='*' && cad[pos+2]===':' ) {
							for ( pos+=3, pov=''; pos<cad.length && cad[pos]!==':'; pov+=cad[pos++] );

							pov = parseInt( pov ) || 0;
							con = false;
						}
					break;
				}
			}

			return pov;
		}
		function GetStartLineInOriginal( cad, position ) {
			let pos = 0, lin = 0;

			for ( ;pos<position; pos++ ) {
				switch ( cad[pos] ) {
					case '\r':
					case '\n': lin++; break;
				}
			}

			return lin;
		}
		function GetVLQS( cad, line ) {
			let pos = 0, col = 0, res = '';

			cad+= '\n';

			for ( ;pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case '\r':
					case '\n':
						res += VlqEncode([ 0, 0, line, 0 ]) + ';';
						line = 1;
					break;
				}
			}

			return res;
		}

		/* Inicio */
		function Inicio() {
			const position = GetStartPositionInGenerate( generate           );
			const line     = GetStartLineInOriginal    ( origin  , position );
			const vlqs     = GetVLQS                   ( generate, line     );
			const map      = (
				`{` +
					`"version"`        + `:3,`                   +
					`"sources"`        + `:["${ ofile.path }"],` +
					`"names"`          + `:[],`                  +
					`"mappings"`       + `:";;${ vlqs }",`       +
					`"sourcesContent"` + `:["${ origin.replace( /\\/gm, '\\\\' ).replace( /\"/gm, '\\"' ) }"],` +
					`"sourceRoot"`     + `:"${ ofile.path }"` +
				`}`
			).replace( /\n|\r/gm, '\\n' ).replace( /\t/gm, '\\t' );

			return (
				generate +
				`\n//# sourceMappingURL=data:application/json;base64,${ ( new Buffer.from( map ) ).toString( 'base64' ) }` +
				`\n//# sourceURL=${ ofile.path }`
			);
		};return Inicio();
	}

	async function RequireMeme( lib ) {
		const oparse = await cache.Get( lib );
		const url    = `meme:${lib}`;

		if (  FILES[url]?.exports  ) return FILES[url].exports;
		if (  oparse.type!=='file' ) return null;
		if (  oparse.exports       ) return oparse.exports;
		if ( !FILES[url]           ) FILES[url] = oparse;

		const node_modules    = new ( module.constructor )( oparse.path, module );
		node_modules.paths    = ( module.constructor )._nodeModulePaths( oparse.dir );
		node_modules.id       = oparse.path;
		node_modules.filename = oparse.path;

		oparse.struct = await TRANSPILERS.ParseMJ    ( oparse.Read(), oparse );
		oparse.code   = await TRANSPILERS.WriteModule( oparse.struct, oparse );

		try {
			node_modules._compile( `module.return=eval( ${ JSON.stringify( oparse.code ) } )`, oparse.path );

			return FILES[url].exports = oparse.exports = node_modules.exports;
		}
		catch ( e ) {
			console.Error( `error en "require_meme": ${e.message}` );
			console.Error( e.stack );
		}

		return null;
	}
	async function ExecScripts( code, params, ofile ) {
		code = code.replace( /require_meme/gm, 'await require_meme' );

		try {
			return await Object.getPrototypeOf( async function() {} )
			.constructor( 'require', 'require_meme', code )
			.call(
				{
					urls          : URLS          ,
					files         : FILES         ,
					config        : CONFIG        ,
					driver        : DRIVER        ,
					compilers     : TRANSPILERS   ,
					modified_files: MODIFIED_FILES,
					hash_load     ,
					...params     ,
				},
				require,
				require_meme
			).catch( e => { throw e });
		}
		catch ( e ) {
			ofile && console.Error( ofile.path );

			console.Error( e.stack );
		}
	}
	async function RenderFile( ofile, ctx ) {
		const cad = ofile.code;
		let   pos = 0, res = '';

		for ( ;pos<cad.length; pos++ ) {
			switch ( cad[pos] ) {
				case '⎨':
					let tem = '';

					for ( pos++; pos<cad.length && cad[pos]!=='⎬'; tem+=cad[pos++] );

					tem  = ofile.groups[tem]?.body || '';
					tem  = await ExecScripts( tem, { context:ctx, file:ofile, files:FILES, urls:URLS }, ofile );
					res += tem ?? '';
				break;

				default: res+= cad[pos];
			}
		}

		return res;
	}
	async function Compile( ofile, is_default, ya ) {
		/* Funciones */
		async function GetExtends( struct ) {
			if ( !struct.extends_class || struct.extends_class.match( /^(HTML|SVGE)/ ) ) return;

			const cache_extend = await cache.Get( struct.extends_class );
			const compo_extend = await Compile  ( cache_extend, false, ya );

			if ( !compo_extend ) return;

			if ( compo_extend.struct?.is_client_class ) {
				struct.is_client_class = true;
			}

			if ( compo_extend.struct?.extends_tag ) {
				struct.extends_tag||= compo_extend.struct.extends_tag;
			}
		}
		async function GetRequestScripts( ofile ) {
			for ( const group of Object.values( ofile.groups ) ) {
				if ( group.type!==5 ) continue;

				let
				code       = group.body;
				code       = await TRANSPILERS.TranspileEnd( code, ofile );
				code       = `/*:${group.position}:*/` + code;
				code       = WriteMapFunction( ofile.data, code, ofile );
				group.body = code;
			}
		}

		async function GetImports( ofile ) {
			for ( const imp in ofile.imports ) {
				const ocache =
				await cache.Get( imp               );
				await Compile  ( ocache, false, ya );

				if ( ocache ) {
					MODIFIED_FILES[ocache.path]           ??= {};
					MODIFIED_FILES[ocache.path][ofile.path] = ofile;
				}
			}
		}

		/* Funciones - transpilacion */
		async function TranspileMC( ofile ) {
			ofile.data_hash   = Hash( ofile.data );
			ofile.struct      = await TRANSPILERS.ParseMC( ofile.data, ofile );
			ofile.url         = `/${ofile.name}.css`;
			URLS [ofile.url ] =
			FILES[ofile.path] = ofile;

			ofile.hash_load = hash_load;
			ofile.Render    = async ( ctx ) => await RenderFile( ofile, ctx );

			return ofile;
		}
		async function TranspileMH( ofile ) {
			ofile.data_hash   = Hash( ofile.data );
			ofile.struct      = await TRANSPILERS.ParseMH( ofile.data, ofile );
			ofile.url         = `/${ ofile.struct.statics.url || ofile.name.replace( /^[^a-z]+/i, '' ) }`;

			if ( ofile.url==='/' && ofile.name.match( /^\d+$/ ) ) {
				ofile.url = `/${ ofile.struct.statics.url || ofile.name }`;
			}

			if ( ofile.struct.statics.not_available ) {
				ofile.not_available =
					typeof ofile.struct.statics.not_available==='string' ?
						!( !ofile.struct.statics.not_available || ofile.struct.statics.not_available.match( /false/i ) )
					:
						!!ofile.struct.statics.not_available
					;
			}

			if ( !ofile.not_available ) {
				URLS[ofile.url        ] =
				URLS[ofile.url+'.htm' ] =
				URLS[ofile.url+'.html'] = ofile;

				if ( ofile.name.match( /index/i ) ) URLS['/'] = ofile;
			}

			FILES[ofile.path] = ofile;

			ofile.hash_load = hash_load;
			ofile.Render    = async ( ctx ) => await RenderFile( ofile, ctx );

			await GetImports( ofile );

			return ofile;
		}
		async function TranspileMJ( ofile ) {
			ofile.data_hash = Hash( ofile.data );

			ofile.struct =
			await TRANSPILERS.ParseMJ( ofile.data  , ofile );
			await GetExtends         ( ofile.struct        );
			await GetRequestScripts  ( ofile               );

			if (  ofile.struct.is_server_class ) files_of_server[ofile.path] = ofile;
			if ( !ofile.struct.is_client_class ) return;

			ofile.url         = `/${ofile.struct.class_name}.js`;
			URLS [ofile.url ] =
			FILES[ofile.path] = ofile;

			ofile.hash_load = hash_load;
			ofile.Render    = async ( ctx ) => await RenderFile( ofile, ctx );

			await GetImports( ofile );

			return ofile;
		}
		async function TranspileFI( ofile ) {
			ofile.data_hash   = Hash( ofile.data );
			ofile.url         = '/' + ofile.base.replace( /^[^a-z]+/i, '' ).toLowerCase();
			ofile.code        = await TRANSPILERS.TranspileGeneral( ofile.data, 3, ofile );
			ofile.code        = await TRANSPILERS.TranspileEnd    ( ofile.code, ofile );
			ofile.imports     = {};
			URLS [ofile.url]  =
			FILES[ofile.path] = ofile;

			if ( is_default ) ofile.is_default = true;

			ofile.hash_load = hash_load;
			ofile.Render    = () => ofile.code;

			return ofile;
		}

		/* Inicio */
		async function Inicio() {
			if ( !ofile          ) return null;
			if (  ya[ofile.path] ) return ya[ofile.path];

			ya[ofile.path] = ofile;

			for ( const otemp of Object.values( FILES ) ) {
				if (
					otemp.path===ofile.path &&
					otemp.data===ofile.Read()
				) return otemp;
			}

			if ( !ofile.data ) ofile.Read();

			switch ( ofile.ext ) {
				case '.mc': return await TranspileMC( ofile );
				case '.mh': return await TranspileMH( ofile );
				case '.mj': return await TranspileMJ( ofile );
				default   : return await TranspileFI( ofile );
			}
		};return await Inicio();
	}
	async function Prerender( origin, element, body ) {
		/* Declaraciones */
		const cache_slots = {};

		/* Funciones */
		function Replaces( code ) {
			const
			rex  = /\/\*\.\*class\*\.\*\//gmi.exec( code );
			code = code.slice( rex.index );

			return code
				.replace( /Object.defineProperty\( this, 'body', { writable:false, value:body \|\| '' } \);/gm, "this.body=(body||'');"       )
				.replace( /typeof\s*Create==='function'\s*&&\s*Create\(\);/gm                                 , 'this.__html = __html;'       )
				.replace( /this\._events_\?\?={};/gm                                                          , 'return'                      )
				.replace( /refs\[_nams\[x\]\]\s*=\s*roo\.querySelectorAll\(\s*\`[^\`]+\`\s*\)\[0\];/gm        , '{}'                          )
				.replace( /refs\[_nams\[x\]\]\s*=\s*roo\.querySelector\(\s*\`[^\`]+\`\s*\);/gm                , '{}'                          )
				.replace( /if \( props._mepre!="1" \) {/gm                                                    , 'if ( true ) {'               )
				.replace( /if \( props.\w+!==undefined \)/gm                                                  , 'if ( false )'                )
				.replace( /PointerFromReference/gm                                                            , 'window.PointerFromReference' )
				.replace( /import\s+\{\}\s+from\s+\'[^\']+\'/gm                                               , ''                            );
		}
		function CloneStruct( struct ) {
			switch ( Typeof( struct ) ) {
				case 'boolean':
				case 'string' :
				case 'number' : return struct;

				case 'object': {
					const ret = {};

					for ( const [key,value] of Object.entries( struct ) ) {
						switch ( key ) {
							case 'parent':
							case 'ofile' : ret[key] = value; break;
							default      : ret[key] = CloneStruct( value ); break;
						}
					}

					return ret;
				}

				case 'array': {
					const ret = [];

					for ( const value of struct ) {
						ret.push( CloneStruct( value  ) );
					}

					return ret;
				}

				default:
					debugger
				break;
			}
		}

		/* Funciones */
		async function CreateSandbox() {
			const sandbox   = {};
			sandbox.groups  = {};
			sandbox.body    = '';
			sandbox.Event   = class {};
			sandbox.styles  = [];
			sandbox.extends = '';

			sandbox.document = {
				head          : { appendChild:()=>{} },
				createTextNode: (t)=>t,
				createElement : ( )=>{
					const res = { appendChild:(t)=>{ res.text = t } };

					sandbox.styles.push( res );

					return res;
				},
			};

			sandbox.window = {
				_global_slots       : cache_slots,
				_pointers           : {},
				document            : {},
				customElements      : { define:()=>{}, get:()=>false },
				PointerFromReference: ( data ) => {
					if ( !sandbox.window._pointers ) sandbox.window._pointers = {};

					const idd                     = 'HA[' + Hash();
					sandbox.window._pointers[idd] = data;

					return idd;
				},
				HTMLElement: class {
					attributes = [];
					classList  = {
						add: ( ...clases ) => {
							clases.forEach( v => {
								if ( !sandbox.element.clase.includes( v ) ) {
									sandbox.element.clase.push( v );
								}
							});
						},
					};

					get innerHTML(     ) { return sandbox.return_body }
					set innerHTML( val ) { sandbox.body = val }

					SetAtts          = ( atts )=>this.attributes=atts;
					Events           = ()=>{};
					addEventListener = ()=>{};
					dispatchEvent    = ()=>{};
					getAttribute     = ( name )=>sandbox.element.params[name];
					setAttribute     = ( name, value )=>{
						for ( const v of sandbox.attributes ) {
							if ( v.name===name ) {
								v.value = value;
							}
						}
					};
				},
			};

			sandbox.Exec = ( _element, _body, _cache_slots ) => {
				_element.params._mepre       = '1';
				sandbox.window._global_slots = _cache_slots;
				sandbox.element              = _element;
				sandbox.return_body          = _body;
				sandbox.attributes           = sandbox.window.clase.attributes = [];

				for ( const [name,value] of Object.entries( _element.params ) ) {
					sandbox.attributes.push({ name, value });
				}

				sandbox.window.clase.connectedCallback();

				const styles = Object.assign( {}, sandbox.style_childs );

				for ( const style of sandbox.styles ) {
					styles[style.id] = style.text;
				}

				return { styles, body:sandbox.body, groups:sandbox.groups };
			};

			return sandbox;
		}
		async function CreateCompile( sandbox, ofile ) {
			const oclone = {};
			const struct = CloneStruct( ofile.struct );

			for ( const [k,v] of Object.entries( ofile            ) ) oclone[k] = v;
			for ( const func  of Object.values ( struct.functions ) ) func.body = '{}';

			struct.getters_setters   = {};
			struct.variables         = {};
			oclone.pre_render        = {};
			oclone.pre_render.styles = {};
			oclone.pre_render.origin = oclone;
			oclone.pre_render.Exec   = Prerender.bind( this, oclone );
			oclone.struct            = struct;
			oclone.code              = await TRANSPILERS.WriteMJ( struct, oclone );
			sandbox.groups           = Object.assign( sandbox.groups       || {}, ofile.groups );
			sandbox.style_childs     = Object.assign( sandbox.style_childs || {}, oclone.pre_render.styles );

			return oclone;
		}
		async function ExtendRequire( sandbox, ofile ) {
			for ( const req of ofile.elements ) {
				if ( req.tag!=='require' ) continue;

				const name = req.params.module || req.params.component;
				const omod = URLS[`/${name}.js`];

				if ( !omod ) continue;

				req.tag = name;

				await ExecClase( omod, req, '' );
			}

			return sandbox;
		}
		async function ExtendSandbox( sandbox, ofile ) {
			if ( ofile.struct.extends_class ) {
				if ( ofile.struct.extends_class.match( /^HTML/ ) ) sandbox.window[ofile.struct.extends_class] = sandbox.window.HTMLElement;
				else {
					let oextend = URLS[`/${ofile.struct.extends_class}.js`];

					if ( oextend ) {
						oextend =
						await CreateCompile( sandbox, oextend );
						await ExtendSandbox( sandbox, oextend );
						await ExtendRequire( sandbox, oextend );

						sandbox.is_ssr  = sandbox.is_ssr || oextend.is_ssr;
						sandbox.extends+= Replaces( oextend.code ) + '\n';
					}
				}
			}

			return sandbox;
		}

		/* Exec */
		async function ExecClase( ofile, element, body ) {
			if ( ofile.pre_render_sandbox ) return ofile.pre_render_sandbox.Exec( element, body, cache_slots );

			element.params._mepre = '1';

			let sandbox = await CreateSandbox();

			ofile.pre_render_sandbox = sandbox;

			ofile   = await CreateCompile( sandbox, ofile );
			sandbox = await ExtendSandbox( sandbox, ofile );
			sandbox = await ExtendRequire( sandbox, ofile );

			sandbox.ofile = ofile;

			let
			code = Replaces( ofile.code );
			code = sandbox.extends + '\n' + code;
			code+= `window.clase = new window.${element.tag};`;

			try {
				const script  = new vm.Script( code );
				const context = vm.createContext( sandbox );

				script.runInContext( context );
			}
			catch( e ) {
				console.Error( e.message );
				console.info ( e.stack   );
			}

			if ( sandbox.is_ssr || ofile.is_ssr )
				origin.is_ssr = true;

			return sandbox.Exec( element, body, cache_slots );
		}

		/* Inicio */
		async function Inicio() {
			const ofile = URLS[`/${element.tag}.js`];

			if ( !ofile ) return;

			for ( const slot of ( all_elements_groups.slot || [] ) ) {
				if ( !slot.body ) continue;

				cache_slots[slot.slot_hash+slot.id] = slot.body;
			}

			const result = await ExecClase( ofile, element, body );

			for ( const [id,style] of Object.entries( result.styles ) ) {
				origin.pre_render.styles[id] = style;
			}

			for ( const [key,value] of Object.entries( result.groups ) ) {
				origin.groups[key] = value;
			}

			return result.body;
		};return await Inicio();
	}
	async function Write() {
		/* Declaraciones */
		const FunctionsEnd  = [];
		const FunctionsTag  = [];
		const FunctionsLoad = [];

		/* Funciones */
		function MakeDependencies() {
			if ( is_void ) return;

			const ya        = {};
			const make_deps = ofile => {
				if ( ya[ofile.path] ) return;

				ya[ofile.path]           = ofile;
				ofile.hash_load          = hash_load;
				ofile.pre_render_sandbox = null;
				const deps               = MODIFIED_FILES[ofile.path];

				if ( !deps ) return;

				for ( const odeps of Object.values( deps ) )
					make_deps( odeps );
			};

			for ( const ofile of Object.values( FILES ) ) {
				if ( ofile.hash_load!==hash_load ) continue;

				make_deps( ofile );
			}
		}

		function ParseStructs() {
			all_elements_groups = {};

			for ( const ofile of Object.values( FILES ) ) {
				if (  ofile.struct?.End  ) FunctionsEnd .push({ ofile, func:ofile.struct.End  });
				if (  ofile.struct?.Tag  ) FunctionsTag .push({ ofile, func:ofile.struct.Tag  });
				if (  ofile.struct?.Load ) FunctionsLoad.push({ ofile, func:ofile.struct.Load });
				if ( !ofile.elements     ) continue;

				for ( const element of ofile.elements ) {
					all_elements_groups[element.tag]??= [];

					all_elements                    .push( element );
					all_elements_groups[element.tag].push( element );
				}
			}
		}

		async function ExecLoadFunction() {
			for ( const fload of FunctionsLoad ) {
				let
				code = await TRANSPILERS.TranspileEnd( fload.func.body, fload.ofile );
				code = WriteMapFunction( fload.ofile.data, code, fload.ofile );
				code = await ExecScripts( code, { file:fload.ofile, all_elements, all_elements_groups }, fload.ofile );
			}
		}
		async function ExecTagFunction() {
			for ( const ftag of FunctionsTag ) {
				let
				code = await TRANSPILERS.TranspileEnd( ftag.func.body       , ftag.ofile );
				code = WriteMapFunction              ( ftag.ofile.data, code, ftag.ofile );

				const meta_class = ftag.ofile.struct.class_name;

				for ( const element of ( all_elements_groups[meta_class] || [] ) ) {
					let meta_code = await ExecScripts( code, { element, file:element.ofile, props:element.params, all_elements, all_elements_groups }, element.ofile );

					switch ( typeof meta_code ) {
						case 'string': element.replace_meta_element = meta_code; break;
						case 'object':
							meta_code.require!=null && ( element.not_require          = !meta_code.require );
							meta_code.code   !=null && ( element.replace_meta_element =  meta_code.code    );
						break;
					}
				}
			}
		}

		function MarkIsAttElement() {
			for ( const is_element of Object.values( FILES ) ) {
				if ( !is_element.struct?.extends_tag ) continue;

				const is_class = is_element.struct.class_name;

				for ( const element of ( all_elements_groups[is_class] || [] ) ) {
					element.params.is  = is_element.struct.custom_tag;
					element.custom_tag = is_element.struct.extends_tag;
				}
			}
		}
		function CleanImports() {
			for ( const ofile of Object.values( FILES ) ) {
				if ( ofile.struct?.statics?.require==null ) continue;

				for ( const element of ( all_elements_groups[ofile.struct.class_name] || [] ) ) {
					let
					req                 = ofile.struct?.statics?.require;
					req                 = typeof req==='string' ? !( !req || req.match( /false/i ) ) : !!req;
					element.not_require = req;
				}
			}
		}

		async function ServerEvents() {
			const fproc = URLS['/meme.protocol.js'];

			if ( !fproc ) return;

			let name_functions = '';

			for ( const ofile of Object.values( files_of_server ) ) {
				if ( ofile.struct?.is_tcp_class || ofile.struct?.is_socket_class || ofile.struct?.is_edge_class ) {
					for ( const func of Object.values( ofile.struct.functions ) ) {
						let name = func.class_and_name;
						let type = ofile.struct.is_tcp_class ? 1 : ( ofile.struct.is_socket_class ? 2 : 3 );

						if ( name[0]==='/' ) name = name.slice( 1 );

						name_functions+= `document.addEventListener( '${name}', ( event )=>{event._result = _meme_protocol.Exec( ${type}, '${name}', ...( event._params || [] ) );} );\n`;
					}
				}
			}

			fproc.save_data??= fproc.code;
			fproc.code       = fproc.save_data + (
				'\n/* Eventos */\n'+
				name_functions
			);
		}
		async function ExecEndFunction() {
			for ( const fend of FunctionsEnd ) {
				let
				code = await TRANSPILERS.TranspileEnd( fend.func.body, fend.ofile );
				code = WriteMapFunction              ( fend.ofile.data, code, fend.ofile );
				code = await ExecScripts             ( code, { file:fend.ofile, all_elements, all_elements_groups }, fend.ofile );
			}
		}

		/* Write */
		function WriteStyles( ofile ) {
			let styles = '';

			for ( const [id,style] of Object.entries( ofile.pre_render.styles ) ) {
				styles+= `<style id="${id}">${style}</style>\n`;
			}

			if ( ofile.code.match( /<\/head>/gmi ) ) return ofile.code.replace( /<\/head>/gmi, `${styles}\n</head>` );
			else                                     return styles + ofile.code;
		}
		function WriteImports( ohtml ) {
			let   ret       = '';
			const ya        = {};
			const view_deps = ( ohtml ) => {
				let is_deps = false;

				for ( const [key,value] of Object.entries( ohtml.imports ) ) {
					if ( value.find( v=>!v.not_require ) ) {
						const ofile = URLS[`/${key}.js`];

						if ( !ofile || ya[ofile.path] ) {
							if ( !ya[ofile?.path] ) {
								console.Error( `no se encontro la importacion "${ key }"` );
							}

							continue;
						}

						ya[ofile.path] = ofile;

						view_deps( ofile );
					}
				}

				if ( ohtml.struct.extends_class ) {
					const ofile = URLS[`/${ohtml.struct.extends_class}.js`];

					if ( ofile ) {
						if ( Object.keys( ofile.struct.functions || {} ).length || Object.keys( ofile.struct.getters_setters || {} ).length ) {
							ret+= `\n\timport {} from '${ CONFIG.constants.APP }/${ ofile.struct.class_name }_pre.js';`;

							if ( view_deps( ofile ) ) {
								is_deps = true;
							}
						}
					}
				}

				if ( is_deps || Object.keys( ohtml.struct.functions || {} ).length || Object.keys( ohtml.struct.getters_setters || {} ).length ) {
					ret    += `\n\timport {} from '${ CONFIG.constants.APP }/${ ohtml.struct.class_name }_pre.js';`;
					is_deps = true;
				}

				return is_deps;
			};

			view_deps( ohtml );

			if ( ret )  {
				ret = (
					'\n<script type="module">' +
						ret +
					'\n</script>'
				);
			}

			return ohtml.code + ret;
		}

		async function WriteMC( ofile ) {
			ofile.code = await TRANSPILERS.WriteMC( ofile.struct, ofile );
		}
		async function WriteMJ( ofile ) {
			if ( !ofile.url ) return;

			ofile.code = await TRANSPILERS.WriteMJ( ofile.struct, ofile );

			const new_ofile = {};

			for ( const [name,value] of Object.entries( ofile ) )
				new_ofile[name] = value;

			new_ofile.code      = new_ofile.code.replace( /import\s+\{\}\s+from\s+\'[^\']+\'/gm, '' );
			new_ofile.url       = new_ofile.url?.replace( /\.js$/i, '_pre.js' );
			new_ofile.Render    = async ( ctx ) => await RenderFile( new_ofile, ctx );
			URLS[new_ofile.url] = new_ofile;

			if ( !ofile.struct.extends_class ) return;

			const oextend = URLS[`/${ofile.struct.extends_class}_pre.js`];

			if ( !oextend ) return;

			const rex = oextend.code.match( /\s*extends\s*window\.(HTML\w+)/gmi );

			if (
				rex &&
				!Object.values( oextend.struct.functions       ).length &&
				!Object.values( oextend.struct.getters_setters ).length
			) {
				new_ofile.code = new_ofile.code.replace( /\s*extends\s*window\.[a-z_-]+/igm, rex[0] );
			}
		}
		async function WriteMH( ofile ) {
			let
			isp = ofile.struct.statics.pre_render;
			isp = typeof isp==='string' ? !( !isp || isp.match( /false/i ) ) : !!isp;

			let
			not = ofile.struct.statics.not_available;
			not = typeof not==='string' ? !( !not || not.match( /false/i ) ) : !!not;

			if ( not ) return;

			if ( isp ) {
				ofile.pre_render = {
					Exec  : Prerender.bind( this, ofile ),
					origin: ofile,
					styles: {},
				};

				ofile.code = await TRANSPILERS.WriteMH( ofile.struct, ofile );
				ofile.code = ofile.code.replace( /\<\/head\>/gmi, '<script>window._global_slots??={}</script></head>' );
				ofile.code = WriteStyles ( ofile );
				ofile.code = WriteImports( ofile );
			}
			else ofile.code = await TRANSPILERS.WriteMH( ofile.struct, ofile );
		}

		/* Inicio */
		async function Inicio() {
			const start_write = performance.now();

			MakeDependencies();
			ParseStructs    ();

			await ExecLoadFunction();
			await ExecTagFunction ();

			MarkIsAttElement  ();
			await ServerEvents();
			CleanImports      ();

			for ( const ofile of Object.values( FILES ) ) {
				if ( !is_void && ofile.hash_load!==hash_load ) continue;

				switch ( ofile.ext ) {
					case '.mc': await WriteMC( ofile ); break;
					case '.mh': await WriteMH( ofile ); break;
					case '.mj': await WriteMJ( ofile ); break;
				}

				if ( !is_void ) console.Write( `fm[${ofile.url}] cd[${ofile.path}]` );
			}

			await ExecEndFunction();

			console.Info( `cd[Tiempo total de escritura:] fc[${ performance.now() - start_write }]` );
		};return await Inicio();
	}

	/* Inicio */
	async function Inicio() {
		if ( project.id!==ID ) return;

		IS_LOAD = false;

		if ( !CONFIG ) {
			CONFIG = await LoadConfig( project.path, project.environments );
			CONFIG = Object.assign( CONFIG, CONFIG.app );

			ConfigureConfig( CONFIG );
		}

		TRANSPILERS.Configure({ config:CONFIG, address:project.address, exec:ExecScripts });
		Watch();

		cache               = Cache();
		global.require_meme = RequireMeme;
		const defaults      = ParsePath( __dirname, '..', '04_Defaults' );
		const ya            = {};
		const start_compile = performance.now();

		for ( const source of CONFIG.sources )  {
			for ( const ofile of source.Travel({ filter:CONFIG.filter, ignore:CONFIG.ignore }) ) {
				const fil = await Compile( ofile, false, ya );
				let   col = 'fy';

				if ( ofile.ext==='.mh' ) col = 'fg';

				if ( !fil ) {
					if ( !ofile.struct?.is_client_class ) continue;

					console.Error( `Error al compilar el archivo: fy[${ofile.path}]` );
				}
				else console.Load ( `${col}[${ fil.url?.replace( /\]/g, '\\]' ) }] cd[${ fil.path?.replace( /\]/g, '\\]' ) }]` );
			}
		}

		for ( const ofile of defaults.Travel({ filter:[/\.js$/] }) ) {
			const fil = await Compile( ofile, true, ya );

			if ( !fil ) console.Error( `Error al compilar el archivo: fy[${ofile.path}]` );
			else        console.Load ( `fb[${ fil.url?.replace( /\]/g, '\\]' ) }] cd[${ fil.path?.replace( /\]/g, '\\]' ) }]` );
		}

		is_void && console.Info( `cd[Tiempo total de compilacion:] fc[${ performance.now() - start_compile }]` );

		await Write();

		if ( is_void ) {
			console.Info( `cd[Tiempo total de la carga:] fc[${ performance.now() - start_compile }]` );
			process.Send?.({ command:'load' });
			await CONFIG.tasks.Exec({ moment:'load', config:CONFIG, urls:URLS, files:FILES, transpilers:TRANSPILERS });
		}

		IS_LOAD = true;

		DRIVER.Trigger( 'project/load/end', { id:project.id, type:'app' } );
	};return await Inicio();
}
async function Build( project ) {
	if ( project.id!==ID ) return;

	if ( await CONFIG.tasks.Exec({ moment:'build', config:CONFIG, urls:URLS, files:FILES, transpilers:TRANSPILERS }) ) {
		for ( let [url,ofile] of Object.entries( URLS ) ) {
			if ( ofile.ext==='.mh' ) {
				if (  url==='/'                ) url+= 'index';
				if ( !url.match( /\.html?$/i ) ) url+= '.html';
			}

			const onew = ParsePath( CONFIG.build.path + url );

			onew.Write( ofile.code );
			console.Build( `fy[${ ofile.path }] => cd[${ onew.path }]` );
		}
	}

	DRIVER.Trigger( 'project/build/end', { id:ID, type:'app' } );
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
		process.title = `meme.js APP${ port ? ` [${port}]` : '' }`;
		global.driver =
		DRIVER        = await ConnectClient({ port, onEnd:()=>process.exit( 1 ) }).catch( e => console.Error( e ) );

		ConfigureTitle( 'fb[\\[APP\\]]'                           );
		DRIVER.Events ( 'project/connect' , Connect               );
		DRIVER.Events ( 'project/load'    , Load                  );
		DRIVER.Events ( 'project/build'   , Build                 );
		DRIVER.Trigger( 'project/init/end', { id:ID, type:'app' } );
	};return Inicio();
};       Inicio();
// ####################################################################################################


/* Exportaciones */
module.exports = async function( config, project ) {
	ID     = project.id;
	CONFIG = Object.assign( {}, config, config.app );
	DRIVER = { Trigger:()=>{} };

	await  Load  ( project );
	return Server( project );
};
// ####################################################################################################