/* Importaciones */
const data         = require( '../01_Resources/data/server_data.json' );
const vsc_language = require( 'vscode-languageserver'                 );
// ###################################################################################################


/* Declaracione */
const
	cxCss     = 1,
	cxHtm     = 2,
	cxJs      = 3,
	cxBuild   = 4,
	cxRequest = 5;
// ###################################################################################################


/* Is */
function IsSpaces( cad, pos ) {
	switch ( cad[pos] ) {
		case '\n':
		case '\r':
		case '\t':
		case ' ' : return true;
		default  : return false;
	}
}
function IsSpacesLine( cad, pos ) {
	switch ( cad[pos] ) {
		case '\n':
		case '\r': return true;
		default  : return false;
	}
}
function IsSpacesTabs( cad, pos ) {
	return (
		cad[pos]==='\t' ||
		cad[pos]===' '
	);
}
function IsLetter( cad, pos ) {
	return (
		( cad[pos]>='a' && cad[pos]<='z' ) ||
		( cad[pos]>='A' && cad[pos]<='Z' )
	);
}
function IsNumber( cad, pos ) {
	return (
		cad[pos]>='0' &&
		cad[pos]<='9'
	);
}
function IsValidLetter( cad, pos ) {
	return (
		cad[pos]==='-'       ||
		cad[pos]==='_'       ||
		IsLetter( cad, pos ) ||
		IsNumber( cad, pos )
	);
}
function IsSpecial( cad, pos ) {
	return (
		cad[pos]==='(' ||
		cad[pos]===')' ||
		cad[pos]==='[' ||
		cad[pos]===']' ||
		cad[pos]==='{' ||
		cad[pos]==='}' ||
		cad[pos]==='<' ||
		cad[pos]==='>' ||
		cad[pos]==='=' ||
		cad[pos]==='.' ||
		cad[pos]===':' ||
		cad[pos]===';' ||
		cad[pos]===',' ||
		cad[pos]==='-' ||
		cad[pos]==='+' ||
		cad[pos]==='*' ||
		cad[pos]==='/' ||
		cad[pos]==='%' ||
		cad[pos]==='?' ||
		cad[pos]==='#' ||
		cad[pos]==='&' ||
		cad[pos]==='!' ||
		cad[pos]==='|' ||
		cad[pos]==='@' ||
		cad[pos]==='"' ||
		cad[pos]==='\''||
		cad[pos]==='\n'||
		cad[pos]==='\r'||
		cad[pos]==='\t'||
		cad[pos]===' '
	);
}
function IsComment( cad, pos ) {
	return (
		( cad[pos]==='/' && cad[pos + 1]==='*' ) ||
		( cad[pos]==='/' && cad[pos + 1]==='/' ) ||
		( cad[pos]==='<' && cad[pos + 1]==='!' && cad[pos + 2]==='-' && cad[pos + 3]==='-' )
	);
}
function IsOperator( cad, pos ) {
	switch ( cad[pos] ) {
		case '<':
		case '>':
		case '=':
		case '-':
		case '+':
		case '*':
		case '/':
		case '%':
		case '!':
		case '?': return true;
		default : return false;
	}
}
function IsScript( cad, pos, ctx ) {
	return (
		cad[pos]==='{' &&
		(
			cad[pos + 1]==='r' &&
			cad[pos + 2]==='e' &&
			cad[pos + 3]==='q' &&
			cad[pos + 4]==='u' &&
			cad[pos + 5]==='e' &&
			cad[pos + 6]==='s' &&
			cad[pos + 7]==='t' &&
			( ( pos + 8 )>=cad.length || IsSpecial( cad, pos + 8 ) ) &&
			( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) ) &&
			cxRequest
		) ||
		(
			cad[pos + 1]==='b' &&
			cad[pos + 2]==='u' &&
			cad[pos + 3]==='i' &&
			cad[pos + 4]==='l' &&
			cad[pos + 5]==='d' &&
			( ( pos + 6 )>=cad.length || IsSpecial( cad, pos + 6 ) ) &&
			( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) ) &&
			cxBuild
		) ||
		(
			cad[pos + 1]==='m' &&
			cad[pos + 2]==='h' &&
			( ( pos + 3 )>=cad.length || IsSpecial( cad, pos + 3 ) ) &&
			( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) ) &&
			cxHtm
		) ||
		(
			cad[pos + 1]==='m' &&
			cad[pos + 2]==='c' &&
			( ( pos + 3 )>=cad.length || IsSpecial( cad, pos + 3 ) ) &&
			( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) ) &&
			cxCss
		) ||
		(
			cad[pos + 1]==='m' &&
			cad[pos + 2]==='j' &&
			( ( pos + 3 )>=cad.length || IsSpecial( cad, pos + 3 ) ) &&
			( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) ) &&
			cxJs
		) ||
		(
			( ctx===cxHtm || ctx===cxCss ) &&
			cxJs
		)
	);
}
function IsReturn( cad, pos ) {
	return (
		cad[pos    ]==='r' &&
		cad[pos + 1]==='e' &&
		cad[pos + 2]==='t' &&
		cad[pos + 3]==='u' &&
		cad[pos + 4]==='r' &&
		cad[pos + 5]==='n' &&
		( ( pos + 6 )>=cad.length || IsSpecial( cad, pos + 6 ) ) &&
		( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
	);
}
function IsRegExp( cad, pos ) {
	for ( pos--; pos>=0 && IsSpaces( cad, pos ); pos-- );

	if      ( cad[pos]==='n'            ) return IsReturn( cad, pos - 5 );
	else if ( IsValidLetter( cad, pos ) ) return false;

	switch ( cad[pos] ) {
		case '=':
		case ',':
		case ':':
		case ';':
		case '(':
		case '[':
		case '{': return true;
		default : return pos===0 || IsOperator( cad, pos );
	}
}
function IsViewFunction( cad, pos ) {
	if (
		!(
			cad[pos    ]==='V' &&
			cad[pos + 1]==='i' &&
			cad[pos + 2]==='e' &&
			cad[pos + 3]==='w' &&
			( ( pos + 4 )>=cad.length || IsSpecial( cad, pos + 4 ) ) &&
			( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
		)
	) return false;

	for ( pos+= 4; pos<cad.length && ( IsSpaces( cad, pos ) || cad[pos]==='(' || cad[pos]===')' ); pos++ );

	return cad[pos]==='{';
}
function IsStyleFunction( cad, pos ) {
	if (
		!(
			cad[pos    ]==='S' &&
			cad[pos + 1]==='t' &&
			cad[pos + 2]==='y' &&
			cad[pos + 3]==='l' &&
			cad[pos + 4]==='e' &&
			( ( pos + 5 )>=cad.length || IsSpecial( cad, pos + 5 ) ) &&
			( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
		)
	) return false;

	for ( pos+= 5; pos<cad.length && ( IsSpaces( cad, pos ) || cad[pos]==='(' || cad[pos]===')' ); pos++ );

	return cad[pos]==='{';
}
function IsStyleTag( cad, pos ) {
	if (
		!(
			( cad[pos    ]==='s' || cad[pos    ]==='S' ) &&
			( cad[pos + 1]==='t' || cad[pos + 1]==='T' ) &&
			( cad[pos + 2]==='y' || cad[pos + 2]==='Y' ) &&
			( cad[pos + 3]==='l' || cad[pos + 3]==='L' ) &&
			( cad[pos + 4]==='e' || cad[pos + 4]==='E' ) &&
			( ( pos + 5 )>=cad.length || IsSpecial( cad, pos + 5 ) ) &&
			( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
		)
	) return false;

	for ( pos+= 5; pos<cad.length && IsSpaces( cad, pos ); pos++ );

	if ( cad[pos]!=='>' ) return false;

	for ( pos++; pos<cad.length && IsSpaces( cad, pos ); pos++ );

	return cad[pos]==='{';
}
// ####################################################################################################


/* Funciones */
function Completion( documents, document_position ) {
	/* Get */
	function GetComment( cad, pos ) {
		switch ( cad[pos + 1] ) {
			case '/': for ( pos+= 2; pos<cad.length && !IsSpacesLine( cad, pos )                                      ; pos++ ); pos--  ; break;
			case '*': for ( pos+= 2; pos<cad.length && !( cad[pos]==='*' && cad[pos + 1]==='/'                       ); pos++ ); pos++  ; break;
			case '!': for ( pos+= 4; pos<cad.length && !( cad[pos]==='-' && cad[pos + 1]==='-' && cad[pos + 2]==='>' ); pos++ ); pos+= 2; break;
		}

		return pos;
	}
	function GetRegExp( cad, pos ) {
		for ( pos++; pos<cad.length; pos++ ) {
			switch ( cad[pos] ) {
				case '/' : return pos;
				case '\\': pos++;
			}
		}

		return pos;
	}
	function GetContext( sta, cad, pos, ctx, is_first ) {
		const end = is_first ? null : ( ( cad[pos]==='"' || cad[pos]==='`' || cad[pos]==="'" ) ? cad[pos] : ( cad[pos]==='{' ? '}' : null ) );
		const com = ctx===cxJs ? '`' : null;

		if ( end ) pos++;

		sta.push( ctx );

		for ( ;pos<cad.length; pos++ ) {
			switch ( cad[pos] ) {
				case end: sta.pop(); return pos;

				case '\\': pos++; break;

				case "'":
				case '"':
				case com: pos = GetContext( sta, cad, pos, ctx ); break;

				case '/':
					if ( end!=='"' && end!=='`' && end!=="'" ) {
						if      ( IsComment( cad, pos ) ) pos = GetComment( cad, pos );
						else if ( IsRegExp ( cad, pos ) ) pos = GetRegExp ( cad, pos );
					}
				break;

				case '$': if ( end==='`' && cad[pos+1]==='{' ) pos = GetContext( sta, cad, pos + 1, cxJs ); break;

				case 'V':
					if ( ctx===cxJs && IsViewFunction( cad, pos ) ) {
						for ( ;pos<cad.length && cad[pos]!=='{'; pos++ );

						if ( cad[pos]==='{' )
							pos = GetContext( sta, cad, pos, cxHtm );
					}
				break;

				case 's':
				case 'S':
					if (
						( ctx===cxJs   && IsStyleFunction( cad, pos ) ) ||
						( ctx===cxHtm && IsStyleTag     ( cad, pos ) )
					) {
						for ( ;pos<cad.length && cad[pos]!=='{'; pos++ );

						if ( cad[pos]==='{' )
							pos = GetContext( sta, cad, pos, cxCss );
					}
				break;

				case '{':
					switch ( IsScript( cad, pos, ctx ) ) {
						case cxHtm: pos = GetContext( sta, cad, pos, cxHtm ); break;
						case cxCss: pos = GetContext( sta, cad, pos, cxCss ); break;
						default   : pos = GetContext( sta, cad, pos, cxJs  ); break;
					}
				break;
			}
		}

		return pos;
	}

	function GetPseudoClasses( cad ) {
		if ( global.data_pseudoClasses ) return global.data_pseudoClasses;

		let res = [], tem;

		for ( let x in data.pseudoClasses ) {
			res.push( tem = vsc_language.CompletionItem.create( x ) );

			tem.insertTextFormat = 2;
			tem.documentation    = { kind:'markdown', value:data.pseudoClasses[x].description };
			tem.insertText       = x.substring( 1, x.length );
			tem.sortText         = x[1]==='-' ? 'c' : 'a';
			tem.kind             = vsc_language.CompletionItemKind.Keyword;
		}

		for ( let x in data.pseudoElements ) {
			res.push( tem = vsc_language.CompletionItem.create( x ) );

			tem.insertTextFormat = 2;
			tem.documentation    = { kind:'markdown', value:data.pseudoElements[x].description };
			tem.insertText       = x.substring( 2, x.length );
			tem.sortText         = x[1]==='-' ? 'd' : 'b';
			tem.kind             = vsc_language.CompletionItemKind.Keyword;
		}

		return global.data_pseudoClasses = vsc_language.CompletionList.create( res );
	}
	function GetDirectives() {
		if ( global.data_directives ) return global.data_directives;

		let res = [], tem;

		for ( let x in data.atDirectives ) {
			res.push( tem = vsc_language.CompletionItem.create( x ) );

			tem.insertTextFormat = 2;
			tem.documentation    = { kind:'markdown', value:data.atDirectives[x].description };
			tem.insertText       = x;
			tem.sortText         = x[1]==='-' ? 'b' : 'a';
			tem.command          = { title:'Seggest' , command:'editor.action.triggerSuggest' };
			tem.kind             = vsc_language.CompletionItemKind.Keyword;
		}

		return global.data_directives = vsc_language.CompletionList.create( res );
	}
	function GetEmmet( property, input ) {
		let eme, rex;

		if ( !( eme = data.emmet[property] ) ) return [];

		const regex = /(-?(\d+)?(\.?\d+))(px|em|rem|pt|pc|in|cm|mm|%|p)?\-?/gm;
		let   par   = '';

		while ( rex = regex.exec( input ) )
			par+= ( par ? ' ' : '' ) + rex[1] + ( !rex[4] ? '' : ( rex[4]==='p' ? '%' : rex[4] ) );

		let res              = vsc_language.CompletionItem.create( par ? `${ eme.property }: ${ par }` : eme.replace );
		res.filterText       = input;
		res.detail           = 'meme.js snippets';
		res.insertTextFormat = 2;
		res.documentation    = { kind:'markdown', value:data.properties[eme.property]?.description };
		res.insertText       = par ? `${ eme.property }: ${ par }` : eme.replace;
		res.sortText         = 'b';
		res.kind             = vsc_language.CompletionItemKind.Snippet;
		res.preselect        = true;

		return res;
	}
	function GetProperty( cad ) {
		let pro = '', inp = '';

		for ( let pos = cad.length; pos--; ) {
			switch ( cad[pos] ) {
				case ';' :
				case '<' :
				case '>' :
				case ' ' :
				case '\t':
				case '\n':
				case '\r': pos = 0; break;
				default  :
					if ( IsLetter( cad, pos ) ) pro = cad[pos] + pro;
					else                        pro = '';

					inp = cad[pos] + inp;
			}
		}

		// debugger
		let eme = GetEmmet( pro, inp );

		if ( global.data_properties )
			return vsc_language.CompletionList.create( global.data_properties.concat( eme ), true );

		let res = [], tem;

		for ( let x in data.properties ) {
			res.push( tem = vsc_language.CompletionItem.create( x ) );

			tem.insertTextFormat = 2;
			tem.documentation    = { kind:'markdown', value:data.properties[x].description };
			tem.insertText       = `${ x }: $0`;
			tem.sortText         = x[0]==='-' ? 'e' : 'd';
			tem.command          = { title:'Seggest' , command:'editor.action.triggerSuggest' };
			tem.kind             = vsc_language.CompletionItemKind.Property;
		}

		global.data_properties = res;

		return vsc_language.CompletionList.create( res.concat( eme ), true );
	}
	function GetValue( cad ) {
		let pro = '', isp = 0;

		for ( let pos = cad.length; pos--; ) {
			switch ( cad[pos] ) {
				case ':': isp = 1; break;

				case ';' :
				case '<' :
				case '>' :
				case '\n':
				case '\r': pos = 0; break;

				default: if ( isp && IsValidLetter( cad, pos ) ) pro = cad[pos] + pro;
			}
		}

		if ( !( pro = data.properties[pro] ) || !Array.isArray( pro.values ) ) return null;

		let res = [], tem;

		pro.values.forEach( v => {
			res.push( tem = vsc_language.CompletionItem.create( v.name ) );

			tem.documentation    = { kind:'markdown', value:v.description };
			tem.kind             = vsc_language.CompletionItemKind.Value;
			tem.insertText       = v.name;
			tem.sortText         = v.name[0]==='-' ? 'b' : 'a';
			tem.commitCharacters = [ ';' ];
		});

		return vsc_language.CompletionList.create( res );
	}
	// **************************************************

	/* Completions */
	function CompletionCSS( cad ) {
		for ( let pos = cad.length; pos--; ) {
			switch ( cad[pos] ) {
				case '\n':
				case '\r': return GetProperty( cad );

				case ';':
				case '<':
				case '>': return GetProperty( cad );

				case ':':
					if ( cad[pos-1]===':' ) return GetPseudoClasses(     );
					else                    return GetValue        ( cad );
				break;

				case '@': return GetDirectives();

				case 'c':
					if ( cad[pos-1]==='b' && cad[pos-2]==='{' ) {
						return GetProperty( cad );
					}
				break;
			}
		}

		return GetProperty( cad );
	}
	// **************************************************

	/* Inicio */
	function Inicio() {
		const document = documents.get( document_position.textDocument.uri );

		if ( !document ) return null;

		const
		context    = document._languageId==='meme-css' ? cxCss : ( document._languageId==='meme-html' ? cxHtm : cxJs ),
		position   = document.offsetAt( document_position.position ),
		code       = document._content.slice( 0, position ),
		result_ctx = [];

		try {
			GetContext( result_ctx, code, 0, context, true );
		}
		catch ( e ) {
			debugger
		}

		switch ( result_ctx.at( -1 ) ) {
			case cxCss: return CompletionCSS( code );
			default    : return null;
		}
	};return Inicio();
	// **************************************************
}
function Folding( documents, context ) {
	/* Is */
	function IsAs( cad, pos ) {
		return (
			cad[pos    ]==='a' &&
			cad[pos + 1]==='s' &&
			( ( pos + 2 )>=cad.length || IsSpecial( cad, pos + 2 ) ) &&
			( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
		);
	}
	function IsDefine( cad, pos ) {
		if (
			!(
				cad[pos    ]==='d' &&
				cad[pos + 1]==='e' &&
				cad[pos + 2]==='f' &&
				cad[pos + 3]==='i' &&
				cad[pos + 4]==='n' &&
				cad[pos + 5]==='e' &&
				( ( pos + 6 )>=cad.length || IsSpecial( cad, pos + 6 ) ) &&
				( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
			)
		) return false;

		pos+= 6;

		for ( ;pos<cad.length && IsSpacesTabs ( cad, pos ); pos++ );
		for ( ;pos<cad.length && IsValidLetter( cad, pos ); pos++ );

		if ( cad[pos]==='(' ) {
			for ( ;pos<cad.length && cad[pos]!==')'; pos++ );

			pos++;
		}

		for ( ;pos<cad.length && IsSpacesTabs( cad, pos ); pos++ );

		return IsAs( cad, pos );
	}
	function IsCommentSeparate( cad, pos ) {
		return (
			cad[pos    ]==='/' &&
			cad[pos + 1]==='*' &&
			cad[pos + 2]==='/'
		);
	}
	function IsIncludeUrl( cad, pos ) {
		return (
			cad[pos    ]==='u' &&
			cad[pos + 1]==='r' &&
			cad[pos + 2]==='l' &&
			( ( pos + 3 )>=cad.length || IsSpecial( cad, pos + 3 ) ) &&
			( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
		);
	}
	function IsIncludeFile( cad, pos ) {
		return (
			cad[pos    ]==='f' &&
			cad[pos + 1]==='i' &&
			cad[pos + 2]==='l' &&
			cad[pos + 3]==='e' &&
			( ( pos + 4 )>=cad.length || IsSpecial( cad, pos + 4 ) ) &&
			( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
		);
	}
	function IsInclude( cad, pos ) {
		if (
			!(
				( cad[pos    ]==='i' || cad[pos    ]==='e' ) &&
				( cad[pos + 1]==='n' || cad[pos + 1]==='x' ) &&
				cad[pos + 2]==='c' &&
				cad[pos + 3]==='l' &&
				cad[pos + 4]==='u' &&
				cad[pos + 5]==='d' &&
				cad[pos + 6]==='e' &&
				( ( pos + 7 )>=cad.length || IsSpecial( cad, pos + 7 ) ) &&
				( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
			)
		) return false;

		pos+= 7;

		for ( ;pos<cad.length && IsSpacesTabs( cad, pos ); pos++ );

		return (
			IsIncludeFile( cad, pos ) ||
			IsIncludeUrl ( cad, pos )
		);
	}
	function IsProperty( cad, pos, lvl ) {
		let con = true, plv = 0;

		for ( ;pos<cad.length && con; pos++ ) {
			switch ( cad[pos] ) {
				case '/':
					if      ( cad[pos + 1]==='*' && cad[pos + 2]==='/' ) return false;
					else if ( IsComment( cad, pos )                    ) [, pos] = GetComment( [], 0, cad, pos );

				case '\n':
				case '\r': break;

				case '\t':
				case ' ' : plv++; break;

				default: con = false, pos--;
			}
		}

		if ( typeof lvl==='number' && lvl>=plv ) return false;

		for ( ;pos<cad.length && IsValidLetter( cad, pos ); pos++ );
		for ( ;pos<cad.length && IsSpacesTabs ( cad, pos ); pos++ );

		return (
			cad[pos    ]===':' &&
			cad[pos + 1]!==':' &&
			cad[pos + 1]!=='<' &&
			cad[pos + 1]!=='>'
		);
	}
	function IsEndScript( cad, pos ) {
		for ( ;pos<cad.length && IsSpaces( cad, pos ); pos++ );

		return cad[pos]==='}';
	}
	// **************************************************

	/* Get */
	function GetComment( res, sta, cad, pos ) {
		const sin = sta;
		const end = cad[pos + 1]==='*' ? '*' : '\n';

		for ( pos+= 2; pos<cad.length; pos++ ) {
			switch ( cad[pos] ) {
				case end:
					if ( end==='\n' || cad[pos + 1]==='/' ) {
						if ( sin!==sta ) res.push({ start:sin, end:sta, kind:3 });

						if ( end==='\n' ) pos--;
						else              pos++;

						return [sta, pos];
					}
				break;

				case '\n':
				case '\r': sta++; break;
			}
		}

		if ( sin!==sta ) res.push({ start:sin, end:sta, kind:3 });

		return [sta, pos];
	}
	function GetString( res, sta, cad, pos, ctx ) {
		const pot = pos;
		const ret = [];
		const end = cad[pos];
		const sin = sta;

		for ( pos++; pos<cad.length; pos++ ) {
			switch( cad[pos] ) {
				case end:
					if ( sin!==sta ) ret.push({ start:sin, end:sta, kind:3 });

					res.push( ...ret );
				return [sta, pos];

				case '\n':
				case '\r': sta++; break;

				case '\\':
					if ( cad[pos+1]==='\n' || cad[pos+1]==='\r' ) sta++;

					pos++;
				break;

				case '$':
					if ( end==='`' && cad[pos + 1]==='{' ) [sta, pos] = FoldingJS( ret, sta, cad, pos + 1 );
				break;

				case '{':
					switch ( IsScript( cad, pos ) ) {
						case cxCss: [sta, pos] = FoldingCSS( ret, sta, cad, pos ); break;
						case cxHtm: [sta, pos] = FoldingHTM( ret, sta, cad, pos ); break;
						default   : [sta, pos] = FoldingJS ( ret, sta, cad, pos ); break;
						case false: break;
					}
				break;
			}
		}

		return [sin, pot];
	}
	function GetDefine( res, sta, cad, pos ) {
		const sin = sta;

		for ( ;pos<cad.length; pos++ ) {
			switch ( cad[pos] ) {
				case '\n':
				case '\r':
					if ( sin!==sta ) res.push({ start:sin, end:sta, kind:3 });
				return [sta, --pos];

				case '"':
				case "'": return GetString( res, sta, cad, pos, cxJs );
			}
		}

		return [sta, pos];
	}
	function GetRegExp( res, sta, cad, pos ) {
		const sin = sta;

		for ( pos++; pos<cad.length; pos++ ) {
			switch ( cad[pos] ) {
				case '/':
					if ( sin!==sta ) res.push({ start:sin, end:sta, kind:3 });
				return [sta, pos];

				case '\\': pos++; break;
			}
		}

		return [sta, pos];
	}
	function GetView( res, sta, cad, pos ) {
		const sin = sta;

		for ( ;pos<cad.length; pos++ ) {
			switch ( cad[pos] ) {
				case '\n':
				case '\r': sta++; break;

				case '{':
					[sta, pos] = FoldingHTM( res, sta, cad, pos );

					if ( sin!==sta ) res.push({ start:sin, end:sta, kind:3 });
				return [sta, pos];
			}
		}

		return [sta, pos];
	}
	function GetStyle( res, sta, cad, pos ) {
		const sin = sta;

		for ( ;pos<cad.length; pos++ ) {
			switch ( cad[pos] ) {
				case '\n':
				case '\r': sta++; break;

				case '{':
					[sta, pos] = FoldingCSS( res, sta, cad, pos );

					if ( sin!==sta ) res.push({ start:sin, end:sta, kind:3 });
				return [sta, pos];
			}
		}

		return [sta, pos];
	}
	function GetCommentSeparateCSS( res, sta, cad, pos ) {
		let lvl = 0, pot = pos;

		for ( pot--; pot>=0 && IsSpacesTabs( cad, pot ); pot--, lvl++ );

		if ( !IsSpacesLine( cad, pot ) ) return GetComment( res, sta, cad, pos );

		const sin  = sta;
		[sta, pos] = GetComment( [], sta, cad, pos );

		for ( ;pos<cad.length && !IsSpacesLine( cad, pos ); pos++ );

		for ( ;pos<cad.length; pos++ ) {
			switch ( cad[pos] ) {
				case '\r':
				case '\n':
					pot     = pos;
					let lvt = 0, stt = 0;

					for ( ;pos<cad.length && IsSpacesLine( cad, pos ); pos++, stt++ );
					for ( ;pos<cad.length && IsSpacesTabs( cad, pos ); pos++, lvt++ );

					if ( lvl<lvt ) {
						sta+= stt;
						pos = pot + stt;
					}
					else {
						if ( sin!=sta ) res.push({ start:sin, end:sta, kind:3 });

						return [sta, pot - 1];
					}
				break;

				case '"':
				case "'": [sta, pos] = GetString( res, sta, cad, pos, cxCss ); break;

				case '/':
					if      ( IsCommentSeparate( cad, pos ) ) [sta, pos] = GetCommentSeparateCSS( res, sta, cad, pos );
					else if ( IsComment        ( cad, pos ) ) [sta, pos] = GetComment           ( res, sta, cad, pos );
				break;

				case '{':
					switch ( IsScript( cad, pos, cxCss ) ) {
						case cxCss: [sta, pos] = FoldingCSS( res, sta, cad, pos ), stf=sta, pof=pos; break;
						case cxHtm: [sta, pos] = FoldingHTM( res, sta, cad, pos ), stf=sta, pof=pos; break;
						default   : [sta, pos] = FoldingJS ( res, sta, cad, pos ), stf=sta, pof=pos; break;
					}
				break;

				case 'i':
				case 'e': if ( IsInclude( cad, pos ) ) [sta, pos] = GetDefine( res, sta, cad, pos ); break;
				case 'd': if ( IsDefine ( cad, pos ) ) [sta, pos] = GetDefine( res, sta, cad, pos ); break;

				default:
					if      (  IsProperty ( cad, pos ) ) [sta, pos] = GetProperty( res, sta, cad, pos );
					else if ( !IsEndScript( cad, pos ) ) [sta, pos] = GetSelector( res, sta, cad, pos );
			}
		}

		if ( sin!==sta ) res.push({ start:sin, end:sta, kind:3 });

		return [sta, pos];
	}
	function GetCommentSeparateJS( res, sta, cad, pos ) {
		let lvl = 0, pot = pos;

		for ( pot--; pot>=0 && IsSpacesTabs( cad, pot ); pot--, lvl++ );

		if ( !IsSpacesLine( cad, pot ) ) return GetComment( res, sta, cad, pos );

		const sin  = sta;
		[sta, pos] = GetComment( [], sta, cad, pos );

		for ( ;pos<cad.length && !IsSpacesLine( cad, pos ); pos++ );

		for ( ;pos<cad.length; pos++ ) {
			switch ( cad[pos] ) {
				case '\r':
				case '\n':
					pot     = pos;
					let lvt = 0, stt = 0;

					for ( ;pos<cad.length && IsSpacesLine( cad, pos ); pos++, stt++ );
					for ( ;pos<cad.length && IsSpacesTabs( cad, pos ); pos++, lvt++ );

					if ( lvl<lvt ) {
						sta+= stt;
						pos = pot + stt;
					}
					else {
						if ( sin!=sta ) res.push({ start:sin, end:sta, kind:3 });

						return [sta, pot - 1];
					}
				break;

				case '`':
				case '"':
				case "'": [sta, pos] = GetString( res, sta, cad, pos, cxJs ); break;

				case '/':
					if      ( IsCommentSeparate( cad, pos ) ) [sta, pos] = GetCommentSeparateCSS( res, sta, cad, pos );
					else if ( IsComment        ( cad, pos ) ) [sta, pos] = GetComment           ( res, sta, cad, pos );
					else if ( IsRegExp         ( cad, pos ) ) [sta, pos] = GetRegExp            ( res, sta, cad, pos );
				break;

				case '{':
					switch ( IsScript( cad, pos, cxCss ) ) {
						case cxCss: [sta, pos] = FoldingCSS( res, sta, cad, pos ), stf=sta, pof=pos; break;
						case cxHtm: [sta, pos] = FoldingHTM( res, sta, cad, pos ), stf=sta, pof=pos; break;
						default   : [sta, pos] = FoldingJS ( res, sta, cad, pos ), stf=sta, pof=pos; break;
					}
				break;

				case '[':
				case '(': [sta, pos] = FoldingJS( res, sta, cad, pos ); break;

				case 'i':
				case 'e': if ( IsInclude( cad, pos ) ) [sta, pos] = GetDefine( res, sta, cad, pos ); break;
				case 'd': if ( IsDefine ( cad, pos ) ) [sta, pos] = GetDefine( res, sta, cad, pos ); break;

				case 'V': if ( IsViewFunction ( cad, pos ) ) [sta, pos] = GetView ( res, sta, cad, pos ); break;
				case 'S': if ( IsStyleFunction( cad, pos ) ) [sta, pos] = GetStyle( res, sta, cad, pos ); break;
			}
		}

		if ( sin!==sta ) res.push({ start:sin, end:sta, kind:3 });

		return [sta, pos];
	}
	function GetProperty( res, sta, cad, pos ) {
		const sin = sta;

		for ( ;pos<cad.length; pos++ ) {
			switch ( cad[pos] ) {
				case '}' :
				case '\n':
				case '\r': return [sta, --pos];

				case '"':
				case "'": [sta, pos] = GetString( res, sta, cad, pos, cxCss ); break;

				case '(':
				case '[': [sta, pos] = FoldingJS( res, sta, cad, pos ); break;

				case '/':
					if      ( IsCommentSeparate( cad, pos ) ) [sta, pos] = GetCommentSeparateCSS( res, sta, cad, pos );
					else if ( IsComment        ( cad, pos ) ) [sta, pos] = GetComment           ( res, sta, cad, pos );
				break;

				case '{':
					switch ( IsScript( cad, pos, cxCss ) ) {
						case cxCss: [sta, pos] = FoldingCSS( res, sta, cad, pos ); break;
						case cxHtm: [sta, pos] = FoldingHTM( res, sta, cad, pos ); break;
						default   : [sta, pos] = FoldingJS ( res, sta, cad, pos ); break;
					}
				break;
			}
		}

		if ( sin!==sta ) res.push({ start:sin, end:sta, kind:3 });

		return [sta, pos];
	}
	function GetSelector( res, sta, cad, pos ) {
		const sin = sta;
		let   lvl = 0;

		for ( ;pos<cad.length && IsSpacesTabs( cad, pos ); pos++, lvl++ );

		for ( ;pos<cad.length; pos++ ) {
			switch ( cad[pos] ) {
				case '}' :
				case '\n':
				case '\r':
					if ( IsProperty( cad, pos, lvl ) ) {
						for ( ;pos<cad.length && IsSpacesLine( cad, pos ); pos++, sta++ );

						[sta, pos] = GetProperty( res, sta, cad, pos );
					}
					else {
						if ( sin!==sta ) res.push({ start:sin, end:sta, kind:3 });

						return [sta, --pos];
					}
				break;

				case '/':
					if      ( IsCommentSeparate( cad, pos ) ) [sta, pos] = GetCommentSeparateCSS( res, sta, cad, pos );
					else if ( IsComment        ( cad, pos ) ) [sta, pos] = GetComment           ( res, sta, cad, pos );
				break;

				case '{':
					switch ( IsScript( cad, pos, cxCss ) ) {
						case cxHtm: [sta, pos] = FoldingHTM( res, sta, cad, pos ); break;
						case cxCss: [sta, pos] = FoldingCSS( res, sta, cad, pos ); break;
						default   : [sta, pos] = FoldingJS ( res, sta, cad, pos ); break;
					}
				break;
			}
		}

		if ( sin!==sta ) res.push({ start:sin, end:sta, kind:3 });

		return [sta, pos];
	}
	// **************************************************

	/* Funciones */
	function FoldingJS( res, sta, cad, pos, is_first ) {
		const sin = sta;
		const end = is_first ? null : ( cad[pos]==='{' ? '}' : ( cad[pos]==='[' ? ']' : ( cad[pos]==='(' ? ')' : null ) ) );

		if ( end ) pos++;

		for ( ;pos<cad.length; pos++ ) {
			switch ( cad[pos] ) {
				case end:
					if ( sin!==sta ) res.push({ start:sin, end:sta, kind:3 });
				return [sta, pos];

				case '\n':
				case '\r': sta++; break;

				case '`':
				case '"':
				case "'": [sta, pos] = GetString( res, sta, cad, pos, cxJs ); break;

				case '/':
					if      ( IsCommentSeparate( cad, pos ) ) [sta, pos] = GetCommentSeparateJS( res, sta, cad, pos );
					else if ( IsComment        ( cad, pos ) ) [sta, pos] = GetComment          ( res, sta, cad, pos );
					else if ( IsRegExp         ( cad, pos ) ) [sta, pos] = GetRegExp           ( res, sta, cad, pos );
				break;

				case '[':
				case '(': [sta, pos] = FoldingJS( res, sta, cad, pos ); break;

				case '{':
					switch ( IsScript( cad, pos, cxJs ) ) {
						case cxHtm: [sta, pos] = FoldingHTM( res, sta, cad, pos ); break;
						case cxCss: [sta, pos] = FoldingCSS( res, sta, cad, pos ); break;
						default   : [sta, pos] = FoldingJS ( res, sta, cad, pos ); break;
					}
				break;

				case 'V': if ( IsViewFunction ( cad, pos ) ) [sta, pos] = GetView ( res, sta, cad, pos ); break;
				case 'S': if ( IsStyleFunction( cad, pos ) ) [sta, pos] = GetStyle( res, sta, cad, pos ); break;
			}
		}

		if ( end && sin!==sta ) res.push({ start:sin, end:sta, kind:3 });

		return [sta, pos];
	}
	function FoldingCSS( res, sta, cad, pos, is_first ) {
		const sin = sta;
		const end = is_first ? null : '}';

		if ( end ) pos++;

		for ( ;pos<cad.length; pos++ ) {
			switch ( cad[pos] ) {
				case end:
					if ( sin!=sta ) res.push({ start:sin, end:sta, kind:3 });
				return [sta, pos];

				case '\n':
				case '\r': sta++; break;

				case '"':
				case "'": [sta, pos] = GetString( res, sta, cad, pos, cxCss ); break;

				case '/':
					if      ( IsCommentSeparate( cad, pos ) ) [sta, pos] = GetCommentSeparateCSS( res, sta, cad, pos );
					else if ( IsComment        ( cad, pos ) ) [sta, pos] = GetComment           ( res, sta, cad, pos );
				break;

				case '{':
					switch ( IsScript( cad, pos, cxCss ) ) {
						case cxCss: [sta, pos] = FoldingCSS( res, sta, cad, pos ); break;
						case cxHtm: [sta, pos] = FoldingHTM( res, sta, cad, pos ); break;
						default   : [sta, pos] = FoldingJS ( res, sta, cad, pos ); break;
					}
				break;

				case 'd':
					if ( IsDefine( cad, pos ) ) {
						[sta, pos] = GetDefine( res, sta, cad, pos );

						break;
					}

				case 'i':
				case 'e':
					if ( IsInclude( cad, pos ) ) {
						[sta, pos] = GetDefine( res, sta, cad, pos );

						break;
					}

				default:
					if      (  IsProperty ( cad, pos ) ) [sta, pos] = GetProperty( res, sta, cad, pos );
					else if ( !IsEndScript( cad, pos ) ) [sta, pos] = GetSelector( res, sta, cad, pos );
			}
		}

		return [sta, pos];
	}
	function FoldingHTM( res, sta, cad, pos, is_first ) {
		const
			end = is_first ? null : ( cad[pos]==='{' ? '}' : ( cad[pos]==='[' ? ']' : null ) ),
			sin = sta;

		if ( end ) pos++;

		for ( ;pos<cad.length; pos++ ) {
			switch ( cad[pos] ) {
				case end:
					if ( sin!==sta ) res.push({ start:sin, end:sta, kind:3 });
				return [sta, pos];

				case '\n':
				case '\r': sta++; break;

				case '"':
				case "'": [sta, pos] = GetString( res, sta, cad, pos, cxHtm );

				case '/': if ( IsComment( cad, pos ) ) [sta, pos] = GetComment( res, sta, cad, pos ); break;

				case '[': [sta, pos] = FoldingHTM( res, sta, cad, pos ); break;

				case '{':
					switch ( IsScript( cad, pos, cxHtm ) ) {
						case cxHtm: [sta, pos] = FoldingHTM( res, sta, cad, pos ); break;
						case cxCss: [sta, pos] = FoldingCSS( res, sta, cad, pos ); break;
						default   : [sta, pos] = FoldingJS ( res, sta, cad, pos ); break;
					}
				break;

				case 's':
				case 'S': if ( IsStyleTag( cad, pos ) ) [sta, pos] = GetStyle( res, sta, cad, pos ); break;
			}
		}

		return [sta, pos];
	}
	// **************************************************

	/* Inicio */
	function Inicio() {
		const res = [];

		try {
			switch( context ) {
				case cxJs : FoldingJS ( res, 0, documents.getText(), 0, true ); break;
				case cxCss: FoldingCSS( res, 0, documents.getText(), 0, true ); break;
				case cxHtm: FoldingHTM( res, 0, documents.getText(), 0, true ); break;
			}
		}
		catch( e ) {
			debugger
		}

		const tem = res.reduce( ( r, v ) => {
			if ( r[v.start] ) {
				if ( r[v.start].end<v.end )
					r[v.start] = v;
			}
			else r[v.start] = v;

			return r;
		}, {} );

		res.length = 0;

		for ( const k in tem )
			res.push( tem[k] );

		return res;
	};return Inicio();
	// **************************************************
}
// ####################################################################################################


/* Exportaciones */
module.exports = {
	Completion ,
	FoldingJS : d=>Folding( d, cxJs  ),
	FoldingCSS: d=>Folding( d, cxCss ),
	FoldingHTM: d=>Folding( d, cxHtm ),
};
// ####################################################################################################