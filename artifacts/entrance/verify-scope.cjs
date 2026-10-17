/* Source conservation check. Run with: node artifacts/entrance/verify-scope.cjs */
/* eslint-disable @typescript-eslint/no-require-imports -- Standalone CommonJS verification script. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const artifactDirectory = __dirname === '.' ? path.resolve(process.cwd(), 'artifacts/entrance') : __dirname;
const root = path.resolve(artifactDirectory, '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n?/g, '\n');
const sha256 = (source) => crypto.createHash('sha256').update(source, 'utf8').digest('hex');
const original = read('artifacts/entrance/original.html');
const current = read('public/prototype/maison-noire.html');
const threeScript = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n';
const entranceScripts = '<script src="/prototype/entrance-textures.js"></script>\n<script src="/prototype/entrance.js"></script>\n';
const originalFacade = 'const fm=S({map:tBlack,roughness:.2,metalness:.35});B(3.8,3,.3,fm,-3.1,1.5,8);B(3.8,3,.3,fm,3.1,1.5,8);B(10,2,.3,fm,0,4,8);B(.12,3.1,.36,gold,-1.2,1.55,8);B(.12,3.1,.36,gold,1.2,1.55,8);B(2.5,.12,.36,gold,0,3.06,8);\nB(8,.06,.4,gold,0,2.95,8);\n';
const originalDoors = `const doors=[-1,1].map(s=>{const g=new T.Group();g.position.set(s*1.15,0,8.1);
 const gl=new T.Mesh(new T.BoxGeometry(1.1,2.9,.03),glass);gl.position.set(-s*.55,1.5,0);g.add(gl);
 [[1.14,.07,0,2.95],[1.14,.07,0,.06],[.07,2.95,.53,1.5],[.07,2.95,-.53,1.5]].forEach(a=>{const b=new T.Mesh(new T.BoxGeometry(a[0],a[1],.06),gold);b.position.set(-s*(.55+a[2]*1),a[3],0);g.add(b)});
 const h=new T.Mesh(new T.CylinderGeometry(.025,.025,.7,12),gold);h.position.set(-s*.1,1.2,.08);g.add(h);scene.add(g);return g});
`;

function replaceOnce(source, before, after, label) {
  assert.equal(source.split(before).length - 1, 1, `${label}: expected exactly one original block`);
  return source.replace(before, after);
}

function section(source, start, end) {
  const from = source.indexOf(start);
  assert.notEqual(from, -1, `Missing section start: ${start}`);
  assert.equal(source.indexOf(start, from + start.length), -1, `Ambiguous section start: ${start}`);
  const to = source.indexOf(end, from + start.length);
  assert.notEqual(to, -1, `Missing section end: ${end}`);
  return source.slice(from, to);
}

function conserved(name, start, end) {
  const before = section(original, start, end);
  const after = section(current, start, end);
  assert.equal(after, before, `${name} changed outside the entrance scope`);
  return { unchanged: true, bytes: Buffer.byteLength(before, 'utf8'), sha256: sha256(before) };
}

let expected = replaceOnce(original, threeScript, threeScript + entranceScripts, 'Entrance script tags');
expected = replaceOnce(expected, originalFacade, 'const entrance=window.createMaisonEntrance(T,scene,renderer);\n', 'Facade and band');
expected = replaceOnce(expected, originalDoors, 'const doors=entrance.doors;\n', 'Door factory');
if (current !== expected) {
  let offset = 0;
  while (offset < current.length && offset < expected.length && current[offset] === expected[offset]) offset++;
  const line = expected.slice(0, offset).split('\n').length;
  assert.fail(`Unexpected source change near normalized line ${line}; allowed replacements do not reproduce the complete file`);
}

const unchanged = {
  documentCssAndInterfaceMarkup: conserved('Document, CSS and interface markup', '<!DOCTYPE html>', threeScript),
  dataTexturesEngineAndMaterials: conserved('Catalog, textures, renderer and shared materials', '(function(){\n', '/* ============ 4. LA BOUTIQUE'),
  interiorBeforeFacade: conserved('Interior geometry before facade', '/* ============ 4. LA BOUTIQUE', '// fa\u00e7ade, enseigne, portes vitr\u00e9es'),
  sign: conserved('Original sign', "const sc=document.createElement('canvas');", 'const doors='),
  ceilingStrips: conserved('Ceiling strips', '// bandeaux lumineux au plafond', '/* ============ 5. BIJOUX + VITRINES'),
  vitrineAndInterface: conserved('Vitrines, jewelry, lighting and interface code', '/* ============ 5. BIJOUX + VITRINES', 'function size(){'),
  cameraResizeAndFrame: conserved('Camera resize, animation frame and scroll navigation', 'function size(){', '</script>'),
};
const inline = (source) => section(source, '<script>\n', '</script>');
const report = {
  passed: true,
  comparison: 'Full source equality after exactly three permitted replacements; CRLF and CR normalized to LF only.',
  allowedChanges: [
    'Two local entrance script tags after the original Three.js CDN tag.',
    'Original facade material, facade geometry and gold band replaced by createMaisonEntrance(T,scene,renderer).',
    'Original door construction replaced by const doors=entrance.doors.',
  ],
  unchanged,
  sourceHashes: {
    originalHtml: sha256(original),
    currentHtml: sha256(current),
    reproducedExpectedHtml: sha256(expected),
    originalInlineScript: sha256(inline(original)),
    currentInlineScript: sha256(inline(current)),
    entranceScript: sha256(read('public/prototype/entrance.js')),
    entranceTexturesScript: sha256(read('public/prototype/entrance-textures.js')),
  },
  originalGeometry: {
    aperture: { minX: -1.2, maxX: 1.2, minY: 0, maxY: 3, facadeZ: 8 },
    doorCount: 2,
    hinges: [[-1.15, 0, 8.1], [1.15, 0, 8.1]],
    pane: { width: 1.1, height: 2.9, depth: 0.03 },
    openingRadians: [1.45, -1.45],
    cameraStopsZ: [11, 3.5, -3, -9, -15, -21, -27],
  },
};
const reportPath = path.join(artifactDirectory, 'scope-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
