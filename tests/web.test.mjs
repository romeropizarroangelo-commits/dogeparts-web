/* Batería de pruebas de la web en un navegador real (Chromium headless vía CDP).
   La lanza tests/run.mjs. Comprueba búsqueda, filtros, WhatsApp, fichas,
   formulario, accesibilidad, contraste y ausencia de desbordamiento. */
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

async function goto(url){ await c.send('Page.navigate', {url}); await wait(1600); }
async function setViewport(w,h){ await c.send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:w<600}); }
async function shot(name){
  const r = await c.send('Page.captureScreenshot',{format:'png'});
  writeFileSync('capturas/'+name+'.png', Buffer.from(r.data,'base64'));
}

await setViewport(1440,900);
await goto(URL_);

// ---------- carga limpia ----------
const consErr = c.evs.filter(e => e.method === 'Log.entryAdded' && e.params.entry.level === 'error' && !/fonts\.g/.test(e.params.entry.text)).map(e => e.params.entry.text);
ok('Sin errores de consola al cargar', consErr.length === 0, JSON.stringify(consErr));
ok('Solo se cargan scripts del propio sitio', await js("[...document.scripts].every(s=>!s.src||new URL(s.src).origin===location.origin)") === true);
ok('La única hoja de estilos externa es Google Fonts', await js("[...document.querySelectorAll('link[rel=stylesheet]')].every(l=>new URL(l.href).origin===location.origin||/fonts\.googleapis\.com/.test(l.href))") === true);

// ---------- render base ----------
ok('Renderiza 2 productos', await js("document.querySelectorAll('#products .product').length") === 2);
ok('Contador de resultados correcto', (await js("resultCount.textContent")).includes('2 repuestos'));
ok('Paginador oculto con 2 productos (umbral 24)', await js("pager.hidden") === true && await js("PER_PAGE") === 24);
ok('10 categorías con icono', await js("document.querySelectorAll('#categoryGrid .cat svg').length") === 10);
ok('Categoría Motor muestra conteo real', (await js("[...document.querySelectorAll('.cat')].find(b=>b.dataset.category==='Motor').textContent")).includes('1 repuesto'));
ok('Categoría vacía invita a solicitar', (await js("[...document.querySelectorAll('.cat')].find(b=>b.dataset.category==='Frenos').textContent")).includes('Solic'));
ok('Tarjetas muestran Consultar precio', (await js("document.querySelector('.product .price').textContent")) === 'Consultar precio');
ok('Producto destacado lleva cinta', await js("document.querySelectorAll('.product .ribbon').length") === 1);
ok('Marquesina duplicada y oculta a lectores', await js("document.querySelectorAll('#marqueeClip .marquee span').length===24 && marqueeClip.getAttribute('aria-hidden')==='true'") === true);
ok('Cuatro pasos del proceso, el primero activo', await js("document.querySelectorAll('.step').length===4 && document.querySelector('.step').classList.contains('is-active')") === true);

