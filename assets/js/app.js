/* =========================================================================
   DOGEPARTS SAC · Repuestos Genuinos — lógica de la web
   Los datos viven en datos/sitio.js, datos/productos.js y datos/portada.js.
   Este archivo no contiene ningún dato comercial.
   ========================================================================= */

const SITE = window.SITE || {};
const CATEGORIES = window.CATEGORIES || [];
const PRODUCTS = window.PRODUCTS || [];

const PAGE_STEP = 12;                       // resultados que se muestran por tanda ("Ver más")
const SUGGESTIONS = 5;                      // sugerencias con miniatura
const AVAILABILITY_LABEL = {consultar:'Consultar disponibilidad', stock:'Disponible', pedido:'Bajo pedido'};
const SERIAL_WARNING = 'Confirma la aplicación con el número de serie de tu equipo antes de comprar.';
const BASE_TITLE = document.title;
const BASE_DESC = document.querySelector('meta[name=description]').content;
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOBILE = () => window.innerWidth < 900;

document.documentElement.classList.remove('no-js');

/* ---------- utilidades ---------- */
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const abs = path => SITE.siteUrl ? SITE.siteUrl.replace(/\/$/,'') + '/' + String(path).replace(/^\.?\//,'') : path;
const store = {
  get(k, d){ try{ const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
};

/** Normaliza para búsqueda tolerante: sin tildes, minúsculas. */
function normalize(s){ return String(s ?? '').normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().trim(); }
/** Versión compacta: además quita guiones, puntos, espacios y barras (para códigos). */
function compact(s){ return normalize(s).replace(/[\s._\-\/\\]/g,''); }

function haystack(p){
  const compatTxt = p.compat.map(c => `${c.machine||''} ${c.engine||''}`).join(' ');
  const specTxt = (p.specs||[]).map(s => `${s.k} ${s.v}`).join(' ');
  return [p.name, p.code, p.brand, p.category, p.models, p.description, p.machineType, compatTxt, specTxt].join(' ');
}
function matchesQuery(p, q){
  if(!q) return true;
  const hay = haystack(p);
  return normalize(hay).includes(normalize(q)) || compact(hay).includes(compact(q));
}
/** Relevancia de un producto frente a una búsqueda (mayor = mejor). */
function scoreOf(p, q){
  if(!q) return 0;
  const n = normalize(q), c = compact(q);
  const code = compact(p.code), name = normalize(p.name);
  if(code && code === c) return 120;
  if(code && code.startsWith(c)) return 100;
  if(code && code.includes(c)) return 85;
  if(name.startsWith(n)) return 70;
  if(name.includes(n)) return 60;
  if(normalize(p.models).includes(n) || compact(p.models).includes(c)) return 50;
  if(normalize(p.brand).includes(n) || normalize(p.category).includes(n)) return 40;
  if(normalize(p.description).includes(n)) return 30;
  return 10;
}
function priceLabel(p){
  return (p.price === null || p.price === undefined || p.price === '') ? 'Consultar precio'
    : new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(p.price);
}
function machinesOf(p){ return [...new Set([p.machineType, ...p.compat.map(c => c.machine)].filter(Boolean))]; }
/** Línea de aplicación: compatibilidades confirmadas o, si no, los modelos del catálogo. */
function applicationText(p){
  if(p.compat.length) return p.compat.map(c => [c.machine, c.engine].filter(Boolean).join(' · ')).join('; ');
  return p.models || '';
}
/** Familia de modelo de un token del catálogo: 'DE08TIS' -> 'DE08', 'DX225LCA' -> 'DX225', 'ROBEX R380' -> 'ROBEX'. */
function familyOf(token){
  const t = String(token||'').trim().toUpperCase();
  if(/^ROBEX/.test(t)) return 'ROBEX';
  const m = t.match(/^([A-Z]{1,3}\d{2,4})/);
  return m ? m[1] : null;
}
function familiesOf(p){
  if(!p._fam) p._fam = [...new Set(String(p.models||'').split('/').map(familyOf).filter(Boolean))];
  return p._fam;
}
function productUrl(p){ return abs('#/repuesto/' + p.slug); }
function thumbOf(p){ return p.images[0].src; }
function fullOf(p){ return p.images[0].full || p.images[0].src; }

/* ---------- iconos (SVG en línea, sin librerías) ---------- */
const ICONS = {
  'Culata y válvulas':'<path d="M9 3h6v5l3 3v2H6v-2l3-3z"/><path d="M6 13v8h12v-8M10 17h4"/>',
  'Refrigeración':'<circle cx="12" cy="12" r="2.2"/><path d="M12 2.5v5M12 16.5v5M2.5 12h5M16.5 12h5M5.3 5.3l3.5 3.5M15.2 15.2l3.5 3.5M5.3 18.7l3.5-3.5M15.2 8.8l3.5-3.5"/>',
  'Empaques':'<path d="M3 7l9-4 9 4-9 4z"/><path d="M3 12l9 4 9-4M3 17l9 4 9-4"/>',
  'Eléctrico y control':'<path d="M13 2L5 13h6l-1 9 8-12h-6l1-8z"/>',
  'Lubricación':'<path d="M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z"/><path d="M9.5 14.5a2.5 2.5 0 002.5 2.5"/>',
  'Hidráulico':'<rect x="3" y="8" width="11" height="8" rx="1.5"/><path d="M14 12h7M18 9.5v5M6 8V5.5M6 18.5V16"/>',
  'Embrague':'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1"/>',
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
  search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/>',
  filter:'<path d="M3 5h18M6 12h12M10 19h4"/>',
  list:'<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1.3"/><circle cx="4" cy="12" r="1.3"/><circle cx="4" cy="18" r="1.3"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  minus:'<path d="M5 12h14"/>',
  check:'<path d="M5 12l5 5L20 7"/>',
  cart:'<path d="M4 5h2l2.2 10.5a1.5 1.5 0 001.5 1.2h7.9a1.5 1.5 0 001.5-1.2L21 8H7"/><circle cx="10" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/>',
  trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
  left:'<path d="M15 5l-7 7 7 7"/>',
  right:'<path d="M9 5l7 7-7 7"/>',
  close:'<path d="M6 6l12 12M18 6L6 18"/>',
  social:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>'
};
const icon = (name, cls='') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]||ICONS['Otros repuestos']}</svg>`;
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
function quoteCta(p, cls, label='Cotizar por WhatsApp'){
  const href = waHref(quoteMessage(p));
  return href
    ? `<a class="btn ${cls}" href="${esc(href)}" target="_blank" rel="noopener">${WA_ICON}${label}</a>`
    : `<a class="btn ${cls}" href="#solicitar" data-quote="${esc(p.slug)}">Solicitar cotización</a>`;
}
const telHref = s => 'tel:' + String(s).replace(/[^\d+]/g,'');
const hasGeo = () => typeof SITE.lat === 'number' && typeof SITE.lon === 'number';
const mapSearchUrl = () => SITE.mapUrl || (SITE.address ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(SITE.address) : '');
const mapDirectionsUrl = () => hasGeo() ? `https://www.google.com/maps/dir/?api=1&destination=${SITE.lat},${SITE.lon}` : mapSearchUrl();
/** Mapa de Google incrustado con el formato oficial de "Compartir → Insertar un mapa" (sin clave de API). */
function dmsLabel(lat, lon){
  const f = (v, pos, neg) => { const a = Math.abs(v), d = Math.floor(a), m = Math.floor((a-d)*60), s = ((a-d-m/60)*3600).toFixed(1); return `${d}°${String(m).padStart(2,'0')}'${s.padStart(4,'0')}"${v >= 0 ? pos : neg}`; };
  return `${f(lat,'N','S')} ${f(lon,'E','W')}`;
}
const mapEmbedUrl = () => {
  if(!hasGeo()) return '';
  const label = btoa(unescape(encodeURIComponent(dmsLabel(SITE.lat, SITE.lon))));
  return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1950.9!2d${SITE.lon}!3d${SITE.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${encodeURIComponent(label)}!5e0!3m2!1ses!2spe!4v1!5m2!1ses!2spe`;
};

/* ---------- carga de datos (punto único de cambio si algún día hay API) ---------- */
async function loadProducts(){
  return PRODUCTS.filter(p => p.published !== false);
}

let ALL = [];
const FILTER_KEYS = ['model','category','brand','machine','presentation','availability'];
let state = {q:'', model:'', category:'', brand:'', machine:'', presentation:'', availability:'', sort:'relevancia', view:'grid', shown: PAGE_STEP};
let currentList = [];        // resultado filtrado y ordenado completo (para la navegación de la ficha)

/* ---------- estado <-> URL (para compartir enlaces con resultados) ---------- */
const URL_KEYS = {q:'q', model:'modelo', category:'cat', brand:'marca', machine:'maquina', presentation:'pres', availability:'disp', sort:'orden', view:'vista'};
function readStateFromUrl(){
  const sp = new URLSearchParams(location.search);
  for(const [k, u] of Object.entries(URL_KEYS)){
    const v = sp.get(u);
    if(v !== null) state[k] = v;
  }
  if(!['relevancia','nombre','categoria'].includes(state.sort)) state.sort = 'relevancia';
  const v = sp.get('vista');
  state.view = ['list','grid'].includes(v) ? v : store.get('dgp-vista', MOBILE() ? 'list' : 'grid');
  if(!['list','grid'].includes(state.view)) state.view = MOBILE() ? 'list' : 'grid';
}
function writeStateToUrl(){
  const sp = new URLSearchParams();
  for(const [k, u] of Object.entries(URL_KEYS)){
    const v = state[k];
    if(!v) continue;
    if(k === 'sort' && v === 'relevancia') continue;
    if(k === 'view') continue;             // la vista se recuerda en el navegador, no en el enlace
    sp.set(u, v);
  }
  const qs = sp.toString();
  try{ history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash); }catch(e){}
}

/* ---------- filtrado y orden ---------- */
function passes(p, s){
  return matchesQuery(p, s.q) &&
    (!s.model || familiesOf(p).includes(s.model)) &&
    (!s.category || p.category === s.category) &&
    (!s.brand || p.brand === s.brand) &&
    (!s.machine || machinesOf(p).includes(s.machine)) &&
    (!s.presentation || (p.presentation||'') === s.presentation) &&
    (!s.availability || p.availability === s.availability);
}
function sortList(list){
  const byName = (a,b) => a.name.localeCompare(b.name, 'es') || (a.item||0) - (b.item||0);
  if(state.sort === 'nombre') return [...list].sort(byName);
  if(state.sort === 'categoria') return [...list].sort((a,b) => a.category.localeCompare(b.category,'es') || byName(a,b));
  if(state.q) return [...list].sort((a,b) => scoreOf(b, state.q) - scoreOf(a, state.q) || (a.item||0) - (b.item||0));
  return [...list].sort((a,b) => (b.featured?1:0) - (a.featured?1:0) || (a.item||0) - (b.item||0));
}
function filtered(){ return sortList(ALL.filter(p => passes(p, state))); }
/** Cuenta resultados si se aplicara un valor en un filtro (sin tener en cuenta el valor actual de ese filtro). */
function countWith(key, value){
  const s = {...state, [key]: value};
  return ALL.filter(p => passes(p, s)).length;
}
function activeFilterCount(){ return FILTER_KEYS.filter(k => state[k]).length; }

/* ---------- accesos rápidos por modelo ---------- */
function modelChips(){
  const counts = {};
  ALL.forEach(p => familiesOf(p).forEach(f => counts[f] = (counts[f]||0) + 1));
  const list = (window.MODEL_CHIPS && window.MODEL_CHIPS.length)
    ? window.MODEL_CHIPS.filter(f => counts[f])
    : Object.entries(counts).filter(([,n]) => n >= 2).sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0])).map(([f]) => f);
  return list.map(f => ({key:f, n:counts[f]}));
}
function renderModelChips(){
  const chips = modelChips();
  $('modelChips').innerHTML = `<button type="button" class="mchip" data-model="" aria-pressed="${!state.model}">Todos</button>` +
    chips.map(c => `<button type="button" class="mchip" data-model="${esc(c.key)}" aria-pressed="${state.model===c.key}">${esc(c.key)}<small>${c.n}</small></button>`).join('');
}

/* ---------- panel de filtros ---------- */
function filterGroups(){
  const vals = (fn) => [...new Set(ALL.map(fn).filter(Boolean))];
  const groups = [
    {key:'category', label:'Categoría', values: CATEGORIES.filter(c => ALL.some(p => p.category === c)), icons:true},
    {key:'brand', label:'Marca', values: vals(p => p.brand).sort()},
    {key:'machine', label:'Máquina', values: vals(p => p.machineType).sort()},
    {key:'presentation', label:'Presentación', values: vals(p => p.presentation).sort()},
  ];
  const av = vals(p => p.availability);
  if(av.length > 1) groups.push({key:'availability', label:'Disponibilidad', values: av, labels: AVAILABILITY_LABEL});
  return groups.filter(g => g.values.length > 1);
}
function renderFilterPanel(){
  const html = filterGroups().map(g => `<fieldset class="fgroup"><legend>${esc(g.label)}</legend>
    <div class="fopts">${g.values.map(v => {
      const n = countWith(g.key, v);
      const on = state[g.key] === v;
      return `<button type="button" class="fopt" data-filter="${g.key}" data-value="${esc(v)}" aria-pressed="${on}" ${n===0 && !on ? 'disabled' : ''}>
        ${g.icons ? icon(v) : ''}<span>${esc(g.labels ? (g.labels[v]||v) : v)}</span><small>${n}</small></button>`;
    }).join('')}</div></fieldset>`).join('');
  const sortHtml = `<fieldset class="fgroup sortgroup"><legend>Ordenar por</legend><div class="fopts">${[['relevancia','Relevancia'],['nombre','Nombre A–Z'],['categoria','Categoría']].map(([v,l]) =>
    `<button type="button" class="fopt" data-sort="${v}" aria-pressed="${state.sort===v}"><span>${l}</span></button>`).join('')}</div></fieldset>`;
  $('filterGroups').innerHTML = html + sortHtml;
  const n = activeFilterCount();
  const badge = $('filtersBadge'); badge.textContent = n; badge.hidden = n === 0;
  $('fpApply').textContent = `Ver ${currentList.length} ${currentList.length === 1 ? 'resultado' : 'resultados'}`;
  $('fpClear').hidden = n === 0 && !state.q;
}
function openFilters(){
  $('filtersPanel').classList.add('open'); $('filtersBackdrop').hidden = false;
  $('filtersBtn').setAttribute('aria-expanded','true');
  document.body.style.overflow = 'hidden';
  $('fpClose').focus();
}
function closeFilters(){
  $('filtersPanel').classList.remove('open'); $('filtersBackdrop').hidden = true;
  $('filtersBtn').setAttribute('aria-expanded','false');
  if($('detail').hidden && !$('quoteDrawer').classList.contains('open')) document.body.style.overflow = '';
}

/* ---------- chips activos y contador ---------- */
const LABELS = {q:'Búsqueda', model:'Modelo', category:'Categoría', brand:'Marca', machine:'Máquina', presentation:'Presentación', availability:'Disponibilidad'};
function renderChips(){
  const active = [];
  if(state.q) active.push(['q', `${LABELS.q}: ${state.q}`]);
  FILTER_KEYS.forEach(k => { if(state[k]) active.push([k, `${LABELS[k]}: ${k==='availability' ? (AVAILABILITY_LABEL[state[k]]||state[k]) : state[k]}`]); });
  $('chips').innerHTML = active.map(([k,label]) =>
    `<button type="button" class="chip" data-clear="${k}" aria-label="Quitar filtro ${esc(label)}">${esc(label)}<span class="x" aria-hidden="true">×</span></button>`).join('')
    + (active.length ? `<button type="button" class="chip clear-all" data-clear="*">Limpiar todo</button>` : '');
}
function renderCount(total){
  const shown = Math.min(state.shown, total);
  $('resultCount').textContent = total
    ? `Mostrando ${shown} de ${total} ${total === 1 ? 'repuesto' : 'repuestos'}`
    : `0 de ${ALL.length} repuestos`;
}

/* ---------- resultados: lista y cuadrícula ---------- */
function rowHtml(p, i=0){
  const app = applicationText(p);
  const wa = waHref(quoteMessage(p));
  return `<article class="product row" style="--i:${i}">
    <a class="row-main" href="#/repuesto/${esc(p.slug)}">
      <img class="row-thumb" src="${esc(thumbOf(p))}" alt="" width="64" height="64" loading="lazy" decoding="async">
      <span class="row-text">
        <b>${esc(p.name)}</b>
        ${app ? `<span class="row-sub">${esc(app)}</span>` : ''}
        <span class="row-code">${p.code ? `Código ${esc(p.code)}` : 'Sin código'}${p.brand ? ` · ${esc(p.brand)}` : ''}</span>
      </span>
    </a>
    ${wa ? `<a class="row-wa" href="${esc(wa)}" target="_blank" rel="noopener" aria-label="Cotizar ${esc(p.name)}${p.code ? ' ' + esc(p.code) : ''} por WhatsApp">${WA_ICON}</a>`
         : `<a class="row-wa" href="#solicitar" data-quote="${esc(p.slug)}" aria-label="Solicitar cotización de ${esc(p.name)}">${icon('mail')}</a>`}
  </article>`;
}
function cardHtml(p, i=0){
  const app = applicationText(p);
  return `<article class="product card" data-tilt style="--i:${i}">
    <a class="card-img" href="#/repuesto/${esc(p.slug)}" aria-label="Ver ficha de ${esc(p.name)}${p.code ? ' ' + esc(p.code) : ''}">
      <img src="${esc(thumbOf(p))}" alt="${esc(p.images[0].alt)}" width="${p.images[0].w}" height="${p.images[0].h}" loading="lazy" decoding="async">
      ${p.featured ? '<span class="ribbon">Destacado</span>' : ''}
    </a>
    <div class="card-body">
      <span class="card-meta">${esc(p.category)}${p.brand ? ` · <b>${esc(p.brand)}</b>` : ''}</span>
      <h3><a href="#/repuesto/${esc(p.slug)}">${esc(p.name)}</a></h3>
      ${app ? `<span class="card-models">${esc(app)}</span>` : ''}
      <span class="code">${p.code ? `Código ${esc(p.code)}` : 'Consultar código'}</span>
      <div class="card-actions">
        ${quoteCta(p, 'btn-primary btn-sm', 'Cotizar')}
        <button type="button" class="iconbtn" data-add="${esc(p.slug)}" aria-label="Agregar ${esc(p.name)} a mi cotización" title="Agregar a mi cotización">${icon('plus')}</button>
      </div>
    </div>
  </article>`;
}
function skeletons(n){
  return Array.from({length:n}, () =>
    `<div class="skeleton" aria-hidden="true"><div class="sk-img"></div><div class="sk-body">
      <div class="sk-line" style="width:35%"></div><div class="sk-line" style="width:75%"></div>
      <div class="sk-line" style="width:55%"></div></div></div>`).join('');
}
function noResultsHtml(){
  const q = state.q.trim();
  const ask = waHref(q ? `Hola, busco el repuesto: ${q}. ¿Lo tienen disponible?` : GENERIC_WA);
  return `<div class="state">
    <b>${q ? `No encontramos «${esc(q)}»` : 'No hay repuestos con esos filtros'}</b>
    Prueba con menos filtros o escribe el código tal como aparece en la pieza. Si no está en el catálogo, pídelo y lo buscamos.
    <div class="row-btns">
      ${ask ? `<a class="btn btn-primary" href="${esc(ask)}" target="_blank" rel="noopener">${WA_ICON}Pídelo por WhatsApp</a>` : ''}
      <a class="btn btn-light" href="#solicitar">Enviar solicitud</a>
      <button type="button" class="btn btn-light" data-clear="*">Limpiar filtros</button>
    </div></div>`;
}

function render(){
  const box = $('products');
  try{
    writeStateToUrl();
    if(!ALL.length){
      box.innerHTML = `<div class="state"><b>Catálogo en preparación</b>
        Aún no hay repuestos publicados. Cuéntanos qué necesitas y te ayudamos a ubicarlo.
        <div><a class="btn btn-primary" href="#solicitar">Solicitar un repuesto</a></div></div>`;
      $('moreWrap').hidden = true; $('resultCount').textContent = ''; renderChips(); return;
    }
    currentList = filtered();
    const slice = currentList.slice(0, state.shown);
    box.dataset.view = state.view;
    box.innerHTML = currentList.length
      ? slice.map((p,i) => state.view === 'list' ? rowHtml(p,i) : cardHtml(p,i)).join('')
      : noResultsHtml();
    renderCount(currentList.length);
    const more = $('moreWrap');
    more.hidden = currentList.length <= state.shown;
    if(!more.hidden) $('moreBtn').textContent = `Ver más repuestos (${currentList.length - state.shown} restantes)`;
    renderChips();
    renderModelChips();
    renderFilterPanel();
    document.querySelectorAll('.viewbtn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === state.view)));
    $('sort').value = state.sort;
    $('searchClear').hidden = !state.q;
    if($('search').value !== state.q) $('search').value = state.q;
  } catch(err){
    console.error(err);
    box.innerHTML = `<div class="state" data-kind="error"><b>No pudimos mostrar el catálogo</b>
      Ocurrió un problema al cargar los repuestos. Recarga la página o escríbenos para ayudarte.
      <div><a class="btn btn-primary" href="#solicitar">Solicitar un repuesto</a></div></div>`;
    $('moreWrap').hidden = true;
  }
}
function setFilter(key, value, opts={}){
  state[key] = value;
  state.shown = PAGE_STEP;
  render();
  if(opts.scroll !== false) goCatalog();
}
function clearAll(){
  state.q = ''; FILTER_KEYS.forEach(k => state[k] = ''); state.shown = PAGE_STEP;
  $('search').value = '';
  render();
}

/* ---------- categorías (sección superior) ---------- */
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

/* ---------- sugerencias de búsqueda (con miniatura) ---------- */
function buildSuggestions(q){
  const c = compact(q);
  if(!c) return [];
  const hits = ALL.filter(p => matchesQuery(p, q)).sort((a,b) => scoreOf(b,q) - scoreOf(a,q) || (a.item||0) - (b.item||0));
  const out = hits.slice(0, SUGGESTIONS).map(p => ({kind:'product', slug:p.slug, main:p.name, code:p.code, sub:applicationText(p), thumb:thumbOf(p)}));
  if(hits.length > SUGGESTIONS) out.push({kind:'all', main:`Ver los ${hits.length} resultados`, q});
  return out;
}
function attachSuggest(input, list){
  let items = [], sel = -1;
  const close = () => { list.dataset.open = 'false'; list.innerHTML = ''; input.setAttribute('aria-expanded','false'); input.removeAttribute('aria-activedescendant'); sel = -1; };
  const paint = () => {
    list.innerHTML = items.map((it,i) => it.kind === 'product'
      ? `<li role="option" id="${list.id}-${i}" ${i===sel?'aria-selected="true"':''} data-i="${i}">
          <img src="${esc(it.thumb)}" alt="" width="40" height="40" loading="lazy">
          <span class="s-text"><b>${esc(it.main)}</b><span>${it.code ? `Código ${esc(it.code)}` : ''}${it.sub ? ` · ${esc(it.sub)}` : ''}</span></span></li>`
      : `<li role="option" class="more" id="${list.id}-${i}" ${i===sel?'aria-selected="true"':''} data-i="${i}">${esc(it.main)} →</li>`).join('');
    list.dataset.open = items.length ? 'true' : 'false';
    input.setAttribute('aria-expanded', String(!!items.length));
    if(sel >= 0) input.setAttribute('aria-activedescendant', `${list.id}-${sel}`); else input.removeAttribute('aria-activedescendant');
  };
  const pick = it => {
    close();
    if(it.kind === 'product'){
      location.hash = '#/repuesto/' + it.slug;
    } else {
      state.q = it.q; state.shown = PAGE_STEP; $('search').value = it.q; input.value = it.q; render(); goCatalog();
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
function goCatalog(){
  const top = document.getElementById('catalogo').getBoundingClientRect().top + window.scrollY - 60;
  window.scrollTo({top, behavior: REDUCED ? 'auto' : 'smooth'});
}

/* ---------- lista de cotización (varios repuestos, sin precios) ---------- */
let quote = store.get('dgp-cotizacion', []).filter(x => x && x.slug);
function quoteItems(){ return quote.map(x => ({...x, p: ALL.find(p => p.slug === x.slug)})).filter(x => x.p); }
function saveQuote(){ store.set('dgp-cotizacion', quote); renderQuoteUi(); }
function addToQuote(slug, qty=1){
  const it = quote.find(x => x.slug === slug);
  if(it) it.qty = Math.min(99, (it.qty||1) + qty); else quote.push({slug, qty});
  saveQuote();
  const p = ALL.find(x => x.slug === slug);
  toast(`${p ? p.name : 'Repuesto'} agregado a tu cotización`);
}
function setQty(slug, qty){
  const it = quote.find(x => x.slug === slug); if(!it) return;
  it.qty = Math.max(1, Math.min(99, Number(qty)||1)); saveQuote();
}
function removeFromQuote(slug){ quote = quote.filter(x => x.slug !== slug); saveQuote(); }
function quoteListMessage(){
  const items = quoteItems();
  const lines = items.map((x,i) => `${i+1}. ${x.p.name}${x.p.code ? ` — código ${x.p.code}` : ''} — cantidad: ${x.qty}`);
  return `Hola, deseo cotizar los siguientes repuestos:\n${lines.join('\n')}\n¿Podrían confirmarme precio y disponibilidad?`;
}
function renderQuoteUi(){
  const items = quoteItems();
  const n = items.reduce((a,x) => a + (x.qty||1), 0);
  const fab = $('quoteFab');
  fab.hidden = items.length === 0;
  $('quoteCount').textContent = n;
  const drawer = $('quoteDrawer');
  $('quoteBody').innerHTML = items.length ? items.map(x => `<div class="qitem" data-slug="${esc(x.slug)}">
      <img src="${esc(thumbOf(x.p))}" alt="" width="56" height="56" loading="lazy">
      <div class="q-text"><a href="#/repuesto/${esc(x.p.slug)}"><b>${esc(x.p.name)}</b></a><span>${x.p.code ? `Código ${esc(x.p.code)}` : ''}${x.p.brand ? ` · ${esc(x.p.brand)}` : ''}</span></div>
      <div class="qty" role="group" aria-label="Cantidad de ${esc(x.p.name)}">
        <button type="button" data-qty="-1" aria-label="Quitar una unidad">${icon('minus')}</button>
        <input type="number" min="1" max="99" value="${x.qty}" aria-label="Cantidad" inputmode="numeric">
        <button type="button" data-qty="1" aria-label="Agregar una unidad">${icon('plus')}</button>
      </div>
      <button type="button" class="qremove" data-remove="${esc(x.slug)}" aria-label="Quitar ${esc(x.p.name)} de la cotización">${icon('trash')}</button>
    </div>`).join('')
    : `<div class="qempty">${icon('cart')}<b>Tu lista está vacía</b><p>Agrega repuestos desde el catálogo con el botón <strong>+</strong> o desde cada ficha. Luego los envías todos juntos por WhatsApp.</p></div>`;
  const wa = items.length ? waHref(quoteListMessage()) : null;
  const send = $('quoteSend');
  if(wa){ send.href = wa; send.removeAttribute('aria-disabled'); send.classList.remove('is-disabled'); }
  else { send.href = '#catalogo'; send.setAttribute('aria-disabled','true'); send.classList.add('is-disabled'); }
  $('quoteClear').hidden = !items.length;
  $('quoteTitle').textContent = items.length ? `Mi cotización (${n})` : 'Mi cotización';
  const mb = $('mbarQuote');
  if(mb){ mb.innerHTML = items.length ? `${icon('cart')}Mi cotización (${n})` : 'Cotizar'; mb.setAttribute('href', items.length ? '#' : '#solicitar'); mb.dataset.open = items.length ? '1' : ''; }
  drawer.dataset.count = n;
}
let lastQuoteFocus = null;
function openQuote(){
  renderQuoteUi();
  $('quoteDrawer').classList.add('open'); $('quoteBackdrop').hidden = false;
  document.body.style.overflow = 'hidden';
  lastQuoteFocus = document.activeElement;
  $('quoteClose').focus();
}
function closeQuote(){
  $('quoteDrawer').classList.remove('open'); $('quoteBackdrop').hidden = true;
  if($('detail').hidden) document.body.style.overflow = '';
  if(lastQuoteFocus){ try{ lastQuoteFocus.focus(); }catch(e){} }
}
let toastTimer = null;
function toast(msg){
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ---------- ficha de producto ---------- */
let lastFocus = null;

function relatedTo(p){
  const fams = familiesOf(p);
  let rel = ALL.filter(o => o.slug !== p.slug && fams.length && familiesOf(o).some(f => fams.includes(f)));
  if(rel.length < 4) rel = rel.concat(ALL.filter(o => o.slug !== p.slug && !rel.includes(o) && o.category === p.category));
  return rel.slice(0, 4);
}
function detailHtml(p){
  const img = p.images[0];
  const compatRows = p.compat.length
    ? p.compat.map(c => `<tr><th>Aplicación registrada</th><td>${esc([c.machine,c.engine].filter(Boolean).join(' · '))}</td></tr>`).join('')
    : (p.models ? '' : `<tr><th>Aplicación registrada</th><td>Pendiente de confirmar con el número de serie.</td></tr>`);
  const infoRows = [
    p.brand && `<tr><th>Marca</th><td>${esc(p.brand)}</td></tr>`,
    p.models && `<tr><th>Modelos compatibles</th><td>${esc(p.models)}</td></tr>`,
    p.machineType && `<tr><th>Máquina</th><td>${esc(p.machineType)}</td></tr>`,
    p.presentation && `<tr><th>Presentación</th><td>${esc(p.presentation)}</td></tr>`,
    p.description && `<tr><th>Descripción</th><td>${esc(p.description)}</td></tr>`
  ].filter(Boolean).join('');
  const specRows = (p.specs||[]).map(s => `<tr><th>${esc(s.k)}</th><td>${esc(s.v)}</td></tr>`).join('');
  const related = relatedTo(p);
  const list = currentList.length ? currentList : ALL;
  const idx = list.findIndex(x => x.slug === p.slug);
  const prev = idx > 0 ? list[idx-1] : null, next = idx >= 0 && idx < list.length-1 ? list[idx+1] : null;
  const thumbs = p.images.length > 1
    ? `<div class="thumbs">${p.images.map((im,i) =>
        `<button type="button" data-thumb="${i}" ${i===0?'aria-current="true"':''} aria-label="Ver imagen ${i+1}">
          <img src="${esc(im.src)}" alt="" width="${im.w}" height="${im.h}" loading="lazy"></button>`).join('')}</div>`
    : '';
  const inQuote = quote.find(x => x.slug === p.slug);
  return `<div class="detail-box">
    <div class="detail-bar">
      <nav aria-label="Ruta de navegación">
        <a href="#inicio">Inicio</a><span aria-hidden="true">/</span>
        <a href="#catalogo">Catálogo</a><span aria-hidden="true">/</span>
        <span>${esc(p.name)}</span>
      </nav>
      <div class="detail-nav">
        <button type="button" class="navbtn" id="prevBtn" ${prev ? `data-go="${esc(prev.slug)}" title="${esc(prev.name)}"` : 'disabled'} aria-label="Repuesto anterior">${icon('left')}</button>
        <span class="navpos">${idx >= 0 ? `${idx+1} / ${list.length}` : ''}</span>
        <button type="button" class="navbtn" id="nextBtn" ${next ? `data-go="${esc(next.slug)}" title="${esc(next.name)}"` : 'disabled'} aria-label="Repuesto siguiente">${icon('right')}</button>
        <button class="detail-close" id="detailClose" aria-label="Cerrar ficha">✕</button>
      </div>
    </div>
    <div class="detail-grid">
      <div class="gallery">
        <button class="main" id="zoomBtn" aria-label="Ampliar imagen de ${esc(p.name)}">
          <img id="detailImg" src="${esc(img.full || img.src)}" alt="${esc(img.alt)}" width="${img.w}" height="${img.h}" decoding="async">
          <span class="zoomhint">Ampliar</span>
        </button>
        ${thumbs}
      </div>
      <div class="detail-body">
        <span class="eyebrow" style="color:var(--teal-dark)">${esc(p.category)}${p.brand ? ` · ${esc(p.brand)}` : ''}</span>
        <h2 id="detailTitle">${esc(p.name)}</h2>
        ${p.code ? `<div class="codeline"><span class="code">Código ${esc(p.code)}</span><button type="button" class="tool" id="copyCode" data-code="${esc(p.code)}">${icon('copy')}Copiar código</button></div>` : ''}
        <table class="spec">
          <tbody>
            ${infoRows}
            ${compatRows}
            ${specRows}
            <tr><th>Categoría</th><td>${esc(p.category)}</td></tr>
            <tr><th>Disponibilidad</th><td>${esc(AVAILABILITY_LABEL[p.availability]||p.availability)}</td></tr>
            <tr><th>Precio</th><td>${esc(priceLabel(p))}</td></tr>
          </tbody>
        </table>
        <p class="warn"><b>Importante:</b> ${esc(SERIAL_WARNING)}</p>
        <div class="detail-actions">
          ${quoteCta(p,'btn-primary')}
          <button type="button" class="btn btn-light" id="addQuoteBtn" data-add="${esc(p.slug)}">${icon(inQuote ? 'check' : 'plus')}${inQuote ? `En mi cotización (${inQuote.qty})` : 'Agregar a mi cotización'}</button>
          <button type="button" class="tool" id="shareBtn">${icon('share')}Compartir</button>
        </div>
      </div>
    </div>
    ${related.length ? `<div class="similar"><h3>Repuestos relacionados</h3><div class="products grid" data-view="grid">${related.map((s,i)=>cardHtml(s,i)).join('')}</div></div>` : ''}
  </div>`;
}

function openDetail(slug){
  const p = ALL.find(x => x.slug === slug);
  if(!p){ closeDetail(true); return; }
  const box = $('detail');
  const wasOpen = !box.hidden;
  box.innerHTML = detailHtml(p);
  box.dataset.img = 0;
  box.hidden = false;
  box.classList.add('open');
  box.scrollTop = 0;
  document.body.style.overflow = 'hidden';
  if(!wasOpen) lastFocus = document.activeElement;
  $('detailClose').focus();
  setMeta(p);
}
function closeDetail(silent){
  const box = $('detail');
  if(box.hidden) return;
  box.classList.remove('open');
  box.hidden = true;
  box.innerHTML = '';
  if(!$('quoteDrawer').classList.contains('open') && !$('filtersPanel').classList.contains('open')) document.body.style.overflow = '';
  setMeta(null);
  if(lastFocus && !silent){ try{ lastFocus.focus(); }catch(e){} }
  lastFocus = null;
}
function currentProduct(){
  const slug = (location.hash.match(/^#\/repuesto\/(.+)$/)||[])[1];
  return slug ? ALL.find(x => x.slug === decodeURIComponent(slug)) : null;
}
function goSibling(dir){
  const p = currentProduct(); if(!p) return;
  const list = currentList.length ? currentList : ALL;
  const idx = list.findIndex(x => x.slug === p.slug);
  const t = list[idx + dir];
  if(t) location.hash = '#/repuesto/' + t.slug;
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
  const app = applicationText(p);
  const compatTxt = app ? ` ${p.compat.length ? 'Aplicación registrada' : 'Modelos'}: ${app}.` : '';
  const d = `${p.name}${p.code ? `, código ${p.code}` : ''}${p.brand ? ` ${p.brand}` : ''}.${compatTxt} Solicita precio y disponibilidad a DOGEPARTS SAC.`;
  document.title = t;
  set('meta[name=description]', d);
  set('meta[property="og:title"]', t);
  set('meta[property="og:description"]', d);
  set('meta[property="og:image"]', abs(fullOf(p)));
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
    ? `<a class="btn btn-primary" href="${esc(wa)}" target="_blank" rel="noopener">${WA_ICON}WhatsApp</a><a class="btn btn-ghost" id="mbarQuote" href="#solicitar">Cotizar</a>`
    : `<a class="btn btn-ghost" href="#catalogo">Catálogo</a><a class="btn btn-primary" id="mbarQuote" href="#solicitar">Cotizar</a>`;
}

/* ---------- mapa: se incrusta solo cuando la sección entra en pantalla ---------- */
function loadMap(){
  const map = $('map');
  if(map.hidden || map.querySelector('iframe') || !mapEmbedUrl()) return;
  map.insertAdjacentHTML('beforeend', `<iframe src="${esc(mapEmbedUrl())}" title="Mapa de ${esc(SITE.name||'DOGEPARTS SAC')}: ${esc(SITE.address)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    <div class="map-bar">
      <a class="map-link" href="${esc(mapDirectionsUrl())}" target="_blank" rel="noopener">${icon('pin')}Cómo llegar</a>
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
    ? `<div class="dots" role="tablist" aria-label="Diapositivas">${list.map((s,i) => `<button type="button" role="tab" data-go-slide="${i}" aria-selected="${i===0}" aria-label="Ver: ${esc(s.title||('diapositiva '+(i+1)))}"><span></span></button>`).join('')}</div><div class="slide-progress" aria-hidden="true"></div>`
    : '');
  if(list.length > 1 && !REDUCED) playSlider();
}
function showSlide(i){
  const slides = document.querySelectorAll('#slider .slide');
  if(!slides.length) return;
  sliderIndex = (i + slides.length) % slides.length;
  slides.forEach((s,k) => { s.classList.toggle('is-active', k === sliderIndex); s.setAttribute('aria-hidden', String(k !== sliderIndex)); });
  document.querySelectorAll('#slider [data-go-slide]').forEach((b,k) => b.setAttribute('aria-selected', String(k === sliderIndex)));
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
    const b = e.target.closest('[data-go-slide]'); if(!b) return;
    showSlide(Number(b.dataset.goSlide));
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
      const app = applicationText(p);
      const item = {'@type':'Product', name:p.name, category:p.category, url: productUrl(p), image: abs(fullOf(p)),
        description: `${p.name}${p.code ? `, código ${p.code}` : ''}. ${app
          ? (p.compat.length ? 'Aplicación registrada: ' : 'Modelos: ') + app + '.'
          : 'Compatibilidad pendiente de confirmar mediante el número de serie del equipo.'} ${SERIAL_WARNING}`};
      if(p.code) item.sku = p.code;
      if(p.brand) item.brand = {'@type':'Brand', name: p.brand};
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

/* ---------- eventos del catálogo ---------- */
$('heroForm').addEventListener('submit', e => {
  e.preventDefault();
  state.q = $('heroSearch').value; state.shown = PAGE_STEP;
  $('search').value = state.q;
  render();
  goCatalog();
});
$('search').addEventListener('input', e => { state.q = e.target.value; state.shown = PAGE_STEP; render(); });
$('searchClear').addEventListener('click', () => { state.q = ''; state.shown = PAGE_STEP; $('search').value = ''; render(); $('search').focus(); });
$('sort').addEventListener('change', e => { state.sort = e.target.value; render(); });
$('moreBtn').addEventListener('click', () => { state.shown += PAGE_STEP; render(); });
$('modelChips').addEventListener('click', e => {
  const b = e.target.closest('[data-model]'); if(!b) return;
  setFilter('model', b.dataset.model === state.model ? '' : b.dataset.model, {scroll:false});
});
$('filterGroups').addEventListener('click', e => {
  const so = e.target.closest('[data-sort]');
  if(so){ state.sort = so.dataset.sort; render(); return; }
  const b = e.target.closest('[data-filter]'); if(!b) return;
  setFilter(b.dataset.filter, state[b.dataset.filter] === b.dataset.value ? '' : b.dataset.value, {scroll:false});
});
$('filtersBtn').addEventListener('click', openFilters);
$('fpClose').addEventListener('click', closeFilters);
$('fpApply').addEventListener('click', () => { closeFilters(); goCatalog(); });
$('fpClear').addEventListener('click', () => { clearAll(); });
$('filtersBackdrop').addEventListener('click', closeFilters);
document.querySelectorAll('.viewbtn').forEach(b => b.addEventListener('click', () => {
  state.view = b.dataset.view; store.set('dgp-vista', state.view); render();
}));
$('categoryGrid').addEventListener('click', e => {
  const b = e.target.closest('[data-category]'); if(!b) return;
  state.q = ''; $('search').value = '';
  setFilter('category', b.dataset.category);
});

/* lista de cotización */
$('quoteFab').addEventListener('click', openQuote);
$('quoteClose').addEventListener('click', closeQuote);
$('quoteBackdrop').addEventListener('click', closeQuote);
$('quoteClear').addEventListener('click', () => { quote = []; saveQuote(); });
$('quoteSend').addEventListener('click', e => { if(e.currentTarget.getAttribute('aria-disabled') === 'true'){ e.preventDefault(); } });
$('quoteBody').addEventListener('click', e => {
  const item = e.target.closest('.qitem'); if(!item) return;
  const slug = item.dataset.slug;
  const q = e.target.closest('[data-qty]');
  if(q){ const it = quote.find(x => x.slug === slug); setQty(slug, (it ? it.qty : 1) + Number(q.dataset.qty)); return; }
  if(e.target.closest('[data-remove]')){ removeFromQuote(slug); return; }
  if(e.target.closest('a')){ closeQuote(); }
});
$('quoteBody').addEventListener('change', e => {
  const inp = e.target.closest('input[type=number]'); if(!inp) return;
  setQty(inp.closest('.qitem').dataset.slug, inp.value);
});

document.addEventListener('click', e => {
  const clear = e.target.closest('[data-clear]');
  if(clear){
    const k = clear.dataset.clear;
    if(k === '*') clearAll();
    else { if(k === 'q'){ state.q = ''; $('search').value = ''; } else state[k] = ''; state.shown = PAGE_STEP; render(); }
    return;
  }
  const add = e.target.closest('[data-add]');
  if(add){ addToQuote(add.dataset.add); const p = currentProduct(); if(p && add.id === 'addQuoteBtn'){ const it = quote.find(x => x.slug === p.slug); add.innerHTML = `${icon('check')}En mi cotización (${it.qty})`; } return; }
  const mq = e.target.closest('#mbarQuote');
  if(mq && mq.dataset.open){ e.preventDefault(); openQuote(); return; }
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
  const go = e.target.closest('[data-go]');
  if(go){ location.hash = '#/repuesto/' + go.dataset.go; return; }
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
      const im = p.images[i]; $('detailImg').src = im.full || im.src; $('detailImg').alt = im.alt;
      document.querySelectorAll('[data-thumb]').forEach(x => x.removeAttribute('aria-current'));
      t.setAttribute('aria-current','true');
    }
    return;
  }
  const cc = e.target.closest('#copyCode');
  if(cc){
    navigator.clipboard.writeText(cc.dataset.code).then(() => { cc.innerHTML = icon('check') + 'Código copiado'; toast('Código copiado'); }).catch(() => { cc.innerHTML = icon('copy') + cc.dataset.code; });
    return;
  }
  if(e.target.closest('#shareBtn')){
    const p = currentProduct(); if(!p) return;
    const data = {title: `${p.name}${p.code ? ' ' + p.code : ''} · DOGEPARTS SAC`, text: quoteMessage(p), url: productUrl(p).startsWith('http') ? productUrl(p) : location.href};
    const btn = $('shareBtn');
    if(navigator.share){ navigator.share(data).catch(()=>{}); }
    else { navigator.clipboard.writeText(data.url).then(() => { btn.innerHTML = icon('check') + 'Enlace copiado'; toast('Enlace copiado'); }).catch(()=>{}); }
    return;
  }
  if(e.target.closest('#totop')){ window.scrollTo({top:0, behavior: REDUCED ? 'auto' : 'smooth'}); return; }
  if(e.target.closest('#lbClose') || e.target.id === 'lightbox'){ closeLightbox(); }
});

