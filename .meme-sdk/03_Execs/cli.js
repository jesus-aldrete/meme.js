#! /usr/bin/env node
process.title    = 'meme.js CLI';
const work_space = __dirname.match( /03_Execs/ ) ? '..' : './.meme-sdk';
// ####################################################################################################


//                    Copyright meme.js Authors
//     Distributed under the Boost Software License, Version 1.1.
// (See accompanying file LICENSE or copy at https://mjs.red/LICENSE)


/* Importaciones */
const fs                = require( 'node:fs'                       );
const readline          = require( 'node:readline'                 );
const child_process     = require( 'node:child_process'            );
const { ConnectClient } = require( `${work_space}/02_Libs/courier` );

const {
	Hash,
	Sleep,
	Typeof,
	ParsePath,
} = require( `${work_space}/02_Libs/lib` );

const {
	Cmd,
	MesageProc,
	ConfigureTitle,
} = require( `${work_space}/02_Libs/log` );

const {
	LoadConfig,
	GetVersionPackage,
	constants:{ meme_space:PATH_MEME },
} = require( `${work_space}/02_Libs/config` );
// ####################################################################################################


/* Declaraciones */
let   PATH_LOG     = ParsePath( PATH_MEME.path, '.log'                  );
const PATH_DRIVER  = ParsePath( PATH_MEME.path, '03_Execs', 'driver.js' );
const DIRS         = [];
const EXECS        = [];
const COMMANDS     = [];
const ENVIRONMENTS = [];
// ####################################################################################################


/* Funciones */
function Spinner( title, spinners ) {
	/* Declaraciones */
	let timer    = 0;
	let termine  = false;
	let position = -1;

	/* Eventos */
	function onInterval() {
		let spin = '';
		position = ++position % 8;

		for ( const spinner of Object.values( spinners ) ) {
			if ( spin ) spin+= ', ';

			switch ( spinner.state ) {
				case 'step_all': spin+= 'fg[● '    + spinner.title          +']';                 break;
				case 'step_one': spin+= 'fm['      + spinner.spin[position] +'] '+ spinner.title; break;
				case 'error'   : spin+= 'fr[◎] cd['+ spinner.title          +']';                 break;
				case 'disabled': spin+= 'cd[f0[● ' + spinner.title          +']]';                break;
				default        : spin+= 'fy['      + spinner.spin[position] +'] '+ spinner.title; break;
			}
		}

		process.stdout.moveCursor     ( 0, 0                      );
		process.stdout.cursorTo       ( 0                         );
		process.stdout.clearScreenDown(                           );
		process.stdout.write          ( Cmd( title + spin + ' ' ) );

		if ( !termine ) {
			timer = setTimeout( onInterval, 80 );
		}
	}

	/* Funciones */
	function Error   ( spinner ) { spinners[spinner].state = 'error'    }
	function Disabled( spinner ) { spinners[spinner].state = 'disabled' }
	function StepAll ( spinner ) { spinners[spinner].state = 'step_all' }
	function StepOne ( spinner ) { spinners[spinner].state = 'step_one' }

	function Terminate() {
		termine = true;

		clearInterval( timer );
		onInterval   (       );
	}

	/* Inicio */
	function Inicio() {
		for ( const obj of Object.values( spinners ) ) {
			obj.spin = '◐◓◑◒◐◓◑◒';
		}

		console.info();
		onInterval();

		return { StepOne, StepAll, Error, Disabled, Terminate };
	};return Inicio();
}

async function Driver( port ) {
	/* Declaraciones */
	let step = 0;

	/* Inicio */
	async function Inicio() {
		try {
			return await ConnectClient(
				{
					port,
					onEnd: ()=>process.exit( 1 ),
				}
			);
		}
		catch ( error ) {
			if ( ++step>=10 ) {
				console.Error( 'Error en la conexion:' );
				console.trace();

				return null;
			}
			else {
				if ( PATH_LOG.type===null ) {
					PATH_LOG.Write( '' );

					PATH_LOG = ParsePath( PATH_LOG.path );
				}

				const log        = fs           .openSync( PATH_LOG.path, 'a' );
				const subprocess = child_process.spawn( 'node', [PATH_DRIVER.path, `-driver_port=${port}`], { detached:true, stdio:['ignore', log, log] } );

				subprocess.unref();

				await Sleep( 200 );

				return await Inicio( port );
			}
		}
	};return await Inicio();
}
// ####################################################################################################


