# Trabajo práctico 06

## Proyecto de partida y cambios

El proyecto parte de la aplicación individual del TP05 ubicada en `NODO_tp5`.
Se conservaron las vistas EJS, el layout, el CSS, los cuatro datos iniciales,
las rutas, los campos y reglas de validación, Morgan, el ID `BIB-` y el registro
de duración al evento `finish`. La refactorización separa el arranque, la
configuración, la app, el router, el controlador, el servicio y los middleware.
No se agregaron base de datos ni persistencia.

Antes de refactorizar, se inspeccionó y ejecutó el TP05 original. La aplicación
de partida respondió 200 en inicio, estado, listado, formulario, detalle
existente y CSS; respondió 404 en detalle inexistente y URL desconocida. El
estado comenzó con cuatro reservas. El POST vacío, con sala no permitida, con
email sin `@` y con cero personas respondió 400; el POST válido respondió 302
a `/reservas` y la cantidad pasó a cinco. Durante la primera revisión de TP06
se detectó que `src/middleware/solicitudes.js` estaba vacío y `npm start`
fallaba al registrar ese middleware. Se restauró desde el comportamiento del
TP05 antes de ejecutar la matriz posterior.

## Instalación y ejecución

Requiere Node.js 18.18 o superior y npm. Desde la carpeta del proyecto:

```bash
npm install
npm start
```

Por defecto, el servidor escucha en <http://localhost:3000>. Para ejecutar las
comprobaciones estáticas, se ejecuta `npm run format` y luego `npm run check`.

## Configuración del entorno

`src/configuracion.js` lee `PORT` y `NODE_ENV` al iniciar. Si no se define
`PORT`, usa `3000`; si se define, debe ser un entero entre 1 y 65535. Morgan
usa el formato `dev` por defecto y `combined` cuando `NODE_ENV=production`;
esto solo cambia el formato del registro. `.env.example` muestra valores de
ejemplo no secretos. No se versiona `.env`; `npm start` no requiere ese archivo.

## Mapa de módulos y dependencias

| Módulo | Responsabilidad |
| --- | --- |
| `src/index.js` | Conserva la semilla, crea la única instancia del servicio, lee configuración, crea la app y llama a `listen`. |
| `src/configuracion.js` | Valida el puerto y selecciona entorno y formato de Morgan. |
| `src/app.js` | Configura Express y EJS, arma el pipeline, recibe el servicio compartido, monta rutas y responde el 404 final. |
| `src/router/reservas.js` | Declara caminos relativos al montaje `/reservas` y encadena middleware y controladores. |
| `src/controllers/reservas.js` | Interpreta parámetros y datos ya validados y decide qué vista, estado o redirección enviar. |
| `src/services/reservas.js` | Lista, busca, cuenta y crea reservas en memoria, sin conocer HTTP, Express ni EJS. |
| `src/middleware/solicitudes.js` | Asigna el identificador `BIB-` y mide hasta que termina la respuesta. |
| `src/middleware/reservas.js` | Añade el nombre de sección y valida los datos del formulario. |

El servicio no usa `res` porque su responsabilidad es gestionar datos; las
respuestas HTTP y el renderizado pertenecen al controlador. El controlador
recibe el servicio, usa sus operaciones y traduce el resultado a vistas,
estados o redirecciones. El router declara caminos relativos (`/`, `/nueva`,
`/:id`) porque Express lo monta en `/reservas`. El único arreglo de reservas
se crea en el servicio a partir de la semilla del arranque, y el mismo servicio
se comparte con listado, detalle, `/estado` y creación. Al reiniciar Node, las
nuevas reservas desaparecen y solo quedan los cuatro datos iniciales.

## Pipeline y contrato de rutas

El orden se conserva: Morgan → identificador → medición → layouts → static →
`urlencoded` → JSON → rutas principales y router `/reservas` → 404 final.
Morgan precede al middleware de solicitud; registra también recursos estáticos
que respondan desde `public/`. La identificación y la medición corren antes de
static, de modo que las solicitudes de CSS también reciben ID y medición.
La duración se imprime al evento `finish`, junto con método, URL, estado y
milisegundos.

