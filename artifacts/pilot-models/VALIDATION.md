# Maison noire — pilote de modèles téléchargés

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

Les trois GLB autonomes totalisent **4 812 460 octets (4,6 Mio)**. Sans décodeur externe. Les clones partagent géométries et textures. Les textures du meuble sont plafonnées à 1024 px ; les petites facettes invisibles et les subdivisions excessives ont été réduites. Les cinq autres vitrines restent inchangées.

## Mesures avant / après

Chromium headless, **SwiftShader logiciel**, 1780 × 883, densité 1, même premier arrêt et même contrôleur. 22 images stabilisées par relevé, cache désactivé. Reflet plan inclus. Ces durées ne sont pas un benchmark de carte graphique réelle ; aucun objectif de FPS matériel n’est affirmé. Les gros plans ×2 sont réalisés après les mesures.

| Mesure au premier arrêt | Avant | Après |
|---|---:|---:|
| Temps moyen entre images (ms) | 565 | 734,2 |
| Temps CPU de soumission du rendu (ms) | 4,6 | 4,8 |
| Appels de dessin, reflet inclus | 418 | 415,9 |
| Triangles soumis, reflet inclus | 82 822 | 240 662 |
| Tampons géométriques CPU de la scène (octets) | 2 911 632 | 5 703 564 |
| Textures GPU | 48 | 52 |

Le coût de géométrie augmente avec les modèles détaillés ; la fluidité sur une vraie carte graphique reste à vérifier. Les durées CPU de soumission et les intervalles entre images mesurent des choses différentes. Le compteur réseau brut après inclut le rechargement pour les captures DPR 2 : il n’est donc pas comparé au relevé réseau avant. Le poids additionnel mesurable des GLB est celui indiqué plus haut. Les données brutes sont dans [before-performance.json](before-performance.json) et [after-performance.json](after-performance.json).

## Vérifications

35/35 contrôles navigateur passent : portes fermées / ouvertes, vitrage transparent, absence de végétation, six catégories et arrêts, points intermédiaires de caméra, produits précédent / suivant, fiche détail, ajout et quantité du panier, catalogue et catégories, logo, transition HTML, arrêt du rendu 3D, retour à l’entrée, défilement normal et mouvement réduit, affichage mobile sans débordement horizontal. 0 erreur console, 0 erreur réseau. [Rapport détaillé](navigation/browser-report.json).

13 invariants historiques de caméra, de défilement et de portes passent. Les 10 empreintes des sources protégées correspondent au relevé avant, en ne retranchant que les trois lignes explicites de raccordement du pilote : script, appel pour i=0, rafraîchissement unique des ombres existantes. [Vérification SHA-256](protected-source-report.json). Le code des cinq autres vitrines, l’architecture, le logo, la transition, le catalogue et le panier sont conservés.

Aucune branche Git créée, aucun déploiement. Arrêt à ce pilote pour validation visuelle.
