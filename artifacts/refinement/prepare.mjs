import fs from 'node:fs';
import crypto from 'node:crypto';
const dir='artifacts/refinement/';
const files=['maison-noire.html','pilot-models.js','entrance.js','entrance-textures.js','interior-materials.js','interior-lighting.js','showcases.js','experience.js','storefront.js','storefront.css','collection-config.js'];
const hashes={};for(const file of files){const b=fs.readFileSync('public/prototype/'+file);hashes[file]=crypto.createHash('sha256').update(b).digest('hex');fs.writeFileSync(dir+'before-'+file,b);}
fs.writeFileSync(dir+'before-source-hashes.json',JSON.stringify(hashes,null,2));
let qa=fs.readFileSync('artifacts/pilot-models/measure-browser.mjs','utf8');
qa=qa.replace("path.resolve('artifacts/pilot-models')","path.resolve('artifacts/refinement')");
// The new baseline records the current downloaded-model pilot, not its predecessor.
fs.writeFileSync(dir+'measure-browser.mjs',qa);
let nav=fs.readFileSync('artifacts/pilot-models/verify-navigation.mjs','utf8').replace("path.resolve('artifacts/pilot-models/navigation')","path.resolve('artifacts/refinement/navigation')");
fs.mkdirSync(dir+'navigation',{recursive:true});fs.writeFileSync(dir+'verify-navigation.mjs',nav);
