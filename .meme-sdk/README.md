# meme.js

<img align="left" src="https://intal.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Fc69d89ae-6d74-4cee-9ad1-911445e97f2e%2F6bd6ab72-d716-4686-8d32-5a8ed660ba7f%2Fbig256.png?table=block&id=230affd7-c2f7-4b82-a494-b452cae78760&spaceId=c69d89ae-6d74-4cee-9ad1-911445e97f2e&width=510&userId=&cache=v2" width=100 style="float:left;margin-right:10px"/>

meme.js es un SDK enfocado en el rápido desarrollo de sitios, blogs, apps, PWA y aplicaciones hechas con tecnologías web. Cubriendo de forma eficiente, tanto las interfaces gráficas, como los servicios que soportaran el funcionamiento de la misma.

Es apto tanto para las aplicaciones más simples, fáciles y rápidas de producir, Como para las aplicaciones mas complejas, con alto grado de escalabilidad y eficiencia. Proporcionando en ambos casos, estructuras modernas de programación junto a una arquitectura limpia, que permite un FrontEnd fácil de programar, mantener y con una robustez insuperable. Y micro servicios javascripts eficientes, con la misma facilidad al crearse y mantenerse.

No es como otras soluciones, con configuraciones dependientes, pesadas y engorrosas arquitecturas. Que dan como resultados aplicaciones enormes y lentas, que tienes que soportar para reutilizar medianamente tu código. meme.js es tremendamente eficiente, con resultados ligeros y por ello, altamente escalables, que te permitirán reutilizar cada parte de tu código en diferentes proyectos que incluso si son de productos y naturalezas distintas.

## ¿Por que?
meme.js nace por la necesidad de mantener simple el desarrollo UI, BackEnd, FrontEnd y focalizar los esfuerzos personales o empresariales en desarrollos unitarios y 100% reutilizables. Creando componentes que se mantengan simples desde que se desarrollan, hasta que se consumen. Fomentando la programación de pequeñas "clases como unidades", estas "unidades", pueden ser: frontends, servicios o ambos. Que en conjunto, pueden formar sistemas robustos con alto grado de escalabilidad.

# Instalación
De momento y para el desarrollo local, todas las utilidades que necesitas para desarrollar con meme.js están agrupadas en un paquete: [meme.js](https://www.npmjs.com/package/meme-sdk), el cual, te recomiendo que instales de manera global con el manejador de paquetes npm, sin embargo, meme.js también se puede instalar en cada proyecto e incluso, puedes trabajar con el desde npx.

## Requerimientos previos
- Se requiere que cuentes con conocimientos medios o avanzados sobre HTML, CSS, JavaScript y manejo del DOM, para el uso de meme.js.
- Para el correcto funcionamiento de meme.js, se requiere instalar previamente [node v18.9.0](https://nodejs.org/dist/v18.9.0/node-v18.9.0.pkg) o superior de ser posible.
- Recomiendo descargar e instalar las extensiones de visual studio code: [meme.js Languages](https://marketplace.visualstudio.com/items?itemName=memejs.meme-lang) y [meme.js Icons](https://marketplace.visualstudio.com/items?itemName=memejs.meme-icons), para poder colorear la sintaxis de meme.js, así como poder visualizar los iconos de las extensiones de los archivos meme.js.

## Instalación global
Cuando creas y gestionas múltiples proyectos de meme.js, lo mas conveniente es instalar el paquete de forma global con el siguiente comando: `npm install -g meme-sdk`.

# Inicio rápido

## Inicio con plantilla
Similar a "npm init". Para iniciar un proyecto con meme.js, solo hay que escribir en una consola (posicionada previamente en el directorio de nuestro proyecto): `meme init`, si queremos la configuración de default sin necesidad de introducir ningún dato adicional en el inicio, escribimos: `meme init -y`.

Los comandos anteriores, son en el caso de que se halla instalado meme.js de forma global (tal como se recomienda), pero meme.js es un paquete que de igual forma se puede usar de forma local o usarse con npx, por ejemplo, para iniciar un proyecto e instalarlo de forma local escribiríamos el siguiente comando: `npx meme-sdk init -install`, lo cual nos iniciaría el proyecto de meme.js, según la plantilla e instalando las dependencias necesarias en el mismo proyecto.

Posterior a esto, solo hace falta iniciar el proyecto con el comando: `meme -s`, y de esta forma podremos visualizar el proyecto.

# Autores
* Jesus Aldrete - <jesus@aldrete.pro>