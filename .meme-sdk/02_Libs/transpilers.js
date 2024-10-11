//                    Copyright meme.js Authors
//     Distributed under the Boost Software License, Version 1.1.
// (See accompanying file LICENSE or copy at https://mjs.red/LICENSE)


/* Importaciones */
const {
	Hash,
	Typeof,
	VlqEncode,
	ParsePath,
	ClassToTag,
} = require( './lib' );
// ###################################################################################################


/* Constantes */
const cxCSS         = 1, cxHTML         = 2, cxJS        = 3, cxBuild      = 4, cxRequest = 5, cxPointer    = 6, cxWrite       = 7;
const thNone        = 1, thTag          = 2, thDoctype   = 3, thScript     = 4;
const tcProperty    = 1, tcSelector     = 2, tcKeyframes = 3, tcFontface   = 4, tcMedia   = 5, tcScript     = 6, tcExclude     = 7, tcThemeDark     = 8, tcThemeLight = 9;
const tzFrontPublic = 1, tzFrontPrivate = 2, tzBackEdge  = 3, tzBackSocket = 4, tzBackTcp = 5, tzBackPublic = 6, tzBackPrivate = 7, tzConfiguration = 8;

const tagIgnore = {
	'feOffset'      : 1,
	'feGaussianBlur': 1,
	'feBlend'       : 1,
	'feDropShadow'  : 1,
	'radialGradient': 1,
};
const cssPropertyProc = {
	"-webkit-text-stroke"        : 1,
	"background-position"        : 1,
	"background-position-x"      : 1,
	"background-position-y"      : 1,
	"background-size"            : 1,
	"block-size"                 : 1,
	"border"                     : 1,
	"border-block"               : 1,
	"border-block-end"           : 1,
	"border-block-end-width"     : 1,
	"border-block-start"         : 1,
	"border-block-start-width"   : 1,
	"border-block-width"         : 1,
	"border-bottom"              : 1,
	"border-bottom-left-radius"  : 1,
	"border-bottom-right-radius" : 1,
	"border-bottom-width"        : 1,
	"border-inline"              : 1,
	"border-inline-end"          : 1,
	"border-inline-start"        : 1,
	"border-inline-width"        : 1,
	"border-left"                : 1,
	"border-left-width"          : 1,
	"border-radius"              : 1,
	"border-right"               : 1,
	"border-right-width"         : 1,
	"border-spacing"             : 1,
	"border-top"                 : 1,
	"border-top-left-radius"     : 1,
	"border-top-right-radius"    : 1,
	"border-width"               : 1,
	"bottom"                     : 1,
	"box-shadow"                 : 1,
	"clip"                       : 1,
	"column-gap"                 : 1,
	"column-rule-width"          : 1,
	"column-width"               : 1,
	"flex-basis"                 : 1,
	"font-size"                  : 1,
	"gap"                        : 1,
	"grid"                       : 1,
	"grid-gap"                   : 1,
	"grid-template"              : 1,
	"height"                     : 1,
	"inline-size"                : 1,
	"inset"                      : 1,
	"inset-block"                : 1,
	"inset-block-end"            : 1,
	"inset-block-start"          : 1,
	"inset-inline"               : 1,
	"inset-inline-end"           : 1,
	"inset-inline-start"         : 1,
	"left"                       : 1,
	"letter-spacing"             : 1,
	"margin"                     : 1,
	"margin-block"               : 1,
	"margin-block-end"           : 1,
	"margin-bottom"              : 1,
	"margin-inline"              : 1,
	"margin-inline-end"          : 1,
	"margin-inline-start"        : 1,
	"margin-left"                : 1,
	"margin-right"               : 1,
	"margin-top"                 : 1,
	"mask-size"                  : 1,
	"max-block-size"             : 1,
	"max-height"                 : 1,
	"max-inline-size"            : 1,
	"max-width"                  : 1,
	"min-block-size"             : 1,
	"min-height"                 : 1,
	"min-inline-size"            : 1,
	"min-width"                  : 1,
	"offset"                     : 1,
	"offset-anchor"              : 1,
	"offset-distance"            : 1,
	"outline"                    : 1,
	"outline-offset"             : 1,
	"outline-width"              : 1,
	"padding"                    : 1,
	"padding-block"              : 1,
	"padding-block-end"          : 1,
	"padding-block-start"        : 1,
	"padding-bottom"             : 1,
	"padding-inline"             : 1,
	"padding-inline-end"         : 1,
	"padding-inline-start"       : 1,
	"padding-left"               : 1,
	"padding-right"              : 1,
	"padding-top"                : 1,
	"perspective"                : 1,
	"right"                      : 1,
	"row-gap"                    : 1,
	"scroll-padding"             : 1,
	"scroll-padding-block"       : 1,
	"scroll-padding-block-end"   : 1,
	"scroll-padding-block-start" : 1,
	"scroll-padding-bottom"      : 1,
	"scroll-padding-inline"      : 1,
	"scroll-padding-inline-end"  : 1,
	"scroll-padding-inline-start": 1,
	"scroll-padding-left"        : 1,
	"scroll-padding-right"       : 1,
	"scroll-padding-top"         : 1,
	"scroll-snap-coordinate"     : 1,
	"scroll-snap-destination"    : 1,
	"shape-margin"               : 1,
	"stroke-width"               : 1,
	"text-shadow"                : 1,
	"text-stroke"                : 1,
	"top"                        : 1,
	"width"                      : 1,
	"word-spacing"               : 1,
};
// ###################################################################################################


