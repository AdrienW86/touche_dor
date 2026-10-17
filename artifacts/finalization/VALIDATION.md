# Maison noire — validation du parcours continu

Intervention locale du 17 octobre 2026. Aucun déploiement ni branche Git créé. Le serveur de développement existant est conservé.

## Résultat livré

- Poignées déplacées près de la jonction centrale : centres à X = −0,17 et +0,17 porte fermée, hauteur identique. Fixations et poignées restent des enfants des deux vantaux. Pivots `(±1,15 ; 0 ; 8,1)`, géométrie des portes et ouverture `±1,45 rad` conservés.
- Verre transparent, visibilité sur le couloir et absence de végétation vérifiées. Les nouveaux détails PBR du métal utilisent les cartes téléchargées Metal032.
- Six catégories centralisées, dans l’ordre demandé. Positions des vitrines et arrêts de caméra conservés. Les compositions sont des études distinctes et remplaçables, **pas des modèles professionnels définitifs validés**. Le support anatomique de cheville reste à sélectionner et son emplacement reste vide.
- Même catalogue de six exemples qu’au départ : aucune photo, disponibilité, référence ou tarification réelle inventée. Navigation précédent/suivant, fiches détaillées, retour conservant la position et la sélection, panier persistant avec quantités. Catalogue accessible directement. Commande explicitement désactivée.
- Logo original `/logo.png`, conservé et converti en WebP sans perte. Un seul dessin pour le mur Three.js, le transfert HTML, la découverte et le footer. La boîte projetée du plan 3D détermine directement celle de l’image HTML au transfert. Aucun monogramme approximatif.
- Défilement continu, réversible, puis sections HTML natives. Arrêt du rendu de la scène après disparition, reprise en revenant vers la boutique. Préférence de mouvement réduit prise en compte et raccourci permettant de passer immédiatement la 3D.
- Découverte, six catégories, sélection de démonstration, présentation de l’identité, informations pratiques à compléter et footer responsive. Aucune promesse juridique ou commerciale inventée ; aucun réseau social fictif.

## Navigation et non-régression

Un seul défilement natif dans le document de l’iframe. Les huit premières hauteurs de fenêtre conservent la distance de défilement de l’ancien document de 900vh ; l’ajout du site classique ne renormalise pas les six segments existants.

| Progression, en hauteurs de fenêtre | Phase |
|---|---|
| 0 → 8 | Entrée et six arrêts existants |
| 8 → 9,5 | Approche du mur de marque |
| 9,5 → 10,5 | Zoom contrôlé |
| 10,5 → 11 | Transfert de la même image vers HTML |
| 11 → 12 | Dézoom et révélation de la première section |
| Dès 12 | Défilement classique ; rendu 3D suspendu |

Les six arrêts restent à Z = `3,5 ; −3 ; −9 ; −15 ; −21 ; −27`, X alternant `−0,8 / +0,8` sur ordinateur et `−1,3 / +1,3` sur mobile. Six points intermédiaires sont comparés au calcul original : double smoothstep, visée, ouverture et coefficient `.06` conservés. Les petites différences de position enregistrées aux points intermédiaires proviennent de l’arrondi du scroll en pixels ; les tolérances sont explicites dans le script.

En mouvement réduit, l’oscillation verticale décorative de 1 cm est désactivée, ainsi que le lissage temporel. Les coordonnées et les six segments de parcours restent les mêmes. Les seuls mouvements de caméra supplémentaires commencent après le sixième arrêt.

## Tests effectués

`verify-browser.mjs` lance réellement Chromium, pilote souris/molette et dialogues via CDP, charge la page Next.js et son iframe, inspecte la scène et produit les captures. Le résultat de référence est `browser-report.json` : **35 contrôles réussis**, sans erreur JavaScript ni ressource manquante dans la dernière exécution.

Contrôles : poignées centrales, pivots, portes fermées/entrouvertes/ouvertes, verre, absence de végétation, six catégories et six arrêts, calcul des positions intermédiaires, produits précédent/suivant, fiche détaillée, retour conservant scroll et sélection, ajout au panier et quantités persistées, commande désactivée, six exemples du catalogue, catégorie vide explicite, logo partagé et alignement, approche/zoom/transfert/dézoom, sections classiques, suspension GPU, catégories classiques, footer sans faux liens, retour jusqu’à l’entrée, molette en mouvement normal, accès direct au site classique, mobile sans débordement horizontal et grain discret.

Résolution ordinateur : 1780 × 883. Mobile émulé : 390 × 844. Les captures sont réalisées avec préférence de mouvement réduit pour des positions reproductibles ; la molette et le raccourci sont également testés avec mouvement normal. Les captures de retour documentent la réversibilité.

- `npm run lint` : réussi.
- `npm run build` : réussi ; trois routes statiques générées. Avertissement Next.js préexistant concernant le fichier `package-lock.json` situé dans le dossier personnel ; aucune modification de configuration hors périmètre.
- Rendu logiciel SwiftShader utilisé pour les tests : aucune promesse de fréquence d’images matérielle ni de validation sur téléphone physique. Le compteur de rendus reste constant lorsque la 3D est masquée.

La galerie `index.html` rassemble les étapes et les vues mobiles. Les captures « avant » sont celles conservées lors de l’étape d’éclairage précédente, pas des captures nouvellement prises d’une ancienne version.

## Ressources intégrées et droits

Huit nouvelles cartes PBR, 1 105 184 octets : velours Poly Haven Velour Velvet, noyer Poly Haven Walnut Veneer, métal ambientCG Metal032. WebP 512 px, données normales/rugosité sans perte. Logo original converti en WebP sans perte : 499 968 octets. Manifestes et SHA-256 conservés.

Sources, auteurs, licences, transformations et liens : `../../public/assets/CREDITS.md`. Tous les nouveaux matériaux tiers intégrés sont CC0 ; les modules Three.js restent sous MIT avec leurs notices. Le logo fourni n’est pas placé sous CC0.

Recherche des présentoirs et candidats non intégrés : `../../public/assets/models/SELECTION.md`. Aucun téléchargement soumis à connexion ou interdiction n’a été contourné. Aucun fichier GLB non obtenu n’est présenté comme téléchargé.

## Points restant à valider ou fournir

1. Choix et validation visuelle des modèles professionnels : bustes, supports gainés, portants et pied anatomique. Les slots sont prêts ; les compositions d’étude ne doivent pas être présentées comme définitives.
2. Catalogue commercial confirmé, photographies, prix, disponibilités et service réel de panier/commande/paiement. La version livrée reste une démonstration.
3. Contact, informations légales, CGV, confidentialité, livraison et retours, puis réseaux sociaux uniquement s’ils existent.
4. Validation de la fluidité et du rendu sur les appareils physiques ciblés. La géométrie et l’éclairage existants du couloir restent une base de travail ; cette livraison n’est pas présentée comme une validation photoréaliste définitive de tous les modèles.
