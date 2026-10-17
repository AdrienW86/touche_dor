import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const destination = path.resolve(directory, '../../public/prototype/assets/interior');
const optimization = JSON.parse(await fs.readFile(path.join(directory, 'optimization-report.json'), 'utf8'));
const assets = [
  { id: 'Marble016', publisher: 'ambientCG', source: 'https://ambientcg.com/a/Marble016',
    licenseSource: 'https://docs.ambientcg.com/license/',
    download: 'https://ambientcg.com/get?file=Marble016_2K-JPG.zip',
    archive: 'Marble016_2K-JPG.zip', use: 'Floor, central inlay and lower wall panels' },
  { id: 'Plaster001', publisher: 'ambientCG', source: 'https://ambientcg.com/a/Plaster001',
    licenseSource: 'https://docs.ambientcg.com/license/',
    download: 'https://ambientcg.com/get?file=Plaster001_1K-JPG.zip',
    archive: 'Plaster001_1K-JPG.zip', use: 'Upper walls, columns and ceiling' },
  { id: 'studio_small_09', publisher: 'Poly Haven', author: 'Sergej Majboroda',
    source: 'https://polyhaven.com/a/studio_small_09', licenseSource: 'https://polyhaven.com/license',
    download: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr',
    archive: 'studio_small_09_1k.hdr', use: 'Reflection environment for architecture materials only' },
];
for (const asset of assets) {
  const archive = await fs.readFile(path.join(directory, 'downloads', asset.archive));
  Object.assign(asset, { license: 'CC0-1.0', commercialUse: true, attributionRequired: false,
    archiveBytes: archive.length, archiveSha256: createHash('sha256').update(archive).digest('hex') });
}
const files = [];
for (const file of optimization.files) {
  const data = await fs.readFile(path.join(destination, file.file));
  if (createHash('sha256').update(data).digest('hex') !== file.sha256) throw new Error('Asset hash mismatch: ' + file.file);
  files.push({ ...file, license: 'CC0-1.0', source: assets.find(asset => asset.id === file.asset).source });
}
const hdr = await fs.readFile(path.join(destination, 'studio_small_09_1k.hdr'));
files.push({ asset: 'studio_small_09', file: 'studio_small_09_1k.hdr', role: 'HDRI', width: 1024, height: 512,
  bytes: hdr.length, sha256: createHash('sha256').update(hdr).digest('hex'),
  license: 'CC0-1.0', source: assets[2].source, transformation: 'Original Radiance HDR; runtime PMREM prefilter' });
const manifest = { acquiredOn: '2026-10-17', phase: 'Architecture materials; display cases unchanged', assets, files,
  totalServedAssetBytes: files.reduce((n, file) => n + file.bytes, 0),
  loader: { file: '../../vendor/RGBELoader.r128.js', license: 'MIT', noticeRequired: true,
    notice: '../../vendor/THREE-LICENSE.txt', source: 'https://github.com/mrdoob/three.js/blob/r128/examples/js/loaders/RGBELoader.js' } };
await fs.writeFile(path.join(destination, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ files: files.length, totalBytes: manifest.totalServedAssetBytes, licenses: ['CC0-1.0', 'MIT loader'] }));
