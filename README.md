# DOGEPARTS SAC · Repuestos Genuinos

Web comercial de DOGEPARTS SAC: repuestos para maquinaria pesada DOOSAN, con
catálogo buscable, fichas por repuesto, cotización por WhatsApp y formulario de
solicitud. Sitio estático: **no necesita servidor, base de datos, ni instalación**.
Se abre con doble clic en `index.html` y se publica subiendo la carpeta tal cual.

## Estructura

```
index.html                 la página
datos/sitio.js             datos comerciales (WhatsApp, teléfono, correo, dirección, horario, redes)
datos/productos.js         catálogo: líneas (CATEGORIES) y repuestos (PRODUCTS)
assets/css/styles.css      estilos
assets/js/app.js           lógica (búsqueda, filtros, fichas, formulario, efectos)
assets/img/                imágenes optimizadas que usa la web (WebP)
assets/img/productos/      fotos de repuestos: ligera para el catálogo y -grande para el zoom
originales/                fotografías y logo originales, sin tocar
tests/                     batería de pruebas en navegador real (npm test)
```

## Cómo se administra

Todo lo que cambia con el negocio está en **dos archivos** de la carpeta `datos/`.
Se editan con cualquier editor de texto; no hay que tocar nada más.

### Datos comerciales — `datos/sitio.js`

```js
whatsapp : '51937419437',   // solo dígitos con código de país
phone    : '+51 937 419 437',
email    : 'ventas@dogeparts.pe',
address  : 'Av. Nicolás Arriola 1419, La Victoria, Lima',
hours    : '9:00 a. m. – 6:00 p. m.',
mapUrl   : '',              // vacío = se genera desde la dirección
instagram: '',
facebook : ''
```

Regla: **lo que esté vacío no aparece en la web**. Ni un hueco, ni un dato
inventado. Si `whatsapp` estuviera vacío, todos los botones de cotizar llevarían
al formulario interno en vez de a WhatsApp.

### Repuestos — `datos/productos.js`

Copia uno de los bloques de `PRODUCTS` y cambia los datos. Los campos están
explicados al principio del archivo. Las fotos van en `assets/img/productos/`.

Reglas del catálogo, que la web ya aplica sola:

- Sin precio (`price: null`) muestra **"Consultar precio"**.
- Solo se muestran las compatibilidades registradas en `compat`. Si no está
  confirmada, se deja `compat: []` y la ficha dice "pendiente de confirmar".
- Toda ficha avisa: *"Confirma la aplicación con el número de serie de tu equipo antes de comprar."*
- "Productos similares" solo relaciona repuestos de la misma línea o con la
  misma máquina registrada; nunca infiere relaciones técnicas.
- El catálogo se pagina solo a partir de 24 repuestos publicados.

### Mensaje de WhatsApp

Cada botón de cotizar genera exactamente:

> Hola, deseo cotizar el repuesto *[nombre]*, código *[código]*. ¿Podrían confirmarme precio y disponibilidad?

Si el repuesto no tiene código, se omite esa parte sin dejar comas sueltas.

## Publicar

Es una carpeta estática. Funciona en GitHub Pages, Netlify, Vercel, Cloudflare
Pages o cualquier hosting con solo subir los archivos. No hay paso de compilación.

Cuando exista el dominio definitivo, ponerlo en `siteUrl` dentro de
`datos/sitio.js` (por ejemplo `'https://dogeparts.pe'`): con eso las etiquetas
`canonical` y Open Graph pasan a usar direcciones absolutas.

## Pruebas

```
npm test
```

Lanza Edge o Chrome en modo headless, abre `index.html` y ejecuta más de 120
comprobaciones: búsqueda tolerante (`65.04101-0026`, `65041010026`,
`6504101 0026`…), filtros combinados, estados vacíos, mensaje de WhatsApp,
fichas y metadatos, validación del formulario y adjuntos, accesibilidad
(etiquetas, tamaños táctiles, contraste) y ausencia de desbordamiento a 320,
375, 768 y 1440 px. Deja capturas en `tests/capturas/`. No instala nada.

## Lo que este sitio no hace, y por qué

Es una web sin servidor. Por diseño:

- **No hay panel de administración con contraseña.** Una contraseña escrita en
  el código la puede leer cualquiera con "ver código fuente"; sería seguridad
  falsa. La administración es editar `datos/`.
- **El formulario no guarda solicitudes ni sube adjuntos.** Valida los datos,
  arma el resumen y lo entrega para continuar por WhatsApp o correo. Los
  archivos se adjuntan en ese mismo chat o correo. La web se lo dice al cliente.
- **No hay exportación a Excel** ni historial de solicitudes.
- **Las vistas previas al compartir un enlace** (WhatsApp, Facebook) toman la
  imagen general del sitio, no la de cada repuesto: esos servicios no ejecutan
  JavaScript. Para vistas previas por producto hace falta un servidor.

Cuando exista un backend, `loadProducts()` en `assets/js/app.js` es el único
punto que hay que cambiar por una llamada a la API.

## Marcas

DOOSAN y las demás marcas mencionadas pertenecen a sus respectivos titulares.
Este sitio no afirma que DOGEPARTS SAC sea distribuidor oficial ni representante
exclusivo de ninguna marca.
