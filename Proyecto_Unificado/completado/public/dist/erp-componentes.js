/* erp-insignia.js */
/* Autor/a: [ESCRIBE TU NOMBRE]. E5: componente personalizado de estado. */
class ErpInsignia extends HTMLElement { // Declara una clase que hereda de un elemento HTML.
  static get observedAttributes() { return ['estado']; } // Indica al navegador que vigile el atributo estado.
  constructor() { // Se ejecuta cuando se crea una instancia del componente.
    super(); // Inicializa la clase HTMLElement.
    this.attachShadow({ mode: 'open' }); // Crea el Shadow DOM para aislar el HTML y CSS internos.
    this._escucha = false; // Recuerda si ya se ha registrado el evento click.
  }
  get estado() { // Getter: permite consultar el estado desde JavaScript.
    const permitidos = ['pending', 'paid', 'shipped', 'cancelled']; // Lista cerrada de estados válidos.
    const valor = this.getAttribute('estado'); // Lee el atributo HTML.
    return permitidos.includes(valor) ? valor : 'pending'; // Usa pending si falta o no es válido.
  }
  set estado(valor) { this.setAttribute('estado', valor); } // Setter: modifica el atributo y activa el repintado.
  attributeChangedCallback() { this.pintar(); } // Repinta el componente cuando cambia estado.
  connectedCallback() { // Se ejecuta cada vez que el elemento se conecta al documento.
    this.pintar(); // Dibuja la apariencia inicial.
    if (!this._escucha) { // Evita duplicar listeners al quitar y volver a insertar el elemento.
      this.addEventListener('click', () => { // Escucha los clics sobre la insignia.
        const estados = ['pending', 'paid', 'shipped', 'cancelled']; // Define el orden de la secuencia.
        const posicion = estados.indexOf(this.estado); // Encuentra la posición del estado actual.
        this.estado = estados[(posicion + 1) % estados.length]; // Avanza y vuelve al inicio al llegar al final.
        this.dispatchEvent(new CustomEvent('cambio', { // Emite un evento personalizado.
          detail: { estado: this.estado }, // Transporta el estado nuevo en la propiedad detail.
          bubbles: true, // Permite que el evento suba por los elementos antecesores.
          composed: true // Permite que el evento atraviese el límite del Shadow DOM.
        }));
      });
      this._escucha = true; // Marca que el listener ya está instalado.
    }
  }
  pintar() { // Construye la representación visual del estado actual.
    const colores = { // Asocia un fondo y un color de texto a cada estado.
      pending: { fondo: '#fff0cc', texto: '#8a5a00' },
      paid: { fondo: '#d6f5e0', texto: '#17753a' },
      shipped: { fondo: '#dbe7ff', texto: '#1d4ed8' },
      cancelled: { fondo: '#fbdada', texto: '#a12222' }
    };
    const color = colores[this.estado]; // Obtiene los colores del estado validado.
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-block; font-family: system-ui, sans-serif; }
        span { display: inline-block; padding: 5px 11px; border-radius: 999px;
               background: ${color.fondo}; color: ${color.texto}; font-weight: 700;
               cursor: pointer; }
      </style>
      <span>${this.estado}</span>`; // Inserta estilos y texto dentro del Shadow DOM.
  }
}
customElements.define('erp-insignia', ErpInsignia); // Registra la etiqueta <erp-insignia> en el navegador.

/* erp-tarjeta.js */
/**
 * <erp-tarjeta>: tarjeta con un titulo y un numero grande.
 * Propiedades: titulo (defecto "Sin titulo"), valor (defecto "0"), color (defecto "#2b5cff")
 * Evento: "seleccionada" (al hacer clic), con detail { titulo, valor }
 * Uso: <erp-tarjeta titulo="Clientes" valor="12"></erp-tarjeta>
 */
class ErpTarjeta extends HTMLElement {            // nuestro componente = una clase que extiende HTMLElement
  static get observedAttributes() {               // lista de atributos que vigilamos
    return ['titulo', 'valor', 'color'];          // si cambian, se avisa al componente
  }
  constructor() {                                 // se ejecuta al crear el componente
    super();                                      // obligatorio: inicia la clase base
    this.attachShadow({ mode: 'open' });          // zona interna aislada (Shadow DOM) para HTML y CSS propios
  }
  get titulo() { return this.getAttribute('titulo') || 'Sin titulo'; } // leer titulo (o valor por defecto)
  set titulo(v) { this.setAttribute('titulo', v); } // escribir titulo
  get valor() { return this.getAttribute('valor') || '0'; } // leer valor (defecto 0)
  set valor(v) { this.setAttribute('valor', v); }   // escribir valor
  get color() { return this.getAttribute('color') || '#2b5cff'; } // leer color (defecto azul)
  set color(v) { this.setAttribute('color', v); }   // escribir color
  connectedCallback() {                           // se ejecuta cuando el componente entra en la pagina
    this.pintar();                                // dibujamos su contenido
    if(!this._escucha) this.addEventListener('click', () => {        // al hacer clic sobre el componente...
      this.dispatchEvent(new CustomEvent('seleccionada', { // ...lanzamos nuestro propio evento
        detail: { titulo: this.titulo, valor: this.valor }, // datos que viajan con el evento
        bubbles: true,                            // el evento sube por los elementos padre
        composed: true,                           // y atraviesa el Shadow DOM
      }));
    });
    this._escucha=true; // No duplica eventos al reconectar.
  }
  attributeChangedCallback() { this.pintar(); }   // si cambia un atributo, volvemos a dibujar
  seguro(s) { return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); } // Texto, nunca HTML ejecutable.
  pintar() {                                      // dibuja el HTML interno
    this.shadowRoot.innerHTML = `
      <style>
        .t { background:#fff; border-left:6px solid ${/^#[0-9a-f]{3,8}$/i.test(this.color)?this.color:'#2b5cff'}; border-radius:10px; padding:14px;
             box-shadow:0 1px 3px rgba(0,0,0,.15); cursor:pointer; font-family:system-ui,sans-serif; }
        small { color:#6b7488; }
        b { display:block; font-size:1.8rem; }
      </style>
      <div class="t"><small>${this.seguro(this.titulo)}</small><b>${this.seguro(this.valor)}</b></div>`;
  }
}
customElements.define('erp-tarjeta', ErpTarjeta); // registramos la etiqueta <erp-tarjeta> en el navegador
