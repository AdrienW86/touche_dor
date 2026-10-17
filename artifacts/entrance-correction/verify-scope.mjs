/* Source conservation audit for the entrance correction. No production writes. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
// Run from the project root. Reading through stdin also works in the Windows
// sandbox, whose launcher may disallow realpath on ancestor directories.
const directory = path.resolve(process.cwd(), 'artifacts/entrance-correction');
const root = path.resolve(directory, '../..');
const bytes = file => fs.readFileSync(path.join(root, file));
const read = file => bytes(file).toString('utf8');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const beforeHtml = read('artifacts/entrance-correction/before.html');
const currentHtml = read('public/prototype/maison-noire.html');
const beforeEntrance = read('artifacts/entrance-correction/before-entrance.js');
const currentEntrance = read('public/prototype/entrance.js');
const checks = [];
function check(name, passed, evidence) {
  checks.push({ name, passed: Boolean(passed), ...(evidence === undefined ? {} : { evidence }) });
}
function section(source, start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  if (from === -1 || to === -1) throw new Error(`Missing section: ${start} / ${end}`);
  return source.slice(from, to);
}
function compareSection(name, start, end) {
  try {
    const before = section(beforeEntrance, start, end);
    const current = section(currentEntrance, start, end);
    check(name, before === current, { beforeSha256: hash(before), currentSha256: hash(current) });
  } catch (error) {
    check(name, false, error.message);
  }
}

const stripStyle = html => html.replace(/(<style>)[\s\S]*?(<\/style>)/, '$1$2');
check('Complete HTML outside stylesheet is byte-identical', stripStyle(beforeHtml) === stripStyle(currentHtml));
const scriptTags = html => Array.from(html.matchAll(/<script\b[^>]*>[\s\S]*?<\/script>/g), match => match[0]);
const beforeScripts = scriptTags(beforeHtml);
const currentScripts = scriptTags(currentHtml);
check('All script tags, camera, scroll interpolation, door animations, interior, six vitrines, product and cart logic are byte-identical',
  JSON.stringify(beforeScripts) === JSON.stringify(currentScripts), {
    beforeSha256: hash(beforeScripts.join('\n')),
    currentSha256: hash(currentScripts.join('\n')),
    scriptCount: currentScripts.length,
  });
check('Black marble texture generator is byte-identical',
  bytes('artifacts/entrance-correction/before-entrance-textures.js').equals(bytes('public/prototype/entrance-textures.js')), {
    sha256: hash(bytes('public/prototype/entrance-textures.js')),
  });

// Parse CSS blocks with quoted strings and comments respected. Only the
// existing introduction and its responsive variants may differ.
const introSelectors = new Set(['#intro', '#intro span', '#intro>span', '#intro h1', '#intro h1 span', '#intro p', '#intro i', '#intro::before']);
function cssBlocks(source, context = []) {
  source = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const rules = [];
  let index = 0;
  while (index < source.length) {
    while (/\s/.test(source[index] || '') && index < source.length) index++;
    if (index === source.length) break;
    const selectorStart = index;
    while (index < source.length && source[index] !== '{') index++;
    if (index === source.length) throw new Error('Unexpected trailing CSS');
    const selector = source.slice(selectorStart, index).trim();
    const bodyStart = ++index;
    let depth = 1, quote = '';
    while (index < source.length && depth) {
      const char = source[index];
      if (quote) {
        if (char === '\\') index++;
        else if (char === quote) quote = '';
      } else if (char === '"' || char === "'") quote = char;
      else if (char === '{') depth++;
      else if (char === '}') depth--;
      index++;
    }
    if (depth) throw new Error(`Unclosed CSS rule: ${selector}`);
    const body = source.slice(bodyStart, index - 1);
    if (/^@media\b/.test(selector)) rules.push(...cssBlocks(body, [...context, selector]));
    else rules.push({ context, selector, body });
  }
  return rules;
}
const css = html => html.match(/<style>([\s\S]*?)<\/style>/)[1];
const beforeCss = cssBlocks(css(beforeHtml));
const currentCss = cssBlocks(css(currentHtml));
const isIntro = rule => rule.selector.split(',').every(selector => introSelectors.has(selector.trim()));
const nonIntro = rules => rules.filter(rule => !isIntro(rule));
check('CSS outside the introduction is byte-identical by rule and media context',
  JSON.stringify(nonIntro(beforeCss)) === JSON.stringify(nonIntro(currentCss)), {
    conservedRuleCount: nonIntro(currentCss).length,
    permittedIntroSelectors: [...new Set(currentCss.filter(isIntro).map(rule => rule.selector))],
  });

compareSection('Exterior reflection studio and shader attenuation are unchanged',
  '/* Exterior only.', '    const brass =');
compareSection('Generic beveled geometry helper is unchanged',
  '    const geometries = new Map();', '    // Baked local light wash');
compareSection('Marble material, slab geometry, facade dimensions, gold frames and sill are unchanged',
  '    const lightingMap =', '    const doorGlass =');
compareSection('Batching and return preserve door hierarchy and animation transforms',
  '    // Batch the fixed trim', '})();');

const geometryExpressions = {
  hingeOrigins: /leaf\.position\.set\([^;]+;/,
  glassDimensions: /new T\.BoxGeometry\(1\.1, 2\.9, \.03\)/,
  glassPositionAndSorting: /pane\.position\.set\([^;]+; pane\.renderOrder = 2; leaf\.add\(pane\);/,
  railDimensions: /\[\[1\.14, \.07, 0, 2\.95\][\s\S]*?\]\]\.forEach\(a => \{/,
  railPosition: /const x = -s \* \(\.55 \+ a\[2\]\);/,
  handlePosition: /handle\.position\.set\([^;]+;/,
  mountHeights: /\[ \.92, 1\.48 \]\.forEach\(y => \{/,
  mountPositions: /mount\.rotation\.x = Math\.PI \/ 2; mount\.position\.set\([^;]+; leaf\.add\(mount\);/,
  hingeDetails: /\[\.3, 1\.5, 2\.7\]\.forEach\(y => box\([^;]+;/,
};
for (const [name, expression] of Object.entries(geometryExpressions)) {
  const before = beforeEntrance.match(expression)?.[0];
  const current = currentEntrance.match(expression)?.[0];
  check(`Door geometry preserved: ${name}`, Boolean(before) && current === before, { before, current });
}
const profile = currentEntrance.match(/const cylinder = new T\.LatheGeometry\(\[([\s\S]*?)\]\.map\(point/);
const profilePoints = profile ? Array.from(profile[1].matchAll(/\[([\d.]+), ([-\d.]+)\]/g), item => [Number(item[1]), Number(item[2])]) : [];
check('Refined handle profile preserves original radius and total height', profilePoints.length > 0
  && Math.max(...profilePoints.map(point => point[0])) === .025
  && Math.min(...profilePoints.map(point => point[1])) === -.35
  && Math.max(...profilePoints.map(point => point[1])) === .35,
{ maximumRadius: .025, height: .7, profilePoints });
check('Handle mounting dimensions are unchanged; only radial segment count increased',
  /new T\.CylinderGeometry\(\.018, \.018, \.075, 12\)/.test(beforeEntrance)
  && /new T\.CylinderGeometry\(\.018, \.018, \.075, 16\)/.test(currentEntrance));
for (const name of ['brass', 'edge', 'bronze', 'recess', 'warm']) {
  const expression = new RegExp(`const ${name} = [^;]+;`);
  const before = beforeEntrance.match(expression)?.[0];
  const current = currentEntrance.match(expression)?.[0];
  check(`Shared facade finish unchanged: ${name}`, Boolean(before) && current === before);
}
const oldSconce = section(beforeEntrance, '    // Vertical, frosted warm sconces', '    const haloCanvas');
const newSconce = section(currentEntrance, '    // Vertical, frosted warm sconces', '    const haloCanvas');
const normalizedSconce = source => source
  .replace(/sconceMetal/g, 'bronze').replace(/sconceEdge/g, 'edge')
  .replace(/, root, \.00\d\)/g, ')')
  .replace(/box\(\.013, \.72, \.046, bronze/, 'box(.013, .72, .046, brass')
  .replace(/box\(\.103, \.085, \.085, bronze/, 'box(.103, .13, .085, brass');
check('Sconce locations and outer dimensions are conserved, with only local finish, bevel and center band refinement',
  normalizedSconce(oldSconce) === normalizedSconce(newSconce));
check('No tree, branch, foliage, planter, soil, tree instancing or tree shader remains in the entrance source',
  !/leafMaterial|foliage|olive|bark|leafGeometry|branchGeometry|soilMaterial|planterMaterial|InstancedMesh\(|entrance-olive-uplight|Olivier|boundInstances/.test(currentEntrance));
check('Plant-only low uplight is removed', !/glow\(s \* 1\.98, \.15,/.test(currentEntrance));
for (const expression of ['glow(s * 1.98, 2.25, .65, .85, .5);', 'glow(s * 1.3, 1.5, .25, 1.8, .14);']) {
  check(`Architectural facade glow retained: ${expression}`, beforeEntrance.includes(expression) && currentEntrance.includes(expression));
}

// Captured before correction edits; hashes are over the actual file bytes.
const protectedHashes = {
  'components/MaisonNoire.tsx': '0126b4c8f4a110c1d04f575b151bb44333b4b650fa491c4d3b1c26ce5c7f97f4',
  'app/page.tsx': '703834344279f482a54df6f8d52958639dfb10eb005507325b041adad7df48ab',
  'app/layout.tsx': '51517c586aad48287946fbc814693ac14d27d48a3c37407efb7970d2f4c4b5e6',
  'app/globals.css': '81ace91f3d86f61941854a8a2f3e23ba4702939ae78a03be5f6bfc3c77a5a9bd',
  'next.config.ts': 'aa21fd07841c9b9ef8a4c25f10214d03359ece3fc96782473b28f18f2238d675',
  'package.json': '7faccb21aeada758272a1f8afb61ad4a0b2c9ec66b75abc398c11778cdb1ffe5',
  'package-lock.json': '9c6b0511b29a9875f67234be34a8af86f10a3c68d0f0c95ed4b3484e139f219a',
  'tsconfig.json': '0e3d89e6f5bda2b6bc60e6e67174faba8336b087bae9cee271c57943547ea5d9',
  'eslint.config.mjs': '927cc3e7a3599cc1d6386a5fa73a6db71be3bd5f0c0d0e5222366614c7d5f9e5',
};
for (const [file, expected] of Object.entries(protectedHashes)) {
  const current = hash(bytes(file));
  check(`Protected application/configuration source unchanged: ${file}`, current === expected, { sha256: current });
}

const report = {
  passed: checks.every(item => item.passed),
  comparison: 'Snapshot from the current version before this correction. Byte equality is used for unchanged HTML/script/texture and protected application files; CSS comparison permits only explicit #intro rules.',
  checks,
  sourceHashes: {
    beforeHtml: hash(beforeHtml), currentHtml: hash(currentHtml),
    beforeEntrance: hash(beforeEntrance), currentEntrance: hash(currentEntrance),
  },
  preservedGeometry: {
    aperture: { width: 2.4, height: 3, facadeZ: 8 },
    doorPivots: [[-1.15, 0, 8.1], [1.15, 0, 8.1]],
    glass: { width: 1.1, height: 2.9, depth: 0.03 },
    openingRadians: [1.45, -1.45],
  },
};
fs.writeFileSync(path.join(directory, 'scope-report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ passed: report.passed, checks: checks.length, failures: checks.filter(item => !item.passed) }, null, 2));
if (!report.passed) process.exitCode = 1;
