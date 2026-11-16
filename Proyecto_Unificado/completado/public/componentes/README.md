<!-- Autor/a: [ESCRIBE TU NOMBRE] -->

# Componentes del proyecto

## erp-tarjeta

| Propiedad | Valor por defecto | Descripción |
|---|---|---|
| `titulo` | `Sin titulo` | Texto descriptivo de la tarjeta. |
| `valor` | `0` | Valor principal que aparece destacado. |
| `color` | `#2b5cff` | Color de la franja izquierda. |

**Evento:** `seleccionada`. Su propiedad `detail` contiene `titulo` y `valor`.

**Ejemplo:**
```html
<erp-tarjeta titulo="Teclado" valor="3" color="#17753a"></erp-tarjeta>
```

## erp-insignia

| Propiedad | Valor por defecto | Descripción |
|---|---|---|
| `estado` | `pending` | Estado del pedido. Admite `pending`, `paid`, `shipped` y `cancelled`. Si falta o no pertenece a esa lista, devuelve `pending`. |

**Evento `cambio`:** se emite cada vez que se hace clic y el componente avanza al siguiente estado. El objeto `detail` contiene la propiedad `estado` con el estado nuevo. El evento se configura con `bubbles: true` y `composed: true`, de modo que puede escucharse desde elementos antecesores y atravesar el Shadow DOM.

**Ejemplo de uso:**
```html
<script type="module">
  await import('/componentes/erp-insignia.js');

  document.addEventListener('cambio', evento => {
    console.log('Nuevo estado:', evento.detail.estado);
  });
</script>

<erp-insignia></erp-insignia>
<erp-insignia estado="paid"></erp-insignia>
<erp-insignia estado="shipped"></erp-insignia>
<erp-insignia estado="cancelled"></erp-insignia>
```

Al pulsar una insignia, el ciclo es `pending` → `paid` → `shipped` → `cancelled` → `pending`.

## Empaquetado

Desde la carpeta raíz del proyecto, ejecuta:

```bash
npm run empaquetar
```

El script crea `public/dist/erp-componentes.js` con los componentes JavaScript de esta carpeta, excluyendo `pruebas.js`. En una página que use el paquete, carga ese archivo una sola vez y no cargues simultáneamente los ficheros fuente individuales.
