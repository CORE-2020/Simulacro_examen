# Entrega de examen CORE 2020

Esta entrega sigue un esquema similar al resto de entregas de la asignatura.

La principal diferencia es que cada alumno tendrá un enunciado diferente.
Para ello, el instalador (`npm install`) le pedirá su dirección de correo UPM, y automáticamente generará un enunciado personalizado.

Tras las instalación (ver [](#Preparación)), el enunciado estará disponible en `Enunciado.md`.


## Paso 1

Para hacer el examen, el alumno debe clonar el repositorio `Entrega_examen` desde la siquiente URL:

     https://github.com/CORE-2020/Entrega_examen

Este repositorio contiene un autocorector del examen y una versión del proyecto Quiz 2020.


## Paso 2

Una vez descargada la entrega, ha de instalar las dependencias necesarias para el autocorector. Para ello debe ejecutar los comandos:

    cd Entrega_examen
    npm install


## Paso 3

Debe lanzar el autocorrector.
Al lanzar el autocorrector, el comando le pedirá su correo de alumnos UPM.
Es muy importante que escriba su dirección de correo correctamente y **elija la opción de almacenar los datos en el fichero `user.json`**.
En caso contrario, no se mostrará el enunciado.

```
npx autocorector
```

Si la instalación se completa adecuadamente, se habrá creado un fichero `Enunciado.pdf` en la carpeta de su práctica.


## Paso 4


El fichero `Enunciado.pdf` describe una serie de modificaciones que deberá hacer sobre la práctica.
Los ficheros del proyecto ya se han descargado, están en el directorio raíz de la entrega: **no** hay que cambiarse a ningún subdirectorio (`quiz_2020`), y **no** hay que hacer otro `npm install` adicional.

## Paso 5

Las modificaciones realizadas se pueden probar lanzando el servidor con `npm start`, y visitando la url http://localhost:3000 desde un navegador.


## Paso 6

Finalmente, debe ejecutar el autocorector invocando el comando `npx autocorector -u`.
El autocorector puede ejecutarse todas la veces que se desee.

**MUY IMPORTANTE**: El autocorector debe ejecutarse siempre para que la práctica se suba a moodle, aunque no funcionen las modificaciones o no se hayan terminado completamente.
Si no se ejecuta el autocorector, el examen se suspende automáticamente.
