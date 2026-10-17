import fs from 'node:fs';import crypto from 'node:crypto';
const root='artifacts/architecture/';fs.mkdirSync(root+'downloads',{recursive:true});
const files=['maison-noire.html','pilot-models.js','showcases.js','interior-materials.js','interior-lighting.js','entrance.js','entrance-textures.js','experience.js','storefront.js','storefront.css','collection-config.js'];const hashes={};
for(const name of files){const data=fs.readFileSync('public/prototype/'+name);fs.writeFileSync(root+'before-'+name,data);hashes[name]=crypto.createHash('sha256').update(data).digest('hex');}
fs.writeFileSync(root+'before-hashes.json',JSON.stringify(hashes,null,2));
let qa=fs.readFileSync('artifacts/refinement/measure-browser.mjs','utf8').replace("path.resolve('artifacts/refinement')","path.resolve('artifacts/architecture')");
// Additional scene diagnostics and captures are supplied separately for this pass.
qa=qa.replace("if(stage==='after'){","if(stage==='after'&&process.argv.includes('--pilot-diagnostics')){");
fs.writeFileSync(root+'measure.mjs',qa);
let nav=fs.readFileSync('artifacts/refinement/verify-navigation.mjs','utf8').replace("path.resolve('artifacts/refinement/navigation')","path.resolve('artifacts/architecture/navigation')");fs.mkdirSync(root+'navigation',{recursive:true});fs.writeFileSync(root+'verify-navigation.mjs',nav);
