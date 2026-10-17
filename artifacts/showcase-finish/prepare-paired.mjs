import fs from 'node:fs';
const script=fs.readFileSync('artifacts/showcase-finish/measure.mjs','utf8');
const split=script.indexOf("  await send('Page.navigate'");
const head=script.slice(0,split),tail=script.slice(script.indexOf('}catch(error){report.failure='));
const body=`
  let mode='after';
  ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.method!=='Fetch.requestPaused')return;const name=new URL(m.params.request.url).pathname.split('/').pop(),file=mode==='before'?'artifacts/showcase-finish/before-'+name:'public/prototype/'+name;send('Fetch.fulfillRequest',{requestId:m.params.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/javascript'}],body:fs.readFileSync(file).toString('base64')}).catch(console.error);});
  await send('Fetch.enable',{patterns:[{urlPattern:'*/prototype/pilot-models.js',requestStage:'Request'},{urlPattern:'*/prototype/showcases.js',requestStage:'Request'}]});
  for(const [index,state] of ['after','before','after'].entries()){
    mode=state;await send('Page.navigate',{url:'http://localhost:3000/?qa='+index});await wait(()=>!!window.__pilotQA&&!!window.maisonExperienceState);await evaluate(async()=>{await Promise.all([maisonLogoReady,maisonDisplayAssetsReady,maisonPilotAssetsReady,document.fonts.ready]);});await sleep(3000);await evaluate(()=>window.__pilotSampleCount=182);
    report.renderer=await evaluate(()=>{const gl=__pilotQA.renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');return gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)});
    await measure(state+index+'-entrance');await evaluate(()=>scrollTo({top:innerHeight*8/6,behavior:'instant'}));await wait(()=>Math.abs(maisonExperienceState.progress-8/6)<.003);await sleep(500);await measure(state+index+'-station1');
  }
`;
fs.writeFileSync('artifacts/showcase-finish/paired.mjs',head+body+tail.replace("prefix+'-performance.json'","'paired-performance.json'"));