/* Comandos */
function Help() {
	switch ( EXECS[1] ) {
		case 'version':
			console.Cmd(
				'\n' +
				'fy[ Comando cv[ version ] fy[[alias: -v\\]] ]\n' +
				'fy[-------------------------------]\n'+
				'Este comando nos muestra la versión del paquete fb[meme-sdk] con el que nos\n' +
				'encontramos trabajando.\n' +
				'\n' +
				'cd[Nota:] para conocer más sobre este comando, visita: fg[https://mjs.red]\n' +
				''
			);
		break;
		case 'log'    :
			console.Cmd(
				'\n' +
				'fy[ Comando cv[ log ] fy[[alias: -l\\]] ]\n' +
				'fy[--------------------------]\n' +
				'Este comando muestra el log de todos los proyectos que se han levantado\n' +
				'con meme.js, el comando queda a la espera, para pintar cada evento que\n' +
				'ocurra.\n' +
				'\n' +
				'Por performance, este sub-comando solo muestra las ultimas 300 lineas de\n' +
				'todo el log.\n' +
				'\n' +
				'fb[sub-comandos:]\n' +
				'\n' +
				'    fm[-all]: Cómo el sub-comando fg[log] solo nos muestra las ultimas 300\n' +
				'          lineas del log, con este otro sub-comando le indicamos\n' +
				'          al cli que queremos ver todas las lineas que se encuentran en\n' +
				'          el log.\n' +
				'          cd[Ejemplo:] fg[me] fy[log] fm[-all]\n' +
				'\n' +
				'    fm[-clear]: Este comando le indica al cli qué queremos borrar el log que\n' +
				'            se a guardado hasta este momento.\n' +
				'            cd[Ejemplo:] fg[me] fy[log] fm[-clear]\n' +
				'\n' +
				'cd[Nota:] para conocer más sobre este comando, visita: fg[https://mjs.red]\n' +
				''
			);
		break;
		case 'ls'     :
			console.Cmd(
				'\n' +
				'fy[ Comando cv[ ls ] ]\n' +
				'fy[--------------]\n' +
				'Este comando muestra una lista de los proyectos que meme.js se encuentra\n' +
				'ejecutando.\n' +
				''
			);
		break;

		case 'init'    :
			console.Cmd(
				'\n' +
				'fy[ Comando cv[ init ] fy[[alias: -i\\]] ]\n' +
				'fy[----------------------------]\n' +
				'Este comando inicializa un nuevo proyecto de meme.js, según la plantilla\n' +
				'que hayamos elegido.\n' +
				'\n' +
				'fb[sub-comandos:]\n' +
				'\n' +
				'    fm[-y]: Este sub-comando le indica al cli qué no queremos responder ning-\n' +
				'        una pregunta al inicializar el proyecto, y por ende todos los va-\n' +
				'        lores de la inicialización, serán los valores por defecto.\n' +
				'\n' +
				'    fm[-install]: Este sub-comando le indica al cli qué necesitamos iniciali-\n' +
				'              zar un proyecto npm e instalar el paquete de meme-sdk de\n' +
				'              forma local (la instalación de dependencias se realiza de\n' +
				'              forma automática).\n' +
				'\n' +
				'cd[Nota:] para conocer más sobre este comando, visita: fg[https://mjs.red]\n' +
				''
			);
		break;
		case 'start'   :
			console.Cmd(
				'\n' +
				'fy[ Comando cv[ start ] fy[[alias: -s\\]] ]\n' +
				'fy[-----------------------------]\n' +
				'Este comando inicia la compilación de todos los archivos fuente ademas de\n' +
				'levantar los procesos que meme.js requiere para funcionar.\n' +
				'\n' +
				'Si este comando es ejecutado en carpetas que no contengan un archivo "me-\n' +
				'me.conf" en la raíz. meme.js se ejecutara sin problema, sin embargo, por\n' +
				'seguridad, el compilador solo leerá el nivel en el que se esta ejecutando\n' +
				'el comando, los sub-directorios y archivos en estos sub-directorios serán\n' +
				'ignorados.\n' +
				'\n' +
				'Si la carpeta en donde se ejecuta este comando, sí contiene un archivo\n' +
				'"meme.conf", en la raíz. meme.js leerá todos los sub-directorios y archi-\n' +
				'vos en estos, según las especificaciones de la configuración.\n' +
				'\n' +
				'fb[sub-comandos:]\n' +
				'\n' +
				'    fm[-open]: Este sub-comando le indica al cli, que una ves que se han com-\n' +
				'           pilado todos los fuentes y se han levantado los servicios nec-\n' +
				'           esarios, se abrirá una pestaña con la dirección de nuestro pr-\n' +
				'           oyecto, en nuestro navegador predeterminado.\n' +
				'\n' +
				'    fm[-no-demon]: Este sub-comando nos permite levantar el coordinador de\n' +
				'               meme.js de modo que bloque la terminal, para efectos de\n' +
				'               que meme.js corra en un pod.\n' +
				'\n' +
				'    fm[-one-server]: Este sub-comando nos permite levantar todos los servici-\n' +
				'                 os de nuestro proyecto en una solo url indicada en la\n' +
				'                 configuración, útil si queremos crear el proyecto como\n' +
				'                 un monolito.\n' +
				'\n' +
				'    fm[-e]: Este sub-comando nos permite ingresar los entornos que queremos\n' +
				'        ejecutar en el compilador. Todo lo que se ingrese después de este\n' +
				'        sub-comando, será considerado un entorno (exista o no). Puedes\n' +
				'        ingresar múltiples entornos separados por un espacio y el compil-\n' +
				'        ador ejecutara todos en el orden ingresado.\n' +
				'\n' +
				'cd[Nota:] para conocer más sobre este comando, visita: fg[https://mjs.red]\n' +
				''
			);
		break;
		case 'commands':
			console.Cmd(
				'\n' +
				'fy[ Comando cv[ commands ] fy[[alias: -c\\]] ]\n' +
				'fy[-------------------------------]\n'+
				'Cuando se utiliza sin ningún sub-comando adicional, muestra una lista de\n' +
				'sub-comandos disponibles que pueden ser ejecutados.\n' +
				'\n' +
				'Por otro lado, si se le proporciona un sub-comando específico precedido\n' +
				'por "fy[-c]", el comando indicado se ejecutará.\n' +
				'\n' +
				'cd[Ejemplo:] fg[me] fy[-c] fm[<command>]\n' +
				'\n' +
				'cd[Nota:] para conocer más sobre este comando, visita: fg[https://mjs.red]\n' +
				''
			);
		break;
		case 'build'   :
			console.Cmd(
				'\n' +
				'fy[ Comando cv[ build ] fy[[alias: -b\\]] ]\n' +
				'fy[-----------------------------]\n' +
				'Este comando compila y construye todos los archivos de tipo meme-html,\n' +
				'meme-css y meme-js. Adicionalmente, resuelve dependencias y coloca todos\n' +
				'los archivos necesarios en la carpeta de construcción, que se halla eleg-\n' +
				'ido para este fin.\n' +
				'\n' +
				'Todo esto con los parámetros establecidos en la configuración y el entor-\n' +
				'no elegido.\n' +
				'\n' +
				'fb[sub-comandos:]\n' +
				'\n' +
				'    fm[-e]: Este sub-comando nos permite ingresar los entornos que queremos\n' +
				'        ejecutar en el compilador. Todo lo que se ingrese después de este\n' +
				'        sub-comando, será considerado un entorno (exista o no). Puedes\n' +
				'        ingresar múltiples entornos separados por un espacio y el compil-\n' +
				'        ador ejecutara todos en el orden ingresado.\n' +
				'\n' +
				'cd[Nota:] para conocer más sobre este comando, visita: fg[https://mjs.red]\n' +
				''
			);
		break;
		case 'reset'   :
			console.Cmd(
				'\n' +
				'fy[ Comando cv[ reset ] fy[[alias: -r\\]] ]\n' +
				'fy[-----------------------------]\n'+
				'Cuando este comando es ejecutado sobre una carpeta de proyecto, se re-in-\n' +
				'icia la compilación y servicios del proyecto en cuestión.\n' +
				'\n' +
				'fb[sub-comandos:]\n' +
				'\n' +
				'    fm[-all]: Como el comando fg[reset], solo reinicia el proyecto actual, añadi-\n' +
				'          endo este otro sub-comando, se reiniciarán todos los proceso y\n' +
				'          proyectos que meme.js halla ejecutado.\n' +
				'\n' +
				'cd[Nota:] para conocer más sobre este comando, visita: fg[https://mjs.red]\n' +
				''
			);
		break;
		case 'stop'    :
			console.Cmd(
				'\n' +
				'fy[ Comando cv[ stop ] ]\n' +
				'fy[----------------]\n' +
				'meme.js es una plataforma que se levanta con procesos independientes y\n' +
				'modulares, por lo que cada proyecto se mantiene arriba hasta que le indi-\n' +
				'quemos que queremos detener el proyecto.\n' +
				'\n' +
				'Este comando detiene todos los procesos que levanta meme.js, ya sea de un\n' +
				'solo proyecto o de todos los proyectos que actualmente se encuentran eje-\n' +
				'cutándose.\n' +
				'\n' +
				'fb[sub-comandos:]\n' +
				'\n' +
				'    fm[-all]: Como el comando fg[stop], solo detiene el proyecto actual, añadien-\n' +
				'          do este otro sub-comando, se detendrán todos los proceso y pro-\n' +
				'          yectos que meme.js halla ejecutado.\n' +
				'\n' +
				'cd[Nota:] para conocer más sobre este comando, visita: fg[https://mjs.red]\n' +
				''
			);
		break;

		default:
			console.Cmd(
				'\n' +
				'fy[ Uso del CLI ]\n' +
				'fy[-------------]\n' +
				'Para poder ejecutar todas las funciones de meme.js, se utiliza el comando\n' +
				'fg[me], seguido de un sub-comando.\n' +
				'\n' +
				'    fb[Sub-comandos generales:]\n' +
				'    fy[cb[help    cd[-h]]]: Ayuda con un comando específico de meme.js\n' +
				'    fy[cb[version cd[-v]]]: Muestra la versión de meme.js\n' +
				'    fy[cb[log     cd[-l]]]: Muestra los logs generados\n' +
				'    fy[cb[ls]]        : Lista los proyectos operativos\n' +
				'\n' +
				'    fb[Sub-comandos de proyecto:]\n' +
				'    fy[cb[init     cd[-i]]]: Genera un proyecto según el tipo que se elija\n' +
				'    fy[cb[start    cd[-s]]]: Inicia los servicios referentes al proyecto meme.js\n' +
				'    fy[cb[commands cd[-c]]]: Muestra o ejecuta los comandos disponibles\n' +
				'    fy[cb[build    cd[-b]]]: Construye el proyecto meme.js\n' +
				'    fy[cb[reset    cd[-r]]]: Detiene y reinicia el servicio de meme.js\n' +
				'    fy[cb[stop]]       : Detiene el servicio de meme.js\n' +
				'\n' +
				'    cd[Nota:] para conocer más sobre meme.js, visita: fg[https://mjs.red]\n' +
				''
			);
	}
}
function Version() {
	console.Cmd(
		'\n' +
		'fy[ meme.js - version ]\n' +
		'fy[-------------------]\n' +
		GetVersionPackage() +
		'\n'
	);
}
function Log() {
	/* Funciones */
	function Log() {
		if ( PATH_LOG.type!=='file' ) {
			PATH_LOG.Write( '' );

			PATH_LOG = ParsePath( PATH_LOG.path );
		}

		console.Cmd( 'El archivo de log, fue cargado correctamente: fg[✔]' );

		let
		timer,
		lines = PATH_LOG.Read().split( '\n' ),
		len   = lines.length;

		if ( lines.length>50 && !EXECS.includes( '-all' ) ) lines = lines.slice( lines.length - 50 );
		if ( lines[lines.length - 1]===''                 ) lines.pop();
		if ( lines.length                                 ) console.info( lines.join( '\n' ) );

		PATH_LOG.Watch({
			call:() => {
				clearTimeout( timer );

				timer = setTimeout( () => {
					let save, lines_2 = save = PATH_LOG.Read().split( '\n' );

					lines_2 = lines_2.slice( len ? ( len - 1 ) : 0 );

					if ( lines_2[lines_2.length - 1]==='' ) lines_2.pop();

					if ( lines_2.length )
						console.info( lines_2.join( '\n' ) );

					lines = save;
					len   = lines.length;
				}, 100 );
			},
		});
	}
	function Clear() {
		if ( PATH_LOG.type==='file' )
			PATH_LOG.Delete();

		console.Cmd( 'El archivo de log, fue eliminado correctamente: fg[✔]' );
		console.info();
	}
	// **************************************************

	/* Inicio */
	function Inicio() {
		if ( EXECS.includes( '-clear' ) ) Clear();
		else                              Log  ();
	};return Inicio();
	// **************************************************
}