// ---------- portada (carrusel) ----------
ok('Portada: las diapositivas salen de datos/portada.js', await js("document.querySelectorAll('#slider .slide').length===SLIDES.length && SLIDES.length>=3") === true);
ok('Portada: primera imagen prioritaria, el resto diferidas', await js("(()=>{const im=[...document.querySelectorAll('#slider img')];return im[0].getAttribute('fetchpriority')==='high' && im.slice(1).every(i=>i.loading==='lazy')})()") === true);
ok('Portada: un punto de 44px por diapositiva y progreso en marcha', await js("(()=>{const d=[...document.querySelectorAll('#slider [data-go]')];return d.length===SLIDES.length && d.every(b=>b.getBoundingClientRect().height>=44) && slider.classList.contains('is-playing')})()") === true);
ok('Portada: la leyenda de un repuesto enlaza a su ficha', await js("(()=>{const a=document.querySelector('#slider .slide[data-i=\"1\"] .figlink');return !!a && a.getAttribute('href')==='#/repuesto/valvula-de-admision-65-04101-0026'})()") === true);
const idxA = await js("Number(document.querySelector('#slider .slide.is-active').dataset.i)");
await wait(3600);
const idxB = await js("Number(document.querySelector('#slider .slide.is-active').dataset.i)");
ok('Portada: rota sola cada 3 segundos', idxA !== idxB, idxA + ' -> ' + idxB);
ok('Portada: se detiene al pasar el cursor', await js("(()=>{slider.dispatchEvent(new PointerEvent('pointerenter'));return !slider.classList.contains('is-playing')})()") === true);
const idxC = await js("Number(document.querySelector('#slider .slide.is-active').dataset.i)");
await wait(3400);
ok('Portada: en pausa no cambia', await js("Number(document.querySelector('#slider .slide.is-active').dataset.i)") === idxC);
ok('Portada: al salir el cursor sigue', await js("(()=>{slider.dispatchEvent(new PointerEvent('pointerleave'));return slider.classList.contains('is-playing')})()") === true);
ok('Portada: los puntos cambian de diapositiva y marcan la activa', await js("(()=>{document.querySelectorAll('#slider [data-go]')[2].click();const a=document.querySelector('#slider .slide.is-active');return a.dataset.i==='2' && document.querySelectorAll('#slider [data-go]')[2].getAttribute('aria-selected')==='true' && a.getAttribute('aria-hidden')==='false'})()") === true);

// ---------- profundidad 3D ----------
const hoverable = await js("matchMedia('(hover:hover) and (pointer:fine)').matches");
if (hoverable) {
  ok('3D: la portada se inclina con el cursor', await js("(()=>{const m=document.querySelector('.machine');const r=m.getBoundingClientRect();m.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,clientX:r.left+r.width*0.9,clientY:r.top+r.height*0.2}));return /rotateY\\(/.test(document.getElementById('tilt').style.transform)})()") === true);
  ok('3D: vuelve a su sitio al salir', await js("(()=>{const m=document.querySelector('.machine');m.dispatchEvent(new PointerEvent('pointerleave'));return document.getElementById('tilt').style.transform===''})()") === true);
  ok('3D: las tarjetas de categoría se inclinan', await js("(()=>{const c=document.querySelector('.cat');const r=c.getBoundingClientRect();c.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,clientX:r.left+r.width*0.8,clientY:r.top+r.height*0.3}));return c.classList.contains('is-tilt') && c.style.getPropertyValue('--ry')!==''})()") === true);
  ok('3D: la tarjeta se endereza al salir', await js("(()=>{const c=document.querySelector('.cat');c.dispatchEvent(new PointerEvent('pointerout',{bubbles:true,relatedTarget:document.body}));return !c.classList.contains('is-tilt')})()") === true);
  ok('3D: el foco del hero sigue al cursor', await js("(()=>{const h=document.getElementById('inicio');const r=h.getBoundingClientRect();h.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,clientX:r.left+r.width*0.25,clientY:r.top+r.height*0.5}));return h.style.getPropertyValue('--mx')!==''})()") === true);
} else {
  ok('3D: sin ratón (táctil) no se activa la inclinación', await js("document.getElementById('tilt').style.transform===''") === true);
}

// ---------- búsqueda tolerante ----------
async function search(q){
  return js("(()=>{const e=document.getElementById('search');e.value=" + JSON.stringify(q) + ";e.dispatchEvent(new Event('input'));return document.querySelectorAll('#products .product').length})()");
}
for (const q of ['65.04101-0026','65041010026','6504101 0026','65.04101 0026','65-04101-0026','0026','65.04101'])
  ok('Busca "' + q + '" -> 1 resultado', await search(q) === 1);
for (const q of ['valvula','VALVULA','Válvula','VÁLVULA DE ADMISIÓN','admision','admisión'])
  ok('Busca "' + q + '" -> 1 resultado', await search(q) === 1);
