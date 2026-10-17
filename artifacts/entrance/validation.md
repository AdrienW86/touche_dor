# Entrée Maison noire — validation visuelle

Ouvrir ou recharger http://localhost:3000 pour examiner la version locale.

La passe concerne le marbre noir, le laiton champagne, les deux portes vitrées, leurs détails métalliques, les appliques et deux compositions végétales. Les textures de couleur, rugosité et normales du marbre sont générées localement. L'entrée reste entièrement en 3D.

Captures du navigateur :

- [Portes fermées](final-closed.png)
- [Portes partiellement ouvertes](final-half-open.png)
- [Portes ouvertes](final-open.png)
- [Passage dans l'entrée](final-passage.png)
- [Première vitrine](final-first-vitrine.png)
- [Affichage mobile](final-mobile-closed.png)

Les dimensions du passage, des vitrages et les pivots à `(±1.15, 0, 8.1)` sont conservés. Les portes gardent leur ouverture à `±1.45` radians. Le couloir, les six vitrines, l'éclairage intérieur, la caméra, le scroll et l'interface conservent leur code d'origine, vérifié par comparaison intégrale du document après les trois remplacements autorisés.

Vérifications techniques : compilation de production, TypeScript, ESLint, syntaxe des deux scripts et conservation du périmètre réussis. Le compte rendu du navigateur est dans [final-report.json](final-report.json) ; les empreintes des sources et des sections conservées sont dans [scope-report.json](scope-report.json).

Les 20 contrôles du navigateur passent : ouverture, fermeture, passage, première vitrine, panier, catalogue, mobile et navigation avec mouvement standard. Les 18 programmes WebGL compilent et se lient sans erreur ; aucune erreur de console n'a été relevée dans [final-shader-report.json](final-shader-report.json).

| Point de mesure | Original | Entrée modifiée |
| --- | ---: | ---: |
| Entrée fermée : appels de rendu | 228 | 234 |
| Première vitrine : appels de rendu | 197 | 199 |
| Première vitrine : triangles | 17 534 | 18 578 |

Les détails fixes sont regroupés par matériau. Les feuillages et branches sont instanciés et sortent du rendu derrière la caméra. Aucun éclairage global n'est ajouté : les accents lumineux extérieurs utilisent des matériaux et des reflets dédiés.

Les captures ont été contrôlées dans Chromium avec WebGL logiciel. Les temps de frame de ce navigateur ne représentent pas les performances du GPU de l'utilisateur. Le favicon manquant est une erreur de ressource préexistante, consignée séparément des erreurs JavaScript.

Aucun déploiement ni nouvelle branche. Cette passe s'arrête à l'entrée pour validation visuelle.
