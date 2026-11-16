# Guía para explicar y defender los evaluables E1–E7
Autor/a: [ESCRIBE TU NOMBRE]

Esta guía explica las estructuras usadas en las páginas evaluables y cómo se relacionan con los ejercicios resueltos del proyecto.

## 1. Estructuras JavaScript comunes

- `const`: declara una variable cuya referencia no se reasigna. Se usa para referencias a botones, elementos HTML y datos que no cambian de referencia.
- `let`: declara una variable que sí puede cambiar, por ejemplo el índice `actual`, la lista `visibles` o el fotograma `anterior`.
- `function nombre(...) {}`: define una función reutilizable.
- `() => {}`: función flecha. Es una forma corta de definir una función, muy usada como callback de eventos.
- `async`: marca una función que puede esperar operaciones asíncronas.
- `await`: espera el resultado de una promesa, por ejemplo una petición HTTP, la cámara o la carga de MediaPipe.
- `try { ... } catch (error) { ... }`: captura errores para mostrar un mensaje en lugar de dejar la operación sin controlar.
- `addEventListener('click', funcion)`: registra una función que se ejecutará cuando el usuario haga clic.
- `document.getElementById(id)`: busca un elemento HTML por su atributo `id`.
- `.value`: lee o escribe el contenido de un campo de formulario.
- `.textContent`: cambia texto sin interpretar etiquetas HTML.
- `.innerHTML`: inserta marcado HTML. Si se usa con datos externos, hay que escapar esos datos primero.
- `fetch(url, opciones)`: realiza una petición HTTP al servidor.
- `response.ok`: indica si la respuesta HTTP está en el rango correcto.
- `JSON.stringify(objeto)`: convierte un objeto JavaScript en una cadena JSON para enviarlo.
- `await Ayudas.pedir(...)`: usa la función común del proyecto que hace `fetch`, comprueba `ok` y convierte la respuesta a JSON.
- `Ayudas.escapar(texto)`: transforma caracteres como `<`, `>` y `&` para que un dato no se interprete como HTML.

## 2. Arrays y cadenas

- `map`: transforma cada elemento de un array en otro valor. En E2 crea una fila HTML por producto.
- `filter`: crea un array nuevo con los elementos que cumplen una condición. En E2 filtra stock; en E7 filtra pedidos pagados.
- `join('')`: une todas las cadenas de un array sin separador. Se usa para construir el contenido de una tabla o lista.
- `includes(texto)`: comprueba si una cadena contiene un texto.
- `startsWith(texto)`: comprueba si una frase comienza por un prefijo.
- `slice(n)`: devuelve la cadena desde la posición `n`.
- `replace(expresion, sustitucion)`: reemplaza partes de una cadena.
- `toLowerCase()`: convierte una cadena a minúsculas.
- `trim()`: elimina espacios al principio y al final.
- `array.length`: indica cuántos elementos tiene el array.
- `%`: operador módulo. En los índices circulares evita salir de los límites de la lista.

## E1 — Dictar un cliente

**Objetivo:** usar reconocimiento de voz para rellenar nombre, ciudad y email, y enviar el cliente al servidor.

1. `Ayudas.voz(boton, accion, mensaje)` conecta el botón con el reconocimiento de voz que ya proporciona el proyecto.
2. Cada pulsación reconoce una frase. La función recibe esa transcripción como parámetro.
3. `toLowerCase().trim()` normaliza el texto para que las comparaciones sean consistentes.
4. `startsWith('nombre ')` reconoce el campo. `slice(7)` extrae el texto posterior al prefijo de siete caracteres.
5. Para email, `slice(6)` quita el prefijo `email `. `replace(/ arroba /g, '@')` convierte la palabra hablada en el símbolo arroba; otro `replace` convierte `punto` en punto. La expresión `/\s+/g` elimina espacios restantes.
6. `guardarCliente()` recoge los tres campos, comprueba que no estén vacíos y valida el formato del email.
7. `fetch('/api/customers', { method: 'POST', ... })` envía el cliente nuevo. La cabecera informa de que el cuerpo es JSON.
8. `await` espera la respuesta. `respuesta.ok` comprueba que el servidor haya aceptado la petición.

**Pregunta típica:** ¿por qué el método es POST? Porque estamos creando un cliente nuevo en el servidor.

## E2 — Filtrar productos con voz

