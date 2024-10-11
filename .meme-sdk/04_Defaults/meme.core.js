'use strict';

/* Funciones */
window.Typeof = ( type ) => Object.prototype.toString.call( type ).slice( 8, -1 ).toLowerCase();
window.Sleep = ( time ) => new Promise( ( run ) => setTimeout( run, time ) );
window.Hash = ( data ) => {
	if ( !window._id ) window._id = 0;
	if ( !data       ) data       = ( new Date() ).toString() + ++window._id;

	let hash = 5381, num = data.length;

	while ( num )
		hash = ( hash * 33 ) ^ data.charCodeAt( --num );

	return hash >>> 0;
};
window.EvalData = ({ id='', type='js', data='', src='' }) => {
	if ( type==='text' ) ( new Function( data ) )();
	else {
		if ( document.getElementById( id ) ) return;

		if ( type==='css' ) {
			let style = document.createElement( 'style' );
			style.id  = id;

			style        .appendChild( document.createTextNode( data ) );
			document.head.appendChild( style );
		}
		else if ( type==='js' ) {
			let script  = document.createElement( 'script' );
			script.id   = id;

			src  && ( script.src  = src );
			data && ( script.text = data );

			document.head.appendChild( script );
		}
	}
};
window.PointerFromReference = ( data ) => {
	if ( !window._pointers ) window._pointers = {};

	const idd             = 'HA[' + Hash();
	window._pointers[idd] = data;

	return idd;
};

/* Extenciones */
SVGSVGElement.prototype.Add = HTMLElement.prototype.Add = NodeList.prototype.Add = function( html, after ) {
	if ( Typeof( this )==='nodelist' ) { for ( const e of this ) e.Add( html, after ); return }

	const edit = ( _element, _after ) => {
		if ( _after===undefined || _after ) {
			while ( _element.childNodes.length )
				this.appendChild( _element.childNodes[0] );
		}
		else while ( _element.childNodes.length>0 )
			this.insertBefore( _element.childNodes[0], this.childNodes[0] );
	};

	if ( typeof html==='string' && html!='' ) {
		const div     = document.createElement( 'div' );
		div.innerHTML = html;

		edit( div, after );
	}
	else if ( Typeof( html )==='object' && html.childNodes ) edit( html, after );
	else                                                     this.appendChild( html );

	return this;
};
SVGSVGElement.prototype.Remove = HTMLElement.prototype.Remove = NodeList.prototype.Remove = function() {
	if ( Typeof( this )==='nodelist' ) { for ( const e of this ) e.Remove(); return }

	this.Trigger( 'destroy' );
	this.Events( false );
	this.parentNode.removeChild( this );

	return this;
};
SVGSVGElement.prototype.Atts = HTMLElement.prototype.Atts = NodeList.prototype.Atts = function( attr, value ) {
	if ( Typeof( this )==='nodelist' ) { for ( const e of this ) e.Atts( attr, value ); return }

	const edit = ( att, val ) => {
		if ( !att ) return false;

		if ( val===undefined ) return this.getAttribute( att );
		else {
			if ( val===false ) this.removeAttribute( att );
			else               this.setAttribute( att, val );
		}
	};

	if ( typeof attr==='string' ) {
		if ( value===undefined ) return edit( attr        );
		else                            edit( attr, value );
	}
	else if ( Typeof( attr )==='object' ) {
		for ( let x in attr ) edit( x, attr[x] );
	}

	return this;
};
SVGSVGElement.prototype.Class = HTMLElement.prototype.Class = NodeList.prototype.Class = function( ...value ) {
	if ( Typeof( this )==='nodelist' ) { for ( const e of this ) e.Class( ...value ); return }

	const rea = ( v, k ) => {
		if ( !k ) return;

		if ( Typeof( k )==='regexp' ) {
			for ( let i = this.classList.length; i--; ) {
				const n = this.classList[i];

				if ( n && n.match( k ) )
					v ? this.classList.add( n ) : this.classList.remove( n );
			}
		}
		else v ? this.classList.add( k ) : this.classList.remove( k );
	};

	if      ( !value.length                              ) return this.classList;
	else if ( typeof value[value.length - 1]!=='boolean' ) return this.classList.contains( ...value );
	else if ( Typeof( value[0] )==='object'              ) value[0].sForEach( rea );
	else {
		const del = value[value.length - 1];

		value.splice( value.length - 1, 1 );
		value.forEach( v => { rea( del, v ) } );
	}

	return this;
};
SVGSVGElement.prototype.Css = HTMLElement.prototype.Css = NodeList.prototype.Css = function( property, value ) {
	if ( Typeof( this )==='nodelist' ) { for ( const e of this ) e.Css( property, value ); return }

	const edit = ( property, value ) => {
		if (
			typeof value==='number' &&
			property!='opacity' &&
			property!='zIndex'  && property!='z-index' &&
			property!='order'
		) value+= 'px';

		this.style[property]!==undefined && ( this.style[property] = value );
	};

	if      ( typeof  property  ==='string' && value===undefined ) return window.getComputedStyle( this )[property];
	else if ( typeof  property  ==='string' && value!==undefined ) edit( property, value );
	else if ( Typeof( property )==='object'                      ) for( let x in property ) edit( x, property[x] );

	return this;
};
SVGSVGElement.prototype.Events = HTMLElement.prototype.Events = function( group, params ) {
	this._events_??= [];
	const thi      = this;
	const func     = ( gro, arr ) => {
		for ( const val of arr ) {
			const obj = {
				group  : gro,
				id     : Hash(),
				event  : val.event,
				call   : val.callback,
				element: val.element,
				options: val.event==='touchstart' ? { passive:true, ...val.options } : val.options,
				that   : thi,
				exec   : function( event ) {
					const _params = event._params || [];

					typeof val.callback==='function' && ( event._result = val.callback.call( thi, event, ..._params ) );
				},
			};

			this._events_.push( obj );
			obj.element.addEventListener( obj.event, obj.exec, obj.options );
		}
	};

	if      ( group==null   ) return this._events_;
	else if ( group===false ) {
		for ( const event of this._events_ ) {
			event.element.removeEventListener( event.event, event.exec, event.options );
		}

		this._events_ = [];
	}
	else if ( typeof group==='string' ) {
		if ( params===false ) {
			for ( const [ind,val] of this._events_.entries() ) {
				if ( val.group===group ) {
					val.element.removeEventListener( val.event, val.exec, val.options );
					this._events_.splice( ind, 1 );
				}
			}
		}
		else if ( Array.isArray( params ) ) {
			func( group, params );
		}
	}
	else if ( Array.isArray( group ) ) {
		func( '', group );
	}
};
SVGSVGElement.prototype.Position = HTMLElement.prototype.Position = function( size ) {
	if ( size===undefined ) {
		const re1 = this.getBoundingClientRect();
		const re2 = this.offsetParent!=null ? this.offsetParent.getBoundingClientRect() : { top:0, left:0, right:0, bottom:0, width:0, height:0 };

		return {
			top   : re1.top    - re2.top,
			left  : re1.left   - re2.left,
			right : re1.right  - re2.right,
			bottom: re1.bottom - re2.bottom,
			width : re1.width,
			height: re1.height,
		};
	}
	else if ( size==='off' ) {
		const re1 = this.getBoundingClientRect();

		return {
			top   : re1.top,
			left  : re1.left,
			right : re1.right,
			bottom: re1.bottom,
			width : re1.width,
			height: re1.height,
		};
	}
	else if ( Typeof( size )==='object' ) this.sCss( size );

	return this;
};
SVGSVGElement.prototype.Focus = HTMLElement.prototype.Focus = function() {
	setTimeout(
		()=>{
			this.focus();
		},
		0
	);

	return this;
};
SVGSVGElement.prototype.Trigger = HTMLElement.prototype.Trigger = function( event, ...params ) {
	if ( !event || typeof event!='string' ) return;

	const evt   = new Event( event, { bubbles:true, cancelable:false } );
	evt._params = params;

	this.dispatchEvent( evt );

	return evt._result;
};
SVGSVGElement.prototype.Find = HTMLElement.prototype.Find = HTMLElement.prototype.querySelectorAll;

