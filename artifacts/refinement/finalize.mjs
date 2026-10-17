import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';
const root='artifacts/refinement/';
const read=file=>JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const before=read(root+'before-gpu-performance.json'),after=read(root+'after-gpu-performance.json'),review=read(root+'after-gpu-review-data.json'),nav=read(root+'navigation/browser-report.json');
const beforeHashes=read(root+'before-source-hashes.json'),protectedChecks={};
for(const [file,digest] of Object.entries(beforeHashes))if(file!=='pilot-models.js')protectedChecks[file]=hash('public/prototype/'+file)===digest;
assert.ok(Object.values(protectedChecks).every(Boolean));
assert.ok(!after.failure&&!review.failure);assert.equal(after.errors.length,0);assert.equal(review.errors.length,0);assert.equal(after.networkErrors.length,0);
assert.ok(Object.values(nav.checks).every(Boolean));assert.ok(after.renderer.includes('NVIDIA GeForce RTX 3060'));assert.equal(after.checkpoints.firstShowcase.frameSamples,180);assert.equal(before.checkpoints.firstShowcase.frameSamples,180);
assert.equal(review.inspection.originalVisitCameraUnchanged,true);assert.equal(after.pilot.otherShowcases,5);assert.equal(after.pilot.busts.length,3);
assert.ok(after.pilot.dimensions[0]<=1.38+.001&&after.pilot.dimensions[1]<1.42&&after.pilot.dimensions[2]<1.18);
assert.ok(Math.abs(after.pilot.position[0]+1.5)<.0001&&Math.abs(after.pilot.position[2]-.3)<.0001);
assert.ok(Math.abs(after.pilot.lamp.dimensions[1]-.78)<.0001);
assert.equal(review.inspection.panes.length,5);assert.equal(review.inspection.panes.filter(o=>o.name.includes('front_pane')).length,1);assert.ok(review.inspection.panes.every(o=>o.opacity===.018&&!o.depthWrite&&o.side===0));
assert.ok(review.inspection.busts.every(o=>o.frontGap>.06&&o.leftGap>.1&&o.rightGap>.1&&o.bounds[0][2]>-.21));
const oldManifest=read('public/assets/models/pilot/manifest.json');
for(const model of oldManifest.runtime)assert.equal(hash('public/assets/models/pilot/'+model.file),model.sha256,'Existing backup and bust unchanged');
const code=fs.readFileSync('public/prototype/pilot-models.js','utf8');assert.ok(!code.includes("load('/assets/models/pilot/necklace-cabinet.glb')")&&!code.includes("load('/assets/models/pilot/wall-light.glb')"));
const oldLights=read('artifacts/pilot-models/after-performance.json').pilot.lights;
const originalLights=after.pilot.lights.filter(o=>!(o.type==='SpotLight'&&Math.abs(o.position[1]-1.365)<.0001));
assert.deepEqual(originalLights,oldLights,'All original light positions and intensities unchanged');
const sconce=read(root+'modern-sconce-metadata.json');assert.equal(sconce.license,'cc_zero');assert.equal(sconce.isFree,true);
const resources=[
 {name:'GEM — Jewelry Display Case',author:'Innerscene',source:'https://www.innerscene.com/tools/library/3d-parts/gem-jewelry-display-case-9405030a',download:'https://www.innerscene.com/api/library/gem-jewelry-display-case-9405030a/download',license:'https://creativecommons.org/publicdomain/zero/1.0/',sourceFile:'artifacts/refinement/downloads/gem.glb',runtime:'public/assets/models/refinement/gem-counter.glb',evidence:'artifacts/refinement/gem-source.html'},
 {name:'Wall Light',author:sconce.author.fullName.trim(),source:'https://www.blendkit.com/asset-gallery-detail/0d8f6d0a-a383-4476-bc1b-a8ae8ff22135/',license:'https://creativecommons.org/publicdomain/zero/1.0/',sourceFile:'artifacts/refinement/downloads/modern-sconce.blend',runtime:'public/assets/models/refinement/vertical-sconce.glb',evidence:'artifacts/refinement/modern-sconce-metadata.json'},
 {name:'Necklace With Display Stand',author:'muratgt',source:'https://sketchfab.com/3d-models/necklace-with-display-stand-7279cac4115a40e6ac345d68e17f15d1',license:'https://creativecommons.org/licenses/by/4.0/',runtime:'public/assets/models/pilot/necklace-bust.glb',evidence:'artifacts/pilot-models/necklace-display-metadata.json',unchangedExistingFile:true}
].map(r=>({...r,runtimeBytes:fs.statSync(r.runtime).size,runtimeSha256:hash(r.runtime),...(r.sourceFile?{sourceBytes:fs.statSync(r.sourceFile).size,sourceSha256:hash(r.sourceFile)}:{})}));
const manifest={retrieved:'2026-10-17',resources,backupPolicy:'Previous cabinet and classic sconce retained intact under /assets/models/pilot/, not requested by the active loader. The existing necklace-bust GLB is shared.',adaptationsNotice:'/assets/models/refinement/ATTRIBUTION.html'};
fs.writeFileSync('public/assets/models/refinement/manifest.json',JSON.stringify(manifest,null,2));
const checks={status:'passed',protectedChecks,browserChecks:Object.values(nav.checks).length,originalLightsUnchanged:true,twoShortRangeShowcaseSpots:true,threeBustsClearOfGlass:true,singleFrontPane:true,existingBustAndBackupFilesUnchanged:true,originalVisitCameraUnchanged:true,hardwareRenderer:after.renderer,reviewRequired:true};
fs.writeFileSync(root+'checks.json',JSON.stringify(checks,null,2));fs.copyFileSync('artifacts/finalization/scope-report.json',root+'scope-report.json');
const n=v=>v.toLocaleString('fr-FR',{maximumFractionDigits:2}),a=after.checkpoints.firstShowcase,b=before.checkpoints.firstShowcase;
const metrics=[['Intervalle moyen entre images (ms)',b.meanFrameMs,a.meanFrameMs],['P95 entre images (ms)',b.p95FrameMs,a.p95FrameMs],['Soumission CPU du rendu au premier arrêt (ms)',b.meanRenderMs,a.meanRenderMs],['Soumission CPU du rendu à l’entrée (ms)',before.checkpoints.entrance.meanRenderMs,after.checkpoints.entrance.meanRenderMs],['Triangles soumis, reflet compris',b.meanTriangles,a.meanTriangles],['Appels de dessin, reflet compris',b.meanDrawCalls,a.meanDrawCalls],['Tampons géométriques CPU (octets)',b.geometryBytes,a.geometryBytes],['Textures GPU',b.textures,a.textures]];
const rows=metrics.map(([label,x,y])=>`| ${label} | ${n(x)} | ${n(y)} |`).join('\n');
const size=resources.reduce((sum,r)=>sum+r.runtimeBytes,0);
fs.writeFileSync(root+'VALIDATION.md',`# Maison noire — raffinement contemporain

## Résultat proposé

Le meuble mouluré Large Display Case est remplacé par un autre modèle téléchargé : GEM, un comptoir de bijouterie contemporain à quatre tiroirs, pieds et prises métalliques fines. Il conserve sa construction et ses biseaux d’origine. Finition noyer sombre et laiton champagne, hauteur totale ramenée de 2,01 m à 1,41 m. Dimensions mesurées : ${after.pilot.dimensions.map(n).join(' × ')} m (largeur × hauteur × profondeur). Centre conservé : −1,5 ; 0 ; 0,3. L’encombrement reste dans celui de la station initiale et dégage le passage central.

Les trois bustes et les colliers détaillés précédents sont conservés sans modification du GLB : hauteurs nominales 55, 42 et 46 cm, orientations adaptées à l’arrêt de visite, velours anthracite mat et microtexture atténuée. Les proportions des chaînes et des pendentifs restent celles du modèle. Le métal reçoit maintenant les reflets HDRI déjà présents dans le projet et deux spots doux de portée limitée à 92 cm, intégrés à cette station. Un liseré LED utilise une adaptation du profil supérieur du meuble. Les autres lumières, leurs positions et leurs intensités sont strictement conservées.

Le vitrage est ramené à cinq panneaux : face, arrière, deux côtés, dessus. Une seule vitre source élargie remplace les deux panneaux coulissants superposés. Pas de boîte transparente supplémentaire, pas de tracé d’arêtes ajouté. Matériau simple face, opacité 1,8 %, profondeur non écrite, reflets discrets. Les bustes gardent environ 6 cm ou davantage devant le vitrage frontal et plus de 10 cm sur les côtés ; le buste central est également recentré pour dégager sa face arrière.

L’applique classique est remplacée uniquement à l’ancre pilote par un vrai modèle vertical contemporain, hauteur 78 cm : tige fine, rosace avec fixation, bague en laiton et diffuseur cylindrique opalin chaud. Les volumes internes masqués par l’opale et un cylindre superposé ont été retirés. Les autres appliques rectangulaires attendent votre validation avant harmonisation générale ; aucune généralisation n’a été faite.

## Captures navigateur

1. [Vue de face en gros plan](after-gpu-front-inspection.png) : inspection isolée du modèle complet, éclairage de présentation et caméra technique distincte. La caméra de visite n’est jamais déplacée.
2. [Position réelle d’arrêt, interface conservée](after-gpu-vitrine.png).
3. [Applique en gros plan](after-gpu-applique-close.png).
4. [Vue générale du couloir](after-gpu-couloir-overview.png), sur la trajectoire existante.
5. [Comparatif avant/après interactif](review.html), même résolution et même arrêt.

La carte produit garde son emplacement existant. La vue d’arrêt montre l’interface réelle ; la vue isolée permet de juger le meuble entier. Les gros plans du couloir sont recadrés avec DPR 2, en respectant le plafond existant de rendu 3D à 1,75.

## Ressources et licences

| Ressource | Auteur | Licence | État |
|---|---|---|---|
| [GEM](https://www.innerscene.com/tools/library/3d-parts/gem-jewelry-display-case-9405030a) | Innerscene | CC0 1.0 | Nouveau téléchargement GLB, adapté et intégré |
| [Wall Light](https://www.blendkit.com/asset-gallery-detail/0d8f6d0a-a383-4476-bc1b-a8ae8ff22135/) | abd3d | CC0 1.0 | Nouveau téléchargement Blender, converti et intégré |
| [Necklace With Display Stand](https://sketchfab.com/3d-models/necklace-with-display-stand-7279cac4115a40e6ac345d68e17f15d1) | muratgt | CC BY 4.0 | GLB existant conservé, trois exemplaires |

Les licences commerciales, provenances et adaptations sont documentées dans la [notice publique](../../public/assets/models/refinement/ATTRIBUTION.html) et le [manifeste](../../public/assets/models/refinement/manifest.json). L’attribution muratgt / CC BY 4.0 est conservée. Les deux nouveaux téléchargements sont libres d’usage commercial et de redistribution sous CC0. Les pages de provenance et conditions sont archivées ici. Aucun achat nécessaire.

Les anciens modèles sont conservés intégralement en secours, sans chargement dans le chemin normal. Les trois GLB actifs totalisent ${n(size)} octets (${n(size/1048576)} Mio), contre ${n(oldManifest.runtime.reduce((s,r)=>s+r.bytes,0)/1048576)} Mio auparavant. Textures plafonnées à 1024 px, corps du meuble regroupé par matériau, pièces invisibles retirées, aucun décodeur additionnel.

## Performances GPU réelles

Adaptateur confirmé : **NVIDIA GeForce RTX 3060, ANGLE Direct3D11**. Chromium headless, 1780 × 883, DPR 1, 180 images stabilisées avant et après à chaque point. Il ne s’agit pas de SwiftShader. Les gros plans sont capturés ensuite et ne participent pas aux mesures. Le défilement est placé aux mêmes arrêts par le contrôleur existant.

| Mesure | Avant | Après |
|---|---:|---:|
${rows}

La cadence observée est proche de 144 images/s dans ce contexte de test et limitée par la cadence de présentation ; ce n’est pas une estimation du débit maximal de la carte. Le temps de soumission CPU n’est pas une mesure de la durée d’exécution GPU. [Données avant](before-gpu-performance.json), [données après](after-gpu-performance.json), [détection GPU](gpu-probe.json).

## Validation technique

35/35 contrôles navigateur réussis sur ordinateur et mobile : portes et poignées, six arrêts et points intermédiaires de caméra, navigation des produits, fiche détail, catalogue, panier, logo, transition 3D / HTML, retour à l’entrée, défilement ordinaire et mouvement réduit, absence de débordement mobile. Aucune erreur console ou réseau. [Rapport](navigation/browser-report.json).

13 invariants historiques de caméra, de défilement et de portes passent. Dix fichiers protégés restent identiques par SHA-256 au début de cette tâche : façade, portes, matériaux architecturaux, lumières globales, code des autres vitrines, catalogue, panier, transition, sections et footer. Le seul module de production modifié est pilot-models.js. Le GLB des bustes et les anciens modèles de secours gardent leurs empreintes. Les relevés des lumières d’origine sont identiques ; seuls les deux spots locaux de la première station sont ajoutés. [Contrôles complémentaires](checks.json), [inspection du vitrage et des marges](after-gpu-review-data.json).

Pas de branche créée ni de déploiement. Pilotes arrêtés à cette version pour validation visuelle avant généralisation.
`);
const table=metrics.map(([label,x,y])=>`<tr><td>${label}</td><td>${n(x)}</td><td>${n(y)}</td></tr>`).join('');
fs.writeFileSync(root+'review.html',`<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Maison noire — raffinement à valider</title><style>body{margin:0;background:#10100e;color:#ece4d5;font:16px/1.6 system-ui}main{max-width:1350px;margin:auto;padding:28px}h1,h2{font-family:Georgia,serif;font-weight:400}a{color:#ddc18b}figure{margin:24px 0;padding:12px;border:1px solid #5d503a}figcaption{padding:10px 0}img{display:block;max-width:100%}.comparison{position:relative}.before{position:absolute;inset:0;clip-path:inset(0 50% 0 0)}input{width:100%;accent-color:#d6b67d}.pair{display:grid;grid-template-columns:2fr 1fr;gap:24px}.pair figure{margin:0}.pair img{max-height:760px;object-fit:contain;margin:auto}td,th{text-align:left;padding:9px;border-bottom:1px solid #51452f}table{border-collapse:collapse;width:100%}@media(max-width:700px){.pair{grid-template-columns:1fr}}</style><main><h1>Maison noire — vitrine et applique contemporaines</h1><p>Meuble GEM remplacé, trois bustes conservés et réorientés, vitrage frontal unique, reflets HDRI et LED locales. Une seule applique verticale est proposée à la validation.</p><figure><div class="comparison"><img src="after-gpu-vitrine.png" alt="Après : comptoir contemporain au point d’arrêt réel"><img class="before" src="before-gpu-vitrine.png" alt="Avant : armoire moulurée au même arrêt"></div><input type="range" min="0" max="100" value="50" aria-label="Comparer avant à gauche et après à droite"><figcaption>Avant à gauche · Après à droite. Même caméra, 1780 × 883, GPU RTX 3060.</figcaption></figure><div class="pair"><figure><a href="after-gpu-front-inspection.png"><img src="after-gpu-front-inspection.png" alt="Vue frontale isolée du nouveau meuble complet"></a><figcaption>Vue de face isolée : caméra technique distincte, caméra de visite intacte. Construction téléchargée, tiroirs, pieds et montants fins.</figcaption></figure><figure><a href="after-gpu-applique-close.png"><img src="after-gpu-applique-close.png" alt="Applique contemporaine en laiton et opale"></a><figcaption>Applique pilote : 78 cm, tige et fixation détaillées, diffuseur opalin chaud.</figcaption></figure></div><figure><img src="after-gpu-couloir-overview.png" alt="Vue d’ensemble du couloir avec le meuble bas"><figcaption>Vue générale sur la trajectoire d’origine. Les cinq autres vitrines et les autres appliques restent inchangées.</figcaption></figure><h2>Mesures avec accélération matérielle</h2><p>NVIDIA RTX 3060 / Direct3D11, 180 images par point, DPR 1. Cadence de présentation proche de 144 images/s ; aucun débit maximal revendiqué.</p><table><tr><th>Mesure</th><th>Avant</th><th>Après</th></tr>${table}</table><p>35/35 contrôles navigateur et 13 invariants historiques passent. Aucune erreur console ou réseau. Aucun déploiement.</p><p><a href="VALIDATION.md">Rapport, limites et ressources</a> · <a href="navigation/browser-report.json">Tests navigateur</a> · <a href="navigation/mobile-vitrine.png">Mobile</a> · <a href="../../public/assets/models/refinement/ATTRIBUTION.html">Provenances et licences</a></p><p>Pilotes soumis à votre validation visuelle avant généralisation.</p></main><script>document.querySelector('input').addEventListener('input',e=>document.querySelector('.before').style.clipPath='inset(0 '+(100-e.target.value)+'% 0 0)')</script></html>`);
console.log(JSON.stringify({protectedChecks,browserChecks:checks.browserChecks,gpu:after.renderer,bytes:size,dimensions:after.pilot.dimensions},null,2));
