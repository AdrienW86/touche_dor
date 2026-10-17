# Maison noire — validation architecturale

Version locale du 17 octobre 2026. Aucun déploiement ni branche créée. Serveur existant conservé.

## Résultat et captures réelles

[Planche interactive avant/après et galerie](review.html). Captures Chromium du projet Next.js réel, sur la trajectoire native, sans caméra dédiée ni image générée. Les vues détaillées utilisent DPR navigateur 2 (le plafond de rendu de la scène reste 1,75). Les mesures utilisent DPR 1.

- [Vue générale](after-gpu-overview.png)
- [Trois bustes et colliers](after-gpu-necklaces.png)
- [Bracelets](after-gpu-bracelets.png)
- [Mur rapproché](after-gpu-walls-close.png)
- [Applique rapprochée](after-gpu-sconce-close.png)
- [Mur du fond](after-gpu-back-wall.png)
- [Montage pilote validé avant généralisation](mount-pilot-validated.png)

## Modifications

Noyer PBR existant avec rainures principales géométriques et parties lisses. Géométrie fusionnée par matériau, sans milliers de draw calls. Soubassements et niches en vrai marbre PBR, albédo étalonné vers noir/or, joints et profils fins. Colonnes pierre/enduit PBR avec arêtes et bandes champagne, sans déplacement ni réduction de leur section.

Applique abd3d inspectée dans Blender : axe Y, face avant +Z, décalage réel du dos 0,0170774 et centre réel de la rosace mesurés avant montage. Rotation gauche +π/2, droite −π/2 ; rosace centrée à y=2,5 m, garde mesurée 0,99988 mm sur les deux côtés. Première fixation contrôlée visuellement, puis même modèle sur les 16 ancrages. Les 30 anciennes plaques/diffuseurs sont masqués. Instanciation : quatre objets de dessin pour toute la famille.

Six meubles rectangulaires d’origine restaurés et enveloppes conservées : 1,38 × 2,01 × 1,18 m. Tablettes marbre, cinq panneaux vitrés par meuble, montants 9 mm, LED arrière et tapis textile. GLB de bijoux réellement chargés dans six compositions ; rouleaux et plots d’origine conservés et raffinés, sans prétendre être des modèles professionnels téléchargés. Sources et limites : [sélection publique](../../public/assets/models/SELECTION.md).

Éclairage existant conservé ; seulement trois sources surfaciques chaudes de faible intensité ajoutées sous des traverses existantes. Réflexion plane adoucie et intensité HDRI des matériaux contrôlée. Grain inchangé.

## Comparaison honnête avec l’image jointe

L’image jointe dans la conversation reste la référence principale. Elle n’est pas disponible comme bitmap dans le dossier de pièces jointes : aucune fausse copie ou image de référence générée n’est fournie. La comparaison ci-dessous est visuelle et qualitative, pas une comparaison pixel à pixel. La planche fournit un véritable avant/après du projet à cadrage égal.

| Élément | Rapprochement obtenu | Écart encore visible |
|---|---|---|
| Murs | Alternance noyer lisse/rainuré, marbre noir et profils champagne | Rainures réelles conservées dans l’enveloppe des murs ; niches plus plates et sans objets décoratifs que sur l’image |
| Colonnes | Pierre/enduit chaud et raccords métalliques fins | Géométrie principale inchangée ; raccords simples et éclairage moins riche que la photographie |
| Appliques | Une famille cohérente de diffuseurs opalins et laiton | Modèle abd3d demandé : rosace ronde et longue tige, différent du modèle exact de la référence ; fixation réelle corrigée |
| Vitrines | Socles contemporains d’origine, bois sombre, marbre, verre et LED | Trois bustes et compositions distinctes ; supports bracelets/bagues existants conservés, pas des GLB professionnels complets |
| Bijoux | Véritables mailles, sertissages, tresses, créoles et perles | Bustes encore anguleux ; mêmes modèles répétés, diversité et finesse inférieures à la référence |
| Sol et ambiance | Marbre noir aux veines chaudes, reflets modérés et lumière chaude | Marble016 plus fin et fragmenté que le Portoro de la référence ; fond du couloir plus sombre, éclairage moins enveloppant |
| Fond et logo | Logo original conservé et marbre noir | Points spéculaires encore trop marqués autour du logo ; mobilier de salon existant non raffiné |

Cette version constitue une proposition de validation, pas une reproduction photoréaliste équivalente à la référence.

## Tests