function Init() {
	/* Declaraciones */
	let stream;
	// **************************************************

	/* GET */
	function GetAuthor() {
		try {
			return (
				child_process.execSync( 'git config --get user.name'  ).toString().trim() + ' <' +
				child_process.execSync( 'git config --get user.email' ).toString().trim() + '>'
			);
		}
		catch ( e ) {
			console.Error( e )

			return '';
		}
	}
	function GetPrompt( message, rdef ) {
		return new Promise( run => {
			stream          ??= readline.createInterface( { input:process.stdin, output:process.stdout } );
			let   ca1         = `fy[?]${ message }`, ca2 = `cd[(${ rdef })] `;
			const on_keypress = ( _, key ) => {
				switch ( key.name ) {
					case 'c':
						if ( key.ctrl ) {
							readline.moveCursor     ( stream.output, -Cmd( ca1 + ca2, false ).length, 0 );
							readline.clearScreenDown( stream.output                                     );
							console.Cmd             ( `cd[fr[✖]${message}(${rdef})]`                    );
							process.stdout.write    ( '\x1B[?25h'                                       );
							process.exit            (                                                   );
						}
					break;
				}
			};

			stream.input.on( 'keypress', on_keypress );
			stream.question( Cmd( ca1 + ca2 ), answer => {
				process.stdout.moveCursor( 0, -1 - parseInt( Cmd( ca1 + ca2, false ).length / process.stdout.columns ) );
				process.stdout.cursorTo( 0 );
				process.stdout.clearScreenDown();
				stream.input.off( 'keypress', on_keypress );

				answer==='' && ( answer = rdef );

				console.Cmd( `fg[✔]${message} fc[${answer}]` );
				run( answer );
			});
		});
	}
	function GetSelect( message, options ) {
		return new Promise( run => {
			stream??= readline.createInterface({ input:process.stdin, output:process.stdout });
			let selected_index = 0;
			const print_options = () => {
				console.Cmd( `fy[?]${message}cd[(${options[selected_index]})]` );

				options.forEach( ( option, index ) => console.Cmd( index===selected_index ? `  fm[>] cu[fb[${option}]]` : `    ${option}` ) );
				process.stdout.write('\x1B[?25l');
			};
			const on_keypress = ( _, key ) => {
				switch ( key.name ) {
					case 'down'  : selected_index++; break;
					case 'up'    : selected_index--; break;

					case 'return':
						readline.moveCursor     ( stream.output, 0, -options.length - 2            );
						readline.clearScreenDown( stream.output                                    );
						console.Cmd             ( `fg[✔]${message} fc[${options[selected_index]}]` );
						process.stdout.write    ( '\x1B[?25h'                                      );
						stream.input.off        ( 'keypress', on_keypress                          );
						run                     ( options[selected_index]                          );
					return;

					case 'c':
						if ( key.ctrl ) {
							readline.moveCursor     ( stream.output, 0, -options.length - 1             );
							readline.clearScreenDown( stream.output                                     );
							console.Cmd             ( `cd[fr[✖]${message}(${options[selected_index]})]` );
							process.stdout.write    ( '\x1B[?25h'                                       );
							process.exit            (                                                   );
						}
					break;
				}

				if      ( selected_index>=options.length ) selected_index = 0;
				else if ( selected_index< 0              ) selected_index = options.length - 1;

				readline.moveCursor     ( stream.output, 0, -options.length - 1 );
				readline.clearScreenDown( stream.output                         );
				print_options           (                                       );
			};

			print_options();

			stream.input.on( 'keypress', on_keypress );
		});
	}

	async function GetData( odir ) {
		const res = {
			name       : 'mi_proyecto',
			type       : ['spa','landing'],
			description: 'proyecto meme.js',
			version    : '0.0.1',
			author     : GetAuthor(),
		};

		if ( EXECS.includes( '-y' ) ) {
			res.type = res.type[0];

			return res;
		}

		console.info();

		res.name        = await GetPrompt( ' Nombre: '          , res.name        );
		res.type        = await GetSelect( ' Tipo de Proyecto: ', res.type        );
		res.description = await GetPrompt( ' Descripción: '     , res.description );
		res.version     = await GetPrompt( ' Versión: '         , res.version     );
		res.author      = await GetPrompt( ' Autor: '           , res.author      );

		return res;
	}
	// **************************************************

	/* SET */
	function SetLauncher( data, odir ) {
		const olaunchers = ParsePath( __dirname, __dirname.match( /\.meme-sdk/ ) ? '../..' : '.', '.vscode', 'launch.json' );

		if ( olaunchers.type!=='file' ) return;

		let jso;

		try {
			eval( 'jso = ' + olaunchers.Read() );

			if ( Typeof( jso )!=='object' ) return;
		}
		catch {
			return;
		}

		const order_group = jso.configurations?.reduce( ( r, v ) => {
			if ( v.presentation?.group==='projects' ) {
				if ( v.presentation.order>r ) return v.presentation.order;
			}

			return r;
		}, 0 );

		jso.configurations.push({
			name                  : data.name,
			presentation          : { group:"projects", order:order_group + 1 },
			console               : "integratedTerminal",
			internalConsoleOptions: "neverOpen",
			request               : "launch",
			restart               : true,
			type                  : "node",
			cwd                   : `\${workspaceFolder}/${data.name}`,
			runtimeExecutable     : "${workspaceFolder}/.meme-sdk/03_Execs/watcher.js",
			args                  : [
				"-x", `\${workspaceFolder}/.meme-sdk/03_Execs/cli.js -s -d \${workspaceFolder}/${data.name} -no-demon`,
				"-w", `\${workspaceFolder}/${data.name}`,
				"-i", '[\"resources|build\", \"gmi\"]',
				"-f", '[\"\\\\.(js|json)$\", \"gmi\"]',
			],
		});

		olaunchers.Write( JSON.stringify( jso, 0, '\t' ) );
	}
	// **************************************************

	/* Funciones */
	async function CopyProto( onew_dir ) {
		const oconfig    = ParsePath ( DIRS[0] || '.', 'meme.conf' );
		const config     = await LoadConfig( oconfig.path  , ENVIRONMENTS );
		const data       = await GetData( onew_dir );
		onew_dir         = ParsePath( onew_dir.path, data.name );
		const ogeneral   = ParsePath( __dirname, work_space, '05_Templates', 'default' );
		const ospecific  = ParsePath( __dirname, work_space, '05_Templates', data.type );
		const oworkspace = ParsePath( config.templates?.path || 'null0' );
		const call       = ( odir, ofile ) => {
			const replace_path = ofile.path.replace( odir.path, onew_dir.path );

			switch ( ofile.base ) {
				case 'meme.conf':
				case 'package.json':
					ParsePath( replace_path ).Write(
						ofile.Read()
						.replace( /\[\[NAME\]\]/gm       , data.name        )
						.replace( /\[\[TYPE\]\]/gm       , data.type        )
						.replace( /\[\[AUTHOR\]\]/gm     , data.author      )
						.replace( /\[\[VERSION\]\]/gm    , data.version     )
						.replace( /\[\[DESCRIPTION\]\]/gm, data.description )
					);
				break;

				default: ParsePath( replace_path ).Write( ofile.Read( false ) );
			}
		};

		ogeneral .Travel({ call:( ofile )=>call( ogeneral  , ofile ), ignore:[/\.(ds_store|ini)$/i] });
		ospecific.Travel({ call:( ofile )=>call( ospecific , ofile ), ignore:[/\.(ds_store|ini)$/i] });
		ospecific.Travel({ call:( ofile )=>call( oworkspace, ofile ), ignore:[/\.(ds_store|ini)$/i] });

		SetLauncher( data, onew_dir );

		return data;
	}
	// **************************************************

	/* Inicio */
	async function Inicio() {
		const odir = ParsePath( DIRS[0] || '.' );

		if ( odir.type==='folder' ) {
			const data = await CopyProto( odir );

			if ( EXECS.includes( '-install' ) ) {
				child_process.spawnSync( 'npm', ['install'], { stdio:'inherit', cwd:odir.path + '/' + data.name } );
			}
			else {
				const pac = ParsePath( odir.path, data.name, 'package.json' );

				if ( pac.type==='file' ) {
					pac.Delete();
				}
			}

			console.Cmd(
				'\n' +
				'fy[ meme.js se inicializo correctamente ]\n' +
				'fy[-------------------------------------]\n' +
				`fy[*] Para arrancar el proyecto solo entra en: fm[cd] fy[${ data.name }]\n` +
				'fy[*] Para arrancar el proyecto solo escribe: fm[me] fy[start]\n' +
				'fy[*] Puedes leer más sobre meme.js en fg[https://mjs.red]\n'
			);

			process.exit( 0 );
		}
		else {
			console.info();
			console.Error( `fr[*] fm[init] solo puede recibir como parámetro un directorio valido o en su defecto ser ejecutado en un directorio de trabajo\n` );
		}
	};return       Inicio();
	// **************************************************
}
function Start() {
	/* Declaraciones */
	let   host   ;
	let   port   ;
	let   driver ;
	let   spinner;
	const id     = Hash();

	/* Eventos */
	function onError   ({ id:pid, type          }) { id===pid && spinner.Error   ( type ) }
	function onConnect ({ id:pid, type          }) { id===pid && spinner.StepOne ( type ) }
	function onLoad    ({ id:pid, type          }) { id===pid && spinner.StepAll ( type ) }
	function onDisabled({ id:pid, type          }) { id===pid && spinner.Disabled( type ) }
	function onEnd     ({ id:pid, app, api, res }) {
		if ( id!==pid ) return;

		spinner[!res.start ? 'Disabled' : ( res.is_error ? 'Error' : 'StepAll' )]( 'res' );
		spinner[!app.start ? 'Disabled' : ( app.is_error ? 'Error' : 'StepAll' )]( 'app' );
		spinner[!api.start ? 'Disabled' : ( api.is_error ? 'Error' : 'StepAll' )]( 'api' );

		spinner.Terminate();
		console.info();
		console.Cmd(
			'\ncv[fg[Servidores:]]' +
			MesageProc({ ...app, name:'app' }) +
			MesageProc({ ...api, name:'api' }) +
			MesageProc({ ...res, name:'res' })
		);
		console.info();
		setTimeout(() => { process.exit( 0 ) }, 100);
	}

	/* Inicio */
	async function Inicio() {
		ENVIRONMENTS.unshift( 'start' );

		const oconfig = ParsePath( DIRS[0], 'meme.conf' );
		const config  = await LoadConfig( oconfig.path, ENVIRONMENTS );
		host          = config.driver.host;
		port          = config.driver.port;

		if ( oconfig.type!=='file' ) {
			console.Cmd(
				'\n' +
				'fy[ Cuidado ]\n' +
				'fy[---------]\n' +
				'Si no existe un archivo fy["meme.conf"], por seguridad fm[meme.js] solo leerá el primer nivel del directorio.'
			);
		}

		console.info();

		if ( EXECS.includes( '-no-demon' ) || EXECS.includes( '-one-server' ) ) {
			require( './driver.js' )({
				id          ,
				host        ,
				port        ,
				path        : oconfig.path,
				execs       : EXECS,
				commands    : COMMANDS,
				environments: ENVIRONMENTS,
			});
		}
		else {
			spinner = Spinner( 'Iniciando: ', { app:{ title:'app' }, api:{ title:'api' }, res:{ title:'res' } } );
			driver  = await Driver( port );

			if ( !driver ) return;

			await driver.Events({
				'project/error'            : onError   ,
				'project/disabled'         : onDisabled,
				'project/load/end'         : onLoad    ,
				'project/connect/end'      : onConnect ,
				'project/command/start/end': onEnd     ,
			});

			driver.Trigger(
				'project/command/start',
				{
					id          ,
					host        ,
					port        ,
					path        : oconfig.path,
					execs       : EXECS,
					commands    : COMMANDS,
					environments: ENVIRONMENTS,
				}
			);
		}
	};return Inicio();
}
function Stop() {
	/* Declaraciones */
	const id     = Hash();
	let   spinner;

	/* Eventos */
	async function onEnd({ id:pid }) {
		if ( id!==pid ) return;

		spinner.StepAll( 'all' );
		spinner.Terminate();

		await Sleep( 100 );
		console.info();
		console.info();
		setTimeout(() => { process.exit( 0 ) }, 100);
	}

	/* Inicio */
	async function Inicio() {
		ENVIRONMENTS.unshift( 'stop' );

		spinner       = Spinner( 'Deteniendo servicios: ', { all:{ title:'' } } );
		const oconfig = ParsePath( DIRS[0], 'meme.conf' );
		const config  = await LoadConfig( oconfig.path, ENVIRONMENTS );
		const port    = config.driver.port;
		const driver  = await Driver( port );

		if ( !driver ) return;

		driver.Events( 'project/command/stop/end', onEnd );

		driver.Trigger(
			'project/command/stop',
			{
				id          ,
				port        ,
				path        : oconfig.path,
				execs       : EXECS,
				commands    : COMMANDS,
				environments: ENVIRONMENTS,
			}
		);
	};return Inicio();
}
function Build() {
	/* Declaraciones */
	let   driver ;
	let   spinner;
	const id     = Hash();

	/* Eventos */
	function onError   ({ id:pid, type          }) { id===pid && spinner.Error   ( type ) }
	function onLoad    ({ id:pid, type          }) { id===pid && spinner.StepOne ( type ) }
	function onBuild   ({ id:pid, type          }) { id===pid && spinner.StepAll ( type ) }
	function onDisabled({ id:pid, type          }) { id===pid && spinner.Disabled( type ) }
	function onEnd     ({ id:pid, api, app, res }) {
		if ( id!==pid ) return;

		spinner.Terminate();
		console.info();

		if ( res.is_error || api.is_error || app.is_error ) console.Cmd( '\nbr[Error al construir el proyecto]' );
		else                                                console.Cmd( '\nbg[Proyecto construido]' );

		console.info();
		setTimeout(() => { process.exit( 0 ) }, 100);
	}

	/* Inicio */
	async function Inicio() {
		ENVIRONMENTS.unshift( 'build' );

		const oconfig = ParsePath( DIRS[0], 'meme.conf' );
		const config  = await LoadConfig( oconfig.path, ENVIRONMENTS );
		const port    = config.driver.port;

		if ( oconfig.type!=='file' ) {
			console.Cmd(
				'\n' +
				'fy[ Cuidado ]\n' +
				'fy[---------]\n' +
				'Si no existe un archivo fy["meme.conf"], por seguridad fm[meme.js] solo leerá el primer nivel del directorio.'
			);
		}

		console.info();

		spinner = Spinner( 'Construyendo: ', { app:{ title:'app' }, api:{ title:'api' }, res:{ title:'res' } } );
		driver  = await Driver( port );

		if ( !driver ) return;

		await driver.Events({
			'project/error'            : onError   ,
			'project/disabled'         : onDisabled,
			'project/load/end'         : onLoad    ,
			'project/build/end'        : onBuild   ,
			'project/command/build/end': onEnd     ,
		});

		driver.Trigger(
			'project/command/build',
			{
				id          ,
				port        ,
				path        : oconfig.path,
				execs       : EXECS,
				commands    : COMMANDS,
				environments: ENVIRONMENTS,
			}
		);
	};return Inicio();
}
function Reset() {
	/* Declaraciones */
	let   port   ;
	let   driver ;
	let   spinner;
	const id     = Hash();

	/* Eventos */
	function onError   ({ id:pid, type                    }) { id===pid && spinner.Error   ( type ) }
	function onConnect ({ id:pid, type                    }) { id===pid && spinner.StepOne ( type ) }
	function onLoad    ({ id:pid, type                    }) { id===pid && spinner.StepAll ( type ) }
	function onDisabled({ id:pid, type                    }) { id===pid && spinner.Disabled( type ) }
	function onEnd     ({ id:pid, api, app, res, is_error }) {
		if ( id!==pid ) return;

		spinner.Terminate();
		console.info();

		if ( is_error ) {
			console.Cmd( '\nbr[no fue posible re-iniciar el proyecto]' );
		}
		else {
			console.Cmd(
				'\ncv[fg[Servidores:]]' +
				MesageProc({ ...app, name:'app' }) +
				MesageProc({ ...api, name:'api' }) +
				MesageProc({ ...res, name:'res' })
			);
		}

		console.info();
		setTimeout(() => { process.exit( 0 ) }, 100);
	}

	/* Inicio */
	async function Inicio() {
		ENVIRONMENTS.unshift( 'reset' );

		const oconfig = ParsePath( DIRS[0], 'meme.conf' );
		const config  = await LoadConfig( oconfig.path, ENVIRONMENTS );
		port          = config.driver.port;

		if ( oconfig.type!=='file' ) {
			console.Cmd(
				'\n' +
				'fy[ Cuidado ]\n' +
				'fy[---------]\n' +
				'Si no existe un archivo fy["meme.conf"], por seguridad fm[meme.js] solo leerá el primer nivel del directorio.'
			);
		}

		console.info();

		spinner = Spinner( 'Reiniciando: ', { app:{ title:'app' }, api:{ title:'api' }, res:{ title:'res' } } );
		driver  = await Driver( port );

		if ( !driver ) return;

		await driver.Events({
			'project/error'            : onError   ,
			'project/disabled'         : onDisabled,
			'project/load/end'         : onLoad    ,
			'project/connect/end'      : onConnect ,
			'project/command/start/end': onEnd     ,
		});

		driver.Trigger(
			'project/command/reset',
			{
				id          ,
				port        ,
				path        : oconfig.path,
				execs       : EXECS,
				commands    : COMMANDS,
				environments: ENVIRONMENTS,
			}
		);
	};return Inicio();
}
function Ls() {
	/* Declaraciones */
	const id     = Hash();
	let   spinner;

	/* Eventos */
	async function onEnd({ id:pid, data }) {
		if ( id!==pid ) return;

		spinner.StepAll( 'all' );
		spinner.Terminate();

		console.info();

		if ( !data.length ) {
			console.Cmd(
				'\n' +
				'fy[ Lista de proyectos ]\n' +
				'fy[--------------------]\n' +
				'No hay proyectos ejecutándose\n'
			);

			setTimeout(() => { process.exit( 0 ) }, 100);
		}

		for ( const v of data ) {
			const { res, api, app, path, configs_paths } = v;
			const odir                                   = ParsePath( path );
			const tit                                    = ` fy[by[f0[Proyecto:]] ${ odir.dir }]`;
			let   gui                                    = '';

			for ( let x = tit.length - 11; x--; gui+= '-' );

			console.Cmd(
				'\n' +
				'\n' +
				tit  + '\n' +
				'fy['+ gui +']\n' +
				`cv[fm[Configuraciones:]]\n` +
				configs_paths.reduce( ( r, v ) => `${r}f0[- ${v}]\n`, '' ) +
				'\n' +
				'cv[fg[Servidores:]]' +
				MesageProc({ ...app, name:'app' }) +
				MesageProc({ ...api, name:'api' }) +
				MesageProc({ ...res, name:'res' }) +
				'\n'
			);
		}

		setTimeout(() => { process.exit( 0 ) }, 100);
	}

	/* Inicio */
	async function Inicio() {
		ENVIRONMENTS.unshift( 'ls' );

		spinner       = Spinner( 'Descargando lista de servicios: ', { all:{ title:'' } } );
		const oconfig = ParsePath( DIRS[0], 'meme.conf' );
		const config  = await LoadConfig( oconfig.path, ENVIRONMENTS );
		const port    = config.driver.port;
		const driver  = await Driver( port );

		if ( !driver ) return;

		driver.Events( 'project/command/ls/end', onEnd );

		driver.Trigger(
			'project/command/ls',
			{
				id          ,
				port        ,
				path        : oconfig.path,
				execs       : EXECS,
				commands    : COMMANDS,
				environments: ENVIRONMENTS,
			}
		);
	};return Inicio();
}

