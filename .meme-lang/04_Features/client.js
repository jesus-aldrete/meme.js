/* Importaciones */
const lib          = require( '../03_Libs/lib.js' );
const vsc          = require( 'vscode' );
const vsc_language = require( 'vscode-languageclient' );

/* Declaracioens */
let client;

/* CONFUGURACION */
vsc.languages.setLanguageConfiguration( 'meme-js'  , { wordPattern: /(\@)?(([A-z0-9]|\.|\-)+)/g, indentationRules: { increaseIndentPattern: /(^.*\{[^}]*$)/, decreaseIndentPattern: /^\s*\}/ } } );
vsc.languages.setLanguageConfiguration( 'meme-css' , { wordPattern: /(\@)?(([A-z0-9]|\.|\-)+)/g, indentationRules: { increaseIndentPattern: /(^.*\{[^}]*$)/, decreaseIndentPattern: /^\s*\}/ } } );
vsc.languages.setLanguageConfiguration( 'meme-html', { wordPattern: /(\@)?(([A-z0-9]|\.|\-)+)/g, indentationRules: { increaseIndentPattern: /(^.*\{[^}]*$)/, decreaseIndentPattern: /^\s*\}/ } } );

exports.activate = function ( context ) {
	const serverModule  = context.asAbsolutePath( './04_Features/server.js' );
	const debugOptions  = { execArgv: [ '--nolazy', '--inspect=4101' ] };
	const serverOptions = {
		run  : { module: serverModule, transport: vsc_language.TransportKind.ipc },
		debug: {
			module   : serverModule,
			options  : debugOptions,
			transport: vsc_language.TransportKind.ipc,
		},
	};
	const clientOptions = {
		documentSelector: [ 'meme-js', 'meme-html', 'meme-css' ],
		synchronize     : { configurationSection:[ 'meme-js', 'meme-html', 'meme-css' ] },
	};

	vsc.languages.registerFoldingRangeProvider( { scheme:'file', language:'meme-js'   }, { provideFoldingRanges:lib.FoldingJS  } );
	vsc.languages.registerFoldingRangeProvider( { scheme:'file', language:'meme-html' }, { provideFoldingRanges:lib.FoldingHTM } );
	vsc.languages.registerFoldingRangeProvider( { scheme:'file', language:'meme-css'  }, { provideFoldingRanges:lib.FoldingCSS } );

	client = new vsc_language.LanguageClient( 'languageServerMemeJS', 'Language Server meme_js', serverOptions, clientOptions );

	client.start();
};

exports.deactivate = function () {
	if ( !client ) return undefined;

	return client.stop();
};
