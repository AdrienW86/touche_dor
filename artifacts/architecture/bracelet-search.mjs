import fs from 'node:fs';import zlib from 'node:zlib';
const root='artifacts/architecture/',paths=JSON.parse(zlib.gunzipSync(fs.readFileSync('artifacts/pilot-models/object-paths.json.gz')));let found=[];
for(const q of ['gold bracelet','bracelet','anklet chain']){const r=await fetch('https://api.sketchfab.com/v3/search?type=models&downloadable=true&count=24&q='+encodeURIComponent(q));if(!r.ok)continue;for(const m of (await r.json()).results||[])if(paths[m.uid]&&m.license?.label==='CC Attribution'&&m.faceCount<150000){found.push({...m,archivePath:paths[m.uid]});console.log(m.uid,m.name,m.faceCount);}}
fs.writeFileSync(root+'bracelet-matches.json',JSON.stringify(found));
