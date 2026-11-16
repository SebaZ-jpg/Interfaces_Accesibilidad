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
