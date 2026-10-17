import fs from 'node:fs';
const out='artifacts/showcase-finish';fs.mkdirSync(out+'/downloads',{recursive:true});
for(const f of ['maison-noire.html','architecture-details.js','pilot-models.js','showcases.js','entrance.js','entrance-textures.js','interior-materials.js','interior-lighting.js','experience.js','storefront.js','storefront.css','collection-config.js'])fs.copyFileSync('public/prototype/'+f,out+'/before-'+f);
let script=fs.readFileSync('artifacts/architecture/measure.mjs','utf8').replaceAll("artifacts/architecture","artifacts/showcase-finish");
script=script.replace("await measure('firstShowcase');","await measure('firstShowcase');\n  for(let index=1;index<=6;index++){await evaluate(new Function('scrollTo({top:innerHeight*8*'+index+'/6,behavior:\"instant\"})'));await wait(new Function('return Math.abs(maisonExperienceState.progress-8*'+index+'/6)<.003'));await sleep(160);await capture('station-'+index);await measure('station'+index);}\n  await evaluate(()=>scrollTo({top:innerHeight*8*.58/6,behavior:'instant'}));await wait(()=>Math.abs(maisonExperienceState.progress-8*.58/6)<.003);await sleep(200);await capture('overview');");
fs.writeFileSync(out+'/measure.mjs',script);
let nav=fs.readFileSync('artifacts/architecture/verify-navigation.mjs','utf8').replaceAll('artifacts/architecture/navigation',out+'/navigation');fs.writeFileSync(out+'/verify-navigation.mjs',nav);
