//                    Copyright meme.js Authors
//     Distributed under the Boost Software License, Version 1.1.
// (See accompanying file LICENSE or copy at https://mjs.red/LICENSE)


'use strict';

/*Declaraciones*/
const PIx2 = Math.PI * 2;
// ###################################################################################################

/* Creacion de curvas */
function CurveSimple( n ) {
	return {
		In   : () => p => Math.pow( p, n ),
		Out  : () => p => 1 - Math.pow( 1 - p, n ),
		InOut: () => p => p<.5 ? Math.pow( p * 2, n ) / 2 : 1 - Math.pow(( 1 - p ) * 2, n ) / 2,
	};
}
function CurveComplex( In, Out, InOut, OutIn ) {
	if ( OutIn )
		InOut = ( p, ...params ) => p<.5 ? ( 1 - OutIn( 1 - p * 2, ...params ) ) / 2 : .5 + OutIn( ( p - .5 ) * 2, ...params ) / 2;

	if      ( !In  && Out ) In  = ( p, ...params ) => 1 - Out( 1 - p, ...params );
	else if ( !Out && In  ) Out = ( p, ...params ) => 1 - In ( 1 - p, ...params );

	return {
		In   : ( ...params ) => In    ? p => In   ( p, ...params ) : p => 1 - Out( 1 - p, ...params ),
		Out  : ( ...params ) => Out   ? p => Out  ( p, ...params ) : p => 1 - In ( 1 - p, ...params ),
		InOut: ( ...params ) => InOut ? p => InOut( p, ...params ) : p => p<.5 ? ( In( p * 2, ...params ) / 2 ) : ( 1 - In( ( 1 - p ) * 2, ...params ) / 2 ),
	};
}
function CurveBack() {
	const out = ( p, o=1.70158 ) => !p ? 0 : ( --p * p * ( ( o + 1 ) * p + o ) + 1 );

	return CurveComplex( null, out, null, out );
}
function CurveElastic() {
	const out = ( p, amplitude, period, type ) => {
		let p1 = amplitude>=1 ? amplitude : 1;
		let p2 = ( period || .3 ) / ( amplitude<1 ? amplitude : 1 );
		let p3 = p2 / PIx2 * ( Math.asin( 1 / p1 ) || 0 );

		p2 = PIx2 / p2;

		return p===1 ? 1 : p1 * Math.pow( 2, -10 * p ) * Math.sin( ( p - p3 ) * p2 ) + 1;
	};

	return CurveComplex( null, out, null, out );
}
function CurveBounce() {
	const
	n0 = 7.5625,
	c0 = 2.75,
	n1 = 1   / c0,
	n2 = 2   * n1,
	n3 = 2.5 * n1;

	const out = p => (
		p<n1 ? n0 * p * p :
			p<n2 ? n0 * Math.pow( p - 1.5 / c0, 2 ) + .75 :
				p<n3 ? n0 * ( p-= 2.25 / c0 ) * p + .9375 :
					n0 * Math.pow( p - 2.625 / c0, 2 ) + .984375
	);

	return CurveComplex( null, out );
}
function CurveSlow( ratio, curve, return_mode ) {
	ratio = Math.min( 1, ratio ?? .7 );

	const pow = ratio>=1 ? 0 : ( curve ?? .7 );
	const p1  = ( 1 - ratio ) / 2;
	const p3  = p1 + ratio;

	return p => p => {
		const r = p + ( .5 - p ) * pow;

		return (
			p<p1 ?
				return_mode ?
					1 - ( p = 1 - p / p1 ) * p
					:
					r - ( p = 1 - p / p1 ) * p * p * p * r
				:
				p>p3 ?
					return_mode ?
						p===1 ?
							0
							:
							1 - ( p = ( p - p3 ) / p1 ) * p
						:
						r + ( p - r ) * ( p = ( p - p3 ) / p1 ) * p * p * p
					:
					return_mode ?
						1
						:
						r
		);
	};
}
// ###################################################################################################

/* Curvas */
const Linear = () => p => p;

const Quadratic = CurveSimple( 2 );
const Cubic     = CurveSimple( 3 );
const Quartic   = CurveSimple( 4 );
const Quintic   = CurveSimple( 5 );

const Back        = CurveBack   ();
const Elastic     = CurveElastic();
const Bounce      = CurveBounce ();
const Slow        = CurveSlow   ();
const Circular    = CurveComplex( p => -( Math.sqrt( 1 - p * p ) - 1 )              , null );
const Exponential = CurveComplex( p => p ? Math.pow( 2, 10 * ( p - 1 ) ) : 0        , null );
const Sinusoidal  = CurveComplex( p => p===1 ? 1 : -Math.cos( p * ( PIx2 / 4 ) ) + 1, null );
// ###################################################################################################

