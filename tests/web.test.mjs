/* Batería de pruebas de la web en un navegador real (Chromium headless vía CDP).
   La lanza tests/run.mjs. Cubre el catálogo v2 (buscador, modelos, filtros, lista y
   cuadrícula, "Ver más", orden, URL compartible, ficha con navegación y lista de
   cotización), la portada, el mapa, el formulario, accesibilidad, contraste y móvil. */
import {connect, evalJs} from './cdp.mjs';
import {writeFileSync} from 'node:fs';

const PORT = Number(process.env.CDP_PORT || 9337);
const URL_ = process.env.SITE_URL;
if(!URL_){ console.error('Falta SITE_URL'); process.exit(2); }

const c = await connect(PORT);
await c.send('Page.enable'); await c.send('Runtime.enable'); await c.send('Log.enable');

let pass = 0, fail = 0;
const ok = (n, cond, extra = '') => {
  cond ? pass++ : fail++;
  console.log((cond ? '  OK   ' : 'FALLA  ') + n + (cond ? '' : '   <-- ' + extra));
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const js = (expr) => evalJs(c, expr);
const count = () => js("document.querySelectorAll('#products .product').length");
const total = () => js("currentList.length");

async function goto(url){ await c.send('Page.navigate', {url}); await wait(1800); }
async function setViewport(w,h){ await c.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:w<700}); }
async function shot(name){
  const r = await c.send('Page.captureScreenshot',{format:'png'});
  writeFileSync('capturas/'+name+'.png', Buffer.from(r.data,'base64'));
}
async function search(q){
  return js("(()=>{const e=document.getElementById('search');e.value=" + JSON.stringify(q) + ";e.dispatchEvent(new Event('input'));return document.querySelectorAll('#products .product').length})()");
}

await setViewport(1366,768);
await goto(URL_);
await js("try{localStorage.clear()}catch(e){}");
await goto(URL_);

// ---------- carga limpia ----------
const consErr = c.evs.filter(e => e.method === 'Log.entryAdded' && e.params.entry.level === 'error' && !/fonts\.g/.test(e.params.entry.text)).map(e => e.params.entry.text);
ok('Sin errores de consola al cargar', consErr.length === 0, JSON.stringify(consErr));
ok('Solo se cargan scripts del propio sitio', await js("[...document.scripts].every(s=>!s.src||new URL(s.src).origin===location.origin)") === true);
ok('La única hoja de estilos externa es Google Fonts', await js("[...document.querySelectorAll('link[rel=stylesheet]')].every(l=>new URL(l.href).origin===location.origin||/fonts\\.googleapis\\.com/.test(l.href))") === true);

// ---------- datos ----------
ok('Catálogo con 70 repuestos y 8 líneas', await js("PRODUCTS.length===70 && CATEGORIES.length===8") === true);
ok('Todos los repuestos tienen código, marca, modelos, categoría válida e imagen', await js("PRODUCTS.every(p=>p.code&&p.brand&&p.models&&CATEGORIES.includes(p.category)&&p.images[0].src&&p.images[0].full)") === true);
ok('Slugs únicos', await js("new Set(PRODUCTS.map(p=>p.slug)).size===PRODUCTS.length") === true);

// ---------- catálogo inicial (escritorio) ----------
ok('Escritorio: vista cuadrícula por defecto con 12 repuestos', await js("products.dataset.view==='grid'") === true && await count() === 12);
ok('Contador "Mostrando 12 de 70 repuestos"', (await js("resultCount.textContent")) === 'Mostrando 12 de 70 repuestos');
ok('Cuadrícula de 4 o más columnas a 1366 px', await js("(()=>{const r=[...document.querySelectorAll('#products .product')].map(e=>e.getBoundingClientRect().left);return new Set(r.map(x=>Math.round(x))).size})()") >= 4);
ok('Panel lateral de filtros visible en escritorio con 4 grupos', await js("(()=>{const p=document.getElementById('filtersPanel');return getComputedStyle(p).position==='sticky' && p.querySelectorAll('.fgroup:not(.sortgroup)').length===4 && getComputedStyle(p.querySelector('.sortgroup')).display==='none' && getComputedStyle(document.getElementById('filtersBtn')).display==='none'})()") === true);
ok('Categorías del panel con icono y conteo', await js("[...document.querySelectorAll('.fopt[data-filter=category]')].every(b=>b.querySelector('svg')&&/\\d+/.test(b.querySelector('small').textContent))") === true);
ok('Chips de modelo derivados de los datos (Todos + familias con 2 o más repuestos)', await js("(()=>{const c=[...document.querySelectorAll('#modelChips .mchip')].map(b=>b.dataset.model);return c[0]===''&&c.includes('DX225')&&c.includes('DX300')&&c.includes('DB58')&&c.includes('DE08')&&c.includes('DE12')&&c.includes('DV15')&&c.includes('ROBEX')})()") === true);
ok('Barra de búsqueda fija (sticky)', await js("getComputedStyle(document.getElementById('catbar')).position==='sticky'") === true);
ok('Tarjetas usan miniatura (thumbs) con carga diferida', await js("[...document.querySelectorAll('#products .card-img img')].every(i=>i.getAttribute('src').includes('/thumbs/')&&i.loading==='lazy')") === true);
ok('Destacado (válvula) aparece primero con cinta', await js("document.querySelector('#products .product .ribbon')!==null && document.querySelector('#products .product h3').textContent==='Válvula de admisión'") === true);

