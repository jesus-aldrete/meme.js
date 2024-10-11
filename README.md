<h1 align="center">MonoRepo de meme.js</h1>

<p align="center">
	<a href="https://mjs.red">
		<img src="https://intal.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fc69d89ae-6d74-4cee-9ad1-911445e97f2e%2F9a9cb040-fd34-43ad-b3ad-257bba33b9f0%2Fbig512.png?table=block&id=c7c9fac4-d391-4623-9d65-bfc4fd123c07&spaceId=c69d89ae-6d74-4cee-9ad1-911445e97f2e&width=1020&userId=&cache=v2" alt="meme.js logo" width="200px" height="200px"/>
	</a>
	<br>
	<a href="https://mjs.red">mjs.red</a>
	<br>
	<i>En este mono repositorio público, se alojan todos los proyectos que hacen operar el SDK meme.js, así como los proyectos de código abierto basados en la plataforma.</i>
	<br>
</p>
<br>

# Tabla de Contenidos
- [Requerimientos previos](#requerimientos-previos)
- [Funcionamiento](#funcionamiento)
- [Sistema de Archivos](#sistema-de-archivos)
  - [Archivos](#archivos)
  - [Carpetas de Desarrollo](#carpetas-de-desarrollo)
  - [Carpetas de Proyectos](#carpetas-de-proyectos)
- [Proyectos Integrantes](#proyectos-integrantes)
  - [.meme-sdk](#meme-sdk)
  - [.meme-icons](#meme-icons)
  - [.meme-lang](#meme-lang)
  - [Mimix](#mimix)

# Requerimientos previos
- Se requiere que cuentes con conocimientos medios o avanzados sobre html, css, javascript y manejo del DOM, para el uso del SDK.
- Para el correcto funcionamiento del SDK, se requiere instalar previamente [node v20.15.1](https://nodejs.org/en/download/package-manager) o superior de ser posible.
- Conocer y usar a nivel intermedio de [Visual Studio Code](https://code.visualstudio.com/).
- Recomiendo descargar e instalar las extensiones de visual studio code: [meme.js Languages](https://marketplace.visualstudio.com/items?itemName=memejs.meme-lang) y [meme.js Icons](https://marketplace.visualstudio.com/items?itemName=memejs.meme-icons), para poder colorear la sintaxis y poder visualizar los iconos de las extensiones de los archivos meme.js.

# Funcionamiento
Con excepción de los proyectos que son extensiones de VSCode, este mono repo no tiene ninguna clase de dependencia externa, y gracias a esto, solo es necesario clonarlo, para poder ejecutar todos los proyectos contenidos en el mono repo. La ejecución de cada proyecto se hace con lanzadores de VSCode, por lo que solo hay que:

1) Ir al menú de "Ejecución y depuración".
2) Seleccionar el lanzador del proyecto que necesitemos ejecutar.
3) Presionar el botón de "iniciar depuración".

Y con esto, nuestro proyecto estará corriendo y listo para visualizarse, ya sea en el navegador o en la consola.

# Sistema de Archivos
Se creó una estructura simple y auto explicativa en el mono repo. En donde cada una de las carpetas es un proyecto separado, y hasta cierto punto independiente de los demás.

## Archivos
* <b>meme.conf</b>: este archivo sirve para mapear los puertos que se podrían o no, ocupar en cada proyecto, para que hasta cierto punto, queden reservados por los proyectos, sepamos cuales son y podamos ejecutar uno o más proyectos al mismo tiempo sin que colisionen.
* <b>comunes</b>: este repo, también contiene archivos que podemos encontrar en cualquier otro proyecto de programación, por lo que no se explicaran en este readme, archivos como podrian ser: .editorconfig, .gitignore, LICENSE.md, README.md, etc.

## Carpetas de Desarrollo
Todas las carpetas que inician por un punto ("."), son carpetas de proyectos que solo funcionan en tiempo de desarrollo, como por ejemplo, el SDK meme.js.

## Carpetas de Proyectos
Todas las carpetas que no son de desarrollo, son de proyecto, y pueden o no, tener una "dependencia parcial", lo que significa que el proyecto requiere o tiene dependencia con algún archivo o programa contenido en alguna otra carpeta.

# Proyectos Integrantes

## .meme-sdk
<img align="left" src="https://intal.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fc69d89ae-6d74-4cee-9ad1-911445e97f2e%2F6bd6ab72-d716-4686-8d32-5a8ed660ba7f%2Fbig256.png?table=block&id=230affd7-c2f7-4b82-a494-b452cae78760&spaceId=c69d89ae-6d74-4cee-9ad1-911445e97f2e&width=510&userId=&cache=v2" width=100 style="float:left;margin-right:10px"/>

Este proyecto es sobre el SDK meme.js en sí, contiene todos los scripts y programas que el SDK necesita para su funcionamiento. Igualmente, en esta carpeta también se incluyen algunos recursos gráficos, como podría ser el icono del proyecto y las plantillas de inicialización, etc.

Este proyecto no contiene ninguna clase de dependencia, por lo que puedes ejecutar todos sus lanzadores directamente, apenas clonando el mono repositorio [(más información)](https://mjs.red).
<br>
### Lanzadores
* <b>meme RES</b>: Este lanzador inicia únicamente el compilador/servidor de los recursos, con la configuración del proyecto de prueba, esto con el fin de que podamos probar las modificaciones que le hagamos a este programa.
* <b>meme API</b>: De la misma forma que en el caso anterior, este lanzador solo inicia el compilador/servidor de las api’s de meme.js.
* <b>meme APP</b>: Igualmente este lanzador inicia el compilador/servidor que se encarga de gestionar la parte front-end de meme.js.
* <b>meme Driver</b>: Con este launcher podemos arrancar el programa de driver.js, el cual se encarga de gestionar los proyectos y servidores de meme.js.
* <b>Test Project</b>: Este launcher arranca un proyecto de prueba, alojado en: ```.meme-sdk/01_Resources/pruebas/project```, que nos puede ayudar a probar todo el SDK en general.

## .meme-icons
<img align="left" src="https://intal.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fc69d89ae-6d74-4cee-9ad1-911445e97f2e%2F8320c3f7-82bf-4ec8-97ab-6a67a97448b3%2Fbig256.png?table=block&id=dbd3c8be-95ff-4e8f-a016-0cbc1660c884&spaceId=c69d89ae-6d74-4cee-9ad1-911445e97f2e&width=510&userId=&cache=v2" width=100 style="float:left;margin-right:10px"/>

Este proyecto es un tema de iconos para Visual Studio Code, en el que se integran los iconos de los formatos memeHTML, memeCSS, memeJS, entre muchos otros formatos y carpetas orientados al desarrollo web y relacionados con el proyecto de meme.js y sus proyectos.

Este proyecto tiene dependencias, por lo que se requiere instalarlas con el gestor de paquetes npm, antes de ejecutar el proyecto [(más información)](https://mjs.red).

### Lanzadores
* <b>meme-icons</b>: Este lanzador te abre una nueva ventana de VSCode, en donde se podrá ver integrado este tema de iconos.

## .meme-lang
<img align="left" src="https://intal.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fc69d89ae-6d74-4cee-9ad1-911445e97f2e%2F07e5363a-94fc-4ee3-b307-ddd6d97f188c%2Fbig256.png?table=block&id=053d861f-ab83-406a-a36b-17c2cff44bdc&spaceId=c69d89ae-6d74-4cee-9ad1-911445e97f2e&width=510&userId=&cache=v2" width=100 style="float:left;margin-right:10px"/>

Este proyecto contiene tanto las sintaxis de los lenguajes de memeHTML, memeCSS, memeJS, los clientes para el comportamiento de los lenguajes y los SLP para las sugerencias del lenguaje.

Este proyecto contiene dependencias npm, por lo que antes de ejecutar cualquiera de sus lanzadores, se tienen que instalar las dependencias npm del proyecto [(más información)](https://mjs.red).

### Lanzadores
* <b>Sintaxis HTML</b>: Este lanzador transpila la sintaxis de memeHTML, convirtiendo el archivo yaml a json, e igualmente inicia otra ventana de VSCode, en donde tendrá cargada la sintaxis de memeHTML.
* <b>Sintaxis CSS</b>: Este lanzador transpila y carga la sintaxis de memeCSS.
* <b>Sintaxis JS</b>: Este lanzador transpila y carga la sintaxis de memeJS.
* <b>Sintaxis All</b>: Este lanzador transpila todas las sintaxis de meme.js.
* <b>Intellisense Client</b>: Inicia la parte del cliente que le da algunas funcionalidades a los lenguajes de meme.js, además, abre una ventana nueva de VSCode, donde podrás ver cargadas estas funcionalidades de los lenguajes.
* <b>Intellisense Server</b>: Inicia la parte del servidor que le da algunas funcionalidades a los lenguajes de meme.js, además, abre una ventana de VSCode, donde podrás ver cargadas estas funcionalidades de los lenguajes.
* <b>Intellisense Client + Server</b>: Inicia la parte del cliente y del servidor que añaden funcionalidades a los lenguajes de meme.js y nos abre una ventana nueva de VSCode, donde se verán reflejadas, todas estas funcionalidades.

## Mimix
<img align="left" src="https://intal.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fc69d89ae-6d74-4cee-9ad1-911445e97f2e%2F029ba7c8-09e8-47ed-8ce0-84c0738df6fa%2Fbig256.png?table=block&id=24976d5f-ddbf-4de4-8896-e974394a0ed0&spaceId=c69d89ae-6d74-4cee-9ad1-911445e97f2e&width=510&userId=&cache=v2" width=100 style="float:left;margin-right:10px"/>

Este proyecto contiene el sistema de diseño usado en este mono repo, así como todos los componentes transversales y omni canal, usados en este mono repo. Igualmente se incluyen diseños y colores de estos componentes.

Este proyecto sólo contiene componentes independientes, por lo que no hay forma de ejecutarlo, por esta razón, no tiene lanzador. [(más información)](https://mjs.dev).

# Licencia
Este proyecto está bajo la Licencia Business Source License 1.1 para meme.js. Consulta el archivo [LICENSE](./LICENSE) para más detalles.