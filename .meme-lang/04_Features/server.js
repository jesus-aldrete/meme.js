/* Importaciones */
const lib                        = require( '../03_Libs/lib.js' );
const vsc_language               = require( 'vscode-languageserver' );
const vsc_language_text_document = require( 'vscode-languageserver-textdocument' );

/* Variables */
let   has_configuration_capability    = false;
let   has_workspace_folder_capability = false;
const documents                       = new vsc_language.TextDocuments( vsc_language_text_document.TextDocument );
const connection                      = vsc_language.createConnection( vsc_language.ProposedFeatures.all );

/* Funciones - Eventos */
function onInitialize( params ) {
	const capabilities                            = params.capabilities;
	has_workspace_folder_capability               = !!( capabilities.workspace     && !!capabilities.workspace   .workspaceFolders                                                                      );
	has_configuration_capability                  = !!( capabilities.workspace     && !!capabilities.workspace   .configuration                                                                         );
	has_diagnostic_related_information_capability = !!( capabilities.text_document &&   capabilities.textDocument.publishDiagnostics && capabilities.textDocument.publishDiagnostics.relatedInformation );
	const result                                  = {
		capabilities: {
			textDocumentSync  : vsc_language.TextDocumentSyncKind.Full,
			completionProvider: {},
		}
	};

	if ( has_workspace_folder_capability )
		result.capabilities.workspace = { workspaceFolders:{ supported: true } };

	return result;
}
function onInitialized() {
	has_configuration_capability    && connection.client   .register                   ( vsc_language.DidChangeConfigurationNotification.type                        );
	has_workspace_folder_capability && connection.workspace.onDidChangeWorkspaceFolders( ()=>{ connection.console.log( 'Workspace folder change event received.' ) } );
}

/* Eventos */
connection.onInitialize ( onInitialize  );
connection.onInitialized( onInitialized );
connection.onCompletion ( async ( document_position, token, context ) => lib.Completion( documents, document_position, token, context ) );

documents .listen( connection );
connection.listen(            );