// ---------- ver más ----------
ok('"Ver más repuestos" muestra 12 más', await js("(()=>{document.getElementById('moreBtn').click();return document.querySelectorAll('#products .product').length})()") === 24);
ok('Contador actualizado a 24 de 70', (await js("resultCount.textContent")) === 'Mostrando 24 de 70 repuestos');
ok('Tras 5 veces se muestran los 70 y el botón desaparece', await js("(()=>{for(let i=0;i<5;i++)document.getElementById('moreBtn').click();return document.querySelectorAll('#products .product').length===70 && moreWrap.hidden})()") === true);

// ---------- orden ----------
ok('Orden por nombre A–Z', await js("(()=>{const s=document.getElementById('sort');s.value='nombre';s.dispatchEvent(new Event('change'));const n=[...document.querySelectorAll('#products h3')].map(h=>h.textContent);return n.slice().sort((a,b)=>a.localeCompare(b,'es')).join('|')===n.join('|') && location.search.includes('orden=nombre')})()") === true);
ok('Orden por categoría agrupa', await js("(()=>{const s=document.getElementById('sort');s.value='categoria';s.dispatchEvent(new Event('change'));const n=[...document.querySelectorAll('#products .card-meta')].map(h=>h.textContent.split(' · ')[0]);return n.slice().sort((a,b)=>a.localeCompare(b,'es')).join('|')===n.join('|')})()") === true);
await js("(()=>{const s=document.getElementById('sort');s.value='relevancia';s.dispatchEvent(new Event('change'))})()");

// ---------- búsqueda ----------
for (const q of ['65.04101-0026','65041010026','6504101 0026','65-04101-0026'])
  ok('Busca "' + q + '" -> 1 resultado', await search(q) === 1);
ok('Busca "6503203" (sin puntos) encuentra 65.03203-1053', await js("(()=>{const e=document.getElementById('search');e.value='6503203';e.dispatchEvent(new Event('input'));return [...document.querySelectorAll('#products .code')].some(c=>c.textContent.includes('65.03203-1053'))})()") === true);
ok('Relevancia: el código exacto va primero', await js("(()=>{const e=document.getElementById('search');e.value='65.03203-1053';e.dispatchEvent(new Event('input'));return document.querySelector('#products .code').textContent.includes('65.03203-1053')})()") === true);
const esperaValv = await js("ALL.filter(p=>normalize([p.name,p.code,p.brand,p.category,p.models,p.description,p.machineType].join(' ')).includes('valvula')).length");
for (const q of ['valvula','VÁLVULA']){ await search(q); ok('Busca "' + q + '" -> ' + esperaValv + ' (sin importar tildes)', await total() === esperaValv); }
ok('Busca "DE08TIS" (modelo) -> varios', await search('DE08TIS') >= 5);
ok('Busca "bomba de agua" -> 5', await search('bomba de agua') === 5);
ok('La búsqueda queda en la URL (?q=…)', (await js("location.search")).includes('q=bomba'));
ok('Botón ✕ borra la búsqueda', await js("(()=>{document.getElementById('searchClear').click();return state.q===''&&document.getElementById('search').value===''&&!location.search.includes('q=')})()") === true);
const noRes = await js("(()=>{const e=document.getElementById('search');e.value='zzzzz';e.dispatchEvent(new Event('input'));return document.querySelector('#products .state')?document.querySelector('#products .state').innerHTML:''})()");
ok('Sin resultados: mensaje amable con «lo buscado»', noRes.includes('No encontramos «zzzzz»'));
ok('Sin resultados: botón "Pídelo por WhatsApp" con lo buscado', noRes.includes('P%C3%ADdelo') === false && /wa\.me\/51937419437\?text=Hola%2C%20busco%20el%20repuesto%3A%20zzzzz/.test(noRes) && noRes.includes('Pídelo por WhatsApp'));
await search('');