function Commands() {
	/* Funciones */
	async function PintList() {
		const conf     = ParsePath ( DIRS[0], 'meme.conf' );
		const config   = await LoadConfig( conf.path, ENVIRONMENTS );
		let   commands = '';

		for ( const [k,v] of Object.entries( config.commands ) )
			commands+= `\n - fg[${k}]: cd[${ v.description }]`;

		if ( !commands )
			commands = '\nNo hay comandos que se puedan ejecutar en este proyecto';

		console.Cmd(
			'\n' +
			'fy[ meme.js - commands ]\n' +
			'fy[--------------------]' +
			commands +
			'\n'
		);
	}
	async function ExecuteCommand() {
		const oconf   = ParsePath( DIRS[0], 'meme.conf' );
		const conf    = await LoadConfig( oconf.path, ENVIRONMENTS );
		const funcion = conf.commands[COMMANDS[0]];

		if ( Typeof( funcion )==='object' ) {
			if ( funcion.commands.length ) {
				for ( const comn of funcion.commands ) {
					const res = child_process.spawnSync(
						comn.command,
						[].concat( comn.args ).filter( v=>!!v ),
						{ stdio:[process.stdin, process.stdout, process.stderr], ...comn.options }
					);

					if ( res.status!==0 )
						console.Error( 'status:', res.error?.errno, '\n' + res.error?.stack );

					if ( comn.required && res.status!==0 )
						break;
				}
			}
			else {
				console.info();
				console.Error( `No hay comandos que ejecutar en 'fm[${ COMMANDS[0] }]'\n` );
			}
		}
		else {
			console.info();
			console.Error( `No se reconoce el comando 'fm[${ COMMANDS[0] }]'\n` );
		}
	}
	// *********************************************

	/* Inicio */
	if ( COMMANDS.length===1 && COMMANDS[0]===undefined ) PintList()
	else                                                  ExecuteCommand();
	// *********************************************
}

