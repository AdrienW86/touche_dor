import fs from 'node:fs';
const root='artifacts/architecture/',matches=JSON.parse(fs.readFileSync(root+'matches.json'));
for(const [name,id] of [['ring','da834e60c21b4b339024d3a1082bb225'],['earrings','ea7a893a9bb04f9ea50cf51f584f1470'],['anklets','425758feb1374dbead234cda7a12a15d']]){
 const m=await(await fetch('https://api.sketchfab.com/v3/models/'+id)).json();if(m.license?.slug!=='by')throw Error('license');fs.writeFileSync(root+name+'-metadata.json',JSON.stringify(m));
 const preview=m.thumbnails.images.sort((a,b)=>b.width-a.width)[0];fs.writeFileSync(root+name+'-preview.jpg',Buffer.from(await(await fetch(preview.url)).arrayBuffer()));
 const source=matches.find(o=>o.uid===id);const url='https://huggingface.co/datasets/allenai/objaverse/resolve/main/'+source.archivePath;
 const r=await fetch(url);if(!r.ok)throw Error(r.status);const data=Buffer.from(await r.arrayBuffer());fs.writeFileSync(root+'downloads/'+name+'.glb',data);console.log(name,data.length,m.user.displayName,m.license.url);
}
