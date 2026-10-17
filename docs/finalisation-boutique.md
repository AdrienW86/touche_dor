# Touche d'Or — reprise et finalisation locale

Date : 17 octobre 2026. Aucun commit, branche, push ou déploiement.

## 1. État initial constaté

Le projet Next.js 16.4.2 utilise une iframe vers public/prototype/maison-noire.html et Three.js r128. Un seul renderer est créé ; aucune double scène React/hydratation n’est à l’origine du flash. Le premier affichage antérieur à la correction rendait six groupes provisoires et des matériaux sans leurs textures/HDR. La première correction anti-flash était présente et fonctionnelle ; elle n’a pas été annulée.

Les cinq dossiers public/produits/ existaient, avec 23 JPG, mais le catalogue actif contenait encore six exemples à prix fictifs. Aucune fiche produit Next.js n’existait. Le panier était un panier de démonstration. Les fichiers non suivis de photos et la correction portable turbopack.root préexistants ont été conservés.

## 2. Nettoyage interrompu effectivement finalisé

Vérification des modifications réelles de showcases, interior-materials, interior-lighting, architecture-details et scene-assets. Helpers de bijoux provisoires devenus inutiles retirés. Supports définitifs bracelets/bagues conservés. Les rejets dérivés des promesses de matériaux sont observés pour éviter les erreurs non gérées ; l’erreur principale remonte au contrôle de préparation. Un échec critique ne dévoile jamais une scène de secours. Une erreur d’une ressource hors champ n’empêche pas l’entrée ; elle est traitée si cette vue devient nécessaire.

Syntaxe des scripts inline et fichiers publics contrôlée, diff sans espaces finaux et ESLint applicatif vérifiés. La distribution Three.js locale inchangée est seule ajoutée aux exclusions vendor du lint. Les huit avertissements des anciens scripts artifacts sont préexistants, non masqués.

## 3. Optimisations du chargement

- Séquence explicite : construction / ressources de la vue / préparation des textures / compilation des shaders / première image complète.
- Filtrage des vitrines nécessaires par frustum et profondeur du brouillard. Les compositions éloignées sont déclenchées après la première image, ou immédiatement si la caméra restaurée en a besoin. Le défilement et sa trajectoire sont conservés.
- Les modèles GLB sont chargés une fois par URL et réutilisés. Les images de textures partagées ont une promesse commune ; chaque texture conserve ses transformations UV propres.
- Suppression des deux anciennes générations CPU de textures immédiatement remplacées.
- Façade : génération de bruit/marbrure supprimée du runtime, remplacée par trois WebP lossless pixel-identiques, 993 718 octets. Égalité RGBA vérifiée. Générateur original conservé dans artifacts/loading/entrance-textures-source.js. Le profilage logiciel initial mesurait environ 1 731 ms dans createEntranceStone ; un export isolé sans la scène mesurait environ 340 ms.
- Three.js r128 et Italiana/Jost désormais locaux avec licences. Version, familles et graisses conservées. Les ressources d’entrée sont préchargées, Three.js est prioritaire face aux grosses images.
- HDR original conservé : 1 615 248 octets, version gzip 1 187 546 octets. Les octets décompressés sont identiques, y compris via HTTP ; aucun changement de résolution, d’éclairage ou d’exposition. L’en-tête Content-Encoding est configuré dans next.config.ts.
- Images du logo en mode crossOrigin cohérent entre HTML et Three.js pour partager la même requête.
- Plus de RAF de fond dans l’onglet masqué, la partie HTML ou à l’arrêt en reduced motion. Reprise sur scroll, resize et visibilité. Ressources et contexte WebGL libérés au départ définitif de la page, sans casser le bfcache.
- Aucun loader, délai artificiel, modèle temporaire ou changement de caméra ajouté.

## 4. Performances mesurées avant/après

Production locale npm run build / npm run start sur le port de test 3108. Chromium 1243 avec WebGL logiciel SwiftShader, viewport 1280 × 800 et reduced motion. Réseau ralenti : latence 80 ms, téléchargement 1 500 000 octets/s (12 Mbit/s). Une mesure par case, mêmes scénarios avant/après. Temps depuis la navigation du document 3D jusqu’à la première image définitive, pas le seul DOMContentLoaded. Ce ne sont pas des statistiques de terrain.