// ---------- sugerencias con miniatura ----------
ok('Sugerencias: hasta 5 productos con miniatura, nombre y código', await js("(()=>{const e=document.getElementById('search');e.value='empaque';e.dispatchEvent(new Event('input'));const li=[...catSug.querySelectorAll('li[data-i]')].filter(l=>!l.classList.contains('more'));return catSug.dataset.open==='true'&&li.length===5&&li.every(l=>l.querySelector('img')&&l.querySelector('b')&&/Código/.test(l.textContent))})()") === true);
ok('Sugerencias: fila "Ver los N resultados" cuando hay más de 5', await js("(()=>{const m=catSug.querySelector('li.more');return !!m&&/Ver los \\d+ resultados/.test(m.textContent)})()") === true);
ok('Sugerencia por código sin puntos (6503203)', await js("(()=>{const e=document.getElementById('search');e.value='6503203';e.dispatchEvent(new Event('input'));return [...catSug.querySelectorAll('li .s-text span')].some(s=>s.textContent.includes('65.03203-1053'))})()") === true);
ok('Flecha abajo + Enter abre la ficha sugerida', await js("(()=>{const e=document.getElementById('search');e.value='interrup';e.dispatchEvent(new Event('input'));e.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown'}));e.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'}));return location.hash})()") === '#/repuesto/interruptor-de-motor-24v');
await wait(500);
ok('…y la ficha está abierta', await js("!document.getElementById('detail').hidden") === true);
await js("history.pushState(null,'','#catalogo');closeDetail(true)"); await wait(200);
ok('Buscador del hero también sugiere con miniatura', await js("(()=>{const e=document.getElementById('heroSearch');e.value='piston';e.dispatchEvent(new Event('input'));return heroSug.dataset.open==='true'&&!!heroSug.querySelector('li img')})()") === true);
await js("(()=>{const e=document.getElementById('heroSearch');e.value='';e.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}))})()");
await search('');

// ---------- modelos y filtros ----------
ok('Chip DX300 filtra y queda en la URL (?modelo=DX300)', await js("(()=>{[...document.querySelectorAll('#modelChips .mchip')].find(b=>b.dataset.model==='DX300').click();return state.model==='DX300'&&location.search.includes('modelo=DX300')&&document.querySelectorAll('#products .product').length>=5})()") === true);
ok('Chip activo marcado (aria-pressed) y chip de filtro con ×', await js("(()=>{const b=[...document.querySelectorAll('#modelChips .mchip')].find(b=>b.dataset.model==='DX300');return b.getAttribute('aria-pressed')==='true'&&!!document.querySelector('#chips [data-clear=model]')})()") === true);
ok('Filtro de categoría combinado (DX300 + Motor) y conteos facetados', await js("(()=>{const b=[...document.querySelectorAll('.fopt[data-filter=category]')].find(x=>x.dataset.value==='Motor');const n=Number(b.querySelector('small').textContent);b.click();return state.category==='Motor'&&document.querySelectorAll('#products .product').length===n&&n>0&&location.search.includes('cat=Motor')})()") === true);
ok('Contador claro con filtros', /^Mostrando \d+ de \d+ repuestos?$/.test(await js("resultCount.textContent")));
ok('Chips activos: Modelo y Categoría + "Limpiar todo"', await js("document.querySelectorAll('#chips .chip').length===3 && !!document.querySelector('#chips .clear-all')") === true);
ok('Quitar un chip con ×', await js("(()=>{document.querySelector('#chips [data-clear=category]').click();return state.category===''&&state.model==='DX300'})()") === true);
ok('"Limpiar todo" restaura el catálogo y limpia la URL', await js("(()=>{document.querySelector('#chips .clear-all').click();return state.model===''&&document.querySelectorAll('#products .product').length===12&&location.search===''})()") === true);
ok('Filtro de marca HYUNDAI -> 3', await js("(()=>{[...document.querySelectorAll('.fopt[data-filter=brand]')].find(x=>x.dataset.value==='HYUNDAI').click();return document.querySelectorAll('#products .product').length})()") === 3);
ok('Opciones imposibles quedan deshabilitadas (Embrague con HYUNDAI)', await js("[...document.querySelectorAll('.fopt[data-filter=category]')].find(x=>x.dataset.value==='Embrague').disabled") === true);
ok('Filtro de presentación Juego', await js("(()=>{clearAll();[...document.querySelectorAll('.fopt[data-filter=presentation]')].find(x=>x.dataset.value==='Juego').click();return state.presentation==='Juego'&&location.search.includes('pres=Juego')&&document.querySelectorAll('#products .product').length>0})()") === true);
await js("clearAll()");
ok('Categoría desde la sección superior filtra el catálogo', await js("(()=>{[...document.querySelectorAll('#categoryGrid .cat')].find(b=>b.dataset.category==='Empaques').click();return state.category==='Empaques'&&document.querySelectorAll('#products .product').length===8})()") === true);
await js("clearAll()");

