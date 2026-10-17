import fs from 'node:fs';
const root='artifacts/showcase-finish/',matches=JSON.parse(fs.readFileSync(root+'matches.json'));
for(const [name,uid] of [['stud','94db5e5434d14a9f87bbf3e5a5fd7dce'],['drop','863d3b5c1a714cfb88dc01c7ea0fbcfe'],['hoops','7a9e9fee80ac4c6d803680a4c62ce852']]){
 const m=JSON.parse(fs.readFileSync(root+uid+'-metadata.json'));if(m.license.slug!=='by')throw Error('license');const source='https://huggingface.co/datasets/allenai/objaverse/resolve/main/'+matches.find(x=>x.uid===uid).archivePath;
 const r=await fetch(source);if(!r.ok)throw Error(r.status);fs.writeFileSync(root+'downloads/'+name+'.glb',Buffer.from(await r.arrayBuffer()));console.log(name,m.name,fs.statSync(root+'downloads/'+name+'.glb').size);
 fs.writeFileSync(root+name+'-source.json',JSON.stringify({uid,source,metadata:uid+'-metadata.json',license:m.license,author:m.user.displayName},null,2));
}
