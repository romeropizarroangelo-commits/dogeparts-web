/* =========================================================================
   DOGEPARTS SAC · Portada (carrusel del inicio)
   -------------------------------------------------------------------------
   Cada elemento de SLIDES es una diapositiva. Con dos o más, rotan solas
   cada SLIDE_INTERVAL milisegundos (se detienen al pasar el cursor y si el
   visitante tiene activada la reducción de movimiento).

   Para añadir un modelo DOOSAN: guarda la foto en assets/img/portada/
   (fondo blanco o neutro, mínimo 1100 px de ancho) y copia un bloque.
     src     ruta de la imagen
     alt     descripción para accesibilidad
     kicker  etiqueta pequeña (ej. 'Maquinaria DOOSAN')
     title   texto principal (ej. 'Excavadora DX225LC')
     text    línea secundaria
     href    opcional: enlace al pulsar la leyenda (ej. la ficha de un repuesto)
     w, h    dimensiones de la imagen en píxeles
   Usa solo fotografías sobre las que DOGEPARTS tenga derechos de uso.
   ========================================================================= */

window.SLIDE_INTERVAL = 3000;

window.SLIDES = [
  {
    src: 'assets/img/hero-excavadora.webp',
    alt: 'Excavadora DOOSAN DX140LC',
    kicker: 'Maquinaria DOOSAN',
    title: 'Excavadora DX140LC',
    text: 'Repuestos para tu flota, con despacho a todo el Perú',
    w: 1100, h: 777
  },
  {
    src: 'assets/img/productos/valvula-65041010026.webp',
    alt: 'Válvula de admisión, código 65.04101-0026',
    kicker: 'Repuesto destacado · Motor',
    title: 'Válvula de admisión',
    text: 'Código 65.04101-0026 · Aplicación registrada DOOSAN DX300',
    href: '#/repuesto/valvula-de-admision-65-04101-0026',
    w: 1200, h: 800
  },
  {
    src: 'assets/img/productos/interruptor-24v.webp',
    alt: 'Interruptor de motor 24V',
    kicker: 'Repuesto destacado · Sistema eléctrico',
    title: 'Interruptor de motor 24V',
    text: 'Compatibilidad por confirmar con el número de serie',
    href: '#/repuesto/interruptor-de-motor-24v',
    w: 1200, h: 800
  }
];
