import fs from 'node:fs';
let base=fs.readFileSync('artifacts/showcase-finish/measure.mjs','utf8');
const head=base.slice(0,base.indexOf("  await capture('couloir');"));
const tail=base.slice(base.indexOf('}catch(error){report.failure='));
const body=`
  report.context=await evaluate(()=>{const r=__pilotQA.renderer,gl=r.getContext();return{attributes:gl.getContextAttributes(),samples:gl.getParameter(gl.SAMPLES),pixelRatio:r.getPixelRatio(),maxSamples:gl.getParameter(gl.MAX_SAMPLES)};});
  await evaluate(()=>{const groups=__pilotQA.scene.children.filter(o=>o.userData.showcaseId);window.__edgeOriginals=[];groups.forEach(g=>g.children.forEach(o=>{if(!o.isMesh||o.material.metalness!==1)return;const b=new THREE.Box3().setFromObject(o),s=b.getSize(new THREE.Vector3());if(s.y<.1||s.x<.02) {window.__edgeOriginals.push({object:o,material:o.material});o.material=o.material.clone();}}));window.__glassOriginals=[];groups.forEach(g=>g.children.find(o=>o.name==='Cinq panneaux de verre sans superposition').children.forEach(o=>__glassOriginals.push(o)));});
  const variants=stage==='before'?['original','satin','no-glass','depth-offset','dpr-1.75']:['corrected'];
  for(const variant of variants){
    await evaluate(new Function('window.__variant='+JSON.stringify(variant)));
    await evaluate(()=>{__edgeOriginals.forEach(({object,material})=>{object.material.copy(material);if(__variant==='satin'){object.material.roughness=.62;object.material.roughnessMap=null;object.material.normalMap=null;object.material.envMapIntensity=.25;}object.material.polygonOffset=__variant==='depth-offset';object.material.polygonOffsetFactor=-2;object.material.polygonOffsetUnits=-2;object.material.needsUpdate=true;});__glassOriginals.forEach(o=>o.visible=__variant!=='no-glass');__pilotQA.renderer.setPixelRatio(__variant==='dpr-1.75'?1.75:1);scrollTo({top:innerHeight*1.12,behavior:'instant'});});
    await wait(()=>Math.abs(maisonExperienceState.progress-1.12)<.003);await sleep(200);
    const data=await evaluate(()=>new Promise(resolve=>{const canvas=document.getElementById('c'),stream=canvas.captureStream(30),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:12000000}),parts=[];rec.ondataavailable=e=>parts.push(e.data);rec.onstop=async()=>{const blob=new Blob(parts,{type:rec.mimeType}),bytes=new Uint8Array(await blob.arrayBuffer());let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));resolve({base64:btoa(s),bytes:bytes.length});stream.getTracks().forEach(t=>t.stop());};let start;function frame(t){if(!start)start=t;const elapsed=t-start,ratio=Math.min(1,elapsed/5000);scrollTo({top:innerHeight*(1.12+.55*ratio),behavior:'instant'});if(ratio<1)requestAnimationFrame(frame);else{rec.stop();}}rec.start();requestAnimationFrame(frame);}));
    fs.writeFileSync(path.join(output,prefix+'-'+variant+'-motion.webm'),Buffer.from(data.base64,'base64'));console.log(variant,data.bytes);await capture(variant+'-motion-end');
  }
  report.status='motion-comparison';
`;
fs.writeFileSync('artifacts/showcase-finish/motion.mjs',head+body+tail.replace("prefix+'-performance.json'","prefix+'-motion-report.json'"));