**Objetivo:** cargar productos y mostrar solo los que coinciden con la orden de voz.

1. `productos` conserva el array original descargado de `/api/products`.
2. `pintar(lista)` recibe una lista y construye la tabla.
3. `map(p => ...)` crea una fila por producto; cada `p` representa un producto.
4. `join('')` concatena las filas en una sola cadena HTML.
5. `Ayudas.escapar` protege los datos que vienen de la API antes de insertarlos con `innerHTML`.
6. `filter(p => p.stock < 5)` conserva productos cuyo stock sea menor que cinco.
7. `filter(p => p.name.toLowerCase().includes(palabra))` busca un término en el nombre sin distinguir mayúsculas.
8. Para volver a ver todos, se llama a `pintar(productos)`. No hace falta volver a consultar el servidor.

**Pregunta típica:** ¿por qué no se filtra directamente la variable `productos`? Porque se necesita conservar la lista completa para poder recuperar todos los productos.

## E3 — Cambiar de producto con movimiento

**Objetivo:** detectar movimiento comparando dos imágenes consecutivas.

1. `getUserMedia` solicita permiso para usar la cámara.
2. El vídeo entrega fotogramas; el `canvas` permite dibujar uno y leer sus píxeles.
3. `getImageData(...).data` devuelve una secuencia de cuatro valores por píxel: rojo, verde, azul y alfa (RGBA).
4. El bucle `for` avanza con `i += 4` porque cada píxel ocupa cuatro posiciones.
5. Se suman rojo, verde y azul para obtener una medida sencilla de brillo.
6. `Math.abs(brillo - brilloAntes) > 90` identifica un cambio suficientemente grande entre fotogramas.
7. `(i / 4) % 160` calcula la columna horizontal del píxel. Menos de 80 es la mitad izquierda; 80 o más es la derecha.
8. Si más de 600 píxeles cambian en una mitad, se considera un gesto.
9. `performance.now()` mide tiempo. El bloqueo de 1000 milisegundos evita que un único movimiento cambie varios productos seguidos.
10. `(actual + 1) % productos.length` avanza circularmente. La fórmula con `+ productos.length - 1` retrocede sin obtener un índice negativo.
11. `foto.slice()` guarda una copia del fotograma para la siguiente comparación.

**Pregunta típica:** ¿el programa reconoce una persona o un brazo? No. Detecta cambios de píxeles; los cambios de iluminación también pueden influir.

## E4 — Cambiar el estado de un pedido con la mano

**Objetivo:** usar el índice como puntero y juntar pulgar e índice como clic.

1. MediaPipe devuelve puntos de referencia de la mano con coordenadas normalizadas entre 0 y 1.
2. `m[8]` representa la punta del índice y `m[4]` la punta del pulgar.
3. `getBoundingClientRect()` obtiene posición y dimensiones de la zona de cámara.
4. `x = (1 - m[8].x) * caja.width` convierte la coordenada horizontal a píxeles y corrige el espejo.
5. `y = m[8].y * caja.height` convierte la coordenada vertical.
6. `Math.hypot(dx, dy)` calcula la distancia entre los dedos. Menos de `0.05` se interpreta como pinza.
7. `pinza && !pinzaAntes` detecta el instante de cierre, no todos los fotogramas durante los que los dedos permanecen juntos.
8. `document.elementFromPoint(...)` busca el elemento bajo el puntero. `zona.contains(elemento)` comprueba que esté dentro de la zona de cámara.
9. `elemento.click()` activa el botón correspondiente.
10. `Ayudas.escribir(url, 'PUT', { status: estado })` actualiza el pedido 1 en el servidor.

**Pregunta típica:** ¿por qué se usa `pinzaAntes`? Para que una pinza mantenida no genere muchos clics repetidos.

## E5 — Web Component `erp-insignia`

**Objetivo:** crear una etiqueta HTML propia para representar el estado de un pedido.