/* Conversion de color */
function RGBaXYZ( red, green, blue ) {
	red  /= 255;
	green/= 255;
	blue /= 255;

	if ( red   > .04045 ) red   = Math.pow( ( ( red   + .055 ) / 1.055 ), 2.4 ); else red   = red   / 12.92;
	if ( green > .04045 ) green = Math.pow( ( ( green + .055 ) / 1.055 ), 2.4 ); else green = green / 12.92;
	if ( blue  > .04045 ) blue  = Math.pow( ( ( blue  + .055 ) / 1.055 ), 2.4 ); else blue  = blue  / 12.92;

	red  *= 100;
	green*= 100;
	blue *= 100;

	return ({
		x: red * .4124 + green * .3576 + blue * .1805,
		y: red * .2126 + green * .7152 + blue * .0722,
		z: red * .0193 + green * .1192 + blue * .9505,
	});
}
function RGBaLAB( red, green, blue, alpha ) {
	let xyz = RGBaXYZ( red, green, blue );
	let rex = xyz.x / 95.047 ;
	let rey = xyz.y / 100    ;
	let rez = xyz.z / 108.883;

	if ( rex>0.008856 ) rex = Math.pow( rex, ( 1 / 3 ) ); else rex = ( 7.787 * rex ) + ( 16 / 116 );
	if ( rey>0.008856 ) rey = Math.pow( rey, ( 1 / 3 ) ); else rey = ( 7.787 * rey ) + ( 16 / 116 );
	if ( rez>0.008856 ) rez = Math.pow( rez, ( 1 / 3 ) ); else rez = ( 7.787 * rez ) + ( 16 / 116 );

	return ({
		l: ( 116 * rey ) - 16 ,
		a: 500 * ( rex - rey ),
		b: 200 * ( rey - rez ),
		p: alpha              ,
	});
}
function LABaXYZ( l, a, b ) {
	let y = ( l + 16 ) / 116;
	let x = ( a / 500 ) + y;
	let z = y - ( b / 200 );

	if ( Math.pow( y, 3 ) > .008856 ) y = Math.pow( y, 3 ); else y = ( y - 16 / 116 ) / 7.787;
	if ( Math.pow( x, 3 ) > .008856 ) x = Math.pow( x, 3 ); else x = ( x - 16 / 116 ) / 7.787;
	if ( Math.pow( z, 3 ) > .008856 ) z = Math.pow( z, 3 ); else z = ( z - 16 / 116 ) / 7.787;

	return ({
		x: x * 95.047 ,
		y: y * 100    ,
		z: z * 108.883,
	});
}
function LABaRGB( l, a, b ) {
	let xyz = LABaXYZ( l, a, b );

	xyz.x/= 100;
	xyz.y/= 100;
	xyz.z/= 100;

	let rgb = {
		r: xyz.x *  3.2406 + xyz.y * -1.5372 + xyz.z * - .4986,
		g: xyz.x * - .9689 + xyz.y *  1.8758 + xyz.z *   .0415,
		b: xyz.x *   .0557 + xyz.y * - .2040 + xyz.z *  1.0570,
	};

	if ( rgb.r>.0031308 ) rgb.r = 1.055 * Math.pow( rgb.r, ( 1 / 2.4 ) ) - .055; else rgb.r = 12.92 * rgb.r;
	if ( rgb.g>.0031308 ) rgb.g = 1.055 * Math.pow( rgb.g, ( 1 / 2.4 ) ) - .055; else rgb.g = 12.92 * rgb.g;
	if ( rgb.b>.0031308 ) rgb.b = 1.055 * Math.pow( rgb.b, ( 1 / 2.4 ) ) - .055; else rgb.b = 12.92 * rgb.b;

	rgb.r*= 255; rgb.r = rgb.r<0 ? 0 : ( rgb.r > 255 ? 255 : rgb.r );
	rgb.g*= 255; rgb.g = rgb.g<0 ? 0 : ( rgb.g > 255 ? 255 : rgb.g );
	rgb.b*= 255; rgb.b = rgb.b<0 ? 0 : ( rgb.b > 255 ? 255 : rgb.b );

	return rgb;
}
// ####################################################################################################

