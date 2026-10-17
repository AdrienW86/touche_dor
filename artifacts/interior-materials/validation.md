# Maison noire — matériaux architecturaux à valider

Version locale : http://localhost:3000 (recharger la page).

Le sol et les soubassements utilisent désormais un marbre noir PBR, les murs et le plafond un enduit minéral fin. Les pilastres, cadres muraux et caissons de plafond ont des finitions architecturales dédiées. Un HDRI de studio préfiltré fournit leurs reflets. Le marbre possède ses cartes de couleur, rugosité et normales ; l'enduit conserve un relief discret.

## Avant / après

[Comparatif interactif à ouvrir dans un navigateur](comparaison.html).

| Vue | Avant | Après |
| --- | --- | --- |
| Entrée fermée | [Capture](before-closed.png) | [Capture](final-closed.png) |
| Portes ouvertes | [Capture](before-open.png) | [Capture](final-open.png) |
| Dans le couloir | [Capture](before-first-vitrine.png) | [Capture](final-first-vitrine.png) |

Captures Chromium 1780×883, mêmes étapes de scroll et même caméra. Les bijoux continuent à tourner selon leur animation d'origine : leur orientation peut donc différer entre les captures. La carte produit visible dans la vue du couloir est l'interface existante, pas une modification de vitrine.

## Périmètre conservé

La façade et les portes conservent leurs matériaux précédents. Les six vitrines, bijoux, socles, éclairages existants, interface et panier ne sont pas modifiés. Les matériaux d'origine partagés avec les vitrines restent intacts ; les nouvelles finitions sont assignées uniquement aux surfaces architecturales. `scene.environment`, exposition, géométries, positions, caméra et logique d'animation restent inchangés. Seules les coordonnées UV des surfaces concernées sont mises à l'échelle physique pour éviter l'étirement des textures.

[scope-report.json](scope-report.json) prouve l'égalité intégrale du HTML après retrait des deux scripts ajoutés et normalisation des seuls changements d'affectation de matériaux. Les sections caméra, scroll, animations, vitrines, interface et éclairage sont identiques octet par octet à la version précédente.

## Vérifications

- Compilation Next.js et TypeScript réussie.
- ESLint et syntaxe du nouveau module validés.
- 31 contrôles navigateur réussis : ressources actuelles, textures/HDRI chargés, rendu desktop/mobile, portes, passage, six arrêts, panier, catalogue, retour et défilement standard/réduit.
- 18 programmes WebGL liés ; aucune erreur JavaScript, console ou shader.
- Les sept fichiers PBR/HDRI sont servis localement avec réponse HTTP 200.

Rapport : [final-report.json](final-report.json). Le favicon manquant retourne toujours sa 404 préexistante et n'affecte pas la scène.

## Ressources et performance

[Crédits, sources et obligations de licence](../../public/prototype/assets/interior/CREDITS.md), [manifeste avec empreintes SHA-256](../../public/prototype/assets/interior/manifest.json).

Marble016 et Plaster001 proviennent d'ambientCG ; Studio Small 09 provient de Poly Haven. Les trois actifs sont sous CC0, avec usage commercial autorisé et aucune attribution obligatoire. Les crédits sont conservés volontairement. Le chargeur Three.js RGBELoader r128 est sous MIT, avec sa notice de redistribution incluse.

Les six cartes optimisées pèsent 2,97 Mo ; le HDRI 1K pèse 1,62 Mo, soit 4,59 Mo de ressources. Marbre couleur 2K, données 1K ; enduit couleur/rugosité 1K et normales 512 px. Les cartes de données sont encodées sans perte en WebP, les couleurs en WebP qualité 93. Aucun déplacement géométrique n'est ajouté. Les textures sont partagées entre matériaux et le HDRI est préfiltré une seule fois.

À la première vitrine, le nombre d'appels de rendu reste 199 avant/après et la géométrie reste 18 138 triangles. Les textures GPU actives passent de 20 à 26. Les captures utilisent SwiftShader : les temps de frame logiciels ne préjugent pas de la fluidité sur un GPU matériel.

Cette passe s'arrête aux matériaux architecturaux pour validation visuelle avant tout travail sur les vitrines. Aucun déploiement ni nouvelle branche.
