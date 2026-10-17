import fs from 'node:fs';
import assert from 'node:assert/strict';
const before=fs.readFileSync('artifacts/finalization/before.html','utf8');
const after=fs.readFileSync('public/prototype/maison-noire.html','utf8');
const oldDoors=fs.readFileSync('artifacts/finalization/before-entrance.js','utf8');
const newDoors=fs.readFileSync('public/prototype/entrance.js','utf8');
const experience=fs.readFileSync('public/prototype/experience.js','utf8');
const camera=source=>source.match(/const z=Zs\[i\][\s\S]*?doors\[1\]\.rotation\.y=-open\*1\.45;/)?.[0];
assert.ok(camera(before));assert.equal(camera(after),camera(before),'Existing segment camera, look-at and door rotations');
const checks={cameraFormulaUnchanged:true};
for(const [name,token] of Object.entries({
  stops:'Zs=[11,3.5,-3,-9,-15,-21,-27]',
  fov:'cam.fov=a<.8?66:50;cam.updateProjectionMatrix()',
  smoothstep:'let e=q*q*(3-2*q);e=e*e*(3-2*e);',
  side:'const side=i=>i%2?1:-1;',
  aperture:'const ZC=-14,L=44;'
})){assert.ok(before.includes(token)&&after.includes(token),name);checks[name]=true;}
for(const [name,token] of Object.entries({
  doorPivots:'leaf.position.set(s * 1.15, 0, 8.1);',
  glassDimensions:'new T.BoxGeometry(1.1, 2.9, .03)',
  glassCenter:'pane.position.set(-s * .55, 1.5, 0);',
  handleDimensions:'[.025, .34], [.023, .347], [.019, .35], [0, .35]'
})){assert.ok(oldDoors.includes(token)&&newDoors.includes(token),name);checks[name]=true;}
assert.ok(before.includes('body{height:900vh'));assert.ok(experience.includes('const f=Math.min(progress,8)/8*6;'));
assert.ok(experience.includes('progress+=(target-progress)*(motion.matches?1:.06);'));
checks.originalEightViewportDistance=true;checks.originalInterpolationCoefficient=true;
assert.ok(newDoors.includes('handle.position.set(-s * .98, 1.2, .08)'));
assert.ok(newDoors.includes('mount.position.set(-s * .98, y, .046)'));
checks.handleAndMountsMoveTogether=true;
fs.writeFileSync('artifacts/finalization/scope-report.json',JSON.stringify({checks,note:'Decorative bob is disabled under reduced-motion. New approach/zoom camera movement starts only after the original sixth stop.'},null,2));
console.log(Object.keys(checks).length,'scope invariants passed.');
