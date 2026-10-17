# Modules Three.js r128

Ces modules officiels sont conservés dans leur version r128, compatible avec le moteur existant. Ils sont distribués sous licence MIT. La notice complète `THREE-LICENSE.txt` doit accompagner leur redistribution.

| Fichier | Source |
| --- | --- |
| RGBELoader.r128.js | https://github.com/mrdoob/three.js/blob/r128/examples/js/loaders/RGBELoader.js |
| GLTFLoader.r128.js | https://github.com/mrdoob/three.js/blob/r128/examples/js/loaders/GLTFLoader.js |
| Reflector.r128.js | https://github.com/mrdoob/three.js/blob/r128/examples/js/objects/Reflector.js |
| RectAreaLightUniformsLib.r128.js | https://github.com/mrdoob/three.js/blob/r128/examples/js/lights/RectAreaLightUniformsLib.js |

`Reflector` calcule le rendu du plan de sol dans une cible hors écran avec une caméra virtuelle interne. La caméra de visite et ses interpolations ne sont pas modifiées.

Les tables LTC contenues dans `RectAreaLightUniformsLib` proviennent du projet https://github.com/selfshadow/ltc_code/. Leur notice de redistribution et leur obligation de référence bibliographique sont conservées dans `LTC-LICENSE.txt`.

Référence : Eric Heitz, Jonathan Dupuy, Stephen Hill et David Neubelt, *Real-Time Polygonal-Light Shading with Linearly Transformed Cosines*, ACM Transactions on Graphics (SIGGRAPH 2016), 35(4), 2016. Page du projet : https://eheitzresearch.wordpress.com/415-2/.