// ---------- URL compartible ----------
await goto(URL_.split('?')[0] + '?modelo=DE08&cat=Motor&orden=nombre');
ok('Enlace con ?modelo=DE08&cat=Motor&orden=nombre carga filtrado y ordenado', await js("(()=>{return state.model==='DE08'&&state.category==='Motor'&&state.sort==='nombre'&&document.querySelectorAll('#chips .chip').length===3&&document.querySelectorAll('#products .product').length>0&&[...document.querySelectorAll('#modelChips .mchip')].find(b=>b.dataset.model==='DE08').getAttribute('aria-pressed')==='true'})()") === true);
await goto(URL_.split('?')[0]);

// ---------- vista lista / cuadrícula ----------
ok('Cambiar a vista lista y recordar la elección', await js("(()=>{document.querySelector('.viewbtn[data-view=list]').click();return products.dataset.view==='list'&&document.querySelectorAll('#products .row').length===12&&localStorage.getItem('dgp-vista')==='\"list\"'})()") === true);
ok('Fila compacta: miniatura cuadrada, nombre, modelos, código y WhatsApp', await js("(()=>{const r=document.querySelector('#products .row');const h=r.getBoundingClientRect().height;return h>=80&&h<=100&&!!r.querySelector('.row-thumb')&&!!r.querySelector('.row-text b')&&!!r.querySelector('.row-code')&&r.querySelector('.row-wa').href.startsWith('https://wa.me/51937419437?text=')})()") === true);
await goto(URL_.split('?')[0]);
ok('La vista lista se recuerda al recargar', await js("products.dataset.view==='list'") === true);
await js("document.querySelector('.viewbtn[data-view=grid]').click()");

// ---------- WhatsApp ----------
const MSG_V = 'Hola, deseo cotizar el repuesto Válvula de admisión, código 65.04101-0026. ¿Podrían confirmarme precio y disponibilidad?';
ok('Mensaje con nombre y código exactos', await js("quoteMessage(ALL.find(p=>p.code==='65.04101-0026'))") === MSG_V);
ok('Sin código, la frase se omite sin coma suelta', await js("quoteMessage({name:'Pieza X', code:''})") === 'Hola, deseo cotizar el repuesto Pieza X. ¿Podrían confirmarme precio y disponibilidad?');
ok('CTA de cada tarjeta apunta a wa.me con su mensaje', await js("[...document.querySelectorAll('#products .product')].every((card,i)=>card.querySelector('.card-actions .btn-primary').getAttribute('href')==='https://wa.me/51937419437?text='+encodeURIComponent(quoteMessage(currentList[i])))") === true);
ok('Botón flotante de WhatsApp visible en escritorio', await js("!fab.hidden && fab.href.startsWith('https://wa.me/51937419437?text=')") === true);

