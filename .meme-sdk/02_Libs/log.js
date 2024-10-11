//                    Copyright meme.js Authors
//     Distributed under the Boost Software License, Version 1.1.
// (See accompanying file LICENSE or copy at https://mjs.red/LICENSE)


/* Declaraciones */
/**
 * Objeto que mapea códigos de escape ANSI a sus respectivos valores.
 * @type {Object.<string, string>}
 */
const _ansi_escape_codes = {
	'cb': '\x1b[1m' ,
	'cd': '\x1b[2m' ,
	'cu': '\x1b[4m' ,
	'cl': '\x1b[5m' ,
	'cv': '\x1b[7m' ,
	'ch': '\x1b[8m' ,
	'f0': '\x1b[30m',
	'fr': '\x1b[31m',
	'fg': '\x1b[32m',
	'fy': '\x1b[33m',
	'fb': '\x1b[34m',
	'fm': '\x1b[35m',
	'fc': '\x1b[36m',
	'fw': '\x1b[37m',
	'b0': '\x1b[40m',
	'br': '\x1b[41m',
	'bg': '\x1b[42m',
	'by': '\x1b[43m',
	'bb': '\x1b[44m',
	'bm': '\x1b[45m',
	'bc': '\x1b[46m',
	'bw': '\x1b[47m',
};
// ####################################################################################################


/* Funciones */
/**
 * Imprime un mensaje con formato personalizado en la consola.
 *
 * @param {string} type   - Tipo de mensaje que se imprimirá.
 * @param {string} color  - Código de color ANSI que se utilizará para imprimir el mensaje.
 * @param {...any} params - Los parámetros que se imprimirán junto con el mensaje.
 */
function Log( type, color, ...params ) {
	const cad = (
		'cd[' +
			( console._title ?? '' ) +
			'\\[' + process.pid + '\\]' +
			'\\[' + ( new Date() ).toISOString().replace( /T/, ' ' ).replace( /\..+/, '' ) + '\\]' +
			color + '[' +
				'\\[' + type + '\\]' +
			']' +
		']' +
		'cd[:] '
	);

	if ( params.length===1 ) console.info( Cmd( cad, params[0] ) );
	else {
		console.info( Cmd( cad       ) );
		console.info( Cmd( ...params ) );
	}
}
// ####################################################################################################


/* Metodos */
/**
 * Construye una cadena de salida formateada con códigos de escape ANSI.
 *
 * @param {...string|boolean} params - Uno o más parámetros de entrada que se van a formatear en la cadena de salida.
 * El último parámetro opcional puede ser un valor booleano que indique si se deben agregar códigos de escape adicionales para restablecer los colores o estilos a su valor predeterminado.
 *
 * @returns {string} - Una cadena de salida formateada con códigos de escape ANSI.
 */
function Cmd( ...params ) {
	let clear = false;

	if ( typeof params.at( -1 )==='boolean' ) {
		clear = params.at( -1 );

		params.pop();
	}

	const cad = params.join( '' );
	let   pos = 0, res = '', ope = [], tem;

	for ( ;pos<cad.length; pos++ ) {
		switch ( cad[pos] ) {
			case '\\': res+= cad[++pos]; break;

			case 'b': case 'f': case 'c':
				if ( cad[pos+2]==='[' ) {
					tem = cad[pos] + cad[pos+1];

					if ( tem in _ansi_escape_codes ) {
						ope.push( _ansi_escape_codes[tem] );

						pos+= 2;

						if ( !clear ) res+= _ansi_escape_codes[tem];
					}
					else res+= cad[pos];
				}
				else res+= cad[pos];
			break

			case ']':
				if ( ope.length ) ope.pop(), res+= clear ? '' : ( '\x1b[0m' + ope.join( '' ) );
				else              res+= cad[pos];
			break;

			default: res+= cad[pos];
		}
	}

	return res;
}
/**
 * Configura la consola con un titulo y una configuración específicos.
 *
 * @param {string} title  - El titulo del registro de la consola.
 * @param {object} config - La configuración para el registro de la consola.
 */
