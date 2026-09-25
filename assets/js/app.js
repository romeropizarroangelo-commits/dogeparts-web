/* =========================================================================
   DOGEPARTS SAC · Repuestos Genuinos — lógica de la web
   Los datos viven en datos/sitio.js y datos/productos.js. Este archivo no
   contiene ningún dato comercial.
   ========================================================================= */

const SITE = window.SITE || {};
const CATEGORIES = window.CATEGORIES || [];
const PRODUCTS = window.PRODUCTS || [];

const PER_PAGE = 24;
const AVAILABILITY_LABEL = {consultar:'Consultar disponibilidad', stock:'Disponible', pedido:'Bajo pedido'};
const SERIAL_WARNING = 'Confirma la aplicación con el número de serie de tu equipo antes de comprar.';
const BASE_TITLE = document.title;
const BASE_DESC = document.querySelector('meta[name=description]').content;
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.documentElement.classList.remove('no-js');

/* ---------- utilidades ---------- */
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const abs = path => SITE.siteUrl ? SITE.siteUrl.replace(/\/$/,'') + '/' + String(path).replace(/^\.?\//,'') : path;

/** Normaliza para búsqueda tolerante: sin tildes, minúsculas. */
function normalize(s){ return String(s ?? '').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().trim(); }
/** Versión compacta: además quita guiones, puntos, espacios y barras (para códigos). */
function compact(s){ return normalize(s).replace(/[\s._\-\/\\]/g,''); }

function haystack(p){
  const compatTxt = p.compat.map(c => `${c.machine||''} ${c.engine||''}`).join(' ');
  const specTxt = (p.specs||[]).map(s => `${s.k} ${s.v}`).join(' ');
  return [p.name, p.code, p.category, compatTxt, specTxt].join(' ');
}
function matchesQuery(p, q){
  if(!q) return true;
  const hay = haystack(p);
  return normalize(hay).includes(normalize(q)) || compact(hay).includes(compact(q));
}
function priceLabel(p){
  return (p.price === null || p.price === undefined || p.price === '') ? 'Consultar precio'
    : new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(p.price);
}
function machinesOf(p){ return p.compat.map(c => c.machine).filter(Boolean); }
function productUrl(p){ return abs('#/repuesto/' + p.slug); }

/* ---------- iconos (SVG en línea, sin librerías) ---------- */
const ICONS = {
  'Motor':'<circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
  'Sistema hidráulico':'<rect x="3" y="8" width="11" height="8" rx="1.5"/><path d="M14 12h7M18 9.5v5M6 8V5.5M6 18.5V16"/>',
  'Sistema eléctrico':'<path d="M13 2L5 13h6l-1 9 8-12h-6l1-8z"/>',
  'Transmisión':'<circle cx="8" cy="12" r="4"/><circle cx="17" cy="12" r="3"/><path d="M8 4v2M8 18v2M2 12h2M12 12h2M17 6v1.5M17 16.5V18"/>',
  'Tren de rodaje':'<rect x="2" y="8" width="20" height="8" rx="4"/><circle cx="7" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="17" cy="12" r="1.5"/>',
  'Frenos':'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
  'Filtros':'<path d="M3 4h18l-7 8v6l-4 2v-8z"/>',
  'Cabina y controles':'<rect x="3" y="7" width="14" height="12" rx="2"/><path d="M17 11h2.5l1.5 3v5h-4"/><rect x="6" y="10" width="6" height="5" rx="1"/>',
  'Implementos':'<path d="M3 8h10l6 4-2 6H6z"/><path d="M13 8V4M7 18l-1 3M16 18l1 3"/>',
  'Otros repuestos':'<circle cx="6" cy="6" r="1.6"/><circle cx="12" cy="6" r="1.6"/><circle cx="18" cy="6" r="1.6"/><circle cx="6" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18" cy="12" r="1.6"/><circle cx="6" cy="18" r="1.6"/><circle cx="12" cy="18" r="1.6"/><circle cx="18" cy="18" r="1.6"/>',
  headset:'<path d="M4 13v-1a8 8 0 0116 0v1"/><rect x="3" y="12" width="4" height="6" rx="1.5"/><rect x="17" y="12" width="4" height="6" rx="1.5"/><path d="M19 18a3 3 0 01-3 3h-3"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  shield:'<path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
  truck:'<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>',
  pin:'<path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
  phone:'<path d="M5 3h4l2 5-2.5 1.5a11 11 0 006 6L16 13l5 2v4a2 2 0 01-2 2A17 17 0 013 5a2 2 0 012-2z"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  share:'<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.6M8.2 13.2l7.6 4.6"/>',
  copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/>',
  zoom:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5M11 8v6M8 11h6"/>',
  up:'<path d="M12 19V5M5 12l7-7 7 7"/>',
  camera:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  social:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>'
};
const icon = (name, cls='') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]||''}</svg>`;
const WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 3.5A11.8 11.8 0 0012 0C5.5 0 .2 5.3.2 11.8c0 2.1.5 4.1 1.6 5.9L0 24l6.5-1.7a11.8 11.8 0 005.5 1.4c6.5 0 11.8-5.3 11.8-11.8 0-3.2-1.2-6.1-3.3-8.4zM12 21.7c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.8 1 1-3.7-.2-.4a9.8 9.8 0 01-1.5-5.2C2.1 6.4 6.5 2 12 2c2.6 0 5.1 1 6.9 2.9a9.7 9.7 0 012.9 6.9c0 5.4-4.4 9.9-9.8 9.9zm5.4-7.3c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4z"/></svg>';

/* ---------- WhatsApp ---------- */
/** Mensaje comercial exacto. Sin código, se omite la frase sin dejar comas sueltas. */
function quoteMessage(p){
  const head = p.code ? `Hola, deseo cotizar el repuesto ${p.name}, código ${p.code}`
                      : `Hola, deseo cotizar el repuesto ${p.name}`;
  return `${head}. ¿Podrían confirmarme precio y disponibilidad?`;
}
function waHref(text){
  const n = String(SITE.whatsapp||'').replace(/\D/g,'');
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : null;
}
const GENERIC_WA = 'Hola, deseo consultar por un repuesto.';
/** CTA de cotización: WhatsApp si está configurado, si no el formulario interno. */
function quoteCta(p, cls){
  const href = waHref(quoteMessage(p));
  return href
    ? `<a class="btn ${cls}" href="${esc(href)}" target="_blank" rel="noopener">${WA_ICON}Cotizar por WhatsApp</a>`
    : `<a class="btn ${cls}" href="#solicitar" data-quote="${esc(p.slug)}">Solicitar cotización</a>`;
}
const telHref = s => 'tel:' + String(s).replace(/[^\d+]/g,'');
const hasGeo = () => typeof SITE.lat === 'number' && typeof SITE.lon === 'number';
const mapSearchUrl = () => SITE.mapUrl || (SITE.address ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(SITE.address) : '');
const mapDirectionsUrl = () => hasGeo() ? `https://www.google.com/maps/dir/?api=1&destination=${SITE.lat},${SITE.lon}` : mapSearchUrl();
/** Mapa incrustado de OpenStreetMap (servicio oficial de incrustación, sin clave ni cuenta). */
const mapEmbedUrl  = () => hasGeo()
  ? `https://www.openstreetmap.org/export/embed.html?bbox=${(SITE.lon-0.0055).toFixed(6)},${(SITE.lat-0.0040).toFixed(6)},${(SITE.lon+0.0055).toFixed(6)},${(SITE.lat+0.0040).toFixed(6)}&layer=mapnik&marker=${SITE.lat},${SITE.lon}`
  : '';

