import fs from 'node:fs';import zlib from 'node:zlib';
const root='artifacts/showcase-finish/',paths=JSON.parse(zlib.gunzipSync(fs.readFileSync('artifacts/pilot-models/object-paths.json.gz'))),found=new Map();
for(const q of ['earrings','diamond earrings','stud earrings','earring display']){
 const r=await fetch('https://api.sketchfab.com/v3/search?type=models&downloadable=true&count=48&q='+encodeURIComponent(q));if(!r.ok){console.log(q,r.status);continue;}const data=await r.json();fs.writeFileSync(root+'search-'+q.replaceAll(' ','-')+'.json',JSON.stringify(data));
 for(const m of data.results||[])if(paths[m.uid]&&['CC Attribution','CC0 Public Domain'].includes(m.license?.label)){found.set(m.uid,{...m,archivePath:paths[m.uid]});console.log(m.uid,m.name,m.faceCount,m.license.label);}
}
fs.writeFileSync(root+'matches.json',JSON.stringify([...found.values()]));
for(const uid of ['94db5e5434d14a9f87bbf3e5a5fd7dce','863d3b5c1a714cfb88dc01c7ea0fbcfe','537b1b809d69447ab10cd4e93d205b8a','7a9e9fee80ac4c6d803680a4c62ce852','72b8f6adbb844a20980bc5c90d788961']){
 const m=await(await fetch('https://api.sketchfab.com/v3/models/'+uid)).json();if(m.license?.slug!=='by')throw Error('license');fs.writeFileSync(root+uid+'-metadata.json',JSON.stringify(m));const preview=m.thumbnails.images.sort((a,b)=>b.width-a.width)[0];fs.writeFileSync(root+uid+'-preview.jpg',Buffer.from(await(await fetch(preview.url)).arrayBuffer()));console.log('preview',uid,m.name,m.user.displayName);
}