function ConfigureLog( title, config, replace=true ) {
	if ( !replace && console._title ) return;

	console._title  = title;
	console._config = config;
}
/**
 * Configura la consola con un titulo específico.
 *
 * @param {string} title  - El titulo del registro de la consola.
 */
function ConfigureTitle( title, replace=true ) {
	if ( !replace && console._title ) return;

	console._title = title;
}
/**
 * Configura la consola con una configuración específica.
 *
 * @param {object} config - La configuración para el registro de la consola.
 */
function ConfigureConfig( config ) {
	console._config = config;
}
/**
 * Genera un mensaje de registro para un proceso de servidor.
 *
 * @param {Object}  options                   - Un objeto que contiene opciones para personalizar el mensaje.
 * @param {string}  [options.name='']         - El nombre del proceso.
 * @param {boolean} [options.start=true]      - Indica si el proceso se está iniciando o ya se ha iniciado.
 * @param {boolean} [options.is_error=false]  - Indica si se produjo un error al iniciar el proceso.
 * @param {number}  [options.pid=process.pid] - El identificador de proceso (PID) del proceso.
 * @param {string}  [options.protocol='http'] - El protocolo que se está utilizando (por ejemplo, "http" o "https").
 * @param {string}  [options.host='0.0.0.0']  - El host en el que se está ejecutando el servidor.
 * @param {number}  [options.port=0]          - El número de puerto en el que se está ejecutando el servidor.
 *
 * @returns {string} - El mensaje de registro generado.
 */
function MesageProc({ name='', start=true, is_error=false, pid=process.pid, protocol='http', host='0.0.0.0', port=0 }) {
	const col = name==='res' ? 'fb' : ( name==='api' ? 'fm' : 'fg' );
	const spr = name.toUpperCase();
	const hor = ( new Date() ).toISOString().replace( /T/, ' ' ).replace( /\..+/, '' );

	return (
		start ?
			(
				is_error ?
					`\ncd[${col}[[${spr}\\]][${pid}\\][${hor}\\]fg[[INFO\\]]:] servidor ${col}["${spr}"] fr[error al iniciar]`
					:
					`\ncd[${col}[[${spr}\\]][${pid}\\][${hor}\\]fg[[INFO\\]]:] servidor ${col}["${spr}"] fy[conectado] cd[(p: ${protocol}, u: ${port}, w: ]fy[${protocol}://${host}:${port}]cd[)]`
			)
			:
			`\ncd[${col}[[${spr}\\]][${process.pid}\\][${hor}\\]fg[[INFO\\]]:] servidor ${col}["${spr}"] fr[no iniciado]`
	);
}
// ####################################################################################################


/*/ ***** Extenciones de Log ***** /*/
if ( !console.Cmd       ) Object.defineProperty( global.console, 'Cmd'      , { enumerable:false, value:function( ...params ) { console.info( Cmd( ...params )    ) } } );
if ( !console.Add       ) Object.defineProperty( global.console, 'Add'      , { enumerable:false, value:function( ...params ) { Log( 'ADD'      , 'fg', ...params ) } } );
if ( !console.Info      ) Object.defineProperty( global.console, 'Info'     , { enumerable:false, value:function( ...params ) { Log( 'INFO'     , 'fg', ...params ) } } );
if ( !console.Build     ) Object.defineProperty( global.console, 'Build'    , { enumerable:false, value:function( ...params ) { Log( 'BUILD'    , 'fg', ...params ) } } );
if ( !console.Load      ) Object.defineProperty( global.console, 'Load'     , { enumerable:false, value:function( ...params ) { Log( 'LOAD'     , 'fg', ...params ) } } );
if ( !console.Loaded    ) Object.defineProperty( global.console, 'Loaded'   , { enumerable:false, value:function( ...params ) { Log( 'LOADED'   , 'fb', ...params ) } } );
if ( !console.Write     ) Object.defineProperty( global.console, 'Write'    , { enumerable:false, value:function( ...params ) { Log( 'WRITE'    , 'fm', ...params ) } } );
if ( !console.Modified  ) Object.defineProperty( global.console, 'Modified' , { enumerable:false, value:function( ...params ) { Log( 'MODIFIED' , 'fb', ...params ) } } );
if ( !console.Error     ) Object.defineProperty( global.console, 'Error'    , { enumerable:false, value:function( ...params ) { Log( 'ERROR'    , 'fr', ...params ) } } );
if ( !console.Warning   ) Object.defineProperty( global.console, 'Warning'  , { enumerable:false, value:function( ...params ) { Log( 'WARNING'  , 'fy', ...params ) } } );
if ( !console.Delete    ) Object.defineProperty( global.console, 'Delete'   , { enumerable:false, value:function( ...params ) { Log( 'DELETE'   , 'fr', ...params ) } } );
if ( !console.Terminate ) Object.defineProperty( global.console, 'Terminate', { enumerable:false, value:function( ...params ) { Log( 'TERMINATE', 'fr', ...params ) } } );

