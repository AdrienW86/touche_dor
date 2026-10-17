import fs from 'node:fs';
const dir='artifacts/refinement/';
const cabinet='https://www.innerscene.com/tools/library/3d-parts/gem-jewelry-display-case-9405030a';
const html=await(await fetch(cabinet)).text();fs.writeFileSync(dir+'gem-source.html',html);
console.log('GEM links', [...html.matchAll(/(?:href|src)="([^"]*(?:glb|download|9405030a|terms)[^"]*)"/g)].map(m=>m[1]).slice(0,20));
const q='asset_base_id:0d8f6d0a-a383-4476-bc1b-a8ae8ff22135+asset_type:model';
const r=await fetch('https://www.blenderkit.com/api/v1/search/?query='+encodeURIComponent(q)+'&dict_parameters=1&page_size=50');
const data=await r.json();fs.writeFileSync(dir+'lamp-search.json',JSON.stringify(data));
for(const m of data.results||[]){
 console.log(m.name,m.assetBaseId,m.license,m.isFree);
 if(m.assetBaseId==='0d8f6d0a-a383-4476-bc1b-a8ae8ff22135'){
  fs.writeFileSync(dir+'modern-sconce-metadata.json',JSON.stringify(m,null,2));
  const preview=m.thumbnailLargeUrl||m.thumbnailMiddleUrl;console.log('preview',preview);
  if(preview)fs.writeFileSync(dir+'modern-sconce-preview.jpg',Buffer.from(await(await fetch(preview)).arrayBuffer()));
 }
}
