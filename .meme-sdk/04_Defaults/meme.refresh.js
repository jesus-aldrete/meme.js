//                    Copyright meme.js Authors
//     Distributed under the Boost Software License, Version 1.1.
// (See accompanying file LICENSE or copy at https://mjs.red/LICENSE)


/* Declaraciones */
let   event_source   ;
let   is_refresh     = false;
let   count_error    = 20;
const retry_interval = 500;

/* Inicio */
function Inicio() {
	event_source = new EventSource('[[APP]]/meme-refresh');

	event_source.onmessage = ( event ) => {
		if ( event.data!=='connected' || count_error!=20 ) {
			is_refresh = true;

			location.reload();
		}
	};

	event_source.onerror = () => {
		if ( is_refresh ) return;

		console.error( 'meme refresher desconectado' );

		event_source.close();

		if ( count_error--<1 ) return;

		setTimeout( Inicio, retry_interval );
	};
};Inicio();
// ###################################################################################################