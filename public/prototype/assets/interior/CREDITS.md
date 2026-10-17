# Maison noire — ressources architecturales

Ressources téléchargées le 17 octobre 2026. Cette passe concerne seulement les matériaux du sol, des murs, des pilastres et du plafond. Aucun modèle de bijou ou de vitrine n'est ajouté.

| Ressource | Source officielle | Auteur / éditeur | Licence | Attribution obligatoire |
| --- | --- | --- | --- | --- |
| Marble016 | https://ambientcg.com/a/Marble016 | ambientCG | CC0 1.0 Universal | Non |
| Plaster001 | https://ambientcg.com/a/Plaster001 | ambientCG | CC0 1.0 Universal | Non |
| Studio Small 09 | https://polyhaven.com/a/studio_small_09 | Sergej Majboroda / Poly Haven | CC0 1.0 Universal | Non |

Les actifs ambientCG retenus sont des matériaux PBR procéduraux, pas des scans photographiques. Le HDRI Poly Haven est une capture d'éclairage de studio.

## Usage et redistribution

Les licences officielles permettent l'utilisation commerciale, la modification et la redistribution des actifs :

- https://docs.ambientcg.com/license/
- https://polyhaven.com/license
- https://creativecommons.org/publicdomain/zero/1.0/

Le texte CC0 complet est conservé dans `CC0-1.0.txt`. Les crédits ci-dessus sont volontaires. Aucune connexion ni aucun achat n'a été nécessaire. Les fichiers sont servis localement ; le navigateur ne contacte ni ambientCG ni Poly Haven.

## Téléchargements et transformations

- https://ambientcg.com/get?file=Marble016_2K-JPG.zip
- https://ambientcg.com/get?file=Plaster001_1K-JPG.zip
- https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_09_1k.hdr

Marbre : couleur 2048px WebP qualité 93 ; normales OpenGL et rugosité 1024px WebP sans perte. Enduit : couleur 1024px WebP qualité 93 ; normales OpenGL 512px et rugosité 1024px WebP sans perte. Les cartes de données utilisent un encodage linéaire, les cartes de couleur sRGB. Les teintes et l'intensité des reflets sont réglées dans les matériaux ; les fichiers source ne sont pas recolorés.

Le HDRI 1K est conservé sans transformation puis préfiltré une seule fois par PMREM au chargement. Il est affecté uniquement aux nouveaux matériaux architecturaux, sans remplacer `scene.environment`.

Archives originales, captures des pages de licence, tailles et empreintes SHA-256 : `artifacts/interior-materials/` à la racine du projet. Aucun fichier Blender, EXR, déplacement, NormalDX ou texture 8K n'est livré au navigateur.

## Chargeur Three.js

Le chargeur RGBELoader r128 est distribué sous licence MIT avec sa notice dans `../../vendor/THREE-LICENSE.txt`.

- Source : https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/RGBELoader.js
- Licence : https://github.com/mrdoob/three.js/blob/r128/LICENSE

La notice MIT doit accompagner la redistribution du chargeur. Il ne s'agit pas d'une obligation d'attribution pour les actifs CC0.