document.addEventListener('keydown', e => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName);
  if(e.key === 'Escape'){
    if($('lightbox').classList.contains('open')) { closeLightbox(); return; }
    if($('quoteDrawer').classList.contains('open')) { closeQuote(); return; }
    if($('filtersPanel').classList.contains('open')) { closeFilters(); return; }
    if(!$('detail').hidden){ history.pushState(null,'','#catalogo'); closeDetail(); }
    return;
  }
  if(!$('detail').hidden && !typing && !$('lightbox').classList.contains('open')){
    if(e.key === 'ArrowLeft') goSibling(-1);
    if(e.key === 'ArrowRight') goSibling(1);
  }
});

/* deslizar en la ficha (táctil) para pasar de repuesto */
(() => {
  let sx = 0, sy = 0, tracking = false;
  const box = $('detail');
  box.addEventListener('pointerdown', e => { if(e.pointerType === 'mouse') return; sx = e.clientX; sy = e.clientY; tracking = true; }, {passive:true});
  box.addEventListener('pointerup', e => {
    if(!tracking) return; tracking = false;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if(Math.abs(dx) > 70 && Math.abs(dy) < 50) goSibling(dx < 0 ? 1 : -1);
  }, {passive:true});
})();

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
if(window.innerWidth < 420){ $('search').placeholder = 'Código, repuesto o modelo…'; $('heroSearch').placeholder = 'Código, repuesto o modelo…'; }
$('products').innerHTML = skeletons(4);
renderMarquee();
setupSlider();
setupTilt();
loadProducts().then(list => {
  ALL = list;
  readStateFromUrl();
  renderCategories();
  renderContact();
  setupMap();
  render();
  renderQuoteUi();
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