/* ---------- carga de datos (punto único de cambio si algún día hay API) ---------- */
async function loadProducts(){
  return PRODUCTS.filter(p => p.published !== false);
}

let ALL = [];
let state = {q:'', category:'', machine:'', availability:'', page:1};

/* ---------- filtros ---------- */
function filtered(){
  return ALL.filter(p =>
    matchesQuery(p, state.q) &&
    (!state.category || p.category === state.category) &&
    (!state.machine || machinesOf(p).includes(state.machine)) &&
    (!state.availability || p.availability === state.availability)
  );
}

function fillSelects(){
  const cat = $('category');
  CATEGORIES.forEach(c => cat.insertAdjacentHTML('beforeend', `<option value="${esc(c)}">${esc(c)}</option>`));
  const machines = [...new Set(ALL.flatMap(machinesOf))].sort();
  const mac = $('machine');
  machines.forEach(m => mac.insertAdjacentHTML('beforeend', `<option value="${esc(m)}">${esc(m)}</option>`));
  if(!machines.length) mac.closest('div').hidden = true;
  const avails = [...new Set(ALL.map(p => p.availability))];
  const av = $('availability');
  avails.forEach(a => av.insertAdjacentHTML('beforeend', `<option value="${esc(a)}">${esc(AVAILABILITY_LABEL[a]||a)}</option>`));
}

function renderChips(){
  const active = [];
  if(state.q) active.push(['q', `Búsqueda: ${state.q}`]);
  if(state.category) active.push(['category', state.category]);
  if(state.machine) active.push(['machine', state.machine]);
  if(state.availability) active.push(['availability', AVAILABILITY_LABEL[state.availability]||state.availability]);
  $('chips').innerHTML = active.map(([k,label]) =>
    `<button type="button" class="chip" data-clear="${k}" aria-label="Quitar filtro ${esc(label)}">${esc(label)}<span class="x" aria-hidden="true">×</span></button>`).join('');
}

/* ---------- tarjetas ---------- */
function cardHtml(p, i=0){
  const img = p.images[0];
  const compatLine = p.compat.length
    ? p.compat.map(c => esc([c.machine, c.engine].filter(Boolean).join(' · '))).join('<br>')
    : 'Compatibilidad por confirmar con número de serie.';
  return `<article class="product" data-tilt style="--i:${i}">
    <a class="product-image" href="#/repuesto/${esc(p.slug)}" aria-label="Ver ficha de ${esc(p.name)}">
      <img src="${esc(img.src)}" alt="${esc(img.alt)}" width="${img.w}" height="${img.h}" loading="lazy" decoding="async">
      <span class="watermark" aria-hidden="true">DGP</span>
      ${p.featured ? '<span class="ribbon">Destacado</span>' : ''}
    </a>
    <div class="product-body">
      <div class="meta"><span>${esc(p.category)}</span>${p.compat.length ? `<span>${esc(p.compat[0].machine)}</span>` : ''}</div>
      <h3><a href="#/repuesto/${esc(p.slug)}">${esc(p.name)}</a></h3>
      ${p.code ? `<div class="code">Código ${esc(p.code)}</div>` : ''}
      <p>${p.compat.length ? 'Aplicación registrada:<br>' : ''}${compatLine}</p>
      <div class="tags">
        <span class="availability">${esc(AVAILABILITY_LABEL[p.availability]||p.availability)}</span>
        <span class="price">${esc(priceLabel(p))}</span>
      </div>
      <div class="product-actions">
        <a class="btn btn-ghost" href="#/repuesto/${esc(p.slug)}">Ver detalles</a>
        ${quoteCta(p,'btn-primary')}
      </div>
    </div>
  </article>`;
}

function skeletons(n){
  return Array.from({length:n}, () =>
    `<div class="skeleton" aria-hidden="true"><div class="sk-img"></div><div class="sk-body">
      <div class="sk-line" style="width:35%"></div><div class="sk-line" style="width:75%"></div>
      <div class="sk-line" style="width:55%"></div><div class="sk-line" style="width:45%"></div></div></div>`).join('');
}

function render(){
  const box = $('products');
  try{
    if(!ALL.length){
      box.innerHTML = `<div class="state"><b>Catálogo en preparación</b>
        Aún no hay repuestos publicados. Cuéntanos qué necesitas y te ayudamos a ubicarlo.
        <div><a class="btn btn-primary" href="#solicitar">Solicitar un repuesto</a></div></div>`;
      $('pager').hidden = true; $('resultCount').textContent = ''; renderChips(); return;
    }
    const list = filtered();
    const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    if(state.page > pages) state.page = pages;
    const slice = list.slice((state.page-1)*PER_PAGE, state.page*PER_PAGE);

    if(!list.length){
      box.innerHTML = `<div class="state"><b>No encontramos resultados</b>
        Prueba con menos filtros o escribe el código tal como aparece en la pieza.
        Si no está en el catálogo, envíanos el código o una fotografía y lo buscamos.
        <div><a class="btn btn-primary" href="#solicitar">Solicitar este repuesto</a></div></div>`;
    } else {
      box.innerHTML = slice.map((p,i) => cardHtml(p, i)).join('');
    }
    $('resultCount').textContent = list.length
      ? `${list.length} ${list.length === 1 ? 'repuesto' : 'repuestos'}${pages > 1 ? ` · página ${state.page} de ${pages}` : ''}`
      : '0 repuestos';
    renderChips();
    renderPager(pages);
  } catch(err){
    console.error(err);
    box.innerHTML = `<div class="state" data-kind="error"><b>No pudimos mostrar el catálogo</b>
      Ocurrió un problema al cargar los repuestos. Recarga la página o escríbenos para ayudarte.
      <div><a class="btn btn-primary" href="#solicitar">Solicitar un repuesto</a></div></div>`;
    $('pager').hidden = true;
  }
}

