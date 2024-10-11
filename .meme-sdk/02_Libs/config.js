//                    Copyright meme.js Authors
//     Distributed under the Boost Software License, Version 1.1.
// (See accompanying file LICENSE or copy at https://mjs.red/LICENSE)


/* Tipos */
/** TPath
 * Objeto path, para el manejo de archivos y directorios
 * @typedef {object} TPath
 *
 * @property {string}                                                           root    - La raíz del sistema de archivos de la ruta.
 * @property {string}                                                           dir     - El directorio que contiene el archivo.
 * @property {string}                                                           base    - El nombre del archivo (con extensión).
 * @property {string}                                                           ext     - La extensión del archivo (sin el punto y en minusculas).
 * @property {string}                                                           name    - El nombre del archivo (sin extensión).
 * @property {string}                                                           path    - La ruta completa del archivo.
 * @property {TConfig}                                                           config   - La configuracion que se carga.
 * @property {'file'|'folder'|null}                                              type    - El tipo de archivo de la ruta, si existe ('file' para archivo, 'folder' para carpeta, null si no existe).
 * @property {string|Buffer}                                                    data    - Los datos leídos de la ruta, si se han leído.
 * @property {( is_text?:boolean                    ) => string|Buffer        } Read    - Una función que lee el contenido del archivo.
 * @property {( data:string|Buffer, options?:string ) => void                 } Write   - Una función que escribe datos en el archivo.
 * @property {( params:ParamsWatch                  ) => ReturnWatch          } Watch   - Una función que observa el archivo en busca de cambios.
 * @property {( params:ParamsTravel                 ) => TPath[]|false        } Travel  - Una función que recorre el directorio de la ruta y ejecuta una función en cada archivo.
 * @property {(                                     ) => void                 } Delete  - Una función que borra el archivo.
 * @property {'rename'|'change'|'delete'}                                       [event] - Indica el tipo de cambio que ha ocurrido en el archivo o directorio observado.
 */
/** TRender
 * La configuración de renderizado.
 * @typedef {Object} TRender
 *
 * @property {string}  css_auto_unit - La unidad automática para CSS.
 * @property {boolean} pre_render    - Indica si se realiza un pre-renderizado.
 * @property {boolean} lazy_loading  - Indica si se utiliza carga perezosa.
 */
/** TPackaging
 * La configuración de empaquetado.
 * @typedef {Object} TPackaging
 *
 * @property {boolean} single_origin - Indica si se utiliza un origen único.
 * @property {boolean} add_maps      - Indica si se agregan "source map's".
 */
/** TLog
 * La configuración de registro.
 * @typedef {Object} TLog
 *
 * @property {boolean} request  - Indica si se registran las solicitudes.
 * @property {boolean} response - Indica si se registran las respuestas.
 */
/** TCommands
 * Objeto del tipo comandos
 * @typedef {Object<string, Object>} TCommands
 *
 * @param {Array<TCommand>} commands
 */
/** TCommand
 * Objeto del tipo comando
 * @typedef {Object} TCommand
 *
 * @param {string}   command            - Comando que se va a ejecutar.
 * @param {string[]} [args]             - Argumentos opcionales pasados al comando.
 * @param {Object}   [options]          - Opciones de configuración adicionales.
 * @param {string}   [options.cwd]      - Directorio de trabajo actual para el comando.
 * @param {Object}   [options.env]      - Variables de entorno para el comando.
 * @param {Object}   [options.stdio]    - Redirección de la entrada/salida estándar del comando.
 * @param {string}   [options.encoding] - Codificación de la salida del comando.
 * @param {number}   [options.timeout]  - Límite de tiempo para la ejecución del comando.
 */
/** TServer
 * La configuración de un servidor.
 * @typedef TServer
 *
 * @property {string}               [protocol] - El protocolo del servidor.
 * @property {string}               [host]     - El host del servidor.
 * @property {number}               [port]     - El puerto del servidor.
 * @property {string}               [crt]      - La ruta del archivo de certificado del servidor.
 * @property {string}               [key]      - La ruta del archivo de clave del servidor.
 * @property {string}               [build]    - La ruta de construcción del servidor.
 * @property {string}               [sources]  - La ruta de las fuentes del servidor.
 * @property {Array<RegExp|string>} [filter]    - Un array de expresiones regulares que se utilizarán para filtrar los archivos y carpetas encontrados.
 * @property {boolean}              [start]    - Indica si se inicia la servidor.
 * @property {boolean}              [watch]    - Indica si se realiza seguimiento de cambios en "sources".
 * @property {Array<Object>}        [tasks]    - Las tareas del servidor.
 * @property {Array<RegExp|string>} [ignore]   - Un array de expresiones regulares que se utilizarán para excluir los archivos y carpetas encontrados.
 */