| Réseau | Cache | Avant | Après | Réduction |
|---|---|---:|---:|---:|
| Local sans limitation | Froid | 4.34 s | 2.62 s | 40 % |
| Local sans limitation | Chaud | 13.08 s | 9.54 s | 27 % |
| Réseau ralenti | Froid | 8.60 s | 7.51 s | 13 % |
| Réseau ralenti | Chaud | 14.23 s | 11.85 s | 17 % |

Les rechargements avec cache dans ce navigateur logiciel sont plus lents que les premières navigations : le transfert réseau chute, mais la recréation WebGL et le travail CPU/GPU restent coûteux. Cela est conservé dans les résultats, sans présenter le cache comme un succès de vitesse. Le chargement à froid est réduit d’environ 40 %. L’objectif < 2 s n’est pas validé de manière reproductible sur ce dispositif logiciel. D’autres essais fonctionnels isolés ont mesuré 1,69 à 2,21 s ; ils ne remplacent pas le benchmark comparatif.

Un profilage final instrumenté mesure les sept GLB utiles jusqu’au callback prêt en environ 184–195 ms une fois leurs chargements demandés, les ressources prêtes à 1 579 ms, la préparation/compilation à environ 466 ms et la première image à 2 094 ms. Les temps réseau, poids décodés et transferts de tous les scripts, textures, HDR, polices et GLB sont archivés dans loading-measurements.json. Le profilage instrumenté est distinct du benchmark. Pas de durée de compilation « avant » inventée : elle n’était pas instrumentée dans la première mesure.

Les originaux HDR, textures architecturales, GLB et JPG n’ont pas été dégradés pour atteindre un chiffre. Les trois cartes de façade sont sans perte. Les contrôles de réseau n’observent pas de téléchargement dupliqué des textures de matériaux ; le mode de requête logo a également été uniformisé après la mesure.

## 5. Identité commerciale

Navigation, textes de collection, iframe, titres, descriptions et Open Graph utilisent Touche d'Or. Les mentions publiques de catalogue/prototype/démonstration et anciens noms commerciaux sont retirées. Aucun Paris/Haute Joaillerie, adresse, délai, propriété hypoallergénique ou résultat commercial inventé. Le logo fourni et la palette de la boutique sont conservés. Les identifiants techniques Maison ne sont pas renommés.

## 6. Catalogue et photographies

Source unique : public/prototype/collection-config.json, consommée par le point d’entrée existant collection-config.js et par lib/catalogue.ts côté Next.js. Le catalogue de démonstration est archivé dans docs/catalogue-prototype-archive.json et n’est plus achetable. Le panier utilise une nouvelle clé versionnée, touche-dor-cart-v1 ; les anciennes données de démonstration ne sont pas effacées.

| Référence | Prix | Vitrine | Photographies |
|---|---:|---|---:|
| TD-COL-001 | 25 € | 01 | 4 |
| TD-COL-002 | 20 € | 01 | 4 |
| TD-COL-003 | 20 € | 01 | 4 |
| TD-SAU-001 | 25 € | 01 | 4 |
| TD-BRA-001 | 20 € | 02 | 7 |

Tous : acier inoxydable, doré, livraison gratuite, selon le brief. Chaque entrée contient identifiant, référence, slug, nom, catégorie/sous-catégorie, descriptions, galerie, matière, couleur, vitrine et statut. Aucun stock, longueur ou dimension fabriqué. Les galeries pointent exclusivement vers leur propre dossier, contrôle automatisé. Aucun fichier manquant parmi les 23 photos.

JPG conservés : 3 858 031 octets. WebP principaux dérivés : 2 538 754 octets, environ 34 % de moins, et miniatures séparées. Redimensionnement dans le ratio original, aucune découpe ni recoloration ni image générée. Le premier export WebP trop lourd a été remplacé avant validation. Dimensions réservées et images hors champ paresseuses.

## 7. Fiches produits

Cinq routes statiques : /produits/td-col-001, /produits/td-col-002, /produits/td-col-003, /produits/td-sau-001 et /produits/td-bra-001. Route dynamique à paramètres statiques ; slug inconnu → HTTP 404. Grande photo, miniatures, zoom natif dialog, navigation précédente/suivante dans le zoom, clavier/Escape/focus, descriptions, prix, matière, couleur, livraison gratuite et ajout au panier. Titres, descriptions et Open Graph spécifiques. Pas de note/avis/stock/Offre JSON-LD inventés. Le domaine commercial n’étant pas fourni, aucun canonical absolu fictif n’est ajouté.