function renderPager(pages){
  const pager = $('pager');
  if(pages <= 1){ pager.hidden = true; pager.innerHTML = ''; return; }
  pager.hidden = false;
  let html = `<button type="button" data-page="${state.page-1}" ${state.page===1?'disabled':''} aria-label="Página anterior">‹</button>`;
  for(let i=1;i<=pages;i++){
    html += `<button type="button" data-page="${i}" ${i===state.page?'aria-current="true"':''} aria-label="Página ${i}">${i}</button>`;
  }
  html += `<button type="button" data-page="${state.page+1}" ${state.page===pages?'disabled':''} aria-label="Página siguiente">›</button>`;
  pager.innerHTML = html;
}

/* ---------- categorías ---------- */
function renderCategories(){
  const counts = {};
  ALL.forEach(p => counts[p.category] = (counts[p.category]||0) + 1);
  $('categoryGrid').innerHTML = CATEGORIES.map((c,i) => {
    const n = counts[c] || 0;
    return `<button type="button" class="cat" data-tilt data-category="${esc(c)}" style="--i:${i}">
      <div class="top"><span>${String(i+1).padStart(2,'0')} / LÍNEA</span>${icon(c)}</div>
      <b>${esc(c)}</b>
      <small>${n ? `${n} ${n===1?'repuesto':'repuestos'} →` : 'Solicítalo →'}</small>
    </button>`;
  }).join('');
}

/* ---------- marquesina ---------- */
function renderMarquee(){
  const items = [...CATEGORIES, 'Despachos a todo el Perú', 'Atención especializada'];
  const track = items.map(t => `<span>${esc(t)}</span>`).join('');
  $('marqueeClip').innerHTML = `<div class="marquee">${track}${track}</div>`;
}

/* ---------- sugerencias de búsqueda ---------- */
function buildSuggestions(q){
  const n = normalize(q), c = compact(q);
  if(!c) return [];
  const out = [];
  for(const p of ALL){
    if(p.code && compact(p.code).includes(c)) out.push({kind:'product', type:'Código', main:p.code, sub:p.name, slug:p.slug});
    else if(normalize(p.name).includes(n)) out.push({kind:'product', type:'Repuesto', main:p.name, sub:p.code||p.category, slug:p.slug});
    else if(compact(haystack(p)).includes(c)) out.push({kind:'product', type:'Repuesto', main:p.name, sub:p.code||p.category, slug:p.slug});
  }
  for(const m of [...new Set(ALL.flatMap(machinesOf))])
    if(normalize(m).includes(n) || compact(m).includes(c)) out.push({kind:'machine', type:'Máquina', main:m, sub:'Ver repuestos compatibles', value:m});
  for(const cat of CATEGORIES)
    if(normalize(cat).includes(n)) out.push({kind:'category', type:'Línea', main:cat, sub:'Ver la línea completa', value:cat});
  return out.slice(0, 7);
}

function attachSuggest(input, list){
  let items = [], sel = -1;
  const close = () => { list.dataset.open = 'false'; list.innerHTML = ''; input.setAttribute('aria-expanded','false'); input.removeAttribute('aria-activedescendant'); sel = -1; };
  const paint = () => {
    list.innerHTML = items.map((it,i) =>
      `<li role="option" id="${list.id}-${i}" ${i===sel?'aria-selected="true"':''} data-i="${i}">
        <b>${esc(it.main)}</b><span>${esc(it.sub)}</span><span class="k">${esc(it.type)}</span></li>`).join('');
    list.dataset.open = items.length ? 'true' : 'false';
    input.setAttribute('aria-expanded', String(!!items.length));
    if(sel >= 0) input.setAttribute('aria-activedescendant', `${list.id}-${sel}`); else input.removeAttribute('aria-activedescendant');
  };
  const pick = it => {
    close();
    if(it.kind === 'product'){
      input.value = it.main; state.q = it.main; state.page = 1; $('search').value = it.main; render();
      location.hash = '#/repuesto/' + it.slug;
    } else if(it.kind === 'machine'){
      input.value = ''; state.q = ''; state.machine = it.value; state.page = 1; $('search').value=''; $('machine').value = it.value; render(); goCatalog();
    } else {
      input.value = ''; state.q = ''; state.category = it.value; state.page = 1; $('search').value=''; $('category').value = it.value; render(); goCatalog();
    }
  };
  input.addEventListener('input', () => { items = buildSuggestions(input.value); sel = -1; paint(); });
  input.addEventListener('focus', () => { if(input.value){ items = buildSuggestions(input.value); paint(); } });
  input.addEventListener('keydown', e => {
    if(!items.length) return;
    if(e.key === 'ArrowDown'){ e.preventDefault(); sel = (sel+1) % items.length; paint(); }
    else if(e.key === 'ArrowUp'){ e.preventDefault(); sel = (sel-1+items.length) % items.length; paint(); }
    else if(e.key === 'Enter' && sel >= 0){ e.preventDefault(); pick(items[sel]); }
    else if(e.key === 'Escape'){ close(); }
  });
  input.addEventListener('blur', () => setTimeout(close, 150));
  list.addEventListener('mousedown', e => { e.preventDefault(); });
  list.addEventListener('click', e => { const li = e.target.closest('[data-i]'); if(li) pick(items[Number(li.dataset.i)]); });
}
function goCatalog(){ document.getElementById('catalogo').scrollIntoView({behavior: REDUCED ? 'auto' : 'smooth'}); }

/* ---------- ficha de producto ---------- */
let lastFocus = null;