/** TConfig
 * Configuración del proyecto.
 * @typedef {Object} TConfig
 *
 * @property {string}       name         - El nombre del proyecto.
 * @property {string}       type         - El tipo de proyecto.
 * @property {string}       author       - El autor del proyecto.
 * @property {string}       version      - La versión del proyecto.
 * @property {string}       description  - La descripción del proyecto.
 * @property {TRender}      render       - La configuración de renderizado.
 * @property {TPackaging}   packaging    - La configuración de empaquetado.
 * @property {TLog}         log          - La configuración de registro.
 * @property {Object}       constants    - Las constantes que puede tener el proyecto.
 * @property {TCommands}    commands     - Los comandos que puede tener el proyecto.
 * @property {Array<TPath>} repositories - Los repositorios del proyecto.
 * @property {TServer}      app          - La configuración de la aplicación.
 * @property {TServer}      api          - La configuración de la API.
 * @property {TServer}      res          - a configuración de los recursos.
 */
// ####################################################################################################


/* Importaciones */
const { ConfigureTitle } = require( './log' );
const compilers          = require( './transpilers' );

const {
	crt,
	key,
	Typeof,
	VlqEncode,
	ParsePath,
	StrToRegExp,
} = require( './lib' );
// ####################################################################################################


/* Declaraciones */
const COMPILERS = compilers();
const constants = {
	crt,
	key,
	config         : {},
	meme_space     : ParsePath( __dirname, '..' ),
	version_package: GetVersionPackage(),
};
// ####################################################################################################


/* Funciones */
/**
 * Requiere una biblioteca en una ubicación específica relativa al directorio actual.
 *
 * @global
 * @param {string} lib_name - El nombre de la biblioteca a requerir, sin la extensión `.js`.
 *
 * @returns {Object|null} Devuelve el objeto exportado por el módulo requerido, o `null` si el archivo no existe o no es un archivo.
 */
global._require_meme_config = function( lib_name ) {
	const lib = ParsePath( `${__dirname}/${lib_name}.js` );

	if ( lib.type!=='file' ) return null;

	return require( lib.path );
};

/**
 * Genera un mapa de código fuente (sourcemap) y lo adjunta al código generado.
 *
 * @param {string} origin   - El código fuente original.
 * @param {string} generate - El código generado por alguna operación de transpilación o compilación.
 * @param {TPath}  ofile    - Un objeto que representa el archivo relacionado.
 *
 * @returns {string} Devuelve el código generado con la adición del mapa de código fuente en formato Base64.
 */
function GenerateMAP( origin, generate, ofile ) {
	/* Get */
	function GetVLQS() {
		let   res = '';
		const cad = origin;
		let   pos = 0, lin = 0;

		for ( ;pos<cad.length; pos++ ) {
			switch ( cad[pos] ) {
				case '\n':
				case '\r':
					res+= VlqEncode([ 0, 0, lin, 0 ])+';';
					lin = 1;
				break;
			}
		}

		return res + VlqEncode([ 0, 0, lin, 0 ]);
	}

	/* Inicio */
	function Inicio() {
		const vlqs = GetVLQS();
		const map  = (
			`{` +
				`"version"`        + `: 3,`                                                                  +
				`"sources"`        + `: ["${ ofile.path }"],`                                                +
				`"names"`          + `: [],`                                                                 +
				`"mappings"`       + `: "${ vlqs }",`                                                        +
				`"sourcesContent"` + `: ["${ origin.replace( /\\/gm, '\\\\' ).replace( /\"/gm, '\\"' ) }"],` +
				`"sourceRoot"`     + `: "${ ofile.path }"`                                                   +
			`}`
		).replace( /\n|\r/gm, '\\n' ).replace( /\t/gm, '\\t' );

		return (
			generate +
			`\n//# sourceMappingURL=data:application/json;base64,${ ( new Buffer.from( map ) ).toString( 'base64' ) }` +
			`\n//# sourceURL=${ ofile.path }`
		);
	};return Inicio();
}