35 contrôles navigateur dans [navigation/browser-report.json](navigation/browser-report.json) : six arrêts et interpolations intermédiaires, portes et poignées, aller/retour au scroll, sélection précédent/suivant, fiches produits, panier et quantité, catalogue et catégorie vide, approche/zoom/logo/transition HTML, reprise et suspension du rendu, footer, molette et passage rapide, reduced-motion, mobile 390 × 844 sans débordement et console sans erreurs. Les tests antérieurs sont conservés.

13 invariants de caméra, scroll et portes : [scope-report.json](scope-report.json). 17 vérifications supplémentaires : [protected-scope.json](protected-scope.json), dont identité des sept fichiers protégés, seules deux lignes de raccordement dans le HTML, seules transparences de réflexion ajustées dans interior-lighting.js, dimensions des murs/colonnes/meubles, six ancrages, montage effectif des luminaires et absence d’erreur de chargement.

## GPU matériel — avant/après

ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 (0x00002503) Direct3D11 vs_5_0 ps_5_0, D3D11). Chromium headless, 1780 × 883, DPR 1, 180 frames stabilisées par point, même trajectoire et même matériel. FPS calculés comme 1000 / durée moyenne entre frames. Le temps de soumission CPU de render() n’est pas une durée GPU. La cadence peut être limitée par la synchronisation ; ces résultats ne prédisent pas un téléphone réel.

| Point | FPS avant → après | Frame moyenne ms | P95 ms | Soumission CPU ms | Draw calls moyens | Triangles moyens |
|---|---|---|---|---|---|---|
| Entrée | 144.0 → 102.0 | 6.95 → 9.80 | 7.00 → 14.00 | 1.69 → 1.94 | 300 → 467 | 212 125 → 856 632 |
| Première vitrine | 144.0 → 142.4 | 6.94 → 7.02 | 7.00 → 7.00 | 1.48 → 1.65 | 258 → 413 | 191 048 → 806 470 |

Les nouveaux détails augmentent le coût : baisse mesurée à l’entrée, première vitrine proche de 142 FPS sur cette machine. Résultat à surveiller sur GPU mobile ; le test mobile porte sur navigation et composition, sans mesure sur téléphone physique. Géométrie en mémoire : 5.22 → 11.74 Mo. Textures : 51 → 52. [Mesures avant](before-gpu-performance.json), [après](after-gpu-performance.json).

## Ressources et licences

[Notice publique complète](../../public/assets/models/architecture/ATTRIBUTION.html), [manifeste SHA-256](../../public/assets/models/architecture/manifest.json). Les nouvelles ressources téléchargées sont ring, earrings, bracelet et jewel-stand ; bust, chain, pearls, sconce et toutes les textures proviennent des téléchargements précédents réutilisés. Le scan Anklet Collection téléchargé a été rejeté, non intégré.

- Three stone diamond ring. — chrissimpson — CC-BY-4.0 — 332 176 octets — https://sketchfab.com/3d-models/three-stone-diamond-ring-da834e60c21b4b339024d3a1082bb225
- Golden earrings — CatAlex3D — CC-BY-4.0 — 441 536 octets — https://sketchfab.com/3d-models/golden-earrings-ea7a893a9bb04f9ea50cf51f584f1470
- Gold Bracelet — Emilio.Gallo — CC-BY-4.0 — 1 210 128 octets — https://sketchfab.com/3d-models/gold-bracelet-25af58a330ba4e31b78514ad924a8932
- Gold necklace / chain — Mckai — CC-BY-4.0 — 2 572 340 octets — https://sketchfab.com/3d-models/gold-necklace-chain-8bb2ebea4fbd4a3a9b21cba9f5d5fdc8
- Pearl Necklace — C.U.V — CC-BY-4.0 — 2 177 440 octets — https://sketchfab.com/3d-models/pearl-necklace-badddc19523f4dc08344e8da5b143dae
- Necklace With Display Stand — muratgt — CC-BY-4.0 — 1 721 436 octets — https://sketchfab.com/3d-models/7279cac4115a40e6ac345d68e17f15d1
- Jewel Stand – Personal Organizer — Innerscene — CC0-1.0 — 194 728 octets — https://www.innerscene.com/tools/library/3d-parts/jewel-stand-personal-organizer-e8371f54
- Wall light / contemporary vertical fixture — abd3d — CC0-1.0 — 334 240 octets — https://www.blendkit.com/asset-gallery-detail/0d8f6d0a-a383-4476-bc1b-a8ae8ff22135/

Attribution CC BY publiée avec source, auteur, licence et modifications. Sources originales et métadonnées conservées ; archive Objaverse créditée sans substitution aux licences individuelles. Les anciennes commodes et armoires sont des sauvegardes non chargées. Aucun achat.