- `class ErpInsignia extends HTMLElement`: define un componente que hereda de los elementos HTML.
- `customElements.define('erp-insignia', ErpInsignia)`: registra la etiqueta en el navegador.
- `constructor()` inicializa el componente.
- `super()` ejecuta el constructor de la clase base.
- `attachShadow({ mode: 'open' })` crea un Shadow DOM. Su contenido y estilos quedan encapsulados.
- `static get observedAttributes()` declara qué atributos vigila el navegador.
- `attributeChangedCallback()` se ejecuta al cambiar el atributo observado.
- `get estado()` permite leer el estado; `set estado(valor)` permite modificarlo.
- `connectedCallback()` se ejecuta cuando el componente entra en el documento.
- `this._escucha` evita registrar más de un listener de clic si se desconecta y vuelve a conectar el componente.
- `CustomEvent('cambio', opciones)` crea un evento personalizado.
- `detail` transporta datos, en este caso el nuevo estado.
- `bubbles: true` permite que el evento suba por los elementos antecesores.
- `composed: true` permite que el evento atraviese el límite del Shadow DOM.
- `pintar()` actualiza el contenido visual según el estado.

El ciclo es: `pending` → `paid` → `shipped` → `cancelled` → `pending`.

**Pregunta típica:** ¿qué diferencia hay entre atributo y propiedad? El atributo forma parte del marcado HTML; la propiedad se consulta o modifica desde JavaScript. El getter y el setter conectan ambos.

## E6 — Pruebas, documentación y paquete

**Objetivo:** verificar el componente y documentarlo.

- `document.createElement('erp-insignia')` crea una instancia desde JavaScript.
- `appendChild()` la inserta en la página.
- `test(nombre, funcion, salida)` ejecuta una prueba y añade un resultado a la lista.
- `igual(real, esperado)` compara dos valores. Si no coinciden, lanza un error.
- Las pruebas comprueban el estado por defecto, lectura de atributo, estado inválido, clic y evento, ciclo completo, contenido visual y reconexión.
- `README.md` documenta las propiedades, el evento y un ejemplo.
- `npm run empaquetar` ejecuta el script de `tools/empaquetar.js`, que concatena los componentes de `public/componentes/` en `public/dist/erp-componentes.js`, excluyendo `pruebas.js`.

**Pregunta típica:** ¿qué comprueba una prueba unitaria? Una condición o comportamiento concreto, de forma automática y repetible.

## E7 — Proyecto integrado

**Objetivo:** combinar lista de pedidos, voz, mano y componente.

1. `pedidos` conserva todos los pedidos descargados de `/api/orders`.
2. `visibles` contiene los pedidos que se muestran después del filtro.
3. La orden de voz `pagados` filtra `status === 'paid'`; `todos` restaura el array original.
4. Después de filtrar, `i = 0` reinicia el índice para empezar por el primer pedido visible.
5. `pintarLista()` muestra cliente, total e insignia de estado.
6. MediaPipe detecta la mano y `m[9]` sirve como punto central para colocar la tarjeta.
7. La coordenada horizontal se invierte con `1 - m[9].x` para compensar el espejo.
8. `visibles[i % visibles.length]` obtiene un pedido sin salirse del array.
9. La pinza hace avanzar `i` una posición circular.
10. Si no hay mano o la lista está vacía, se oculta la tarjeta y se reinicia el control de pinza.

La tarjeta es una superposición 2D sobre el vídeo; no es WebXR ni seguimiento espacial 3D.

## 3. Permisos y comprobación

- La voz necesita permiso de micrófono y un navegador compatible; el material del proyecto recomienda Chrome o Edge.
- E3, E4 y E7 necesitan permiso de cámara.
- La cámara y el micrófono funcionan en `http://localhost:3000` o en HTTPS.
- E4 y E7 descargan MediaPipe, por lo que necesitan conexión a Internet.
- Si falla una operación, abre las herramientas de desarrollador con F12 y revisa la pestaña Consola.

## 4. Preguntas rápidas para practicar

1. ¿Qué diferencia hay entre `let` y `const`?
2. ¿Qué devuelve `filter()`?
3. ¿Para qué sirve `map()`?
4. ¿Por qué se recorre el array RGBA de cuatro en cuatro?
5. ¿Qué mide `Math.hypot()`?
6. ¿Qué problema evita `pinza && !pinzaAntes`?
7. ¿Qué aporta Shadow DOM?
8. ¿Para qué sirve `observedAttributes`?
9. ¿Qué información transporta `detail` en un `CustomEvent`?
10. ¿Qué diferencia hay entre POST y PUT?
11. ¿Por qué E7 conserva `pedidos` y `visibles` por separado?
12. ¿Qué hace el operador módulo `%` al recorrer una lista?