/**
 * Combina dos objetos de configuración en uno solo.
 * @param {TConfig} obj1 - Primer objeto de configuración.
 * @param {TConfig} obj2 - Segundo objeto de configuración.
 *
 * @returns {TConfig} - Objeto de configuración combinado.
 */
function CombineConfigs( obj1, obj2 ) {
	if ( obj1?.constructor===Object && obj2?.constructor===Object ) {
		let res = {};

		for ( let x in obj1 ) res[x] = CombineConfigs( obj1[x], obj2[x] );
		for ( let x in obj2 ) res[x] = CombineConfigs( obj1[x], obj2[x] );

		return res;
	}
	else return obj2===undefined ? obj1 : obj2;
}

/**
 * Carga un archivo de configuración y realiza reemplazos de constantes en su contenido.
 * El archivo se lee utilizando la función `ofile.Read()` y se realiza el reemplazo de constantes
 * utilizando la función `ReplaceConstants()`. El resultado se asigna a la propiedad `body`.
 * Luego se realiza la compilación del módulo utilizando el contenido de `body`.
 * Si la compilación tiene éxito, se asignan las constantes exportadas al objeto `constants` y se asigna
 * el valor del módulo exportado a la propiedad `ofile.config`. Si ocurre una excepción durante la compilación,
 * se muestra el mensaje de error en la consola y se asigna un objeto vacío a `ofile.config`.
 * Finalmente, se devuelve el objeto `ofile`.
 * @param {object} ofile - El objeto de archivo de configuración.
 *
 * @returns {Promise<TPath>} Devuelve el objeto `ofile` actualizado.
 */
async function LoadConfigFile( ofile ) {
	delete require.cache[ofile.path];

	constants.config.constants??= constants;

	COMPILERS.Configure({ config:constants.config, address:{}, exec:null });

	let
	code = ofile.Read();
	code = await COMPILERS.TranspileGeneral( code, ofile                               );
	code = await COMPILERS.TranspileEnd    ( code, ofile                               );
	code = GenerateMAP                     ( ofile.data, code, ofile                   );
	code = code.replace                    ( /require_meme/gm , '_require_meme_config' );

	const node_modules    = new ( module.constructor )( ofile.path, module );
	node_modules.paths    = ( module.constructor )._nodeModulePaths( ofile.dir );
	node_modules.id       = ofile.path;
	node_modules.filename = ofile.path;

	try {
		node_modules._compile( `module.return=eval( ${ JSON.stringify( code ) } )`, ofile.path );

		for ( const [k,v] of Object.entries( node_modules?.exports?.constants || {} ) )
			constants[k] = v;

		ofile.config = node_modules.exports;
	}
	catch ( e ) {
		console.Error( `error al cargar la configuracion: ${ ofile.path }` );
		console.Error( e.stack );

		ofile.config = {};
	}

	constants.config = CombineConfigs( constants.config, ofile.config );

	return ofile;
}

/**
 * Obtiene la configuración por defecto.
 * @returns {Promise<TConfig>} - Objeto que contiene la configuración predeterminada.
 */
async function GetDefaultConfig() {
	return await LoadConfigFile(
		ParsePath( __dirname, '..', '04_Defaults', 'meme.conf' )
	);
}
/**
 * Obtiene la configuración superior buscando en los directorios superiores.
 * @param {string} file_path    - Ruta del archivo de configuración actual.
 * @param {string} replace_path - Ruta de reemplazo opcional.
 * @param {Array}  [result=[]]  - (Opcional) Matriz que almacena los resultados de configuración encontrados.
 *
 * @returns {Promise<Array<TPath>>} - Matriz de objetos que contienen las configuraciones superiores encontradas.
 */
async function GetSuperiorConfig( dir_path, result=[] ) {
	let   is_root = false;
	const odir    = ParsePath( dir_path, '..' );
	const ofiles  = odir.Travel({ filter:[/meme\.conf$/], recursive:false });

	for ( const ofile of ofiles ) {
		const oconfig = await LoadConfigFile( ofile );

		if ( oconfig.config.root ) {
			is_root = true;
		}

		result.push( oconfig );
	}

	if ( odir.dir!=='/' && !is_root )
	await GetSuperiorConfig( odir.path, result );

	return result;
}
/**
 * Obtiene las configuraciones de proyecto buscando en el directorio del proyecto y sus subdirectorios.
 * @param {string} file_path - Ruta del archivo de proyecto actual.
 * @param {Array}  result    - (Opcional) Matriz que almacena los resultados de configuración encontrados.
 *
 * @returns {Promise<Array<TConfig>>} - Matriz de objetos que contienen las configuraciones de proyecto encontradas.
 */