if ( !console.Petition ) Object.defineProperty( global.console, 'Petition', { enumerable:false, value:function( ...params ) {
	setTimeout( () => {
		if ( !( console._config?.log?.request ?? true ) ) return;

		let cad = `cd[[${ console._title ? ( console._title + ':' ) : '' }PID:${ process.pid }\\][${ ( new Date() ).toISOString().replace(/T/, ' ').replace(/\..+/, '') }\\]fb[[PETITION\\]]]`;

		switch ( params[0] ) {
			case 'GET'    : cad+= ` f0[bm[GET]]:`           ; params.shift(); break;
			case 'POST'   : cad+= ` f0[bg[POST]]:`          ; params.shift(); break;
			case 'PUT'    : cad+= ` f0[by[PUT]]:`           ; params.shift(); break;
			case 'PATCH'  : cad+= ` f0[by[PATCH]]:`         ; params.shift(); break;
			case 'DELETE' : cad+= ` f0[br[DELETE]]:`        ; params.shift(); break;
			case 'OPTIONS': cad+= ` f0[bb[OPTIONS]]:`       ; params.shift(); break;
			case 'HEAD'   : cad+= ` f0[bb[HEAD]]:`          ; params.shift(); break;
			default       : cad+= ` f0[bw[${ params[0] }]]:`; params.shift(); break;
		}

		if ( params.length===1 ) {
			if ( typeof params[0]==='string' ) console.Cmd( cad + ' ' + params[0] );
			else                               console.Cmd( cad, params[0] );
		}
		else {
			console.Cmd( cad );
			console.Cmd( ...params );
		}
	}, 0 );
}});
if ( !console.Response ) Object.defineProperty( global.console, 'Response', { enumerable:false, value:function( ...params ) {
	if ( !( console._config?.log?.response ?? true ) ) return;

	let cad = `cd[[${ console._title ? ( console._title + ':' ) : '' }PID:${ process.pid }\\][${ ( new Date() ).toISOString().replace(/T/, ' ').replace(/\..+/, '') }\\]fb[[RESPONSE\\]]]`;

	if ( typeof params[0]==='number' ) {
		if      ( params[0]>199 && params[0]<300 ) cad+= ` f0[bg[${ params[0] }]]:`;
		else if ( params[0]>299 && params[0]<400 ) cad+= ` f0[bm[${ params[0] }]]:`;
		else if ( params[0]>399 && params[0]<500 ) cad+= ` f0[by[${ params[0] }]]:`;
		else if ( params[0]>499                  ) cad+= ` f0[br[${ params[0] }]]:`;
		else                                       cad+= ` f0[bw[${ params[0] }]]:`;

		params.shift();
	}
	else cad+= ':';

	if ( params.length===1 ) {
		if ( typeof params[0]==='string' ) console.Cmd( cad + ' ' + params[0] );
		else                               console.Cmd( cad, params[0] );
	}
	else {
		console.Cmd( cad );
		console.Cmd( ...params );
	}
}});
// ####################################################################################################


/* Exportaciones */
module.exports = { Cmd, ConfigureLog, ConfigureTitle, ConfigureConfig, MesageProc };
// ####################################################################################################