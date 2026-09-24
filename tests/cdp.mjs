// Cliente CDP mínimo sobre WebSocket nativo de Node 22+
export async function connect(port){
  const r = await fetch(`http://127.0.0.1:${port}/json/list`);
  const tabs = await r.json();
  const page = tabs.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((ok,bad)=>{ ws.onopen=ok; ws.onerror=bad; });
  let id = 0; const pend = new Map(); const evs = [];
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if(m.id && pend.has(m.id)){
      const {ok,bad} = pend.get(m.id); pend.delete(m.id);
      m.error ? bad(new Error(JSON.stringify(m.error))) : ok(m.result);
    } else if(m.method) evs.push(m);
  };
  const send = (method, params={}) => new Promise((ok,bad)=>{
    const i = ++id; pend.set(i,{ok,bad}); ws.send(JSON.stringify({id:i,method,params}));
  });
  return {send, evs, close:()=>ws.close()};
}
export async function evalJs(c, expr){
  const r = await c.send('Runtime.evaluate', {expression:expr, returnByValue:true, awaitPromise:true});
  if(r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails.exception || r.exceptionDetails));
  return r.result.value;
}
