import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawn} from 'node:child_process';
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),profile=path.join(os.tmpdir(),'maison-refinement-gpu-'+process.pid);
const child=spawn('C:/Users/Adrien/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe',['--headless=new','--no-sandbox','--ignore-gpu-blocklist','--no-first-run','--remote-debugging-port=9359','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
let ws,id=0;const pending=new Map(),report={forcedSoftware:false};
function send(method,params={}){return new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});ws.send(JSON.stringify({id:key,method,params}));});}
try{
 let target;for(let i=0;i<100;i++){try{target=(await(await fetch('http://localhost:9359/json/list')).json()).find(x=>x.type==='page');if(target)break;}catch{}await sleep(100);}
 ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r));ws.addEventListener('message',e=>{const m=JSON.parse(e.data),p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}});
 const result=await send('Runtime.evaluate',{expression:`(()=>{const c=document.createElement('canvas'),g=c.getContext('webgl2')||c.getContext('webgl');if(!g)return{available:false};const d=g.getExtension('WEBGL_debug_renderer_info');return {available:true,vendor:d?g.getParameter(d.UNMASKED_VENDOR_WEBGL):g.getParameter(g.VENDOR),renderer:d?g.getParameter(d.UNMASKED_RENDERER_WEBGL):g.getParameter(g.RENDERER)};})()`,returnByValue:true});
 Object.assign(report,result.result.value);report.hardware=report.available&&!/SwiftShader|llvmpipe|WARP|software|Basic Render/i.test(report.renderer||'');
 console.log(report);
}catch(e){report.error=String(e);console.log(report);}finally{fs.writeFileSync('artifacts/refinement/gpu-probe.json',JSON.stringify(report,null,2));if(ws){await send('Browser.close').catch(()=>{});ws.close();}child.kill();await sleep(800);if(path.dirname(profile)===os.tmpdir()&&path.basename(profile).startsWith('maison-refinement-gpu-'))try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:10,retryDelay:200});}catch{}}
