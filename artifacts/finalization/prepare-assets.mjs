import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { createHash } from 'node:crypto';
const root = process.cwd(), dir = path.join(root, 'artifacts/finalization');
const manifest = [];
for (const [id, prefix] of [['velour_velvet', 'velvet'], ['walnut_veneer', 'walnut']]) {
  const data = JSON.parse(await fs.readFile(path.join(dir, prefix === 'velvet' ? 'velvet-files.json' : 'wood-files.json'), 'utf8'));
  for (const [key, name] of [['Diffuse', 'color'], ['nor_gl', 'normal'], ['Rough', 'roughness']]) {
    const url = data[key]['1k'].jpg.url;
    const response = await fetch(url); if (!response.ok) throw new Error(url + ': ' + response.status);
    const source = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(path.join(dir, `${prefix}-${name}.jpg`), source);
    let pipeline = sharp(source).resize(512, 512);
    // The original velvet is red: only retain its measured luminance/nap;
    // the black swatch is supplied by the Three.js material.
    if (prefix === 'velvet' && name === 'color') pipeline = pipeline.grayscale();
    const file = `public/assets/materials/${prefix}-${name}.webp`;
    await pipeline.webp(name === 'color' ? { quality: 90 } : { lossless: true }).toFile(path.join(root, file));
    const result = await fs.readFile(path.join(root, file));
    manifest.push({ file, url, source: `https://polyhaven.com/a/${id}`, license: 'CC0-1.0', bytes: result.length, sha256: createHash('sha256').update(result).digest('hex'), modification: '512px WebP' + (prefix === 'velvet' && name === 'color' ? ', desaturated' : '') });
  }
}
for (const [suffix, name] of [['NormalGL', 'normal'], ['Roughness', 'roughness']]) {
  const file = `public/assets/materials/brass-${name}.webp`;
  await sharp(path.join(dir, `Metal032/Metal032_1K-JPG_${suffix}.jpg`)).resize(512, 512).webp({ lossless: true }).toFile(path.join(root, file));
  const result = await fs.readFile(path.join(root, file));
  manifest.push({ file, source: 'https://ambientcg.com/view?id=Metal032', license: 'CC0-1.0', bytes: result.length, sha256: createHash('sha256').update(result).digest('hex'), modification: '512px lossless WebP, champagne tint in material' });
}
await fs.writeFile(path.join(root, 'public/assets/materials/manifest.json'), JSON.stringify(manifest, null, 2));
console.log('Prepared', manifest.length, 'maps,', manifest.reduce((n, f) => n + f.bytes, 0), 'bytes');
