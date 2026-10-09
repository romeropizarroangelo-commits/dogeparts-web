/* =========================================================================
   DOGEPARTS SAC · Catálogo de repuestos (70 repuestos entregados por DOGEPARTS)
   -------------------------------------------------------------------------
   Para añadir un repuesto: copia un bloque de PRODUCTS y cambia los datos.
   La tarjeta grande (1080x1350) va en assets/img/repuestos/ y la miniatura
   (540x675) en assets/img/repuestos/thumbs/, con el mismo nombre de archivo.

   Campos
     item          número correlativo del catálogo
     slug          identificador de la URL: minúsculas, números y guiones (único)
     name          nombre del repuesto
     code          código; '' si no se tiene
     brand         marca del repuesto (DOOSAN, HYUNDAI, VALEO…)
     description   descripción tal como figura en el catálogo
     models        modelos / aplicación tal como figura en el catálogo
     machineType   tipo de máquina (Excavadora, Volquete articulado…)
     presentation  Juego, Unidad o '' si no aplica
     category      una de las líneas de CATEGORIES
     published     true = visible · false = oculto
     featured      true = se marca como "Destacado"
     availability  'consultar' | 'stock' | 'pedido'
     price         null = "Consultar precio" · número = precio en soles
     compat        aplicaciones confirmadas: [{machine:'DOOSAN DX300', engine:'DE08TIS'}]
     specs         datos técnicos sueltos: [{k:'Tensión', v:'24V'}]
     images        hasta 8 fotos: {src (miniatura), full (grande), alt, w, h}

   Nunca registrar en compat una compatibilidad que no esté confirmada.
   ========================================================================= */

window.CATEGORIES = ["Motor", "Culata y válvulas", "Refrigeración", "Empaques", "Eléctrico y control", "Lubricación", "Hidráulico", "Embrague"];

