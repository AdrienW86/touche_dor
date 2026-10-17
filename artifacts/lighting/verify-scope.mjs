import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(directory, '../..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8').replace(/\r\n?/g, '\n');
const hash = source => createHash('sha256').update(source).digest('hex');
const before = read('artifacts/lighting/before.html');
const after = read('public/prototype/maison-noire.html');
const restored = after
  .replace('<script src="/prototype/vendor/Reflector.r128.js"></script>\n', '')
  .replace('<script src="/prototype/vendor/RectAreaLightUniformsLib.r128.js"></script>\n', '')
  .replace('<script src="/prototype/interior-lighting.js"></script>\n', '')
  .replace('window.createMaisonInteriorLighting(T,scene,renderer,architecture,amb,pl,strip);\n', '')
  .replace('color:new T.Color(.72,.49,.25)', 'color:new T.Color(6,5.2,4)');
assert.equal(restored, before, 'Only lighting initialization and environment radiance may change in the original document.');
assert.equal(read('public/prototype/interior-materials.js'), read('artifacts/lighting/before-interior-materials.js'));
const frame = source => source.slice(source.indexOf('function size(){'));
assert.equal(frame(before), frame(after), 'Camera, navigation and frame animations must be byte-identical.');
const baseline = JSON.parse(read('artifacts/lighting/baseline-report.json'));
for (const file of ['entrance.js', 'entrance-textures.js']) {
  const previous = Object.entries(baseline.loadedSources).find(([url]) => url.endsWith('/' + file))[1];
  assert.equal(hash(fs.readFileSync(path.join(root, 'public/prototype', file))), previous.sha256);
}
const materialBlock = source => source.slice(source.indexOf('const S=(o)=>'), source.indexOf('/* ============ 4. LA BOUTIQUE'));
assert.equal(materialBlock(before), materialBlock(after));
const cases = source => source.slice(source.indexOf('/* ============ 5. BIJOUX + VITRINES'), source.indexOf('// lumières chaudes'));
assert.equal(cases(before), cases(after));
const report = { passed: true, checks: {
  fullDocumentRestoredAfterFiveAllowedLightingChanges: true,
  visitCameraScrollAndAnimationsByteIdentical: true,
  displayCaseGeometryAndMaterialsByteIdentical: true,
  sharedMaterialsByteIdentical: true,
  architectureMaterialsUnchanged: true,
  entranceAndFacadeUnchanged: true,
  cssAndUiUnchanged: true,
}, hashes: { before: hash(before), restored: hash(restored), after: hash(after),
  frameAndNavigation: hash(frame(after)), displayCases: hash(cases(after)),
  lightingModule: hash(read('public/prototype/interior-lighting.js')) } };
fs.writeFileSync(path.join(directory, 'scope-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