async function GetProjectConfigs( file_path, result=[] ) {
	const oproject = ParsePath( file_path );
	const ofiles   = oproject.Travel({ filter:[/\.meme\.conf$/], recursive:false });

	if ( oproject.type==='file' )
		ofiles.unshift( oproject );

	for ( const ofile of ofiles ) {
		result.push(
			await LoadConfigFile( ofile )
		);
	}

	return result;
}

/**
 * Inicializa la ruta de construcción (build) en la configuración.
 * @param {TServer} config - Objeto de configuración.
 */
function InitBuild( config ) {
	switch ( typeof config.build ) {
		case 'string':
			if ( config.build[0]==='.' ) config.build = ParsePath( constants.work_space.path, config.build );
			else                         config.build = ParsePath(                            config.build );
		break

		default: config.build = ParsePath( `${ constants.work_space.path }/build` );
	}
}
/**
 * Inicializa las tareas en la configuración.
 * @param {TServer} config - Objeto de configuración.
 */
function InitTasks( config ) {
	const tasks = {
		connect: [],
		start  : [],
		watch  : [],
		build  : [],
		load   : [],
		end    : [],
		Exec   : async ({ moment, ...params }) => {
			let con = true;

			for ( const v of config.tasks[moment] ?? [] ) {
				let c = await v.script.call({ moment, ...params }) ?? true;

				if ( con && !c ) con = false;
			}

			return con;
		},
	};

	config.tasks.forEach?.( v => {
		if ( typeof v.script!=='function' ) return;

		if ( v?.moment?.includes?.( 'connect' ) ) tasks.connect.push( v );
		if ( v?.moment?.includes?.( 'start'   ) ) tasks.start  .push( v );
		if ( v?.moment?.includes?.( 'watch'   ) ) tasks.watch  .push( v );
		if ( v?.moment?.includes?.( 'build'   ) ) tasks.build  .push( v );
		if ( v?.moment?.includes?.( 'load'    ) ) tasks.load   .push( v );
		if ( v?.moment?.includes?.( 'end'     ) ) tasks.end    .push( v );
	});

	config.tasks = tasks;
}
/**
 * Inicializa las fuentes de configuración.
 *
 * @param {object}               config         - Objeto de configuración.
 * @param {Array<string>|string} config.sources - Fuentes de configuración. Si no se proporciona, se establecerá como ['.'] por defecto.
 */
function InitSources( config ) {
	if ( !config.sources                   ) config.sources = ['.'];
	if (  typeof config.sources==='string' ) config.sources = [config.sources];

	const opaths = [];

	config.sources.forEach( ( v, i ) => {
		const d = typeof v==='string' ? v : ( v?.path ?? '.' );
		let   p;

		if ( d[0]==='.' || ( d[0]==='/' && d[1]==='.' ) ) p = ParsePath( constants.work_space.path, d );
		else                                              p = ParsePath(                            d );

		if ( p.type==='folder' ) opaths.push( p );
	});

	config.sources = opaths;
}
/**
 * Inicializa la configuración del servidor.
 * @param {TServer} config - Objeto de configuración.
 */
function InitServer( config ) {
	InitBuild  ( config );
	InitTasks  ( config );
	InitSources( config );

	/*/ ***** MORE ***** /*/
	if ( Typeof( config.filter )!=='array' ) config.filter = [config.filter];
	if ( Typeof( config.ignore )!=='array' ) config.ignore = [config.ignore];

	config.filter = config.filter.filter( v => !!v ).map( v => Typeof(v)==='string' ? StrToRegExp( v ) : v );
	config.ignore = config.ignore.filter( v => !!v ).map( v => Typeof(v)==='string' ? StrToRegExp( v ) : v );

	if ( typeof config.port!=='number' ) {
		config.port = parseInt( config.port );
		config.port = isNaN( config.port ) ? 0 : config.port;
	}
}
/**
 * Inicializa los puertos para los componentes de driver
 * @param {TServer} config - Objeto de configuración.
 */
function InitPorts( config ) {
	if ( Typeof( config.driver )!=='object' ) config.driver = {};

	if ( typeof config.driver.port!=='number' ) {
		config.driver.port = parseInt( config.driver.port );
		config.driver.port = isNaN( config.driver.port ) ? 0 : 49123;
	}
}
/**
 * Inicializa la configuración global.
 * @param {TConfig} config              - Objeto de configuración.
 * @param {object}  environments        - Entornos de configuración.
 * @param {Array}   configs_paths       - Rutas de configuración.
 * @param {boolean} read_only_one_level - Indicador de solo lectura de un nivel.
 */
