//                    Copyright meme.js Authors
//     Distributed under the Boost Software License, Version 1.1.
// (See accompanying file LICENSE or copy at https://mjs.red/LICENSE)


/* Importaciones */
const crt    = "-----BEGIN CERTIFICATE-----\nMIID5zCCAs+gAwIBAgIUfhinhFgpqmWQwG9IDJoPgEQ4YFswDQYJKoZIhvcNAQELBQAwgYIxCzAJBgNVBAYTAk1YMQ8wDQYDVQQIDAZNZXhpY28xDzANBgNVBAcMBk1leGljbzEQMA4GA1UECgwHbWVtZS5qczEQMA4GA1UECwwHbWVtZS5qczEQMA4GA1UEAwwHbWVtZS5qczEbMBkGCSqGSIb3DQEJARYMbWFpbkBtanMucmVkMB4XDTI0MDEyMjIwMjYzN1oXDTI1MDEyMTIwMjYzN1owgYIxCzAJBgNVBAYTAk1YMQ8wDQYDVQQIDAZNZXhpY28xDzANBgNVBAcMBk1leGljbzEQMA4GA1UECgwHbWVtZS5qczEQMA4GA1UECwwHbWVtZS5qczEQMA4GA1UEAwwHbWVtZS5qczEbMBkGCSqGSIb3DQEJARYMbWFpbkBtanMucmVkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA881B9hDHTSHyyJk/i0FQlsq97lmmuBtvh/LnpN7W9B6k0b57PM9ogePa5kE3E9iXDi533DWIuWdZ43grkGe5+thE1cZlpKp2pnOBGbzKKU1M0bS3n9as48wPRLB4qgl6y3kSJMPMHc/MmtC23W8xtZyPM3nzO7f7unGXYSECYyPBpUSmbL024cod1WfuKixD9Slm90rlgXKH89DhucLQtr/CRyNB0udgxWcpqtqMMyl4ElC2K0HKWWrKripTgLdNqeC1H+YL8ky2gL7TU6ZRsizcUB4qXA0SdGcHjGd1Efdm7C2zeDeRb5YRkCtHPpgq62XfCnKuTqxTaY/jV4BvrwIDAQABo1MwUTAdBgNVHQ4EFgQUS028TwiKkHWfWoDyn262HC4aB/wwHwYDVR0jBBgwFoAUS028TwiKkHWfWoDyn262HC4aB/wwDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAKMSfD0F7HcEvGA0fj92S7UqLStpViDNyWqpDeWok5rqGcIVNdPhDgBBFhAA54w8IJuZgJ2U+MkRdFD/CRzrT2HtLAI4u8bKfeYdM+YiLlTbzvaZJkGYKLzanfAQzzDaLFm5RywnIylfDNiZDsfGzVOyRqPpvVTsGOxbl+WGh9PGG6+R+vCuYXdRVgTZPa4WV1FaE4PUuDhXUxb3lL6cIyMDptbO26GuWpFvbbi98gtldJb9dgi/Ucq2Owj2hun7w/fCV35gcWjyWJwvwBy8ngq5fTetxDWtJgNIBLJJibulMf9mTfssF7PhnzKdEUBd7l6QuCGd9/0psBv/V4kI2aw==\n-----END CERTIFICATE-----";
const key    = "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDzzUH2EMdNIfLImT+LQVCWyr3uWaa4G2+H8uek3tb0HqTRvns8z2iB49rmQTcT2JcOLnfcNYi5Z1njeCuQZ7n62ETVxmWkqnamc4EZvMopTUzRtLef1qzjzA9EsHiqCXrLeRIkw8wdz8ya0LbdbzG1nI8zefM7t/u6cZdhIQJjI8GlRKZsvTbhyh3VZ+4qLEP1KWb3SuWBcofz0OG5wtC2v8JHI0HS52DFZymq2owzKXgSULYrQcpZasquKlOAt02p4LUf5gvyTLaAvtNTplGyLNxQHipcDRJ0ZweMZ3UR92bsLbN4N5FvlhGQK0c+mCrrZd8Kcq5OrFNpj+NXgG+vAgMBAAECggEARFm/y+IxVfUWEVoxf/OMSfJGJFwbCxOaBaW6frUA04kB0VHTUB2f4YaFeLdA3z4CP3YUoXaawcvxXf3zTLVf5S0bw0kvduZZhFnukE4m6URkLIi7UEMJzoWHpEzLT3R/6iqjxQ3lnFgFN0QbeGIzsARX+2kNoaj3mHI/K/pqpms0RzFPLschtsHq/0uPRoUs0p1dnTUTwhzOBU3UqiBx0pR4/H2QxmGX7Rh2R+6SA4gld3UMcqDTh61U5WvjxZ3tuR0LKP9GujfxEgbPiR6hxLxwdNFdioFuhvlHNjliGa9hOYuqM4wAbUYVVCGM2xoehorYEdEkqMAIxtUDbkb0WQKBgQD9V73OykWnpRMEmE63IfCkH5dJO6bWyy4Dql+VXtTKJq2oL6AsufjTYN0PBDEBEKAeo+RD1HxEMLs3Fczfq1mxoP5L7cK2VnypZx4tnM7uEzdzzeWhk2pd4MOT3BGf9fGfoxTpRiAAJPbD+Ylds1iftjWgivkZKFEpXfs+fdg4WQKBgQD2W+XDbGb1VWVZd6M+ChYx+0j6Yjcp6eqzukSbtjmXsllZE7Uj79hNx0q88DsuGiO8NWxNOcQX/WI4CYTRWjcPDxS4Nb9h0jK/0g/P0GgCaVWLRKjtfnoalROIwzotfHmMyAzGqurLOn6bjFLbIo4f7ztshEr2d5Vcyp7VFSVnRwKBgHHluJf3qEkuldZDA2CiCaY/7awm/WMkBZPwTPjCobggm4I5pzF0isG9kqTlpYJtDw+3bzBvn06o+gJR8sG8L58EWk+YnSmMyI8ApTisfvvZ99xAfTSfKfr6yfL3xZS85dx3XTdjJ4/pDmgdD/zoXLexG3sJ/+OnlJWcgxAdU9BBAoGAdBlo1Ujv2GxPH/Oera0JOrLGeKDyiEEhh2Of05Xz3EaDjtQXyIDOehESaqn36ckN0DOI/3farseNkwUBX7vZOLKNvCYwNARgQD/ZjcEUUxaa5tALoCi7mG1q0EfY0fjYO31HcBS6I95ELj/aCEVnnysZ4RETVsWSUTF32sllYB8CgYB0tmBYLv5+ZyNSJYTF2UCmgBw18wrn5IxhmOVzuhmLFdi6LoXp5KUYrxX7SFR7V4nyFeehxoDMkeZHvr1ejqMLezJD5BQmCxfzfi7tnriKZW/YYTcWIZL3ZT4Td8xUv71skXuSnmbAdN46LJCcCMc+GlFrmV4rxihVGTA/wqYqsQ==\n-----END PRIVATE KEY-----";
const fs     = require( 'node:fs'            );
const path   = require( 'node:path'          );
const http   = require( 'node:http'          );
const https  = require( 'node:https'         );
const http2  = require( 'node:http2'         );
const child  = require( 'node:child_process' );
const crypto = require( 'node:crypto'        );
const stream = require( 'node:stream'        );
// ####################################################################################################