ok('Busca "DX300" -> 1', await search('DX300') === 1);
ok('Busca "dx 300" -> 1', await search('dx 300') === 1);
ok('Busca "DE08TIS" -> 1', await search('DE08TIS') === 1);
ok('Busca "interruptor" -> 1', await search('interruptor') === 1);
ok('Busca "24v" -> 1', await search('24v') === 1);
ok('Busca "motor" -> 2 (categoría + nombre)', await search('motor') === 2);
const noRes = await js("(()=>{const e=document.getElementById('search');e.value='zzzzz';e.dispatchEvent(new Event('input'));return (document.querySelector('#products .state')||{}).textContent||''})()");
ok('Sin coincidencias muestra estado sin resultados', noRes.includes('No encontramos resultados'));
ok('Estado sin resultados ofrece solicitar', noRes.includes('Solicitar este repuesto'));
await search('');

// ---------- sugerencias ----------
ok('Sugerencias al escribir un código parcial', await js("(()=>{const e=document.getElementById('search');e.value='65.04';e.dispatchEvent(new Event('input'));return catSug.dataset.open==='true' && catSug.querySelector('li b').textContent==='65.04101-0026'})()") === true);
ok('Sugerencia de máquina al escribir dx', await js("(()=>{const e=document.getElementById('search');e.value='dx';e.dispatchEvent(new Event('input'));return [...catSug.querySelectorAll('li b')].some(b=>b.textContent==='DOOSAN DX300')})()") === true);
ok('Flecha abajo selecciona y Escape cierra', await js("(()=>{const e=document.getElementById('search');e.value='valv';e.dispatchEvent(new Event('input'));e.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown'}));const sel=catSug.querySelector('[aria-selected=true]')&&e.getAttribute('aria-activedescendant')==='catSug-0';e.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));return sel && catSug.dataset.open==='false'})()") === true);
ok('Enter sobre una sugerencia de producto abre su ficha', await js("(()=>{const e=document.getElementById('heroSearch');e.value='interr';e.dispatchEvent(new Event('input'));e.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown'}));e.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'}));return location.hash})()") === '#/repuesto/interruptor-de-motor-24v');
await wait(500);
ok('…y la ficha está abierta', await js("!document.getElementById('detail').hidden") === true);
await js("location.hash='#catalogo'"); await wait(400);
await search('');

// ---------- filtros combinables ----------
async function setSel(id, v){
  return js("(()=>{const e=document.getElementById('" + id + "');e.value=" + JSON.stringify(v) + ";e.dispatchEvent(new Event('change'));return document.querySelectorAll('#products .product').length})()");
}
ok('Filtro categoría Motor -> 1', await setSel('category','Motor') === 1);
ok('Combinado categoría + máquina -> 1', await setSel('machine','DOOSAN DX300') === 1);
ok('Combinado + disponibilidad -> 1', await setSel('availability','consultar') === 1);
ok('3 chips de filtro activos', await js("document.querySelectorAll('#chips .chip').length") === 3);
const imposible = await js("(()=>{const e=document.getElementById('category');e.value='Frenos';e.dispatchEvent(new Event('change'));return (document.querySelector('#products .state')||{}).textContent||''})()");
ok('Combinación imposible -> sin resultados', imposible.includes('No encontramos resultados'));
ok('Quitar chips restaura el catálogo', await js("(()=>{let g=0;while(document.querySelector('#chips [data-clear]')&&g<9){document.querySelector('#chips [data-clear]').click();g++;}return document.querySelectorAll('#chips .chip').length===0&&document.querySelectorAll('#products .product').length===2})()") === true);
ok('Solo hay máquinas registradas en el filtro', await js("[...document.getElementById('machine').options].map(o=>o.value).join('|')") === '|DOOSAN DX300');

