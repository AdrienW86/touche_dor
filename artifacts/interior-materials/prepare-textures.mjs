/* Optimize only the downloaded CC0 maps; originals remain in downloads/. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const directory = path.dirname(fileURLToPath(import.meta.url));
const destination = path.resolve(directory, '../../public/prototype/assets/interior');
await fs.mkdir(destination, { recursive: true });
const files = [];
for (const [id, size, colorSize, prefix] of [
  ['Marble016', '2K-JPG', 2048, 'marble'],
  ['Plaster001', '1K-JPG', 1024, 'plaster'],
]) {
  for (const [sourceMap, map] of [['Color', 'color'], ['NormalGL', 'normal'], ['Roughness', 'roughness']]) {
    const source = path.join(directory, 'downloads', id, `${id}_${size}_${sourceMap}.jpg`);
    const target = path.join(destination, `${prefix}-${map}.webp`);
    const resolution = map === 'color' ? colorSize : id === 'Plaster001' && map === 'normal' ? 512 : 1024;
    const input = await fs.readFile(source);
    const pipeline = sharp(input).resize(resolution, resolution, { kernel: 'lanczos3' });
    if (map === 'color') await pipeline.webp({ quality: 93, effort: 6 }).toFile(target);
    else await pipeline.webp({ lossless: true, effort: 6 }).toFile(target);
    const result = await fs.readFile(target);
    files.push({ asset: id, source: path.relative(directory, source), file: path.basename(target),
      role: map, width: resolution, height: resolution, sourceBytes: input.length,
      bytes: result.length, sha256: createHash('sha256').update(result).digest('hex'),
      encoding: map === 'color' ? 'sRGB' : 'linear data; OpenGL normal convention',
      transformation: map === 'color' ? 'WebP quality 93' : 'WebP lossless, ' + resolution + 'px' });
  }
}
await fs.writeFile(path.join(directory, 'optimization-report.json'), JSON.stringify({ files,
  sourceBytes: files.reduce((n, f) => n + f.sourceBytes, 0),
  servedBytes: files.reduce((n, f) => n + f.bytes, 0) }, null, 2));
console.log(JSON.stringify(files.map(({ file, bytes, width }) => ({ file, bytes, width })), null, 2));