/* Is */
function IsComment( cad, pos ) {
	return (
		( cad[pos]==='/' && cad[pos + 1]==='*' ) ||
		( cad[pos]==='/' && cad[pos + 1]==='/' )
	);
}
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
		case '\'':
		case '\n':
		case '\r':
		case '\t':
		case ' ' : return true;
		default  : return false;
	}
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
function IsSpacesLine( cad, pos ) {
	return cad[pos]==='\n' || cad[pos]==='\r';
}
function IsSpacesTabs( cad, pos ) {
	return cad[pos]===' ' || cad[pos]==='\t';
}
function IsLetter( cad, pos ) {
	return (
		( cad[pos]>='a' && cad[pos]<='z' ) ||
		( cad[pos]>='A' && cad[pos]<='Z' )
	);
}
function IsNumber( cad, pos ) {
	return cad[pos]>='0' && cad[pos]<='9';
}
function IsValidLetter( cad, pos ) {
	return (
		cad[pos]==='⎨' ||
		cad[pos]==='⎬' ||
		cad[pos]==='-' ||
		cad[pos]==='_' ||
		IsLetter( cad, pos ) ||
		IsNumber( cad, pos )
	);
}
function IsValidValue( cad, pos ) {
	return (
		cad[pos]==='⎨' ||
		cad[pos]==='⎬' ||
		cad[pos]==='-' ||
		cad[pos]==='_' ||
		cad[pos]==='(' ||
		cad[pos]===')' ||
		cad[pos]==='“' ||
		cad[pos]==='”' ||
		IsLetter( cad, pos ) ||
		IsNumber( cad, pos )
	);
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
function IsVoid( cad ) {
	let pos = 0;

	for ( ;pos<cad.length && IsSpaces( cad, pos ); pos++ );

	return pos===cad.length;
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
	let len = cad.length;

	if ( pos!=null ) len = pos;

	for ( len--; len>=0 && IsSpaces( cad, len ); len-- );

	if      ( cad[len]==='n'            ) return IsReturn( cad, len - 5 );
	else if ( IsValidLetter( cad, len ) ) return false;

	return (
		len===0 ||
		IsOperator( cad, len ) ||
		cad[len]==='=' ||
		cad[len]===',' ||
		cad[len]===';' ||
		cad[len]==='(' ||
		cad[len]==='[' ||
		cad[len]==='{' ||
		cad[len]==='&' ||
		cad[len]==='|'
	);
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
			cxRequest
		) ||
		(
			cad[pos + 1]==='b' &&
			cad[pos + 2]==='u' &&
			cad[pos + 3]==='i' &&
			cad[pos + 4]==='l' &&
			cad[pos + 5]==='d' &&
			( ( pos + 6 )>=cad.length || IsSpecial( cad, pos + 6 ) ) &&
			cxBuild
		) ||
		(
			cad[pos + 1]==='w' &&
			cad[pos + 2]==='r' &&
			cad[pos + 3]==='i' &&
			cad[pos + 4]==='t' &&
			cad[pos + 5]==='e' &&
			( ( pos + 6 )>=cad.length || IsSpecial( cad, pos + 6 ) ) &&
			cxWrite
		) ||
		(
			cad[pos + 1]==='m' &&
			cad[pos + 2]==='h' &&
			( ( pos + 3 )>=cad.length || IsSpecial( cad, pos + 3 ) ) &&
			cxHTML
		) ||
		(
			cad[pos + 1]==='m' &&
			cad[pos + 2]==='c' &&
			( ( pos + 3 )>=cad.length || IsSpecial( cad, pos + 3 ) ) &&
			cxCSS
		) ||
		(
			cad[pos + 1]==='m' &&
			cad[pos + 2]==='j' &&
			( ( pos + 3 )>=cad.length || IsSpecial( cad, pos + 3 ) ) &&
			cxJS
		) ||
		(
			cad[pos + 1]==='*' &&
			cxPointer
		) ||
		(
			( ctx===cxHTML || ctx===cxCSS ) &&
			cxJS
		)
	);
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
function IsCalc( cad, pos ) {
	return (
		cad[pos    ]==='c' &&
		cad[pos + 1]==='a' &&
		cad[pos + 2]==='l' &&
		cad[pos + 3]==='c' &&
		( ( pos + 4 )>=cad.length || IsSpecial( cad, pos + 4 ) ) &&
		( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
	);
}

/* Get */
function GetComment( cad, pos ) {
	switch ( cad[pos + 1] ) {
		case '/': for ( pos+= 2; pos<cad.length && !IsSpacesLine( cad, pos )                ; pos++ ); return pos - 1;
		case '*': for ( pos+= 2; pos<cad.length && !( cad[pos]==='*' && cad[pos + 1]==='/' ); pos++ ); return pos + 1;
		default : return pos;
	}
}
function GetRegExp( res, cad, pos ) {
	let body = cad[pos++];

	for ( ;pos<cad.length; pos++ ) {
		switch ( cad[pos] ) {
			case '\\': body+= cad[pos] + cad[++pos]; break;
			case '/' : body+= cad[pos]; return [res+body, pos];
			default  : body+= cad[pos];
		}
	}

	return [res+body, pos];
}
// ###################################################################################################


/* Exportaciones */
module.exports = function() {
	/* Declaraciones */
	let EXEC   ;
	let CONFIG ;
	let ADDRESS;
	let IDS    = 0;
	let CORE   = true;
	// **************************************************


	/* Funciones */
	function Configure({ config, address, exec, include_core }) {
		CORE = include_core ?? true;

		if ( CONFIG || ( !config && !address && !exec ) ) return;

		EXEC    = exec;
		CONFIG  = config;
		ADDRESS = address;

		if ( !CONFIG.constants.APP && ADDRESS?.app?.protocol && ADDRESS?.app?.host && ADDRESS?.app?.port ) CONFIG.constants.APP = `${ADDRESS.app.protocol}://${ADDRESS.app.host}:${ADDRESS.app.port}`;
		if ( !CONFIG.constants.API && ADDRESS?.api?.protocol && ADDRESS?.api?.host && ADDRESS?.api?.port ) CONFIG.constants.API = `${ADDRESS.api.protocol}://${ADDRESS.api.host}:${ADDRESS.api.port}`;
		if ( !CONFIG.constants.RES && ADDRESS?.res?.protocol && ADDRESS?.res?.host && ADDRESS?.res?.port ) CONFIG.constants.RES = `${ADDRESS.res.protocol}://${ADDRESS.res.host}:${ADDRESS.res.port}`;
	}
	// **************************************************


	/* General */
	async function TranspileGeneral( code, context, ofile ) {
		/* Is */
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
		function IsZone( cad, pos ) {
			if ( cad[pos + 1]!=='/' ) return false;

			for ( pos+= 2; pos<cad.length && IsSpacesTabs( cad, pos ); pos++ );

			return (
				(
					cad[pos     ]==='f' &&
					cad[pos + 1 ]==='r' &&
					cad[pos + 2 ]==='o' &&
					cad[pos + 3 ]==='n' &&
					cad[pos + 4 ]==='t' &&
					cad[pos + 5 ]==='-' &&
					cad[pos + 6 ]==='p' &&
					cad[pos + 7 ]==='u' &&
					cad[pos + 8 ]==='b' &&
					cad[pos + 9 ]==='l' &&
					cad[pos + 10]==='i' &&
					cad[pos + 11]==='c' &&
					IsSpacesLine( cad, pos + 12 )
				)
				||
				(
					cad[pos     ]==='f' &&
					cad[pos + 1 ]==='r' &&
					cad[pos + 2 ]==='o' &&
					cad[pos + 3 ]==='n' &&
					cad[pos + 4 ]==='t' &&
					cad[pos + 5 ]==='-' &&
					cad[pos + 6 ]==='p' &&
					cad[pos + 7 ]==='r' &&
					cad[pos + 8 ]==='i' &&
					cad[pos + 9 ]==='v' &&
					cad[pos + 10]==='a' &&
					cad[pos + 11]==='t' &&
					cad[pos + 12]==='e' &&
					IsSpacesLine( cad, pos + 13 )
				)
				||
				(
					cad[pos    ]==='b' &&
					cad[pos + 1]==='a' &&
					cad[pos + 2]==='c' &&
					cad[pos + 3]==='k' &&
					cad[pos + 4]==='-' &&
					cad[pos + 5]==='e' &&
					cad[pos + 6]==='d' &&
					cad[pos + 7]==='g' &&
					cad[pos + 8]==='e' &&
					IsSpacesLine( cad, pos + 9 )
				)
				||
				(
					cad[pos    ]==='b' &&
					cad[pos + 1]==='a' &&
					cad[pos + 2]==='c' &&
					cad[pos + 3]==='k' &&
					cad[pos + 4]==='-' &&
					cad[pos + 5]==='t' &&
					cad[pos + 6]==='c' &&
					cad[pos + 7]==='p' &&
					IsSpacesLine( cad, pos + 8 )
				)
				||
				(
					cad[pos     ]==='b' &&
					cad[pos + 1 ]==='a' &&
					cad[pos + 2 ]==='c' &&
					cad[pos + 3 ]==='k' &&
					cad[pos + 4 ]==='-' &&
					cad[pos + 5 ]==='s' &&
					cad[pos + 6 ]==='o' &&
					cad[pos + 7 ]==='c' &&
					cad[pos + 8 ]==='k' &&
					cad[pos + 9 ]==='e' &&
					cad[pos + 10]==='t' &&
					IsSpacesLine( cad, pos + 11 )
				)
				||
				(
					cad[pos     ]==='b' &&
					cad[pos + 1 ]==='a' &&
					cad[pos + 2 ]==='c' &&
					cad[pos + 3 ]==='k' &&
					cad[pos + 4 ]==='-' &&
					cad[pos + 5 ]==='p' &&
					cad[pos + 6 ]==='u' &&
					cad[pos + 7 ]==='b' &&
					cad[pos + 8 ]==='l' &&
					cad[pos + 9 ]==='i' &&
					cad[pos + 10]==='c' &&
					IsSpacesLine( cad, pos + 11 )
				)
				||
				(
					cad[pos     ]==='b' &&
					cad[pos + 1 ]==='a' &&
					cad[pos + 2 ]==='c' &&
					cad[pos + 3 ]==='k' &&
					cad[pos + 4 ]==='-' &&
					cad[pos + 5 ]==='p' &&
					cad[pos + 6 ]==='r' &&
					cad[pos + 7 ]==='i' &&
					cad[pos + 8 ]==='v' &&
					cad[pos + 9 ]==='a' &&
					cad[pos + 10]==='t' &&
					cad[pos + 11]==='e' &&
					IsSpacesLine( cad, pos + 12 )
				)
				||
				(
					cad[pos     ]==='c' &&
					cad[pos + 1 ]==='o' &&
					cad[pos + 2 ]==='n' &&
					cad[pos + 3 ]==='f' &&
					cad[pos + 4 ]==='i' &&
					cad[pos + 5 ]==='g' &&
					cad[pos + 6 ]==='u' &&
					cad[pos + 7 ]==='r' &&
					cad[pos + 8 ]==='a' &&
					cad[pos + 9 ]==='t' &&
					cad[pos + 10]==='i' &&
					cad[pos + 11]==='o' &&
					cad[pos + 12]==='n' &&
					IsSpacesLine( cad, pos + 13 )
				)
			);
		}
		function IsSuper( cad, pos ) {
			if (
				!(
					cad[pos    ]==='s' &&
					cad[pos + 1]==='u' &&
					cad[pos + 2]==='p' &&
					cad[pos + 3]==='e' &&
					cad[pos + 4]==='r' &&
					( ( pos + 5 )>=cad.length || IsSpecial( cad, pos + 5 ) ) &&
					( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
				)
			) return false;

			for ( pos+= 5; pos<cad.length && IsSpaces( cad, pos ); pos++ );

			if ( cad[pos]!=='.' ) return false;

			for ( pos++; pos<cad.length && IsSpaces     ( cad, pos ); pos++ );
			for (      ; pos<cad.length && IsValidLetter( cad, pos ); pos++ );
			for (      ; pos<cad.length && IsSpaces     ( cad, pos ); pos++ );

			return cad[pos]==='(';
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

			for ( pos+= 5; pos<cad.length && IsSpacesTabs( cad, pos ); pos++ );

			if ( cad[pos]!=='>' ) return false;

			for ( pos+= 1; pos<cad.length && IsSpacesTabs( cad, pos ); pos++ );

			return cad[pos]==='{';
		}
		function IsScriptTag( cad, pos ) {
			if (
				!(
					( cad[pos    ]==='s' || cad[pos    ]==='S' ) &&
					( cad[pos + 1]==='c' || cad[pos + 1]==='C' ) &&
					( cad[pos + 2]==='r' || cad[pos + 2]==='R' ) &&
					( cad[pos + 3]==='i' || cad[pos + 3]==='I' ) &&
					( cad[pos + 4]==='p' || cad[pos + 4]==='P' ) &&
					( cad[pos + 5]==='t' || cad[pos + 5]==='T' ) &&
					( ( pos + 6 )>=cad.length || IsSpecial( cad, pos + 6 ) ) &&
					( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
				)
			) return false;

			for ( pos+= 6; pos<cad.length && IsSpacesTabs( cad, pos ); pos++ );

			if ( cad[pos]!=='>' ) return false;

			for ( pos+= 1; pos<cad.length && IsSpacesTabs( cad, pos ); pos++ );

			return cad[pos]==='{';
		}
		function IsRequire( cad, pos ) {
			if (
				!(
					cad[pos    ]==='r' &&
					cad[pos + 1]==='e' &&
					cad[pos + 2]==='q' &&
					cad[pos + 3]==='u' &&
					cad[pos + 4]==='i' &&
					cad[pos + 5]==='r' &&
					cad[pos + 6]==='e' &&
					( ( pos + 7 )>=cad.length || IsSpecial( cad, pos + 7 ) ) &&
					( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
				)
			) return false;

			for ( pos+=7; pos<cad.length && IsSpaces( cad, pos ); pos++ );

			return cad[pos]==='(';
		}
		function IsAdd( cad, pos ) {
			return (
				cad[pos    ]==='A' &&
				cad[pos + 1]==='d' &&
				cad[pos + 2]==='d' &&
				( ( pos + 3 )>=cad.length || IsSpecial( cad, pos + 3 ) ) &&
				( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
			);
		}
		function IsRemove( cad, pos ) {
			return (
				cad[pos    ]==='R' &&
				cad[pos + 1]==='e' &&
				cad[pos + 2]==='m' &&
				cad[pos + 3]==='o' &&
				cad[pos + 4]==='v' &&
				cad[pos + 5]==='e' &&
				( ( pos + 6 )>=cad.length || IsSpecial( cad, pos + 6 ) ) &&
				( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
			);
		}
		function IsAtts( cad, pos ) {
			return (
				cad[pos    ]==='A' &&
				cad[pos + 1]==='t' &&
				cad[pos + 2]==='t' &&
				cad[pos + 3]==='s' &&
				( ( pos + 4 )>=cad.length || IsSpecial( cad, pos + 4 ) ) &&
				( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
			);
		}
		function IsClass( cad, pos ) {
			return (
				cad[pos    ]==='C' &&
				cad[pos + 1]==='l' &&
				cad[pos + 2]==='a' &&
				cad[pos + 3]==='s' &&
				cad[pos + 4]==='s' &&
				( ( pos + 5 )>=cad.length || IsSpecial( cad, pos + 5 ) ) &&
				( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
			);
		}
		function IsCss( cad, pos ) {
			return (
				cad[pos    ]==='C' &&
				cad[pos + 1]==='s' &&
				cad[pos + 2]==='s' &&
				( ( pos + 3 )>=cad.length || IsSpecial( cad, pos + 3 ) ) &&
				( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
			);
		}
		function IsEvents( cad, pos ) {
			return (
				cad[pos    ]==='E' &&
				cad[pos + 1]==='v' &&
				cad[pos + 2]==='e' &&
				cad[pos + 3]==='n' &&
				cad[pos + 4]==='t' &&
				cad[pos + 5]==='s' &&
				( ( pos + 6 )>=cad.length || IsSpecial( cad, pos + 6 ) ) &&
				( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
			);
		}
		function IsPosition( cad, pos ) {
			return (
				cad[pos    ]==='P' &&
				cad[pos + 1]==='o' &&
				cad[pos + 2]==='s' &&
				cad[pos + 3]==='i' &&
				cad[pos + 4]==='t' &&
				cad[pos + 5]==='i' &&
				cad[pos + 6]==='o' &&
				cad[pos + 7]==='n' &&
				( ( pos + 8 )>=cad.length || IsSpecial( cad, pos + 8 ) ) &&
				( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
			);
		}
		function IsFocus( cad, pos ) {
			return (
				cad[pos    ]==='F' &&
				cad[pos + 1]==='o' &&
				cad[pos + 2]==='c' &&
				cad[pos + 3]==='u' &&
				cad[pos + 4]==='s' &&
				( ( pos + 5 )>=cad.length || IsSpecial( cad, pos + 5 ) ) &&
				( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
			);
		}
		function IsTrigger( cad, pos ) {
			return (
				cad[pos    ]==='T' &&
				cad[pos + 1]==='r' &&
				cad[pos + 2]==='i' &&
				cad[pos + 3]==='g' &&
				cad[pos + 4]==='g' &&
				cad[pos + 5]==='e' &&
				cad[pos + 6]==='r' &&
				( ( pos + 7 )>=cad.length || IsSpecial( cad, pos + 7 ) ) &&
				( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
			);
		}
		function IsFind( cad, pos ) {
			return (
				cad[pos    ]==='F' &&
				cad[pos + 1]==='i' &&
				cad[pos + 2]==='n' &&
				cad[pos + 3]==='d' &&
				( ( pos + 4 )>=cad.length || IsSpecial( cad, pos + 4 ) ) &&
				( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
			);
		}
		function Ishtml( cad, pos ) {
			return (
				cad[pos    ]==='h' &&
				cad[pos + 1]==='t' &&
				cad[pos + 2]==='m' &&
				cad[pos + 3]==='l' &&
				( ( pos + 4 )>=cad.length || IsSpecial( cad, pos + 4 ) ) &&
				( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
			);
		}
		function Ischilds( cad, pos ) {
			return (
				cad[pos    ]==='c' &&
				cad[pos + 1]==='h' &&
				cad[pos + 2]==='i' &&
				cad[pos + 3]==='l' &&
				cad[pos + 4]==='d' &&
				cad[pos + 5]==='s' &&
				( ( pos + 6 )>=cad.length || IsSpecial( cad, pos + 6 ) ) &&
				( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
			);
		}
		function IsTypeof( cad, pos ) {
			return (
				cad[pos    ]==='T' &&
				cad[pos + 1]==='y' &&
				cad[pos + 2]==='p' &&
				cad[pos + 3]==='e' &&
				cad[pos + 4]==='o' &&
				cad[pos + 5]==='f' &&
				( ( pos + 6 )>=cad.length || IsSpecial( cad, pos + 6 ) ) &&
				( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
			);
		}
		function IsHash( cad, pos ) {
			return (
				cad[pos    ]==='H' &&
				cad[pos + 1]==='a' &&
				cad[pos + 2]==='s' &&
				cad[pos + 3]==='h' &&
				( ( pos + 4 )>=cad.length || IsSpecial( cad, pos + 4 ) ) &&
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

		/* Get JS */
		function GetZone( res, cad, pos ) {
			let ret = '';

			for ( ;pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case '/' :
					case ' ' :
					case '\t': break;

					case '\n':
					case '\r':
						switch ( ret ) {
							case 'configuration': res+= '⟨co'; break;

							case 'front-public' : res+= '⟨fp'; break;
							case 'front-private': res+= '⟨fv'; break;

							case 'back-tcp'    : res+= '⟨bt'; break;
							case 'back-edge'   : res+= '⟨be'; break;
							case 'back-socket' : res+= '⟨bs'; break;
							case 'back-public' : res+= '⟨bp'; break;
							case 'back-private': res+= '⟨bv'; break;
						}
					return [res, --pos];

					default: ret+= cad[pos];
				}
			}

			return [res, pos];
		}
		function GetSuper( res, cad, pos ) {
			for ( ;pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case '.': return [res + '_', --pos];
					default : res+= cad[pos];
				}
			}

			return [res, pos];
		}
		async function GetRequire( res, cad, pos ) {
			const pov = pos;

			for ( pos+=7; pos<cad.length && cad[pos]!=='"' && cad[pos]!=="'" && cad[pos]!=='`'; pos++ );

			let ret, com;
			const cha  = cad[pos];
			[ret, pos] = await GetString   ( '', cad, pos, cxJS );
			com        = await TranspileEnd( ret, ofile );

			try {
				com = eval( com );
			}
			catch ( e ) {
				console.Error( e.stack );

				com = ret;
			}

			if ( com[0]==='m' && com[1]==='e' && com[2]==='m' && com[3]==='e' && com[4]===':' ) {
				com = com.slice( 5 );
				res+= `require_meme(${cha}${com}${cha}`;

				ofile.requires[com] = true;

				return [res, pos];
			}

			return [res + 'r', pov];
		}
		async function GetViewFunction( res, cad, pos ) {
			for ( ;pos<cad.length && cad[pos]!=='{'; pos++ );

			let body;

			[body, pos] = await GetHTML( '', cad, pos );
			ofile.view += '\n' + body;

			return [res, pos];
		}
		async function GetStyleFunction( res, cad, pos ) {
			for ( ;pos<cad.length && cad[pos]!=='{'; pos++ );

			let body;

			[body, pos] = await GetCSS( '', cad, pos );
			ofile.style+= '\n' + body;

			return [res, pos];
		}

		/* Get HTML */
		async function GetStyleTag( res, cad, pos ) {
			for ( ;pos<cad.length && cad[pos]!=='{'; pos++ );

			const id = ++IDS;
			let   body;

			[body, pos]      = await GetCSS( '', cad, pos );
			ofile.groups[id] = { body, type:cxCSS, is_tag:true };
			res             += `style>⎨${id}⎬`;

			return [res, pos];
		}
		async function GetScriptTag( res, cad, pos ) {
			for ( ;pos<cad.length && cad[pos]!=='{'; pos++ );

			const id = ++IDS;
			let   body;

			[body, pos]      = await GetJS( '', cad, pos );
			ofile.groups[id] = { body, type:cxJS, is_tag:true };
			res             += `script>⎨${id}⎬`;

			return [res, pos];
		}

		/* Get Global */
		async function GetIncludeFile( include_path, is_exclude, ctx ) {
			let fil;

			if ( include_path[0]==='.' ) fil = ParsePath( ofile.dir, include_path );
			else                         fil = ParsePath(            include_path );

			if (
				fil.type!=='file' ||
				fil.path===ofile.path ||
				ofile.includes[fil.path]
			) {
				console.Error( `error, el archivo "${ fil.path }", no se incluyo.` );
				return '';
			}

			ofile.includes  [ofile.path] =
			ofile.includes  [fil  .path] = true;
			ofile.refreshers[fil  .path] = { is_include:true };

			let code = fil.Read();

			if ( !is_exclude ) {
				switch ( fil.ext ) {
					case '.mh': code = await TranspileGeneral( code, cxHTML, ofile ); break;
					case '.mc': code = await TranspileGeneral( code, cxCSS , ofile ); break;
					case '.mj': code = await TranspileGeneral( code, cxJS  , ofile ); break;
				}
			}

			ofile.includes[fil.path] = null;

			return code;
		}
		async function GetIncludeUrl( include_url, is_exclude, ctx ) {
			include_url  = include_url.toLowerCase();
			const result = await fetch( include_url ).catch( console.Error );

			if ( result.ok ) {
				let
				code = await result.text();
				code = is_exclude ? code : await TranspileGeneral( code, ctx, ofile );

				return code;
			}

			console.Error( `error al cargar la url "${ include_url }", status: ${ result.status }` );

			return '';
		}
		async function GetInclude( res, cad, pos, ctx ) {
			const ise = cad[pos]==='e';

			for ( pos+= 7; pos<cad.length && IsSpacesTabs( cad, pos ); pos++ );

			let   body    = '';
			const is_file = IsIncludeFile( cad, pos );
			pos          += is_file ? 4 : 3;

			for (      ; pos<cad.length && IsSpaces( cad, pos ); pos++             );
			for ( pos++; pos<cad.length && cad[pos]!=="'"      ; body+= cad[pos++] );

			body = await ( is_file ? GetIncludeFile : GetIncludeUrl )( body, ise, ctx );

			if ( ise ) {
				const id         = ++IDS;
				ofile.groups[id] = { body, type:'exclude' };
				res             += `⎣${id}⎦`;
			}
			else res+= body;

			return [res, pos];
		}
		async function GetConstant( res, cad, pos ) {
			let   ret      = '', def = '', pot = 0;
			const pov      = pos;
			const seen     = new Set();
			const replacer = ( key, value ) => {
				switch ( Typeof( value ) ) {
					case 'regexp': return value.toString();

					case 'array' :
					case 'object':
						if ( value!==null ) {
							if ( seen.has( value ) ) return;

							seen.add( value );
						}

					default: return value;
				}
			};
			const parse = async ( value ) => {
				let tem = '';

				if ( typeof value==='object' ) {
					try {
						tem = JSON.stringify( value, replacer );
					}
					catch( e ) {
						console.Warning( e.stack );

						const id                               = `v${Hash()}`;
						global._objects_constants_replaces   ??= {};
						global._objects_constants_replaces[id] = value;

						return `( global._objects_constants_replaces['${id}'] )`;
					}
				}
				else tem = String( value );

				return tem;
			};

			pos++;

			[ret, pos] = await GetJS( '', cad, pos );

			for ( ;pot<ret.length && ( IsSpaces( ret, pot ) || IsValidLetter( ret, pot ) ); pot++ );

			if ( ret[pot]==='|' && ret[pot+1]==='|' ) {
				def = ret.slice( pot+2 );
				ret = ret.slice( 0, pot );
			}

			if ( cad[pos]===']' && cad[pos+1]===']' ) {
				if ( CONFIG.constants[ret]!==undefined ) return [res + await parse( CONFIG.constants[ret] ), ++pos];
				else                                     return [res + await parse( def                   ), ++pos];
			}
			else return [res+'[', pov];
		}
		async function GetString( res, cad, pos, ctx ) {
			let   ret = '', id, body, pov;
			const end = cad[pos];
			const scr = end==='`' ? '$' : null;

			for ( pos++; pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case '\\': ret+= cad[pos++] + cad[pos]; break;

					case '[':
						if ( cad[pos + 1]==='[' ) [ret, pos] = await GetConstant( ret, cad, pos );
						else                      ret       += cad[pos];
					break;

					case 'i':
					case 'e':
						if ( IsInclude( cad, pos ) ) [ret, pos] = await GetInclude( ret, cad, pos, ctx );
						else                         ret       += cad[pos];
					break;

					case '{':
						switch ( IsScript( cad, pos, ctx ) ) {
							case cxBuild  :          [ret , pos] = await GetBuild( ret, cad, pos, ctx ); break;
							case cxWrite  :          [ret , pos] = await GetWrite( ret, cad, pos ); break;
							case cxRequest: pov=pos; [body, pos] = await GetJS   ( '' , cad, pos ); ofile.groups[id=++IDS]={body,context:ctx,type:cxRequest,is_string:true, position:pov}; ret+=`⎨${id}⎬`; ofile.is_ssr                  = true; break;
							case cxPointer:          [body, pos] = await GetJS   ( '' , cad, pos ); ofile.groups[id=++IDS]={body,context:ctx,type:cxPointer,is_string:true              }; ret+=`⎨${id}⎬`; ofile.is_pointer_in_reference = true; break;
							case cxHTML   :          [body, pos] = await GetHTML ( '' , cad, pos ); ofile.groups[id=++IDS]={body,context:ctx,type:cxHTML   ,is_string:true              }; ret+=`⎨${id}⎬`; break;
							case cxCSS    :          [body, pos] = await GetCSS  ( '' , cad, pos ); ofile.groups[id=++IDS]={body,context:ctx,type:cxCSS    ,is_string:true              }; ret+=`⎨${id}⎬`; break;
							case cxJS     :          [body, pos] = await GetJS   ( '' , cad, pos ); ofile.groups[id=++IDS]={body,context:ctx,type:cxJS     ,is_string:true              }; ret+=`⎨${id}⎬`; break;
							default       :          ret        += cad[pos];
						}
					break;

					case scr:
						if ( cad[pos + 1]==='{' ) {
							let tem;

							[tmp, pos] = await GetJS( '', cad, ++pos );
							ret       += `\${${tmp}}`;
						}
						else ret+= cad[pos];
					break;

					case end:
						ofile.groups[id=++IDS] = { body:ret, char:end };
					return [res + `“${id}”`, pos, ret];

					default: ret+= cad[pos];
				}
			}

			return [res + ret, pos];
		}
		async function GetBuild( res, cad, pos, ctx ) {
			let code, pov = pos;

			pos        += 5;
			[code, pos] = await GetJS( '', cad, pos );
			code        = await TranspileEnd( code, ofile, true );
			code        = await WriteMapBuild( cad, code, pov, ofile );
			code        = await EXEC( code, { ofile }, ofile ) ?? '';
			res        += await TranspileGeneral( code, ctx, ofile );

			return [res, pos];
		}
		async function GetWrite( res, cad, pos ) {
			let code, pov = pos, id = ++IDS;

			pos             += 5;
			[code, pos]      = await GetJS       ( '', cad, pos );
			code             = await TranspileEnd( code, ofile );
			ofile.groups[id] = {
				body    : code,
				type    : cxWrite,
				position: pov,
			};

			res+= `⎨${id}⎬`;

			return [res, pos];
		}

		/* Get */
		async function GetJS( res, cad, pos, is_first ) {
			let   body, id, pov;
			const end = is_first ? null : ( cad[pos]==='[' ? ']' : '}' );

			if ( !is_first ) {
				pos++;

				switch ( cad[pos] ) {
					case '*': pos++ ; break;
					case 'r': if ( IsRequest( cad, pos   )                     ) pos+= 7; break;
					case 'm': if ( IsSpecial( cad, pos+2 ) && cad[pos+1]==='j' ) pos+= 2; break;
				}
			}

			for ( ;pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case '`':
					case '"':
					case "'": [res, pos] = await GetString( res, cad, pos, cxJS ); break;

					case '[':
						if ( cad[pos+1]==='[' ) [res, pos] = await GetConstant( res, cad, pos );
						else {
							res       += '[';
							[res, pos] = await GetJS( res, cad, pos );
							res       += ']';
						}
					break;

					case '/':
						if      ( IsZone   ( cad, pos ) ) [res, pos] = GetZone   ( res, cad, pos );
						else if ( IsComment( cad, pos ) ) pos        = GetComment(      cad, pos );
						else if ( IsRegExp ( res      ) ) {
							let   body       ;
							const id         = ++IDS;
							[body, pos]      = GetRegExp ( '', cad, pos );
							ofile.groups[id] = { body };
							res             += `⎛${id}⎞`;
						}
						else res+= cad[pos];
					break;

					case 'A':
						if      ( IsAdd ( cad, pos ) ) ofile.is_Add_in_js  = true;
						else if ( IsAtts( cad, pos ) ) ofile.is_Atts_in_js = true;

						res+= cad[pos];
					break;

					case 'c':
						if ( Ischilds( cad, pos ) ) ofile.is_childs_in_js = true;

						res+= cad[pos];
					break;

					case 'C':
						if      ( IsClass( cad, pos ) ) ofile.is_Class_in_js = true;
						else if ( IsCss  ( cad, pos ) ) ofile.is_Css_in_js   = true;

						res+= cad[pos];
					break;

					case 'E':
						if ( IsEvents( cad, pos ) ) ofile.is_Events_in_js = true;

						res+= cad[pos];
					break;

					case 'F':
						if      ( IsFocus( cad, pos ) ) ofile.is_Focus_in_js = true;
						else if ( IsFind ( cad, pos ) ) ofile.is_Find_in_js  = true;

						res+= cad[pos];
					break;

					case 'h':
						if ( Ishtml( cad, pos ) ) ofile.is_html_in_js = true;

						res+= cad[pos];
					break;

					case 'H':
						if ( IsHash( cad, pos ) ) ofile.is_Hash_in_js = true;

						res+= cad[pos];
					break;

					case 'P':
						if ( IsPosition( cad, pos ) ) ofile.is_Position_in_js = true;

						res+= cad[pos];
					break;

					case 'r':
						if ( IsRequire( cad, pos ) ) [res, pos] = await GetRequire( res, cad, pos );
						else                         res       += cad[pos];
					break;

					case 'R':
						if ( IsRemove( cad, pos ) ) ofile.is_Remove_in_js = true;

						res+= cad[pos];
					break;

					case 's':
						if ( IsSuper( cad, pos ) ) [res,pos] = GetSuper( res, cad, pos );
						else                       res      += cad[pos];
					break;

					case 'T':
						if      ( IsTrigger( cad, pos ) ) ofile.is_Trigger_in_js = true;
						else if ( IsTypeof ( cad, pos ) ) ofile.is_Typeof_in_js  = true;

						res+= cad[pos];
					break;

					case 'i':
					case 'e':
						if ( IsInclude( cad, pos ) ) [res, pos] = await GetInclude( res, cad, pos, cxJS );
						else                         res       += cad[pos];
					break;

					case 'V': if ( IsViewFunction ( cad, pos ) ) [res, pos] = await GetViewFunction ( res, cad, pos ); else res+=cad[pos]; break;
					case 'S': if ( IsStyleFunction( cad, pos ) ) [res, pos] = await GetStyleFunction( res, cad, pos ); else res+=cad[pos]; break;

					case '{':
						switch ( IsScript( cad, pos, cxJS ) ) {
							case cxBuild  :          [res , pos] = await GetBuild( res, cad, pos, cxJS ); break;
							case cxWrite  :          [res , pos] = await GetWrite( res, cad, pos ); break;
							case cxRequest: pov=pos; [body, pos] = await GetJS   ( '' , cad, pos ); ofile.groups[id=++IDS]={body,context:cxJS,type:cxRequest, position:pov }; res+=`⎨${id}⎬`; ofile.is_ssr                  = true; break;
							case cxPointer:          [body, pos] = await GetJS   ( '' , cad, pos ); ofile.groups[id=++IDS]={body,context:cxJS,type:cxPointer               }; res+=`⎨${id}⎬`; ofile.is_pointer_in_reference = true; break;
							case cxJS     :          [body, pos] = await GetJS   ( '' , cad, pos ); ofile.groups[id=++IDS]={body,context:cxJS,type:cxJS                    }; res+=`⎨${id}⎬`; break;
							case cxCSS    :          [body, pos] = await GetCSS  ( '' , cad, pos ); ofile.groups[id=++IDS]={body,context:cxJS,type:cxCSS                   }; res+=`⎨${id}⎬`; break;
							case cxHTML   :          [body, pos] = await GetHTML ( '' , cad, pos ); ofile.groups[id=++IDS]={body,context:cxJS,type:cxHTML                  }; res+=`⎨${id}⎬`; break;
							default       : pov=pos; [body, pos] = await GetJS   ( '' , cad, pos ); res+= `{/*:${pov+1}:*/${body}}`; break;
						}
					break;

					case end: return [res, pos];
					default : res+= cad[pos];
				}
			}

			return is_first ? res : [res, pos];
		}
		async function GetCSS( res, cad, pos, is_first ) {
			let   body, id, pov;
			const end = is_first ? null : ( cad[pos]==='[' ? ']' : '}' );

			if ( !is_first ) {
				pos++;

				if ( cad[pos]==='m' && cad[pos+1]==='c' ) pos+= 2;
			}

			for ( ;pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case '\\': res+= cad[pos++] + cad[pos];

					case '"':
					case "'": [res, pos] = await GetString( res, cad, pos, cxCSS ); break;

					case '[':
						if      ( cad[pos+1]==='[' ) [res, pos] = await GetConstant( res, cad, pos );
						else if ( cad[pos+1]==='⎨' ) res+= cad[pos];
						else {
							[body, pos]            = await GetCSS( '', cad, pos );
							ofile.groups[id=++IDS] = { body };
							res                   += `[⎨${id}⎬]`;
						}
					break;

					case '/':
						if ( IsComment( cad, pos ) ) pos = GetComment( cad, pos );
						else                         res+= cad[pos];
					break;

					case 'i':
					case 'e':
						if ( IsInclude( cad, pos ) ) [res, pos] = await GetInclude( res, cad, pos, cxCSS );
						else                         res       += cad[pos];
					break;

					case '{':
						switch ( IsScript( cad, pos, cxCSS ) ) {
							case cxBuild  :          [res , pos] = await GetBuild( res, cad, pos, cxCSS ); break;
							case cxWrite  :          [res , pos] = await GetWrite( res, cad, pos ); break;
							case cxRequest: pov=pos; [body, pos] = await GetJS   ( '' , cad, pos ); ofile.groups[id=++IDS]={body,context:cxCSS,type:cxRequest, position:pov }; res+=`⎨${id}⎬`; ofile.is_ssr                  = true; break;
							case cxPointer:          [body, pos] = await GetJS   ( '' , cad, pos ); ofile.groups[id=++IDS]={body,context:cxCSS,type:cxPointer               }; res+=`⎨${id}⎬`; ofile.is_pointer_in_reference = true; break;
							case cxJS     :          [body, pos] = await GetJS   ( '' , cad, pos ); ofile.groups[id=++IDS]={body,context:cxCSS,type:cxJS                    }; res+=`⎨${id}⎬`; break;
							case cxCSS    :          [body, pos] = await GetCSS  ( '' , cad, pos ); ofile.groups[id=++IDS]={body,context:cxCSS,type:cxCSS                   }; res+=`⎨${id}⎬`; break;
							case cxHTML   :          [body, pos] = await GetHTML ( '' , cad, pos ); ofile.groups[id=++IDS]={body,context:cxCSS,type:cxHTML                  }; res+=`⎨${id}⎬`; break;
							default       :          res        += cad[pos];
						}
					break;

					case end: return [res, pos];
					default : res+= cad[pos];
				}
			}

			return is_first ? res : [res, pos];
		}
		async function GetHTML( res, cad, pos, is_first ) {
			let   body, id, pov;
			const end = is_first ? null : '}';

			if ( !is_first && cad[++pos]==='m' && IsSpecial( cad, pos + 2 ) ) {
				pos+= 2;

				if ( cad[pos]===' ' ) pos++;
			}

			for ( ;pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case '\\': res+=cad[pos++] + cad[pos]; break;

					case '"':
					case "'": [res, pos] = await GetString( res, cad, pos, cxHTML ); break;

					case '[':
						if ( cad[pos+1]==='[' ) [res, pos] = await GetConstant( res, cad, pos );
						else                    res       += cad[pos];
					break;

					case '/':
						if ( IsComment( cad, pos ) ) pos = GetComment( cad, pos );
						else                         res+= cad[pos];
					break;

					case 's':
					case 'S':
						if      ( IsStyleTag ( cad, pos ) ) [res, pos] = await GetStyleTag ( res, cad, pos );
						else if ( IsScriptTag( cad, pos ) ) [res, pos] = await GetScriptTag( res, cad, pos );
						else                                res       += cad[pos];
					break;

					case 'i':
					case 'e':
						if ( IsInclude( cad, pos ) ) [res, pos] = await GetInclude( res, cad, pos, cxJS );
						else                         res       += cad[pos];
					break;

					case '{':
						switch ( IsScript( cad, pos, cxHTML ) ) {
							case cxBuild  :          [res , pos] = await GetBuild( res, cad, pos, cxHTML ); break;
							case cxWrite  :          [res , pos] = await GetWrite( res, cad, pos ); break;
							case cxRequest: pov=pos; [body, pos] = await GetJS   ( '' , cad, pos ); ofile.groups[id=++IDS]={body,context:cxHTML,type:cxRequest, position:pov }; res+=`⎨${id}⎬`; ofile.is_ssr                  = true; break;
							case cxPointer:          [body, pos] = await GetJS   ( '' , cad, pos ); ofile.groups[id=++IDS]={body,context:cxHTML,type:cxPointer               }; res+=`⎨${id}⎬`; ofile.is_pointer_in_reference = true; break;
							case cxJS     :          [body, pos] = await GetJS   ( '' , cad, pos ); ofile.groups[id=++IDS]={body,context:cxHTML,type:cxJS                    }; res+=`⎨${id}⎬`; break;
							case cxHTML   :          [body, pos] = await GetHTML ( '' , cad, pos ); ofile.groups[id=++IDS]={body,context:cxHTML,type:cxHTML                  }; res+=`⎨${id}⎬`; break;
							case cxCSS    :          [body, pos] = await GetCSS  ( '' , cad, pos ); ofile.groups[id=++IDS]={body,context:cxHTML,type:cxCSS                   }; res+=`⎨${id}⎬`; break;
							default       :          res        += cad[pos];
						}
					break;

					case end: return [res, pos];
					default : res+= cad[pos];
				}
			}

			return is_first ? res : [res, pos];
		}

		/* Inicio */
		async function Inicio() {
			if ( !ofile && typeof context==='object' ) {
				ofile   = context;
				context = cxJS;
			}

			ofile.requires  ??= {};
			ofile.elements  ??= [];
			ofile.imports   ??= {};
			ofile.includes  ??= {};
			ofile.refreshers??= {};
			ofile.groups    ??= {};
			ofile.view      ??= '';
			ofile.style     ??= '';

			switch ( context ) {
				case cxJS  : code = await GetJS  ( '', code, 0, true ); break;
				case cxCSS : code = await GetCSS ( '', code, 0, true ); break;
				case cxHTML: code = await GetHTML( '', code, 0, true ); break;
			}

			return code;
		};return await Inicio();
	}
	async function TranspileEnd( code, ofile, is_build ) {
		/* Parses */
		function ParseBuildScripts( cad, pos ) {
			let res = '', rep, tem, gro;

			do {
				res && ( cad=res ), res='', pos=0, rep=false;

				for ( ;pos<cad.length; pos++ ) {
					switch ( cad[pos] ) {
						case '⎨':
							tem = '';
							for ( pos++; pos<cad.length && cad[pos]!=='⎬'; tem+= cad[pos++] );
							gro = ofile.groups[tem];

							if ( !gro || gro.type!==cxJS ) { res+=`⎨${tem}⎬`; break }

							res+= `\${${gro.body}}`;
						break;

						case '“':
							tem = '';
							for ( pos++; pos<cad.length && cad[pos]!=='”'; tem+= cad[pos++] );
							gro = ofile.groups[tem];

							if ( !gro ) { res+=`“${tem}”`; break }

							res+= `${gro.char}${gro.body}${gro.char}`;
							rep = true;
						break;

						default: res+= cad[pos];
					}
				}
			}
			while ( rep );

			return res;
		}

		/* Get */
		async function GetHTML( script ) {
			switch ( script.context ) {
				case cxHTML:
					if ( !script.struct )
						script.struct = await ParseMH( script.body, ofile );
				return script.is_string ? await WriteMH( script.struct, ofile ) : script.body;

				case cxCSS :
					if ( !script.struct )
						script.struct = await ParseMH( script.body, ofile );
				return `"${await WriteMH( script.struct, ofile )}"`;

				case cxJS  :
					if ( is_build ) {
						script.is_build = true;

						return '`' + ParseBuildScripts( script.body, 0 ) + '`';
					}

					if ( !script.struct )
						script.struct = await ParseMH( script.body  , ofile );

					script.struct.is_script = true;

					const code = await WriteMH( script.struct, ofile );

					return script.is_string ? code : ( '`'+ code +'`' );
			}
		}
		async function GetCSS( script ) {
			if ( script.is_tag ) {
				script.struct = await ParseMC( script.body  , ofile );
				return          await WriteMC( script.struct, ofile );
			}

			switch ( script.context ) {
				case cxCSS:
					if ( !script.struct )
						script.struct = await ParseMC( script.body, ofile );
				return script.is_string ? await WriteMC( script.struct, ofile ) : script.body;

				case cxHTML:
					if ( !script.struct )
						script.struct = await ParseMC( script.body, ofile );
				return `"${await WriteMC( script.struct, ofile )}"`;

				case cxJS  :
					if ( is_build ) return '`' + script.body + '`';

					if ( !script.struct )
					script.struct = await ParseMC( script.body  , ofile );
					const code    = await WriteMC( script.struct, ofile );

					return script.is_string ? code : ( '`'+ code +'`' );
			}
		}
		async function GetJS( script ) {
			let cod = await TranspileEnd( script.body, ofile );

			if ( script.is_tag ) return cod;

			switch ( script.context ) {
				case cxJS:
					if ( script.is_string ) return cod.replace( /\`/gm, '\\`' );
				return `\`${cod.replace( /\`/gm, '\\`' )}\``;

				case cxCSS :
				case cxHTML:
					const isa = !!cod.match( /await/gm );

					if ( cod.match( /return|;/gm ) ) cod = `${isa ? 'await' : ''}( ${isa ? 'async' : ''}()=>{${ cod }} )()`;

					if ( script.type===cxPointer ) cod = `\${PointerFromReference(${ cod })}`;
					else {
						cod = `${isa ? 'await' : ''}( ${isa ? 'async' : ''}() => {const __val__=(${ cod }); return __val__===undefined ? '' : __val__} )()`;
						cod = `\${${cod}}`;
					}
				return cod;
			}
		}
		async function GetWrite( script ) {
			return await EXEC( script.body, { ofile }, ofile ) ?? '';
		}

		/* Replace */
		async function ReplaceString( res, cad, pos ) {
			let num = '', pot = pos;

			for ( pos++; pos<cad.length && IsNumber( cad, pos ); num+= cad[pos++] );

			if ( cad[pos]==='”' && ( num = ofile.groups[num] ) ) return [res + num.char + await Inicio( num.body ) + num.char, pos];
			else                                                 return [res + '“', pot];
		}
		async function ReplaceSubHtml( res, cad, pos ) {
			let num = '', pot = pos;

			for ( pos++; pos<cad.length && IsNumber( cad, pos ); num+= cad[pos++] );

			if ( cad[pos]==='❫' && ( num = ofile.groups[num] ) ) {
				const code = await WriteMH({ type:thNone, childs:num.childs, is_view:true }, ofile, ofile.struct?.class_name ?? '' );

				return [res + code, pos];
			}

			return [res + '❪', pot];
		}
		async function ReplaceRegExp( res, cad, pos ) {
			let num = '', pot = pos;

			for ( pos++; pos<cad.length && IsNumber( cad, pos ); num+= cad[pos++] );

			if ( cad[pos]==='⎞' && ( num = ofile.groups[num] ) ) return [res + num.body, pos];
			else                                                 return [res + '⎛'     , pot];
		}
		async function ReplaceScript( res, cad, pos ) {
			let num = '', pot = pos;

			for ( pos++; pos<cad.length && IsNumber( cad, pos ); num+= cad[pos++] );

			if ( cad[pos]==='⎬' && ( num = ofile.groups[num] ) ) {
				switch ( num.type ) {
					case cxPointer: return [res + await GetJS   ( num ), pos];
					case cxWrite  : return [res + await GetWrite( num ), pos];
					case cxHTML   : return [res + await GetHTML ( num ), pos];
					case cxCSS    : return [res + await GetCSS  ( num ), pos];
					case cxJS     : return [res + await GetJS   ( num ), pos];
				}
			}

			return [res + '⎨', pot];
		}
		async function ReplaceExclude( res, cad, pos ) {
			let num = '', pot = pos;

			for ( pos++; pos<cad.length && IsNumber( cad, pos ); num+= cad[pos++] );

			if ( cad[pos]==='⎦' && ( num = ofile.groups[num] ) ) return [res + num.body, pos];
			else                                                 return [res + '⎣'     , pot];
		}

		/* Inicio */
		async function Inicio( cad  ) {
			let pos = 0, res = '';

			for ( ;pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case '“': [res, pos] = await ReplaceString ( res, cad, pos ); break;
					case '❪': [res, pos] = await ReplaceSubHtml( res, cad, pos ); break;
					case '⎛': [res, pos] = await ReplaceRegExp ( res, cad, pos ); break;
					case '⎨': [res, pos] = await ReplaceScript ( res, cad, pos ); break;
					case '⎣': [res, pos] = await ReplaceExclude( res, cad, pos ); break;

					default: res+= cad[pos];
				}
			}

			return res;
		};return await Inicio( code );
	}
	async function TranspileExec( code, ofile ) {
		const points = {};
		code         = await TranspileEnd( code, ofile );
		code         = 'return `'+ code +'`';
		code         = await Object.getPrototypeOf( async function() {} )
		.constructor( code )
		.call({
			PointerFromReference: ( v ) => {
				const id   = Hash();
				points[id] = v;

				return id;
			},
		}).catch( e => {
			console.Error( e.message );
			console.Error( e.stack );
		});

		if ( points[code] ) return points[code];
		else                return code;
	}
	// **************************************************


	/* Parsers */
	async function ParseMC( code, ofile, class_name ) {
		/* IS */
		function IsProperty( cad, pos ) {
			for ( ;pos<cad.length && IsSpaces( cad, pos ); pos++ );

			if ( cad[pos]==='-' && cad[pos+1]==='-' && cad[pos+2]==='!' ) return true;

			for ( ;pos<cad.length && IsValidLetter( cad, pos ); pos++ );
			for ( ;pos<cad.length && IsSpacesTabs ( cad, pos ); pos++ );

			return (
				cad[pos    ]===':' &&
				cad[pos + 1]!==':' &&
				cad[pos + 1]!=='<' &&
				cad[pos + 1]!=='>'
			);
		}
		function IsLinearGradient( cad, pos ) {
			return (
				cad[pos     ]==='l' &&
				cad[pos + 1 ]==='i' &&
				cad[pos + 2 ]==='n' &&
				cad[pos + 3 ]==='e' &&
				cad[pos + 4 ]==='a' &&
				cad[pos + 5 ]==='r' &&
				cad[pos + 6 ]==='-' &&
				cad[pos + 7 ]==='g' &&
				cad[pos + 8 ]==='r' &&
				cad[pos + 9 ]==='a' &&
				cad[pos + 10]==='d' &&
				cad[pos + 11]==='i' &&
				cad[pos + 12]==='e' &&
				cad[pos + 13]==='n' &&
				cad[pos + 14]==='t' &&
				( ( pos + 15 )>=cad.length || IsSpecial( cad, pos + 15 ) ) &&
				( ( pos - 1  )<0           || IsSpecial( cad, pos - 1 ) )
			);
		}
		function IsRgba( cad, pos ) {
			if (
				!(
					cad[pos + 0]==='r' &&
					cad[pos + 1]==='g' &&
					cad[pos + 2]==='b'
				)
			) return false;

			pos+= 3;

			if ( cad[pos]==='a' ) pos++;

			for ( ;pos<cad.length && IsSpacesTabs( cad, pos ); pos++ );

			return cad[pos]==='(';
		}
		function IsEnd( cad, pos ) {
			return (
				cad[pos]===';' ||
				( cad[pos]===':' && cad[pos + 1]==='<' ) ||
				( cad[pos]===':' && cad[pos + 1]==='>' ) ||
				IsSpacesLine( cad, pos )
			);
		}
		function IsChild( cad, pos ) {
			return (
				( cad[pos]===':' && cad[pos + 1]==='<' ) ||
				( cad[pos]===':' && cad[pos + 1]==='>' ) ||
				cad[pos]===';'
			);
		}
		function IsKeyframes( cad, pos ) {
			return (
				cad[pos    ]==='@' &&
				cad[pos + 1]==='k' &&
				cad[pos + 2]==='e' &&
				cad[pos + 3]==='y' &&
				cad[pos + 4]==='f' &&
				cad[pos + 5]==='r' &&
				cad[pos + 6]==='a' &&
				cad[pos + 7]==='m' &&
				cad[pos + 8]==='e' &&
				cad[pos + 9]==='s' &&
				( ( pos + 10 )>=cad.length || IsSpecial( cad, pos + 10 ) ) &&
				( ( pos - 1  )<0           || IsSpecial( cad, pos - 1 ) )
			);
		}
		function IsFontface( cad, pos ) {
			return (
				cad[pos    ]==='@' &&
				cad[pos + 1]==='f' &&
				cad[pos + 2]==='o' &&
				cad[pos + 3]==='n' &&
				cad[pos + 4]==='t' &&
				cad[pos + 5]==='-' &&
				cad[pos + 6]==='f' &&
				cad[pos + 7]==='a' &&
				cad[pos + 8]==='c' &&
				cad[pos + 9]==='e' &&
				( ( pos + 10 )>=cad.length || IsSpecial( cad, pos + 10 ) ) &&
				( ( pos - 1  )<0           || IsSpecial( cad, pos - 1  ) )
			);
		}
		function IsMedia( cad, pos ) {
			return (
				cad[pos    ]==='@' &&
				cad[pos + 1]==='m' &&
				cad[pos + 2]==='e' &&
				cad[pos + 3]==='d' &&
				cad[pos + 4]==='i' &&
				cad[pos + 5]==='a' &&
				( ( pos + 6 )>=cad.length || IsSpecial( cad, pos + 6 ) ) &&
				( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
			);
		}
		function IsSupports( cad, pos ) {
			return (
				cad[pos    ]==='@' &&
				cad[pos + 1]==='s' &&
				cad[pos + 2]==='u' &&
				cad[pos + 3]==='p' &&
				cad[pos + 4]==='p' &&
				cad[pos + 5]==='o' &&
				cad[pos + 6]==='r' &&
				cad[pos + 7]==='t' &&
				cad[pos + 8]==='s' &&
				( ( pos + 9 )>=cad.length || IsSpecial( cad, pos + 9 ) ) &&
				( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
			);
		}
		function IsThemeDark( cad, pos ) {
			return (
				cad[pos     ]==='@' &&
				cad[pos + 1 ]==='t' &&
				cad[pos + 2 ]==='h' &&
				cad[pos + 3 ]==='e' &&
				cad[pos + 4 ]==='m' &&
				cad[pos + 5 ]==='e' &&
				cad[pos + 6 ]==='-' &&
				cad[pos + 7 ]==='d' &&
				cad[pos + 8 ]==='a' &&
				cad[pos + 9 ]==='r' &&
				cad[pos + 10]==='k' &&
				( ( pos + 11)>=cad.length || IsSpecial( cad, pos + 11 ) ) &&
				( ( pos - 1 )<0           || IsSpecial( cad, pos - 1  ) )
			);
		}
		function IsThemeLight( cad, pos ) {
			return (
				cad[pos     ]==='@' &&
				cad[pos + 1 ]==='t' &&
				cad[pos + 2 ]==='h' &&
				cad[pos + 3 ]==='e' &&
				cad[pos + 4 ]==='m' &&
				cad[pos + 5 ]==='e' &&
				cad[pos + 6 ]==='-' &&
				cad[pos + 7 ]==='l' &&
				cad[pos + 8 ]==='i' &&
				cad[pos + 9 ]==='g' &&
				cad[pos + 10]==='h' &&
				cad[pos + 11]==='t' &&
				( ( pos + 12)>=cad.length || IsSpecial( cad, pos + 12 ) ) &&
				( ( pos - 1 )<0           || IsSpecial( cad, pos - 1  ) )
			);
		}
		function IsTypeScript( cad, pos ) {
			if ( cad[pos]!=='⎨' ) return false;

			for ( pos++; pos<cad.length && IsNumber( cad, pos ); pos++ );

			return cad[pos]==='⎬';
		}
		function IsTypeExclude( cad, pos ) {
			if ( cad[pos]!=='⎣' ) return false;

			for ( pos++; pos<cad.length && IsNumber( cad, pos ); pos++ );

			return cad[pos]==='⎦';
		}

		/* GET */
		function GetNumber( res, cad, pos ) {
			let ret = '';

			for ( ;pos<cad.length && ( IsNumber( cad, pos ) || cad[pos]==='.' ); ret+= cad[pos++] );

			if ( ( pos===cad.length || cad[pos]===')' || cad[pos]===';' || cad[pos]===',' || IsSpacesTabs( cad, pos ) ) && ret!=='0' ) {
				if ( CONFIG.render.css_auto_unit==="auto-viewport-width" ) res+= "calc( ( " + ret + " * 100vw ) / var(--xs) )";
				else                                                       res+= ret + CONFIG.render.css_auto_unit;
			}
			else res+= ret;

			pos--;

			return [res, pos];
		}
		function GetGroup( res, cad, pos, name ) {
			const end = cad[pos]==='(' ? ')' : ( cad[pos]==='[' ? ']' : '}' );

			for ( pos++; pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case '$': [res, pos] = GetVariable( res, cad, pos, name ); break;

					case '(':
					case '[':
					case '{': [res, pos] = GetGroup( res, cad, pos, name ); break;

					case end: return [res + cad[pos], pos];
					default :
						if ( ( IsNumber( cad, pos ) || cad[pos]==='.' ) && cssPropertyProc[name] ) [res, pos] = GetNumber( res, cad, pos );
						else                                                                       res+= cad[pos];
				}
			}

			return [res, pos];
		}
		function GetVariableDefinition( res, cad, pos ) {
			let ret = '';
			let isg = false;

			if ( cad[pos]==='-' && cad[pos+1]==='-' && cad[pos+2]==='!' ) pos++, isg = true;

			for_name:
			for ( pos+=2; pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case ' ' :
					case '\t': break;

					case ':': break for_name;

					default : ret+= cad[pos];
				}
			}

			pos--;

			if ( !isg && class_name ) res+= '--' + class_name + '--' + ret;
			else                      res+= '--' + ret;

			return [res, pos];
		}
		function GetVariable( res, cad, pos, nam ) {
			const fol = [];
			let   rel = '';
			let   con = true, isg = false;
			let   tem;

			if ( cad[pos+1]==='!' ) isg = true, pos++;

			for ( pos++; pos<cad.length && con; pos++ ) {
				switch ( cad[pos] ) {
					case '|':
						let com = true;

						for ( pos++, tem = ''; pos<cad.length && com; pos++ ) {
							switch ( cad[pos] ) {
								case '(':
								case '[':
								case '{': [tem, pos] = GetGroup( tem, cad, pos, nam ); break;

								case '|':
								case ' ':
								case ';':
								case '\t':
								case '\n':
								case '\r': com = false, pos--; break;

								default: tem+= cad[pos];
							}
						}

						fol.push( tem );

						pos--;

						if ( cad[pos]!=='|' ) con = false;
					break;

					default:
						if ( IsValidLetter( cad, pos ) ) rel+= cad[pos];
						else                             con = false, pos--;
				}
			}

			if ( !isg && class_name ) rel = class_name + '--' + rel;

			if ( !fol.length ) res+= "var(--" + rel + ")";
			else {
				tem = "";

				for ( let x of fol ) tem+= ", " + x;

				res+= "var(--" + rel + tem + ")";
			}

			pos--;

			return [res, pos];
		}
		function GetRgba( res, cad, pos, nam ) {
			for ( ;pos<cad.length && cad[pos]!=='('; res+= cad[pos++] );

			for ( res+= cad[pos++]; pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case '$': [res, pos] = GetVariable( res, cad, pos, nam ); break;
					case '(': [res, pos] = GetGroup   ( res, cad, pos, nam ); break;
					case ')': return [res + cad[pos], pos];
					default : res+= cad[pos];
				}
			}

			return [res, pos];
		}
		function GetLinearGradient( res, cad, pos, nam ) {
			for ( ;pos<cad.length && cad[pos]!=='('; res+= cad[pos++] );

			for ( res+= cad[pos++]; pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case 'r':
					case 'R':
						if ( IsRgba( cad, pos ) ) [res, pos] = GetRgba( res, cad, pos, nam );
						else                      res+= cad[pos];
					break;

					case '$': [res, pos] = GetVariable( res, cad, pos, nam ); break;
					case '(': [res, pos] = GetGroup   ( res, cad, pos, nam ); break;

					case ')': return [res + cad[pos], pos];
					default : res+= cad[pos];
				}
			}

			return [res, pos];
		}
		function GetCalc( res, cad, pos, nam ) {
			for ( ;pos<cad.length && cad[pos]!=='('; res+= cad[pos++] );

			for ( res+= cad[pos++]; pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case '$': [res, pos] = GetVariable( res, cad, pos, nam ); break;
					case '(': [res, pos] = GetGroup   ( res, cad, pos, nam ); break;

					case ')': return [res + cad[pos], pos];
					default : res+= cad[pos];
				}
			}

			return [res, pos];
		}
		function GetColor( res, cad, pos ) {
			for ( res+= cad[pos++]; pos<cad.length && ( IsNumber( cad, pos ) || IsLetter( cad, pos ) ); res+= cad[pos++] );

			pos--;

			return [res, pos];
		}
		function GetChilds( line, cad, pos, level ) {
			let res = '', lvl = level;

			do {
				for ( ;pos<cad.length && IsSpaces( cad, pos ); pos++ );

				if      ( cad[pos]===':' && cad[pos + 1]==='>' ) lvl++, pos++;
				else if ( cad[pos]===':' && cad[pos + 1]==='<' ) lvl--, pos++;

				pos++;
			}
			while ( IsChild( cad, pos ) );

			for ( ;pos<cad.length; res+= cad[pos++] );

			AddLine( line, lvl, res, true );

			return pos;
		}
		function GetParams( res, cad, pos ) {
			let par = {}, gro = '', pov, nam, val, con;

			for ( ;pos<cad.length; pos++ ) {
				if      ( IsNumber( cad, pos ) ) gro+= cad[pos];
				else if ( cad[pos]===']'       ) break;
			}

			pov = pos;
			cad = ofile.groups[gro]?.body ?? '';
			pos = 0;

			do {
				nam = '';
				val = '';

				for ( ;pos<cad.length && IsSpaces     ( cad, pos ); pos++ );
				for ( ;pos<cad.length && IsValidLetter( cad, pos ); nam+= cad[pos++] );
				for ( ;pos<cad.length && IsSpaces     ( cad, pos ); pos++ );

				if ( cad[pos]==='=' ) {
					for ( pos++; pos<cad.length && IsSpaces    ( cad, pos ); pos++ );
					for (      ; pos<cad.length && IsValidValue( cad, pos ); val+= cad[pos++] );
				}
				else if ( IsValidLetter( cad, pos ) ) pos--;

				if ( nam ) par[nam] = val;
			}
			while ( pos<cad.length );

			if ( Object.keys( par ).length ) {
				for ( const k in par ) {
					if ( par[k] ) res+= `[${k}=${par[k]}]`;
					else          res+= `[${k}]`;
				}
			}

			return [res, pov];
		}

		/* Parse */
		function ParseProperty( line, level, parent ) {
			const res = { type:tcProperty, childs:[], name:'', value:'', level, parent };
			let   con = true, pos = 0;

			for ( ;pos<line.length && con; pos++ ) {
				switch ( line[pos] ) {
					case ' ' :
					case '\t': break;

					case '-':
						if ( line[pos+1]==='-' ) [res.name, pos] = GetVariableDefinition( res.name, line, pos );
						else                     res.name       += line[pos];
					break;

					case ':': con = false, pos--; break;

					default: res.name+= line[pos];
				}
			}

			for ( pos++; pos<line.length && IsSpaces( line, pos ); pos++ );

			for ( con = true; pos<line.length && con; pos++ ) {
				switch ( line[pos] ) {
					case 'l'          : if ( IsLinearGradient( line, pos ) ) [res.value, pos] = GetLinearGradient( res.value, line, pos, res.name ); else res.value+= line[pos]; break;
					case 'r': case 'R': if ( IsRgba          ( line, pos ) ) [res.value, pos] = GetRgba          ( res.value, line, pos, res.name ); else res.value+= line[pos]; break;
					case 'c'          : if ( IsCalc          ( line, pos ) ) [res.value, pos] = GetCalc          ( res.value, line, pos, res.name ); else res.value+= line[pos]; break;
					case '$'          :                                      [res.value, pos] = GetVariable      ( res.value, line, pos, res.name ); break;
					case '#'          :                                      [res.value, pos] = GetColor         ( res.value, line, pos,          ); break;

					default:
						if      ( ( IsNumber( line, pos ) || line[pos]==='.' ) && cssPropertyProc[res.name] ) [res.value, pos] = GetNumber( res.value, line, pos );
						else if ( IsEnd( line, pos )                                                        ) {
							if      (  IsChild ( line, pos ) ) pos       = GetChilds( res, line, pos, level );
							else if ( !IsSpaces( line, pos ) ) res.value+= line[pos];

							con = false, pos--;
						}
						else res.value+= line[pos];
				}
			}

			return res;
		}
		function ParseSelector( cad, lvl, parent ) {
			const res = { selectors:[], type:tcSelector, level:lvl, childs:[], value:'', parent };
			let   con = true, pos = 0;

			if      ( IsTypeScript ( cad, 0 ) ) { res.type = tcScript ; res.value = cad; return res; }
			else if ( IsTypeExclude( cad, 0 ) ) { res.type = tcExclude; res.value = cad; return res; }

			for ( ;pos<cad.length && con; pos++ ) {
				switch ( cad[pos] ) {
					case ';':
					case ':':
						if      ( cad[pos + 1]===':'  ) res.value+= ':', pos++;
						else if ( IsChild( cad, pos ) ) {
							pos = GetChilds( res, cad, pos, lvl );
							con = false, pos--;
						}
						else res.value+= cad[pos];
					break;

					case '[': [res.value, pos] = GetParams( res.value, cad, pos ); break;

					case ',':
						res.selectors.push( res.value );

						res.value = '';
					break;

					case '@':
						if      ( IsKeyframes ( cad, pos ) ) res.value+= cad[pos], res.type = tcKeyframes;
						else if ( IsFontface  ( cad, pos ) ) res.value+= cad[pos], res.type = tcFontface;
						else if ( IsMedia     ( cad, pos ) ) res.value+= cad[pos], res.type = tcMedia;
						else if ( IsSupports  ( cad, pos ) ) res.value+= cad[pos], res.type = tcMedia;
						else if ( IsThemeDark ( cad, pos ) ) res.value+= cad[pos], res.type = tcThemeDark;
						else if ( IsThemeLight( cad, pos ) ) res.value+= cad[pos], res.type = tcThemeLight;
					break;

					default:
						if ( IsEnd( cad, pos ) ) {
							if ( IsChild( cad, pos ) )
								pos = GetChilds( res, cad, pos, lvl );

							con = false, pos--;
						}
						else res.value+= cad[pos];
					break;
				}
			}

			if ( res.value )
				res.selectors.push( res.value );

			return res;
		}

		/* ADD */
		function AddLine( parent, level, line, is_first ) {
			while ( parent.level>0 && parent.parent ) {
				if ( parent.level<level && parent.type>=tcSelector )
					break;

				parent = parent.parent;
			}

			let tem;

			if ( IsProperty( line, 0 ) ) tem = ParseProperty( line, level, parent );
			else                         tem = ParseSelector( line, level, parent );

			if ( is_first ) parent.childs.unshift( tem );
			else            parent.childs.push   ( tem );

			return tem;
		}

		/* Inicio */
		async function Inicio() {
			let   pos  = 0, res = '';
			const cad  = await TranspileGeneral( code, cxCSS, ofile );
			const sel  = class_name ? ( '.' + class_name ) : '';
			const roo  = { value:sel, selectors:[sel], type:tcSelector, level:0, childs:[] };
			let   par  = roo, lvl = 1;

			for ( ;pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case ' ' :
					case '\t':
						if ( !res ) lvl++;
						else        res+= cad[pos];
					break;

					case '\n':
					case '\r':
						if ( !IsVoid( res ) )
						par = AddLine( par, lvl, res );
						lvl = 1;
						res = '';
					break;

					default: res+= cad[pos];
				}
			}

			!IsVoid( res ) && AddLine( par, lvl, res );

			return roo;
		};return await Inicio();
	}
	async function ParseMH( code, ofile, class_name ) {
		/* Declaraciones */
		const struct = {};

		/* IS */
		function IsDoctype( cad ) {
			return (
				cad[0]==='!' &&
				cad[1]==='D' &&
				cad[2]==='O' &&
				cad[3]==='C' &&
				cad[4]==='T' &&
				cad[5]==='Y' &&
				cad[6]==='P' &&
				cad[7]==='E' &&
				( 8>=cad.length || IsSpecial( cad, 8 ) )
			);
		}
		function IsScriptServer( cad ) {
			if ( cad[0]==='⎨' ) {
				let num = '', pos = 1;

				for ( ;pos<cad.length && IsNumber( cad, pos ); num+= cad[pos++] );

				if ( num = ofile.groups[num] ) return num.context===cxRequest || num.type===cxWrite;
			}

			return false;
		}
		function IsEnd( cad, pos ) {
			return (
				cad[pos]===';' ||
				cad[pos]==='/' ||
				cad[pos]==='>' ||
				IsSpacesLine( cad, pos )
			);
		}

		/* GET */
		function GetGroup( res, cad, pos ) {
			const end = cad[pos]==='(' ? ')' : ( cad[pos]==='[' ? ']' : '}' );

			for ( res+= cad[pos++]; pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case '\\': res+= cad[pos] + cad[++pos]; break;

					case '(':
					case '{':
					case '[': [res, pos] = GetGroup( res, cad, pos ); break;

					case end: return [res + cad[pos], pos];
					default : res+= cad[pos];
				}
			}

			return [res, pos];
		}
		async function GetSub( res, cad, pos, parent ) {
			let rel = '', con = true, sar;

			for ( pos++; pos<cad.length && con; pos++ ) {
				switch ( cad[pos] ) {
					case ' ':
					case '\t': if ( rel ) rel+= cad[pos]; break;

					case '\\': rel+= cad[pos++], rel+= cad[pos]; break;

					case '[': [rel, pos] = GetGroup( rel, cad, pos ); break;
					case ']': pos--, con = false; break;

					default: rel+= cad[pos];
				}
			}

			const sub_struct            = await ParseMH( rel           , ofile, class_name );
			sub_struct.id               = ++IDS;
			struct.refs                 = Object.assign( struct.refs   , sub_struct.refs   );
			struct.events               = Object.assign( struct.events , sub_struct.events );
			ofile.groups[sub_struct.id] = sub_struct;

			if ( sub_struct.slot_hash ) {
				parent.slot_hash    =
				parent.params._slot = sub_struct.slot_hash;
			}

			return [res + `❪${sub_struct.id}❫`, pos];
		}
		async function GetBody( cad, pos, parent ) {
			let res = '', isg = false;

			for ( pos++; pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case '\\':
						switch ( cad[pos + 1] ) {
							case 's' : res+= "&nbsp;"    ; break;
							case 'n' : res+= "<br/>"     ; break;
							case 't' : res+= "&emsp;"    ; break;

							case '\r':
							case '\n': res+= cad[pos + 1]; break;

							default: res+= '&#' + cad[pos + 1].charCodeAt( 0 ) + ';';
						}

						pos++;
					break;

					case '(': isg = true ; break;
					case ')': isg = false; break;

					case '[': [res, pos] = await GetSub( res, cad, pos, parent ); break;

					case ';' :
					case '\n':
					case '\r': if ( !isg ) return [res, pos];

					default: res+= cad[pos];
				}
			}

			return [res, pos];
		}
		function GetParamString( res, cad, pos ) {
			let num = '';

			for ( pos++; pos<cad.length && IsNumber( cad, pos ); num+= cad[pos++] );

			if ( cad[pos]==='”' && ofile.groups[num] ) {
				const cad = ofile.groups[num].body;
				let   pos = 0;

				for ( ;pos<cad.length; pos++ ) {
					switch ( cad[pos] ) {
						case '\\':
							if ( cad[pos + 1]==='"' ) res+= '&quot;', pos++;
							else                      res+= cad[++pos];
						break;

						case '"': res+= '&quot;'; break;
						default : res+= cad[pos];
					}
				}
			}
			else res+= '“' + num, pos--;

			return [res, pos];
		}
		function GetParamClass( cad ) {
			let pos = 0;
			let res = '', num = '';

			for ( ;pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case '“':
						for ( pos++; pos<cad.length && IsNumber( cad, pos ); num+= cad[pos++] );

						if ( cad[pos]==='”' && ofile.groups[num] ) res+= ofile.groups[num].body;
						else                                       res+= '“' + num, pos--;
					break;

					default: res+= cad[pos];
				}
			}

			return res;
		}
		function GetParamsEvent( parent, cad, val ) {
			let rel = '', par = '', isp = false, pos = 0;

			for ( ;pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case '(':
					case ')': break;

					case ':': isp = true; break;

					default: isp ? par+= cad[pos] : rel+= cad[pos];
				}
			}

			parent.events[rel] = { value:val, params:par, name:rel, parent };
			parent.has_events  = true;
		}
		function GetParams( parent, cad, pos ) {
			let con = true, rep = true, nam, val;

			while ( rep && !( rep = false ) ) {
				nam = '', val = '';

				for (           ; pos<cad.length && IsSpacesTabs( cad, pos ); pos++ );
				for ( con = true; pos<cad.length && con                     ; pos++ ) {
					switch ( cad[pos] ) {
						case ';' : case '=' :
						case '/' : case '>' :
						case '\r': case '\n':
						case ' ' : case '\t': con        = false, pos--; break;
						case '('            : [nam, pos] = GetGroup( nam, cad, pos ); break;
						default             : nam       += cad[pos];
					}
				}

				for ( ;pos<cad.length && IsSpacesTabs( cad, pos ); pos++ );

				if ( cad[pos]==='=' ) {
					for ( pos++     ; pos<cad.length && IsSpacesTabs( cad, pos ); pos++ );
					for ( con = true; pos<cad.length && con                     ; pos++ ) {
						switch ( cad[pos] ) {
							case '\\':
								if ( cad[pos + 1]==='"' ) val+= '&quot;', pos++;
								else                      val+= cad[++pos];
							break;

							case '“' : [val, pos] = GetParamString( val, cad, pos ); break;

							case ';' :
							case '/' : case '>' :
							case '\r': case '\n':
							case ' ' : case '\t': pos--, con = false; break;

							default: val+= cad[pos]; break;
						}
					}
				}

				if      ( nam==="id"    ) { if ( val ) parent.id = val; }
				else if ( nam==="class" ) { if ( val ) parent.clase.push( GetParamClass( val ) ) }
				else if ( nam==="ref"   ) { if ( val ) { parent.ref = val; parent.clase.push( val ) } }
				else if ( nam[0]==='('  ) GetParamsEvent( parent, nam, val );
				else                      parent.params[nam] = val;

				for ( ;pos<cad.length &&  IsSpacesTabs( cad, pos ); pos++ );
				if  (  pos<cad.length && !IsEnd       ( cad, pos )        ) rep = true;
			}

			return pos;
		}
		async function GetChilds( res, cad, pos, brothers ) {
			let rel = '';

			for ( pos++; pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case ' ':
					case '\t': if ( rel ) rel+= cad[pos]; break;

					default: rel+= cad[pos];
				}
			}

			rel = await ParseLine( rel, res.level, res.parent, brothers );

			brothers.unshift( rel );

			return pos;
		}

		/* PARSE */
		function ParseHost( that ) {
			struct.host.id     = that.id;
			struct.host.ref    = that.ref;
			struct.host.refs   = that.refs;
			struct.host.body   = that.body;
			struct.host.clase  = that.clase;
			struct.host.params = that.params;
			struct.host.events = that.events;

			that.type = thNone;
		}
		function ParseDocument( that ) {
			struct.document.id     = that.id;
			struct.document.ref    = that.ref;
			struct.document.body   = that.body;
			struct.document.clase  = that.clase;
			struct.document.params = that.params;
			struct.document.events = that.events;

			that.type = thNone;
		}
		function ParseTag( that ) {
			if ( tagIgnore[that.tag] ) {
				that.custom_tag = that.tag;
				return;
			}

			that.custom_tag = ClassToTag( that.tag );

			if ( !that.custom_tag.includes( '-' )    ) return;
			if (  that.custom_tag===ofile.custom_tag ) return;

			struct.is_client_class    = true;
			that  .is_custom_element  = true;
			ofile .imports[that.tag]??= [];

			ofile.imports[that.tag].push( that );
		}
		async function ParseParams( that ) {
			for ( const [name,param] of Object.entries( that.params ) ) {
				if ( !param || !param.match || !param.match( /⎨/ ) ) continue;

				that.params[name] = await TranspileEnd( param, ofile );
			}
		}

		async function ParseLine( cad, level, parent, brothers ) {
			if ( !cad                   ) return { type:thNone   , childs:[], parent, level };
			if (  IsDoctype     ( cad ) ) return { type:thDoctype, childs:[], parent, level };
			if (  IsScriptServer( cad ) ) return { type:thScript , childs:[], parent, level, line:cad };

			const res = { type:thTag, clase:[], tag: '', ref:'', id:'', body:'', events:{}, params:{}, refs:{}, childs:[], deps:[], auto_close:false, parent, level };
			let   cla = '', pos = 0, con = true, bro;

			while ( con && !( con = false ) ) {
				switch ( cad[pos] ) {
					case '.': for ( cla     = '', pos++; pos<cad.length && IsValidLetter( cad, pos ); cla    += cad[pos++] ); res.clase.push( cla     ); con = true; break;
					case '*': for ( res.ref = '', pos++; pos<cad.length && IsValidLetter( cad, pos ); res.ref+= cad[pos++] ); res.clase.push( res.ref ); con = true; break;
					case '#': for ( res.id  = '', pos++; pos<cad.length && IsValidLetter( cad, pos ); res.id += cad[pos++] );                            con = true; break;
					case '>': [res.body, pos] = await GetBody( cad, pos, res ); con = true; break;

					case ' ':
					case '\t':
						pos = GetParams( res, cad, pos );
						con = true;
					break;

					case '/' : res.auto_close = true;
					case ';' : pos            = await GetChilds( res, cad, pos, brothers || ( bro=[] ) );
					case '\n':
					case '\r': break;

					default:
						if ( IsValidLetter( cad, pos ) || cad[pos]==='&' || cad[pos]==='!' ) {
							for ( res.tag = ''; pos<cad.length && ( IsValidLetter( cad, pos ) || cad[pos]==='&' || cad[pos]==='!' ); res.tag+= cad[pos++] );

							con = true;
						}
				}
			}

			if ( !res.tag ) res.tag      = 'div';
			if (  bro     ) res.brothers = bro;

			if      ( res.tag==='&' ) ParseHost    ( res );
			else if ( res.tag==='!' ) ParseDocument( res );
			else                      ParseTag     ( res );

			await ParseParams( res );

			if ( res.tag==='slot' ) {
				ofile.content_slots     = true;
				res.is_not_write        = true;
				res.slot_hash           =
				res.parent.slot_hash    =
				res.parent.params._slot = res.parent.slot_hash ?? Hash();
			}

			if ( res.tag==='render' ) {
				res.type             = thNone;
				struct.is_pre_render = res.params.type==='pre' || !( !res.params.pre || res.params.pre.match( /false/i ) );
			}

			if ( res.tag==='require' ) {
				res.type               = thNone;
				const cla              = res.params.component || res.params.module || '';
				struct.is_client_class = true;
				ofile .imports[cla]  ??= [];

				ofile.imports[cla].push( res );
			}

			if ( res.tag==='static' ) {
				res.type                = thNone;
				const keys              = Object.keys( res.params );
				struct.statics[keys[0]] = res.params[keys[0]];
			}

			if  ( res.params['not-require']!=null ) res.not_require = true;
			if  ( res.has_events && !res.ref      ) res.ref = 'R' + Hash( res.tag + ++IDS );
			if  ( res.ref                         ) struct.refs[res.ref] = res;
			for ( const k in res.events           ) struct.events[res.ref + '_' + k] = res.events[k];
			if  ( res.params['require']           ) {
				let val = res.params['require'];
				val     = typeof val==='string' ? !( !val || val.match( /false/i ) ) : !!val;

				if ( !val ) res.not_require = true;
			}

			res.ofile = ofile;

			ofile.elements.push( res );

			return res;
		}

		/* ADD */
		async function AddLine( parent, lvl, res, is_first ) {
			while ( parent.level>0 && parent.parent ) {
				if ( parent.level<lvl )
					break;

				parent = parent.parent;
			}

			const tem = await ParseLine( res, lvl, parent );

			if ( tem ) {
				if ( is_first ) parent.childs.unshift( tem );
				else            parent.childs.push   ( tem );

				if ( tem.brothers ) {
					parent.childs.push( ...tem.brothers );
				}
			}

			return tem;
		}

		/* Inicio */
		async function Inicio() {
			struct.document??= {};
			struct.events  ??= {};
			struct.host    ??= {};
			struct.refs    ??= {};
			struct.statics ??= {};

			const cad = await TranspileGeneral( code, cxHTML, ofile );
			const roo = { level:0, type:thNone, childs:[], clase:[], events:{}, params:{} };
			let   pos = 0;
			let   res = '';
			let   par = roo;
			let   lvl = 1;

			for ( ;pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case '(':
					case '[': [res, pos] = GetGroup( res, cad, pos ); break;

					case '\\':
						if ( IsSpacesLine( cad, pos + 1 ) ) pos++;
						else                                res+= cad[pos++] + cad[pos];
					break;

					case ' ' :
					case '\t':
						if ( !res ) lvl++;
						else        res+= cad[pos];
					break;

					case '\n':
					case '\r':
						if ( !IsVoid( res ) )
						par = await AddLine( par, lvl, res );
						lvl = 1;
						res = '';
					break;

					default: res+= cad[pos];
				}
			}

			!IsVoid( res ) && await AddLine( par, lvl, res );

			return Object.assign( roo, struct );
		};return await Inicio();
	}
	async function ParseMJ( code, ofile ) {
		/* Declaraciones */
		const struct = {};

		/* Parse */
		async function ParseScripts( struct ) {
			for ( const group of Object.values( ofile.groups ) ) {
				if ( group.type!==cxHTML || group.is_build ) continue;

				group.struct = await ParseMH( group.body, ofile, struct.class_name );
			}
		}

		/* IS */
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
		function IsReturnCode( cad, pos ) {
			if (
				!(
					cad[pos    ]==='r' &&
					cad[pos + 1]==='e' &&
					cad[pos + 2]==='t' &&
					cad[pos + 3]==='u' &&
					cad[pos + 4]==='r' &&
					cad[pos + 5]==='n' &&
					( ( pos + 6 )>=cad.length || IsSpecial( cad, pos + 6 ) ) &&
					( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
				)
			) return false;

			for ( pos+= 6; pos<cad.length && IsSpaces( cad, pos ); pos++ );

			if ( cad[pos]!=='#' ) return;

			for ( pos++; pos<cad.length && IsNumber( cad, pos ); pos++ );

			return ( pos>=cad.length || IsSpecial( cad, pos ) );
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
		function IsVariable( cad, pos ) {
			if ( IsSpecial( cad, pos ) ) return false;
			if ( IsStatic ( cad, pos ) ) pos+= 6;

			for ( ;pos<cad.length && IsSpaces     ( cad, pos ); pos++ );
			for ( ;pos<cad.length && IsValidLetter( cad, pos ); pos++ );
			for ( ;pos<cad.length && IsSpaces     ( cad, pos ); pos++ );

			return cad[pos]==='=' || cad[pos]===';' || IsValidLetter( cad, pos );
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
		function IsFunction( cad, pos ) {
			const len = cad.length;

			for ( ;pos<len && IsSpaces( cad, pos ); pos++ );

			if ( IsStatic( cad, pos, len ) ) pos+= 6;

			for ( ;pos<len && IsSpaces( cad, pos ); pos++ );

			if ( IsAsync( cad, pos, len ) ) pos+= 5;

			for ( ;pos<len && IsSpaces     ( cad, pos ); pos++ );
			for ( ;pos<len && IsValidLetter( cad, pos ); pos++ );
			for ( ;pos<len && IsSpaces     ( cad, pos ); pos++ );

			if ( cad[pos]!=='(' ) return false;

			[,pos] = GetGroup( '', cad, pos );

			for ( pos++; pos<len && IsSpaces( cad, pos ); pos++ );

			return cad[pos]==='{';
		}
		function IsGetterSetter( cad, pos ) {
			if (
				!(
					( cad[pos]==='g' || cad[pos]==='s' ) &&
					cad[pos + 1]==='e' &&
					cad[pos + 2]==='t' &&
					( ( pos + 3 )>=cad.length || IsSpecial( cad, pos + 3 ) ) &&
					( ( pos - 1 )<0           || IsSpecial( cad, pos - 1 ) )
				)
			) return false;

			for ( pos+= 3; pos<cad.length && IsSpaces( cad, pos ); pos++ );

			return IsFunction( cad, pos );
		}

		/* GET */
		function GetReturnCode( res, cad, pos ) {
			let num = '';

			for (      ; pos<cad.length && cad[pos]!=='#'      ; pos++            );
			for ( pos++; pos<cad.length && IsNumber( cad, pos ); num+= cad[pos++] );

			res+= 'return { _code:' + num + ' };';

			return [res, pos];
		}
		function GetGroup( res, cad, pos ) {
			let end = cad[pos]==='(' ? ')' : ( cad[pos]==='[' ? ']' : '}' );
			res    += cad[pos++];

			for ( ;pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case 'r':
						if ( IsReturnCode( cad, pos ) ) [res, pos] = GetReturnCode( res, cad, pos );
						else                            res+= cad[pos];
					break;

					case '(':
					case '[':
					case '{': [res, pos] = GetGroup( res, cad, pos ); break;

					case end: res+= cad[pos]; return [res, pos];
					default : res+= cad[pos];
				}
			}

			return [res, pos];
		}

		function GetVariableBody( cad, pos ) {
			let tem, pot, res = '';

			for ( ;pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case ';' : return [res, pos];

					case '(':
					case '[':
					case '{': [res, pos] = GetGroup( res, cad, pos ); break;

					case '\r':
					case '\n':
						pot = pos;

						for ( tem = ''; pos<cad.length && IsSpaces( cad, pos ); tem+= cad[pos++] );

						if ( IsOperator( cad, pos ) || cad[pos]===':' || cad[pos]==='.' ) res+= tem + cad[pos];
						else                                                              return [res, pot]
					break;

					case ' ' :
					case '\t': if ( !res ) break;

					default: res+= cad[pos];
				}
			}

			return [res, pos];
		}

		async function GetComment( cad, pos ) {
			for ( pos+=2; pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case '*': return pos + 1;
				}
			}

			return pos;
		}
		async function GetFunction( cad, pos, zone ) {
			const result = { zone, is_static:false, is_async:false, name:'', params:'', body:'' };

			if ( result.is_static = IsStatic( cad, pos ) ) { pos+= 6; for ( ;pos<cad.length && IsSpaces( cad, pos ); pos++ ); }
			if ( result.is_async  = IsAsync ( cad, pos ) ) { pos+= 5; for ( ;pos<cad.length && IsSpaces( cad, pos ); pos++ ); }

			for ( ;pos<cad.length && IsValidLetter( cad, pos ); result.name+= cad[pos++] );
			for ( ;pos<cad.length && IsSpaces     ( cad, pos ); pos++                    );

			[result.params, pos] = GetGroup( '', cad, pos );

			for ( ;pos<cad.length && cad[pos]!=='{'; pos++ );

			result.position    = pos + 1;
			[result.body, pos] = GetGroup( '', cad, pos );

			switch ( result.name ) {
				case 'Tag'   : struct.Tag   = result; break;
				case 'End'   : struct.End   = result; break;
				case 'Load'  : struct.Load  = result; break;
				case 'Build' : struct.Build = result; break;

				case 'Create':
					switch ( zone ) {
						case tzBackEdge   :
						case tzBackTcp    :
						case tzBackSocket :
						case tzBackPublic :
						case tzBackPrivate: result.name = 'MemeCreateService'; break;
					}

				default:
					if ( result.name==='onGateway' && ( result.zone===tzBackTcp || result.zone===tzBackSocket ) ) result.name = 'onGateway' + ( result.zone===tzBackTcp ? 'Tcp' : 'Socket' );

					result.class_and_name         = `${ struct.class_name }/${ result.name }`;
					struct.functions[result.name] = result;
			}

			switch ( zone ) {
				case tzConfiguration: struct.is_server_class = struct.is_client_class = true; break;

				case tzFrontPublic :
				case tzFrontPrivate: struct.is_client_class = true; break;

				case tzBackPublic :
				case tzBackPrivate: struct.is_server_class = true; break;

				case tzBackTcp   : struct.is_server_class = struct.is_tcp_class    = true; break;
				case tzBackEdge  : struct.is_server_class = struct.is_edge_class   = true; break;
				case tzBackSocket: struct.is_server_class = struct.is_socket_class = true; break;
			}

			return pos;
		}
		async function GetGetterSetter( cad, pos, zone ) {
			const result = { zone, is_get:cad[pos]=='g', is_arrow:false, is_async:false, name:'', params:'', body:'' };
			pos         += 3;

			for ( ;pos<cad.length && IsSpaces     ( cad, pos ); pos++                   );
			for ( ;pos<cad.length && IsValidLetter( cad, pos ); result.name+=cad[pos++] );
			for ( ;pos<cad.length && IsSpaces     ( cad, pos ); pos++                   );

			[result.params, pos] = GetGroup( '', cad, pos );

			for ( ;pos<cad.length && cad[pos]!=='{'; pos++ );

			[result.body, pos] = GetGroup( '', cad, pos );

			struct.getters_setters[result.name]                              ??= {};
			struct.getters_setters[result.name][result.is_get ? 'get' : 'set'] = result;
			struct.is_client_class                                             = true;

			return pos;
		}
		async function GetVariable( cad, pos, zone ) {
			const result = { zone, name:'', value:'' };

			if ( result.is_static = IsStatic( cad, pos ) ) pos+= 6;

			for ( ;pos<cad.length && IsSpaces     ( cad, pos ); pos++                    );
			for ( ;pos<cad.length && IsValidLetter( cad, pos ); result.name+= cad[pos++] );
			for ( ;pos<cad.length && IsSpaces     ( cad, pos ); pos++                    );

			if ( cad[pos]==='=' ) {
				for ( pos++; pos<cad.length && IsSpaces( cad, pos ); pos++ );

				[result.value, pos] = GetVariableBody( cad, pos );
			}

			result.value = await TranspileEnd( result.value, ofile );

			if ( result.is_static ) {
				if ( result.value[0]==='"' || result.value[0]==="'" || result.value[0]==='`' )
					result.value = eval( result.value );

				struct.statics[result.name] = result;
			}
			else struct.variables[result.name] = result;

			return pos;
		}

		async function GetClassBody( cad, pos ) {
			let zon = tzFrontPublic;

			for ( pos++; pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case ' ' :
					case '\t':
					case '\n':
					case '\r': break;

					case '⟨':
						switch ( cad[pos + 1] + cad[pos + 2] ) {
							case 'co': zon = tzConfiguration; break;

							case 'fp': zon = tzFrontPublic ; break;
							case 'fv': zon = tzFrontPrivate; break;

							case 'be': zon = tzBackEdge   ; break;
							case 'bt': zon = tzBackTcp    ; break;
							case 'bs': zon = tzBackSocket ; break;
							case 'bp': zon = tzBackPublic ; break;
							case 'bv': zon = tzBackPrivate; break;
						}

						pos+= 2;
					break;

					case '}': return pos;

					default:
						if      ( IsComment     ( cad, pos ) ) pos = await GetComment     ( cad, pos      );
						else if ( IsFunction    ( cad, pos ) ) pos = await GetFunction    ( cad, pos, zon );
						else if ( IsGetterSetter( cad, pos ) ) pos = await GetGetterSetter( cad, pos, zon );
						else if ( IsVariable    ( cad, pos ) ) pos = await GetVariable    ( cad, pos, zon );
				}
			}

			return pos;
		}
		async function GetClass( res, cad, pos ) {
			for ( pos+= 5; pos<cad.length && IsSpaces     ( cad, pos ); pos++                          );
			for (        ; pos<cad.length && IsValidLetter( cad, pos ); struct.class_name+= cad[pos++] );
			for (        ; pos<cad.length && IsSpaces     ( cad, pos ); pos++                          );

			if ( struct.class_name==='extends' || IsExtends( cad, pos ) ) {
				if ( struct.class_name==='extends' ) struct.class_name = '';
				else                                 pos              += 7;

				for (; pos<cad.length && IsSpaces     ( cad, pos ); pos++                             );
				for (; pos<cad.length && IsValidLetter( cad, pos ); struct.extends_class+= cad[pos++] );
				for (; pos<cad.length && IsSpaces     ( cad, pos ); pos++                             );

				if ( cad[pos]===':' ) {
					for ( pos++; pos<cad.length && IsSpaces     ( cad, pos ); pos++                           );
					for (      ; pos<cad.length && IsValidLetter( cad, pos ); struct.extends_tag+= cad[pos++] );
				}
			}

			for ( ;pos<cad.length && cad[pos]!=='{'; pos++ );

			if ( !struct.class_name )
			struct.class_name = ofile.name ?? '';
			struct.class_name = struct.class_name.replace( /^([^a-z]+)/i, '' ).replace( /\./g, '_' ).toLowerCase();
			struct.custom_tag = ClassToTag( struct.class_name );
			pos               = await GetClassBody( cad, pos );

			if ( ofile.style ) {
				struct.is_client_class = true;
				struct.style           = {
					body  : ofile.style,
					struct: await ParseMC( ofile.style, ofile, struct.class_name ),
				}
			}
			if ( ofile.view ) {
				struct.is_client_class = true;
				struct.view            = {
					body  : ofile.view,
					struct: await ParseMH( ofile.view, ofile, struct.class_name ),
				};

				struct.view.struct.is_view = true;
			}

			if ( struct.statics.url ) {
				ofile.url = struct.statics.url.value;

				for ( const key in struct.functions ) {
					struct.functions[key].class_and_name = `${ofile.url}/${struct.functions[key].name}`;
				}
			}

			return [res, pos];
		}

		/* Inicio */
		async function Inicio() {
			struct.statics        ??= {};
			struct.functions      ??= {};
			struct.getters_setters??= {};
			struct.variables      ??= {};
			struct.class_name     ??= '';
			struct.custom_tag     ??= '';
			struct.extends_tag    ??= '';
			struct.extends_class  ??= '';

			const cad = await TranspileGeneral( code, cxJS, ofile );
			let   pos = 0, res = '';
			let   prc = ofile.ext==='.mj';

			for ( ;pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case 'c':
						if ( prc && IsClass( cad, pos ) ) [res, pos] = await GetClass( res, cad, pos );
						else                              res       += cad[pos];
					break;

					case ' ' :
					case '\t':
					case '\n':
					case '\r': res+= cad[pos]; break;

					default:
						struct.is_server_class = true;
						res                   += cad[pos];
				}
			}

			struct.code = res;

			await ParseScripts( struct );

			return struct;
		};return await Inicio();
	}
	// **************************************************


	/* Writers */
	async function WriteMC( struct, ofile ) {
		/* IS */
		function IsVar( cad, pos, len ) {
			return(
				cad[pos    ]=='v' &&
				cad[pos + 1]=='a' &&
				cad[pos + 2]=='r' &&
				( ( pos + 3 )>=len || IsSpecial( cad, pos + 3 ) ) &&
				( ( pos - 1 )<0    || IsSpecial( cad, pos - 1 ) )
			);
		}

		/* GET */
		function GetSpaces( res, cad, pos ) {
			const len = cad.length;
			let   ler = res.length;

			if ( res[ler - 1]===')' && IsLetter( cad, pos + 1 )                            ) res+= ' ';
			if ( cad[pos + 1]==='(' && IsLetter( res, ler - 1 )                            ) res+= ' ';
			if ( res[ler - 1]===')' && ( IsCalc( cad, pos + 1 ) || IsVar( cad, pos + 1 ) ) ) res+= ' ';

			if (
				( pos + 1 )<len &&
				--ler>=0 &&
				(
					IsLetter( cad, pos + 1 ) ||
					IsNumber( cad, pos + 1 ) ||
					cad[pos + 1]==='.'   ||
					cad[pos + 1]==='#'   ||
					cad[pos + 1]==='['   ||
					cad[pos + 1]==='*'   ||
					cad[pos + 1]==='⎨'   ||
					cad[pos + 1]==='“'   ||
					cad[pos + 1]==='\''  ||
					( IsOperator( cad, pos + 1 ) && cad[pos + 1]!=='>' && cad[pos + 1]!=='=' )
				)
				&&
				(
					IsLetter( res, ler ) ||
					IsNumber( res, ler ) ||
					res[ler]===']' ||
					res[ler]==='%' ||
					res[ler]==='-' ||
					res[ler]==='+' ||
					res[ler]==='*' ||
					res[ler]==='/' ||
					res[ler]==='⎬' ||
					res[ler]==='”' ||
					res[ler]==='\''
				)
			) res+= ' ';

			return [res, pos];
		}

		/* Funciones */
		function MixingSelectors( arr1, arr2 ) {
			if      ( !arr1 || !arr1.length ) return arr2;
			else if ( !arr2 || !arr2.length ) return arr1;
			else {
				let result = [];

				for ( let x = 0; x<arr1.length; x++ ) {
					for ( let y = 0; y<arr2.length; y++ )
						result.push( arr1[x] + ' ' + arr2[y] );
				}

				return result;
			}
		}

		/* Write */
		function WriteParseUnitSelector( cad ) {
			let res = '', pos = 0;

			for ( ;pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case ' ' :
					case '\t':
					case '\r':
					case '\n': [res, pos] = GetSpaces( res, cad, pos ); break;
					case '&' : break;
					case '!' : res = ''; break;
					default  : res+= cad[pos];
				}
			}

			return res;
		}
		function WriteSelectors( child, tab ) {
			const arr = [];
			let   rel = '', arc = null;

			do {
				if ( child.type===tcKeyframes ) break;
				if ( child.type!==tcMedia     ) arr.unshift( child.selectors );
				if ( child.type===tcFontface  ) break;

				if ( !child.parent ) break;
				else                 child = child.parent;
			}
			while ( 1 );

			for ( let x = 0; x<arr.length; x++ )
				arc = MixingSelectors( arc, arr[x] );

			let d, e;

			if  ( arc!=null )
			for ( const c of arc ) {
				d = tab + WriteParseUnitSelector( c );

				if ( d!=e ) {
					if ( rel ) rel+= ',\n';

					rel+= e = d;
				}
			}

			return rel;
		}

		function Write( parent, tab='', format ) {
			let lin = '', tan = '';

			if ( format )
				lin = '\n', tan = '\t';

			switch ( parent.type ) {
				case tcExclude :
				case tcScript  : return lin + tab + parent.value;
				case tcProperty: return lin + tab + tan + parent.name + ": " + parent.value + ";";
				default        :
					let pro = '', sel = '', rel = '', tat = parent.type===tcKeyframes || parent.type===tcMedia ? "\t" : "";

					if ( parent.type===tcMedia || parent.type===tcFontface || parent.type===tcSelector || parent.type===tcThemeLight || parent.type===tcThemeDark ) {
						for ( let x = 0; x<parent.childs.length; x++ ) {
							if ( parent.childs[x].type===tcProperty )
								pro+= Write( parent.childs[x], tab + tat, format );
						}
					}

					for ( let x = 0; x<parent.childs.length; x++ ) {
						if ( parent.childs[x].type>=tcSelector )
							sel+= Write( parent.childs[x], tat + tab, format );
					}
					if ( pro ) {
						switch ( parent.type ) {
							case tcThemeLight: rel+= ':root, .theme-light {'+ pro + lin + tab +'}' + lin; break;
							case tcThemeDark : rel+= '.theme-dark {'+ pro + lin + tab +'}' + lin; rel+= '@media (prefers-color-scheme: dark) {:root {'+ pro + lin + tab +'}}' + lin; break;
							default:
								rel = WriteSelectors( parent, tab );

								if ( !rel ) rel = pro + lin + tab;
								else        rel = rel + " {" + pro + lin + tab + "}" + lin;
						}
					}

					if ( parent.type===tcMedia ) {
						if ( pro ) pro = WriteSelectors( parent, tab + tat ) + " {" + pro + lin + tab + tat + "}" + lin;

						rel = '';

						for ( let x of parent.selectors ) {
							if ( rel!=='' ) rel+= ',';

							rel+= x;
						}

						rel+= " {" + lin + pro + sel + tab + "}" + lin, sel = "";
					}
					else if ( parent.type===tcKeyframes ) rel = parent.selectors[0] + ' {' + lin + sel + tab + '}' + lin, sel = '';

					return rel + sel;
			}
		}

		/* Inicio */
		async function Inicio() {
			let
			res = Write( struct, '', false );
			res = await TranspileEnd( res, ofile );

			return res;
		};return await Inicio();
	}
	async function WriteMH( struct, ofile, class_name ) {
		/* Funciones */
		function CloneStruct( struct ) {
			switch ( Typeof( struct ) ) {
				case 'boolean':
				case 'string' :
				case 'number' : return struct;

				case 'object': {
					const ret = {};

					for ( const [key,value] of Object.entries( struct ) ) {
						switch ( key ) {
							case 'parent':
							case 'ofile' : ret[key] = value; break;
							default      : ret[key] = CloneStruct( value ); break;
						}
					}

					return ret;
				}

				case 'array': {
					const ret = [];

					for ( const value of struct ) {
						ret.push( CloneStruct( value  ) );
					}

					return ret;
				}
			}
		}

		/* Write */
		function WirteParams( that ) {
			let rel = '';

			if ( that.ref          ) rel+= " ref=\""   + class_name             + '_' + that.ref + '"';
			if ( that.id           ) rel+= " id=\""    + that.id                + '"';
			if ( that.clase.length ) rel+= " class=\"" + that.clase.join( ' ' ) + '"';

			for ( let x in that.params ) {
				rel+= ' ' + x;

				if ( that.params[x] ) rel+= '="' + that.params[x] + '"';
			}

			return rel;
		}
		function WriteImports( res ) {
			if ( struct.is_view || struct.is_script || ofile.pre_render ) return res;

			let ret = '';

			for ( const [key,value] of Object.entries( ofile.imports ) ) {
				if ( value.find( v=>!v.not_require ) ) {
					ret += `\n\timport {} from '${ CONFIG.constants.APP }/${ key }.js';`;
				}
			}

			if ( ret ) ret = `\n\n<script type="module">${ ret }\n</script>`;

			return res + ret;
		}

		async function WriteBody( that ) {
			const cad = that.body || '';
			let   res = '', pos = 0;

			for ( ;pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case '❪':
						let tem = '';

						for ( pos++; pos<cad.length && cad[pos]!=='❫'; tem+=cad[pos++] );

						tem = ofile.groups[tem];
						res+= await Write( tem, '', '', false, false );
					break;

					default: res+= cad[pos];
				}
			}

			for ( const x of that.childs )
				res = await Write( x, res, '', false, false );

			if ( ofile.pre_render && that.is_custom_element ) {
				let ret = await ofile.pre_render.Exec( that, res );

				if ( ret!=null ) res = ret;
			}

			return res;
		}

		async function Write( that, res, tab, is_brother, format ) {
			let lin = '', lvl;

			if ( format ) {
				lin = '\n', tan = '\t';
			}

			switch ( that.type ) {
				case thNone   : for ( let x of that.childs ) res = await Write( x, res, tab, false, format ); break;
				case thDoctype: if  ( res && !is_brother   ) res+= lin; res+= tab + "<!DOCTYPE html>";  break;
				case thScript : for ( lvl = that.level - 1; lvl--; res+= '\t' ); res+= that.line; break;
				case thTag    :
					if ( that.tag==='slot' && !that.body && !that.childs.length ) return res + "${_slots[`"+ that.id +"`]||window._global_slots[`${props._slot}"+ that.id +"`]||''}";
					if ( that.is_not_write                                      ) return res;
					if ( res && !is_brother                                     ) res+= lin;
					if ( that.replace_meta_element!=null                        ) return res + that.replace_meta_element;

					let tag = that.custom_tag;

					if ( that.auto_close ) res+= tab + "<" + tag + WirteParams( that ) + "/>";
					else {
						that    = CloneStruct( that );
						let bod = await WriteBody( that );
						res    += (
							( is_brother ? '' : tab ) +
							"<" + tag + WirteParams( that ) + ">" +
								bod +
							"</" + tag + ">"
						);
					}
				break;
			}

			return res;
		}

		/* Inicio */
		async function Inicio() {
			let
			res = await Write( struct, '', '', false, true );
			res = WriteImports( res );
			res = await TranspileEnd( res, ofile );

			return res;
		};return await Inicio();
	}
	async function WriteMJ( struct, ofile ) {
		/* Write - Generales */
		function WriteClassStatics( res_general, res_functions ) {
			let pug = '';

			for ( const k in struct.statics ) {
				const { zone, name, value } = struct.statics[k];

				if ( !( zone===tzConfiguration || zone===tzFrontPublic || zone===tzFrontPrivate ) ) continue;

				pug+= "\n\tstatic " + name;

				if ( value ) {
					if ( value.match( /true/i ) || value.match( /false/i ) ) pug+= `=${ !( !value || value.match( /false/i ) ) }`
					else                                                     pug+= `='${value}'`;
				}

				pug+= ";";
			}

			if ( pug ) {
				res_general+= pug;
			}

			return [res_general, res_functions];
		}
		function WriteClassVariables( res_general, res_functions ) {
			let puf = '', pug = '', prf = '';

			for ( const k in struct.variables ) {
				const { zone, name, value, is_static } = struct.variables[k];

				switch ( zone ) {
					case tzFrontPublic  :
					case tzConfiguration:
						if ( is_static ) { pug+= "\n\tstatic " + name; if ( value ) pug+= "=" + value; pug+= ";"; }
						else             { puf+= "\n\t\tthis." + name; if ( value ) puf+= "=" + value; puf+= ";"; }
					break;

					case tzFrontPrivate:
						if ( is_static ) { pug+= "\n\tstatic " + name; if ( value ) pug+= "=" + value; pug+= ";"; }
						else             { prf+= "\n\t\tlet "  + name; if ( value ) prf+= "=" + value; prf+= ";"; }
					break;
				}
			}

			if ( pug ) res_general  += pug;
			if ( puf ) res_functions+= puf;
			if ( prf ) res_functions+= prf;

			return [res_general, res_functions];
		}
		function WriteClassFunctions( res_general, res_functions ) {
			let puf = '', pug = '', prf = '';

			for ( const k in struct.functions ) {
				const { name, zone, is_async, params, body, is_static } = struct.functions[k];

				switch ( zone ) {
					case tzFrontPublic:
						if ( is_static ) pug+= "\n\t/*f*/static " + ( is_async ? "async " : "" ) + name + params + body;
						else             puf+= "\n\t\t/*f*/const " + name + "=this." + name + "=" + ( is_async ? "async " : "" ) + params + '=>' + body;
					break;

					case tzFrontPrivate:
						if ( is_static ) pug+= "\n\t/*f*/static " + ( is_async ? "async " : "" ) + name + params + body;
						else             prf+= "\n\t\t/*f*/const " + name + "=" + ( is_async ? "async " : "" ) + params + '=>' + body + ";";
					break;
				}
			}

			if ( pug ) res_general  += pug;
			if ( puf ) res_functions+= puf;
			if ( prf ) res_functions+= prf;

			return [res_general, res_functions];
		}

		/* Write - View */
		function WritePsupe() {
			let res = '';

			for ( const k in struct.functions ) {
				const { name, zone, is_static } = struct.functions[k];

				if ( name==='Before' || name==='Tag' ) continue;

				switch ( zone ) {
					case tzFrontPublic:
						if ( !is_static ) res+= `\n		_psupe.${name}=${name};`;
					break;
				}
			}

			res+= '\n';

			return res;
		}
		async function WriteSlots() {
			let res = '';

			if ( ofile.content_slots ) {
				for ( const element of ofile.elements ) {
					if ( element.tag!=='slot' || ( !element.body && !element.childs.length ) ) continue;

					const code = await WriteMH({ type:thNone, childs:element.childs, is_view:true }, ofile, ofile.struct.class_name );
					const body = await TranspileEnd( element.body, ofile );

					res+= `		window._global_slots[\`${element.slot_hash + element.id}\`] = _slots[\`${element.id}\`] = \`${body}${code}\`;\n`;
				}
			}

			if ( res ) {
				res= '		window._global_slots??={};\n' + res;
			}

			return res;
		}
		function WriteTextView() {
			const id   = struct.view?.struct?.host?.id   || '';
			const body = struct.view?.struct?.host?.body || '';
			const refs = struct.view?.struct?.refs || {};
			const view = struct.view?.code || '';
			let   ref  = [];
			let   nas  = [];

			for ( const key in refs ) {
				ref.push( struct.class_name + '_' + key );
				nas.push( key );
			}

			if ( ref.length ) {
				ref = '"' + ref.join( '","' ) + '"';
				nas = '"' + nas.join( '","' ) + '"';
			}

			return (
				'\n' +
						( id ? ( '		this.id = `' + id + '`;' ) : '' ) +
				`		let __html = \`${ body + view }\${ _html }\`;\n` +
				'		if ( typeof BeforeView===\'function\' ) { let cad = BeforeView( __html ); typeof cad===\'string\' && cad && ( __html = cad ) }\n' +
				'		if ( !super.View ) {\n' +
				`			const roo = ( ${ struct.class_name }.use_root_dom ? ( this.root_dom = this.attachShadow({ mode: 'open' }) ) : this );\n` +
				'\n' +
				'			if ( props._mepre!="1" ) {\n' +
				'				if ( _is_pre ) {\n'+
				"					const div     = document.createElement( 'div' );\n" +
				"					div.innerHTML = __html;\n" +
				'\n' +
				'					for ( const v of div.childNodes ) roo.appendChild( v );\n' +
				'				}\n' +
				'				else roo.innerHTML = __html;\n' +
				'			}\n' +
				'\n' +
				'			_refs = _refs.concat([' + ref + ']);\n' +
				'			_nams = _nams.concat([' + nas + ']);\n' +
				'\n' +
				'			for ( let x = _nams.length; x--; )\n' +
				'				if ( _nams[x] && _refs[x] )\n' +
				'					refs[_nams[x]] = roo.querySelector( `[ref="${_refs[x]}"]` );\n' +
				'		}\n' +
				'		else super.View( __html, _refs.concat([' + ref + ']), _nams.concat([' + nas + ']), props, refs, _is_pre, psupe, _slots );\n' +
				''
			);
		}
		function WriteGettersSetters() {
			let res = '';

			for ( let x in struct.getters_setters ) {
				const g = struct.getters_setters[x];
				let   get = '', set = '';

				if ( g.get ) {
					if ( g.get.is_arrow ) get+= "			get: " + ( g.get.is_async ? "async " : "" ) + g.get.params + "=>" + g.get.body + ",\n";
					else                  get+= "			get: " + ( g.get.is_async ? "async " : "" ) + "function" + g.get.params + " " + g.get.body + ",\n";
				}

				if ( g.set ) {
					if ( g.set.is_arrow ) set+= "			set: " + ( g.set.is_async ? "async " : "" ) + g.set.params + "=>" + g.set.body + ",\n";
					else                  set+= "			set: " + ( g.set.is_async ? "async " : "" ) + "function" + g.set.params + " " + g.set.body + ",\n";
				}

				res+= (
					"		_ant_getter = this." + x + ";\n" +
					"		Object.defineProperty( this, '" + x + "', {\n" +
					"			enumerable: true,\n" +
					"			configurable:true,\n" +
								get +
								set +
					"		});" + ( set ? `if ( props.${x}!==undefined ) this.${x} = props.${x}; else if ( _ant_getter!==undefined ) this.${x} = _ant_getter;` : '' ) + "\n" +
					""
				);
			}

			if ( res )
				res = '\n\t\tlet _ant_getter;\n' + res;

			return res;
		}
		function WriteEventsFirst() {
			const events = struct.view?.struct?.events || {};
			let   res    = '';

			for ( const [,event] of Object.entries( events ) ) {
				if ( event.parent.tag!=='!' && event.parent.tag!=='&' ) continue;

				let val = event.value, par = `(${ event.params })`, pad;

				if ( val[0]==='⎨' ) {
					val = val.slice( 1, val.length - 1 );
					val = ofile.groups[val];
					val = `${ par }=>{${ val.body }}`;
				}

				if      ( event.parent.tag==='!' ) pad = 'window.document.body';
				else if ( event.parent.tag==='&' ) pad = 'this';

				res+= `			{ element:${pad}, callback:${val}, event:\`${event.name}\` },\n`;
			}

			if ( res ) {
				res = (
					'		this.Events([\n'+
								res +
					'		]);\n'
				);
			}

			return res;
		}
		function WriteEvents() {
			const events = struct.view?.struct?.events || {};

			if ( !Object.keys( events ).length ) return '';

			let res = '';

			for ( const [,event] of Object.entries( events ) ) {
				if ( event.parent.tag==='!' || event.parent.tag==='&' ) continue;

				let val = event.value, par = `(${ event.params })`, pad;

				if ( val[0]==='⎨' ) {
					val = val.slice( 1, val.length - 1 );
					val = ofile.groups[val];
					val = `${ par }=>{${ val.body }}`;
				}

				pad = `refs.${ event.parent.ref }`;
				res+= `			{ element:${pad}, callback:${val}, event:\`${event.name}\` },\n`;
			}

			if ( res ) {
				res = (
					'		this.Events([\n'+
								res +
					'		]);\n'
				);
			}

			return res;
		}
		function WriteReasign() {
			let res = '';

			for ( const k in struct.functions ) {
				const { name, zone, is_static } = struct.functions[k];

				if ( name==='Before' || name==='Tag' ) continue;

				switch ( zone ) {
					case tzFrontPublic:
						if ( !is_static ) {
							res+= `		const super_${name} = psupe.${name} ?? (()=>{});\n`;
							res+= `		this.${name}=${name};\n`;
						}
					break;
				}
			}

			return res;
		}

		/* Write - Clase */
		function WriteStyle() {
			if ( !struct.style ) return '';

			return (
				`function Styles${struct.class_name}() {\n` +
				`	if ( window['style_${struct.class_name}'] ) return;\n` +
				"\n" +
				"	let style = document.createElement( 'style' );\n" +
				`	style.id  = 'style_${struct.class_name}';\n` +
				"\n" +
				"	style        .appendChild( document.createTextNode( `"+ struct.style.code +"` ) );\n" +
				"	document.head.appendChild( style );\n" +
				`};Styles${struct.class_name}();\n`
			);
		}

		function WriteFacilityFunctions() {
			if ( CORE===false ) return '';

			let   res = '\n';
			const eve = struct.view?.struct?.events || {};

			if ( Object.keys( eve ).length )
				ofile.is_Events_in_js = true;

			if ( ofile.is_Typeof_in_js || ofile.is_Class_in_js                                 ) res+= 'window.Typeof=o=>Object.prototype.toString.call(o).slice(8,-1).toLowerCase();\n';
			if ( ofile.is_Hash_in_js || ofile.is_pointer_in_reference || ofile.is_Events_in_js ) res+= 'let Hash=n=>{window._id??=0,n??=(new Date).toString()+ ++window._id;let t=5381,w=n.length;for(;w;)t=33*t^n.charCodeAt(--w);return t>>>0};\n';
			if ( ofile.is_pointer_in_reference                                                 ) res+= 'let PointerFromReference=n=>{window._pointers??={};const o="HA["+Hash();return window._pointers[o]=n,o};\n';
			if ( ofile.is_Add_in_js                                                            ) res+= 'SVGSVGElement.prototype.Add=HTMLElement.prototype.Add=function(e,t){if("string"==typeof e){const d=document.createElement("div");if(d.innerHTML=e,void 0===t||t)for(;d.childNodes.length;)this.appendChild(d.childNodes[0]);else for(;d.childNodes.length>0;)this.insertBefore(d.childNodes[0],this.childNodes[0])}else this.appendChild(e);return this};\n';
			if ( ofile.is_Remove_in_js || ofile.is_Events_in_js                                ) res+= 'SVGSVGElement.prototype.Events=HTMLElement.prototype.Events=function(e,t){this._events_??=[];const n=this,s=(e,t)=>{for(const s of t){const t={group:e,id:Hash(),event:s.event,call:s.callback,element:s.element,options:"touchstart"===s.event?{passive:!0,...s.options}:s.options,that:n,exec:function(e){const t=e._params||[];"function"==typeof s.callback&&(e._result=s.callback.call(n,e,...t))}};this._events_.push(t),t.element.addEventListener(t.event,t.exec,t.options)}};if(null==e)return this._events_;if(!1===e){for(const e of this._events_)e.element.removeEventListener(e.event,e.exec,e.options);this._events_=[]}else if("string"==typeof e)if(!1===t)for(const[t,n]of this._events_.entries())n.group===e&&(n.element.removeEventListener(n.event,n.exec,n.options),this._events_.splice(t,1));else Array.isArray(t)&&s(e,t);else Array.isArray(e)&&s("",e)};\n';
			if ( ofile.is_Trigger_in_js                                                        ) res+= 'SVGSVGElement.prototype.Trigger=HTMLElement.prototype.Trigger=function(e,...t){if(!e||"string"!=typeof e)return;const r=new Event(e,{bubbles:!0,cancelable:!1});return r._params=t,this.dispatchEvent(r),r._result};\n';
			if ( ofile.is_Remove_in_js                                                         ) res+= 'SVGSVGElement.prototype.Remove=HTMLElement.prototype.Remove=function(){return this.Events(!1),this.parentNode.removeChild(this),this};\n';
			if ( ofile.is_Atts_in_js                                                           ) res+= 'SVGSVGElement.prototype.Atts=HTMLElement.prototype.Atts=function(t,e){const i=(t,e)=>!!t&&(void 0===e?this.getAttribute(t):void(!1===e?this.removeAttribute(t):this.setAttribute(t,e)));if("string"==typeof t){if(void 0===e)return i(t);i(t,e)}else if("object"==typeof t)for(let e in t)i(e,t[e]);return this};\n';
			if ( ofile.is_Class_in_js                                                          ) res+= 'SVGSVGElement.prototype.Class=HTMLElement.prototype.Class=function(...t){const s=(t,s)=>{if(s)if("regexp"==Typeof(s))for(let e=this.classList.length;e--;){const i=this.classList[e];i&&i.match(s)&&(t?this.classList.add(i):this.classList.remove(i))}else t?this.classList.add(s):this.classList.remove(s)};if(!t.length)return this.classList;if("boolean"!=typeof t[t.length-1])return this.classList.contains(...t);if("object"==Typeof(t[0]))for(let e in t[0])s(t[0][e],e);else{const e=t[t.length-1];t.splice(t.length-1,1);for(let i in t)s(e,t[i])}return this};\n';
			if ( ofile.is_Css_in_js || ofile.is_Position_in_js                                 ) res+= 'SVGSVGElement.prototype.Css=HTMLElement.prototype.Css=function(t,e){const o=(t,e)=>{"number"==typeof e&&"opacity"!=t&&"zIndex"!=t&&"z-index"!=t&&"order"!=t&&(e+="px"),void 0!==this.style[t]&&(this.style[t]=e)};if("string"==typeof t&&void 0===e)return window.getComputedStyle(this)[t];if("string"==typeof t&&void 0!==e)o(t,e);else if("object"==typeof t)for(let e in t)o(e,t[e]);return this};\n';
			if ( ofile.is_Position_in_js                                                       ) res+= 'SVGSVGElement.prototype.Position=HTMLElement.prototype.Position=function(t){if(void 0===t){const t=this.getBoundingClientRect(),o=null!=this.offsetParent?this.offsetParent.getBoundingClientRect():{top:0,left:0,right:0,bottom:0,width:0,height:0};return{top:t.top-o.top,left:t.left-o.left,right:t.right-o.right,bottom:t.bottom-o.bottom,width:t.width,height:t.height}}if("off"===t){const t=this.getBoundingClientRect();return{top:t.top,left:t.left,right:t.right,bottom:t.bottom,width:t.width,height:t.height}}return"object"==typeof t&&this.Css(t),this};\n';
			if ( ofile.is_Focus_in_js                                                          ) res+= 'SVGSVGElement.prototype.Focus=HTMLElement.prototype.Focus=function(){return setTimeout((()=>{this.focus()}),0),this};\n';
			if ( ofile.is_Find_in_js                                                           ) res+= 'SVGSVGElement.prototype.Find=HTMLElement.prototype.Find=HTMLElement.prototype.querySelectorAll;\n';
			if ( ofile.is_html_in_js                                                           ) res+= '"html"in HTMLElement.prototype||Object.defineProperty(HTMLElement.prototype,"html",{enumerable:!0,get:function(){return this.innerHTML},set:function(e){this.innerHTML=e}});\n';
			if ( ofile.is_childs_in_js                                                         ) res+= '"childs"in HTMLElement.prototype||Object.defineProperty(HTMLElement.prototype,"childs",{enumerable:!0,get:function(){let e,t=[];for(let n=this.childNodes.length;n--;)l=this.childNodes[n],e=Object.prototype.toString.call(l).slice(8,-1).toLowerCase(),"e"===e[e.length-7]&&"l"===e[e.length-6]&&"e"===e[e.length-5]&&"m"===e[e.length-4]&&"e"===e[e.length-3]&&"n"===e[e.length-2]&&"t"===e[e.length-1]&&t.splice(0,0,this.childNodes[n]);var l;return t}});\n';

			return res;
		}

		function WriteConnectedCallback() {
			return (
				"	connectedCallback() {\n" +
				"		window._pointers??= {};\n" +
				"\n" +
				"		let body;\n" +
				"\n" +
				"		if ( this.innerHTML[0]==='H' && this.innerHTML[1]==='A' && this.innerHTML[2]==='[' ) {\n" +
				"			body           = window._pointers[this.innerHTML];\n" +
				"			this.innerHTML = '';\n" +
				"			window._pointers[this.innerHTML] = undefined;\n" +
				"		}\n"+
				"		else body = this.innerHTML;\n"+
				"\n" +
				"		Object.defineProperty( this, 'body', { writable:false, value:body || '' } );" +
				"\n" +
				"		typeof this.View==='function' && this.View();\n" +
				"	}\n"
			);
		}
		function WriteDisconnectedCallback() {
			return (
				"	disconnectedCallback() {\n" +
				"		for ( const v of Object.values( this._events_ ?? {} ) )\n" +
				"			v.element.removeEventListener( v.event, v.exec );\n" +
				"\n" +
				"		this._destroy_?.();\n" +
				"		this._super_destroy_?.();\n" +
				"	}\n"
			);
		}
		function WriteServices() {
			let const_funcs = '';

			for ( const k in { ...struct.functions, ...struct.arrow_functions } ) {
				const func = struct.functions[k];

				if ( func.name==='onGateway' ) continue;

				switch ( func.zone ) {
					case tzBackTcp   : const_funcs+= '\n\tconst '+ func.name +' = _meme_protocol.Exec.bind(null,1,"'+ func.class_and_name +'");'; break;
					case tzBackEdge  : const_funcs+= '\n\tconst '+ func.name +' = _meme_protocol.Exec.bind(null,3,"'+ func.class_and_name +'");'; break;
					case tzBackSocket: const_funcs+= '\n\tconst '+ func.name +' = _meme_protocol.Exec.bind(null,2,"'+ func.class_and_name +'");'; break;
				}
			}

			return const_funcs;
		}
		function WriteInitAttributes() {
			let mod = '';

			for ( const [key,param] of Object.entries( struct.view?.struct?.host.params ?? {} ) )
				mod+= '		this.setAttribute( `'+ key +'`, this.getAttribute(`' + key + '`) || `'+ param +'` );\n';

			return (
				"	InitAttributes( props ) {\n" +
						mod +
						"\n" +
				"		window._pointers??= {};\n" +
						"\n" +
				"		if ( this.attributes ) {\n" +
				"			for ( let x = this.attributes.length; x--; ) {\n" +
				"				if ( this.attributes[x].value[0]==='H' && this.attributes[x].value[1]==='A' && this.attributes[x].value[2]==='[' ) {\n" +
				"					props[this.attributes[x].name] = window._pointers[this.attributes[x].value];\n" +
									"\n" +
				"					window._pointers[this.attributes[x].value] = undefined;\n" +
									"\n" +
				"					this.removeAttribute( this.attributes[x].name );\n" +
				"				}\n" +
				"				else if ( this.attributes[x].value==='true'  ) { props[this.attributes[x].name] = true  }\n" +
				"				else if ( this.attributes[x].value==='false' ) { props[this.attributes[x].name] = false }\n" +
				"				else                                           props[this.attributes[x].name] = this.attributes[x].value;\n" +
				"			}\n" +
				"		}\n" +
				"	}\n"
			);
		}
		function WriteObservedAttributes() {
			const arr = Object.keys( struct.getters_setters ).join( '", "' );

			if ( !arr ) return '';
			else        return '\tstatic get observedAttributes() { return ["' + arr + '"] }';
		}
		async function WriteView( res_functions ) {
			const vie = Typeof( struct.view )==='object' ? struct.view : {};
			const cla = [struct.class_name].concat( vie.struct?.host.clase || [] ).filter( v => !!v );

			return (
				'\n' +
				"	View( _html='', _refs=[], _nams=[], _props={}, _references={}, _is_pre=false, _psupe={}, _slots={} ) {\n" +
				"		const gthis = this;\n" +
				"		const psupe = {};\n" +
				"		const props = _props;\n" +
				"		const refs  = _references;\n" +
						( res_functions + '\n\n' ) +
				"		this.InitAttributes( props );\n\n" +

				"		const _clases_ = [`" + cla.join( "`, `" ) + "`].filter( v => !!v );\n" +
				"		if ( this.classList ) this.classList.add( ..._clases_ );\n" +

						WriteServices      () + '\n' +
						WritePsupe         () + '\n' +
						WriteEventsFirst   () + '\n' +
						await WriteSlots   () + '\n' +
						WriteTextView      () + '\n' +
						WriteGettersSetters() + '\n' +
						WriteEvents        () + '\n' +
						WriteReasign       () + '\n' +

				"		this._super_destroy_ = this._destroy_;\n" +
				"		typeof Create==='function' && Create();\n" +
				"		typeof Destroy==='function' && ( this._destroy_=Destroy );\n" +
				"	}" +
				""
			);
		}
		function WriteImports() {
			let res = '';

			for ( const [key, value] of Object.entries( ofile.imports ) ) {
				if ( value.find( v=>!v.not_require ) ) {
					res+= `import {} from '${ CONFIG.constants.APP }/${ key }.js';\n`;
				}
			}

			if ( struct.extends_class && !struct.extends_class.match( /^(HTML|SVGE|SVGA)/ ) )
				res+= `import {} from '${ CONFIG.constants.APP }/${ struct.extends_class }.js';\n`;

			return res;
		}

		/* Inicio */
		async function Inicio() {
			if ( !struct.class_name ) return '';

			const { class_name, extends_class, extends_tag, custom_tag } = struct;
			let   res_general                                             = '';
			let   res_functions                                           = '';

			[res_general, res_functions] = WriteClassStatics  ( res_general, res_functions );
			[res_general, res_functions] = WriteClassVariables( res_general, res_functions );
			[res_general, res_functions] = WriteClassFunctions( res_general, res_functions );

			if ( struct.view  ) struct.view.code  = await WriteMH( struct.view.struct , ofile, struct.class_name );
			if ( struct.style ) struct.style.code = await WriteMC( struct.style.struct, ofile, struct.class_name );

			let res = (
				WriteFacilityFunctions() +

				'/*.*class*.*/\n' +
				`if (!window.customElements.get('${custom_tag}')) {\n` +
				WriteStyle() +
				`window.${ class_name } = class ${ class_name } extends ${ extends_class ? `window.${ extends_class }` : 'window.HTMLElement' } {\n` +
					( res_general ? ( res_general + '\n\n' ) : '' ) +
					WriteConnectedCallback   () +
					WriteDisconnectedCallback() +
					"\tattributeChangedCallback( name, oldValue, newValue ) { this[name] = newValue }\n" +
					WriteInitAttributes    (               ) +
					WriteObservedAttributes(               ) +
					await WriteView        ( res_functions ) +
					'\n' +
				"};\n" +
				`window.customElements.define( '${ custom_tag }', window.${ class_name }${ extends_tag ? ( ", { extends: '" + extends_tag + "' }" ) : '' } );` +
				'}\n'+
			'');

			res = await TranspileEnd( res, ofile );
			res = WriteImports() + res;

			return res;
		};return await Inicio();
	}
	async function WriteModule( struct, ofile ) {
		/* WRITE */
		function WriteClassStatics( res_general, res_functions, clase ) {
			let pug = '';

			for ( const k in struct.statics ) {
				const { zone, name, value } = struct.statics[k];

				if ( zone===tzFrontPublic || zone===tzFrontPrivate ) continue;

				pug+= "\n\tstatic " + name;

				if ( value ) {
					if ( value.match( /true/i ) || value.match( /false/i ) ) pug+= `=${ !( !value || value.match( /false/i ) ) }`
					else                                                     pug+= `='${value}'`;
				}

				pug+= ";";
			}

			if ( pug ) {
				res_general+= pug;
			}

			return [res_general, res_functions];
		}
		function WriteClassVariables( res_general, res_functions, clase ) {
			let puf = '', pug = '', prf = '';

			for ( const k in clase.variables ) {
				const { zone, is_static, name, value } = clase.variables[k];

				switch ( zone ) {
					case tzBackTcp   :
					case tzBackEdge  :
					case tzBackSocket:
					case tzBackPublic:
						if ( is_static ) { pug+= "\nstatic " + name; if ( value ) pug+= "=" + value; pug+= ";"; }
						else             { puf+= "\n\tthis." + name; if ( value ) puf+= "=" + value; puf+= ";"; }
					break;

					case tzBackPrivate:
						if ( is_static ) { pug+= "\nstatic " + name; if ( value ) pug+= "=" + value; pug+= ";"; }
						else             { prf+= "\n\tlet "  + name; if ( value ) prf+= "=" + value; prf+= ";"; }
					break;

					default: break;
				}
			}

			if ( pug ) res_general  += pug;
			if ( puf ) res_functions+= puf;
			if ( prf ) res_functions+= prf;

			return [res_general, res_functions];
		}
		function WriteClassFunctions( res_general, res_functions, clase ) {
			let puf = '', pug = '', prf = '';

			for ( const k in clase.functions ) {
				let { zone, is_static, is_async, name, params, body } = clase.functions[k];

				switch ( zone ) {
					case tzBackEdge:
						if ( is_static ) pug+= `\n/*f*/static ` + ( is_async ? "async " : "" ) + name + params + body;
						else             puf+= `\n\t/*f*/const ` + name + "=this." + name + "=" + ( is_async ? "async " : "" ) + "function" + params + body + ";this." + name + ".is_function_edge=true;";
					break;

					case tzBackTcp:
						if ( is_static ) pug+= `\n/*f*/static ` + ( is_async ? "async " : "" ) + name + params + body;
						else             puf+= `\n\t/*f*/const ` + name + "=this." + name + "=" + ( is_async ? "async " : "" ) + "function" + params + body + ";this." + name + ".is_function_tcp=true;";
					break;

					case tzBackSocket:
						if ( is_static ) pug+= `\n/*f*/static ` + ( is_async ? "async " : "" ) + name + params + body;
						else             puf+= `\n\t/*f*/const ` + name + "=this." + name + "=" + ( is_async ? "async " : "" ) + "function" + params + body + ";this." + name + ".is_function_socket=true;";
					break;

					case tzBackPublic:
						if ( is_static ) pug+= `\n/*f*/static ` + ( is_async ? "async " : "" ) + name + params + body;
						else             puf+= `\n\t/*f*/const ` + name + "=this." + name + "=" + ( is_async ? "async " : "" ) + "function" + params + body;
					break;

					case tzBackPrivate:
						if ( is_static ) pug+= `\n/*f*/static ` + ( is_async ? "async " : "" ) + name + params + body;
						else             prf+= `\n\t/*f*/const ` + name + "=" + ( is_async ? "async " : "" ) + "function" + params + body + ";";
					break;
				}
			}

			if ( pug ) res_general  += pug;
			if ( puf ) res_functions+= puf;
			if ( prf ) res_functions+= prf;

			return [res_general, res_functions];
		}

		function WriteClass( res ) {
			if ( !struct.is_server_class ) return res;

			let res_general              = '', res_functions = '';
			[res_general, res_functions] = WriteClassStatics  ( res_general, res_functions, struct );
			[res_general, res_functions] = WriteClassVariables( res_general, res_functions, struct );
			[res_general, res_functions] = WriteClassFunctions( res_general, res_functions, struct );

			if ( !res_general && !res_functions ) return res;

			return (
				res +
				"\n" +
				"module.exports = class {\n" +
					res_general +
					"\n" +
					"\n" +
					"/* METODOS */\n" +
					"constructor() {\n" +
						res_functions + "\n" +
						"\n" +
						"\ttypeof MemeCreateService==='function' && MemeCreateService.call( this );\n" +
					"}\n" +
				"}"
			);
		}

		/* Inicio */
		async function Inicio() {
			let
			code = WriteClass        ( struct.code );
			code = await TranspileEnd( code, ofile );

			return code;
		};return await Inicio();
	}
	async function WriteMap( origin, generate, ofile ) {
		/* Declaraciones */
		let vlq_string    = '';
		let line_position = 0;

		/* Get */
		function GetString( cad, pos ) {
			const end = cad[pos];

			for ( pos++; pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case '\\': pos++; break;
					case end : return pos;
				}
			}

			return pos;
		}
		function GetGroup( cad, pos ) {
			const end = cad[pos]==='(' ? ')' : ( cad[pos]==='[' ? ']' : '}' );

			for ( pos++; pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case end: return pos;

					case '"':
					case "'": pos = GetString( cad, pos ); break;

					case '`': pos = GetStringTemplate( cad, pos ); break;

					case '{':
					case '(':
					case '[': pos = GetGroup( cad, pos ); break;

					case '/':
						if ( cad[pos+1]==='*' && cad[pos+2]==='f' && cad[pos+3]==='*' && cad[pos+4]==='/' ) {
							pos = GetFunction( cad, pos ); break;
						}
					break;
				}
			}

			return pos;
		}
		function GetStringTemplate( cad, pos ) {
			for ( ;pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case '\\': pos++; break;
					case '`' : return pos;

					case '$':
						if ( cad[pos+1]==='{' ) {
							pos = GetGroup( cad, ++pos );
						}
					break;
				}
			}

			return pos;
		}

		function GetFirstLines( cad, pos ) {
			if ( vlq_string ) return;

			for ( ;pos>=0; pos-- ) {
				switch ( cad[pos] ) {
					case '\r':
					case '\n': vlq_string+=';'; break;
				}
			}
		}
		function GetLine( cad, final_position ) {
			let pos = 0, lin = 0;

			for ( ;pos<final_position; pos++ ) {
				switch ( cad[pos] ) {
					case '\r':
					case '\n': lin++; break;
				}
			}

			let
			liv           = lin;
			lin           = lin - line_position;
			line_position = liv;

			return lin;
		}
		function GetPositionInOrigin( cad, pos ) {
			let res = '';

			for_origin:
			for ( ;pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case '{':
					case '/':
					case ':': break;

					case '*':
						if ( cad[pos+1]==='/' ) {
							break for_origin;
						}
					break;

					default: res+= cad[pos];
				}
			}

			return parseInt( res );
		}
		function GetVLQS( cad, pos, lin, len ) {
			const poe = pos + len + 1;

			for ( ;pos<poe; pos++ ) {
				switch ( cad[pos] ) {
					case '\r':
					case '\n':
						vlq_string   += VlqEncode([ 0, 0, lin, 0 ]) + ';';
						line_position+= 1;
						lin           = 1;
					break;
				}
			}

			for_ends:
			for ( ;pos<cad.length; pos++ ) {
				switch( cad[pos] ) {
					case '\n':
					case '\r': vlq_string+= VlqEncode([ 0, 0, 1, 0 ]) + ';'; break for_ends;
				}
			}
		}

		function GetFunction( cad, pos ) {
			let start, position_in_origin, length_function, line;

			GetFirstLines( cad, pos );

			for ( ;pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case '(': pos = GetGroup( cad, pos, true ); break;
					case '{':
						start              = pos + 1;
						position_in_origin = GetPositionInOrigin( cad, pos );
						pos                = GetGroup           ( cad, pos, true );
						length_function    = pos - start;
						line               = GetLine( origin, position_in_origin );

						GetVLQS( generate, start, line, length_function );
					return pos;
				}
			}

			return pos;
		}

		/* Procs */
		function ProcFunctions( cad ) {
			let pos = 0;

			for ( ;pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case '"':
					case "'": pos = GetString( cad, pos ); break;

					case '`': pos = GetStringTemplate( cad, pos ); break;

					case '{':
					case '[':
					case '(': pos = GetGroup( cad, pos ); break;
				}
			}
		}
		function ProcLib( cad ) {
			let lin = 0;
			let pos = 0;

			for ( ;pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case '\r':
					case '\n':
						vlq_string+= VlqEncode([ 0, 0, lin, 0 ]) + ';';
						lin        = 1;
					break;
				}
			}
		}

		/* Inicio */
		async function Inicio() {
			if ( ofile.is_require ) ProcLib      ( generate );
			else                    ProcFunctions( generate );

			const map = (
				`{` +
					`"version"`        + `:3,`                   +
					`"sources"`        + `:["${ ofile.path }"],` +
					`"names"`          + `:[],`                  +
					`"mappings"`       + `:"${ vlq_string }",`   +
					`"sourcesContent"` + `:["${ origin.replace( /\\/gm, '\\\\' ).replace( /\"/gm, '\\"' ) }"],` +
					`"sourceRoot"`     + `:"${ ofile.path }"` +
				`}`
			).replace( /\n|\r/gm, '\\n' ).replace( /\t/gm, '\\t' );

			return (
				generate +
				`\n//# sourceMappingURL=data:application/json;base64,${ ( new Buffer.from( map ) ).toString( 'base64' ) }` +
				`\n//# sourceURL=${ ofile.path }`
			);
		};return await Inicio();
	}
	async function WriteMapBuild( origin, generate, position, ofile ) {
		/* Declaraciones */
		let vlq_string    = '';
		let line_position = 0;

		/* Get */
		function GetLinePosition( cad ) {
			let pos = 0;

			for ( ;pos<cad.length && pos<position; pos++ ) {
				switch ( cad[pos] ) {
					case '\n':
					case '\r': line_position++; break;
				}
			}
		}
		function GetVLQS( cad ) {
			let lin = line_position;
			let pos = 0;

			for ( ;pos<cad.length; pos++ ) {
				switch ( cad[pos] ) {
					case '\r':
					case '\n':
						vlq_string+= VlqEncode([ 0, 0, lin, 0 ]) + ';';
						lin        = 1;
					break;
				}
			}
		}

		/* Inicio */
		function Inicio() {
			GetLinePosition( origin );
			GetVLQS        ( generate );

			let map = (
				`{` +
					`"version"`        + `:3,`                   +
					`"sources"`        + `:["${ ofile.path }"],` +
					`"names"`          + `:[],`                  +
					`"mappings"`       + `:";;${ vlq_string }",`   +
					`"sourcesContent"` + `:["${ origin.replace( /\\/gm, '\\\\' ).replace( /\"/gm, '\\"' ) }"],` +
					`"sourceRoot"`     + `:"${ ofile.path }"` +
				`}`
			).replace( /\n|\r/gm, '\\n' ).replace( /\t/gm, '\\t' );

			map = (
				generate +
				`\n//# sourceMappingURL=data:application/json;base64,${ ( new Buffer.from( map ) ).toString( 'base64' ) }` +
				`\n//# sourceURL=${ ofile.path }`
			);

			return map;
		};return Inicio();
	}
	// **************************************************


	/* Inicio */
	return {
		cxCSS, cxHTML, cxJS, cxBuild, cxRequest, cxPointer, cxWrite,

		IsComment,
		IsSpecial,
		IsSpaces,
		IsSpacesLine,
		IsSpacesTabs,
		IsLetter,
		IsNumber,
		IsValidLetter,
		IsValidValue,
		IsOperator,
		IsVoid,
		IsReturn,
		IsRegExp,
		IsScript,
		IsViewFunction,

		GetComment, GetRegExp,

		Configure,

		TranspileGeneral,
		TranspileEnd,
		TranspileExec,

		ParseMC,
		ParseMH,
		ParseMJ,

		WriteMH    ,
		WriteMC    ,
		WriteMJ    ,
		WriteModule,

		WriteMap,
	};
	// **************************************************
};
// ###################################################################################################