// ---------- WhatsApp con el número real ----------
const MSG1 = 'Hola, deseo cotizar el repuesto Válvula de admisión, código 65.04101-0026. ¿Podrían confirmarme precio y disponibilidad?';
const MSG2 = 'Hola, deseo cotizar el repuesto Interruptor de motor 24V. ¿Podrían confirmarme precio y disponibilidad?';
ok('Mensaje con código exacto', await js("quoteMessage(ALL[0])") === MSG1);
ok('Mensaje sin código, sin coma suelta', await js("quoteMessage(ALL[1])") === MSG2);
ok('CTA de tarjeta apunta a wa.me con el número y el mensaje', await js("document.querySelector('.product-actions .btn-primary').getAttribute('href')") === 'https://wa.me/51937419437?text=' + encodeURIComponent(MSG1));
ok('CTA abre en pestaña nueva de forma segura', await js("(()=>{const a=document.querySelector('.product-actions .btn-primary');return a.target==='_blank'&&a.rel==='noopener'})()") === true);
ok('Botón flotante de WhatsApp visible en escritorio', await js("!fab.hidden && fab.href.startsWith('https://wa.me/51937419437?text=')") === true);

// ---------- datos comerciales reales, nada inventado ----------
const cards = await js("[...document.querySelectorAll('#contactCards .contact-card b')].map(b=>b.textContent.trim())");
ok('Tarjetas de contacto: WhatsApp, Teléfono, Correo, Horario, Dirección', JSON.stringify(cards) === JSON.stringify(['WhatsApp','Teléfono','Correo','Horario','Dirección']), JSON.stringify(cards));
ok('Teléfono enlazado con tel:', await js("document.querySelector('#contactCards a[href=\"tel:+51937419437\"]')!==null") === true);
ok('Correo enlazado con mailto:', await js("document.querySelector('#contactCards a[href=\"mailto:ventas@dogeparts.pe\"]')!==null") === true);
ok('Dirección visible con enlace Cómo llegar', await js("(()=>{const a=[...document.querySelectorAll('#contactCards a')].find(a=>a.textContent.includes('Cómo llegar'));return !!a && a.href.includes('google.com/maps') && decodeURIComponent(a.href).includes('Nicolás Arriola 1419')})()") === true);
ok('Horario tal como se entregó', (await js("document.querySelector('#contactCards').textContent")).includes('9:00 a. m. – 6:00 p. m.'));
ok('No hay tarjetas de Instagram ni Facebook (no configurados)', !cards.includes('Instagram') && !cards.includes('Facebook'));
ok('Barra superior muestra el teléfono real', (await js("topbarContact.innerHTML")).includes('tel:+51937419437'));
ok('Pie muestra teléfono, correo, dirección y horario', await js("(()=>{const t=footerContact.textContent;return t.includes('+51 937 419 437')&&t.includes('ventas@dogeparts.pe')&&t.includes('Nicolás Arriola')&&t.includes('9:00')})()") === true);
ok('El mapa no carga nada de Google antes de llegar a la sección', await js("map.querySelector('iframe')===null && !!document.getElementById('loadMap')") === true);
ok('Al pedir el mapa se incrusta con la dirección real y el enlace Cómo llegar', await js("(()=>{document.getElementById('loadMap').click();const f=map.querySelector('iframe');return !!f && f.src.includes('google.com/maps') && decodeURIComponent(f.src).includes('Nicolás Arriola 1419') && !!map.querySelector('.map-link')})()") === true);

// ---------- datos estructurados ----------
const ld = await js("[...document.querySelectorAll('script[type=\"application/ld+json\"]')].map(s=>JSON.parse(s.textContent))");
const org = ld.find(x => x['@type'] === 'AutoPartsStore');
const list = ld.find(x => x['@type'] === 'ItemList');
ok('JSON-LD de la empresa con teléfono, correo y dirección reales', !!org && org.telephone === '+51 937 419 437' && org.email === 'ventas@dogeparts.pe' && /Arriola 1419/.test(org.address), JSON.stringify(org));
ok('JSON-LD no incluye horario con días inventados', !!org && !org.openingHours && !org.openingHoursSpecification);
ok('JSON-LD de productos: 2, con sku solo cuando hay código', !!list && list.numberOfItems === 2 && list.itemListElement[0].item.sku === '65.04101-0026' && !('sku' in list.itemListElement[1].item));
ok('JSON-LD de productos sin precio, stock ni valoraciones', !!list && list.itemListElement.every(i => !i.item.offers && !i.item.aggregateRating && !i.item.review));

