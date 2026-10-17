# Maison noire — raffinement contemporain

## Résultat proposé

Le meuble mouluré Large Display Case est remplacé par un autre modèle téléchargé : GEM, un comptoir de bijouterie contemporain à quatre tiroirs, pieds et prises métalliques fines. Il conserve sa construction et ses biseaux d’origine. Finition noyer sombre et laiton champagne, hauteur totale ramenée de 2,01 m à 1,41 m. Dimensions mesurées : 1,38 × 1,41 × 0,66 m (largeur × hauteur × profondeur). Centre conservé : −1,5 ; 0 ; 0,3. L’encombrement reste dans celui de la station initiale et dégage le passage central.

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

Les anciens modèles sont conservés intégralement en secours, sans chargement dans le chemin normal. Les trois GLB actifs totalisent 4 666 472 octets (4,45 Mio), contre 4,59 Mio auparavant. Textures plafonnées à 1024 px, corps du meuble regroupé par matériau, pièces invisibles retirées, aucun décodeur additionnel.

## Performances GPU réelles

Adaptateur confirmé : **NVIDIA GeForce RTX 3060, ANGLE Direct3D11**. Chromium headless, 1780 × 883, DPR 1, 180 images stabilisées avant et après à chaque point. Il ne s’agit pas de SwiftShader. Les gros plans sont capturés ensuite et ne participent pas aux mesures. Le défilement est placé aux mêmes arrêts par le contrôleur existant.

| Mesure | Avant | Après |
|---|---:|---:|
| Intervalle moyen entre images (ms) | 6,94 | 6,94 |
| P95 entre images (ms) | 7 | 7 |
| Soumission CPU du rendu au premier arrêt (ms) | 1,53 | 1,41 |
| Soumission CPU du rendu à l’entrée (ms) | 1,78 | 1,86 |
| Triangles soumis, reflet compris | 208 333,5 | 191 048,02 |
| Appels de dessin, reflet compris | 259,32 | 257,57 |
| Tampons géométriques CPU (octets) | 5 703 564 | 5 223 634 |
| Textures GPU | 52 | 51 |

La cadence observée est proche de 144 images/s dans ce contexte de test et limitée par la cadence de présentation ; ce n’est pas une estimation du débit maximal de la carte. Le temps de soumission CPU n’est pas une mesure de la durée d’exécution GPU. [Données avant](before-gpu-performance.json), [données après](after-gpu-performance.json), [détection GPU](gpu-probe.json).

## Validation technique

35/35 contrôles navigateur réussis sur ordinateur et mobile : portes et poignées, six arrêts et points intermédiaires de caméra, navigation des produits, fiche détail, catalogue, panier, logo, transition 3D / HTML, retour à l’entrée, défilement ordinaire et mouvement réduit, absence de débordement mobile. Aucune erreur console ou réseau. [Rapport](navigation/browser-report.json).

13 invariants historiques de caméra, de défilement et de portes passent. Dix fichiers protégés restent identiques par SHA-256 au début de cette tâche : façade, portes, matériaux architecturaux, lumières globales, code des autres vitrines, catalogue, panier, transition, sections et footer. Le seul module de production modifié est pilot-models.js. Le GLB des bustes et les anciens modèles de secours gardent leurs empreintes. Les relevés des lumières d’origine sont identiques ; seuls les deux spots locaux de la première station sont ajoutés. [Contrôles complémentaires](checks.json), [inspection du vitrage et des marges](after-gpu-review-data.json).

Pas de branche créée ni de déploiement. Pilotes arrêtés à cette version pour validation visuelle avant généralisation.
