import fs from 'node:fs';
let s=fs.readFileSync('artifacts/architecture/measure.mjs','utf8');
s=s.replace('async function measure(name){','async function measure(name){return;');
s=s.replace("prefix+'-performance.json'","prefix+'-capture-report.json'");
s=s.replace("report.status=stage==='before'",`report.architecture=await evaluate(()=>{
    const T=THREE,scene=__pilotQA.scene,fixtures=scene.children.find(o=>o.name==='Famille unique : appliques verticales montées');
    const cases=scene.children.filter(o=>o.userData.showcaseId).map(o=>({id:o.userData.showcaseId,position:o.position.toArray(),status:o.userData.status,models:o.userData.models,glassPanes:o.children.find(c=>c.name==='Cinq panneaux de verre sans superposition').children.length,bounds:(()=>{const b=new T.Box3().setFromObject(o);return[b.min.toArray(),b.max.toArray()];})()}));
    const old=[];scene.traverse(o=>{if(!o.isMesh||o.isInstancedMesh)return;const p=o.geometry.parameters||{};if(Math.abs(Math.abs(o.position.x)-2.52)<.001&&o.position.y===2.5&&((p.width===.5&&p.height===.5)||(p.width===.14&&p.height===.38)))old.push({visible:o.visible});});
    const columns=scene.children.filter(o=>o.userData.architectureSurface==='column').map(o=>({position:o.position.toArray(),size:new T.Box3().setFromObject(o).getSize(new T.Vector3()).toArray()}));
    const walls=scene.children.filter(o=>o.userData.architectureSurface==='wallUpper').map(o=>({position:o.position.toArray(),size:new T.Box3().setFromObject(o).getSize(new T.Vector3()).toArray()}));
    const actualMounts=[0,1].map(index=>{const points=[];fixtures.children.forEach(mesh=>{const matrix=new T.Matrix4();mesh.getMatrixAt(index,matrix);const a=mesh.geometry.attributes.position;for(let i=0;i<a.count;i++)points.push(new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(matrix));});const left=index===0,back=left?Math.min(...points.map(p=>p.x)):Math.max(...points.map(p=>p.x)),rear=points.filter(p=>Math.abs(p.x-back)<.0003);return {side:left?-1:1,backX:back,gap:left?back+2.54:2.54-back,backplateY:(Math.min(...rear.map(p=>p.y))+Math.max(...rear.map(p=>p.y)))/2};});
    return{fixtures:fixtures.userData,actualMounts,fixtureDrawObjects:fixtures.children.length,oldInteriorLamps:old,cases,columns,walls,logoSource:MAISON.brand.logo};
  });
  await send('Emulation.setDeviceMetricsOverride',{...report.viewport,deviceScaleFactor:2,mobile:false});await send('Page.reload',{ignoreCache:true});await wait(()=>!!window.__pilotQA&&!!window.maisonExperienceState);await evaluate(async()=>{await Promise.all([maisonLogoReady,maisonDisplayAssetsReady,maisonPilotAssetsReady]);scrollTo({top:innerHeight*8*.58/6,behavior:'instant'});});await wait(()=>Math.abs(maisonExperienceState.progress-8*.58/6)<.003);await sleep(350);await capture('overview');
  await evaluate(()=>scrollTo({top:innerHeight*8/6,behavior:'instant'}));await wait(()=>Math.abs(maisonExperienceState.progress-8/6)<.003);await sleep(250);await capture('necklaces');await capture('walls-close',{x:120,y:80,width:420,height:740});await capture('sconce-close',{x:585,y:80,width:150,height:290});
  await evaluate(()=>scrollTo({top:innerHeight*16/6,behavior:'instant'}));await wait(()=>Math.abs(maisonExperienceState.progress-16/6)<.003);await sleep(250);await capture('bracelets');
  await evaluate(()=>scrollTo({top:innerHeight*8.8,behavior:'instant'}));await wait(()=>Math.abs(maisonExperienceState.progress-8.8)<.003);await sleep(250);await capture('back-wall');
  report.status=stage==='before'`);
fs.writeFileSync('artifacts/architecture/capture.mjs',s);