// ---------- ficha de producto ----------
await js("location.hash='#/repuesto/valvula-de-admision-65-04101-0026'");
await wait(600);
ok('La ficha abre por su propia URL', await js("!document.getElementById('detail').hidden") === true);
ok('Título del documento cambia', (await js("document.title")) === 'Válvula de admisión 65.04101-0026 | DOGEPARTS SAC');
ok('og:title y og:image cambian', await js("document.querySelector('meta[property=\"og:title\"]').content.includes('Válvula de admisión') && document.querySelector('meta[property=\"og:image\"]').content.includes('valvula-65041010026')") === true);
ok('Muestra el aviso de número de serie', (await js("document.querySelector('.warn').textContent")).includes('Confirma la aplicación con el número de serie de tu equipo antes de comprar.'));
ok('Muestra Consultar precio', (await js("document.querySelector('.spec').textContent")).includes('Consultar precio'));
ok('Muestra la aplicación registrada', (await js("document.querySelector('.spec').textContent")).includes('DOOSAN DX300 · 1146 · DE08TIS'));
ok('Sin similares entre categorías distintas', await js("document.querySelectorAll('.similar').length") === 0);
ok('Botones Copiar código y Compartir presentes', await js("!!document.getElementById('copyCode') && !!document.getElementById('shareBtn')") === true);
ok('CTA de la ficha va a WhatsApp con el mensaje exacto', await js("document.querySelector('.detail-actions .btn-primary').getAttribute('href')") === 'https://wa.me/51937419437?text=' + encodeURIComponent(MSG1));
await shot('05-ficha-valvula');
ok('Zoom usa la versión grande, no la previa', await js("(()=>{document.getElementById('zoomBtn').click();const im=document.querySelector('#lightbox img');const r=im&&im.getAttribute('src')===ALL[0].images[0].full;document.getElementById('lbClose').click();return r})()") === true);
await js("location.hash='#/repuesto/interruptor-de-motor-24v'"); await wait(500);
ok('Ficha sin código no muestra bloque de código ni botón de copiar', await js("!document.querySelector('.detail-body .code') && !document.getElementById('copyCode')") === true);
ok('Compatibilidad pendiente se declara como pendiente', (await js("document.querySelector('.spec').textContent")).includes('Pendiente de confirmar con el número de serie'));
ok('No inventa compatibilidad para el interruptor', !(await js("document.querySelector('.spec').textContent")).includes('DX300'));
await js("location.hash='#/repuesto/no-existe'"); await wait(500);
ok('Slug inexistente cierra la ficha sin romper', await js("document.getElementById('detail').hidden") === true);
await js("location.hash='#catalogo'"); await wait(400);
ok('Título vuelve al base al cerrar', (await js("document.title")).startsWith('DOGEPARTS SAC |'));

