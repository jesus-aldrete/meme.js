

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


/*/ ***** Get's POSTGRES ***** /*/
function GetPostgres( work_space, reference ) {
	return {
		Getter  : ( data )=>global.cirromatic.Trigger( 'CirroMatic/postgres/getter'  , work_space, reference.name, ParseObject( data ) ),
		Insert  : ( data )=>global.cirromatic.Trigger( 'CirroMatic/postgres/insert'  , work_space, reference.name, ParseObject( data ) ),
		Update  : ( data )=>global.cirromatic.Trigger( 'CirroMatic/postgres/update'  , work_space, reference.name, ParseObject( data ) ),
		Delete  : ( data )=>global.cirromatic.Trigger( 'CirroMatic/postgres/delete'  , work_space, reference.name, ParseObject( data ) ),
		Beging  : ( data )=>global.cirromatic.Trigger( 'CirroMatic/postgres/beging'  , work_space, reference.name, ParseObject( data ) ),
		Commit  : ( data )=>global.cirromatic.Trigger( 'CirroMatic/postgres/commit'  , work_space, reference.name, ParseObject( data ) ),
		Rollback: ( data )=>global.cirromatic.Trigger( 'CirroMatic/postgres/rollback', work_space, reference.name, ParseObject( data ) ),
		Sql     : ( data )=>global.cirromatic.Trigger( 'CirroMatic/postgres/sql'     , work_space, reference.name, ParseObject( data ) ),
	};
}
// ###################################################################################################


/*/ ***** Get's MONGO ***** /*/
function GetMongo( work_space, reference ) {
	return {
		Getter: ( data )=>global.cirromatic.Trigger( 'CirroMatic/mongo/getter', work_space, reference.name, ParseObject( data ) ),
		Insert: ( data )=>global.cirromatic.Trigger( 'CirroMatic/mongo/insert', work_space, reference.name, ParseObject( data ) ),
		Update: ( data )=>global.cirromatic.Trigger( 'CirroMatic/mongo/update', work_space, reference.name, ParseObject( data ) ),
		Delete: ( data )=>global.cirromatic.Trigger( 'CirroMatic/mongo/delete', work_space, reference.name, ParseObject( data ) ),
	};
}
// ###################################################################################################


/*/ ***** Get's ***** /*/
function GetDB( work_space, reference ) {
	switch ( reference.engine ) {
		case 'mongo'   : return GetMongo   ( work_space, reference );
		case 'postgres': return GetPostgres( work_space, reference );
	}

	console.Error( new meme_error( 'bad case', `motor no considerado, "${reference.engine}"` ) );

	return {};
}
// ###################################################################################################


/*/ ***** Exportaciones ***** /*/
module.exports = function( work_space, parent, reference ) {
	let res = null;

	switch ( parent.type ) {
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
						Getter  : ( data )=>global.cirromatic.Trigger( 'CirroMatic/postgres/getter'  , work_space, reference.name, ParseObject( data ) ),
						Insert  : ( data )=>global.cirromatic.Trigger( 'CirroMatic/postgres/insert'  , work_space, reference.name, ParseObject( data ) ),
						Update  : ( data )=>global.cirromatic.Trigger( 'CirroMatic/postgres/update'  , work_space, reference.name, ParseObject( data ) ),
						Delete  : ( data )=>global.cirromatic.Trigger( 'CirroMatic/postgres/delete'  , work_space, reference.name, ParseObject( data ) ),
						Beging  : ( data )=>global.cirromatic.Trigger( 'CirroMatic/postgres/beging'  , work_space, reference.name, ParseObject( data ) ),
						Commit  : ( data )=>global.cirromatic.Trigger( 'CirroMatic/postgres/commit'  , work_space, reference.name, ParseObject( data ) ),
						Rollback: ( data )=>global.cirromatic.Trigger( 'CirroMatic/postgres/rollback', work_space, reference.name, ParseObject( data ) ),
						Sql     : ( data )=>global.cirromatic.Trigger( 'CirroMatic/postgres/sql'     , work_space, reference.name, ParseObject( data ) ),
					};
				break;

				default: res = new meme_error( 'bad case', `engine no considerado, "${parent.engine}"` );
			}
		break;

		default: res = new meme_error( 'bad case', `servicio no considerado, "${parent.type}"` );
	}

	return res;
}
// ###################################################################################################