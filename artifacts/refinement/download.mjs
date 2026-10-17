import fs from 'node:fs';
import crypto from 'node:crypto';
const dir='artifacts/refinement/';
for(const [name,url] of [['gem','https://www.innerscene.com/api/library/gem-jewelry-display-case-9405030a/download'],['gem-preview','https://www.innerscene.com/api/library/gem-jewelry-display-case-9405030a/preview'],['gem-terms','https://www.innerscene.com/tools/library/terms']]){
 const r=await fetch(url);if(!r.ok)throw Error(name+' '+r.status);
 const file=dir+(name==='gem'?'downloads/gem.glb':name==='gem-preview'?'gem-preview.jpg':'gem-terms.html');
 fs.writeFileSync(file,Buffer.from(await r.arrayBuffer()));console.log(file,fs.statSync(file).size);
}
const m=JSON.parse(fs.readFileSync(dir+'modern-sconce-metadata.json'));
if(m.license!=='cc_zero'||!m.isFree)throw Error('License');
const file=m.files.find(f=>f.fileType==='blend');
const response=await(await fetch(file.downloadUrl+'?scene_uuid='+crypto.randomUUID())).json();
if(!response.filePath)throw Error(JSON.stringify(response));
const r=await fetch(response.filePath);if(!r.ok)throw Error(r.status);
fs.writeFileSync(dir+'downloads/modern-sconce.blend',Buffer.from(await r.arrayBuffer()));console.log('sconce bytes',fs.statSync(dir+'downloads/modern-sconce.blend').size);
