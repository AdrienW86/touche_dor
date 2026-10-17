# Maison noire — provenance des ressources

## Finition des vitrines — notice active

Les trois nouvelles familles de boucles, leurs auteurs, licences CC BY 4.0, sources, modifications et empreintes sont publiés dans [la notice active](/assets/models/showcase-finish/ATTRIBUTION.html) et [le manifeste](/assets/models/showcase-finish/manifest.json). Les autres ressources de l’architecture sont réutilisées. Les anciennes boucles CatAlex3D et le collier de perles C.U.V restent archivés, sans chargement dans les compositions actuelles. Les cartes capitonnées sont réalisées dans le projet. Les sections suivantes documentent les phases précédentes.


Intégration locale, 17 octobre 2026. Aucun modèle nécessitant un compte ou une licence ambiguë n’a été récupéré.

## Nouvelles textures réellement intégrées

| Ressource | Source | Auteur / éditeur | Licence | Utilisation |
|---|---|---|---|---|
| Velour Velvet | https://polyhaven.com/a/velour_velvet | colormass (photographie), Rico Cilliers (traitement) / Poly Haven | CC0-1.0 | Supports d’étude, texture désaturée et teinte noire dans Three.js |
| Walnut Veneer | https://polyhaven.com/a/walnut_veneer | Jenelle van Heerden / Poly Haven | CC0-1.0 | Meubles des six vitrines, finition noyer sombre |
| Metal032 | https://ambientcg.com/view?id=Metal032 | ambientCG | CC0-1.0 | Microstructure et rugosité des portes, poignées, appliques et présentoirs |

Les huit cartes sont hébergées dans `materials/`, en WebP 512 px. Couleurs en sRGB, normales OpenGL et rugosité en données linéaires. Les cartes de données sont compressées sans perte. Total : 1 105 184 octets. Détails, liens de téléchargement et empreintes SHA-256 : `materials/manifest.json`. Les originaux téléchargés sont conservés dans `artifacts/finalization/` du projet.

La licence CC0 autorise l’usage commercial, la modification et la redistribution sans attribution obligatoire. Ces crédits sont volontaires. Textes et conditions officiels :

- https://polyhaven.com/license
- https://docs.ambientcg.com/license/
- https://creativecommons.org/publicdomain/zero/1.0/

## Ressources existantes conservées

Marbre Marble016, enduit Plaster001 (ambientCG, CC0), HDRI Studio Small 09 de Sergej Majboroda (Poly Haven, CC0) : crédits détaillés et texte CC0 dans `/prototype/assets/interior/CREDITS.md` et `/prototype/assets/interior/CC0-1.0.txt`. Ces fichiers restent à leur emplacement existant pour éviter de dupliquer les téléchargements et de casser les chemins.

## Marque

`branding/original-logo.png` est une copie du fichier `/logo.png` fourni par le propriétaire du projet. `branding/touche-dor.webp` est une conversion sans perte, 1536 × 1024, 499 968 octets. Le même fichier est affiché sur le mur 3D, dans la transition HTML, dans la section découverte et dans le footer. Aucun monogramme de substitution n’a été dessiné. Les droits de marque ne sont pas couverts par CC0.

## Code tiers

Les chargeurs et modules Three.js r128, dont le nouveau GLTFLoader, sont sous licence MIT. Conserver `/prototype/vendor/THREE-LICENSE.txt`. Le module d’éclairage LTC comporte une notice et une référence bibliographique supplémentaires, conservées dans `/prototype/vendor/LTC-LICENSE.txt` et `/prototype/vendor/README.md`.

## Modèles de présentation

**Version contemporaine du 17 octobre 2026 :** le meuble actif est désormais **GEM — Jewelry Display Case**, Innerscene, **CC0 1.0** ; l’applique pilote active est **Wall Light**, abd3d, identifiant `0d8f6d0a-a383-4476-bc1b-a8ae8ff22135`, **CC0 1.0**. Les bustes et colliers **muratgt / CC BY 4.0** sont conservés. [Sources, licences et adaptations de la version active](/assets/models/refinement/ATTRIBUTION.html), [manifeste](/assets/models/refinement/manifest.json). Les modèles classiques du premier essai ci-dessous restent des fichiers de secours non chargés. Les cinq autres vitrines et les autres appliques attendent validation avant toute généralisation.

La première vitrine et une applique intérieure utilisent désormais de vrais modèles téléchargés : **Large Display Case**, Mick Chambers, **CC BY 4.0** ; **Necklace With Display Stand**, muratgt, **CC BY 4.0** ; **Wall light**, abd3d, **CC0 1.0**. Sources, auteurs, liens de licence et modifications : [notice publique d’attribution](/assets/models/pilot/ATTRIBUTION.html), [manifeste](/assets/models/pilot/manifest.json). Les GLB Sketchfab proviennent de la redistribution publique Objaverse (Allen Institute for AI / Deitke et al.), avec vérification séparée des licences originales. L’attribution CC BY doit être conservée.

Le pilote reste soumis à validation visuelle : le meuble est plus classique que les références. Les cinq autres compositions restent des études de placement. La vitrine cheville réserve l’emplacement d’un véritable support anatomique ; aucun pied approximatif n’a été fabriqué. Recherche et candidats : `models/SELECTION.md`.


## Version architecturale active — 17 octobre 2026

Les six meubles contemporains d’origine sont restaurés. Les GLB décoratifs et les 16 appliques verticales réellement chargés sont inventoriés avec auteurs, licences commerciales, transformations et SHA-256 dans [la notice active](/assets/models/architecture/ATTRIBUTION.html) et [son manifeste](/assets/models/architecture/manifest.json). Cette notice remplace les indications d’état actif des essais pilote et refinement ci-dessus ; leurs sources restent archivées, sans chargement des commodes ou armoires. Noyer, velours, marbre, enduit, laiton et HDRI existants sont réutilisés, sans nouveau téléchargement de textures. Les bijoux ne représentent pas les produits réels du catalogue.

## Bibliothèque et polices locales
Three.js r128 (MIT), distribution originale cdnjs inchangée : /prototype/vendor/three.r128.min.js. Italiana et Jost : Google Fonts, mêmes familles et graisses ; fichiers WOFF2 latin et licences SIL OFL conservés dans /assets/fonts/.
