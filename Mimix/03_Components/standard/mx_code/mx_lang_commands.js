/* Funciones */
function DefinitionMemeCommands() {
	const
		ctxCommand       = 1,
		ctxString        = 2,
		ctxSubCommand    = 3,
		ctxSubSubCommand = 4;

	return {
		startState: (               )=>({ ctx:[ctxCommand] }),
		token     : ( stream, state )=>{
			const { string:cad, pos } = stream;

			stream.next();

			if ( state.escape ) {
				state.escape = undefined;
				return 'escape';
			}

			if ( cad[pos]==='\\' ) {
				state.escape = true;
				return 'escape';
			}

			switch ( state.ctx.at( -1 ) ) {
				case ctxString:
					switch ( cad[pos] ) {
						case state.end_string:
							state.ctx.pop();
						return 'string_point';
					}
				return 'string';

				case ctxCommand:
					switch ( cad[pos] ) {
						case ' ':
							state.ctx.push( ctxSubCommand );
						return null;
					}
				return 'ctxCommand';
				case ctxSubCommand:
					switch ( cad[pos] ) {
						case ' ':
							state.ctx.pop();
							state.ctx.push( ctxSubSubCommand );
						return null;

						case '"':
						case "'":
							state.end_string = cad[pos];
							state.ctx.push( ctxString );
						return 'string_point';
					}
				return 'ctxSubCommand';
				case ctxSubSubCommand:
					switch ( cad[pos] ) {
						case '"':
						case "'":
							state.end_string = cad[pos];
							state.ctx.push( ctxString );
						return 'string_point';
					}
				return 'ctxSubSubCommand';
			}

			return null;
		},
	};
}
function ModelMemeCommands( CodeMirror ) {
	CodeMirror.defineMode( 'meme-commands'      , DefinitionMemeCommands );
	CodeMirror.defineMIME( 'text/x-memecommands', 'meme-commands'        );
}
// ####################################################################################################


/* Inicio */
function Inicio() {
	if ( typeof define=='function' && define.amd ) define( ['./codemirror'], ModelMemeCommands );
	else ModelMemeCommands(
		typeof exports==='object' && typeof module==='object'
		?
			require( './codemirror' )
		:
			CodeMirror
	);
};Inicio();
// ####################################################################################################