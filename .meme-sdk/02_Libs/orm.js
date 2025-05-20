

/*/ ***** Funciones ***** /*/
function ParseObject( obj ) {
	const transform = ( value ) => {
		if      ( value instanceof RegExp                 ) return { $regex:value.source, $options:value.flags };
		else if ( Array.isArray( value )                  ) return value.map( transform );
		else if ( value!==null && typeof value==='object' ) {
			return Object.fromEntries(
				Object.entries( value ).map( ( [key, val] ) => [key, transform( val )] )
			);
		}

		return value;
	};

	return transform( obj );
}
// ###################################################################################################


/*/ ***** Metodos ***** /*/
async function Exec( work_space, reference, data, joins ) {
	data.$joins = joins;

	return await global.cirromatic.Trigger( 'CirroMatic/postgres/exec', work_space, reference.name, ParseObject( data ) );
}

function LeftOuterJoin( work_space, reference, table, data, joins ) {
	let obj;
	joins??= [];

	joins.push(obj={
		side : 'left',
		type : 'outer',
		left : { reference                , table:reference.name },
		right: { reference:table.reference, table:table.reference.name },
	});

	for ( const key in data ) {
		const lfield    = reference.childs.find( v => v.alias===key || v.name===key );
		const rfield    = table.reference.childs.find( v => v.alias===data[key] || v.name===data[key] );
		obj.left .field = lfield?.name;
		obj.right.field = rfield?.name;
	}

	return {
		Exec         : (        data )=>Exec         ( work_space, reference,        data, joins ),
		LeftOuterJoin: ( table, data )=>LeftOuterJoin( work_space, reference, table, data, joins ),
	};
}
// ###################################################################################################


/*/ ***** Exportaciones ***** /*/
module.exports = function( work_space, parent, reference ) {
	let res = null;

	switch ( parent.tag ) {
		case 'database':
			switch ( parent.engine ) {
				case 'mongo':
					return {
						Getter: ( data )=>global.cirromatic.Trigger( 'CirroMatic/mongo/getter', work_space, reference.name, ParseObject( data ) ),
						Insert: ( data )=>global.cirromatic.Trigger( 'CirroMatic/mongo/insert', work_space, reference.name, ParseObject( data ) ),
						Update: ( data )=>global.cirromatic.Trigger( 'CirroMatic/mongo/update', work_space, reference.name, ParseObject( data ) ),
						Delete: ( data )=>global.cirromatic.Trigger( 'CirroMatic/mongo/delete', work_space, reference.name, ParseObject( data ) ),
					};

				case 'postgres':
					return {
						reference    ,
						Getter       : ( data          )=>global.cirromatic.Trigger( 'CirroMatic/postgres/getter'  , work_space, reference.name, ParseObject( data          ) ),
						Insert       : ( data          )=>global.cirromatic.Trigger( 'CirroMatic/postgres/insert'  , work_space, reference.name, ParseObject( data          ) ),
						Update       : ( data          )=>global.cirromatic.Trigger( 'CirroMatic/postgres/update'  , work_space, reference.name, ParseObject( data          ) ),
						Delete       : ( data          )=>global.cirromatic.Trigger( 'CirroMatic/postgres/delete'  , work_space, reference.name, ParseObject( data          ) ),
						Beging       : ( data          )=>global.cirromatic.Trigger( 'CirroMatic/postgres/beging'  , work_space, reference.name, ParseObject( data          ) ),
						Commit       : ( data          )=>global.cirromatic.Trigger( 'CirroMatic/postgres/commit'  , work_space, reference.name, ParseObject( data          ) ),
						Rollback     : ( data          )=>global.cirromatic.Trigger( 'CirroMatic/postgres/rollback', work_space, reference.name, ParseObject( data          ) ),
						Sql          : ( sql  , params )=>global.cirromatic.Trigger( 'CirroMatic/postgres/sql'     , work_space, reference.name, ParseObject({ sql, params }) ),
						LeftOuterJoin: ( table, fields )=>LeftOuterJoin( work_space, reference, table, fields ),
					};

				default: res = new meme_error( 'bad case', `engine no considerado, "${parent.engine}"` );
			}
		break;

		default:
			switch ( reference.tag ) {
				case 'crypto':
					return {
						Create : ( user, pass        ) => global.cirromatic.Trigger( 'CirroMatic/crypto/create' , work_space, reference, user, pass        ),
						Compare: ( user, pass, value ) => global.cirromatic.Trigger( 'CirroMatic/crypto/compare', work_space, reference, user, pass, value ),
					};

				case 'database':
					return {
						Get: ( key        )=>global.cirromatic.Trigger( 'CirroMatic/redis/getter', work_space, key                       ),
						Set: ( key, value )=>global.cirromatic.Trigger( 'CirroMatic/redis/setter', work_space, key, ParseObject( value ) ),
					};

				case 'openia':
					return {
						Chat: ( data )=>global.cirromatic.Trigger( 'CirroMatic/openia/chat', work_space, reference, data ),
					};
				break;
			}

			res = new meme_error( 'bad case', `servicio no considerado, "${parent.tag}"` );
	}

	if ( res.error ) {
		console.Error( res.cmd() );
	}

	return res;
}
// ###################################################################################################