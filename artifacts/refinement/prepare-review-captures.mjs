import fs from 'node:fs';
let script=fs.readFileSync('artifacts/refinement/measure-browser.mjs','utf8');
script=script.replace('async function measure(name){','async function measure(name){if(process.argv.includes("--review"))return;');
script=script.replace("prefix+'-performance.json'","prefix+'-review-data.json'");
script=script.replace("{x:510,y:248,width:490,height:392}","{x:550,y:455,width:440,height:230}");
script=script.replace("{x:565,y:135,width:95,height:135}","{x:570,y:100,width:105,height:235}");
script=script.replace("report.status=stage==='before'",`if(process.argv.includes('--review')){
    await evaluate(()=>scrollTo({top:innerHeight*8*.58/6,behavior:'instant'}));await wait(()=>Math.abs(maisonExperienceState.progress-8*.58/6)<.003);await sleep(500);
    await capture('couloir-overview');
    await evaluate(()=>scrollTo({top:innerHeight*8/6,behavior:'instant'}));await wait(()=>Math.abs(maisonExperienceState.progress-8/6)<.003);
    report.inspection=await evaluate(()=>{
      const T=THREE,qa=__pilotQA,pilot=qa.scene.children.find(o=>o.userData.version==='contemporary-refinement'&&o.userData.status),originalCamera={position:qa.camera.position.toArray(),quaternion:qa.camera.quaternion.toArray()};
      const panes=[];pilot.children[0].traverse(o=>{if(o.isMesh&&o.material.transparent)panes.push({name:o.name,opacity:o.material.opacity,depthWrite:o.material.depthWrite,side:o.material.side});});
      const inverse=new T.Matrix4().copy(pilot.matrixWorld).invert();
      const busts=pilot.children[1].children.map(o=>{const b=new T.Box3().setFromObject(o);b.applyMatrix4(inverse);return {name:o.name,bounds:[b.min.toArray(),b.max.toArray()],frontGap:.266-b.max.z,leftGap:b.min.x+.654,rightGap:.654-b.max.x};});
      const model=pilot.clone(true);model.position.set(0,0,0);
      const studio=new T.Scene();studio.background=new T.Color(0x111315);studio.add(model);
      model.traverse(o=>{if(o.isSpotLight&&o.userData.localShowcase)model.add(o.target);});
      studio.add(new T.AmbientLight(0xffedda,.6));const key=new T.DirectionalLight(0xffefda,1.8);key.position.set(1,3,4);studio.add(key);const fill=new T.DirectionalLight(0xe7ebff,.65);fill.position.set(-2,1.8,2);studio.add(fill);
      const camera=new T.PerspectiveCamera(35,960/1000,.05,20);camera.position.set(0,1.02,3.15);camera.lookAt(0,.72,0);
      const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(960,1000);renderer.setPixelRatio(1.5);renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
      const host=document.createElement('div');host.id='qa-isolated-front';host.style.cssText='position:fixed;inset:0;z-index:999999;background:#111315;display:grid;place-items:center;';renderer.domElement.style.cssText='height:100vh;width:auto;max-width:100vw';host.appendChild(renderer.domElement);document.body.appendChild(host);
      renderer.render(studio,camera);window.__frontInspection={host,renderer};
      const a=JSON.stringify(originalCamera),b=JSON.stringify({position:qa.camera.position.toArray(),quaternion:qa.camera.quaternion.toArray()});
      return {originalVisitCameraUnchanged:a===b,frontView:'Isolated model inspection with a separate technical camera; visit camera untouched',panes,busts};
    });
    await capture('front-inspection');
    await evaluate(()=>{__frontInspection.host.remove();__frontInspection.renderer.dispose();delete window.__frontInspection;});
  }
  report.status=stage==='before'`);
fs.writeFileSync('artifacts/refinement/capture-review.mjs',script);
