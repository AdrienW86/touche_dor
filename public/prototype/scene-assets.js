/* Shared source images, independent texture transforms for each surface. */
(function () {
  const textures = new Map();
  window.loadMaisonTexture = function (T, url, color) {
    const key = url + ':' + Boolean(color);
    if (!textures.has(key)) textures.set(key, new Promise((resolve, reject) => {
      new T.TextureLoader().load(url, map => {
        map.encoding = color ? T.sRGBEncoding : T.LinearEncoding;
        resolve(map);
      }, undefined, reject);
    }));
    return textures.get(key).then(source => {
      const map = source.clone();
      map.needsUpdate = true;
      return map;
    });
  };
})();
