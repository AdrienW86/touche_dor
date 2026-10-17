/* Exterior only. Door dimensions and hinge origins match the original scene. */
(function () {
  window.createMaisonEntrance = function (T, scene, renderer) {
    const root = new T.Group();
    root.name = 'Maison noire — entrée';
    scene.add(root);
    const stoneMaps = window.createEntranceStone(T);

    // A separate reflection environment prevents the bright interior studio
    // environment from turning the exterior brass and black stone white.
    const studio = new T.Scene();
    studio.add(new T.Mesh(new T.BoxGeometry(20, 16, 20),
      new T.MeshBasicMaterial({ color: 0x15110c, side: T.BackSide })));
    function softbox(w, h, x, y, z, ry, strength) {
      const panel = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({
        color: new T.Color(strength, strength * .78, strength * .48), side: T.DoubleSide
      }));
      panel.position.set(x, y, z); panel.rotation.y = ry; studio.add(panel);
    }
    softbox(.3, 5, -3, 2, 3, .5, 2.7);
    softbox(.55, 5, 3.2, 2, 2, -.5, 2.1);
    softbox(5, .28, 0, 4, 1, 0, 1.6);
    softbox(3, 3, -.5, 2.5, -4, 0, .32);
    softbox(.24, 5, -.85, 2, 4, 0, 3.2);
    softbox(.16, 5, .55, 2, 4.5, 0, 2.5);
    softbox(4, 3, 0, 2.4, 6, 0, .22);
    const pmrem = new T.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(studio, .035).texture;
    pmrem.dispose();
    studio.traverse(object => {
      if (object.isMesh) { object.geometry.dispose(); object.material.dispose(); }
    });
    function exteriorLighting(mat, strength = .3) {
      // The original hall uses strong travelling fill lights. Attenuate their
      // contribution only in exterior shaders, keeping the hall untouched.
      mat.onBeforeCompile = shader => {
        shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_end>',
          '#include <lights_fragment_end>\nreflectedLight.directDiffuse *= ' + strength.toFixed(3)
          + ';\nreflectedLight.indirectDiffuse *= ' + strength.toFixed(3)
          + ';\nreflectedLight.directSpecular *= 0.5;');
      };
      mat.customProgramCacheKey = () => 'exterior-' + strength;
      return mat;
    }
    const material = options => exteriorLighting(new T.MeshStandardMaterial({
      envMap: environment, envMapIntensity: .7, ...options
    }));
    const brass = material({ color: 0xb59a69, metalness: 1, roughness: .25 });
    const edge = material({ color: 0xe0bd7b, metalness: 1, roughness: .18, envMapIntensity: .95 });
    const bronze = material({ color: 0x59442b, metalness: .94, roughness: .32 });
    const recess = material({ color: 0x080909, metalness: .45, roughness: .3, envMapIntensity: .22 });
    const warm = new T.MeshBasicMaterial({ color: 0xffbc65, toneMapped: false });
    warm.color.convertSRGBToLinear();
    // Fine directional brushing is restricted to the doors and wall fixtures.
    const finishCanvas = document.createElement('canvas');
    finishCanvas.width = finishCanvas.height = 128;
    const finishContext = finishCanvas.getContext('2d');
    const finishData = finishContext.createImageData(128, 128);
    let finishSeed = 71523;
    const finishNoise = () => ((finishSeed = (Math.imul(finishSeed, 1664525) + 1013904223) >>> 0) / 4294967296);
    for (let x = 0; x < 128; x++) {
      const grain = 194 + finishNoise() * 37;
      for (let y = 0; y < 128; y++) {
        const offset = (y * 128 + x) * 4;
        const value = grain + (finishNoise() - .5) * 8;
        finishData.data[offset] = finishData.data[offset + 1] = finishData.data[offset + 2] = value;
        finishData.data[offset + 3] = 255;
      }
    }
    finishContext.putImageData(finishData, 0, 0);
    const brushing = new T.CanvasTexture(finishCanvas);
    brushing.encoding = T.LinearEncoding;
    brushing.wrapS = brushing.wrapT = T.RepeatWrapping;
    brushing.anisotropy = 4;
    const doorMetal = material({ color: 0xc3ab80, metalness: .98, roughness: .36, roughnessMap: brushing });
    const doorEdge = material({ color: 0xdfc38e, metalness: 1, roughness: .23, envMapIntensity: .85 });
    const handleMetal = material({ color: 0xcbb78e, metalness: 1, roughness: .3, roughnessMap: brushing, envMapIntensity: .85 });
    handleMetal.name = 'Laiton des poignées';
    const sconceMetal = material({ color: 0xbca77e, metalness: .96, roughness: .42, roughnessMap: brushing });
    const sconceEdge = material({ color: 0xd5bd90, metalness: 1, roughness: .29, roughnessMap: brushing });
    // Downloaded CC0 microstructure; retain the authored champagne swatches.
    ['normal', 'roughness'].forEach(kind => new T.TextureLoader().load('/assets/materials/brass-' + kind + '.webp', map => {
      map.wrapS = map.wrapT = T.RepeatWrapping; map.repeat.set(1, 4); map.anisotropy = 4;
      [doorMetal, handleMetal, sconceMetal, sconceEdge].forEach(mat => {
        mat[kind === 'normal' ? 'normalMap' : 'roughnessMap'] = map;
        mat.normalScale.set(.045, .045); mat.needsUpdate = true;
      });
    }, undefined, error => console.error('Finition champagne indisponible', error)));
    const diffuserCanvas = document.createElement('canvas');
    diffuserCanvas.width = 64; diffuserCanvas.height = 128;
    const diffuserContext = diffuserCanvas.getContext('2d');
    const diffuserGradient = diffuserContext.createLinearGradient(0, 0, 64, 0);
    [[0, '#cb9858'], [.18, '#edc790'], [.5, '#ffefd2'], [.82, '#edc790'], [1, '#cb9858']]
      .forEach(stop => diffuserGradient.addColorStop(stop[0], stop[1]));
    diffuserContext.fillStyle = diffuserGradient; diffuserContext.fillRect(0, 0, 64, 128);
    const diffuserMap = new T.CanvasTexture(diffuserCanvas);
    diffuserMap.encoding = T.sRGBEncoding;
    const diffuser = new T.MeshBasicMaterial({ map: diffuserMap, toneMapped: false });
    const geometries = new Map();
    function box(w, h, d, mat, x, y, z, parent = root, bevel = .003) {
      const radius = Math.min(bevel, w / 5, h / 5, d / 5);
      const key = [w, h, d, radius].join(':');
      let geometry = geometries.get(key);
      if (!geometry) {
        const shape = new T.Shape();
        shape.moveTo(-w / 2 + radius, -h / 2 + radius);
        shape.lineTo(w / 2 - radius, -h / 2 + radius);
        shape.lineTo(w / 2 - radius, h / 2 - radius);
        shape.lineTo(-w / 2 + radius, h / 2 - radius);
        shape.closePath();
        geometry = new T.ExtrudeGeometry(shape, {
          depth: d - 2 * radius, bevelEnabled: true,
          bevelThickness: radius, bevelSize: radius, bevelSegments: 2, steps: 1
        });
        geometry.translate(0, 0, -d / 2 + radius);
        // ExtrudeGeometry uses world units for cap UVs. Normalize them so the
        // PBR maps cover each slab once instead of clamping at its edges.
        const positions = geometry.attributes.position, uv = geometry.attributes.uv;
        for (let i = 0; i < positions.count; i++) {
          uv.setXY(i, positions.getX(i) / w + .5, positions.getY(i) / h + .5);
        }
        geometries.set(key, geometry);
      }
      const mesh = new T.Mesh(geometry, mat);
      mesh.position.set(x, y, z); parent.add(mesh); return mesh;
    }
    function crop(map, x, y, w, h) {
      const result = map.clone();
      result.repeat.set(w / 10, h / 5);
      result.offset.set((x - w / 2 + 5) / 10, (y - h / 2) / 5);
      result.needsUpdate = true;
      return result;
    }
    // Baked local light wash stays on the facade; no new light reaches the hall.
    const lightingCanvas = document.createElement('canvas');
    lightingCanvas.width = lightingCanvas.height = 512;
    const lighting = lightingCanvas.getContext('2d');
    lighting.fillStyle = '#000'; lighting.fillRect(0, 0, 512, 512);
    function glow(x, y, rx, ry, alpha) {
      lighting.save(); lighting.translate((x + 5) / 10 * 512, (5 - y) / 5 * 512);
      lighting.scale(rx / 10 * 512, ry / 5 * 512);
      const gradient = lighting.createRadialGradient(0, 0, 0, 0, 0, 1);
      gradient.addColorStop(0, 'rgba(255,175,72,' + alpha + ')');
      gradient.addColorStop(.35, 'rgba(197,115,39,' + alpha * .3 + ')');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      lighting.fillStyle = gradient; lighting.fillRect(-1, -1, 2, 2); lighting.restore();
    }
    [-1, 1].forEach(s => {
      glow(s * 1.98, 2.25, .65, .85, .5);
      glow(s * 1.3, 1.5, .25, 1.8, .14);
    });
    const lightingMap = new T.CanvasTexture(lightingCanvas);
    lightingMap.encoding = T.sRGBEncoding;
    function stone(w, h, d, x, y, z) {
      const mat = exteriorLighting(new T.MeshPhysicalMaterial({
        map: crop(stoneMaps.color, x, y, w, h),
        roughnessMap: crop(stoneMaps.roughness, x, y, w, h), roughness: 1,
        normalMap: crop(stoneMaps.normal, x, y, w, h), normalScale: new T.Vector2(.28, .28),
        metalness: .08, envMap: environment, envMapIntensity: .24,
        clearcoat: .32, clearcoatRoughness: .24,
        emissive: 0xffc47c, emissiveMap: crop(lightingMap, x, y, w, h), emissiveIntensity: .65
      }), .7);
      return box(w, h, d, mat, x, y, z, root, .006);
    }
    // Original wall blocks and aperture: 2.4 wide, 3 high, facade at z = 8.
    [-1, 1].forEach(s => stone(3.8, 3, .3, s * 3.1, 1.5, 8));
    stone(10, 2, .3, 0, 4, 8);
    [-1, 1].forEach(s => {
      // Layered reveal is wholly outside the original clear opening.
      box(.12, 3.1, .36, brass, s * 1.2, 1.55, 8);
      box(.016, 3.06, .016, edge, s * 1.156, 1.55, 8.187);
      box(.045, 3.1, .025, recess, s * 1.284, 1.55, 8.169);
      box(.024, 3.1, .04, bronze, s * 1.325, 1.55, 8.173);
      box(.008, 3.02, .008, warm, s * 1.302, 1.55, 8.2);
      // Subtle slab joints, pilaster edges and stone skirting.
      box(.012, 3, .012, recess, s * 2.73, 1.5, 8.154);
      box(.018, 3, .02, bronze, s * 2.754, 1.5, 8.16);
      box(3.69, .11, .055, recess, s * 3.105, .055, 8.175);
      box(3.69, .009, .015, brass, s * 3.105, .113, 8.203);
    });
    box(2.5, .12, .36, brass, 0, 3.06, 8);
    box(8, .06, .4, bronze, 0, 2.95, 8);
    box(2.27, .012, .012, edge, 0, 3.012, 8.187);
    // A flush exterior sill fits within the original fixed jambs.
    box(2.26, .018, .22, bronze, 0, .012, 8.19);

    const doorGlass = new T.MeshPhysicalMaterial({
      color: 0xf2f5f2, transparent: true, opacity: .045, roughness: .045,
      metalness: 0, envMap: environment, envMapIntensity: .42,
      clearcoat: .35, clearcoatRoughness: .1, reflectivity: .4,
      side: T.DoubleSide, depthWrite: false
    });
    const cylinder = new T.LatheGeometry([
      [0, -.35], [.019, -.35], [.023, -.347], [.025, -.34],
      [.025, .34], [.023, .347], [.019, .35], [0, .35]
    ].map(point => new T.Vector2(point[0], point[1])), 24);
    const mounting = new T.CylinderGeometry(.018, .018, .075, 16);
    const doors = [-1, 1].map(s => {
      const leaf = new T.Group(); leaf.name = s < 0 ? 'Porte gauche' : 'Porte droite';
      leaf.position.set(s * 1.15, 0, 8.1);
      const pane = new T.Mesh(new T.BoxGeometry(1.1, 2.9, .03), doorGlass);
      pane.position.set(-s * .55, 1.5, 0); pane.renderOrder = 2; leaf.add(pane);
      [[1.14, .07, 0, 2.95], [1.14, .07, 0, .06],
        [.07, 2.95, .53, 1.5], [.07, 2.95, -.53, 1.5]].forEach(a => {
        const x = -s * (.55 + a[2]);
        box(a[0], a[1], .06, doorMetal, x, a[3], 0, leaf, .004);
        box(a[0] > 1 ? a[0] - .008 : .012,
          a[1] > 1 ? a[1] - .008 : .012, .007, doorEdge, x, a[3], .032, leaf, .001);
      });
      // Dark inset and fine edges enrich the lower rail without widening it.
      box(1.04, .085, .022, bronze, -s * .55, .135, 0, leaf);
      const handle = new T.Mesh(cylinder, handleMetal);
      // Joining edges of the existing leaves; the hinge transform is unchanged.
      handle.name = 'Poignée centrale';
      handle.position.set(-s * .98, 1.2, .08); leaf.add(handle);
      [ .92, 1.48 ].forEach(y => {
        const mount = new T.Mesh(mounting, handleMetal);
        mount.rotation.x = Math.PI / 2; mount.position.set(-s * .98, y, .046); leaf.add(mount);
      });
      [.3, 1.5, 2.7].forEach(y => box(.036, .085, .072, bronze, -s * .018, y, 0, leaf));
      root.add(leaf); return leaf;
    });

    // Vertical, frosted warm sconces, with metal backplates and end caps.
    [-1, 1].forEach(s => {
      const x = s * 1.98;
      box(.125, .8, .06, recess, x, 2.25, 8.196, root, .008);
      box(.095, .78, .074, sconceMetal, x, 2.25, 8.226, root, .008);
      box(.035, .69, .035, diffuser, x, 2.25, 8.274, root, .006);
      [-1, 1].forEach(q => {
        box(.013, .72, .046, sconceMetal, x + q * .034, 2.25, 8.27, root, .002);
        box(.097, .035, .09, sconceEdge, x, 2.25 + q * .378, 8.241, root, .006);
      });
      box(.103, .085, .085, sconceMetal, x, 2.25, 8.251, root, .008);
    });
    const haloCanvas = document.createElement('canvas');
    haloCanvas.width = haloCanvas.height = 128;
    const haloContext = haloCanvas.getContext('2d');
    const haloGradient = haloContext.createRadialGradient(64, 64, 1, 64, 64, 64);
    haloGradient.addColorStop(0, 'rgba(255,170,63,.25)');
    haloGradient.addColorStop(.3, 'rgba(255,152,42,.1)');
    haloGradient.addColorStop(1, 'rgba(255,130,20,0)');
    haloContext.fillStyle = haloGradient; haloContext.fillRect(0, 0, 128, 128);
    const haloMaterial = new T.MeshBasicMaterial({
      map: new T.CanvasTexture(haloCanvas), transparent: true, depthWrite: false,
      blending: T.AdditiveBlending, toneMapped: false, opacity: .65
    });
    [-1, 1].forEach(s => {
      const halo = new T.Mesh(new T.PlaneGeometry(.9, 1.5), haloMaterial);
      halo.position.set(s * 1.98, 2.25, 8.171); root.add(halo);
    });

    // Batch the fixed trim by material; batch each moving leaf separately so
    // its original hinge remains the sole animation transform. Glass keeps its
    // own geometry and transparent sorting. Interior meshes are never touched.
    [root, ...doors].forEach(parent => {
      const batches = new Map();
      parent.children.forEach(mesh => {
        if (!mesh.isMesh || mesh.isInstancedMesh || mesh.material.transparent) return;
        if (!batches.has(mesh.material)) batches.set(mesh.material, []);
        batches.get(mesh.material).push(mesh);
      });
      batches.forEach((meshes, mat) => {
        if (meshes.length < 2) return;
        const attributes = { position: [], normal: [], uv: [] };
        meshes.forEach(mesh => {
          mesh.updateMatrix();
          const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
          geometry.applyMatrix4(mesh.matrix);
          Object.keys(attributes).forEach(key => {
            const source = geometry.getAttribute(key).array;
            for (let i = 0; i < source.length; i++) attributes[key].push(source[i]);
          });
          geometry.dispose(); parent.remove(mesh);
        });
        const geometry = new T.BufferGeometry();
        Object.keys(attributes).forEach(key => geometry.setAttribute(key,
          new T.Float32BufferAttribute(attributes[key], key === 'uv' ? 2 : 3)));
        const batch = new T.Mesh(geometry, mat);
        batch.name = 'Détails regroupés'; parent.add(batch);
      });
    });
    return { doors, root, ready: stoneMaps.ready };
  };
})();