function detailHtml(p){
  const img = p.images[0];
  const compatRows = p.compat.length
    ? p.compat.map(c => `<tr><th>Aplicación registrada</th><td>${esc([c.machine,c.engine].filter(Boolean).join(' · '))}</td></tr>`).join('')
    : `<tr><th>Aplicación registrada</th><td>Pendiente de confirmar con el número de serie.</td></tr>`;
  const specRows = (p.specs||[]).map(s => `<tr><th>${esc(s.k)}</th><td>${esc(s.v)}</td></tr>`).join('');
  const similar = ALL.filter(o => o.slug !== p.slug && (
      o.category === p.category ||
      o.compat.some(c => p.compat.some(d => c.machine && c.machine === d.machine))
    ));
  const thumbs = p.images.length > 1
    ? `<div class="thumbs">${p.images.map((im,i) =>
        `<button type="button" data-thumb="${i}" ${i===0?'aria-current="true"':''} aria-label="Ver fotografía ${i+1}">
          <img src="${esc(im.src)}" alt="" width="${im.w}" height="${im.h}" loading="lazy"></button>`).join('')}</div>`
    : '';
  return `<div class="detail-box">
    <div class="detail-bar">
      <nav aria-label="Ruta de navegación">
        <a href="#inicio">Inicio</a><span aria-hidden="true">/</span>
        <a href="#catalogo">Catálogo</a><span aria-hidden="true">/</span>
        <span>${esc(p.name)}</span>
      </nav>
      <button class="detail-close" id="detailClose" aria-label="Cerrar ficha">✕</button>
    </div>
    <div class="detail-grid">
      <div class="gallery">
        <button class="main" id="zoomBtn" aria-label="Ampliar fotografía de ${esc(p.name)}">
          <img id="detailImg" src="${esc(img.src)}" alt="${esc(img.alt)}" width="${img.w}" height="${img.h}" decoding="async">
          <span class="watermark" aria-hidden="true">DGP</span>
          <span class="zoomhint">Clic para ampliar</span>
        </button>
        ${thumbs}
      </div>
      <div class="detail-body">
        <span class="eyebrow" style="color:var(--teal-dark)">${esc(p.category)}</span>
        <h2 id="detailTitle">${esc(p.name)}</h2>
        ${p.code ? `<div class="code">Código ${esc(p.code)}</div>` : ''}
        <div class="detail-tools">
          ${p.code ? `<button type="button" class="tool" id="copyCode" data-code="${esc(p.code)}">${icon('copy')}Copiar código</button>` : ''}
          <button type="button" class="tool" id="shareBtn">${icon('share')}Compartir</button>
        </div>
        <table class="spec">
          <tbody>
            <tr><th>Categoría</th><td>${esc(p.category)}</td></tr>
            ${compatRows}
            ${specRows}
            <tr><th>Disponibilidad</th><td>${esc(AVAILABILITY_LABEL[p.availability]||p.availability)}</td></tr>
            <tr><th>Precio</th><td>${esc(priceLabel(p))}</td></tr>
          </tbody>
        </table>
        <p class="warn"><b>Importante:</b> ${esc(SERIAL_WARNING)}</p>
        <div class="detail-actions">
          ${quoteCta(p,'btn-primary')}
          <a class="btn btn-light" href="#solicitar" data-quote="${esc(p.slug)}">Enviar solicitud</a>
        </div>
      </div>
    </div>
    ${similar.length ? `<div class="similar"><h3>Productos similares</h3><div class="products">${similar.slice(0,2).map((s,i)=>cardHtml(s,i)).join('')}</div></div>` : ''}
  </div>`;
}

