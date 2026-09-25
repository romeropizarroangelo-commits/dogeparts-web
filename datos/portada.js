/* =========================================================================
   DOGEPARTS SAC · Portada (carrusel del inicio)
   -------------------------------------------------------------------------
   Cada elemento de SLIDES es una diapositiva. Con dos o más, rotan solas
   cada SLIDE_INTERVAL milisegundos (se detienen al pasar el cursor y si el
   visitante tiene activada la reducción de movimiento).

   Para añadir un modelo DOOSAN: guarda la foto en assets/img/portada/
   (mínimo 1100 px de ancho) y copia un bloque.
     src      ruta de la imagen
     alt      descripción para accesibilidad
     kicker   etiqueta pequeña (ej. 'Maquinaria DOOSAN')
     title    texto principal (ej. 'Excavadora DX225LCA')
     text     línea secundaria
     href     opcional: enlace al pulsar la leyenda (ej. la ficha de un repuesto)
     fit      'cover' para fotografías reales (llenan el panel) · 'contain' para
              renders sobre fondo blanco
     credit   obligatorio si la foto es de terceros con licencia Creative
              Commons: {author, license, licenseUrl, source}. Se muestra en la
              leyenda y en el pie de página.
     w, h     dimensiones de la imagen en píxeles

   Las fotos de máquinas de esta portada provienen de Wikimedia Commons con
   licencias Creative Commons que permiten el uso comercial con atribución.
   No reemplazarlas por imágenes del fabricante sin licencia.
   ========================================================================= */

window.SLIDE_INTERVAL = 3000;

window.SLIDES = [
  {
    src: 'assets/img/hero-excavadora.webp',
    alt: 'Excavadora DOOSAN DX140LC',
    kicker: 'Maquinaria DOOSAN',
    title: 'Excavadora DX140LC',
    text: 'Repuestos para tu flota, con despacho a todo el Perú',
    fit: 'contain',
    w: 1100, h: 777
  },
  {
    src: 'assets/img/portada/doosan-dx225lca.webp',
    alt: 'Excavadora DOOSAN DX225LCA en obra',
    kicker: 'Maquinaria DOOSAN',
    title: 'Excavadora DX225LCA',
    text: 'Motor, hidráulica, eléctrico y tren de rodaje',
    fit: 'cover',
    credit: { author: 'CEphoto, Uwe Aranas', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/', source: 'https://commons.wikimedia.org/wiki/File:Singapore_Doosan-DX-225-LCA-excavator-01.jpg' },
    w: 1400, h: 856
  },
  {
    src: 'assets/img/portada/doosan-dx380lc.webp',
    alt: 'Excavadora DOOSAN DX380LC trabajando bajo un puente',
    kicker: 'Maquinaria DOOSAN',
    title: 'Excavadora DX380LC',
    text: 'Confirmamos cada repuesto con el número de serie de tu equipo',
    fit: 'cover',
    credit: { author: 'JIP', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/', source: 'https://commons.wikimedia.org/wiki/File:Doosan_excavator_in_front_of_Hakaniemi_bridge.jpg' },
    w: 1400, h: 1050
  },
  {
    src: 'assets/img/portada/doosan-dx85r-3.webp',
    alt: 'Miniexcavadora DOOSAN DX85R-3',
    kicker: 'Maquinaria DOOSAN',
    title: 'Miniexcavadora DX85R-3',
    text: 'Atención especializada para equipos de todos los tamaños',
    fit: 'cover',
    credit: { author: 'Mathieu Kappler', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/', source: 'https://commons.wikimedia.org/wiki/File:Doosan_DX85R-3_excavator_in_Remiremont,_France_-_2022-05-03_-_01.jpg' },
    w: 1400, h: 934
  },
  {
    src: 'assets/img/productos/valvula-65041010026.webp',
    alt: 'Válvula de admisión, código 65.04101-0026',
    kicker: 'Repuesto destacado · Motor',
    title: 'Válvula de admisión',
    text: 'Código 65.04101-0026 · Aplicación registrada DOOSAN DX300',
    href: '#/repuesto/valvula-de-admision-65-04101-0026',
    fit: 'contain',
    w: 1200, h: 800
  },
  {
    src: 'assets/img/productos/interruptor-24v.webp',
    alt: 'Interruptor de motor 24V',
    kicker: 'Repuesto destacado · Sistema eléctrico',
    title: 'Interruptor de motor 24V',
    text: 'Compatibilidad por confirmar con el número de serie',
    href: '#/repuesto/interruptor-de-motor-24v',
    fit: 'contain',
    w: 1200, h: 800
  }
];
