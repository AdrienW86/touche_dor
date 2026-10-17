# Maison noire — éclairage, ombres et reflets à valider

Version locale : http://localhost:3000, après rechargement.

## Captures

[Comparatif interactif avant / après](comparaison.html).

| Vue | Avant | Après |
| --- | --- | --- |
| Entrée fermée | [Capture](before-closed.png) | [Capture](final-closed.png) |
| Portes ouvertes | [Capture](before-open.png) | [Capture](final-open.png) |
| Dans le couloir | [Capture](before-first-vitrine.png) | [Capture](final-first-vitrine.png) |

[Capture mobile](final-mobile-closed.png). Les captures correspondent aux mêmes étapes de la navigation. L'orientation des bijoux peut varier puisque leur animation d'origine continue de tourner.

## Corrections

- Remplissage ambiant et éclairage mobile atténués ; reflets de l'environnement de studio moins blancs.
- Sources chaudes localisées dans le couloir, diffuseurs dans les appliques existantes, liserés lumineux au plafond et au pied des murs.
- Sources rectangulaires près des appliques extérieures pour un débordement doux sur le marbre.
- Deux cartes d'ombres pour les structures et socles fixes, avec réception sur le sol et les surfaces.
- Un véritable reflet plan de la scène sur le marbre : vitrines, bijoux et plafond sont calculés dans une cible de rendu hors écran, puis mélangés au matériau PBR avec un léger filtrage et une atténuation selon l'angle de vue.

Les matériaux et géométries des vitrines restent ceux de la version précédente. Leur apparence réagit naturellement aux nouvelles lumières. La caméra de visite, le scroll, les interpolations, les animations, les portes et l'interface restent identiques. La caméra virtuelle du réflecteur est indépendante et ne remplace jamais celle du parcours.

## Contrôles

[Rapport navigateur complet](final-report.json) et [comparaison des sources protégées](scope-report.json).

Les contrôles couvrent bureau/mobile, ressources réellement servies, six arrêts, panier, catalogue, ouverture/fermeture, défilement normal/réduit, programmes WebGL, cartes d'ombres et cible de réflexion. Un contrôle instrumenté confirme que chaque passe de réflexion laisse la position, l'orientation et la projection de la caméra de visite inchangées.

La comparaison intégrale des sources confirme que seules les initialisations d'éclairage et les modules associés ont été ajoutés au document d'origine. Les matériaux architecturaux, la construction des vitrines et les fonctions de navigation sont conservés.

Les 35 contrôles navigateur passent. Compilation Next.js/TypeScript et ESLint validés. Le favicon manquant est la seule 404 préexistante, consignée séparément dans le rapport.

## Coût et limites

Le reflet ajoute une passe de rendu de la scène : il a donc un coût GPU/CPU réel. Sa cible est limitée à 1024×512 sur bureau et 512×256 sur mobile, avec actualisation plafonnée à 20 Hz. Les deux cartes d'ombres sont limitées à 1024² et 512² et calculées pour les objets fixes ; elles ne sont pas recalculées à chaque frame. Les bijoux animés et les portes ne projettent pas d'ombres dynamiques.

Le rapport inclut les appels de rendu de la passe de réflexion dans les mesures. Les tests utilisent Chromium/SwiftShader ; les temps de frame logiciels ne représentent pas les performances d'un GPU matériel.

Les modules Three.js r128 restent sous MIT avec la notice conservée. Les tables LTC gardent leur notice et la référence bibliographique demandée : [provenance et licences](../../public/prototype/vendor/README.md).

Aucun nouveau modèle de vitrine, aucune modification de navigation, aucune branche et aucun déploiement. Cette passe s'arrête pour validation visuelle.