// ---------- formulario ----------
ok('Envío vacío marca errores y no da éxito', await js("(()=>{requestForm.dispatchEvent(new Event('submit',{cancelable:true}));return document.querySelectorAll('.form [aria-invalid=\"true\"]').length>=3&&notice.dataset.kind==='error'})()") === true);
ok('Sin teléfono ni correo -> error', (await js("(()=>{rName.value='Constructora X';rMsg.value='Necesito la válvula';rPhone.value='';rMail.value='';requestForm.dispatchEvent(new Event('submit',{cancelable:true}));return errPhone.textContent})()")).includes('teléfono'));
ok('Correo mal formado -> error', (await js("(()=>{rMail.value='abc@';requestForm.dispatchEvent(new Event('submit',{cancelable:true}));return errMail.textContent})()")).includes('formato'));
ok('Teléfono demasiado corto -> error', (await js("(()=>{rMail.value='';rPhone.value='12';requestForm.dispatchEvent(new Event('submit',{cancelable:true}));return errPhone.textContent})()")).includes('incompleto'));
ok('Solicitud válida sin adjunto -> resumen preparado', await js("(()=>{rMail.value='compras@ejemplo.com';rPhone.value='987654321';rCode.value='65.04101-0026';rModel.value='DX300';requestForm.dispatchEvent(new Event('submit',{cancelable:true}));return notice.dataset.kind==='ok'&&notice.querySelector('pre').textContent.includes('65.04101-0026')})()") === true);
ok('Ofrece continuar por WhatsApp y por correo con el resumen', await js("(()=>{const a=[...notice.querySelectorAll('a')];return a.some(x=>x.href.startsWith('https://wa.me/51937419437?text=Hola%2C%20quiero%20solicitar'))&&a.some(x=>x.href.startsWith('mailto:ventas@dogeparts.pe?subject='))})()") === true);
ok('No afirma haber guardado ni enviado la solicitud', !/enviada|guardada|recibimos tu solicitud/i.test(await js("notice.textContent")));
ok('Rechaza 4 adjuntos', (await js("(()=>{const dt=new DataTransfer();for(let i=0;i<4;i++)dt.items.add(new File([new Uint8Array(10)],'f'+i+'.jpg',{type:'image/jpeg'}));rFiles.files=dt.files;rFiles.dispatchEvent(new Event('change'));return errFiles.textContent})()")).includes('máximo 3'));
ok('Rechaza formato no admitido', (await js("(()=>{const dt=new DataTransfer();dt.items.add(new File([new Uint8Array(10)],'malo.exe',{type:'application/x-msdownload'}));rFiles.files=dt.files;rFiles.dispatchEvent(new Event('change'));return errFiles.textContent})()")).includes('no es un formato admitido'));
ok('Rechaza archivo mayor a 5 MB', (await js("(()=>{const dt=new DataTransfer();dt.items.add(new File([new Uint8Array(6*1024*1024)],'grande.jpg',{type:'image/jpeg'}));rFiles.files=dt.files;rFiles.dispatchEvent(new Event('change'));return errFiles.textContent})()")).includes('supera los 5 MB'));
ok('Acepta adjunto válido y lo lista en el resumen', await js("(()=>{const dt=new DataTransfer();dt.items.add(new File([new Uint8Array(1024)],'placa.jpg',{type:'image/jpeg'}));rFiles.files=dt.files;rFiles.dispatchEvent(new Event('change'));requestForm.dispatchEvent(new Event('submit',{cancelable:true}));return errFiles.textContent===''&&notice.dataset.kind==='ok'&&notice.querySelector('pre').textContent.includes('placa.jpg')&&notice.textContent.includes('Adjunta las fotografías')})()") === true);
ok('Prellenado desde un producto rellena el código', await js("(()=>{rCode.value='';rMsg.value='';location.hash='#/repuesto/valvula-de-admision-65-04101-0026';return true})()") === true);
await wait(400);
ok('…al pulsar Enviar solicitud en la ficha', await js("(()=>{document.querySelector('.detail-actions [data-quote]').click();return rCode.value==='65.04101-0026'&&rMsg.value.includes('deseo cotizar')})()") === true);
await js("location.hash='#catalogo'"); await wait(300);

