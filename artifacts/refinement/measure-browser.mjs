/* Read-only baseline. No visit camera movement except its original scroll path. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
const output=path.resolve('artifacts/refinement'),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const stage=process.argv.includes('--after')?'after':'before';
const hardware=process.argv.includes('--gpu'),prefix=stage+(hardware?'-gpu':''),port=hardware?9350:9347;
const profile=path.join(os.tmpdir(),'maison-pilot-baseline-'+process.pid);
const browser=spawn('C:/Users/Adrien/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe',['--headless=new','--no-sandbox',...(hardware?['--ignore-gpu-blocklist']:['--enable-unsafe-swiftshader','--use-angle=swiftshader']),'--disable-dev-shm-usage','--no-first-run','--no-default-browser-check','--remote-debugging-port='+port,'--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
const report={stage,viewport:{width:1780,height:883},renderer:'SwiftShader software; not a physical GPU benchmark',errors:[],networkErrors:[],bytesTransferred:0,checkpoints:{},sourceHashes:{}};
for(const file of ['maison-noire.html','entrance.js','entrance-textures.js','interior-materials.js','interior-lighting.js','experience.js','storefront.js','storefront.css','collection-config.js','showcases.js'])report.sourceHashes[file]=createHash('sha256').update(fs.readFileSync('public/prototype/'+file)).digest('hex');
let ws,seq=0;const pending=new Map();
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(new Error(method+' timeout'));},30000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}));});}
async function evaluate(fn){const expression='document.querySelector("iframe").contentWindow.eval('+JSON.stringify('('+fn.toString()+')()')+')';const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
async function wait(fn){const start=Date.now();while(Date.now()-start<60000){try{if(await evaluate(fn))return;}catch{}await sleep(200);}throw new Error('Wait failed '+fn);}
async function capture(name,clip){const {data}=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,...(clip?{clip:{...clip,scale:1}}:{})});fs.writeFileSync(path.join(output,prefix+'-'+name+'.png'),Buffer.from(data,'base64'));}
async function measure(name){
  const data=await evaluate(()=>new Promise(resolve=>{window.__pilotSamples=[];let n=0;const intervals=[];let previous=performance.now();function tick(now){intervals.push(now-previous);previous=now;if(++n<(window.__pilotSampleCount||24))requestAnimationFrame(tick);else{const frames=window.__pilotSamples.slice(-((window.__pilotSampleCount||24)-2)),times=intervals.slice(2).sort((a,b)=>a-b),r=window.__pilotQA.renderer;const geometries=new Set(),materials=new Set();window.__pilotQA.scene.traverse(o=>{if(o.isMesh){geometries.add(o.geometry);if(Array.isArray(o.material))o.material.forEach(m=>materials.add(m));else materials.add(o.material);}});resolve({camera:window.__pilotQA.camera.position.toArray(),frameSamples:times.length,meanFrameMs:times.reduce((a,b)=>a+b,0)/times.length,p95FrameMs:times[Math.floor(times.length*.95)],meanRenderMs:frames.reduce((n,f)=>n+f.ms,0)/frames.length,meanDrawCalls:frames.reduce((n,f)=>n+f.calls,0)/frames.length,meanTriangles:frames.reduce((n,f)=>n+f.triangles,0)/frames.length,geometries:geometries.size,materials:materials.size,textures:r.info.memory.textures,geometryBytes:[...geometries].reduce((n,g)=>n+Object.values(g.attributes).reduce((s,a)=>s+a.array.byteLength,0)+(g.index?.array.byteLength||0),0)});}}requestAnimationFrame(tick);}));report.checkpoints[name]=data;console.log(name,JSON.stringify(data));
}
try{
  let target;for(let n=0;n<100;n++){try{target=(await(await fetch('http://127.0.0.1:'+port+'/json/list')).json()).find(t=>t.type==='page');if(target)break;}catch{}await sleep(100);}
  ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
  ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);if(!p)return;clearTimeout(p.timer);pending.delete(m.id);if(m.error)p.reject(new Error(JSON.stringify(m.error)));else p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')report.errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);else if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')report.errors.push(m.params.args.map(a=>a.value||a.description).join(' '));else if(m.method==='Network.loadingFinished')report.bytesTransferred+=m.params.encodedDataLength;else if(m.method==='Network.responseReceived'&&m.params.response.status>=400)report.networkErrors.push({url:m.params.response.url,status:m.params.response.status});});
  await Promise.all([send('Page.enable'),send('Runtime.enable'),send('Network.enable')]);await send('Network.setCacheDisabled',{cacheDisabled:true});await send('Emulation.setDeviceMetricsOverride',{...report.viewport,deviceScaleFactor:1,mobile:false});await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await send('Page.addScriptToEvaluateOnNewDocument',{source:`(()=>{let three;Object.defineProperty(window,'THREE',{configurable:true,get:()=>three,set(value){three=value;let Renderer;Object.defineProperty(value,'WebGLRenderer',{configurable:true,get:()=>Renderer,set(original){Renderer=new Proxy(original,{construct(target,args,newTarget){const r=Reflect.construct(target,args,newTarget),render=r.render;r.render=function(scene,camera){const main=scene.children.length>100&&this.getRenderTarget()===null;if(!main)return render.apply(this,arguments);window.__pilotQA={scene,camera,renderer:this};const reset=this.info.autoReset;this.info.autoReset=false;this.info.reset();const start=performance.now();try{return render.apply(this,arguments);}finally{if(window.__pilotSamples)window.__pilotSamples.push({ms:performance.now()-start,calls:this.info.render.calls,triangles:this.info.render.triangles});this.info.autoReset=reset;}};return r;}});}});}});})();`});
  await send('Page.navigate',{url:'http://localhost:3000'});await wait(()=>!!window.__pilotQA&&!!window.maisonExperienceState);await evaluate(async()=>{await Promise.all([maisonLogoReady,maisonDisplayAssetsReady,window.maisonPilotAssetsReady,document.fonts.ready]);});await sleep(1800);
  report.adapter=await evaluate(()=>{const gl=__pilotQA.renderer.getContext(),extension=gl.getExtension('WEBGL_debug_renderer_info');return {vendor:extension?gl.getParameter(extension.UNMASKED_VENDOR_WEBGL):gl.getParameter(gl.VENDOR),renderer:extension?gl.getParameter(extension.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)};});
  report.renderer=report.adapter.renderer;
  await evaluate(new Function('window.__pilotSampleCount='+(hardware?182:24)));
  await capture('couloir');await measure('entrance');
  await evaluate(()=>scrollTo({top:innerHeight*8/6,behavior:'instant'}));await wait(()=>Math.abs(maisonExperienceState.progress-8/6)<.003);await sleep(400);
  await capture('vitrine');await capture('vitrine-detail',{x:420,y:180,width:650,height:630});
  await capture('applique',{x:540,y:170,width:180,height:260});await measure('firstShowcase');
  report.measuredTransferBytes=report.bytesTransferred;
  if(stage==='after'){
    report.pilot=await evaluate(()=>{
      const T=THREE,scene=__pilotQA.scene,pilot=scene.children.find(o=>o.userData.status==='downloaded-model-pilot'),lamp=scene.children.find(o=>o.userData.pilot);
      const bounds=new T.Box3().setFromObject(pilot),size=bounds.getSize(new T.Vector3()),lights=[];
      scene.traverse(o=>{if(o.isLight)lights.push({type:o.type,position:o.position.toArray(),intensity:o.intensity});});
      return {position:pilot.position.toArray(),bounds:[bounds.min.toArray(),bounds.max.toArray()],dimensions:size.toArray(),busts:pilot.children[1].children.map(o=>({name:o.name,position:o.position.toArray(),scale:o.scale.toArray()})),lamp:{position:lamp.position.toArray(),dimensions:new T.Box3().setFromObject(lamp).getSize(new T.Vector3()).toArray()},otherShowcases:scene.children.filter(o=>o.userData.status==='composition-study').length,hiddenOriginalLampParts:scene.children.filter(o=>o.isMesh&&!o.visible&&o.position.x===-2.52&&o.position.z===-1).length,lights};
    });
    // Same original visit camera, higher pixel density solely for review images.
    await send('Emulation.setDeviceMetricsOverride',{...report.viewport,deviceScaleFactor:2,mobile:false});
    await send('Page.reload',{ignoreCache:true});await wait(()=>!!window.__pilotQA&&!!window.maisonExperienceState);
    await evaluate(async()=>{await Promise.all([maisonLogoReady,maisonDisplayAssetsReady,maisonPilotAssetsReady]);scrollTo({top:innerHeight*8/6,behavior:'instant'});});
    await wait(()=>Math.abs(maisonExperienceState.progress-8/6)<.003);await sleep(1200);
    await capture('vitrine-close',{x:510,y:248,width:490,height:392});
    await capture('applique-close',{x:565,y:135,width:95,height:135});
  }
  report.reviewTransferBytes=report.bytesTransferred-report.measuredTransferBytes;report.bytesTransferred=report.measuredTransferBytes;
  report.status=stage==='before'?'baseline-recorded-models-not-replaced':'pilot-measured';
}catch(error){report.failure=String(error.stack||error);console.error(error);process.exitCode=1;}
finally{fs.writeFileSync(path.join(output,prefix+'-performance.json'),JSON.stringify(report,null,2));if(ws){try{await send('Browser.close');}catch{}ws.close();}browser.kill();await sleep(1500);const resolved=path.resolve(profile);if(path.dirname(resolved)===path.resolve(os.tmpdir())&&path.basename(resolved).startsWith('maison-pilot-baseline-'))try{fs.rmSync(resolved,{recursive:true,force:true,maxRetries:10,retryDelay:300});}catch{}}
