# Maison noire — Touche d’Or

Projet Next.js indépendant. Démarrer avec `npm install`, puis `npm run dev` et ouvrir http://localhost:3000. Aucun déploiement n’est nécessaire pour la validation.

## Parcours et architecture

Façade → portes → six vitrines → approche et zoom du logo original → transfert HTML → dézoom → découverte, catégories, sélection, marque, informations pratiques et footer. Le parcours est réversible. « Toutes les pièces » ouvre directement le catalogue ; « Accéder aux collections » passe la visite sans imposer son animation.

`components/MaisonNoire.tsx` conserve l’iframe existante. La visite et les sections classiques partagent le même document et le même défilement natif, dans `public/prototype/maison-noire.html`. Aucun second moteur de scroll.

Les huit premières hauteurs de fenêtre correspondent à la longueur de défilement de l’ancien document de 900vh. Les six segments conservent les coordonnées X/Z, le champ de vision, la visée, la double interpolation smoothstep et le lissage `.06`. Les pivots et la rotation des portes restent identiques ; seules leurs poignées se déplacent vers la jonction centrale. En préférence de mouvement réduit, le lissage temporel et l’oscillation verticale décorative sont désactivés.

## Fichiers à renseigner

- `public/prototype/collection-config.js` : catégories, produits associés, slots GLB, éclairage ; liens de contact, légaux et sociaux.
- `public/prototype/showcases.js` : études remplaçables, matériaux PBR et chargeur GLB. Les présentoirs professionnels définitifs restent à sélectionner ; la vitrine cheville conserve son emplacement anatomique vide.
- `public/prototype/storefront.js` et `storefront.css` : catalogue, fiches, panier de démonstration, sections classiques et footer.
- `public/prototype/experience.js` : prolongement après le sixième arrêt ; projection du logo et correspondance avec son image HTML. Phases accessibles via `document.documentElement.dataset.phase` et `window.maisonExperienceState`.

## Catalogue et vente

Les six produits et prix proviennent du prototype. Ce sont des **exemples de démonstration**, sans photo ni disponibilité commerciale vérifiée. Aucun produit, stock ou tarif réel n’a été ajouté. La cinquième catégorie ne contient aucun exemple.

Le panier conserve ses quantités dans le stockage local. Les dialogues natifs des fiches préservent le scroll et la sélection ; Escape et les boutons de retour les ferment. La commande est désactivée ; aucune API de paiement ni de commande n’existe.

Avant toute vente, brancher le catalogue, les photos, les disponibilités et le panier/checkout du service commercial retenu, puis renseigner les informations légales confirmées. Changer la valeur de `mode` ne constitue pas une intégration commerciale. Les objets 3D sont décoratifs, pas des références produit.

## Ressources et marque

Logo original : `public/logo.png`. Une copie WebP sans perte est partagée entre Three.js et HTML. Aucun monogramme redessiné.

Les huit nouvelles cartes PBR de velours, noyer et métal sont réellement intégrées et hébergées localement, sous CC0. Les ressources architecturales et le HDRI existants conservent leurs chemins.

Provenance et licences : `public/assets/CREDITS.md`. Modèles recherchés et besoins manquants : `public/assets/models/SELECTION.md`. Les notices MIT et LTC accompagnent les modules Three.js. Google Fonts et le moteur Three.js depuis CDN nécessitent encore une connexion Internet.

## Vérification

- `npm run lint`
- `npm run build`
- `node artifacts/finalization/verify-browser.mjs` : Chromium local piloté via CDP, captures et rapport dans `artifacts/finalization/`. Le script ferme seulement son navigateur de test.
- `node artifacts/finalization/build-gallery.mjs` : galerie des captures après la vérification.

Les tests utilisent SwiftShader : ils vérifient le parcours et les shaders, pas la fluidité sur un téléphone physique. Le rendu 3D s’arrête après sa disparition et reprend au retour. Les ombres et la réflexion de sol existantes sont conservées.

Galerie et rapport : `artifacts/finalization/index.html` et `artifacts/finalization/VALIDATION.md`. Les captures « avant » sont conservées depuis l’étape précédente dans `artifacts/lighting/`. Aucun déploiement ni branche Git créé.