// ---------- ficha ----------
await js("location.hash='#/repuesto/valvula-de-admision-65-04101-0026'");
await wait(600);
ok('La ficha abre por su propia URL y el título cambia', await js("!document.getElementById('detail').hidden && document.title==='Válvula de admisión 65.04101-0026 | DOGEPARTS SAC'") === true);
const spec = await js("document.querySelector('.spec').textContent");
ok('Ficha: código con "Copiar código", marca, modelos, presentación y descripción', await js("document.querySelector('.codeline .code').textContent==='Código 65.04101-0026' && !!document.getElementById('copyCode')") === true && spec.includes('MarcaDOOSAN') && spec.includes('Modelos compatibles1146 / DE08TIS') && spec.includes('PresentaciónUnidad') && spec.includes('DescripciónVÁLVULA DE ADMISIÓN'));
ok('Ficha: tarjeta grande como imagen principal', (await js("document.getElementById('detailImg').getAttribute('src')")).includes('assets/img/repuestos/24-'));
ok('Ficha: botones Cotizar por WhatsApp y Agregar a mi cotización', await js("document.querySelector('.detail-actions .btn-primary').getAttribute('href')==='https://wa.me/51937419437?text='+encodeURIComponent("+JSON.stringify(MSG_V)+") && document.getElementById('addQuoteBtn').textContent.includes('Agregar a mi cotización')") === true);
ok('Ficha: flechas anterior/siguiente con posición', await js("(()=>{return !!document.getElementById('prevBtn')&&!!document.getElementById('nextBtn')&&/\\d+ \\/ \\d+/.test(document.querySelector('.navpos').textContent)})()") === true);
ok('Flecha derecha pasa al siguiente repuesto de la lista actual', await js("(()=>{const cur=currentList.findIndex(p=>p.slug==='valvula-de-admision-65-04101-0026');document.getElementById('nextBtn').click();return location.hash==='#/repuesto/'+currentList[cur+1].slug})()") === true);
await wait(400);
ok('Tecla ← vuelve al anterior', await js("(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft'}));return location.hash==='#/repuesto/valvula-de-admision-65-04101-0026'})()") === true);
await wait(400);
ok('Repuestos relacionados por modelo de máquina (hasta 4, comparten familia)', await js("(()=>{const rel=[...document.querySelectorAll('.similar .product')];const fams=familiesOf(currentProduct());return rel.length===4&&rel.every(card=>{const slug=card.querySelector('a').getAttribute('href').replace('#/repuesto/','');return familiesOf(ALL.find(p=>p.slug===slug)).some(f=>fams.includes(f))})})()") === true);
ok('Muestra el aviso de número de serie', (await js("document.querySelector('.warn').textContent")).includes('Confirma la aplicación con el número de serie de tu equipo antes de comprar.'));
ok('Zoom usa la tarjeta grande', await js("(()=>{document.getElementById('zoomBtn').click();const im=document.querySelector('#lightbox img');const r=im&&im.getAttribute('src').includes('assets/img/repuestos/24-');document.getElementById('lbClose').click();return r})()") === true);
await shot('05-ficha');
await js("location.hash='#/repuesto/no-existe'"); await wait(400);
ok('Slug inexistente cierra la ficha sin romper', await js("document.getElementById('detail').hidden") === true);
await js("location.hash='#catalogo'"); await wait(300);

// ---------- lista de cotización ----------
ok('Lista vacía: sin botón flotante', await js("quoteFab.hidden") === true);
ok('Agregar desde la tarjeta (+) muestra el botón "Mi cotización (1)" y un aviso', await js("(()=>{document.querySelector('#products [data-add]').click();return !quoteFab.hidden&&quoteCount.textContent==='1'&&document.getElementById('toast').classList.contains('show')})()") === true);
ok('Agregar desde la ficha suma y el botón cambia a "En mi cotización"', await js("(()=>{location.hash='#/repuesto/bomba-de-agua-65-06500-6402';return true})()") === true);
await wait(500);
ok('…', await js("(()=>{document.getElementById('addQuoteBtn').click();return document.getElementById('addQuoteBtn').textContent.includes('En mi cotización (1)')&&quoteCount.textContent==='2'})()") === true);
await js("history.pushState(null,'','#catalogo');closeDetail(true)");
ok('Se guarda en el navegador (localStorage)', await js("JSON.parse(localStorage.getItem('dgp-cotizacion')).length===2") === true);
ok('Abrir la lista: 2 repuestos con cantidad y quitar', await js("(()=>{quoteFab.click();return quoteDrawer.classList.contains('open')&&document.querySelectorAll('.qitem').length===2&&quoteTitle.textContent==='Mi cotización (2)'})()") === true);
ok('Cantidad +1 actualiza el total', await js("(()=>{document.querySelector('.qitem [data-qty=\"1\"]').click();return document.querySelector('.qitem input').value==='2'&&quoteCount.textContent==='3'})()") === true);
const waList = await js("decodeURIComponent(quoteSend.href.split('text=')[1])");
ok('"Enviar por WhatsApp" manda un solo mensaje con nombre, código y cantidad al +51 937 419 437', (await js("quoteSend.href")).startsWith('https://wa.me/51937419437?text=') && waList.startsWith('Hola, deseo cotizar los siguientes repuestos:') && /1\. .+ — código .+ — cantidad: 2/.test(waList) && /2\. Bomba de agua — código 65\.06500-6402 — cantidad: 1/.test(waList) && waList.endsWith('¿Podrían confirmarme precio y disponibilidad?'));
ok('Quitar un repuesto de la lista', await js("(()=>{document.querySelector('.qitem [data-remove]').click();return document.querySelectorAll('.qitem').length===1})()") === true);
ok('Escape cierra la lista', await js("(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));return !quoteDrawer.classList.contains('open')})()") === true);
await goto(URL_.split('?')[0]);
ok('La lista sobrevive a la recarga', await js("!quoteFab.hidden&&quoteCount.textContent==='1'") === true);
await js("quote=[];saveQuote()");