function Init( config, environments, configs_paths, read_only_one_level ) {
	config.watch               = !!( config.watch ?? true );
	config.commands          ??= {};
	config.enabled_cors        = !!( config.enabled_cors ?? true );
	config.environments        = environments;
	config.configs_paths       = configs_paths;
	config.read_only_one_level = read_only_one_level;

	for ( const [k,v] of Object.entries( constants ) ) {
		if ( config.constants[k]===undefined )
			config.constants[k] = v;
	}

	config.constants.version_project = config.version;

	InitPorts( config );

	/*/ ***** SOURCES ***** /*/
	const parse_string = ( path ) => {
		if ( path.match( /^https?\:/ ) ) return { path, type:'url' };
		if ( path[0]==='.'             ) return ParsePath( constants.work_space.path, path );

		return ParsePath( path );
	}

	switch ( Typeof( config.repositories ) ) {
		case 'string': config.repositories = [parse_string( config.repositories )]; break;
		case 'array' : config.repositories = config.repositories.map( parse_string ); break;
		default      : config.repositories = [];
	}

	/*/ ***** SERVERS ***** /*/
	InitServer( config.api );
	InitServer( config.app );
	InitServer( config.res );
}
// ####################################################################################################


/* Metodos */
/**
 * Obtiene la versión del paquete meme.js.
 *
 * @returns {string} La versión del paquete.
 */
function GetVersionPackage() {
	const fil = ParsePath( __dirname, '..', 'package.json' );

	if ( fil.type==='file' ) {
		let con = fil.Read();

		try { con = JSON.parse( con ) } catch { con = {} }

		return con?.version || '0.0.0';
	}

	return '0.0.0';
}
/**
 * Obtiene el puerto del controlador.
 *
 * @returns {number} El puerto del controlador.
 */
function GetPortDriver() {
	let port = 0;

	for ( const arg of process.argv ) {
		if ( !arg.match( /-driver_port=(\d+)/gm ) ) continue;

		port = arg.split( '=' )[1];
		port = parseInt( port ) || 0;
	}

	return port;
}
function GetIdProject() {
	let id = 0;

	for ( const arg of process.argv ) {
		if ( !arg.match( /-project_id=(\d+)/gm ) ) continue;

		id = arg.split( '=' )[1];
		id = parseInt( id ) || 0;
	}

	return id;
}

/**
 * Carga y combina las opciones de configuración de una aplicación desde varios archivos y opciones por defecto.
 *
 * @param {string}        path         - Ruta de la carpeta del proyecto.
 * @param {Array<string>} environments - Una matriz de nombres de entornos que se utilizarán para cargar opciones específicas del entorno.
 *
 * @returns {Promise<TConfig>} - Un objeto que contiene todas las opciones de configuración combinadas cargadas desde los archivos '.m.conf' encontrados en la ruta especificada.
 */
async function LoadConfig( file, environments, show_log_configs ) {
	ConfigureTitle( 'fm[\\[config\\]]', false );

	file                 = ParsePath( file );
	constants.work_space = ParsePath( file.dir );
	const configs        = [await GetDefaultConfig()];
	const configs_dir    = [];
	const configs_paths  = [];

	await GetSuperiorConfig( file.dir , configs     );
	await GetProjectConfigs( file.path, configs_dir );
	await GetProjectConfigs( file.dir , configs_dir );

	configs_paths.push( ...configs    .map( v => v.path ) );
	configs_paths.push( ...configs_dir.map( v => v.path ) );

	for ( const environment of environments ) {
		if ( constants.config[`[${ environment }]`] ) {
			constants.config = CombineConfigs( constants.config, constants.config[`[${ environment }]`] );
		}
	}

	Init( constants.config, environments, configs_paths, !configs_dir.length );

	if ( show_log_configs ) {
		console.Cmd( 'cd[Configuraciones cargadas:]' );

		for ( const path of configs_paths )
			console.Cmd( `cd[fy[${path}]]` );
	}

	return constants.config;
}
// ####################################################################################################


/* Exportaciones */
module.exports = { LoadConfig, GetVersionPackage, GetPortDriver, GetIdProject, constants };
// ####################################################################################################