// ---------- accesibilidad ----------
ok('Todas las imágenes tienen alt', await js("[...document.images].every(i=>i.hasAttribute('alt'))") === true);
ok('Todas las imágenes reservan dimensiones', await js("[...document.images].every(i=>i.hasAttribute('width')&&i.hasAttribute('height'))") === true);
ok('Hay un único h1', await js("document.querySelectorAll('h1').length") === 1);
ok('Campos del formulario tienen label', await js("[...document.querySelectorAll('.form input,.form textarea')].every(e=>!!document.querySelector('label[for=\"'+e.id+'\"]'))") === true);
ok('Buscadores declaran combobox accesible', await js("['heroSearch','search'].every(id=>{const e=document.getElementById(id);return e.getAttribute('role')==='combobox'&&document.getElementById(e.getAttribute('aria-controls'))})") === true);
ok('Botón de menú declara aria-expanded', await js("menuBtn.getAttribute('aria-expanded')==='false'") === true);
const small = await js("[...document.querySelectorAll('a,button')].filter(e=>e.offsetParent!==null).map(e=>({s:e.tagName+'.'+(e.className||'-'),h:Math.round(e.getBoundingClientRect().height),t:e.textContent.trim().slice(0,24)})).filter(x=>x.h>0&&x.h<44)");
ok('Todos los controles visibles miden 44px o más de alto', small.length === 0, JSON.stringify(small));

// ---------- contraste (compone fondos con transparencia) ----------
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
  const sels=['.lead','.head p','.topbar span','.marquee span','.benefit p','.legal span','.footer p','.meta span','.code','.availability','.price','.catalog .eyebrow','.product p','.hint','.step p','.step .n','.cat small','.toolbar','.contact-card small','.map-face','.contact .head p'];
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

// ---------- responsive ----------
for (const [w,h,name] of [[320,780,'06-movil-320'],[375,812,'07-movil-375'],[768,1024,'08-tablet-768'],[1440,900,'09-escritorio']]) {
  await setViewport(w,h);
  await wait(500);
  const over = await js("document.documentElement.scrollWidth-document.documentElement.clientWidth");
  ok('Sin desbordamiento horizontal a ' + w + 'px', over <= 0, 'sobran ' + over + 'px');
  if(w < 900) ok('Barra inferior móvil con WhatsApp a ' + w + 'px', await js("(()=>{const b=document.getElementById('mbar');return getComputedStyle(b).display!=='none' && !!b.querySelector('a[href^=\"https://wa.me/51937419437\"]')})()") === true);
  await shot(name);
}


// ---------- mapa: carga automática al llegar a la sección ----------
await setViewport(1440,900);
await goto(URL_);
ok('Mapa: sin iframe al cargar la página', await js("map.querySelector('iframe')===null") === true);
await js("document.getElementById('contacto').scrollIntoView()");
await wait(1200);
ok('Mapa: se incrusta solo al llegar a Contacto, con la dirección real', await js("(()=>{const f=map.querySelector('iframe');return !!f && decodeURIComponent(f.src).includes('Nicolás Arriola 1419') && !!map.querySelector('.map-link')})()") === true);

// ---------- prefers-reduced-motion ----------
await c.send('Emulation.setEmulatedMedia', {features:[{name:'prefers-reduced-motion', value:'reduce'}]});
await goto(URL_);
ok('Movimiento reducido: la portada no rota sola', await js("!slider.classList.contains('is-playing') && document.querySelector('#slider .slide.is-active').dataset.i==='0'") === true);
await wait(3400);
ok('Movimiento reducido: sigue en la primera diapositiva', await js("document.querySelector('#slider .slide.is-active').dataset.i==='0'") === true);
ok('Movimiento reducido: los puntos siguen funcionando a mano', await js("(()=>{document.querySelectorAll('#slider [data-go]')[1].click();return document.querySelector('#slider .slide.is-active').dataset.i==='1'})()") === true);
ok('Movimiento reducido: sin inclinación 3D', await js("(()=>{const m=document.querySelector('.machine');const r=m.getBoundingClientRect();m.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,clientX:r.left+r.width*0.9,clientY:r.top+r.height*0.2}));return document.getElementById('tilt').style.transform===''})()") === true);
await c.send('Emulation.setEmulatedMedia', {features:[]});

console.log('\nRESULTADO: ' + pass + ' correctas, ' + fail + ' fallidas');
c.close();
process.exit(fail ? 1 : 0);