// ---------- datos comerciales y mapa ----------
const cards = await js("[...document.querySelectorAll('#contactCards .contact-card b')].map(b=>b.textContent.trim())");
ok('Tarjetas de contacto reales', JSON.stringify(cards) === JSON.stringify(['WhatsApp','Teléfono','Correo','Horario','Dirección']), JSON.stringify(cards));
ok('El mapa no se incrusta antes de llegar; al incrustar es OpenStreetMap con el pin', await js("(()=>{if(map.querySelector('iframe'))return false;loadMap();const f=map.querySelector('iframe');return !!f&&f.src.includes('openstreetmap.org')&&f.src.includes('marker=-12.075358,-77.009017')&&!!map.querySelector('.map-link')})()") === true);
const ld = await js("[...document.querySelectorAll('script[type=\"application/ld+json\"]')].map(s=>JSON.parse(s.textContent))");
const org = ld.find(x => x['@type'] === 'AutoPartsStore'), list = ld.find(x => x['@type'] === 'ItemList');
ok('JSON-LD de empresa y 70 productos sin precio ni valoraciones', !!org && org.telephone === '+51 937 419 437' && !!org.geo && !!list && list.numberOfItems === 70 && list.itemListElement.every(i => i.item.sku && !i.item.offers));
ok('Créditos fotográficos visibles en el pie', await js("(()=>{const c=document.getElementById('credits');return !c.hidden && c.querySelectorAll('a[href*=creativecommons]').length>=3})()") === true);

// ---------- portada ----------
ok('Portada: 6 diapositivas, rota sola y se detiene con el cursor', await js("document.querySelectorAll('#slider .slide').length===6 && slider.classList.contains('is-playing')") === true);
const idxA = await js("Number(document.querySelector('#slider .slide.is-active').dataset.i)");
await wait(3600);
ok('Portada: rota cada 3 segundos', (await js("Number(document.querySelector('#slider .slide.is-active').dataset.i)")) !== idxA);
ok('Portada: pausa al pasar el cursor', await js("(()=>{slider.dispatchEvent(new PointerEvent('pointerenter'));return !slider.classList.contains('is-playing')})()") === true);
await js("slider.dispatchEvent(new PointerEvent('pointerleave'))");

// ---------- formulario ----------
ok('Envío vacío marca errores', await js("(()=>{requestForm.dispatchEvent(new Event('submit',{cancelable:true}));return document.querySelectorAll('.form [aria-invalid=\"true\"]').length>=3&&notice.dataset.kind==='error'})()") === true);
ok('Solicitud válida -> resumen con WhatsApp y correo', await js("(()=>{rName.value='Constructora X';rMsg.value='Necesito la válvula';rMail.value='compras@ejemplo.com';rPhone.value='987654321';rCode.value='65.04101-0026';requestForm.dispatchEvent(new Event('submit',{cancelable:true}));const a=[...notice.querySelectorAll('a')];return notice.dataset.kind==='ok'&&a.some(x=>x.href.startsWith('https://wa.me/51937419437?text=Hola%2C%20quiero%20solicitar'))&&a.some(x=>x.href.startsWith('mailto:ventas@dogeparts.pe?subject='))})()") === true);
ok('Rechaza 4 adjuntos', (await js("(()=>{const dt=new DataTransfer();for(let i=0;i<4;i++)dt.items.add(new File([new Uint8Array(10)],'f'+i+'.jpg',{type:'image/jpeg'}));rFiles.files=dt.files;rFiles.dispatchEvent(new Event('change'));return errFiles.textContent})()")).includes('máximo 3'));
ok('Acepta adjunto válido', await js("(()=>{const dt=new DataTransfer();dt.items.add(new File([new Uint8Array(1024)],'placa.jpg',{type:'image/jpeg'}));rFiles.files=dt.files;rFiles.dispatchEvent(new Event('change'));return errFiles.textContent===''})()") === true);