function openDetail(slug){
  const p = ALL.find(x => x.slug === slug);
  if(!p){ closeDetail(true); return; }
  const box = $('detail');
  box.innerHTML = detailHtml(p);
  box.dataset.img = 0;
  box.hidden = false;
  box.classList.add('open');
  document.body.style.overflow = 'hidden';
  lastFocus = document.activeElement;
  $('detailClose').focus();
  setMeta(p);
}
function closeDetail(silent){
  const box = $('detail');
  if(box.hidden) return;
  box.classList.remove('open');
  box.hidden = true;
  box.innerHTML = '';
  document.body.style.overflow = '';
  setMeta(null);
  if(lastFocus && !silent){ try{ lastFocus.focus(); }catch(e){} }
  lastFocus = null;
}
function currentProduct(){
  const slug = (location.hash.match(/^#\/repuesto\/(.+)$/)||[])[1];
  return slug ? ALL.find(x => x.slug === decodeURIComponent(slug)) : null;
}
/** Título, descripción y Open Graph por producto. */
function setMeta(p){
  const set = (sel, val) => { const el = document.querySelector(sel); if(el) el.setAttribute('content', val); };
  const canon = document.querySelector('link[rel=canonical]');
  if(!p){
    document.title = BASE_TITLE;
    set('meta[name=description]', BASE_DESC);
    set('meta[property="og:title"]', 'DOGEPARTS SAC | Repuestos Genuinos');
    set('meta[property="og:description"]', BASE_DESC);
    set('meta[property="og:image"]', abs('assets/img/hero-excavadora.webp'));
    set('meta[property="og:url"]', abs(''));
    if(canon) canon.href = abs('');
    return;
  }
  const t = `${p.name}${p.code ? ` ${p.code}` : ''} | DOGEPARTS SAC`;
  const compatTxt = p.compat.length ? ` Aplicación registrada: ${p.compat.map(c=>[c.machine,c.engine].filter(Boolean).join(' · ')).join('; ')}.` : '';
  const d = `${p.name}${p.code ? `, código ${p.code}` : ''}.${compatTxt} Solicita precio y disponibilidad a DOGEPARTS SAC.`;
  document.title = t;
  set('meta[name=description]', d);
  set('meta[property="og:title"]', t);
  set('meta[property="og:description"]', d);
  set('meta[property="og:image"]', abs(p.images[0].src));
  set('meta[property="og:url"]', productUrl(p));
  if(canon) canon.href = productUrl(p);
}

/* ---------- lightbox ---------- */
function openLightbox(src, alt){
  const lb = $('lightbox');
  lb.innerHTML = `<img src="${esc(src)}" alt="${esc(alt)}"><button type="button" id="lbClose" aria-label="Cerrar ampliación">✕</button>`;
  lb.classList.add('open');
  $('lbClose').focus();
}
function closeLightbox(){
  const lb = $('lightbox');
  lb.classList.remove('open');
  lb.innerHTML = '';
  const z = $('zoomBtn'); if(z) z.focus();
}

/* ---------- enrutado por hash ---------- */
function route(){
  const m = location.hash.match(/^#\/repuesto\/(.+)$/);
  if(m) openDetail(decodeURIComponent(m[1]));
  else closeDetail(true);
}

/* ---------- contacto (solo campos configurados) ---------- */
function renderContact(){
  const cards = [
    SITE.whatsapp && ['WhatsApp', 'phone', `<a href="${esc(waHref(GENERIC_WA))}" target="_blank" rel="noopener">Escribir por WhatsApp →</a><small>${esc(SITE.phone || '+' + SITE.whatsapp)}</small>`],
    SITE.phone && ['Teléfono', 'phone', `<a href="${esc(telHref(SITE.phone))}">${esc(SITE.phone)}</a><small>Llamada directa</small>`],
    SITE.email && ['Correo', 'mail', `<a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a><small>Cotizaciones y consultas</small>`],
    SITE.hours && ['Horario', 'clock', `<span>${esc(SITE.hours)}</span>`],
    SITE.address && ['Dirección', 'pin', `<span>${esc(SITE.address)}</span><small><a href="${esc(mapSearchUrl())}" target="_blank" rel="noopener">Cómo llegar →</a></small>`, 'wide'],
    SITE.instagram && ['Instagram', 'social', `<a href="${esc(SITE.instagram)}" target="_blank" rel="noopener">Ver perfil</a>`],
    SITE.facebook && ['Facebook', 'social', `<a href="${esc(SITE.facebook)}" target="_blank" rel="noopener">Ver página</a>`]
  ].filter(Boolean);

  $('contactCards').innerHTML = cards.length
    ? cards.map(([k,ic,v,extra]) => `<div class="contact-card ${extra||''}"><b>${icon(ic)}${esc(k)}</b>${v}</div>`).join('')
    : `<div class="contact-empty"><p>Los datos de contacto aún no están configurados. Mientras tanto envíanos tu solicitud y el equipo comercial te responderá.</p><a class="btn btn-primary" href="#solicitar">Enviar solicitud</a></div>`;

  const map = $('map');
  if(SITE.address){
    map.hidden = false;
    map.innerHTML = `<div class="map-face">${icon('pin')}<b>${esc(SITE.address)}</b>
      <span>${hasGeo() ? 'Cargando el mapa…' : 'Mapa no disponible: faltan las coordenadas del local.'}</span>
      <div class="row"><a class="btn btn-primary btn-sm" href="${esc(mapDirectionsUrl())}" target="_blank" rel="noopener">Cómo llegar</a>
      <a class="btn btn-light btn-sm" href="${esc(mapSearchUrl())}" target="_blank" rel="noopener">Abrir en Google Maps</a></div></div>`;
  } else {
    map.hidden = true;
    document.querySelector('.contact-grid').style.gridTemplateColumns = '1fr';
  }

  const fc = $('footerContact');
  const flines = [
    SITE.phone && `<p><a href="${esc(telHref(SITE.phone))}">${esc(SITE.phone)}</a></p>`,
    SITE.email && `<p><a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a></p>`,
    SITE.address && `<p>${esc(SITE.address)}</p>`,
    SITE.hours && `<p>${esc(SITE.hours)}</p>`
  ].filter(Boolean);
  if(flines.length) fc.insertAdjacentHTML('beforeend', flines.join(''));
  else fc.hidden = true;

  if(SITE.phone) $('topbarContact').innerHTML = `LIMA · <a href="${esc(telHref(SITE.phone))}">${esc(SITE.phone)}</a>`;
  else if(SITE.email) $('topbarContact').innerHTML = `LIMA · <a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a>`;

  const fab = $('fab');
  const wa = waHref(GENERIC_WA);
  if(wa){ fab.href = wa; fab.hidden = false; } else { fab.hidden = true; }
  $('mbar').innerHTML = wa
    ? `<a class="btn btn-primary" href="${esc(wa)}" target="_blank" rel="noopener">${WA_ICON}WhatsApp</a><a class="btn btn-ghost" href="#solicitar">Cotizar</a>`
    : `<a class="btn btn-ghost" href="#catalogo">Catálogo</a><a class="btn btn-primary" href="#solicitar">Cotizar</a>`;
}

/* ---------- mapa: se incrusta solo cuando la sección entra en pantalla ---------- */
function loadMap(){
  const map = $('map');
  if(map.hidden || map.querySelector('iframe') || !mapEmbedUrl()) return;
  map.insertAdjacentHTML('beforeend', `<iframe src="${esc(mapEmbedUrl())}" title="Mapa de ${esc(SITE.name||'DOGEPARTS SAC')}: ${esc(SITE.address)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    <div class="map-bar">
      <a class="map-link" href="${esc(mapDirectionsUrl())}" target="_blank" rel="noopener">${icon('pin')}Cómo llegar</a>
      <a class="map-link alt" href="${esc(mapSearchUrl())}" target="_blank" rel="noopener">Abrir en Google Maps</a>
    </div>`);
  map.querySelector('iframe').addEventListener('load', () => map.classList.add('is-loaded'));
}
function setupMap(){
  const map = $('map');
  if(map.hidden) return;
  const io = new IntersectionObserver(es => { if(es.some(e => e.isIntersecting)){ loadMap(); io.disconnect(); } }, {rootMargin:'300px 0px'});
  io.observe(map);
}

/* ---------- carrusel de portada ---------- */
const SLIDES = window.SLIDES || [];
const SLIDE_INTERVAL = Number(window.SLIDE_INTERVAL) || 3000;
let sliderTimer = null, sliderIndex = 0, sliderList = [], sliderStep = SLIDE_INTERVAL;

function initSlider(list, interval){
  const box = $('slider');
  sliderList = list; sliderIndex = 0; sliderStep = interval || SLIDE_INTERVAL;
  clearInterval(sliderTimer); sliderTimer = null;
  box.classList.remove('is-playing');
  box.style.setProperty('--interval', sliderStep + 'ms');
  box.innerHTML = list.map((s,i) => {
    const credit = s.credit ? `<span class="credit">Foto: ${esc(s.credit.author)} · ${esc(s.credit.license)}</span>` : '';
    const cap = `<figcaption>${s.kicker ? `<span class="kicker">${esc(s.kicker)}</span>` : ''}<b>${esc(s.title||'')}</b>${s.text ? `<small>${esc(s.text)}</small>` : ''}${credit}</figcaption>`;
    return `<figure class="slide ${s.fit==='cover'?'cover':''} ${i===0?'is-active':''}" data-i="${i}" aria-hidden="${i!==0}">
      <img src="${esc(s.src)}" alt="${esc(s.alt||'')}" width="${s.w||1100}" height="${s.h||777}" ${i===0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">
      ${s.href ? `<a class="figlink" href="${esc(s.href)}">${cap}</a>` : cap}
    </figure>`;
  }).join('') + (list.length > 1
    ? `<div class="dots" role="tablist" aria-label="Diapositivas">${list.map((s,i) => `<button type="button" role="tab" data-go="${i}" aria-selected="${i===0}" aria-label="Ver: ${esc(s.title||('diapositiva '+(i+1)))}"><span></span></button>`).join('')}</div><div class="slide-progress" aria-hidden="true"></div>`
    : '');
  if(list.length > 1 && !REDUCED) playSlider();
}
function showSlide(i){
  const slides = document.querySelectorAll('#slider .slide');
  if(!slides.length) return;
  sliderIndex = (i + slides.length) % slides.length;
  slides.forEach((s,k) => { s.classList.toggle('is-active', k === sliderIndex); s.setAttribute('aria-hidden', String(k !== sliderIndex)); });
  document.querySelectorAll('#slider [data-go]').forEach((b,k) => b.setAttribute('aria-selected', String(k === sliderIndex)));
}
function playSlider(){
  const box = $('slider');
  clearInterval(sliderTimer);
  sliderTimer = setInterval(() => showSlide(sliderIndex + 1), sliderStep);
  box.classList.add('is-playing');
}
function pauseSlider(){
  clearInterval(sliderTimer); sliderTimer = null;
  $('slider').classList.remove('is-playing');
}
function renderCredits(){
  const box = $('credits'); if(!box) return;
  const items = SLIDES.filter(s => s.credit);
  if(!items.length){ box.hidden = true; return; }
  box.hidden = false;
  box.innerHTML = `<b>Créditos fotográficos</b>` + items.map(s =>
    `<p><a href="${esc(s.credit.source)}" target="_blank" rel="noopener">${esc(s.title)}</a>: ${esc(s.credit.author)}, <a href="${esc(s.credit.licenseUrl)}" target="_blank" rel="noopener">${esc(s.credit.license)}</a>, vía Wikimedia Commons.</p>`).join('');
}
function setupSlider(){
  initSlider(SLIDES);
  renderCredits();
  const box = $('slider');
  box.addEventListener('pointerenter', () => { if(sliderList.length > 1) pauseSlider(); });
  box.addEventListener('pointerleave', () => { if(sliderList.length > 1 && !REDUCED) playSlider(); });
  box.addEventListener('focusin', () => { if(sliderList.length > 1) pauseSlider(); });
  box.addEventListener('focusout', e => { if(!box.contains(e.relatedTarget) && sliderList.length > 1 && !REDUCED) playSlider(); });
  box.addEventListener('click', e => {
    const b = e.target.closest('[data-go]'); if(!b) return;
    showSlide(Number(b.dataset.go));
    if(!REDUCED) playSlider();
  });
  document.addEventListener('visibilitychange', () => {
    if(sliderList.length < 2 || REDUCED) return;
    document.hidden ? pauseSlider() : playSlider();
  });
}

/* ---------- profundidad 3D (solo con ratón; nunca en táctil ni con movimiento reducido) ---------- */
function setupTilt(){
  const hero = $('inicio');
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
    hero.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
  }, {passive:true});
  if(REDUCED || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  const machine = document.querySelector('.machine'), tilt = $('tilt');
  machine.addEventListener('pointermove', e => {
    const r = machine.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    tilt.style.transform = `rotateY(${(x * 10).toFixed(2)}deg) rotateX(${(-y * 8).toFixed(2)}deg)`;
  }, {passive:true});
  machine.addEventListener('pointerleave', () => { tilt.style.transform = ''; });
  document.addEventListener('pointermove', e => {
    const el = e.target.closest && e.target.closest('[data-tilt]'); if(!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--rx', ((.5 - y) * 8).toFixed(2) + 'deg');
    el.style.setProperty('--ry', ((x - .5) * 10).toFixed(2) + 'deg');
    el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
    el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    el.classList.add('is-tilt');
  }, {passive:true});
  document.addEventListener('pointerout', e => {
    const el = e.target.closest && e.target.closest('[data-tilt]');
    if(el && !(e.relatedTarget && el.contains(e.relatedTarget))){
      el.classList.remove('is-tilt'); el.style.removeProperty('--rx'); el.style.removeProperty('--ry');
    }
  }, {passive:true});
}

/* ---------- datos estructurados (una sola fuente de verdad: SITE y PRODUCTS) ---------- */
function injectStructuredData(){
  const org = {
    '@context':'https://schema.org', '@type':'AutoPartsStore', '@id': abs('#organizacion'),
    name: SITE.name || 'DOGEPARTS SAC', slogan: SITE.slogan || 'Repuestos Genuinos',
    description: 'Repuestos para maquinaria pesada DOOSAN con atención especializada y despacho a todo el Perú.',
    areaServed: {'@type':'Country', name:'Perú'}
  };
  if(SITE.siteUrl) { org.url = SITE.siteUrl; org.logo = abs('assets/img/logo.webp'); }
  if(SITE.phone) org.telephone = SITE.phone;
  if(SITE.email) org.email = SITE.email;
  if(SITE.address) org.address = SITE.address;
  if(hasGeo()){ org.geo = {'@type':'GeoCoordinates', latitude: SITE.lat, longitude: SITE.lon}; org.hasMap = mapSearchUrl(); }
  const same = [SITE.instagram, SITE.facebook].filter(Boolean);
  if(same.length) org.sameAs = same;

  const crumbs = {'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[
    {'@type':'ListItem', position:1, name:'Inicio', item: abs('#inicio')},
    {'@type':'ListItem', position:2, name:'Catálogo', item: abs('#catalogo')}]};

  const list = {'@context':'https://schema.org','@type':'ItemList', name:'Catálogo DOGEPARTS', numberOfItems: ALL.length,
    itemListElement: ALL.map((p,i) => {
      const item = {'@type':'Product', name:p.name, category:p.category, url: productUrl(p), image: abs(p.images[0].src),
        description: `${p.name}${p.code ? `, código ${p.code}` : ''}. ${p.compat.length
          ? 'Aplicación registrada: ' + p.compat.map(c=>[c.machine,c.engine].filter(Boolean).join(' · ')).join('; ') + '.'
          : 'Compatibilidad pendiente de confirmar mediante el número de serie del equipo.'} ${SERIAL_WARNING}`};
      if(p.code) item.sku = p.code;
      return {'@type':'ListItem', position:i+1, item};
    })};

  [['ldOrg',org],['ldCrumbs',crumbs],['ldProducts',list]].forEach(([id,data]) => {
    let s = $(id);
    if(!s){ s = document.createElement('script'); s.type = 'application/ld+json'; s.id = id; document.head.appendChild(s); }
    s.textContent = JSON.stringify(data);
  });
}

/* ---------- formulario de solicitud ---------- */
const MAX_FILES = 3, MAX_SIZE = 5*1024*1024;
const OK_TYPES = ['image/jpeg','image/png','image/webp','application/pdf'];

function showError(inputId, errId, msg){
  const input = $(inputId), err = $(errId);
  if(msg){ input.setAttribute('aria-invalid','true'); err.textContent = msg; err.style.display='block'; }
  else { input.removeAttribute('aria-invalid'); err.textContent=''; err.style.display='none'; }
  return !msg;
}

function validateForm(){
  let ok = true;
  ok = showError('rName','errName', $('rName').value.trim() ? '' : 'Indica tu nombre o el de tu empresa.') && ok;
  ok = showError('rMsg','errMsg', $('rMsg').value.trim() ? '' : 'Describe el repuesto que necesitas.') && ok;

  const phone = $('rPhone').value.trim(), mail = $('rMail').value.trim();
  let phoneMsg = '', mailMsg = '';
  if(phone && phone.replace(/\D/g,'').length < 6) phoneMsg = 'El teléfono parece incompleto.';
  if(mail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) mailMsg = 'Revisa el formato del correo.';
  if(!phone && !mail){ phoneMsg = phoneMsg || 'Indica un teléfono o un correo.'; mailMsg = mailMsg || 'Indica un correo o un teléfono.'; }
  ok = showError('rPhone','errPhone', phoneMsg) && ok;
  ok = showError('rMail','errMail', mailMsg) && ok;

  const files = [...$('rFiles').files];
  let fileMsg = '';
  if(files.length > MAX_FILES) fileMsg = `Puedes adjuntar como máximo ${MAX_FILES} archivos.`;
  else {
    const bad = files.find(f => !OK_TYPES.includes(f.type));
    const big = files.find(f => f.size > MAX_SIZE);
    if(bad) fileMsg = `"${bad.name}" no es un formato admitido. Usa JPG, PNG, WEBP o PDF.`;
    else if(big) fileMsg = `"${big.name}" supera los 5 MB.`;
  }
  ok = showError('rFiles','errFiles', fileMsg) && ok;
  return ok;
}

function requestSummary(){
  const files = [...$('rFiles').files];
  const rows = [
    ['Nombre o empresa', $('rName').value.trim()],
    ['Teléfono', $('rPhone').value.trim()],
    ['Correo', $('rMail').value.trim()],
    ['Código del repuesto', $('rCode').value.trim()],
    ['Modelo de máquina', $('rModel').value.trim()],
    ['Número de serie', $('rSerial').value.trim()]
  ].filter(([,v]) => v);
  let txt = 'Hola, quiero solicitar un repuesto.\n\n';
  txt += rows.map(([k,v]) => `${k}: ${v}`).join('\n');
  txt += `\n\nDetalle: ${$('rMsg').value.trim()}`;
  if(files.length) txt += `\n\nAdjuntos a enviar: ${files.map(f => f.name).join(', ')}`;
  return txt;
}

function renderNotice(kind, html){
  const n = $('notice');
  n.dataset.kind = kind;
  n.innerHTML = html;
  n.style.display = 'block';
  n.focus();
}

$('requestForm').addEventListener('submit', e => {
  e.preventDefault();
  const btn = $('submitBtn');
  if(!validateForm()){
    renderNotice('error', `<b>Revisa los datos marcados</b><p>Corrige los campos señalados y vuelve a intentarlo.</p>`);
    const firstBad = document.querySelector('.form [aria-invalid="true"]');
    if(firstBad) firstBad.focus();
    return;
  }
  btn.disabled = true; btn.textContent = 'Preparando solicitud…';
  try{
    const txt = requestSummary();
    const files = [...$('rFiles').files];
    const wa = waHref(txt);
    const mail = SITE.email
      ? `mailto:${SITE.email}?subject=${encodeURIComponent('Solicitud de repuesto · DOGEPARTS SAC')}&body=${encodeURIComponent(txt)}`
      : null;
    const buttons = [
      wa && `<a class="btn btn-primary" href="${esc(wa)}" target="_blank" rel="noopener">${WA_ICON}Continuar por WhatsApp</a>`,
      mail && `<a class="btn btn-ghost" href="${esc(mail)}">Enviar por correo</a>`,
      `<button type="button" class="btn btn-ghost" id="copyBtn">Copiar solicitud</button>`
    ].filter(Boolean).join('');
    const channelNote = (wa || mail)
      ? `<p>Revisa el resumen y continúa por el canal que prefieras.${files.length ? ' Adjunta las fotografías en ese mismo chat o correo.' : ''}</p>`
      : `<p>Aún no hay un canal de contacto configurado en esta web. Copia el resumen y envíaselo al equipo comercial.${files.length ? ' Adjunta las fotografías al enviarlo.' : ''}</p>`;
    renderNotice('ok', `<b>Solicitud preparada</b>${channelNote}<pre>${esc(txt)}</pre><div class="row">${buttons}</div>`);
    const copy = $('copyBtn');
    if(copy) copy.addEventListener('click', async () => {
      try{ await navigator.clipboard.writeText(txt); copy.textContent = 'Copiado ✓'; }
      catch(err){ copy.textContent = 'Selecciona y copia el texto'; }
    });
  } catch(err){
    console.error(err);
    renderNotice('error', `<b>No pudimos preparar la solicitud</b><p>Vuelve a intentarlo en unos segundos.</p>`);
  } finally {
    btn.disabled = false; btn.textContent = 'Preparar solicitud';
  }
});

$('rFiles').addEventListener('change', () => {
  const files = [...$('rFiles').files];
  $('filesHint').textContent = files.length
    ? `${files.length} de ${MAX_FILES} archivo(s): ${files.map(f => f.name).join(', ')}`
    : `Hasta ${MAX_FILES} archivos JPG, PNG, WEBP o PDF · máximo 5 MB cada uno.`;
  validateForm();
});

/* ---------- eventos ---------- */
$('heroForm').addEventListener('submit', e => {
  e.preventDefault();
  state.q = $('heroSearch').value;
  state.page = 1;
  $('search').value = state.q;
  render();
  goCatalog();
});

$('search').addEventListener('input', e => { state.q = e.target.value; state.page = 1; render(); });
['category','machine','availability'].forEach(id =>
  $(id).addEventListener('change', e => { state[id] = e.target.value; state.page = 1; render(); }));

$('chips').addEventListener('click', e => {
  const b = e.target.closest('[data-clear]'); if(!b) return;
  const k = b.dataset.clear;
  state[k] = ''; state.page = 1;
  if(k === 'q') $('search').value = ''; else $(k).value = '';
  render();
});

$('pager').addEventListener('click', e => {
  const b = e.target.closest('[data-page]'); if(!b || b.disabled) return;
  state.page = Number(b.dataset.page);
  render();
  goCatalog();
});

$('categoryGrid').addEventListener('click', e => {
  const b = e.target.closest('[data-category]'); if(!b) return;
  state.category = b.dataset.category; state.q = ''; state.page = 1;
  $('category').value = state.category; $('search').value = '';
  render();
  goCatalog();
});

document.addEventListener('click', e => {
  const q = e.target.closest('[data-quote]');
  if(q){
    const p = ALL.find(x => x.slug === q.dataset.quote);
    if(p){
      closeDetail(true);
      $('rCode').value = p.code || '';
      if(!$('rMsg').value.trim()) $('rMsg').value = quoteMessage(p);
    }
    return;
  }
  if(e.target.closest('#detailClose') || e.target.id === 'detail'){ history.pushState(null,'','#catalogo'); closeDetail(); return; }
  if(e.target.closest('#zoomBtn')){
    const p = currentProduct(); const idx = Number($('detail').dataset.img || 0);
    if(p) openLightbox(p.images[idx].full || p.images[idx].src, p.images[idx].alt);
    return;
  }
  const t = e.target.closest('[data-thumb]');
  if(t){
    const p = currentProduct();
    if(p){
      const i = Number(t.dataset.thumb); $('detail').dataset.img = i;
      const im = p.images[i]; $('detailImg').src = im.src; $('detailImg').alt = im.alt;
      document.querySelectorAll('[data-thumb]').forEach(x => x.removeAttribute('aria-current'));
      t.setAttribute('aria-current','true');
    }
    return;
  }
  const cc = e.target.closest('#copyCode');
  if(cc){
    navigator.clipboard.writeText(cc.dataset.code).then(() => { cc.innerHTML = icon('copy') + 'Código copiado ✓'; }).catch(() => { cc.innerHTML = icon('copy') + cc.dataset.code; });
    return;
  }
  if(e.target.closest('#shareBtn')){
    const p = currentProduct(); if(!p) return;
    const data = {title: `${p.name}${p.code ? ' ' + p.code : ''} · DOGEPARTS SAC`, text: quoteMessage(p), url: productUrl(p).startsWith('http') ? productUrl(p) : location.href};
    const btn = $('shareBtn');
    if(navigator.share){ navigator.share(data).catch(()=>{}); }
    else { navigator.clipboard.writeText(data.url).then(() => { btn.innerHTML = icon('share') + 'Enlace copiado ✓'; }).catch(()=>{}); }
    return;
  }
  if(e.target.closest('#totop')){ window.scrollTo({top:0, behavior: REDUCED ? 'auto' : 'smooth'}); return; }
  if(e.target.closest('#lbClose') || e.target.id === 'lightbox'){ closeLightbox(); }
});

document.addEventListener('keydown', e => {
  if(e.key !== 'Escape') return;
  if($('lightbox').classList.contains('open')) { closeLightbox(); return; }
  if(!$('detail').hidden){ history.pushState(null,'','#catalogo'); closeDetail(); }
});

const menuBtn = $('menuBtn'), primaryNav = $('primaryNav');
menuBtn.addEventListener('click', () => {
  const open = primaryNav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});
primaryNav.addEventListener('click', e => {
  if(e.target.tagName === 'A'){ primaryNav.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false'); }
});

window.addEventListener('hashchange', route);

/* ---------- efectos de scroll (nunca bloquean la interacción) ---------- */
function setupScrollEffects(){
  const nav = document.querySelector('.nav'), progress = $('progress'), totop = $('totop');
  const hero = $('inicio'), machine = document.querySelector('.machine'), wm = document.querySelector('.hero-wm');
  let ticking = false;
  const update = () => {
    ticking = false;
    const y = window.scrollY || 0;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progress.style.transform = `scaleX(${Math.min(1, y / max)})`;
    nav.classList.toggle('is-scrolled', y > 40);
    totop.classList.toggle('show', y > 700);
    if(!REDUCED && window.innerWidth > 900 && y < hero.offsetHeight){
      machine.style.transform = `translateY(${(y * 0.12).toFixed(1)}px)`;
      wm.style.transform = `translateY(${(y * 0.3).toFixed(1)}px)`;
    }
  };
  window.addEventListener('scroll', () => { if(!ticking){ ticking = true; requestAnimationFrame(update); } }, {passive:true});
  update();

  const reveal = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ e.target.classList.add('on'); reveal.unobserve(e.target); } }), {threshold:0.02, rootMargin:'0px 0px -4% 0px'});
  document.querySelectorAll('.reveal,.stagger').forEach(el => reveal.observe(el));

  const steps = [...document.querySelectorAll('.step')], num = $('processNum');
  const activate = i => { steps.forEach((s,j) => s.classList.toggle('is-active', j === i)); if(num) num.textContent = String(i+1).padStart(2,'0'); };
  activate(0);
  if(steps.length){
    const so = new IntersectionObserver(es => { es.forEach(e => { if(e.isIntersecting) activate(steps.indexOf(e.target)); }); }, {rootMargin:'-42% 0px -42% 0px', threshold:0});
    steps.forEach(s => so.observe(s));
  }
}

/* ---------- arranque ---------- */
$('year').textContent = new Date().getFullYear();
$('products').innerHTML = skeletons(2);
renderMarquee();
setupSlider();
setupTilt();
loadProducts().then(list => {
  ALL = list;
  fillSelects();
  renderCategories();
  renderContact();
  setupMap();
  render();
  injectStructuredData();
  attachSuggest($('heroSearch'), $('heroSug'));
  attachSuggest($('search'), $('catSug'));
  setMeta(null);
  route();
}).catch(err => {
  console.error(err);
  ALL = [];
  renderContact();
  render();
}).finally(setupScrollEffects);