Object.defineProperty( HTMLElement.prototype, 'html', { enumerable: true,
	get: function(     ) { return this.innerHTML },
	set: function( val ) { this.innerHTML = val },
});
Object.defineProperty( Object.prototype, 'sMap', { enumerable:false, configurable:false, writable:false, value:function( func ) {
	const res = [];
	let   ind = 0;

	for ( let x in this )
		res.push( func.call( this, this[x], x, ind++ ) );

	return res;
} } );
Object.defineProperty( Object.prototype, 'sReduce', { enumerable:false, configurable:false, writable:false, value:function( func, result ) {
	let ret = result, ant = null, ind = 0;

	for ( let x in this ) {
		if ( ret===null ) ret = this[x];
		else              ret = func.call( this, ret, this[x], x, ant, ind++ );

		ant = this[x];
	}

	return ret;
} } );
Object.defineProperty( Object.prototype, 'sFilter', { enumerable:false, configurable:false, writable:false, value:function( func ) {
	let ret = {}, ind = 0;

	for ( let x in this ) {
		if ( func.call( this, this[x], x, ind++ ) ) {
			ret[x] = this[x];
		}
	}

	return ret;
} } );
Object.defineProperty( Object.prototype, 'sSome', { enumerable:false, configurable:false, writable:false, value:function( func ) {
	let ind = 0, res = null;

	for ( let x in this ) {
		res = func.call( this, this[x], x, ind++ );

		if ( res ) return res;
	}
} } );
Object.defineProperty( Object.prototype, 'sForEach', { enumerable:false, configurable:false, writable:false, value:function( func ) {
	let ind = 0;

	for ( let x in this )
		func.call( this, this[x], x, ind++ );
} } );

Object.defineProperty( HTMLElement.prototype, 'childs', {
	enumerable: true,
	get: function() {
		let res = [], tip;

		for ( let x = this.childNodes.length; x--; ) {
			tip = Typeof( this.childNodes[x] );

			if (
				tip[tip.length - 7]==='e' &&
				tip[tip.length - 6]==='l' &&
				tip[tip.length - 5]==='e' &&
				tip[tip.length - 4]==='m' &&
				tip[tip.length - 3]==='e' &&
				tip[tip.length - 2]==='n' &&
				tip[tip.length - 1]==='t'
			) res.splice( 0, 0, this.childNodes[x] );
		}

		return res;
	},
} );