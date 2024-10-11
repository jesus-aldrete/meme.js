#! /usr/bin/env node
process.title = 'meme.js WATCHER';
// ####################################################################################################


//                    Copyright meme.js Authors
//     Distributed under the Boost Software License, Version 1.1.
// (See accompanying file LICENSE or copy at https://mjs.red/LICENSE)


/* Importaciones */
const child_process              = require( 'node:child_process' );
const { ConfigureLog }           = require( '../02_Libs/log'     );
const { ParsePath, KillProcess } = require( '../02_Libs/lib'     );
// ####################################################################################################


/* Declaraciones */
let   exec     = '', params, procs, in_watchin;
const defaults = [];
const watch    = [];
const ignore   = [];
const filter   = [];
const commads  = process.argv.slice( 2 );
// ####################################################################################################


/* Funciones */
function Reset( pid ) {
	KillProcess( pid )
	.catch( e => {
		if ( e?.errno!==-3 )
			console.Error( 'Reset:', e )
	})
	.finally( () => {
		console.info()
		console.Cmd( 'fr[// ####################################################################################################]' )
		ExecW()
	})
}
function Default() {
	defaults.push( ParsePath( __dirname, '..', '02_Libs'     ).path );
	defaults.push( ParsePath( __dirname, '..', '03_Execs'    ).path );
	defaults.push( ParsePath( __dirname, '..', '04_Defaults' ).path );
}
function ExecW() {
	let tem;

	watch .length = 0;
	ignore.length = 0;
	filter.length = 0;

	for ( let i = 0; i<commads.length; i++ ) {
		switch ( commads[i] ) {
			case '-w': watch.push( commads[++i] ); break;

			case '-x':
				exec   = commads[++i].split( ' ' );
				params = exec.slice( 1 );
				exec   = exec[0];
			break;

			case '-i':
				tem = commads[++i];

				try { tem = JSON.parse( tem ) } catch { tem = [] };

				ignore.push( tem );
			break;

			case '-f':
				tem = commads[++i];

				try { tem = JSON.parse( tem ) } catch { tem = [] }

				filter.push( tem );
			break;

			case '-a':
				commads.slice( i + 1 ).forEach( v => params.push( v ) );

				i = commads.length;
			break;
		}
	}

	tem = JSON.stringify( params ).replace( /\[/gm, '\\[' ).replace( /\]/gm, '\\]' );

	ConfigureLog( 'fc[\\[watcher\\]]' );
	console.Cmd( `cd[fc[\\[watcher\\]]] cd[fy[comando a ejecutar]]: fg[${exec}] cd[fm[${tem}]]` );
	console.Cmd( `cd[fc[\\[watcher\\]]] cd[fy[ignorados]]: ${JSON.stringify( ignore ).replace( /\[/g, '\\[' ).replace( /\]/g, '\\]' )}` );
	console.Cmd( `cd[fc[\\[watcher\\]]] cd[fy[filtros]]: ${  JSON.stringify( filter ).replace( /\[/g, '\\[' ).replace( /\]/g, '\\]' )}` );
	console.Cmd( `cd[fc[\\[watcher\\]]] cd[fy[watching path(s)]]:` );
	console.info( [].concat( watch, defaults ) );
	console.Cmd( 'fg[// ####################################################################################################]' );

	if ( !filter.length )
		filter.push( ['\\.(js|json)$', 'gmi'] );

	procs = child_process.fork( exec, params, { stdio:'inherit' } );
}
function Watch() {
	if ( in_watchin ) return;

	in_watchin = true;

	for ( const folder of [].concat( watch, defaults ) ) {
		let   time;
		const ofolder = ParsePath( folder );

		ofolder.Watch({
			call: ( file ) => {
				clearTimeout( time );

				time = setTimeout( ()=>{
					const is_filter = filter.some( regex => regex.length && file.path.match( new RegExp( ...regex ) ) );
					const is_ignore = ignore.some( regex => regex.length && file.path.match( new RegExp( ...regex ) ) );

					if ( is_ignore ) return;
					if ( is_filter ) Reset( procs.pid );
				}, 100 );
			},
		});
	}
}
// ####################################################################################################


/* Inicio */
Default();
ExecW();
Watch();
// ####################################################################################################