| Método y camino | Resultado |
| --- | --- |
| `GET /` | 200, inicio |
| `GET /estado` | 200, JSON con estado, cantidad e ID de solicitud |
| `GET /reservas` | 200, listado |
| `GET /reservas/nueva` | 200, formulario |
| `GET /reservas/:id` | 200 si existe; 404 HTML si no |
| `POST /reservas` | 302 al listado si es válido; 400 si es inválido |
| `GET /css/estilos.css` | 200, CSS estático |
| Otra URL | 404 HTML |

`/nueva` está declarada antes de `/:id`. `express.urlencoded` precede al
middleware validador. La validación mantiene los campos estudiante, email,
sala, fecha, turno y personas; exige email con `@`, sala y turno permitidos,
fecha real con formato `AAAA-MM-DD` y entre 1 y 6 personas enteras. Si los
datos son inválidos, responde 400 sin llamar a `next()`; si son válidos,
prepara `req.reservaValidada` y continúa al controlador.

## Matriz antes/después

La evidencia “antes” se obtuvo ejecutando el TP05 original y probando sus rutas
y formularios antes de editar TP06. La matriz posterior se verificó ejecutando
los mismos casos sobre TP06; Morgan y el middleware propio se revisaron en la
salida del proceso.

| Caso | Antes (TP05) | Después (TP06) |
| --- | --- | --- |
| Inicio, CSS, estado, listado, formulario y detalle existente | 200; estado inicial con 4 reservas. | 200 en todos; cuatro reservas con datos originales; ID `BIB-` visible en páginas y JSON. |
| Detalle inexistente y URL desconocida | 404 HTML. | 404 HTML en ambos casos, sin caída del servidor. |
| POST vacío, sala inválida, email sin `@`, personas 0, 7 o decimal | 400 en cada caso probado (vacío, sala, email y 0). | 400 con mensaje de validación; `/estado` permaneció en 4 tras cada intento. |
| POST válido y seguimiento | 302 a `/reservas`; `/estado` pasó de 4 a 5. | 302 a `/reservas`, el GET siguiente respondió 200, el listado mostró la reserva y `/estado` pasó de 4 a 5. |
| Puerto alternativo e inválido | TP05 usaba el puerto fijo 3000. | Con `PORT=3217`, `/estado` respondió 200; con `PORT=abc`, el proceso no inició y mostró error explícito. También se rechazaron 0, 65536 y 3.5. |
| Reinicio | No comprobado en la sesión de línea de base. | Tras reiniciar en 3000, `/estado` respondió 200 con cantidad 4 e ID `BIB-0001`. |

Morgan y el middleware de duración registraron respuestas 200 (páginas, CSS y
estado), 302 (POST válido), 400 (POST inválidos) y 404 (detalle inexistente y
ruta desconocida), junto con ID, método, URL y duración.

## Formato y análisis estático

Dependencias de desarrollo: Prettier, ESLint y `@eslint/js`. ESLint aplica la
configuración recomendada a los archivos CommonJS de `src/`.

```bash
npm run format
npm run check
```

`check` ejecuta `format:check` y `lint`. Resultados de los comandos de entrega:

- `npm install`: finalizó correctamente; 0 vulnerabilidades informadas.
- `npm run format`: finalizó correctamente sobre `src/`.
- `npm run check`: pasaron Prettier y ESLint.
- `npm start`: inició en el puerto predeterminado 3000 y respondió a la matriz.

## Persistencia temporal y límites

Las reservas viven únicamente en memoria. No se escriben archivos ni se usa
una base de datos; por ello toda alta realizada se pierde al reiniciar el
proceso y se reconstruye la semilla original. No se incorporaron funcionalidades
fuera del alcance de esta refactorización.
# NODO_tp7_salas_mongodb
