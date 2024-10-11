/* Funciones */
function DefinitionMeme( super_ctx, CodeMirror ) {
	/* Declaraciones */
	const
		cxComment     = 100,
		cxCommentLine = 101,
		cxString      = 102,
		cxJS                     = 200,
		cxJSScript               = 201,
		cxJSString               = 202,
		cxJSStringTemplate       = 203,
		cxJSStringTemplateScript = 204,
		cxJSRegExp               = 205,
		cxJSRegExpChars          = 206,
		cxJSRegExpLetters        = 207,
		cxJSNumber               = 208,
		cxJSProperty             = 209,
		cxJSPropertyFunction     = 210,
		cxJSElse                 = 211,
		cxJSTrue                 = 212,
		cxJSThis                 = 213,
		cxJSReturn               = 214,
		cxJSAsync                = 215,
		cxJSStatic               = 216,
		cxJSFunction             = 217,
		cxJSFunctionParams       = 218,
		cxJSTimeout              = 219,
		cxJSClass                = 220,
		cxJSClassName            = 221,
		cxJSClassExtends         = 222,
		cxJSClassExtendsName     = 223,
		cxJSClassBody            = 224,
		cxJSClassView            = 225,
		cxJSClassStyle           = 226,
		cxCSS                      = 300,
		cxCSSString                = 301,
		cxCSSClass                 = 302,
		cxCSSProperty              = 303,
		cxCSSPropertyValue         = 304,
		cxCSSPropertyValueVariable = 305,
		cxCSSPropertyValueNumber   = 306,
		cxCSSPropertyValueScale    = 307,
		cxCSSPropertyValueFunction = 308,
		cxCSSPseudo                = 309,
		cxCSSParams                = 310,
		cxCSSParamsValue           = 311,
		cxCSSId                    = 312,
		cxCSSMedia                 = 313,
		cxHTML                = 400,
		cxHTMLString          = 401,
		cxHTMLBody            = 402,
		cxHTMLParams          = 403,
		cxHTMLParamsValue     = 404,
		cxHTMLParamsNumber    = 405,
		cxHTMLParamsTrue      = 406,
		cxHTMLParamsNull      = 407,
		cxHTMLParamsUndefined = 408,
		cxHTMLEvent           = 409,
		cxHTMLEventParams     = 410,

		Muchos = 2000;
	// **************************************************

	/* Funciones */
	function IsSpecial( cad, pos ) {
		switch ( cad[pos] ) {
			case '(' :
			case ')' :
			case '[' :
			case ']' :
			case '{' :
			case '}' :
			case '<' :
			case '>' :
			case '=' :
			case '.' :
			case ':' :
			case ';' :
			case ',' :
			case '-' :
			case '+' :
			case '*' :
			case '/' :
			case '%' :
			case '?' :
			case '#' :
			case '&' :
			case '!' :
			case '|' :
			case '@' :
			case '"' :
			case '`' :
			case "'" :
			case '\'':
			case '\n':
			case '\r':
			case '\t':
			case ' ' :
			case null:
			case undefined: return true;
			default       : return false;
		}
	}
	function IsClass( cad, pos ) {
		return (
			cad[pos    ]==='c' &&
			cad[pos + 1]==='l' &&
			cad[pos + 2]==='a' &&
			cad[pos + 3]==='s' &&
			cad[pos + 4]==='s' &&
			( ( pos + 5 )>=cad.length || IsSpecial( cad, pos + 5 ) ) &&
			( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
		);
	}
	function IsSpaces( cad, pos ) {
		switch ( cad[pos] ) {
			case ' ' :
			case '\n':
			case '\r':
			case '\t': return true;
			default  : return false;
		}
	}
	function IsExtends( cad, pos ) {
		return (
			cad[pos    ]==='e' &&
			cad[pos + 1]==='x' &&
			cad[pos + 2]==='t' &&
			cad[pos + 3]==='e' &&
			cad[pos + 4]==='n' &&
			cad[pos + 5]==='d' &&
			cad[pos + 6]==='s' &&
			( ( pos + 7 )>=cad.length || IsSpecial( cad, pos + 7 ) ) &&
			( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
		);
	}
	function IsView( cad, pos ) {
		return (
			cad[pos    ]==='V' &&
			cad[pos + 1]==='i' &&
			cad[pos + 2]==='e' &&
			cad[pos + 3]==='w' &&
			( ( pos + 4 )>=cad.length || IsSpecial( cad, pos + 4 ) ) &&
			( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
		);
	}
	function IsStyle( cad, pos ) {
		return (
			cad[pos    ]==='S' &&
			cad[pos + 1]==='t' &&
			cad[pos + 2]==='y' &&
			cad[pos + 3]==='l' &&
			cad[pos + 4]==='e' &&
			( ( pos + 5 )>=cad.length || IsSpecial( cad, pos + 5 ) ) &&
			( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
		);
	}
	function IsTrue( cad, pos ) {
		return (
			cad[pos    ]==='t' &&
			cad[pos + 1]==='r' &&
			cad[pos + 2]==='u' &&
			cad[pos + 3]==='e' &&
			( ( pos + 4 )>=cad.length || IsSpecial( cad, pos + 4 ) ) &&
			( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
		)
		||
		(
			cad[pos    ]==='f' &&
			cad[pos + 1]==='a' &&
			cad[pos + 2]==='l' &&
			cad[pos + 3]==='s' &&
			cad[pos + 4]==='e' &&
			( ( pos + 5 )>=cad.length || IsSpecial( cad, pos + 5 ) ) &&
			( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
		);
	}
	function IsNull( cad, pos ) {
		return (
			cad[pos    ]==='n' &&
			cad[pos + 1]==='u' &&
			cad[pos + 2]==='l' &&
			cad[pos + 3]==='l' &&
			( ( pos + 4 )>=cad.length || IsSpecial( cad, pos + 4 ) ) &&
			( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
		);
	}
	function IsUndefined( cad, pos ) {
		return (
			cad[pos    ]==='u' &&
			cad[pos + 1]==='n' &&
			cad[pos + 2]==='d' &&
			cad[pos + 3]==='e' &&
			cad[pos + 4]==='f' &&
			cad[pos + 5]==='i' &&
			cad[pos + 6]==='n' &&
			cad[pos + 7]==='e' &&
			cad[pos + 8]==='d' &&
			( ( pos + 9 )>=cad.length || IsSpecial( cad, pos + 9 ) ) &&
			( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
		);
	}
	function IsNumber( cad, pos ) {
		if (
			!(
				cad[pos]==='.' ||
				cad[pos]==='-' ||
				( cad[pos]>='0' && cad[pos]<='9' )
			)
		) return false;

		let pov = pos;

		if ( cad[pos]==='-' ) pos++;

		let is_point = cad[pos]==='.';

		if ( is_point ) pos++;

		for ( ;pos<cad.length; pos++ ) {
			if ( cad[pos]==='.' ) {
				if ( is_point ) return false;
				else            is_point = true;
			}
			else if (
				( cad[pos]>='a' && cad[pos]<='z' ) ||
				( cad[pos]>='A' && cad[pos]<='Z' )
			) return pos!==pov && cad[pos]!=='.' && cad[pos-1]!=='-';
			else if ( IsSpecial( cad, pos ) ) break;
		}

		return pos!==pov && cad[pos]!=='.' && cad[pos-1]!=='-';
	}
	function IsLetter( cad, pos ) {
		return (
			( cad[pos]>='a' && cad[pos]<='z' ) ||
			( cad[pos]>='A' && cad[pos]<='Z' )
		);
	}
	function IsValidLetter( cad, pos ) {
		return (
			cad[pos]==='_' ||
			IsLetter( cad, pos ) ||
			IsNumber( cad, pos )
		);
	}
	function IsAsync( cad, pos ) {
		return (
			cad[pos    ]==='a' &&
			cad[pos + 1]==='s' &&
			cad[pos + 2]==='y' &&
			cad[pos + 3]==='n' &&
			cad[pos + 4]==='c' &&
			( ( pos + 5 )>=cad.length || IsSpecial( cad, pos + 5 ) ) &&
			( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
		);
	}
	function IsStatic( cad, pos ) {
		return (
			cad[pos    ]==='s' &&
			cad[pos + 1]==='t' &&
			cad[pos + 2]==='a' &&
			cad[pos + 3]==='t' &&
			cad[pos + 4]==='i' &&
			cad[pos + 5]==='c' &&
			( ( pos + 6 )>=cad.length || IsSpecial( cad, pos + 6 ) ) &&
			( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
		);
	}
	function IsFunction( cad, pos ) {
		const len = cad.length;

		for ( ;pos<len && IsSpaces( cad, pos ); pos++ );

		if ( IsStatic( cad, pos, len ) ) pos+= 6;

		for ( ;pos<len && IsSpaces( cad, pos ); pos++ );

		if ( IsAsync( cad, pos, len ) ) pos+= 5;

		for ( ;pos<len && IsSpaces     ( cad, pos ); pos++ );
		for ( ;pos<len && IsValidLetter( cad, pos ); pos++ );
		for ( ;pos<len && IsSpaces     ( cad, pos ); pos++ );

		return cad[pos]==='(';
	}
	function IsOperator( cad, pos ) {
		return (
			cad[pos]==='<' ||
			cad[pos]==='>' ||
			cad[pos]==='=' ||
			cad[pos]==='-' ||
			cad[pos]==='+' ||
			cad[pos]==='*' ||
			cad[pos]==='/' ||
			cad[pos]==='%' ||
			cad[pos]==='!' ||
			cad[pos]==='?'
		);
	}
	function IsRegExp( cad, pos ) {
		for ( pos--; pos>=0 && IsSpaces( cad, pos ); pos-- );

		if ( cad[pos]==='n' ) return IsReturn( cad, pos - 5 );

		return (
			pos===0 ||
			pos===-1 ||
			IsOperator( cad, pos ) ||
			cad[pos]==='=' ||
			cad[pos]===',' ||
			cad[pos]===';' ||
			cad[pos]==='(' ||
			cad[pos]==='[' ||
			cad[pos]==='{' ||
			cad[pos]==='&' ||
			cad[pos]==='|'
		);
	}
	function IsRegExpLetter( cad, pos ) {
		switch ( cad[pos] ) {
			case 'g':
			case 'm':
			case 'i':
			case 'y':
			case 'u':
			case 'v':
			case 's':
			case 'd': return true;
			default : return false;
		}
	}
	function IsTimeOut( cad, pos ) {
		return (
			(
				cad[pos     ]==='c' &&
				cad[pos + 1 ]==='l' &&
				cad[pos + 2 ]==='e' &&
				cad[pos + 3 ]==='a' &&
				cad[pos + 4 ]==='r' &&
				cad[pos + 5 ]==='T' &&
				cad[pos + 6 ]==='i' &&
				cad[pos + 7 ]==='m' &&
				cad[pos + 8 ]==='e' &&
				cad[pos + 9 ]==='o' &&
				cad[pos + 10]==='u' &&
				cad[pos + 11]==='t' &&
				( ( pos + 12)>=cad.length || IsSpecial( cad, pos + 12 ) ) &&
				( ( pos - 1 )<0           || IsSpecial( cad, pos - 1  ) )
			)
			||
			(
				cad[pos     ]==='s' &&
				cad[pos + 1 ]==='e' &&
				cad[pos + 2 ]==='t' &&
				cad[pos + 3 ]==='T' &&
				cad[pos + 4 ]==='i' &&
				cad[pos + 5 ]==='m' &&
				cad[pos + 6 ]==='e' &&
				cad[pos + 7 ]==='o' &&
				cad[pos + 8 ]==='u' &&
				cad[pos + 9 ]==='t' &&
				( ( pos + 10)>=cad.length || IsSpecial( cad, pos + 10 ) ) &&
				( ( pos - 1 )<0           || IsSpecial( cad, pos - 1  ) )
			)
		);
	}
	function IsElse( cad, pos ) {
		return (
			cad[pos    ]==='e' &&
			cad[pos + 1]==='l' &&
			cad[pos + 2]==='s' &&
			cad[pos + 3]==='e' &&
			( ( pos + 4 )>=cad.length || IsSpecial( cad, pos + 4 ) ) &&
			( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
		);
	}
	function IsThis( cad, pos ) {
		return (
			cad[pos    ]==='t' &&
			cad[pos + 1]==='h' &&
			cad[pos + 2]==='i' &&
			cad[pos + 3]==='s' &&
			( ( pos + 4 )>=cad.length || IsSpecial( cad, pos + 4 ) ) &&
			( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
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
	function IsNumberWord( cad, pos ) {
		if ( !IsSpecial( cad, pos-1 ) ) return false;

		const pov = pos;

		finish_tag:
		for ( ;pos<cad.length; pos++ ) {
			switch ( cad[pos] ) {
				case '.':
				case '0': case '1': case '2': case '3': case '4':
				case '5': case '6': case '7': case '8': case '9':
				break;

				default: break finish_tag;
			}
		}

		return pov<pos && IsSpecial( cad, pos );
	}
	function IsJsProperty( cad, pos ) {
		for ( pos++; pos<cad.length && IsSpaces( cad, pos ); pos++ );

		for ( ;pos<cad.length; pos++ ) {
			if ( !IsValidLetter( cad, pos ) ) {
				break;
			}
		}

		for ( ; pos<cad.length && IsSpaces( cad, pos ); pos++ );

		return cad[pos]==='(' ? 1 : ( ( pos===cad.length || IsSpecial( cad, pos ) ) ? 2 : false );
	}
	function IsBuild( cad, pos ) {
		return (
			cad[pos    ]==='b' &&
			cad[pos + 1]==='u' &&
			cad[pos + 2]==='i' &&
			cad[pos + 3]==='l' &&
			cad[pos + 4]==='d' &&
			( ( pos + 5 )>=cad.length || IsSpecial( cad, pos + 5 ) ) &&
			( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
		);
	}
	function IsRequest( cad, pos ) {
		return (
			cad[pos    ]==='r' &&
			cad[pos + 1]==='e' &&
			cad[pos + 2]==='q' &&
			cad[pos + 3]==='u' &&
			cad[pos + 4]==='e' &&
			cad[pos + 5]==='s' &&
			cad[pos + 6]==='t' &&
			( ( pos + 7 )>=cad.length || IsSpecial( cad, pos + 7 ) ) &&
			( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
		);
	}
	// **************************************************

	/* Context */
	function token( stream, state ) {
		const { ctx, end }        = state;
		const { string:cad, pos } = stream;
		const last_ctx            = ctx.at( -1 );
		const last_end            = end.at( -1 );
		const is_css              = last_ctx>=cxCSS  && last_ctx<=cxCSSMedia;
		const is_html             = last_ctx>=cxHTML && last_ctx<=cxHTMLEventParams;

		stream.next();

		if ( state.escape ) {
			state.escape = undefined;
			return 'escape';
		}

		switch ( cad[pos] ) {
			case '\\':
				state.escape = true;
			return 'escape';

			case last_end?.char:
				end.pop();
				ctx.pop();
			return last_end.scope;

			case '/':
				if ( last_ctx!==cxComment && last_ctx!==cxCommentLine ) {
					if ( cad[pos+1]==='/' ) { ctx.push( cxCommentLine ); return 'comment' }
					if ( cad[pos+1]==='*' ) { ctx.push( cxComment     ); return 'comment' }
				}
			break;

			case '{':
				if ( is_html ) {
					if ( last_ctx===cxHTMLParamsValue ) {
						state.is_fill_value = true;
					}

					end.push({ char:'}', scope:'key' });
					ctx.push( cxJS );

					switch ( cad[pos+1] ) {
						case 'b': if ( IsBuild  ( cad, pos+1 ) ) { ctx.push( cxJSScript ); } break;
						case 'r': if ( IsRequest( cad, pos+1 ) ) { ctx.push( cxJSScript ); } break;
						case '*': ctx.push( cxJSScript ); break;
					}

					return 'key';
				}
			break;

			case ';':
				if ( is_html ) {
					state.is_fill = undefined;

					while ( ctx.at( -1 ) && ctx.at( -1 )!==cxHTML ) ctx.pop();

					return 'tag_childs';
				}
				else if ( is_css ) {
					while ( ctx.at( -1 ) && ctx.at( -1 )!==cxCSS ) ctx.pop();

					if ( !!cad.slice( pos ).match( /^\s*[\w\-\_]+\s*\:\s*[^\:\<\>\s]/gm ) ) {
						ctx.push( cxCSSProperty );
					}

					return 'tag_childs';
				}
			break;

			case ':':
				if ( cad[pos+1]==='<' || cad[pos+1]==='>' ) {
					state.is_child = true;
					return 'tag_childs';
				}
			break;

			case '<':
			case '>':
				if ( state.is_child ) {
					state.is_child = undefined;

					if ( is_css ) {
						while ( ctx.at( -1 ) && ctx.at( -1 )!==cxCSS ) ctx.pop();

						if ( !!cad.slice( pos ).match( /^\s*[\w\-\_]+\s*\:\s*[^\:\<\>\s]/gm ) ) {
							ctx.push( cxCSSProperty );
						}
					}

					return 'tag_childs';
				}
			break;
		}

		if ( pos===0 ) {
			if ( is_html ) {
				state.is_fill = undefined;

				while ( ctx.at( -1 ) && ctx.at( -1 )!==cxHTML ) ctx.pop();
			}
			else if ( is_css && last_end?.char!==']' ) {
				while ( ctx.at( -1 ) && ctx.at( -1 )!==cxCSS ) ctx.pop();
			}
		}

		switch ( ctx.at( -1 ) ) {
			case cxComment:
				switch ( cad[pos] ) {
					case '/': if ( cad[pos-1]==='*' ) ctx.pop();
				}
			return 'comment';
			case cxCommentLine:
				if ( cad[pos+1]===undefined ) ctx.pop();
			return 'comment';
			case cxString:
			return 'string';



			case cxJS:
				switch ( cad[pos] ) {
					case 'c':
						if ( IsClass( cad, pos ) ) {
							ctx.push( cxJSClass );
							return 'class';
						}
						else if ( IsTimeOut( cad, pos ) ) {
							ctx.push( cxJSTimeout );
							return 'timeout';
						}
					break;

					case 'e':
						if ( IsElse( cad, pos ) ) {
							ctx.push( cxJSElse );
							return 'if';
						}
					break;

					case 'i':
						if ( cad[pos+1]==='f' && IsSpecial( cad, pos+2 ) ) {
							ctx.push( cxJSElse );
							return 'if';
						}
					break;

					case 't':
					case 'f':
						if ( IsTrue( cad, pos ) ) {
							ctx.push( cxJSTrue );
							return 'true';
						}
						else if ( IsThis( cad, pos ) ) {
							ctx.push( cxJSThis );
							return 'this';
						}
					break;

					case 'r':
						if ( IsReturn( cad, pos ) ) {
							end.push({ char:'n', scope:'return' });
							ctx.push( cxJSReturn );
							return 'return';
						}
					break;

					case 's':
						if ( IsTimeOut( cad, pos ) ) {
							ctx.push( cxJSTimeout );
							return 'timeout';
						}
					break;

					case'.':
						if ( IsNumberWord( cad, pos ) ) {
							ctx.push( cxJSNumber );

							return ( cad[pos]==='.' ) ? 'number_point' : 'number';
						}

						let res = IsJsProperty( cad, pos );

						if ( res===1 ) {
							ctx.push( cxJSPropertyFunction );
							return 'oproperty_point';
						}
						else if ( res===2 ) {
							ctx.push( cxJSProperty);
							return 'oproperty_point';
						}
					break;

					case '`':
						end.push({ char:cad[pos], scope:'string_key' });
						ctx.push( cxJSStringTemplate );
					return 'string_key';

					case '"':
					case "'":
						end.push({ char:cad[pos], scope:'string_key' });
						ctx.push( cxJSString );
					return 'string_key';

					case ';':
					return 'key';

					case '/':
						if ( IsRegExp( cad, pos ) ) {
							ctx.push( cxJSRegExp );
						}
					return 'operator';

					case '{':
						end.push({ char:'}', scope:'key' });
						ctx.push( cxJS );
					return 'key';

					case '[':
						end.push({ char:']', scope:'key' });
						ctx.push( cxJS );
					return 'key';

					case '(':
						end.push({ char:')', scope:'key' });
						ctx.push( cxJS );
					return 'key';

					case '=':
						if ( cad[pos+1]==='>' ) return 'arrow';
					return 'operator';

					case '>':
						if ( cad[pos-1]==='=' ) return 'arrow';
					return 'logic';

					case',':
					case'=':case'%':
					case'-':case'+':case'*':
					return 'operator';

					case'<':case'>':case'!':
					case'?':case'&':case'|':
					return 'logic';

					case'0':case'1':case'2':case'3':case'4':
					case'5':case'6':case'7':case'8':case'9':
						if ( IsNumberWord( cad, pos ) ) {
							switch ( cad[pos+1] ) {
								case'.':
								case'0':case'1':case'2':case'3':case'4':
								case'5':case'6':case'7':case'8':case'9':
									ctx.push( cxJSNumber );
								break;
							}

							return ( cad[pos]==='.' ) ? 'number_point' : 'number';
						}
					break;
				}
			return 'js';
			case cxJSScript:
				switch ( cad[pos] ) {
					case 'd':
					case 't':
					case '*':
						ctx.pop();
					break;
				}
			return 'return';
			case cxJSNumber:
				switch ( cad[pos+1] ) {
					case'.':
					case'0':case'1':case'2':case'3':case'4':
					case'5':case'6':case'7':case'8':case'9':
					break;

					default:
						ctx.pop();
					break;
				}

				switch ( cad[pos] ) {
					case'.':
					return 'number_point';

					case'0':case'1':case'2':case'3':case'4':
					case'5':case'6':case'7':case'8':case'9':
					return 'number';
				}
			return 'number';
			case cxJSProperty:
				if ( !IsValidLetter( cad, pos+1 ) ) {
					ctx.pop();
				}
			return 'oproperty';
			case cxJSPropertyFunction:
				if ( cad[pos+1]==='(' ) {
					ctx.pop();
				}
			return 'oproperty_function';
			case cxJSElse:
				if ( cad[pos]==='e' || cad[pos]==='f' )
					ctx.pop();
			return 'if';
			case cxJSTrue:
				if ( cad[pos]==='e' ) {
					ctx.pop();
				}
			return 'true';
			case cxJSThis:
				if ( cad[pos]==='s' ) {
					ctx.pop();
				}
			return 'this';
			case cxJSReturn:
			return 'return';
			case cxJSTimeout:
				if ( cad[pos]==='t' && cad[pos-1]==='u' && cad[pos-2]==='o' ) {
					ctx.pop();
				}
			return 'timeout';
			case cxJSRegExp:
				switch ( cad[pos] ) {
					case '(':
						end.push({ char:')', scope:'regexp_group' });
						ctx.push( cxJSRegExp );
					return 'regexp_group';

					case '[':
						end.push({ char:']', scope:'regexp_array' });
						ctx.push( cxJSRegExpChars );
					return 'regexp_array';

					case '*':
					case '.':
					return 'regexp_point';

					case '/':
						if ( IsRegExpLetter( cad, pos+1 ) ) {
							ctx.pop();
							ctx.push( cxJSRegExpLetters );
						}
						else ctx.pop();
					return 'key';
				}
			return 'regexp';
			case cxJSRegExpChars:
			return 'regexp_chars';
			case cxJSRegExpLetters:
				switch ( cad[pos+1] ) {
					case 'g':
					case 'm':
					case 'i':
					case 'y':
					case 'u':
					case 'v':
					case 's':
					case 'd': break;

					default: ctx.pop();
				}
			return 'regexp_letters';
			case cxJSString:
			return 'string';
			case cxJSStringTemplate:
				switch ( cad[pos] ) {
					case '$':
						if ( cad[pos+1]==='{' ) {
							ctx.push( cxJSStringTemplateScript );
							return 'key';
						}
					break;
				}
			return 'string';
			case cxJSStringTemplateScript:
				if ( cad[pos]==='{' ) {
					ctx.pop();
					end.push({ char:'}', scope:'key' });
					ctx.push( cxJS );
				}
			return 'key';
			case cxJSClass:
				switch ( cad[pos] ) {
					case '{':
						ctx.pop();
						ctx.push( cxJSClassBody );
						end.push({ char:'}', scope:'key' });
					return 'key';

					case ' ':
					case '\t':
						if ( !IsSpaces( cad, pos+1 ) ) {
							switch ( cad[pos+1] ) {
								case '{':
								break;

								case 'e':
									if ( IsExtends( cad, pos+1 ) ) {
										ctx.pop();
										ctx.push( cxJSClassExtends );
									}
								break;

								default:
									ctx.pop();
									ctx.push( cxJSClassName );
							}
						}
					return null;
				}
			return 'class';
			case cxJSClassName:
				switch ( cad[pos] ) {
					case '{':
						ctx.pop();
						ctx.push( cxJSClassBody );
						end.push({ char:'}', scope:'key' });
					break;

					case ' ':
					case '\t':
						if ( !IsSpaces( cad, pos+1 ) ) {
							switch ( cad[pos+1] ) {
								case '{':
								break;

								case 'e':
									if ( IsExtends( cad, pos+1 ) ) {
										ctx.pop();
										ctx.push( cxJSClassExtends );
										return 'class_extends';
									}
								break;
							}
						}
					return null;
				}
			return 'class_name';
			case cxJSClassExtends:
				switch ( cad[pos] ) {
					case '{':
						ctx.pop();
						ctx.push( cxJSClassBody );
						end.push({ char:'}', scope:'key' });
					return 'key';

					case ' ':
					case '\t':
						if ( !IsSpaces( cad, pos+1 ) ) {
							switch ( cad[pos+1] ) {
								case '{':
								break;

								default:
									ctx.pop();
									ctx.push( cxJSClassExtendsName );
							}
						}
					return null;
				}
			return 'class_extends';
			case cxJSClassExtendsName:
				switch ( cad[pos] ) {
					case '{':
						ctx.pop();
						ctx.push( cxJSClassBody );
						end.push({ char:'}', scope:'key' });
					return 'key';

					case ' ':
					case '\t':
					return null;

					case ':':
					return 'class_extends_points';
				}
			return 'class_extends_name';
			case cxJSClassBody:
				switch ( cad[pos] ) {
					case ' ':
					case '\t':
					return null;

					case '{':
						end.push({ char:'}', scope:'key' });
						ctx.push( cxJS );
					return 'key';

					case 'V':
						if ( IsView( cad, pos ) ) {
							ctx.push( cxJSClassView );
							return 'function_name';
						}

					case 'S':
						if ( IsStyle( cad, pos ) ) {
							ctx.push( cxJSClassStyle );
							return 'function_name';
						}

					default:
						if ( IsFunction( cad, pos ) ) {
							ctx.push( cxJSFunction );

							if ( IsStatic( cad, pos ) ) {
								ctx.push( cxJSStatic );
								return 'static';
							}
							if ( IsAsync( cad, pos ) ) {
								ctx.push( cxJSAsync );
								return 'async';
							}

							return 'function_name';
						}
				}
			return 'class_body';
			case cxJSClassView:
				switch ( cad[pos] ) {
					case ' ':
					case '\t':
					return null;

					case '(':
					case ')':
					return 'key';

					case '{':
						end.push({ char:'}', scope:'key' });
						ctx.pop();
						ctx.push( cxHTML );
					return 'key';
				}
			return 'function_name';
			case cxJSClassStyle:
				switch ( cad[pos] ) {
					case ' ':
					case '\t':
					return null;

					case '(':
					case ')':
					return 'key';

					case '{':
						end.push({ char:'}', scope:'key' });
						ctx.pop();
						ctx.push( cxCSS );
					return 'key';
				}
			return 'function_name';
			case cxJSFunction:
				switch ( cad[pos] ) {
					case ' ':
					case '\t':
					return null;

					case '(':
						ctx.push( cxJSFunctionParams );
					return 'key';

					case '{':
						ctx.pop();
						ctx.push( cxJS );
						end.push({ char:'}', scope:'key' });
					return 'key';

					case 'a':
						if ( IsAsync( cad, pos ) ) {
							ctx.push( cxJSAsync );
							return 'async';
						}
					break;
				}
			return 'function_name';
			case cxJSFunctionParams:
				switch ( cad[pos] ) {
					case ' ':
					case '\t':
					return null;

					case ',':
					return 'key';

					case ')':
						ctx.pop();
					return 'key';
				}
			return 'function_params';
			case cxJSStatic:
				if ( cad[pos]==='c' ) ctx.pop();
			return 'static';
			case cxJSAsync:
				if ( cad[pos]==='c' ) ctx.pop();
			return 'async';



			case cxCSS:
				switch ( cad[pos] ) {
					case ' ':
					case '\t': return null;

					case '[':
						end.push({ char:']', scope:'key' });
						ctx.push( cxCSSParams );
					return 'key';

					case '@':
						ctx.push( cxCSSMedia );
					return 'media_key';

					case '*':
					return 'selector_id';

					case '+':
					case '>':
					return 'selector_key';

					case '.':
						ctx.push( cxCSSClass );
					return 'selector_class_key';

					case '#':
						ctx.push( cxCSSId );
					return 'selector_id_key';

					case ':':
						if ( cad[pos+1]===':' ) {
							ctx.push( cxCSSPseudo );
							return 'selector_points';
						}
					return 'selector';

					default:
						if ( !!cad.slice( pos ).match( /^\s*[\w\-\_]+\s*\:\s*[^\:\<\>\s]/gm ) ) {
							ctx.push( cxCSSProperty );
							return 'property';
						}
				}
			return 'selector';
			case cxCSSPseudo:
				switch ( cad[pos] ) {
					case ':':
					return 'selector_points';
				}

				if ( IsSpecial( cad, pos+1 ) ) {
					ctx.pop();
				}
			return 'selector_pseudo';
			case cxCSSClass:
				if ( IsSpecial( cad, pos+1 ) ) {
					ctx.pop();
				}
			return 'selector_class';
			case cxCSSId:
				if ( IsSpecial( cad, pos+1 ) ) {
					ctx.pop();
				}
			return 'selector_id';
			case cxCSSParams:
				switch ( cad[pos] ) {
					case ' ':
					case '\t':
					return null;

					case '=':
						ctx.push( cxCSSParamsValue );
					return 'selector_params_equal';
				}
			return 'selector_params';
			case cxCSSParamsValue:
				if ( cad[pos-1]==='=' ) state.is_fill_value = true;

				switch ( cad[pos] ) {
					case ' ':
					case '\t':
					return null;

					case '"':
					case "'":
						state.is_fill_value = true;
						ctx.pop();
						ctx.push( cxCSSString );
						end.push({ char:cad[pos], scope:'string_key' });
					return 'string_key';

					default: state.is_fill_value = true;
				}

				if ( state.is_fill_value && IsSpecial( cad, pos+1 ) ) {
					state.is_fill_value = undefined;
					ctx.pop();
				}
			return 'selector_params_value';
			case cxCSSString:
			return 'string';
			case cxCSSProperty:
				switch ( cad[pos] ) {
					case ' ':
					case '\t':
					return null;

					case ':':
						ctx.push( cxCSSPropertyValue );
					return 'property_points';
				}
			return 'property';
			case cxCSSPropertyValue:
				switch ( cad[pos] ) {
					case ' ':
					case '\t': return null;

					case '$':
						ctx.push( cxCSSPropertyValueVariable );
					return 'property_value_variable';

					case '"':
					case "'":
						end.push({ char:cad[pos], scope:'string_key' });
						ctx.push( cxCSSString );
					return 'string_key';

					case ',':
					return 'property_value_point';

					case '(':
					case ')': return 'property_value_key';

					case'.':case'-':
					case'0':case'1':case'2':case'3':case'4':
					case'5':case'6':case'7':case'8':case'9':
						if ( IsNumber( cad, pos ) ) {
							ctx.push( cxCSSPropertyValueNumber );

							switch ( cad[pos] ) {
								case '-': return 'property_value_number_key';
								case '.': return 'property_value_number_point';
								default : return 'property_value_number';
							}
						}

					default:
						if ( cad.slice( pos ).match( /\w+\(/gm ) ) {
							ctx.push( cxCSSPropertyValueFunction );
							return 'property_value_function';
						}
				}
			return 'property_value';
			case cxCSSPropertyValueVariable:
				if ( IsSpecial( cad, pos+1 ) ) {
					ctx.pop();
				}
			return 'property_value_variable';
			case cxCSSPropertyValueNumber:
				switch ( cad[pos] ) {
					case'.':
					return 'property_value_number_point';
				}

				switch ( cad[pos+1] ) {
					case'.':
					case'0':case'1':case'2':case'3':case'4':
					case'5':case'6':case'7':case'8':case'9':
					break;

					case '%':
						ctx.pop();
						ctx.push( cxCSSPropertyValueScale );
					break;

					case 's':
						ctx.pop();

						if ( IsSpecial( cad, pos+2 ) ) {
							ctx.push( cxCSSPropertyValueScale );
						}
					break;
					case 'c':
						ctx.pop();

						if (
							(
								cad[pos+2]==='m' ||
								cad[pos+2]==='h'
							) &&
							IsSpecial( cad, pos+3 )
						) {
							ctx.push( cxCSSPropertyValueScale );
						}
					break;
					case 'i':
						ctx.pop();

						if ( cad[pos+2]==='n' && IsSpecial( cad, pos+3 ) ) {
							ctx.push( cxCSSPropertyValueScale );
						}
					break;
					case 'm':
						ctx.pop();

						if (
							(
								cad[pos+2]==='s' ||
								cad[pos+2]==='m'
							) &&
							IsSpecial( cad, pos+3 )
						) {
							ctx.push( cxCSSPropertyValueScale );
						}
					break;
					case 'p':
						ctx.pop();

						if (
							(
								cad[pos+2]==='x' ||
								cad[pos+2]==='t' ||
								cad[pos+2]==='c'
							) &&
							IsSpecial( cad, pos+3 )
						) {
							ctx.push( cxCSSPropertyValueScale );
						}
					break;
					case 'e':
						ctx.pop();

						if (
							(
								cad[pos+2]==='m' ||
								cad[pos+2]==='x'
							) &&
							IsSpecial( cad, pos+3 )
						) {
							ctx.push( cxCSSPropertyValueScale );
						}
					break;
					case 'r':
						ctx.pop();

						if (
							cad[pos+2]==='e' &&
							cad[pos+3]==='m' &&
							IsSpecial( cad, pos+4 )
						) {
							ctx.push( cxCSSPropertyValueScale );
						}
					break;
					case 'v':
						ctx.pop();

						if (
							(
								cad[pos+2]==='w' ||
								cad[pos+2]==='h'
							) &&
							IsSpecial( cad, pos+3 )
						) {
							ctx.push( cxCSSPropertyValueScale );
						}
						else if (
							cad[pos+2]==='m' &&
							( cad[pos+3]==='i' || cad[pos+3]==='a' ) &&
							( cad[pos+4]==='n' || cad[pos+4]==='x' ) &&
							IsSpecial( cad, pos+5 )
						) {
							ctx.push( cxCSSPropertyValueScale );
						}
					break;

					default:
						ctx.pop();
				}
			return 'property_value_number';
			case cxCSSPropertyValueScale:
				switch ( cad[pos] ) {
					case '%':
					case 's':
						ctx.pop();
					break;

					case 'm':
						switch ( cad[pos-1] ) {
							case 'c':
							case 'e':
								ctx.pop();
							break;
						}
					break;

					case 'c':
						switch ( cad[pos-1] ) {
							case 'p':
								ctx.pop();
							break;
						}
					break;

					case 'w':
					case 'h':
					case 't':
					case 'x':
					case 'n':
						ctx.pop();
					break;
				}
			return 'property_value_number_scale';
			case cxCSSPropertyValueFunction:
				switch ( cad[pos] ) {
					case ' ':
					case '\t': return null;
				}

				if ( cad[pos+1]==='(' ) {
					ctx.pop();
				}
			return 'property_value_function';
			case cxCSSMedia:
			return 'media';



			case cxHTML:
				switch ( cad[pos] ) {
					case ' ':
					case '\t':
						if ( state.is_fill ) {
							ctx.push( cxHTMLParams );
						}
					return null;

					case '.':
					case '*':
					case '#':
					case '!':
						state.is_fill = true;
					return 'tag_key';

					case '>':
						state.is_fill = true;

						ctx.push( cxHTMLBody );
					return 'tag_body_key';

					default: state.is_fill = true;
				}
			return 'tag';
			case cxHTMLString:
			return 'string';
			case cxHTMLParams:
				switch ( cad[pos] ) {
					case ' ':
					case '\t':
					return null;

					case '(':
						ctx.push( cxHTMLEvent );
					return 'key';

					case '>':
						ctx.pop();
						ctx.push( cxHTMLBody );
					return 'tag_body_key';

					case '=':
						state.is_fill_value = undefined;
						ctx.push( cxHTMLParamsValue );
					return 'tag_equal';
				}
			return 'tag_params';
			case cxHTMLParamsValue:
				switch ( cad[pos] ) {
					case ' ':
					case '\t':
						if ( state.is_fill_value ) {
							state.is_fill_value = undefined;
							ctx.pop();
						}
					return null;

					case 't':
					case 'f':
						if ( IsTrue( cad, pos ) ) {
							ctx.pop();
							ctx.push( cxHTMLParamsTrue );

							return 'tag_keyword';
						}
					break;
					case 'n':
						if ( IsNull( cad, pos ) ) {
							ctx.pop();
							ctx.push( cxHTMLParamsNull );
							return 'tag_keyword';
						}
					break;
					case 'u':
						if ( IsUndefined( cad, pos ) ) {
							ctx.pop();
							ctx.push( cxHTMLParamsUndefined );
							return 'tag_keyword';
						}
					break;

					case '>':
						ctx.pop();
						ctx.pop();
						ctx.push( cxHTMLBody );
					return 'tag_body_key';

					case '"':
					case "'":
						state.is_fill_value = true;
						end.push({ char:cad[pos], scope:'string_key' });
						ctx.push( cxHTMLString );
					return 'string_key';

					case'.':case'-':
					case'0':case'1':case'2':case'3':case'4':
					case'5':case'6':case'7':case'8':case'9':
						if ( IsNumber( cad, pos ) ) {
							ctx.pop();
							ctx.push( cxHTMLParamsNumber );

							switch ( cad[pos] ) {
								case '-': return 'tag_number_key';
								case '.': return 'tag_number_point';
								default : return 'tag_number';
							}
						}
					break;

					default:
						state.is_fill_value = true;
				}
			return 'tag_value'
			case cxHTMLParamsNumber:
				switch ( cad[pos] ) {
					case '.':
					return 'tag_number_point';
				}

				switch ( cad[pos+1] ) {
					case'.':
					case'0':case'1':case'2':case'3':case'4':
					case'5':case'6':case'7':case'8':case'9':
					break;

					default:
						ctx.pop();
				}
			return 'tag_number';
			case cxHTMLParamsTrue:
				switch ( cad[pos] ) {
					case 'e':
						ctx.pop();
					return 'tag_keyword';
				}
			return 'tag_keyword';
			case cxHTMLParamsNull:
				switch ( cad[pos] ) {
					case 'l':
						if ( cad[pos-1]==='l' ) {
							ctx.pop();
						}
					return 'tag_keyword';
				}
			return 'tag_keyword';
			case cxHTMLParamsUndefined:
				switch ( cad[pos] ) {
					case 'd':
						if ( cad[pos-1]==='e' ) {
							ctx.pop();
						}
					return 'tag_keyword';
				}
			return 'tag_keyword';
			case cxHTMLEvent:
				switch ( cad[pos] ) {
					case ' ':
					case '\t':
					return null;

					case ':':
						ctx.pop();
						ctx.push( cxHTMLEventParams );
					return 'tag_event_points';

					case ')':
						ctx.pop();
					return 'tag_event_key';
				}
			return 'tag_event';
			case cxHTMLEventParams:
				switch ( cad[pos] ) {
					case ' ':
					case '\t':
					return null;

					case ')':
						ctx.pop();
					return 'tag_event_key';

					case ',':
					return 'tag_event_key';
				}
			return 'tag_event_params';
			case cxHTMLBody:
			return 'tag_body';
		}

		return null;
	}
	// **************************************************

	/* Inicio */
	return { token, startState:()=>({ ctx:[super_ctx], end:[] }) };
	// **************************************************
}

function ModeMemeJS( CodeMirror ) {
	CodeMirror.defineMode( 'memejs'     , DefinitionMeme.bind( this, 200 ) );
	CodeMirror.defineMIME( 'text/x-meme', 'memejs'                         );
}
function ModeMemeCSS( CodeMirror ) {
	CodeMirror.defineMode( 'memecss'       , DefinitionMeme.bind( this, 300 ) );
	CodeMirror.defineMIME( 'text/x-memecss', 'memecss'                        );
}
function ModeMemeHTML( CodeMirror ) {
	CodeMirror.defineMode( 'memehtml'       , DefinitionMeme.bind( this, 400 ) );
	CodeMirror.defineMIME( 'text/x-memehtml', 'memehtml'                       );
}
// ####################################################################################################


/* Inicio */
function Inicio() {
	if ( typeof define==='function' && define.amd ) {
		define( ['./codemirror'], ModeMemeJS   );
		define( ['./codemirror'], ModeMemeCSS  );
		define( ['./codemirror'], ModeMemeHTML );
	}
	else {
		const com = ( typeof exports==='object' && typeof module==='object' ) ? require( './codemirror' ) : CodeMirror;

		ModeMemeJS  ( com );
		ModeMemeCSS ( com );
		ModeMemeHTML( com );
	}
};Inicio();
// ####################################################################################################