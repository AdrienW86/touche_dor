import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const root='artifacts/pilot-models/';
const data=JSON.parse(fs.readFileSync(root+'after-performance.json'));
const manifest=JSON.parse(fs.readFileSync('public/assets/models/pilot/manifest.json'));
const nav=JSON.parse(fs.readFileSync(root+'navigation/browser-report.json'));
const sources=JSON.parse(fs.readFileSync(root+'protected-source-report.json'));
assert.ok(!data.failure);assert.equal(data.errors.length,0);assert.equal(data.networkErrors.length,0);
assert.equal(data.pilot.otherShowcases,5);assert.equal(data.pilot.busts.length,3);
for(const [i,size] of [1.38,2.01,1.18].entries())assert.ok(Math.abs(data.pilot.dimensions[i]-size)<.0001);
assert.ok(Math.abs(data.pilot.position[0]+1.5)<.0001&&Math.abs(data.pilot.position[2]-.3)<.0001);
assert.equal(data.pilot.hiddenOriginalLampParts,1);assert.ok(Math.abs(data.pilot.lamp.dimensions[1]-.48)<.0001);
assert.ok(Object.values(nav.checks).every(Boolean));assert.ok(Object.values(sources.checks).every(Boolean));
for(const model of manifest.runtime){
 const bytes=fs.readFileSync('public/assets/models/pilot/'+model.file);
 assert.equal(bytes.readUInt32LE(0),0x46546c67);assert.equal(bytes.readUInt32LE(4),2);assert.equal(bytes.length,model.bytes);
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),model.sha256);
}
assert.equal(manifest.records.filter(m=>m.integrated).length,3);
for(const asset of manifest.records.filter(m=>m.integrated))assert.ok(asset.license==='cc_zero'||asset.license.endsWith('/by/4.0/'));
for(const file of ['after-vitrine-close.png','after-applique-close.png','navigation/open.png','review.html','VALIDATION.md'])assert.ok(fs.statSync(root+file).size>0);
const result={status:'passed',envelopePreserved:true,centerPreserved:true,threeDownloadedBustInstances:true,fiveOtherShowcasesPreserved:true,onePilotSconce:true,threeGlbHashesVerified:true,commercialLicensesVerified:true,browserChecksPassed:Object.values(nav.checks).length,protectedSourcesPassed:Object.values(sources.checks).length,reviewRequired:true};
fs.writeFileSync(root+'pilot-checks.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
