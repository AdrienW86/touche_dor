import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(directory, '../..');
const read = relative => fs.readFileSync(path.join(root, relative), 'utf8').replace(/\r\n?/g, '\n');
const hash = source => createHash('sha256').update(source).digest('hex');
const before = read('artifacts/interior-materials/before.html');
const after = read('public/prototype/maison-noire.html');
const from = after.indexOf('const ZC=-14,L=44;');
const to = after.indexOf('// fa\u00e7ade, enseigne, portes vitr\u00e9es');
assert(from >= 0 && to > from);
const architecture = after.slice(from, to);
const normalizedArchitecture = architecture
  .replace('const architecture=window.createMaisonInteriorMaterials(T,renderer),surface=(o,type)=>architecture.apply(o,type);\n', '')
  .replace(/surface\(((?:P|B)\([^()]*\)),'(?:floor|runner|ceiling|wallBase|wallUpper|column)'\)/g, '$1')
  .replaceAll('architecture.brass', 'gold').replaceAll('architecture.wallInset', 'mirror');
const restored = (after.slice(0, from) + normalizedArchitecture + after.slice(to))
  .replace('<script src="/prototype/vendor/RGBELoader.r128.js"></script>\n', '')
  .replace('<script src="/prototype/interior-materials.js"></script>\n', '');
assert.equal(restored, before, 'Change outside architecture material assignments or script tags');

const baseline = JSON.parse(read('artifacts/interior-materials/baseline-report.json'));
for (const basename of ['entrance.js', 'entrance-textures.js']) {
  const previous = Object.entries(baseline.loadedSources).find(([url]) => url.endsWith('/' + basename))[1];
  assert.equal(hash(fs.readFileSync(path.join(root, 'public/prototype', basename))), previous.sha256,
    basename + ' changed outside this phase');
}
const frame = source => source.slice(source.indexOf('function size(){'), source.indexOf('</script>', source.indexOf('function size(){')));
const vitrines = source => source.slice(source.indexOf('/* ============ 5. BIJOUX + VITRINES'), source.indexOf('function size(){'));
assert.equal(frame(after), frame(before));
assert.equal(vitrines(after), vitrines(before));
const report = {
  passed: true,
  checks: {
    fullHtmlRestoredWithOnlyAllowedReplacements: true,
    geometryDimensionsAndPositionsUnchanged: true,
    cameraScrollAndAnimationsByteIdentical: true,
    displayCasesJewelryCartAndLightingByteIdentical: true,
    existingSharedMaterialsByteIdentical: true,
    entranceAndFacadeModulesUnchanged: true,
    cssAndMarkupUnchanged: true,
  },
  sourceHashes: { before: hash(before), after: hash(after), restored: hash(restored),
    cameraAndFrame: hash(frame(after)), displayCasesAndUi: hash(vitrines(after)),
    interiorModule: hash(read('public/prototype/interior-materials.js')) },
};
fs.writeFileSync(path.join(directory, 'scope-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