function Default() {
	if ( !EXECS[0] ) Help();
	else {
		console.info();
		console.Error( `No se reconoce el comando 'fm[${ EXECS[0] }]'\n` );
	}
}
// ####################################################################################################


/* Inicio */
function Inicio() {
	ConfigureTitle( 'fy[\\[CLI\\]]' );

	for ( let x = 2; x<process.argv.length; x++ ) {
		switch ( process.argv[x] ) {
			case '-e': ENVIRONMENTS.push( ...process.argv.slice( ++x ) ); x = process.argv.length; break;
			case '-d': DIRS        .push(    process.argv[++x]         ); break;
			case '-c': COMMANDS    .push(    process.argv[++x]         );
					   EXECS       .push(    'commands'                ); break;
			case '-h': EXECS       .push(    'help'                    ); break;
			case '-v': EXECS       .push(    'version'                 ); break;
			case '-l': EXECS       .push(    'log'                     ); break;
			case '-i': EXECS       .push(    'init'                    ); break;
			case '-s': EXECS       .push(    'start'                   ); break;
			case '-b': EXECS       .push(    'build'                   ); break;
			case '-r': EXECS       .push(    'reset'                   ); break;
			default  : EXECS       .push(    process.argv[x]           ); break;
		}
	}

	switch ( EXECS[0] ) {
		case 'help'   : Help   (); break;
		case 'version': Version(); break;
		case 'log'    : Log    (); break;
		case 'ls'     : Ls     (); break;

		case 'init'    : Init    (); break;
		case 'start'   : Start   (); break;
		case 'commands': Commands(); break;
		case 'build'   : Build   (); break;
		case 'reset'   : Reset   (); break;
		case 'stop'    : Stop    (); break;

		default: Default();
	}
};       Inicio();
// ####################################################################################################