window.PRODUCTS = [
  {
    item: 1, slug: "empaque-de-motor-65-99601-8024",
    name: "Empaque de motor", code: "65.99601-8024", brand: "DOOSAN",
    description: "EMPAQUE DE MOTOR DB58TIS DOOSAN",
    models: "DB58TIS / JUEGO", machineType: "Excavadora", presentation: "Juego",
    category: "Empaques",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/01-empaque-de-motor-db58tis-juego.webp", "full": "assets/img/repuestos/01-empaque-de-motor-db58tis-juego.webp", "alt": "Empaque de motor 65.99601-8024 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 2, slug: "empaque-de-motor-65-00900-1146s",
    name: "Empaque de motor", code: "65.00900-1146S", brand: "DOOSAN",
    description: "EMPAQUE DE MOTOR DE08TIS DX300 METÁLICO DOOSAN",
    models: "DE08TIS / DX300 / METÁLICO", machineType: "Excavadora", presentation: "Juego",
    category: "Empaques",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/02-empaque-de-motor-de08tis-dx300-metalico.webp", "full": "assets/img/repuestos/02-empaque-de-motor-de08tis-dx300-metalico.webp", "alt": "Empaque de motor 65.00900-1146S · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 3, slug: "empaque-de-motor-65-00900-de12tis",
    name: "Empaque de motor", code: "65.00900-DE12TIS", brand: "DOOSAN",
    description: "EMPAQUE DE MOTOR DX340 DE12TIS DOOSAN",
    models: "DX340 / DE12TIS", machineType: "Excavadora", presentation: "",
    category: "Empaques",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/03-empaque-de-motor-dx340-de12tis.webp", "full": "assets/img/repuestos/03-empaque-de-motor-dx340-de12tis.webp", "alt": "Empaque de motor 65.00900-DE12TIS · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 4, slug: "empaque-de-motor-65-99601-8059",
    name: "Empaque de motor", code: "65.99601-8059", brand: "DOOSAN",
    description: "EMPAQUE DE MOTOR PU222LE 12 CIL. DOOSAN",
    models: "PU222LE / 12 CIL", machineType: "Excavadora", presentation: "",
    category: "Empaques",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/04-empaque-de-motor-pu222le-12-cil.webp", "full": "assets/img/repuestos/04-empaque-de-motor-pu222le-12-cil.webp", "alt": "Empaque de motor 65.99601-8059 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 5, slug: "anillos-std-65-02503-8236s",
    name: "Anillos STD", code: "65.02503-8236S", brand: "DOOSAN",
    description: "ANILLOS STD 2366 DE12TIS DOOSAN",
    models: "2366 / DE12TIS", machineType: "Excavadora", presentation: "Juego",
    category: "Motor",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/05-anillos-std-2366-de12tis.webp", "full": "assets/img/repuestos/05-anillos-std-2366-de12tis.webp", "alt": "Anillos STD 65.02503-8236S · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 6, slug: "anillos-std-65-02503-8146y",
    name: "Anillos STD", code: "65.02503-8146Y", brand: "DOOSAN",
    description: "ANILLOS STD D1146T DE08TIS DOOSAN",
    models: "D1146T / DE08TIS", machineType: "Excavadora", presentation: "Juego",
    category: "Motor",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/06-anillos-std-d1146t-de08tis.webp", "full": "assets/img/repuestos/06-anillos-std-d1146t-de08tis.webp", "alt": "Anillos STD 65.02503-8146Y · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 7, slug: "anillos-std-65-02503-8058y",
    name: "Anillos STD", code: "65.02503-8058Y", brand: "DOOSAN",
    description: "ANILLOS STD DB58TIS DOOSAN",
    models: "DB58TIS", machineType: "Excavadora", presentation: "Juego",
    category: "Motor",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/07-anillos-std-db58tis.webp", "full": "assets/img/repuestos/07-anillos-std-db58tis.webp", "alt": "Anillos STD 65.02503-8058Y · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 8, slug: "piston-std-65-02501-0416s",
    name: "Pistón STD", code: "65.02501-0416S", brand: "DOOSAN",
    description: "PISTÓN STD DB58 DX255 NEW DOOSAN",
    models: "DB58 / DX255", machineType: "Excavadora", presentation: "Juego",
    category: "Motor",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/08-piston-std-db58-dx255.webp", "full": "assets/img/repuestos/08-piston-std-db58-dx255.webp", "alt": "Pistón STD 65.02501-0416S · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 9, slug: "camiseta-acabada-65-01201-0050",
    name: "Camiseta acabada", code: "65.01201-0050", brand: "DOOSAN",
    description: "CAMISETA ACABADA 1146 DE08TIS DOOSAN",
    models: "1146 / DE08TIS", machineType: "Excavadora", presentation: "Juego",
    category: "Motor",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/09-camiseta-acabada-1146-de08tis.webp", "full": "assets/img/repuestos/09-camiseta-acabada-1146-de08tis.webp", "alt": "Camiseta acabada 65.01201-0050 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 10, slug: "camiseta-acabada-65-01201-0072",
    name: "Camiseta acabada", code: "65.01201-0072", brand: "DOOSAN",
    description: "CAMISETA ACABADA 2366 DE12 133MM DOOSAN",
    models: "2366 / DE12 / 133 MM", machineType: "Excavadora", presentation: "Juego",
    category: "Motor",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/10-camiseta-acabada-2366-de12-133-mm.webp", "full": "assets/img/repuestos/10-camiseta-acabada-2366-de12-133-mm.webp", "alt": "Camiseta acabada 65.01201-0072 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 11, slug: "camiseta-acabada-65-01201-0068s",
    name: "Camiseta acabada", code: "65.01201-0068S", brand: "DOOSAN",
    description: "CAMISETA ACABADA DB58TIS DOOSAN",
    models: "DB58TIS", machineType: "Excavadora", presentation: "Juego",
    category: "Motor",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/11-camiseta-acabada-db58tis.webp", "full": "assets/img/repuestos/11-camiseta-acabada-db58tis.webp", "alt": "Camiseta acabada 65.01201-0068S · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 12, slug: "asiento-de-valvula-65-03203-1028-n",
    name: "Asiento de válvula", code: "65.03203-1028-N", brand: "DOOSAN",
    description: "ASIENTO DE VÁLVULA 1146 DE08 ADMISIÓN DOOSAN",
    models: "1146 / DE08 / ADMISIÓN", machineType: "Excavadora", presentation: "Unidad",
    category: "Culata y válvulas",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/12-asiento-de-valvula-1146-de08-admision.webp", "full": "assets/img/repuestos/12-asiento-de-valvula-1146-de08-admision.webp", "alt": "Asiento de válvula 65.03203-1028-N · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 13, slug: "asiento-de-valvula-65-03203-1029-n",
    name: "Asiento de válvula", code: "65.03203-1029-N", brand: "DOOSAN",
    description: "ASIENTO DE VÁLVULA 1146 DE08 ESCAPE DOOSAN",
    models: "1146 / DE08 / ESCAPE", machineType: "Excavadora", presentation: "Unidad",
    category: "Culata y válvulas",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/13-asiento-de-valvula-1146-de08-escape.webp", "full": "assets/img/repuestos/13-asiento-de-valvula-1146-de08-escape.webp", "alt": "Asiento de válvula 65.03203-1029-N · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 14, slug: "asiento-de-valvula-65-03203-1053",
    name: "Asiento de válvula", code: "65.03203-1053", brand: "DOOSAN",
    description: "ASIENTO DE VÁLVULA ADMISIÓN DB58TIS DOOSAN",
    models: "DB58TIS / ADMISIÓN", machineType: "Excavadora", presentation: "Juego",
    category: "Culata y válvulas",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/14-asiento-de-valvula-db58tis-admision.webp", "full": "assets/img/repuestos/14-asiento-de-valvula-db58tis-admision.webp", "alt": "Asiento de válvula 65.03203-1053 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 15, slug: "asiento-de-valvula-65-03203-1054",
    name: "Asiento de válvula", code: "65.03203-1054", brand: "DOOSAN",
    description: "ASIENTO DE VÁLVULA ESCAPE DB58TIS DOOSAN",
    models: "DB58TIS / ESCAPE", machineType: "Excavadora", presentation: "Juego",
    category: "Culata y válvulas",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/15-asiento-de-valvula-db58tis-escape.webp", "full": "assets/img/repuestos/15-asiento-de-valvula-db58tis-escape.webp", "alt": "Asiento de válvula 65.03203-1054 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 16, slug: "asiento-de-valvula-65-03203-1043",
    name: "Asiento de válvula", code: "65.03203-1043", brand: "DOOSAN",
    description: "ASIENTO DE VÁLVULA 2366 DE12 ADMISIÓN DOOSAN",
    models: "2366 / DE12 / ADMISIÓN", machineType: "Excavadora", presentation: "Unidad",
    category: "Culata y válvulas",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/16-asiento-de-valvula-2366-de12-admision.webp", "full": "assets/img/repuestos/16-asiento-de-valvula-2366-de12-admision.webp", "alt": "Asiento de válvula 65.03203-1043 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 17, slug: "asiento-de-valvula-65-03203-1044",
    name: "Asiento de válvula", code: "65.03203-1044", brand: "DOOSAN",
    description: "ASIENTO DE VÁLVULA 2366 DE12 ESCAPE DOOSAN",
    models: "2366 / DE12 / ESCAPE", machineType: "Excavadora", presentation: "Unidad",
    category: "Culata y válvulas",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/17-asiento-de-valvula-2366-de12-escape.webp", "full": "assets/img/repuestos/17-asiento-de-valvula-2366-de12-escape.webp", "alt": "Asiento de válvula 65.03203-1044 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 18, slug: "metal-de-levas-65-04410-0016",
    name: "Metal de levas", code: "65.04410-0016", brand: "DOOSAN",
    description: "METAL DE LEVAS 2366 DE12 DX340 DOOSAN",
    models: "2366 / DE12 / DX340", machineType: "Excavadora", presentation: "Juego",
    category: "Motor",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/18-metal-de-levas-2366-de12-dx340.webp", "full": "assets/img/repuestos/18-metal-de-levas-2366-de12-dx340.webp", "alt": "Metal de levas 65.04410-0016 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 19, slug: "bomba-de-agua-65-06500-6402",
    name: "Bomba de agua", code: "65.06500-6402", brand: "DOOSAN",
    description: "BOMBA DE AGUA DB58T DX225 DOOSAN",
    models: "DB58T / DX225", machineType: "Excavadora", presentation: "",
    category: "Refrigeración",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/19-bomba-de-agua-db58t-dx225.webp", "full": "assets/img/repuestos/19-bomba-de-agua-db58t-dx225.webp", "alt": "Bomba de agua 65.06500-6402 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 20, slug: "bomba-de-agua-65-06500-6145",
    name: "Bomba de agua", code: "65.06500-6145", brand: "DOOSAN",
    description: "BOMBA DE AGUA DE08 DX300 DOOSAN",
    models: "DE08 / DX300", machineType: "Excavadora", presentation: "",
    category: "Refrigeración",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/20-bomba-de-agua-de08-dx300.webp", "full": "assets/img/repuestos/20-bomba-de-agua-de08-dx300.webp", "alt": "Bomba de agua 65.06500-6145 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 21, slug: "bomba-de-aceite-65-05100-6022",
    name: "Bomba de aceite", code: "65.05100-6022", brand: "DOOSAN",
    description: "BOMBA DE ACEITE 1146 DE08 DOOSAN",
    models: "1146 / DE08", machineType: "Excavadora", presentation: "",
    category: "Lubricación",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/21-bomba-de-aceite-1146-de08.webp", "full": "assets/img/repuestos/21-bomba-de-aceite-1146-de08.webp", "alt": "Bomba de aceite 65.05100-6022 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 22, slug: "bomba-de-aceite-400915-00011",
    name: "Bomba de aceite", code: "400915-00011", brand: "DOOSAN",
    description: "BOMBA DE ACEITE DB58TIS C/LARGO DOOSAN",
    models: "DB58TIS / C/LARGO", machineType: "Excavadora", presentation: "",
    category: "Lubricación",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/22-bomba-de-aceite-db58tis-c-largo.webp", "full": "assets/img/repuestos/22-bomba-de-aceite-db58tis-c-largo.webp", "alt": "Bomba de aceite 400915-00011 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 23, slug: "bomba-de-aceite-400915-00010",
    name: "Bomba de aceite", code: "400915-00010", brand: "DOOSAN",
    description: "BOMBA DE ACEITE DB58TIS C/CORTO DOOSAN",
    models: "DB58TIS / C/CORTO", machineType: "Excavadora", presentation: "",
    category: "Lubricación",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/23-bomba-de-aceite-db58tis-c-corto.webp", "full": "assets/img/repuestos/23-bomba-de-aceite-db58tis-c-corto.webp", "alt": "Bomba de aceite 400915-00010 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 24, slug: "valvula-de-admision-65-04101-0026",
    name: "Válvula de admisión", code: "65.04101-0026", brand: "DOOSAN",
    description: "VÁLVULA DE ADMISIÓN 1146 DE08TIS DOOSAN",
    models: "1146 / DE08TIS", machineType: "Excavadora", presentation: "Unidad",
    category: "Culata y válvulas",
    published: true, featured: true, availability: 'consultar', price: null, stock: null,
    compat: [{"machine": "DOOSAN DX300", "engine": "1146 · DE08TIS"}], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/24-valvula-de-admision-1146-de08tis.webp", "full": "assets/img/repuestos/24-valvula-de-admision-1146-de08tis.webp", "alt": "Válvula de admisión 65.04101-0026 · DOOSAN", "w": 540, "h": 675},
      {"src": "assets/img/productos/valvula-65041010026.webp", "full": "assets/img/productos/valvula-65041010026-grande.webp", "alt": "Válvula de admisión, código 65.04101-0026 (fotografía)", "w": 1200, "h": 800}
    ]
  },
  {
    item: 25, slug: "valvula-de-escape-65-04101-0027",
    name: "Válvula de escape", code: "65.04101-0027", brand: "DOOSAN",
    description: "VÁLVULA DE ESCAPE 1146 DE08TIS DOOSAN",
    models: "1146 / DE08TIS", machineType: "Excavadora", presentation: "Unidad",
    category: "Culata y válvulas",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/25-valvula-de-escape-1146-de08tis.webp", "full": "assets/img/repuestos/25-valvula-de-escape-1146-de08tis.webp", "alt": "Válvula de escape 65.04101-0027 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 26, slug: "guias-de-valvula-65-03201-1011",
    name: "Guías de válvula", code: "65 03201-1011", brand: "DOOSAN",
    description: "GUÍAS DE VÁLVULA 1146 DE08TIS X 12 PZAS DOOSAN",
    models: "1146 / DE08TIS / 12 PCS", machineType: "Excavadora", presentation: "Juego",
    category: "Culata y válvulas",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/26-guias-de-valvula-1146-de08tis-12-pcs.webp", "full": "assets/img/repuestos/26-guias-de-valvula-1146-de08tis-12-pcs.webp", "alt": "Guías de válvula 65 03201-1011 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 27, slug: "valvula-de-escape-65-04101-0025s",
    name: "Válvula de escape", code: "65.04101-0025S", brand: "DOOSAN",
    description: "VÁLVULA DE ESCAPE DB58TIS DX225 DOOSAN",
    models: "DB58TIS / DX225", machineType: "Excavadora", presentation: "Unidad",
    category: "Culata y válvulas",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/27-valvula-de-escape-db58tis-dx225.webp", "full": "assets/img/repuestos/27-valvula-de-escape-db58tis-dx225.webp", "alt": "Válvula de escape 65.04101-0025S · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 28, slug: "valvula-de-admision-65-04101-0047s",
    name: "Válvula de admisión", code: "65.04101-0047S", brand: "DOOSAN",
    description: "VÁLVULA DE ADMISIÓN DB58TIS DX225 DOOSAN",
    models: "DB58TIS / DX225", machineType: "Excavadora", presentation: "Unidad",
    category: "Culata y válvulas",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/28-valvula-de-admision-db58tis-dx225.webp", "full": "assets/img/repuestos/28-valvula-de-admision-db58tis-dx225.webp", "alt": "Válvula de admisión 65.04101-0047S · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 29, slug: "guias-de-valvula-65-03201-1013a",
    name: "Guías de válvula", code: "65.03201-1013A", brand: "DOOSAN",
    description: "GUÍAS DE VÁLVULA DB58TIS DX225 DOOSAN",
    models: "DB58TIS / DX225", machineType: "Excavadora", presentation: "Juego",
    category: "Culata y válvulas",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/29-guias-de-valvula-db58tis-dx225.webp", "full": "assets/img/repuestos/29-guias-de-valvula-db58tis-dx225.webp", "alt": "Guías de válvula 65.03201-1013A · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 30, slug: "valvula-de-admision-65-04101-0044",
    name: "Válvula de admisión", code: "65.04101-0044", brand: "DOOSAN",
    description: "VÁLVULA DE ADMISIÓN 2366 DX340 DE12 DOOSAN",
    models: "2366 / DE12 / DX340", machineType: "Excavadora", presentation: "Unidad",
    category: "Culata y válvulas",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/30-valvula-de-admision-2366-de12-dx340.webp", "full": "assets/img/repuestos/30-valvula-de-admision-2366-de12-dx340.webp", "alt": "Válvula de admisión 65.04101-0044 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 31, slug: "valvula-de-escape-65-04101-0043",
    name: "Válvula de escape", code: "65.04101-0043", brand: "DOOSAN",
    description: "VÁLVULA DE ESCAPE 2366 DX340 DE12 DOOSAN",
    models: "2366 / DE12 / DX340", machineType: "Excavadora", presentation: "Unidad",
    category: "Culata y válvulas",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/31-valvula-de-escape-2366-de12-dx340.webp", "full": "assets/img/repuestos/31-valvula-de-escape-2366-de12-dx340.webp", "alt": "Válvula de escape 65.04101-0043 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 32, slug: "guias-de-valvula-65-03201-1008s",
    name: "Guías de válvula", code: "65.03201-1008S", brand: "DOOSAN",
    description: "GUÍAS DE VÁLVULA 2366 DE12TIS DOOSAN",
    models: "2366 / DE12TIS", machineType: "Excavadora", presentation: "Juego",
    category: "Culata y válvulas",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/32-guias-de-valvula-2366-de12tis.webp", "full": "assets/img/repuestos/32-guias-de-valvula-2366-de12tis.webp", "alt": "Guías de válvula 65.03201-1008S · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 33, slug: "tubo-de-tobera-65-03205-0002s",
    name: "Tubo de tobera", code: "65.03205-0002S", brand: "DOOSAN",
    description: "TUBO DE TOBERA DE12TIS 2366 DOOSAN",
    models: "DE12TIS / 2366", machineType: "Excavadora", presentation: "Unidad",
    category: "Culata y válvulas",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/33-tubo-de-tobera-de12tis-2366.webp", "full": "assets/img/repuestos/33-tubo-de-tobera-de12tis-2366.webp", "alt": "Tubo de tobera 65.03205-0002S · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 34, slug: "termostato-de-motor-65-06402-0006",
    name: "Termostato de motor", code: "65.06402-0006", brand: "DOOSAN",
    description: "TERMOSTATO DX340 DE12TIS DOOSAN",
    models: "DE12TIS / DX340", machineType: "Excavadora", presentation: "",
    category: "Refrigeración",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/34-termostato-de-motor-de12tis-dx340.webp", "full": "assets/img/repuestos/34-termostato-de-motor-de12tis-dx340.webp", "alt": "Termostato de motor 65.06402-0006 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 35, slug: "termostato-de-motor-65-06402-5015",
    name: "Termostato de motor", code: "65.06402-5015", brand: "DOOSAN",
    description: "TERMOSTATO DB58TIS DX225 DOOSAN",
    models: "DB58TIS / DX225", machineType: "Excavadora", presentation: "",
    category: "Refrigeración",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/35-termostato-de-motor-db58tis-dx225.webp", "full": "assets/img/repuestos/35-termostato-de-motor-db58tis-dx225.webp", "alt": "Termostato de motor 65.06402-5015 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 36, slug: "piston-std-65-02501-0214",
    name: "Pistón STD", code: "65.02501-0214", brand: "DOOSAN",
    description: "PISTÓN STD DE08 DX300 C/ LUBRICACIÓN DOOSAN",
    models: "DE08 / DX300 / C/LUBRI", machineType: "Excavadora", presentation: "Juego",
    category: "Motor",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/36-piston-std-de08-dx300-c-lubri.webp", "full": "assets/img/repuestos/36-piston-std-de08-dx300-c-lubri.webp", "alt": "Pistón STD 65.02501-0214 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 37, slug: "brazo-de-biela-65-02401-6161",
    name: "Brazo de biela", code: "65.02401-6161", brand: "DOOSAN",
    description: "BRAZO DE BIELA DX225 DB58 DOOSAN",
    models: "DB58 / DX225", machineType: "Excavadora", presentation: "",
    category: "Motor",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/37-brazo-de-biela-db58-dx225.webp", "full": "assets/img/repuestos/37-brazo-de-biela-db58-dx225.webp", "alt": "Brazo de biela 65.02401-6161 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 38, slug: "piston-std-130602-00983",
    name: "Pistón STD", code: "130602-00983", brand: "DOOSAN",
    description: "PISTÓN STD DE12TIS P126TI HONGO DOOSAN",
    models: "DE12TIS / P126TI / HONGO", machineType: "Excavadora", presentation: "Juego",
    category: "Motor",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/38-piston-std-de12tis-p126ti-hongo.webp", "full": "assets/img/repuestos/38-piston-std-de12tis-p126ti-hongo.webp", "alt": "Pistón STD 130602-00983 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 39, slug: "tapa-de-enfriador-65-05604-0019b",
    name: "Tapa de enfriador", code: "65.05604-0019B", brand: "DOOSAN",
    description: "TAPA DE ENFRIADOR DE12 DX340 DOOSAN",
    models: "DE12 / DX340", machineType: "Excavadora", presentation: "",
    category: "Refrigeración",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/39-tapa-de-enfriador-de12-dx340.webp", "full": "assets/img/repuestos/39-tapa-de-enfriador-de12-dx340.webp", "alt": "Tapa de enfriador 65.05604-0019B · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 40, slug: "interruptor-de-motor-24v",
    name: "Interruptor de motor", code: "2523-9016", brand: "DOOSAN",
    description: "INTERRUPTOR DE MOTOR 24V DOOSAN",
    models: "24V", machineType: "Excavadora", presentation: "",
    category: "Eléctrico y control",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/40-interruptor-de-motor-24v.webp", "full": "assets/img/repuestos/40-interruptor-de-motor-24v.webp", "alt": "Interruptor de motor 2523-9016 · DOOSAN", "w": 540, "h": 675},
      {"src": "assets/img/productos/interruptor-24v.webp", "full": "assets/img/productos/interruptor-24v-grande.webp", "alt": "Interruptor de motor 24V (fotografía)", "w": 1200, "h": 800}
    ]
  },
  {
    item: 41, slug: "motor-de-acelerador-523-00006",
    name: "Motor de acelerador", code: "523-00006", brand: "DOOSAN",
    description: "MOTOR DE ACELERADOR CORTO 24V DOOSAN",
    models: "CORTO / 24V", machineType: "Excavadora", presentation: "",
    category: "Eléctrico y control",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/41-motor-de-acelerador-corto-24v.webp", "full": "assets/img/repuestos/41-motor-de-acelerador-corto-24v.webp", "alt": "Motor de acelerador 523-00006 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 42, slug: "motor-de-acelerador-523-00008",
    name: "Motor de acelerador", code: "523-00008", brand: "DOOSAN",
    description: "MOTOR DE ACELERADOR LARGO 24V DOOSAN",
    models: "LARGO / 24V", machineType: "Excavadora", presentation: "",
    category: "Eléctrico y control",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/42-motor-de-acelerador-largo-24v.webp", "full": "assets/img/repuestos/42-motor-de-acelerador-largo-24v.webp", "alt": "Motor de acelerador 523-00008 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 43, slug: "motor-de-acelerador-21en-32220",
    name: "Motor de acelerador", code: "21EN-32220", brand: "HYUNDAI",
    description: "MOTOR DE ACELERADOR ROBEX 24V",
    models: "ROBEX / 24V", machineType: "Excavadora", presentation: "",
    category: "Eléctrico y control",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/43-motor-de-acelerador-robex-24v.webp", "full": "assets/img/repuestos/43-motor-de-acelerador-robex-24v.webp", "alt": "Motor de acelerador 21EN-32220 · HYUNDAI", "w": 540, "h": 675}
    ]
  },
  {
    item: 44, slug: "dial-de-acelerador-2552-1004",
    name: "Dial de acelerador", code: "2552-1004", brand: "DOOSAN",
    description: "DIAL DE ACELERADOR DOOSAN",
    models: "EXCAVADORA", machineType: "Excavadora", presentation: "",
    category: "Eléctrico y control",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/44-dial-de-acelerador-excavadora.webp", "full": "assets/img/repuestos/44-dial-de-acelerador-excavadora.webp", "alt": "Dial de acelerador 2552-1004 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 45, slug: "monitor-de-cabina-300426-00049a",
    name: "Monitor de cabina", code: "300426-00049A", brand: "DOOSAN",
    description: "MONITOR DX300 DX340 DOOSAN",
    models: "DX300 / DX340", machineType: "Excavadora", presentation: "",
    category: "Eléctrico y control",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/45-monitor-de-cabina-dx300-dx340.webp", "full": "assets/img/repuestos/45-monitor-de-cabina-dx300-dx340.webp", "alt": "Monitor de cabina 300426-00049A · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 46, slug: "valvula-de-joystick-k9006480",
    name: "Válvula de joystick", code: "K9006480", brand: "DOOSAN",
    description: "VÁLVULA DE JOYSTICK HYUNDAI DOOSAN",
    models: "HYUNDAI", machineType: "Excavadora", presentation: "",
    category: "Hidráulico",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/46-valvula-de-joystick-hyundai.webp", "full": "assets/img/repuestos/46-valvula-de-joystick-hyundai.webp", "alt": "Válvula de joystick K9006480 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 47, slug: "valvula-de-pedal-k9006884",
    name: "Válvula de pedal", code: "K9006884", brand: "DOOSAN",
    description: "VÁLVULA DE PEDAL HYUNDAI DOOSAN",
    models: "HYUNDAI", machineType: "Excavadora", presentation: "",
    category: "Hidráulico",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/47-valvula-de-pedal-hyundai.webp", "full": "assets/img/repuestos/47-valvula-de-pedal-hyundai.webp", "alt": "Válvula de pedal K9006884 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 48, slug: "base-de-termostato-65-06401-6039",
    name: "Base de termostato", code: "65.06401-6039", brand: "DOOSAN",
    description: "BASE DE TERMOSTATO COMPLETA DX300 DE08 DOOSAN",
    models: "DE08 / DX300", machineType: "Excavadora", presentation: "",
    category: "Refrigeración",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/48-base-de-termostato-de08-dx300.webp", "full": "assets/img/repuestos/48-base-de-termostato-de08-dx300.webp", "alt": "Base de termostato 65.06401-6039 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 49, slug: "metal-de-levas-65-04410-0006s-7s",
    name: "Metal de levas", code: "65.04410-0006S/7S", brand: "DOOSAN",
    description: "METAL DE LEVAS DX225 DB58TIS DOOSAN",
    models: "DB58TIS / DX225", machineType: "Excavadora", presentation: "Juego",
    category: "Motor",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/49-metal-de-levas-db58tis-dx225.webp", "full": "assets/img/repuestos/49-metal-de-levas-db58tis-dx225.webp", "alt": "Metal de levas 65.04410-0006S/7S · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 50, slug: "metal-de-levas-65-04410-0078s-79s",
    name: "Metal de levas", code: "65.04410-0078S/79S", brand: "DOOSAN",
    description: "METAL DE LEVAS PU158TI DV15 DOOSAN",
    models: "PU158TI / DV15", machineType: "Volquete articulado", presentation: "Juego",
    category: "Motor",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/50-metal-de-levas-pu158ti-dv15.webp", "full": "assets/img/repuestos/50-metal-de-levas-pu158ti-dv15.webp", "alt": "Metal de levas 65.04410-0078S/79S · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 51, slug: "reten-de-ciguenal-65-01510-0037s",
    name: "Retén de cigüeñal", code: "65.01510-0037S", brand: "DOOSAN",
    description: "RETÉN DE CIGÜEÑAL POSTERIOR DE08 DX300 METAL DOOSAN",
    models: "POSTERIOR / DX300", machineType: "Excavadora", presentation: "",
    category: "Motor",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/51-reten-de-ciguenal-posterior-dx300.webp", "full": "assets/img/repuestos/51-reten-de-ciguenal-posterior-dx300.webp", "alt": "Retén de cigüeñal 65.01510-0037S · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 52, slug: "reten-de-ciguenal-65-01510-0101",
    name: "Retén de cigüeñal", code: "65.01510-0101", brand: "DOOSAN",
    description: "RETÉN DE CIGÜEÑAL POSTERIOR DB58 DX225 METAL DOOSAN",
    models: "POSTERIOR / DX225", machineType: "Excavadora", presentation: "",
    category: "Motor",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/52-reten-de-ciguenal-posterior-dx225.webp", "full": "assets/img/repuestos/52-reten-de-ciguenal-posterior-dx225.webp", "alt": "Retén de cigüeñal 65.01510-0101 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 53, slug: "bomba-de-agua-400921-00532",
    name: "Bomba de agua", code: "400921-00532", brand: "DOOSAN",
    description: "BOMBA DE AGUA DX12 DX340LCA-K DOOSAN",
    models: "DX12 / DX340LCA-K", machineType: "Excavadora", presentation: "",
    category: "Refrigeración",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/53-bomba-de-agua-dx12-dx340lca-k.webp", "full": "assets/img/repuestos/53-bomba-de-agua-dx12-dx340lca-k.webp", "alt": "Bomba de agua 400921-00532 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 54, slug: "bomba-de-agua-65-06500-6183",
    name: "Bomba de agua", code: "65.06500-6183", brand: "DOOSAN",
    description: "BOMBA DE AGUA PU222 GENERADOR DOOSAN",
    models: "PU222 / GENERADOR", machineType: "Excavadora", presentation: "",
    category: "Refrigeración",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/54-bomba-de-agua-pu222-generador.webp", "full": "assets/img/repuestos/54-bomba-de-agua-pu222-generador.webp", "alt": "Bomba de agua 65.06500-6183 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 55, slug: "camiseta-acabada-65-01201-00046",
    name: "Camiseta acabada", code: "65.01201-00046", brand: "DOOSAN",
    description: "CAMISETA ACABADA DE12TIS 134MM DOOSAN",
    models: "DE12TIS / 134 MM", machineType: "Excavadora", presentation: "Juego",
    category: "Motor",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/55-camiseta-acabada-de12tis-134-mm.webp", "full": "assets/img/repuestos/55-camiseta-acabada-de12tis-134-mm.webp", "alt": "Camiseta acabada 65.01201-00046 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 56, slug: "bomba-de-agua-400921-00052",
    name: "Bomba de agua", code: "400921-00052", brand: "DOOSAN",
    description: "BOMBA DE AGUA DV15 8 CIL. NOVUS DOOSAN",
    models: "DV15 / NOVUS", machineType: "Volquete articulado", presentation: "",
    category: "Refrigeración",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/56-bomba-de-agua-dv15-novus.webp", "full": "assets/img/repuestos/56-bomba-de-agua-dv15-novus.webp", "alt": "Bomba de agua 400921-00052 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 57, slug: "piston-std-65-02501-0708",
    name: "Pistón STD", code: "65.02501-0708", brand: "DOOSAN",
    description: "PISTÓN STD DV15T 2848 DOOSAN",
    models: "DV15T / 2848", machineType: "Volquete articulado", presentation: "Unidad",
    category: "Motor",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/57-piston-std-dv15t-2848.webp", "full": "assets/img/repuestos/57-piston-std-dv15t-2848.webp", "alt": "Pistón STD 65.02501-0708 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 58, slug: "bomba-de-aceite-65-05100-6188",
    name: "Bomba de aceite", code: "65.05100-6188", brand: "DOOSAN",
    description: "BOMBA DE ACEITE DV15 8 CIL. NOVUS DOOSAN",
    models: "DV15 / NOVUS", machineType: "Volquete articulado", presentation: "",
    category: "Lubricación",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/58-bomba-de-aceite-dv15-novus.webp", "full": "assets/img/repuestos/58-bomba-de-aceite-dv15-novus.webp", "alt": "Bomba de aceite 65.05100-6188 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 59, slug: "empaque-de-culata-65-03901-0058a",
    name: "Empaque de culata", code: "65.03901-0058A", brand: "DOOSAN",
    description: "EMPAQUE DE CULATA 1146 DE08 ASBESTO DOOSAN",
    models: "DE08 / ASBESTO", machineType: "Excavadora", presentation: "",
    category: "Empaques",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/59-empaque-de-culata-de08-asbesto.webp", "full": "assets/img/repuestos/59-empaque-de-culata-de08-asbesto.webp", "alt": "Empaque de culata 65.03901-0058A · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 60, slug: "empaque-de-culata-400603-00119",
    name: "Empaque de culata", code: "400603-00119", brand: "DOOSAN",
    description: "EMPAQUE DE CULATA DX300 DE08 METÁLICO DOOSAN",
    models: "DX300 / METÁLICO", machineType: "Excavadora", presentation: "",
    category: "Empaques",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/60-empaque-de-culata-dx300-metalico.webp", "full": "assets/img/repuestos/60-empaque-de-culata-dx300-metalico.webp", "alt": "Empaque de culata 400603-00119 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 61, slug: "empaque-de-culata-65-03901-0049",
    name: "Empaque de culata", code: "65.03901-0049", brand: "DOOSAN",
    description: "EMPAQUE DE CULATA 2366 IZQ-DER DOOSAN",
    models: "2366 / IZQ-DER", machineType: "Excavadora", presentation: "",
    category: "Empaques",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/61-empaque-de-culata-2366-izq-der.webp", "full": "assets/img/repuestos/61-empaque-de-culata-2366-izq-der.webp", "alt": "Empaque de culata 65.03901-0049 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 62, slug: "empaque-de-culata-65-03901-0075-76",
    name: "Empaque de culata", code: "65.03901-0075/76", brand: "DOOSAN",
    description: "EMPAQUE DE CULATA DX340 DE12 IZQ-DER DOOSAN",
    models: "DE12 / DX340 / IZQ-DER", machineType: "Excavadora", presentation: "",
    category: "Empaques",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/62-empaque-de-culata-de12-dx340-izq-der.webp", "full": "assets/img/repuestos/62-empaque-de-culata-de12-dx340-izq-der.webp", "alt": "Empaque de culata 65.03901-0075/76 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 63, slug: "arrancador-de-motor-36100-83010",
    name: "Arrancador de motor", code: "36100-83010", brand: "HYUNDAI",
    description: "ARRANCADOR D6AB ROBEX R380 KOREA",
    models: "D6AB / ROBEX R380", machineType: "Excavadora", presentation: "",
    category: "Eléctrico y control",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/63-arrancador-de-motor-d6ab-robex-r380.webp", "full": "assets/img/repuestos/63-arrancador-de-motor-d6ab-robex-r380.webp", "alt": "Arrancador de motor 36100-83010 · HYUNDAI", "w": 540, "h": 675}
    ]
  },
  {
    item: 64, slug: "collarin-de-embrague-prb-204",
    name: "Collarín de embrague", code: "PRB-204", brand: "VALEO",
    description: "COLLARÍN DE EMBRAGUE COMPLETO D6GA VALEO",
    models: "D6GA / COMPLETO", machineType: "Volquete articulado", presentation: "",
    category: "Embrague",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/64-collarin-de-embrague-d6ga-completo.webp", "full": "assets/img/repuestos/64-collarin-de-embrague-d6ga-completo.webp", "alt": "Collarín de embrague PRB-204 · VALEO", "w": 540, "h": 675}
    ]
  },
  {
    item: 65, slug: "filtro-de-aceite-26325-83910",
    name: "Filtro de aceite", code: "26325-83910", brand: "HYUNDAI",
    description: "FILTRO DE ACEITE KIT ROBEX R380 GENUINE",
    models: "KIT / ROBEX R380", machineType: "Excavadora", presentation: "",
    category: "Lubricación",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/65-filtro-de-aceite-kit-robex-r380.webp", "full": "assets/img/repuestos/65-filtro-de-aceite-kit-robex-r380.webp", "alt": "Filtro de aceite 26325-83910 · HYUNDAI", "w": 540, "h": 675}
    ]
  },
  {
    item: 66, slug: "soporte-de-motor-161-00551",
    name: "Soporte de motor", code: "161-00551", brand: "DOOSAN",
    description: "SOPORTE DE MOTOR DX225 DX300 DX340 DOOSAN",
    models: "DX225 / 300 / 340", machineType: "Excavadora", presentation: "",
    category: "Motor",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/66-soporte-de-motor-dx225-300-340.webp", "full": "assets/img/repuestos/66-soporte-de-motor-dx225-300-340.webp", "alt": "Soporte de motor 161-00551 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 67, slug: "bobina-de-valvula-519-00001",
    name: "Bobina de válvula", code: "519-00001", brand: "DOOSAN",
    description: "BOBINA DE VÁLVULA SOLENOIDE 24V DOOSAN",
    models: "SOLENOIDE / 24V", machineType: "Excavadora", presentation: "",
    category: "Eléctrico y control",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/67-bobina-de-valvula-solenoide-24v.webp", "full": "assets/img/repuestos/67-bobina-de-valvula-solenoide-24v.webp", "alt": "Bobina de válvula 519-00001 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 68, slug: "separador-de-bancada-65-01150-6008",
    name: "Separador de bancada", code: "65.01150-6008", brand: "DOOSAN",
    description: "SEPARADOR DE BANCADA STD DB58 DX225 DOOSAN",
    models: "STD / DB58 / DX225", machineType: "Excavadora", presentation: "",
    category: "Motor",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/68-separador-de-bancada-std-db58-dx225.webp", "full": "assets/img/repuestos/68-separador-de-bancada-std-db58-dx225.webp", "alt": "Separador de bancada 65.01150-6008 · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 69, slug: "chaqueta-de-inyector-65-03205-0006b",
    name: "Chaqueta de inyector", code: "65.03205-0006B", brand: "DOOSAN",
    description: "CHAQUETA DE INYECTOR DX225 DL06 DX340LCA-K DX12 DOOSAN",
    models: "DX225 / DL06 / DX340LCA-K / DX12", machineType: "Excavadora", presentation: "",
    category: "Culata y válvulas",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/69-chaqueta-de-inyector-dx225-dx340.webp", "full": "assets/img/repuestos/69-chaqueta-de-inyector-dx225-dx340.webp", "alt": "Chaqueta de inyector 65.03205-0006B · DOOSAN", "w": 540, "h": 675}
    ]
  },
  {
    item: 70, slug: "anillos-std-65-02503-8255s",
    name: "Anillos STD", code: "65.02503-8255S", brand: "DOOSAN",
    description: "ANILLOS STD 2848 DV15T DOOSAN",
    models: "DV15T / 2848", machineType: "Volquete articulado", presentation: "Juego",
    category: "Motor",
    published: true, featured: false, availability: 'consultar', price: null, stock: null,
    compat: [], specs: [],
    images: [
      {"src": "assets/img/repuestos/thumbs/70-anillos-std-dv15t-2848.webp", "full": "assets/img/repuestos/70-anillos-std-dv15t-2848.webp", "alt": "Anillos STD 65.02503-8255S · DOOSAN", "w": 540, "h": 675}
    ]
  }
];