/* Tipos */
/**
 * @typedef {( OPath ) => boolean|undefined} FPath - Funcion en donde se envia un objeto de tipo OPath
 */

/**
 * @typedef {object} OPath - Objeto path, para el manejo de archivos y directorios
 *
 * @property {string}                                                           root    - La raíz del sistema de archivos de la ruta.
 * @property {string}                                                           dir     - El directorio que contiene el archivo.
 * @property {string}                                                           base    - El nombre del archivo (con extensión).
 * @property {string}                                                           ext     - La extensión del archivo (sin el punto y en minusculas).
 * @property {string}                                                           name    - El nombre del archivo (sin extensión).
 * @property {string}                                                           path    - La ruta completa del archivo.
 * @property {'file'|'folder'|null}                                             type    - El tipo de archivo de la ruta, si existe ('file' para archivo, 'folder' para carpeta, null si no existe).
 * @property {string|Buffer}                                                    data    - Los datos leídos de la ruta, si se han leído.
 * @property {( is_text?:boolean                    ) => string|Buffer        } Read    - Una función que lee el contenido del archivo.
 * @property {( data:string|Buffer, options?:string ) => void                 } Write   - Una función que escribe datos en el archivo.
 * @property {( params:ParamsWatch  ) => ReturnWatch }                          Watch   - Una función que observa el archivo en busca de cambios.
 * @property {( params:ParamsTravel ) => OPath[]|false }                        Travel  - Una función que recorre el directorio de la ruta y ejecuta una función en cada archivo.
 * @property {(                                     ) => void                 } Delete  - Una función que borra el archivo.
 * @property {'rename'|'change'|'delete'}                                       [event] - Indica el tipo de cambio que ha ocurrido en el archivo o directorio observado.
 */

/**
 * @typedef {object} ParamsTravel - Opciones
 *
 * @property {string}   Path             - Ruta del directorio que se recorera
 * @property {FPath}    [call]           - Funcion que se ejecuta con cada archivo encontrado
 * @property {RegExp[]} [filter=[]]      - Un array de expresiones regulares que se utilizarán para filtrar los archivos y carpetas encontrados.
 * @property {RegExp[]} [ignore=[]]      - Un array de expresiones regulares que se utilizarán para excluir los archivos y carpetas encontrados.
 * @property {boolean}  [recursive=true] - Un valor booleano que indica si se debe recorrer de manera recursiva las subcarpetas de la carpeta proporcionada. El valor predeterminado es "true".
 * @property {boolean}  is_first         - Indicador de si es el primer llamado de la función recursiva.
 */

/**
 * @typedef {object} ParamsWatch
 *
 * @property {string}  path              - La ruta del archivo o carpeta que se desea observar.
 * @property {FPath}   [call]            - Una función de devolución de llamada que se ejecutará cuando se produzcan cambios en el archivo o carpeta observados.
 * @property {boolean} [recursive=true]  - Indica si la observación de cambios debe ser recursiva o no.
 * @property {boolean} [persistent=true] - Indica si la observación debe ser persistente después de un reinicio del sistema.
 * @property {string}  [encoding='utf8'] - La codificación a utilizar para los nombres de archivo en los eventos.
 */

/**
 * @typedef {object} ReturnWatch
 *
 * @property {OPath}        opath
 * @property {fs.FSWatcher} watcher
 */
// ####################################################################################################


/* Constantes */
/**
 * Numero incremental del hash
 *
 * @type {number}
 */
let _incremental = 0;
/**
 * Objeto que mapea caracteres base64 a sus respectivos valores enteros.
 *
 * @type {Object.<string, number>}
 */
const _char_to_integer = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='.split( '' ).reduce( ( r, v, i ) => { r[v] = i; return r }, {} );
/**
 * Objeto que mapea valores enteros a sus respectivos caracteres base64.
 *
 * @type {Object.<number, string>}
 */
