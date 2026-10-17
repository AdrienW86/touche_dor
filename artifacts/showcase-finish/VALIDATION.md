# Maison noire — finition des vitrines et scintillement

Version locale proposée pour validation visuelle, 17 octobre 2026. [Planche interactive, six gros plans et vidéos](review.html). Aucun achat, branche ou déploiement ; serveur existant conservé.

## Périmètre

Seuls public/prototype/showcases.js et pilot-models.js ont changé dans le rendu. Les dix fichiers protégés, dont le HTML complet (texte d’accueil compris), l’architecture, tous les éclairages, les portes, la navigation, le logo, la transition, le catalogue, le panier et le footer, restent identiques octet pour octet. Le corps de la fonction d’installation des appliques est également identique. [Contrôle de périmètre](scope-report.json).

Dimensions et positions des six meubles conservées, verre conservé, matériaux du bois et du marbre conservés. La seule adaptation de finition du meuble concerne les profils champagne responsables de l’instabilité : même couleur/métal, rugosité stabilisée. Aucun éclaircissement général, aucun changement de résolution ou ajout de post-traitement.

## Diagnostic dynamique des bordures

Le contexte réel utilise déjà MSAA 4 échantillons (antialias=true), DPR 1 pour les essais de mouvement. Cinq variantes ont été enregistrées avant modification sur le même passage natif du scroll, progression 1,12 → 1,67 en cinq secondes : original, matériau satiné, verre masqué, polygonOffset et DPR 1,75. Les vidéos originales et planches de frames restent dans ce dossier.

L’essai satiné supprime le point spéculaire concentré qui court le long des profils ; masquer le verre ou décaler la profondeur ne produit pas la même amélioration. Diagnostic principal : aliasing spéculaire sur petites faces biseautées, aggravé par une roughness effective trop faible (la carte multipliait la valeur 0,3). Diagnostic secondaire géométrique : faces coplanaires chevauchées aux quatre jonctions de la couronne, capables d’instabilité locale aux angles. L’aliasing de couverture des profils sous-pixel demeure possible à grande distance, même avec MSAA ; il ne faut pas confondre ce résidu discret avec le balayage lumineux initial.

Correction ciblée : profils conservés, même teinte champagne, roughness 0,56 et réflexion d’environnement modérée, sans carte de normales/roughness à cette échelle. Couronne avec joints bout à bout et poteaux terminés sous la couronne ; plus de recouvrement coplanaire aux jonctions. Verre, luminosité générale, antialiasing et plafond DPR de l’application inchangés. Coût : aucun passage de rendu ajouté. La vidéo après permet de vérifier le résultat pendant le déplacement ; la conclusion visuelle porte sur ce parcours testé, sans garantie universelle de zéro aliasing à toute distance/résolution.

## Compositions et contrôle visuel

- Colliers : trois bustes de tailles différentes, central plus grand et en retrait. Chaînes intégrées aux bustes GLB, pas de collier déplacé ou ajouté hors du modèle.
- Bracelets : huit bracelets tressés espacés sur deux rouleaux, niveau bas devant et haut derrière ; orientation vers le visiteur. Le diamètre du velours et la suspension des bracelets ont été réaccordés.
- Bagues : cinq plots, bague centrale plus grande, hauteurs variées et inclinaison vers l’arrêt réel ; base des bagues à 1 mm du dessus des plots.
- Boucles : trois paires / six éléments, trois familles téléchargées. Les créoles source étaient vues de chant : leur géométrie a été analysée, une créole complète extraite et réorientée, puis dupliquée. Deux pendantes au centre avec boule métallique/cristal distincts, et deux puces serties. Trois cartes anthracite capitonnées, avec trous de fixation, de hauteurs différentes ; supports discrets et paires séparées, orientées selon l’arrêt natif.
- Chevilles : deux chaînes fines et délicates, attachées par leurs sommets réels aux traverses du support existant. Suppression de la chaîne secondaire qui paraissait dressée/flottante sur le coussin et des rails inutiles ; composition verticale différente des bracelets.
- Ensembles : buste recentré, bracelet et bague sur leurs supports, deux puces sur carte secondaire ; orientation du buste corrigée du côté droit.

Les six compositions ont été revues depuis leurs véritables caméras, pas depuis une caméra de présentation ajoutée. Les gros plans sont des recadrages de captures à DPR navigateur 2, rendu interne plafonné à 1,75 comme avant. Les deux étapes avant/après utilisent les modules sauvegardés et les mêmes arrêts.

Limites visuelles restantes : bustes encore anguleux, mêmes dessins de colliers/bracelets/bagues répétés, chaînes de chevilles très fines et moins immédiatement lisibles que les boucles. Les modèles sont décoratifs ; leur mise à l’échelle favorise la lisibilité dans le parcours et ne décrit pas des produits réels ou des dimensions de catalogue. Les nouvelles cartes sont des supports conçus dans le projet, pas une ressource professionnelle téléchargée présentée à tort comme telle.

