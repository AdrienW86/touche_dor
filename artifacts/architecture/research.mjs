import fs from 'node:fs';import zlib from 'node:zlib';
const root='artifacts/architecture/',paths=JSON.parse(zlib.gunzipSync(fs.readFileSync('artifacts/pilot-models/object-paths.json.gz'))),matches=[];
for(const q of ['bracelet display','ring display','diamond ring','earrings','anklet','foot display']){
 const r=await fetch('https://api.sketchfab.com/v3/search?type=models&downloadable=true&count=24&q='+encodeURIComponent(q));if(!r.ok)continue;const data=await r.json();fs.writeFileSync(root+'search-'+q.replaceAll(' ','-')+'.json',JSON.stringify(data));
 for(const m of data.results||[])if(paths[m.uid]&&['CC Attribution','CC0 Public Domain'].includes(m.license?.label)){matches.push({...m,archivePath:paths[m.uid]});console.log(q,m.uid,m.name,m.faceCount);}
}
fs.writeFileSync(root+'matches.json',JSON.stringify(matches));
const url='https://www.innerscene.com/tools/library/3d-parts/jewel-stand-personal-organizer-e8371f54';
for(const [file,src] of [['stand-source.html',url],['stand-preview.jpg','https://www.innerscene.com/api/library/jewel-stand-personal-organizer-e8371f54/preview'],['downloads/jewel-stand.glb','https://www.innerscene.com/api/library/jewel-stand-personal-organizer-e8371f54/download']]){const r=await fetch(src);if(!r.ok)throw Error(r.status);fs.writeFileSync(root+file,Buffer.from(await r.arrayBuffer()));}
