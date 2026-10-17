/* Architecture materials only; never mutates shared display-case materials. */
(function () {
  window.createMaisonInteriorMaterials = function (T, renderer) {
    const path = '/prototype/assets/interior/';
    const loader = new T.TextureLoader();
    const materials = {};
    const cache = new Map();
    function texture(name, color) {
      if (!cache.has(name)) cache.set(name, new Promise((resolve, reject) => {
        loader.load(path + name, map => {
          map.encoding = color ? T.sRGBEncoding : T.LinearEncoding;
          map.wrapS = map.wrapT = T.RepeatWrapping;
          map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
          resolve(map);
        }, undefined, reject);
      }));
      return cache.get(name);
    }
    function finish(name, options) {
      const material = new T.MeshPhysicalMaterial(options);
      // Authored swatches are sRGB; r128 expects material colors in linear space.
      material.color.convertSRGBToLinear();
      material.name = 'Architecture / ' + name;
      material.userData.architecture = true;
      material.userData.ready = false;
      materials[name] = material;
      return material;
    }
    finish('floor', { color: 0xd3c3a7, metalness: 0, roughness: .24,
      clearcoat: .38, clearcoatRoughness: .18, envMapIntensity: .12 });
    finish('runner', { color: 0x5c5140, metalness: 0, roughness: .35,
      clearcoat: .2, clearcoatRoughness: .23, envMapIntensity: .1 });
    finish('wallBase', { color: 0x5e5343, metalness: 0, roughness: .3,
      clearcoat: .24, clearcoatRoughness: .2, envMapIntensity: .12 });
    finish('wallUpper', { color: 0x39352e, metalness: 0, roughness: .88, envMapIntensity: .14 });
    finish('column', { color: 0x9b8b6e, metalness: 0, roughness: .72, envMapIntensity: .18 });
    finish('ceiling', { color: 0x161716, metalness: 0, roughness: .84, envMapIntensity: .08 });
    finish('brass', { color: 0xbfa16e, metalness: 1, roughness: .27, envMapIntensity: .3 });
    finish('wallInset', { color: 0x6c6558, metalness: 1, roughness: .12, envMapIntensity: .25 });

    const environment = new Promise((resolve, reject) => {
      new T.RGBELoader().setDataType(T.UnsignedByteType).load(path + 'studio_small_09_1k.hdr', hdr => {
        const generator = new T.PMREMGenerator(renderer);
        generator.compileEquirectangularShader();
        const target = generator.fromEquirectangular(hdr);
        hdr.dispose(); generator.dispose();
        resolve(target.texture);
      }, undefined, reject);
    });
    const marble = Promise.all([texture('marble-color.webp', true),
      texture('marble-normal.webp', false), texture('marble-roughness.webp', false)]);
    const plaster = Promise.all([texture('plaster-color.webp', true),
      texture('plaster-normal.webp', false), texture('plaster-roughness.webp', false)]);
    function maps(names, maps, normalStrength, roughness) {
      names.forEach(name => {
        const material = materials[name];
        [material.map, material.normalMap, material.roughnessMap] = maps;
        material.normalScale.set(normalStrength, normalStrength);
        material.roughness = roughness;
      });
    }
    const ready = Promise.all([environment, marble, plaster]).then(([env, stone, paint]) => {
      maps(['floor'], stone, .035, .62);
      maps(['runner'], stone, .025, .83);
      maps(['wallBase'], stone, .025, .75);
      maps(['wallUpper'], paint, .075, .95);
      maps(['column'], paint, .035, .8);
      maps(['ceiling'], paint, .045, .96);
      Object.values(materials).forEach(material => {
        material.envMap = env;
        material.userData.ready = true;
        material.needsUpdate = true;
      });
    }).catch(error => {
      console.error('Chargement des matériaux architecturaux impossible.', error);
    });

    // World-scaled UVs prevent stretching over 44m-long walls and keep the
    // floor's central inlay continuous. Only UV coordinates are changed.
    function apply(mesh, name) {
      mesh.material = materials[name];
      mesh.userData.architectureSurface = name;
      mesh.updateMatrixWorld(true);
      const positions = mesh.geometry.attributes.position;
      const normals = mesh.geometry.attributes.normal;
      const uv = mesh.geometry.attributes.uv;
      const position = new T.Vector3(), normal = new T.Vector3();
      const normalMatrix = new T.Matrix3().getNormalMatrix(mesh.matrixWorld);
      const scale = name === 'floor' || name === 'runner' || name === 'wallBase' ? 2 : 1.5;
      for (let i = 0; i < positions.count; i++) {
        position.fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld);
        normal.fromBufferAttribute(normals, i).applyMatrix3(normalMatrix).normalize();
        if (Math.abs(normal.y) > .9) uv.setXY(i, position.x / scale, -position.z / scale);
        else if (Math.abs(normal.x) > .9) uv.setXY(i, -position.z / scale, position.y / scale);
        else uv.setXY(i, position.x / scale, position.y / scale);
      }
      uv.needsUpdate = true;
      return mesh;
    }
    return { ...materials, apply, ready };
  };
})();
