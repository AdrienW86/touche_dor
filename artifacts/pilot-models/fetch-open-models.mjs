import fs from 'node:fs';
import zlib from 'node:zlib';
const dir='artifacts/pilot-models/';
const paths=JSON.parse(zlib.gunzipSync(fs.readFileSync(dir+'object-paths.json.gz')));
const ids={'necklace-display':'7279cac4115a40e6ac345d68e17f15d1','gold-necklace':'8bb2ebea4fbd4a3a9b21cba9f5d5fdc8','pearl-necklace':'badddc19523f4dc08344e8da5b143dae','display-case':'b68cc93dc44440f5862258d04d212934'};
for(const [name,id] of Object.entries(ids)){
 const destination=dir+'downloads/'+name+'.glb';if(fs.existsSync(destination))continue;
 const url='https://huggingface.co/datasets/allenai/objaverse/resolve/main/'+paths[id];
 const r=await fetch(url);if(!r.ok)throw Error(name+' '+r.status);
 fs.writeFileSync(destination,Buffer.from(await r.arrayBuffer()));
 console.log(name,fs.statSync(destination).size,url);
}
const matches=[];
for(const q of ['museum showcase','jewelry counter','glass display case','jewellery cabinet','display pedestal']){
 const r=await fetch('https://api.sketchfab.com/v3/search?type=models&downloadable=true&count=24&q='+encodeURIComponent(q));
 if(!r.ok){console.log(q,r.status);continue;}const data=await r.json();
 fs.writeFileSync(dir+'search-'+q.replaceAll(' ','-')+'.json',JSON.stringify(data));
 for(const m of data.results||[])if(paths[m.uid]&&['CC Attribution','CC0 Public Domain'].includes(m.license?.label)){matches.push({...m,archivePath:paths[m.uid]});console.log(m.uid,m.name,m.faceCount,m.license.label);}
}
fs.writeFileSync(dir+'cabinet-matches.json',JSON.stringify(matches,null,2));
