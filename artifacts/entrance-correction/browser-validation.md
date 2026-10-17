# Validation navigateur — correction de l’entrée

Exécution sur `http://localhost:3000`, Chromium 153 headless avec rendu logiciel SwiftShader. Résultat : **30 contrôles réussis**, rapport complet dans `final-report.json`.

- `final-closed.png` : portes fermées, 1780 × 883.
- `final-open.png` : portes ouvertes, 1780 × 883.
- `final-desktop-1870.png` : composition à 1870 × 930.
- `final-mobile-closed.png` : composition à 390 × 844.
- Captures supplémentaires : ouverture intermédiaire, passage, première vitrine, catalogue, retour à l’entrée et première vitrine mobile.

Inspection des captures : aucune végétation ni jardinière visible. Le couloir et les vitrines restent très nettement visibles à travers les portes fermées. Le texte reste sur la façade gauche sur les deux formats de bureau et occupe un bloc compact dans la partie basse sur mobile.

Contrôles : absence d’InstancedMesh et d’objets végétaux dans la scène ; suppression du code végétal dans le JavaScript réellement servi ; verre transparent (opacité 0,045, rugosité 0,045, écriture de profondeur désactivée) ; dimensions des panneaux inchangées ; mêmes pivots et angles de portes aux étapes de référence ; coordonnées X/Z de caméra identiques ; nombre de lumières inchangé.

Navigation : molette, ouverture et fermeture des portes, parcours des six vitrines, fiche de chaque produit, ajout au panier, total de 890 €, catalogue à six produits, boutons catalogue et panier, retour à la boutique ; première vitrine et angle de caméra mobile ; fonctionnement standard et réduction des animations.

Composition mesurée : texte à environ 64 px du bord projeté de l’ouverture à 1780 × 883 et 66 px à 1870 × 930 ; aucun débordement horizontal du titre ou du paragraphe sur mobile.

Les 16 programmes de shaders sont liés. Aucune erreur JavaScript, console ou shader ; aucune requête réseau interrompue. La seule erreur de ressource est le `favicon.ico` absent (404), également présent dans le rapport de référence. Cache désactivé et SHA-256 des trois sources HTML/JavaScript servies identiques aux fichiers courants du projet.

Les mesures de cadence du rapport proviennent du rendu logiciel et ne représentent pas les performances du GPU de l’utilisateur. Le profil Chromium temporaire a été supprimé après le test.