/* Parseos */
function ParsePropertie( prop ) {
	let   res;
	const arr = [];
	const rex = /(rgba?\s*\(\s*([\d\.\-]+)\s*\,\s*([\d\.\-]+)\s*\,\s*([\d\.\-]+)\s*(\,\s*([\d\.\-]+)\s*)?\))|([\d\.\-]+)|([^\d\.\-]+)/gm;

	while ( res = rex.exec( prop ) ) {
		if ( res[7]!==undefined ) {
			const tem = parseFloat( res[7] );

			arr.push( isNaN( tem )===true ? res[7] : tem );
		}
		else if ( res[1] ) {
			const tem = parseFloat( res[6] );

			arr.push(
				RGBaLAB(
					res[2],
					res[3],
					res[4],
					isNaN( tem ) ? res[6] : tem
				)
			);
		}
		else arr.push( res[8] );
	}

	return arr;
}
function ParseProperties( element, options ) {
	const clone          = document.createElement( 'div' );
	const result         = { property1:{}, property2:{} };
	clone.style.position = 'absolute';

	element.parentNode.appendChild( clone );

	const style1 = getComputedStyle( element );
	const style2 = getComputedStyle( clone   );

	for ( let pro in options ) {
		if ( style1[pro]===undefined ) continue;

		typeof options[pro]==='number' && pro!=='opacity' && pro!=='order' && pro!=='z-index' && ( options[pro]+= 'px' );

		clone.style[pro] = options[pro];

		if ( style1[pro]!==style2[pro] ) {
			result.property1[pro] = style1[pro];
			result.property2[pro] = style2[pro];

			if ( pro==='transform' ) {
				if ( style1[pro]==='none' ) result.property1[pro] = 'matrix(1, 0, 0, 1, 0, 0)';
				if ( style2[pro]==='none' ) result.property2[pro] = 'matrix(1, 0, 0, 1, 0, 0)';
			}
			else if ( pro==='boxShadow' ) {
				if ( style1[pro]==='none' ) result.property1[pro] = 'rgb(153, 153, 153) 0px 0px 0px 0px';
				if ( style2[pro]==='none' ) result.property2[pro] = 'rgb(153, 153, 153) 0px 0px 0px 0px';
			}
			else if ( pro==='lineHeight' ) {
				if ( style1[pro]==='normal' ) result.property1[pro] = '16px';
				if ( style2[pro]==='normal' ) result.property2[pro] = '16px';
			}
		}
	}

	element.parentNode.removeChild( clone );

	for ( let pro in result.property1 ) {
		result.property1[pro] = ParsePropertie( result.property1[pro] );
		result.property2[pro] = ParsePropertie( result.property2[pro] );
	}

	return result;
}
function ParseLAB( progress, color1, color2, calculate ) {
	let   tl = calculate( progress, color1.l     , color2.l      );
	const ta = calculate( progress, color1.a     , color2.a      );
	const tb = calculate( progress, color1.b     , color2.b      );
	const al = calculate( progress, color1.p ?? 1, color2.p ?? 1 );
	tl       = LABaRGB  ( tl, ta, tb );

	if ( color1.p || color2.p ) return `rgba(${tl.r}, ${tl.g}, ${tl.b}, ${ al })`;
	else                        return `rgb(${tl.r}, ${tl.g}, ${tl.b})`;
}
// ####################################################################################################

/* Funciones */
function Hash( data ) {
	if ( !window._id ) window._id = 0;
	if ( !data       ) data       = ( new Date() ).toString() + ++window._id;

	let hash = 5381, num = data.length;

	while ( num )
		hash = ( hash * 33 ) ^ data.charCodeAt( --num );

	return hash >>> 0;
}
// ####################################################################################################

/* Extenciones */
SVGSVGElement.prototype.Animate = HTMLElement.prototype.Animate = function( options ) {
	if ( !options ) return this._animation_hash = null;

	const calculate = ( p, s, f ) => s + ( ( p * ( f - s ) ) / 1 );

	return new Promise( run => {
		options.self       = this;
		options.properties = ParseProperties( this, options );
		options.hash       = this._animation_hash = Hash();
		options.time     ??= .3;
		options.time      *= 1000;
		options.delay    ??= 0;
		options.delay     *= 1000;
		options.curve    ??= Exponential.Out();
		options.run        = run;
		options.is_func    = typeof options.func==='function';
		options.animate    = time => {
			options.start??= time;
			let fraction   = ( time - options.start ) / options.time;

			if ( fraction>1 ) fraction = 1;

			let progress = options.curve( fraction );

			if ( options.is_func ) options.func( progress );
			else for ( const [k, v] of Object.entries( options.properties.property1 ) ) {
				let tem = '';

				for ( const [ii, vv] of v.entries() ) {
					switch ( typeof vv ) {
						case 'object': tem+= ParseLAB ( progress, vv, options.properties.property2[k][ii], calculate ); break;
						case 'number': tem+= calculate( progress, vv, options.properties.property2[k][ii]            ); break;
						default      : tem+= vv;
					}
				}

				options.self.style[k] = tem;
			}

			if ( fraction<1 && options.hash===this._animation_hash ) window.requestAnimationFrame( options.animate );
			else                                                     options.run();
		};

		if ( options.delay ) setTimeout( ()=>options.animate( performance.now() ), options.delay );
		else                 options.animate( performance.now() );
	} );
}
// ####################################################################################################