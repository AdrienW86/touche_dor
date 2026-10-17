import fs from 'node:fs';
const root='artifacts/architecture/',m=await(await fetch('https://api.sketchfab.com/v3/models/25af58a330ba4e31b78514ad924a8932')).json();if(m.license?.slug!=='by')throw Error('license');
fs.writeFileSync(root+'bracelet-metadata.json',JSON.stringify(m));const p=m.thumbnails.images.sort((a,b)=>b.width-a.width)[0];fs.writeFileSync(root+'bracelet-preview.jpg',Buffer.from(await(await fetch(p.url)).arrayBuffer()));
const found=JSON.parse(fs.readFileSync(root+'bracelet-matches.json')).find(o=>o.uid===m.uid);const r=await fetch('https://huggingface.co/datasets/allenai/objaverse/resolve/main/'+found.archivePath);if(!r.ok)throw Error(r.status);fs.writeFileSync(root+'downloads/bracelet.glb',Buffer.from(await r.arrayBuffer()));console.log(m.user.displayName,m.license.url);