## 8. Vitrines, panier et retour

Vitrine 01 : quatre références et compteur 1 / 4 à 4 / 4, photos correctes, fiche directe et ajout. Vitrine 02 : bracelet, 1 / 1, commandes précédent/suivant désactivées. Vitrines 03–06 : décors 3D inchangés, état d’attente et aucun faux article achetable.

Le même module public/prototype/cart.js alimente la visite et les fiches React. Ajouts, quantités, suppression, montant et persistance vérifiés. Un exemplaire de chaque produit totalise 110 €. Prix toujours relus dans le catalogue, aucun prix stocké depuis l’utilisateur. Anciennes références fictives et quantités invalides rejetées. Aucune donnée personnelle stockée.

Le retour /?reprendre=1 retrouve le scroll/caméra et les index produits via sessionStorage. Les formules de caméra, six arrêts, portes, couloir, géométries GLB, bijoux, matériaux définitifs, éclairages et transition logo sont conservés. L’archive du générateur permet de reproduire la façade à l’identique.

## 9. Tests exécutés

- npm run build : succès, cinq fiches statiques générées.
- TypeScript --noEmit : succès.
- npm run lint : zéro erreur, huit avertissements préexistants dans artifacts.
- node --test tests/catalogue.test.mjs : six tests réussis (références/prix, photos, vitrines, panier, cache des textures et intégrité HDR).
- Tests Chromium production : cinq pages et leurs photos, miniatures, zoom/Escape, panier à 110 €, quantités/suppression, persistance entre fiches et iframe, sélection restaurée et six vitrines ; succès à 375 et 1440 px, aucun pageerror ni asset HTTP cassé observé.
- Responsive produit 320/375/768/1024/1440 : pas d’overflow, zoom au clavier, Escape et retour de focus validés.
- Tests 3D : HDR bloqué → zéro rendu incomplet ; chaîne hors champ bloquée → entrée disponible ; reprise lors du scroll rapide ; six arrêts mobile/desktop ; arrêt derrière HTML et retour ; échec HDR → aucun rendu provisoire ni rejet non géré. Aucun pageerror dans le parcours normal. Les erreurs réseau simulées produisent le message d’indisponibilité prévu.
- HDR gzip servi HTTP 200, contenu décompressé identique au fichier original.

Les requêtes bloquées sont des tests locaux. Aucun paiement, envoi de commande, modification externe ou test non exécuté présenté comme réussi.

## 10. Points encore nécessaires

- Paiement et traitement effectif des commandes : non configurés, aucun faux paiement ajouté. Le panier fonctionne mais le site ne prend pas encore de commandes réelles.
- Informations vendeur, contact, CGV, confidentialité, modalités de retour, zones/délais de livraison et éventuel suivi de disponibilité : à fournir/valider. Pas de coordonnées ou conditions fabriquées, ni placeholders publics pour ces informations.
- Domaine public : à confirmer avant canonical absolu et métadonnées de partage avec URL complète.
- Objectif de chargement < 2 s : à mesurer sur matériel avec accélération graphique et sur le futur hébergement ; non déclaré acquis.
- Les JPG, le HDR source, les licences et les anciens exemples sont conservés. Pas de fichiers produit manquants.

## 11. Principaux fichiers

- app/layout.tsx, app/globals.css, app/produits/[slug]/page.tsx.
- components/MaisonNoire.tsx, ProductDetail.tsx et productDetail.module.css.
- lib/catalogue.ts ; catalogue partagé public/prototype/collection-config.json et son chargeur ; cart.js et cart.d.ts.
- Scripts 3D de préparation : maison-noire.html, scene-assets.js, showcases.js, pilot-models.js, entrance-textures.js, entrance.js, interior-materials.js, interior-lighting.js, architecture-details.js. experience.js ne change que le mode de requête des images, aucune formule de caméra/transition.
- storefront.js et storefront.css pour le commerce existant.
- Assets locaux : photos dérivées, textures de façade, HDR gzip, Three.js r128, polices/licences.
- next.config.ts : racine portable conservée, en-tête HDR gzip ; eslint.config.mjs : exclusion ciblée vendor ; tests/catalogue.test.mjs.
- Rapports et archive dans docs/, générateur d’origine dans artifacts/loading/.

Tout reste local, sans commit, push, branche ni déploiement.