// ---------- accesibilidad ----------
ok('Todas las imágenes tienen alt y dimensiones', await js("[...document.images].every(i=>i.hasAttribute('alt')&&i.hasAttribute('width')&&i.hasAttribute('height'))") === true);
ok('Hay un único h1', await js("document.querySelectorAll('h1').length") === 1);
ok('Buscadores declaran combobox accesible y el orden tiene etiqueta', await js("['heroSearch','search'].every(id=>{const e=document.getElementById(id);return e.getAttribute('role')==='combobox'&&document.getElementById(e.getAttribute('aria-controls'))}) && !!document.querySelector('label[for=search]') && !!document.getElementById('sort').getAttribute('aria-label')") === true);
ok('Chips de modelo y opciones de filtro son botones con estado (teclado)', await js("[...document.querySelectorAll('#modelChips .mchip, .fopt, .viewbtn')].every(b=>b.tagName==='BUTTON'&&b.hasAttribute('aria-pressed'))") === true);
const small = await js("[...document.querySelectorAll('a,button')].filter(e=>e.offsetParent!==null&&!e.closest('.credits')).map(e=>({s:e.tagName+'.'+(e.className||'-'),h:Math.round(e.getBoundingClientRect().height),t:e.textContent.trim().slice(0,24)})).filter(x=>x.h>0&&x.h<44)");
ok('Todos los controles visibles miden 44px o más de alto', small.length === 0, JSON.stringify(small));

// ---------- contraste ----------
const contrast = await js(`(()=>{
  const lum = v => { const s=v/255; return s<=0.03928 ? s/12.92 : Math.pow((s+0.055)/1.055,2.4); };
  const L = rgb => 0.2126*lum(rgb[0])+0.7152*lum(rgb[1])+0.0722*lum(rgb[2]);
  const rgba = s => { const m=(s.match(/[0-9.]+/g)||[]).map(Number); return m.length>=3?{c:m.slice(0,3),a:m.length>3?m[3]:1}:null; };
  const bgOf = el => {
    const stack=[]; let n=el;
    while(n){ const q=rgba(getComputedStyle(n).backgroundColor); if(q&&q.a>0){ stack.push(q); if(q.a===1) break; } n=n.parentElement; }
    if(!stack.length||stack[stack.length-1].a<1) stack.push({c:[3,19,47],a:1});
    let out=stack.pop().c;
    while(stack.length){ const t=stack.pop(); out=out.map((v,i)=>t.c[i]*t.a+v*(1-t.a)); }
    return out;
  };
  const ratio = (a,b) => { const l1=L(a),l2=L(b); return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05); };
  const out=[];
  const sels=['.lead','.head p','.topbar span','.benefit p','.footer p','.card-meta','.card-meta b','.card-models','.code','.count','.mchip','.mchip small','.mchip[aria-pressed=true]','.fopt','.fopt small','.fgroup legend','.chip','.hint','.step p','.cat small','.contact-card small','.credits p'];
  for(const s of sels){
    const el=document.querySelector(s); if(!el||el.offsetParent===null) continue;
    const cs=getComputedStyle(el);
    const r=ratio(rgba(cs.color).c, bgOf(el));
    const size=parseFloat(cs.fontSize), bold=parseInt(cs.fontWeight)>=700;
    const large = size>=24 || (size>=18.66 && bold);
    out.push({s, r:Math.round(r*100)/100, min: large?3:4.5, ok: r >= (large?3:4.5)});
  }
  return out;
})()`);
contrast.forEach(x => ok('Contraste ' + x.s + ' = ' + x.r + ':1 (mín ' + x.min + ')', x.ok, 'insuficiente'));