## Tests fonctionnels

35 contrôles existants réussis : six catégories, six arrêts et trajectoires intermédiaires, portes et poignées, verre transparent et absence de végétation, sélection précédent/suivant, fiche produit, panier et quantité, catalogue et catégorie vide, approche/zoom/logo/transition, suspension du rendu, navigation inverse, molette et accès direct, reduced-motion, mobile 390 × 844 sans débordement, footer et console propre. [Rapport navigateur](navigation/browser-report.json). Tests antérieurs conservés.

19 contrôles de périmètre et de composition réussis ; trois paires structurées en deux éléments distincts chacune, deux points d’accroche de chaînes, enveloppes et caméras identiques à l’avant.

## Performances RTX 3060

ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 (0x00002503) Direct3D11 vs_5_0 ps_5_0, D3D11). Chromium headless, 1780 × 883, DPR 1, 180 frames stabilisées par point. FPS = 1000 / durée moyenne des frames. Temps CPU de render() différent d’une durée GPU ; cadence parfois plafonnée vers 144 Hz. Aucun téléphone physique mesuré.

Comparaison A/B/A dans le même navigateur, trois secondes de stabilisation, mêmes assets d’architecture : entrée **117.3 FPS avant → 117.5 FPS après** ; première vitrine environ **144 FPS avant et après**. [Série appariée](paired-performance.json). Mesure finale isolée : entrée 115.7 FPS ; les six stations ci-dessous :

| Station | FPS avant | FPS après | P95 après (ms) | Draw calls avant → après |
|---|---|---|---|---|
| 1 | 144.0 | 144.0 | 7.00 | 413 → 342 |
| 2 | 144.0 | 144.0 | 7.00 | 358 → 298 |
| 3 | 144.0 | 144.0 | 7.00 | 307 → 261 |
| 4 | 144.0 | 144.0 | 7.00 | 247 → 219 |
| 5 | 144.0 | 144.0 | 7.00 | 184 → 163 |
| 6 | 144.0 | 144.0 | 7.00 | 120 → 103 |

L’entrée avait atteint 144 FPS dans la mesure initiale isolée ; la comparaison appariée a aussi mesuré l’ancien état à environ 117 FPS. Les essais intermédiaires ont mesuré des cadences inférieures et sont conservés (first-iteration-performance.json, lod-iteration-performance.json, instancing-iteration-performance.json). Le rapport final ne les efface pas et ne présente pas ces variations comme un gain GPU garanti.

Optimisations : LOD conservant crochets, pavés et sertissages ; aucune texture lourde supplémentaire ; partage des buffers et instanciation des bijoux répétés, avec volumes de culling adaptés à Three r128. Première station : environ 413 → 342 appels ; textures 52 → 47. Estimation des buffers de géométrie uniques : 11,74 → 13.60 Mo, en excluant le double comptage des attributs partagés. Les nouveaux GLB totalisent 1.66 Mo. [Mesure initiale](before-gpu-performance.json), [mesure finale](after-gpu-performance.json). La correction ultime de jonction (0,5 mm) et le masquage de deux rails inutiles n’ajoutent ni géométrie ni passage de rendu à cette mesure.

## Ressources nouvelles réellement téléchargées

- [Earring diamond](https://sketchfab.com/3d-models/earring-diamond-94db5e5434d14a9f87bbf3e5a5fd7dce) — Softmind Game Factory — CC BY 4.0 — 316 408 octets, 5 646 triangles.
- [Golden Ball Crystal Diamond Drop Earrings](https://sketchfab.com/3d-models/golden-ball-crystal-diamond-drop-earrings-863d3b5c1a714cfb88dc01c7ea0fbcfe) — DineshThennarasan — CC BY 4.0 — 970 576 octets, 13 124 triangles.
- [diamond crossover hoop earrings](https://sketchfab.com/3d-models/diamond-crossover-hoop-earrings-7a9e9fee80ac4c6d803680a4c62ce852) — Syahdat setiawan — CC BY 4.0 — 377 672 octets, 12 800 triangles.

[Notice publique](../../public/assets/models/showcase-finish/ATTRIBUTION.html), [manifeste avec SHA-256 et URL de téléchargement](../../public/assets/models/showcase-finish/manifest.json). Les originaux, métadonnées de licence, aperçus, inspection et script de conversion sont conservés. Attribution requise publiée avec auteurs, liens de source et de licence, modifications et crédit de l’archive Objaverse. Les autres ressources déjà licenciées sont réutilisées. Aucun téléchargement manuel ni achat demandé.
