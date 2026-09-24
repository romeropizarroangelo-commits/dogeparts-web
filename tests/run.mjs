/* Lanza un navegador Chromium (Edge o Chrome) en modo headless con el protocolo
   de depuración, ejecuta la batería de pruebas contra index.html y lo cierra.
   Uso: npm test            (no necesita dependencias) */
import {spawn, execSync} from 'node:child_process';
import {existsSync, mkdirSync} from 'node:fs';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {dirname, resolve} from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const PORT = 9337;

const candidates = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/microsoft-edge', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'
];
const browser = process.env.BROWSER_PATH || candidates.find(existsSync);
if(!browser){ console.error('No se encontró Edge ni Chrome. Define BROWSER_PATH.'); process.exit(2); }

const profile = resolve(here, '.perfil-navegador');
mkdirSync(profile, {recursive:true});
mkdirSync(resolve(here, 'capturas'), {recursive:true});

const child = spawn(browser, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--window-size=1440,900', 'about:blank'
], {stdio:'ignore'});

async function waitForPort(){
  for(let i=0;i<60;i++){
    try{ const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if(r.ok) return; }catch(e){}
    await new Promise(r => setTimeout(r, 250));
  }
  throw new Error('El navegador no expuso el puerto de depuración');
}

let code = 1;
try{
  await waitForPort();
  process.env.CDP_PORT = String(PORT);
  process.env.SITE_URL = process.env.SITE_URL || pathToFileURL(resolve(root, 'index.html')).href;
  process.chdir(here);
  const r = spawn(process.execPath, [resolve(here, 'web.test.mjs')], {stdio:'inherit', env: process.env});
  code = await new Promise(res => r.on('exit', c => res(c ?? 1)));
} catch(err){
  console.error(err.message);
} finally {
  try{ child.kill(); }catch(e){}
  if(process.platform === 'win32'){ try{ execSync(`taskkill /F /T /PID ${child.pid}`, {stdio:'ignore'}); }catch(e){} }
}
process.exit(code);