// ---------- móvil ----------
await js("try{localStorage.clear()}catch(e){}");
for (const [w,h] of [[360,740],[390,844]]) {
  await setViewport(w,h);
  await goto(URL_.split('?')[0]);
  ok(`${w}px: vista lista por defecto`, await js("products.dataset.view==='list'") === true);
  ok(`${w}px: botón Filtros visible y panel oculto`, await js("getComputedStyle(document.getElementById('filtersBtn')).display!=='none' && !document.getElementById('filtersPanel').classList.contains('open')") === true);
  await js("window.scrollTo(0,document.getElementById('catalogo').getBoundingClientRect().top+window.scrollY-60)"); await wait(600);
  const firstScreen = await js("(()=>{const rows=[...document.querySelectorAll('#products .row')];if(rows.length<4)return {s:false,m:false,r4:false,rows:rows.length};const r4=rows[3].getBoundingClientRect();const s=document.getElementById('search').getBoundingClientRect();const m=document.getElementById('modelChips').getBoundingClientRect();return {s:s.top>=0&&s.bottom<=innerHeight,m:m.top>=0&&m.bottom<=innerHeight,r4:r4.bottom<=innerHeight,rows:rows.filter(r=>r.getBoundingClientRect().bottom<=innerHeight).length}})()");
  ok(`${w}px: primera pantalla del catálogo muestra buscador, modelos y ≥4 repuestos (${firstScreen.rows} visibles)`, firstScreen.s && firstScreen.m && firstScreen.r4, JSON.stringify(firstScreen));
  await js("window.scrollTo({top:window.scrollY+500,behavior:'instant'})"); await wait(300);
  ok(`${w}px: la barra de búsqueda sigue fija al bajar`, await js("Math.abs(document.getElementById('catbar').getBoundingClientRect().top-64)<3") === true);
  await js("document.getElementById('filtersBtn').click()"); await wait(500);
  ok(`${w}px: panel de filtros se abre como hoja inferior con "Ver X resultados" y orden dentro`, await js("(()=>{const p=document.getElementById('filtersPanel');const r=p.getBoundingClientRect();return p.classList.contains('open')&&Math.abs(r.bottom-innerHeight)<2&&/^Ver 70 resultados$/.test(document.getElementById('fpApply').textContent)&&getComputedStyle(p.querySelector('.sortgroup')).display!=='none'})()") === true);
  await shot(`${w}-filtros`);
  ok(`${w}px: elegir Refrigeración en la hoja actualiza "Ver X resultados" y cierra al aplicar`, await js("(()=>{[...document.querySelectorAll('.fopt[data-filter=category]')].find(x=>x.dataset.value==='Refrigeración').click();const t=document.getElementById('fpApply').textContent;document.getElementById('fpApply').click();return t==='Ver 9 resultados'&&!document.getElementById('filtersPanel').classList.contains('open')&&document.querySelectorAll('#products .product').length===9})()") === true);
  await js("clearAll()");
  await js("location.hash='#/repuesto/bomba-de-agua-65-06500-6402'"); await wait(600);
  ok(`${w}px: la ficha ocupa toda la pantalla`, await js("(()=>{const b=document.querySelector('.detail-box').getBoundingClientRect();return b.width>=innerWidth-20&&Math.abs(b.top)<2&&!document.getElementById('detail').hidden&&getComputedStyle(document.querySelector('.detail-bar nav')).display==='none'})()") === true);
  await shot(`${w}-ficha`);
  await js("history.pushState(null,'','#catalogo');closeDetail(true)");
  const over = await js("document.documentElement.scrollWidth-document.documentElement.clientWidth");
  ok(`${w}px: sin desbordamiento horizontal`, over <= 0, 'sobran ' + over + 'px');
  ok(`${w}px: barra inferior con WhatsApp`, await js("(()=>{const b=document.getElementById('mbar');return getComputedStyle(b).display!=='none' && !!b.querySelector('a[href^=\"https://wa.me/51937419437\"]')})()") === true);
  await js("addToQuote('empaque-de-motor-65-99601-8024')");
  ok(`${w}px: con repuestos, la barra inferior ofrece "Mi cotización (1)" y abre la hoja`, await js("(()=>{const b=document.getElementById('mbarQuote');if(!b.textContent.includes('Mi cotización (1)'))return false;b.click();return quoteDrawer.classList.contains('open')})()") === true);
  await shot(`${w}-cotizacion`);
  await js("closeQuote();quote=[];saveQuote()");
}
for (const [w,h] of [[768,1024],[1366,768]]) {
  await setViewport(w,h); await goto(URL_.split('?')[0]);
  const over = await js("document.documentElement.scrollWidth-document.documentElement.clientWidth");
  ok(`${w}px: sin desbordamiento horizontal`, over <= 0, 'sobran ' + over + 'px');
}

// ---------- prefers-reduced-motion ----------
await c.send('Emulation.setEmulatedMedia', {features:[{name:'prefers-reduced-motion', value:'reduce'}]});
await goto(URL_.split('?')[0]);
ok('Movimiento reducido: la portada no rota sola', await js("!slider.classList.contains('is-playing')") === true);
await c.send('Emulation.setEmulatedMedia', {features:[]});

console.log('\nRESULTADO: ' + pass + ' correctas, ' + fail + ' fallidas');
c.close();
process.exit(fail ? 1 : 0);
