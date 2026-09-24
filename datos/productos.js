/* =========================================================================
   DOGEPARTS SAC · Catálogo de repuestos
   -------------------------------------------------------------------------
   Para añadir un repuesto: copia uno de los bloques de PRODUCTS y cambia los
   datos. Las fotografías van en assets/img/productos/ (una versión ligera
   para el catálogo y, si se quiere zoom, otra grande con el sufijo -grande).

   Campos
     slug          identificador para la URL: minúsculas, números y guiones
     name          nombre del repuesto
     code          código; '' si no se tiene
     category      una de las líneas de CATEGORIES
     published     true = visible en la web · false = oculto
     featured      true = se marca como "Destacado"
     availability  'consultar' | 'stock' | 'pedido'
     price         null = "Consultar precio" · número = precio en soles
     compat        aplicaciones CONFIRMADAS: [{machine:'DOOSAN DX300', engine:'DE08TIS'}]
                   si no está confirmada, dejar [] y compatPending:true
     specs         datos técnicos sueltos: [{k:'Tensión', v:'24V'}]
     images        hasta 8 fotos: {src, full, alt, w, h}  (full es opcional)

   Nunca registrar una compatibilidad que no esté confirmada.
   ========================================================================= */

window.CATEGORIES = [
  'Motor', 'Sistema hidráulico', 'Sistema eléctrico', 'Transmisión', 'Tren de rodaje',
  'Frenos', 'Filtros', 'Cabina y controles', 'Implementos', 'Otros repuestos'
];

window.PRODUCTS = [
  {
    slug: 'valvula-de-admision-65-04101-0026',
    name: 'Válvula de admisión',
    code: '65.04101-0026',
    category: 'Motor',
    published: true,
    featured: true,
    availability: 'consultar',
    price: null,
    stock: null,
    compat: [{ machine: 'DOOSAN DX300', engine: '1146 · DE08TIS' }],
    compatPending: false,
    specs: [],
    images: [{
      src : 'assets/img/productos/valvula-65041010026.webp',
      full: 'assets/img/productos/valvula-65041010026-grande.webp',
      alt : 'Válvula de admisión, código 65.04101-0026',
      w: 1200, h: 800
    }]
  },
  {
    slug: 'interruptor-de-motor-24v',
    name: 'Interruptor de motor 24V',
    code: '',
    category: 'Sistema eléctrico',
    published: true,
    featured: false,
    availability: 'consultar',
    price: null,
    stock: null,
    compat: [],
    compatPending: true,
    specs: [{ k: 'Tensión', v: '24V' }],
    images: [{
      src : 'assets/img/productos/interruptor-24v.webp',
      full: 'assets/img/productos/interruptor-24v-grande.webp',
      alt : 'Interruptor de motor 24V',
      w: 1200, h: 800
    }]
  }
];
