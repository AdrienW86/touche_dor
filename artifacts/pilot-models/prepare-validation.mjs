import fs from 'node:fs';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
const root='artifacts/pilot-models/';
let source=fs.readFileSync('artifacts/finalization/verify-browser.mjs','utf8').replace("path.resolve('artifacts/finalization')","path.resolve('artifacts/pilot-models/navigation')").replaceAll('window.maisonDisplayAssetsReady,document.fonts.ready','window.maisonDisplayAssetsReady,window.maisonPilotAssetsReady,document.fonts.ready');
fs.mkdirSync(root+'navigation',{recursive:true});fs.writeFileSync(root+'verify-navigation.mjs',source);
const before=JSON.parse(fs.readFileSync(root+'before-performance.json'));
const remove={
 'maison-noire.html':'<script src="/prototype/pilot-models.js"></script>\n',
 'showcases.js':'      if(i===0)window.loadMaisonPilotShowcase(T,scene,group,architecture,{velvet,walnut,brass});\r\n',
 'interior-lighting.js':"    window.addEventListener('maison-pilot-ready', () => { renderer.shadowMap.needsUpdate = true; }, {once:true});\r\n"
};
const checks={};
for(const [file,hash] of Object.entries(before.sourceHashes)){
 let text=fs.readFileSync('public/prototype/'+file,'utf8');
 const allowed=remove[file];if(allowed){text=text.replace(allowed,'');if(crypto.createHash('sha256').update(text).digest('hex')!==hash){text=fs.readFileSync('public/prototype/'+file,'utf8').replace(allowed.replaceAll('\r\n','\n'),'');}}
 checks[file]=crypto.createHash('sha256').update(text).digest('hex')===hash;
}
fs.writeFileSync(root+'protected-source-report.json',JSON.stringify({method:'SHA256 compared to pre-pilot snapshot, subtracting only three explicit integration lines',checks},null,2));
console.log('Protected source checks',checks);
const names=['large-case','necklace-display','wall-light','torso','display-case','italian-case','gold-necklace','pearl-necklace'];
const archivePaths=JSON.parse(zlib.gunzipSync(fs.readFileSync(root+'object-paths.json.gz')));
const records=names.map(name=>{
 const metadata=JSON.parse(fs.readFileSync(root+name+'-metadata.json','utf8').replace(/^\uFEFF/,''));
 const localSource=root+'downloads/'+name+(name==='wall-light'||name==='torso'?'.blend':'.glb');
 return {name:title(metadata),author:metadata.user?.displayName||metadata.author?.fullName?.trim(),source:metadata.viewerUrl||'https://www.blenderkit.com/asset-gallery-detail/'+metadata.assetBaseId+'/',downloadSource:metadata.uid?'https://huggingface.co/datasets/allenai/objaverse/resolve/main/'+archivePaths[metadata.uid]:metadata.url,license:metadata.license?.url||metadata.license,metadataSnapshot:name+'-metadata.json',originalFile:localSource,originalBytes:fs.statSync(localSource).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(localSource)).digest('hex'),integrated:['large-case','necklace-display','wall-light'].includes(name)};
});
function title(m){return m.name||m.displayName;}
const runtime=['necklace-cabinet','necklace-bust','wall-light'].map(name=>{const p='public/assets/models/pilot/'+name+'.glb';return {file:name+'.glb',bytes:fs.statSync(p).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')};});
const manifest={retrieved:'2026-10-17',records,runtime,archive:'https://huggingface.co/datasets/allenai/objaverse',archiveNotice:'Individual Sketchfab licenses verified independently; Objaverse dataset provenance retained. Allen Institute for AI / Objaverse, Deitke et al.'};
fs.writeFileSync('public/assets/models/pilot/manifest.json',JSON.stringify(manifest,null,2));
const rows=records.map(r=>`| ${r.name} | ${r.author} | [Source](${r.source}) | ${r.license==='cc_zero'?'CC0 1.0':r.license} | ${r.integrated?'Intégré au pilote':'Téléchargé, non utilisé'} |`).join('\n');
fs.writeFileSync(root+'downloaded-models.md','# Ressources réellement téléchargées\n\n| Modèle | Auteur | Provenance | Licence | État |\n|---|---|---|---|---|\n'+rows+'\n\nLes GLB Sketchfab sont téléchargés depuis la redistribution publique Objaverse. Chaque licence originale est conservée séparément dans les métadonnées du dossier. Les fichiers source restent dans downloads/.\n');
