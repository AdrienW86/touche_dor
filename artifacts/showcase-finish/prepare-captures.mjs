import fs from 'node:fs';
const script=fs.readFileSync('artifacts/showcase-finish/measure.mjs','utf8'),head=script.slice(0,script.indexOf("  await send('Page.navigate'")),tail=script.slice(script.indexOf('}catch(error){report.failure='));
const body=`
  if(stage==='before'){
    ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.method==='Fetch.requestPaused'){const file='artifacts/showcase-finish/before-'+new URL(m.params.request.url).pathname.split('/').pop();send('Fetch.fulfillRequest',{requestId:m.params.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/javascript'}],body:fs.readFileSync(file).toString('base64')}).catch(console.error);}});
    await send('Fetch.enable',{patterns:[{urlPattern:'*/prototype/pilot-models.js',requestStage:'Request'},{urlPattern:'*/prototype/showcases.js',requestStage:'Request'}]});
  }
  await send('Emulation.setDeviceMetricsOverride',{...report.viewport,deviceScaleFactor:2,mobile:false});
  await send('Page.navigate',{url:'http://localhost:3000'});await wait(()=>!!window.__pilotQA&&!!window.maisonExperienceState);await evaluate(async()=>{await Promise.all([maisonLogoReady,maisonDisplayAssetsReady,maisonPilotAssetsReady,document.fonts.ready]);});await sleep(800);
  report.stations=[];
  for(let index=1;index<=6;index++){
    await evaluate(new Function('scrollTo({top:innerHeight*8*'+index+'/6,behavior:"instant"})'));await wait(new Function('return Math.abs(maisonExperienceState.progress-8*'+index+'/6)<.003'));await sleep(200);
    const station=await evaluate(new Function('const i='+index+'-1,T=THREE,root=__pilotQA.scene.children.find(o=>o.userData.showcaseId===MAISON.showcases[i].id);root.updateWorldMatrix(true,true);const min=new T.Vector3(-.70,1.07,-.60),max=new T.Vector3(.70,2.025,.60),points=[];for(const x of [min.x,max.x])for(const y of [min.y,max.y])for(const z of [min.z,max.z])points.push(root.localToWorld(new T.Vector3(x,y,z)).project(__pilotQA.camera));const left=Math.max(0,Math.floor(Math.min(...points.map(p=>(p.x*.5+.5)*innerWidth))-10)),right=Math.min(innerWidth,Math.ceil(Math.max(...points.map(p=>(p.x*.5+.5)*innerWidth))+10)),top=Math.max(0,Math.floor(Math.min(...points.map(p=>(-.5*p.y+.5)*innerHeight))-10)),bottom=Math.min(innerHeight,Math.ceil(Math.max(...points.map(p=>(-.5*p.y+.5)*innerHeight))+10));const pairs=[],attachments=[],instances=[];root.traverse(o=>{if(o.userData.jewelryPair)pairs.push({name:o.name,...o.userData,children:o.children.length});if(o.userData.attachment)attachments.push(o.userData.attachment);if(o.isInstancedMesh)instances.push({count:o.count,culled:o.frustumCulled});});const b=new T.Box3().setFromObject(root);return{id:root.userData.showcaseId,position:root.position.toArray(),camera:__pilotQA.camera.position.toArray(),bounds:[b.min.toArray(),b.max.toArray()],pairs,attachments,instances,clip:{x:left,y:top,width:right-left,height:bottom-top}};'));
    report.stations.push(station);await capture('station-'+index+'-full');await capture('station-'+index+'-close',station.clip);
  }
  await evaluate(()=>scrollTo({top:innerHeight*8*.58/6,behavior:'instant'}));await wait(()=>Math.abs(maisonExperienceState.progress-8*.58/6)<.003);await sleep(200);await capture('overview-review');
  report.adapter=await evaluate(()=>{const r=__pilotQA.renderer,gl=r.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');return{renderer:gl.getParameter(ext.UNMASKED_RENDERER_WEBGL),samples:gl.getParameter(gl.SAMPLES),pixelRatio:r.getPixelRatio()};});report.status='six-stations-reviewed';
`;
fs.writeFileSync('artifacts/showcase-finish/capture.mjs',head+body+tail.replace("prefix+'-performance.json'","prefix+'-capture-report.json'"));
