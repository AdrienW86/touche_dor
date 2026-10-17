import fs from 'node:fs';
const dir='artifacts/pilot-models/';
const before=JSON.parse(fs.readFileSync(dir+'before-performance.json'));
const after=JSON.parse(fs.readFileSync(dir+'after-performance.json'));
after.transferScope='Cumulative transfer of the measurement load and the DPR 2 review reload; not comparable to the single-load baseline. Rendering checkpoint timings were measured before the reload.';
fs.writeFileSync(dir+'after-performance.json',JSON.stringify(after,null,2));
const nav=JSON.parse(fs.readFileSync(dir+'navigation/browser-report.json'));
const manifest=JSON.parse(fs.readFileSync('public/assets/models/pilot/manifest.json'));
const number=n=>n.toLocaleString('fr-FR',{maximumFractionDigits:1});
const b=before.checkpoints.firstShowcase,a=after.checkpoints.firstShowcase;
const metrics=[['Temps moyen entre images (ms)',b.meanFrameMs,a.meanFrameMs],['Temps CPU de soumission du rendu (ms)',b.meanRenderMs,a.meanRenderMs],['Appels de dessin, reflet inclus',b.meanDrawCalls,a.meanDrawCalls],['Triangles soumis, reflet inclus',b.meanTriangles,a.meanTriangles],['Tampons géométriques CPU de la scène (octets)',b.geometryBytes,a.geometryBytes],['Textures GPU',b.textures,a.textures]];
const rows=metrics.map(([label,b,a])=>`| ${label} | ${number(b)} | ${number(a)} |`).join('\n');
const glbBytes=manifest.runtime.reduce((n,o)=>n+o.bytes,0);
const checks=Object.values(nav.checks).filter(Boolean).length;
const report=`# Maison noire — pilote de modèles téléchargés

## Résultat à valider

Seule la vitrine colliers et sautoirs a été remplacée, à son centre d’origine (−1,5 ; 0 ; 0,3), dans l’enveloppe de 1,38 × 2,01 × 1,18 m. Le meuble complet téléchargé conserve ses moulures, son soubassement panneauté, ses UV et ses textures. Ses proportions ont été adaptées à l’ancien volume. Le bois est assombri, les moulures sont en laiton champagne et le vitrage est transparent. Un liseré émissif discret utilise la moulure supérieure existante, sans ajouter de lumière globale.

Trois exemplaires d’un véritable buste et de son collier sont disposés à des tailles différentes. Les maillons, la monture et les pierres sont des maillages importés ; les bustes ne sont plus des tiges ou des silhouettes paramétriques. Le buste est soudé et lissé, avec matériau velours noir. **Les trois colliers sont des copies du même modèle**, pas trois créations distinctes.

Une seule applique intérieure est remplacée, à gauche (−2,52 ; 2,5 ; −0,966), hauteur 48 cm. Le modèle comprend rosace, bras, fixations, douille, diffuseur flûté opalin et pampille facettée. Les lampes et intensités du couloir restent identiques. Les deux anciennes pièces visibles à cette ancre sont masquées seulement après chargement réussi.

**Limite esthétique :** ce meuble a un dessin plus classique que la référence. Ce pilote n’est pas déclaré définitif ni généralisé. Le rendu de référence reste plus abouti ; cette étape sert à juger les modèles réels dans la scène. Une alternative professionnelle plus proche des compositions de bijouterie est [Stylish jewelry showcase 3, paradizemodels](https://www.cgtrader.com/3d-models/architectural/decoration/stylish-jewelry-showcase-3), affichée à **7 USD** lors de la recherche. Aucun achat ni téléchargement payant effectué ; vérifier la licence de redistribution Web avant toute intégration de ce pack.

## Captures réelles

- [Comparaison interactive et galerie](review.html).
- [Première vitrine rapprochée](after-vitrine-close.png), caméra originale, DPR 2 et plafond de rendu 3D existant à 1,75.
- [Applique rapprochée](after-applique-close.png), recadrage du même point de visite, DPR 2 et rendu 3D à 1,75.
- [Couloir, portes ouvertes](navigation/open.png).
- [Vue générale au premier arrêt](after-vitrine.png).
- [Avant](before-vitrine.png).
- [Mobile, vitrine](navigation/mobile-vitrine.png).

Les captures sont produites dans Chromium local, sans changement de position, de trajectoire ou de champ de caméra. Les gros plans utilisent le recadrage et une densité supérieure ; le plafond existant du moteur à 1,75 est respecté.

## Modèles et licences

Trois ressources réellement intégrées :

| Modèle | Auteur | Licence | Fichier adapté |
|---|---|---|---|
| Large Display Case | Mick Chambers | CC BY 4.0 | necklace-cabinet.glb |
| Necklace With Display Stand | muratgt | CC BY 4.0 | necklace-bust.glb |
| Wall light | abd3d / BlenderKit | CC0 1.0 | wall-light.glb |

Les sources Sketchfab ont été récupérées via leur redistribution publique Objaverse, avec vérification des licences individuelles originales. L’attribution, le lien CC BY et les modifications sont conservés dans la [notice publique](../../public/assets/models/pilot/ATTRIBUTION.html), accessible depuis le footer existant via « Ressources et licences ». La [liste de tous les téléchargements](downloaded-models.md) distingue les candidats rejetés et les trois modèles intégrés. Les fichiers sources et métadonnées sont conservés dans ce dossier ; les [empreintes et liens précis](../../public/assets/models/pilot/manifest.json) sont publics.

Les trois GLB autonomes totalisent **${number(glbBytes)} octets (${number(glbBytes/1048576)} Mio)**. Sans décodeur externe. Les clones partagent géométries et textures. Les textures du meuble sont plafonnées à 1024 px ; les petites facettes invisibles et les subdivisions excessives ont été réduites. Les cinq autres vitrines restent inchangées.

## Mesures avant / après

Chromium headless, **SwiftShader logiciel**, 1780 × 883, densité 1, même premier arrêt et même contrôleur. 22 images stabilisées par relevé, cache désactivé. Reflet plan inclus. Ces durées ne sont pas un benchmark de carte graphique réelle ; aucun objectif de FPS matériel n’est affirmé. Les gros plans ×2 sont réalisés après les mesures.

| Mesure au premier arrêt | Avant | Après |
|---|---:|---:|
${rows}

Le coût de géométrie augmente avec les modèles détaillés ; la fluidité sur une vraie carte graphique reste à vérifier. Les durées CPU de soumission et les intervalles entre images mesurent des choses différentes. Le compteur réseau brut après inclut le rechargement pour les captures DPR 2 : il n’est donc pas comparé au relevé réseau avant. Le poids additionnel mesurable des GLB est celui indiqué plus haut. Les données brutes sont dans [before-performance.json](before-performance.json) et [after-performance.json](after-performance.json).

## Vérifications

${checks}/35 contrôles navigateur passent : portes fermées / ouvertes, vitrage transparent, absence de végétation, six catégories et arrêts, points intermédiaires de caméra, produits précédent / suivant, fiche détail, ajout et quantité du panier, catalogue et catégories, logo, transition HTML, arrêt du rendu 3D, retour à l’entrée, défilement normal et mouvement réduit, affichage mobile sans débordement horizontal. ${nav.errors.length} erreur console, ${nav.networkErrors.length} erreur réseau. [Rapport détaillé](navigation/browser-report.json).

13 invariants historiques de caméra, de défilement et de portes passent. Les 10 empreintes des sources protégées correspondent au relevé avant, en ne retranchant que les trois lignes explicites de raccordement du pilote : script, appel pour i=0, rafraîchissement unique des ombres existantes. [Vérification SHA-256](protected-source-report.json). Le code des cinq autres vitrines, l’architecture, le logo, la transition, le catalogue et le panier sont conservés.

Aucune branche Git créée, aucun déploiement. Arrêt à ce pilote pour validation visuelle.
`;
fs.writeFileSync(dir+'VALIDATION.md',report);
const table=metrics.map(([label,b,a])=>`<tr><td>${label}</td><td>${number(b)}</td><td>${number(a)}</td></tr>`).join('');
fs.writeFileSync(dir+'review.html',`<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Maison noire — validation du pilote</title><style>body{margin:0;background:#0b0a09;color:#eee5d6;font:16px/1.6 system-ui}main{max-width:1350px;margin:auto;padding:30px}h1,h2{font-family:Georgia,serif;font-weight:400}a{color:#dec590}img{max-width:100%;display:block}figure{margin:25px 0;background:#12110f;border:1px solid #4f4331;padding:12px}figcaption{padding:8px 0}.compare{position:relative}.compare .before{position:absolute;inset:0;clip-path:inset(0 50% 0 0)}input{width:100%;accent-color:#d5b577}.pair{display:grid;grid-template-columns:2fr 1fr;gap:24px}table{border-collapse:collapse;width:100%}td,th{text-align:left;border-bottom:1px solid #514631;padding:10px}small{color:#c3b7a5}@media(max-width:700px){.pair{grid-template-columns:1fr}}</style><main><h1>Maison noire — vitrine et applique pilotes</h1><p>Vrais modèles téléchargés, adaptation locale. Le dessin classique du meuble reste à valider avant toute généralisation.</p><figure><div class="compare"><img src="after-vitrine.png" alt="Après : meuble complet et trois bustes"><img class="before" src="before-vitrine.png" alt="Avant : silhouettes provisoires"></div><input aria-label="Comparer avant à gauche et après à droite" type="range" min="0" max="100" value="50"><figcaption>Avant à gauche · Après à droite — déplacer le curseur. Même caméra, 1780 × 883.</figcaption></figure><div class="pair"><figure><a href="after-vitrine-close.png"><img src="after-vitrine-close.png" alt="Vitrine pilote rapprochée"></a><figcaption>Vitrine : bois sombre, moulures champagne, vitrage clair et trois bustes. Même collier décliné à trois échelles.</figcaption></figure><figure><a href="after-applique-close.png"><img src="after-applique-close.png" alt="Applique pilote avec bras et diffuseur opalin"></a><figcaption>Une applique intérieure : verre flûté opalin, bras, rosace et pampille.</figcaption></figure></div><figure><img src="navigation/open.png" alt="Couloir avec portes ouvertes"><figcaption>Vue générale du couloir, portes ouvertes.</figcaption></figure><h2>Performance mesurée</h2><p>SwiftShader logiciel, 22 images par mesure, premier arrêt. Ce relevé ne représente pas une carte graphique réelle.</p><table><tr><th>Mesure</th><th>Avant</th><th>Après</th></tr>${table}</table><p>${checks}/35 contrôles navigateur passent. Caméra, portes, architecture et cinq autres vitrines conservées. Aucun déploiement.</p><p><a href="VALIDATION.md">Rapport et limites</a> · <a href="downloaded-models.md">Téléchargements et licences</a> · <a href="navigation/browser-report.json">Tests navigateur</a> · <a href="navigation/mobile-vitrine.png">Mobile</a></p><small>Pilote soumis à validation visuelle ; aucune généralisation aux autres vitrines.</small></main><script>document.querySelector('input').addEventListener('input',e=>document.querySelector('.before').style.clipPath='inset(0 '+(100-e.target.value)+'% 0 0)')</script></html>`);
console.log('Review written',checks,'checks',glbBytes,'GLB bytes');