const _integer_to_char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='.split( '' ).reduce( ( r, v, i ) => { r[i] = v; return r }, {} );
// ####################################################################################################


/* Funciones */
/**
 * Calcula el HMAC SHA256 de una cadena de datos usando una clave.
 *
 * @param {string} data - La cadena de datos a hashear.
 * @param {string} key  - La clave secreta a usar para el cálculo del HMAC.
 *
 * @returns {string} - El valor hash resultante como una cadena de texto en formato Base64 URL-safe.
 */
function HmacSHA256( data, key ) {
	return crypto
	.createHmac( 'sha256', key )
	.update    ( data          )
	.digest    ( 'base64'      )
	.replace   ( /=/g , ''     )
	.replace   ( /\+/g, '-'    )
	.replace   ( /\//g, '_'    )
}
/**
 * Comprueba si una ruta de archivo o carpeta existe en el sistema de archivos y devuelve información sobre la ruta si existe, o false si no existe.
 *
 * @param {string} path - La ruta de archivo o carpeta a comprobar.
 *
 * @returns {fs.Stats|false} Si la ruta existe en el sistema de archivos, la función devuelve información sobre la ruta. Si la ruta no existe en el sistema de archivos, la función devuelve false.
 */
function IsExist( path ) {
	try   { return fs.statSync( path ) }
	catch { return false               }
}
// ####################################################################################################


/* Metodos Generales */
/**
 * Devuelve una promesa que se resuelve después de un período de tiempo determinado.
 *
 * @param {number} [time=1000] - El tiempo de espera en milisegundos. Si no se proporciona este parámetro, se asume un valor predeterminado de 1000 milisegundos (1 segundo).
 *
 * @returns {Promise} - Una promesa que se resuelve después del tiempo de espera especificado.
 */
function Sleep( time=1000 ) {
	return new Promise( ( run ) => setTimeout( run, time ) );
}
/**
 * Devuelve el tipo de dato de una variable o valor.
 *
 * @param {*} type - La variable o valor cuyo tipo de dato se desea obtener.
 *
 * @returns {string} - El tipo de dato de la variable o valor en minúsculas, como una cadena de texto.
 */
function Typeof( type ) {
	return Object.prototype.toString.call( type ).slice( 8, -1 ).toLowerCase();
}
/**
 * Calcula y devuelve un valor hash para una cadena de entrada o un valor. Si no se proporciona una entrada, se utiliza la fecha actual y un contador interno como entrada.
 *
 * @param {*} [data] - La cadena de entrada o el valor para el que se desea calcular el valor hash. Si no se proporciona una entrada, se utiliza la fecha actual y un contador interno.
 *
 * @returns {number} - El valor hash calculado para la cadena de entrada o el valor proporcionado.
 */
function Hash( data ) {
	data   ??= ( new Date() ).toString() + ++_incremental;
	data     = String( data );
	let hash = 5381;
	let num  = data.length;

	while ( num )
		hash = ( hash * 33 ) ^ data.charCodeAt( --num );

	return hash >>> 0;
}
/**
 * Convierte una cadena de letras (como una columna de Excel) en su equivalente entero.
 *
 * @param {string} letters - La cadena de letras a convertir en su equivalente entero.
 *
 * @returns {number} - El equivalente entero de la cadena de letras, o 0 si no se proporciona una cadena válida.
 */
function ExcelToInt( letters ) {
	letters = typeof letters!=='string' ? '' : letters;
	letters = letters.toUpperCase();
	letters = letters.replace( /[^A-z]/gm, '' );

	if ( !letters ) return 0;

	result = 0;

	for ( let i = 0; i<letters.length; i++ ) {
		result*= 26;
		result+= letters.charCodeAt( i ) - 64;
	}

	return result;
}
/**
 * Convierte un número entero en su equivalente de letras (como una columna de Excel).
 *
 * @param {number} value - El número entero a convertir en su equivalente de letras.
 *
 * @returns {string} - El equivalente de letras del número entero proporcionado.
 */
function IntToExcel( value ) {
	let result = '';

	while ( value>0 ) {
		let module = ( value - 1 ) % 26;
		result     = String.fromCharCode( 65 + module ) + result;
		value      = Math.floor( ( value - module ) / 26 );
	}

	return result;
}
/**
 * Codifica un valor o una matriz de valores utilizando codificación de longitud variable (VLQ).
 *
 * @param {*} value - El valor o la matriz de valores que se van a codificar utilizando VLQ.
 *
 * @returns {string} - La cadena de texto codificada en VLQ.
 */
function VlqEncode( value ) {
	if ( Typeof( value )!=='array' ) value = [value];

	let res = '', cla;

	for ( let num of value ) {
		if ( num<0 ) num  = ( -num << 1 ) | 1;
		else         num<<= 1;

		do {
			cla   = num & 31;
			num>>>= 5;

			num>0 && ( cla|= 32 );

			res+= _integer_to_char[cla];
		}
		while ( num>0 );
	}

	return res;
}
/**
 * Decodifica una cadena de texto codificada utilizando codificación de longitud variable (VLQ) y devuelve los valores originales.
 *
 * @param {string} value - La cadena de texto codificada en VLQ que se va a decodificar.
 *
 * @returns {Array.<number>} - Un array de números que representan los valores originales decodificados de la cadena de texto codificada en VLQ.
 *
 * @throws {Error} - Si se encuentra un caracter no válido en la cadena de texto codificada en VLQ.
 */
function VlqDecode( value ) {
	const res = [];
	let shift = 0, val = 0, int;

	for ( const v of value ) {
		int = _char_to_integer[v];

		if ( int===undefined ) throw new Error( `Caracter invalido "${ v }"` );

		const has_continuation_bit = int & 32;

		int&= 31;
		val+= int << shift;

		if ( has_continuation_bit ) shift+= 5;
		else {
			const should_negate = val & 1;

			val>>>= 1;

			if ( should_negate ) res.push( val===0 ? -0x80000000 : -val );
			else                 res.push( val );

			val = shift = 0;
		}
	}

	return res;
}
/**
 * Abre una URL en el navegador predeterminado del sistema operativo.
 *
 * @param {string} url - La URL que se va a abrir en el navegador.
 */
function OpenLink( url ) {
	switch ( process.platform ) {
		case 'darwin': child.exec( `open ${url}`     ); break;
		case 'win32' : child.exec( `start ${url}`    ); break;
		default      : child.exec( `xdg-open ${url}` ); break;
	}
}
/**
 * Convierte una cadena de texto en formato de clase en una etiqueta HTML compatible.
 *
 * @param {string} value - La cadena de texto en formato de clase que se va a convertir en una etiqueta HTML compatible.
 *
 * @returns {string} - La cadena de texto en formato de etiqueta HTML compatible.
 */
function ClassToTag( value ) {
	if ( !value ) return '';

	const cad = String( value ).replace( /^([^a-z]+)/i, '' );
	let   res = '', pos = 0;

	for ( ;pos<cad.length; pos++ ) {
		switch ( true ) {
			case ( cad[pos]>='a' && cad[pos]<='z' ) || ( cad[pos]>='0' && cad[pos]<='9' ): res+= cad[pos]; break;
			case   cad[pos]>='A' && cad[pos]<='Z'                                        : res+= '-' + cad[pos].toLowerCase(); break;
			default                                                                      : res+= '-';
		}
	}

	while ( res[0]==='-' )
		res = res.slice( 1 );

	return res;
}
/**
 * Convierte una cadena de texto en formato de etiqueta HTML en una cadena de texto en formato de clase compatible.
 *
 * @param {string} value - La cadena de texto en formato de etiqueta HTML que se va a convertir en una cadena de texto en formato de clase compatible.
 *
 * @returns {string} - La cadena de texto en formato de clase compatible.
 */
function TagToClass( value ) {
	if ( !value ) return '';

	value       = value.toLowerCase();
	const regex = /\-/g;
	let   rex;

	while ( ( rex = regex.exec( value ) ) ) {
		value           = value.slice( 0, rex.index ) + ( value[rex.index + 1].toUpperCase() ) + value.slice( regex.lastIndex + 1 );
		regex.lastIndex = rex.index;
	}

	return value;
}
/**
 * Decodifica los datos recibidos a través de un socket y los convierte en una cadena de texto legible.
 *
 * @param {ArrayBuffer} data - Los datos recibidos a través del socket que se van a decodificar y convertir en una cadena de texto legible.
 *
 * @returns {string} - La cadena de texto legible resultante de la decodificación de los datos recibidos a través del socket.
 */
function DatToStrSocket( data ) {
	if ( !data ) return '';

	let buf = '';

	if ( data[1] & 0x80 ) {
		let mlen = data[1] & 0x7F;

		if ( mlen<126 ) {
			for ( let i = 0; i<mlen; i++ ) {
				buf+= String.fromCharCode( data[6 + i] ^ data[i % 4 + 2] );
			}
		}
		else if( mlen===126 ) {
			mlen = data[2] * 256 + data[3];

			for ( let i = 0; i<mlen; i++ ) {
				buf+= String.fromCharCode( data[8 + i] ^ data[i % 4 + 4] );
			}
		}
	}

	return decodeURIComponent( buf );
}
/**
 * Codifica una cadena de texto para enviarla a través de un socket.
 *
 * @param {string} data - La cadena de texto que se va a codificar y enviar a través del socket.
 *
 * @returns {Buffer} - Un Buffer que contiene los datos codificados listos para ser enviados a través del socket.
 */
function StrToDatSocket( data ) {
	data??= '';
	data  = encodeURIComponent( String( data ) );

	let length = Buffer.byteLength( data );
	let index  = 2 + ( length > 65535 ? 8 : ( length > 125 ? 2 : 0 ) );
	let buffer = new Buffer.alloc( index + length );

	buffer[0] = 129;

	if ( length>65535 ) {
		buffer[1] = 127;

		buffer.writeUInt32BE( 0     , 2 );
		buffer.writeUInt32BE( length, 6 );
	}
	else if ( length>125 ) {
		buffer[1] = 126;

		buffer.writeUInt16BE( length, 2 );
	}
	else buffer[1] = length;

	buffer.write( data, index );

	return buffer;
}
/**
 * Convierte una cadena en una expresión regular.
 *
 * @param {string} value - La cadena que se va a convertir en una expresión regular.
 *
 * @returns {RegExp} La expresión regular generada a partir de la cadena.
 */
function StrToRegExp( value ) {
	const flags   = value.replace( /.*\/([gimy]*)$/                , '$1' );
	const pattern = value.replace( new RegExp('^/(.*?)/'+flags+'$'), '$1' );

	return new RegExp( pattern, flags );
}
/**
 * Mata un proceso y todos sus procesos secundarios utilizando la señal SIGKILL.
 *
 * @param {number} pid - El identificador de proceso (PID) del proceso que se va a matar.
 *
 * @returns {Promise<void>} - Una promesa que se resuelve cuando se han matado todos los procesos.
 */
async function KillProcess( pid ) {
	if ( !pid ) return;

	const GetListPids = _pid => {
		return new Promise( run => {
			const pro = child.spawn( 'pgrep', ['-P', _pid] );
			let   lis = '';

			pro.stdout.on( 'data' , d => lis+= d.toString( 'ascii' ) );
			pro.stdout.on( 'close', async () => {
				lis = lis.split( '\n' ).map( v => parseInt( v ) || 0 ).filter( v => v );

				for ( const v of lis ) {
					const _l = await GetListPids( v );
					lis      = lis.concat( _l );
				}

				lis = lis.sort( ( a, b ) => a<b ? -1 : ( a>b ? 1 : 0 ) );

				run( lis );
			});
		});
	};

	const lis = await GetListPids( pid );

	lis.splice( 0, 0, pid );

	for ( const v of lis )
		process.kill( v, 'SIGKILL' );
}
// ####################################################################################################


/* Codificacion */
/**
 * Codifica los datos proporcionados en Base64 URL-safe.
 *
 * @param {string|Buffer} data - Los datos a codificar.
 *
 * @returns {string} - La cadena codificada en Base64 URL-safe.
 */
function EncodeBase64Url( data ) {
	data = Buffer
	.from    ( data       )
	.toString( 'base64'   )
	.replace ( /=/g , ''  )
	.replace ( /\+/g, '-' )
	.replace ( /\//g, '_' );

	return data.slice( 2 ) + data.slice( 0, 2 );
}
/**
 * Decodifica una cadena codificada en Base64 URL-safe.
 *
 * @param {string} data - La cadena codificada en Base64 URL-safe.
 *
 * @returns {string} - Los datos decodificados como una cadena de texto.
 */
function DecodeBase64Url( data ) {
	data = data.slice( -2 ) + data.slice( 0, -2 );

	let base64 = data
	.replace( /-/g, '+' )
	.replace( /_/g, '/' );

	while ( base64.length % 4 )
		base64+= '=';

	return Buffer
	.from    ( base64, 'base64' )
	.toString( 'utf8'           );
}
/**
 * Codifica un objeto de datos como un JWT (JSON Web Token) usando una clave secreta.
 *
 * @param {string} secret_key - La clave secreta para firmar el token JWT.
 * @param {Object} payload    - El objeto de datos a incluir en el JWT.
 *
 * @returns {string} - El token JWT generado.
 */
function EncodeJWT( secret_key, payload ) {
	const encodedHeader  = EncodeBase64Url( '{"alg":"HS256","typ":"JWT"}'                    );
	const encodedPayload = EncodeBase64Url( JSON.stringify( payload )                        );
	const signature      = HmacSHA256     ( `${encodedHeader}.${encodedPayload}`, secret_key );

	return `${encodedHeader}.${encodedPayload}.${signature}`;
}
/**
 * Decodifica un JSON Web Token (JWT) y devuelve el contenido del payload en formato JSON si la firma del token es válida.
 *
 * @param {string} secret_key - La clave secreta utilizada para calcular la firma interna del token.
 * @param {string} token      - El token en formato JSON Web Token (JWT) que se va a decodificar.
 *
 * @returns {object|false} Si la firma del token es válida y coincide con la firma interna calculada, la función devuelve el contenido del payload decodificado en formato JSON. Si la firma del token no es válida, la función devuelve false.
 */
function DecodeJWT( secret_key, token ) {
	try {
		let [header, payload, signature] = token.split( '.' );
		const internal_signature         = HmacSHA256( `${header}.${payload}`, secret_key );

		if ( internal_signature!==signature )
			return false;

		return JSON.parse( DecodeBase64Url( payload ) );
	}
	catch ( e ) {
		console.Error( e );
		return false;
	}
}
/**
 * Cifra los datos proporcionados utilizando la clave secreta especificada y devuelve un token cifrado en formato JSON Web Encryption (JWE).
 *
 * @param {string}     secret - La clave secreta utilizada para cifrar los datos.
 * @param {object|any} data   - El objeto o valor que se va a cifrar.
 *
 * @returns {string|false} Si los parámetros son válidos y la función se ejecuta correctamente, devuelve un token cifrado en formato JWE. Si la clave secreta o los datos no son válidos, la función imprime un mensaje de error y devuelve false.
 */
function EncodeJWE( secret, data ) {
	if ( !secret    ) { console.error( 'falta introducir un secreto' ); return false }
	if ( data==null ) { console.error( 'falta introducir los datos'  ); return false }

	data          = JSON.stringify( data );
	const key     = crypto.pbkdf2Sync( secret, 'salt', 100000, 32, 'sha256' );
	const iv      = crypto.randomBytes( 16 );
	const cipher  = crypto.createCipheriv( 'aes-256-cbc', Buffer.from( key ), iv );
	let encrypted = cipher.update( data );
	encrypted     = Buffer.concat( [ encrypted, cipher.final() ] );

	return EncodeBase64Url( iv.toString( 'hex' ) + ':' + encrypted.toString( 'hex' ) );
}
/**
 * Descifra los datos cifrados en el token proporcionado utilizando la clave secreta especificada y devuelve los datos descifrados.
 *
 * @param {string} secret - La clave secreta utilizada para descifrar los datos.
 * @param {string} data   - El token cifrado en formato JWE.
 *
 * @returns {object|false} Si los parámetros son válidos y la función se ejecuta correctamente, devuelve los datos descifrados. Si la clave secreta o el token cifrado no son válidos, la función devuelve false.
 */
function DecodeJWE( secret, data ) {
	if ( !secret                         ) { console.error( 'falta introducir un secreto' ); return false }
	if ( typeof data!=='string' || !data ) { console.error( 'falta introducir los datos'  ); return false }

	try {
		data            = DecodeBase64Url( data );
		const parts     = data.split( ':' );
		const key       = crypto.pbkdf2Sync( secret, 'salt', 100000, 32, 'sha256' );
		const iv        = Buffer.from( parts[0], 'hex' );
		const encrypted = Buffer.from( parts[1], 'hex' );
		const decipher  = crypto.createDecipheriv( 'aes-256-cbc', Buffer.from( key ), iv );
		let   decrypted = decipher.update( encrypted );
		decrypted       = Buffer.concat( [ decrypted, decipher.final() ] ).toString();

		return JSON.parse( decrypted );
	}
	catch {
		return false;
	}
}
// ####################################################################################################


/* Files */
/**
 * Devuelve un objeto que contiene información sobre una ruta de archivo.
 *
 * @param {...string} paths - Una lista de rutas a analizar. Las rutas pueden estar en cualquier formato aceptado por la función `path.resolve`.
 *
 * @returns {OPath} - Devuelve un objeto que contiene las propiedades de la ruta analizada y varios métodos para interactuar con ella.
 */
function ParsePath( ...paths ) {
	paths         = paths.map( path => path ? String( path ).replace( /~/g, process.env.HOME ) : '.' );
	let pat       = path.resolve( ...( paths.length===0 ? ['.'] : paths ) );
	let result    = path.parse( pat );
	let stat      = IsExist( pat );
	result.path   = pat;
	result.type   = stat ? ( stat.isFile() ? 'file' : ( stat.isDirectory() ? 'folder' : null ) ) : null;
	result.ext    = result.ext.toLowerCase();
	result.Read   = ( is_text=true       ) => result.data = FileRead( result.path, is_text );
	result.Write  = ( data, options      ) => { DirCreate( result.dir ); return FileWrite( result.path, data, options ) }
	result.Watch  = ( options, ...params ) => FileWatch( Object.assign( options || {}, { path:result.path } ), ...params );
	result.Delete = (                    ) => FileDelete( result.path );
	result.Travel = ( options            ) => DirTravel( Object.assign( options || {}, { path:result.path } ) );

	return result;
}

/**
 * Crea una carpeta en la ruta especificada si no existe.
 *
 * @param {string} path - La ruta de la carpeta que se desea crear.
 *
 * @returns {undefined} La función no tiene un valor de retorno definido.
 */
function DirCreate( path ) {
	if ( IsExist( path ) ) return;

	DirCreate( ParsePath( path ).dir );
	fs.mkdirSync( path, { recursive: true } );
}
/**
 * Recorre de manera recursiva la carpeta y sus subcarpetas, ejecutando la función proporcionada para cada archivo o carpeta encontrada.
 *
 * @param {ParamsTravel} options - La ruta de la carpeta a recorrer.
 *
 * @returns {OPath[]|false} - La funcion retorna un arreglo de OPaths o un valor false se se requiere que se termine el recorrido
 */
function DirTravel({ path, call=null, filter=[], ignore=[], recursive=true, is_first=true }) {
	if ( !IsExist( path )?.isDirectory?.() ) return [];

	const
	result = [];
	filter = filter.map( v => typeof v==='string' ? StrToRegExp( v ) : v );
	ignore = ignore.map( v => typeof v==='string' ? StrToRegExp( v ) : v );

	for ( const file of fs.readdirSync( path ) ) {
		if ( file==='.' || file==='..' ) continue;

		const e = ParsePath( path, file );
		const v = !filter.length || filter.some( regex => e.path.match( regex ) );
		const i =                   ignore.some( regex => e.path.match( regex ) );

		if ( i ) continue;

		if ( e.type==='folder' && recursive ) {
			const res = DirTravel({ path:e.path, call, filter, ignore, recursive, is_first:false });

			if ( res===false ) return is_first ? result : false;
			else               result.push( ...res );
		}
		else if ( v ) {
			if ( typeof call==='function' && call( e )===false )
				return is_first ? result : false;

			result.push( e );
		}
	}

	return result;
}
/**
 * Borra una carpeta si existe.
 *
 * @param {string}  path              - La ruta de la carpeta que se desea eliminar.
 * @param {boolean} [recursive=false] - Un valor booleano que indica si se debe eliminar de manera recursiva la carpeta y todos sus contenidos.
 *
 * @returns {boolean} Si se elimina la carpeta con éxito, la función devuelve true. Si no se elimina la carpeta o no existe, la función devuelve false.
 */
function DirDelete( path, recursive ) {
	try   { fs.rmSync( path, { recursive:!!recursive } ); return true  }
	catch {                                               return false }
}

/**
 * Lee el contenido de un archivo si existe.
 *
 * @param {string}  path           - La ruta del archivo que se desea leer.
 * @param {boolean} [is_text=true] - Un valor booleano que indica si se debe leer el contenido del archivo como una cadena de texto o como un buffer.
 *
 * @returns {string|null|BufferSource} Si se lee el archivo con éxito, la función devuelve el contenido del archivo como una cadena de texto o como un buffer. Si el archivo no existe, la función devuelve null.
 */
function FileRead( path, is_text=true ) {
	try   { return fs.readFileSync( path, is_text ? 'UTF8' : undefined ) }
	catch { return null                                                  }
}
/**
 * Escribe datos en un archivo si existe o crea el archivo si no existe.
 *
 * @param {string}              path             - La ruta del archivo que se desea escribir.
 * @param {string|BufferSource} data             - El valor que se desea escribir en el archivo.
 * @param {string}              [is_text='UTF8'] - Un valor opcional que indica el formato en que se desea escribir en el archivo.
 *
 * @returns {boolean} Si la escritura es exitosa, la función devuelve true. Si hay algún error durante la escritura, la función devuelve false.
 */
function FileWrite( path, data, is_text='UTF8' ) {
	try        { fs.writeFileSync( path, data, is_text ); return true }
	catch( e ) {
		( console.Error ?? console.error )( e.message );
		console.trace();

		return false;
	}
}
/**
 * Borra un archivo si existe.
 *
 * @param {string} path - La ruta del archivo que se desea eliminar.
 *
 * @returns {boolean} Si se elimina el archivo con éxito, la función devuelve true. Si no se elimina el archivo o no existe, la función devuelve false.
 */
function FileDelete( path ) {
	try   { fs.unlinkSync( path ); return true  }
	catch {                        return false }
}
/**
 * Observa cambios en un archivo o carpeta.
 *
 * @param {ParamsWatch} options
 * @param {...any}      params
 *
 * @returns {fs.FSWatcher|Array<fs.FSWatcher>|Promise<ReturnWatch>} Si la observación se establece con éxito, la función devuelve un objeto Watcher que se puede usar para detener la vigilancia.
 */
function FileWatch({ path, call, recursive=true, persistent=true, encoding='utf8' }, ...params ) {
	const ofile = ParsePath( path );

	if ( process.platform==='linux' ) {
		if ( ofile.type==='file'   ) return fs.watch( path, { persistent, encoding }, ( eventType, filename ) => { call({ ...ParsePath( path, filename ), eventType })} );
		if ( ofile.type==='folder' ) {
			const res = [];

			for ( const ofi of ofile.Travel() ) {
				res.push(
					FileWatch({ path:ofi.path, call, persistent, encoding })
				);
			}

			return { close: () => {
				for ( const watch of res ) {
					watch.close();
				}
			}};
		}
	}
	else if ( ofile.type==='file' ) return fs.watch( path, { recursive, persistent, encoding }, ( eventType, filename ) => { call({ ...ofile                      , eventType }, ...params ) });
	else                            return fs.watch( path, { recursive, persistent, encoding }, ( eventType, filename ) => { call({ ...ParsePath( path, filename ), eventType }, ...params ) });
}
// ####################################################################################################


/* HTTP */
/**
 * Devuelve el tipo MIME correspondiente a una extensión de archivo o cadena de tipo dada.
 *
 * @param {string} type - La extensión de archivo o cadena de tipo.
 *
 * @returns {string} - El tipo MIME correspondiente.
 */
function Mime( type ) {
	switch ( String( type ).toLowerCase() ) {
		case '.js'   : case 'js'   :
		case '.mj'   : case 'mj'   : return 'text/javascript; charset=utf-8';
		case '.json' : case 'json' : return 'application/json; charset=utf-8';
		case '.mc'   : case 'mc'   :
		case '.css'  : case 'css'  : return 'text/css; charset=utf-8';
		case '.ico'  : case 'ico'  : return 'image/x-icon';
		case '.jpg'  : case 'jpg'  :
		case '.jpeg' : case 'jpeg' : return 'image/jpeg';
		case '.png'  : case 'png'  : return 'image/png';
		case '.webp' : case 'webp' : return 'image/webp';
		case '.avif' : case 'avif' : return 'image/avif';
		case '.svg'  : case 'svg'  : return 'image/svg+xml';
		case 'string':
		case '.txt'  : case 'txt'  : return 'text/plain; charset=utf-8';
		case '.woff' : case 'woff' : return 'font/woff';
		case '.woff2': case 'woff2': return 'font/woff2';
		case '.pdf'  : case 'pdf'  : return 'application/pdf';
		case '.mh'   : case 'mh'   :
		case '.htm'  : case 'htm'  :
		case '.html' : case 'html' : return 'text/html; charset=utf-8';
		case 'buffer'              : return 'application/octet-stream';
		default                    : return 'text/txt; charset=utf-8';
	}
}
/**
 * Realiza una petición HTTP o HTTPS y devuelve una promesa con la respuesta.
 *
 * @param {string} url - La URL a la que se realizará la petición.
 * @param {Object} [props] - Las propiedades de la petición, como cabeceras y método.
 * @param {string} [props.method='GET'] - El método HTTP a utilizar en la petición (GET, POST, etc.).
 * @param {Object} [props.headers] - Un objeto con las cabeceras HTTP personalizadas para la petición.
 * @param {string|Object} [props.body] - El cuerpo de la petición. Puede ser una cadena o un objeto, que se convertirá a JSON.
 *
 * @returns {Promise} Una promesa que se resuelve con un objeto que contiene la respuesta, las cabeceras, el estado y el cuerpo de la petición.
 */
function Fetch( url, props ) {
	return new Promise( ( run, err ) => {
		props        ??= {};
		props.headers??= {};
		props.method ??= 'GET';
		url            = new URL( url );

		if ( typeof props.body==='object' ) {
			props.headers['content-type'] = 'application/json';
			props.body                    = JSON.stringify( props.body );
		}

		const options = {
			protocol: url.protocol,
			hostname: url.hostname,
			port    : parseInt( url.port ) || undefined,
			path    : url.pathname + url.search,
			method  : props.method,
			headers : Object.assign(
				{ 'content-type':'application/x-www-form-urlencoded', 'User-Agent':'.meme-sdk' },
				props.body ? { 'Content-Length':Buffer.byteLength( props.body ) } : null,
				props.headers,
			),
		};

		const request = ( options.protocol==='http:' ? http : https ).request( options, response => {
			let body = '';
			let strm = [];

			response.on( 'data', ( d ) => { body+= d; strm.push( d ) } );
			response.on( 'end' , (   ) => {
				if ( response.statusCode>199 && response.statusCode<300 ) {
					if      ( response.headers['content-type']?.match( /json/mgi         ) ) try { body = JSON.parse( body ) } catch( e ) { console.error( e ) }
					else if ( response.headers['content-type']?.match( /octet-stream/mgi ) ) body = Buffer.concat( strm );

					run({ response, headers:response.headers, status:response.statusCode, body, strm, ok:true });
				}
				else run({ response, headers:response.headers, status:response.statusCode, body, strm, ok:false, error:'error en la consulta' });
			})
		})

		request.on( 'error', err );
		request.write( props.body || '' );
		request.end();
	});
}
/**
 * Analiza los parámetros de una URL y los devuelve como un objeto.
 *
 * @param {string} url - La URL que contiene los parámetros.
 *
 * @returns {Object} - Un objeto que representa los parámetros analizados.
 */
function ParseParams( url ) {
	if ( url.indexOf( '?' )===-1 ) return {};

	return url
	.substring( url.indexOf( '?' ) + 1 )
	.split( '&' )
	.reduce( ( result, value ) => {
		let operation = value.split( '=' );

		if ( operation[0] && operation[1] && operation[0]!=='' && operation[1]!=='' )
			result[operation[0] || ''] = ( operation[1] || '' );

		return result;
	}, {} );
}
/**
 * Analiza los encabezados y los devuelve como un objeto.
 *
 * @param {Array<string>} headers - Un array de encabezados.
 *
 * @returns {Object} - Un objeto que representa los encabezados analizados.
 */
function ParseHeaders( headers ) {
	const result = {};
	const camelcase = string => {
		if ( string[0]===':' ) string = string.slice( 1 );

		string = string.replace( /^[A-z]/, string[0].toLowerCase() );

		const regex = /[^A-z]/g;
		let   rex, replace_string;

		while ( rex = regex.exec( string ) ) {
			replace_string = string.slice( 0, rex.index ) + ( string[rex.index + 1] && string[rex.index + 1].toUpperCase() || '' ) + string.slice( rex.index + 2 );

			if ( replace_string!==string )
				string = replace_string, regex.lastIndex = rex.index;
		}

		return string;
	};

	for ( let x = 0; x<headers.length; x+= 2 ) result[ camelcase( headers[x] ) ] = headers[x + 1];

	return result;
}
/**
 * Parsea las cookies de los encabezados HTTP y las devuelve en un objeto.
 *
 * @param {Object} headers - Los encabezados HTTP que contienen las cookies.
 * @param {string} headers.cookie - La cadena de cookies en los encabezados HTTP.
 * @returns {Object} Un objeto con los nombres de las cookies como claves y sus valores como valores.
 */
function ParseCookies( headers ) {
	const res = {};
	const coo = headers.cookie;

	if ( coo )
	for ( const cookie of coo.split( ';' ) ) {
		const parts = cookie.split( '=' );
		const name  = parts[0].replace( /^\s*/gm, '' );
		const value = parts[1];
		res[name]   = value;
	}

	return res;
}
/**
 * CustomReadableStream es una implementación personalizada de un flujo legible (Readable stream) de Node.js.
 * Proporciona un flujo de datos a partir de una entrada dada, fragmento por fragmento, con un tamaño especificado por fragmento.
 *
 * @extends Readable del módulo 'stream' en Node.js
 */
class CustomReadableStream extends stream.Readable {
	constructor( data, options ) {
		super( options );

		this.data         = data;
		this.currentIndex = 0;
	}

	_read( size ) {
		while ( true ) {
			const chunk       = this.data.slice( this.currentIndex, this.currentIndex + size );
			this.currentIndex+= size;

			if ( !chunk.length ) {
				this.push( null );
				break;
			}

			if ( !this.push( chunk ) ) break;
		}
	}
}
function FetchBigJSON( url, path, method, json ) {
	return new Promise( ( run ) => {
		const data    = JSON.stringify( json );
		const stream  = new CustomReadableStream( data );
		const client  = http2.connect( url, { ca:crt, checkServerIdentity:()=>undefined });
		const request = client.request({ ':method':method, ':path':path, 'Content-Type':'application/json' });

		stream .on( 'end'     , (         ) => { request.end  (       ) });
		stream .on( 'data'    , ( chunk   ) => { request.write( chunk ) });
		stream .on( 'error'   , ( error   ) => { console.Error( error ) });
		request.on( 'response', ( headers ) => {
			const abuffer = [];

			request.on( 'data', ( chunk ) => { abuffer.push( chunk ) });
			request.on( 'end' , (       ) => {
				const buffer = Buffer.concat( abuffer );
				let   json   = buffer.toString( 'utf-8' );

				try         { json=JSON.parse( json ) }
				catch ( e ) {
					console.Error( buffer.toString( 'utf-8' ) );
					console.Error( e.stack );

					json = null;
				}

				run( json );
				client.close();
			});
		});
	});
}
// ####################################################################################################


/* Exportacion */
module.exports = {
	crt,
	key,

	Sleep         ,
	Typeof        ,
	Hash          ,
	ExcelToInt    ,
	IntToExcel    ,
	VlqEncode     ,
	VlqDecode     ,
	OpenLink      ,
	ClassToTag    ,
	TagToClass    ,
	DatToStrSocket,
	StrToDatSocket,
	StrToRegExp   ,
	KillProcess   ,

	EncodeBase64Url,
	DecodeBase64Url,
	EncodeJWT      ,
	DecodeJWT      ,
	EncodeJWE      ,
	DecodeJWE      ,

	ParsePath ,
	DirCreate ,
	DirTravel ,
	DirDelete ,
	FileRead  ,
	FileWrite ,
	FileDelete,
	FileWatch ,

	Mime                ,
	Fetch               ,
	FetchBigJSON        ,
	ParseParams         ,
	ParseHeaders        ,
	ParseCookies        ,
	CustomReadableStream,
};
// ####################################################################################################