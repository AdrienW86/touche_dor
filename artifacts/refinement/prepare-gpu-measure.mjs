import fs from 'node:fs';
const file='artifacts/refinement/measure-browser.mjs';let s=fs.readFileSync(file,'utf8');
s=s.replace("stage+'-performance.json'","prefix+'-performance.json'");
s=s.replace('if(++n<24)','if(++n<(window.__pilotSampleCount||24))').replace('slice(-22)','slice(-((window.__pilotSampleCount||24)-2))');
s=s.replace("await capture('couloir');await measure('entrance');",`report.adapter=await evaluate(()=>{const gl=__pilotQA.renderer.getContext(),extension=gl.getExtension('WEBGL_debug_renderer_info');return {vendor:extension?gl.getParameter(extension.UNMASKED_VENDOR_WEBGL):gl.getParameter(gl.VENDOR),renderer:extension?gl.getParameter(extension.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)};});
  report.renderer=report.adapter.renderer;
  await evaluate(new Function('window.__pilotSampleCount='+(hardware?182:24)));
  await capture('couloir');await measure('entrance');`);
// Capture the network total before any optional higher-density review reload.
s=s.replace("if(stage==='after'){","report.measuredTransferBytes=report.bytesTransferred;\n  if(stage==='after'){");
s=s.replace("report.status=stage==='before'", "report.reviewTransferBytes=report.bytesTransferred-report.measuredTransferBytes;report.bytesTransferred=report.measuredTransferBytes;\n  report.status=stage==='before'");
fs.writeFileSync(file,s);
const old='artifacts/refinement/before-performance.json';if(fs.existsSync(old)){const r=JSON.parse(fs.readFileSync(old));r.renderer=JSON.parse(fs.readFileSync('artifacts/refinement/gpu-probe.json')).renderer;r.note='Initial short GPU sample; superseded by before-gpu-performance.json';fs.writeFileSync(old,JSON.stringify(r,null,2));}
