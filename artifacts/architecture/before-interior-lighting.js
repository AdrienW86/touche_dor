/* Lighting/reflection pass. The visitor camera and animation loop are untouched. */
(function () {
  window.createMaisonInteriorLighting = function (T, scene, renderer, architecture, ambient, fills, strip) {
    const group = new T.Group();
    group.name = 'Éclairage architectural'; scene.add(group);
    ambient.color.setRGB(.18, .135, .09);
    fills.forEach((light, i) => {
      light.color.setRGB(1, .64, .33);
      light.intensity = i === 0 ? .72 : .28;
      light.distance = 10;
    });
    strip.color.set(0xffcd87).convertSRGBToLinear(); strip.toneMapped = false;

    // Existing opaque architecture and fixed pedestals cast/receive shadows;
    // animated jewelry and swinging doors are excluded from the static maps.
    const staticMeshes = scene.children.filter(object => object.isMesh && !object.material.transparent);
    staticMeshes.forEach(mesh => {
      mesh.receiveShadow = true;
      const p = mesh.geometry.parameters || {};
      mesh.castShadow = mesh.geometry.type === 'BoxGeometry'
        && p.height > .2 && p.width > .15;
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    [ [5, -4, 1.9, 1024], [-17, -26, 1.6, 512] ].forEach(([z, targetZ, intensity, size]) => {
      const light = new T.SpotLight(0xffd29a, intensity, 22, .67, .75, 1.5);
      light.position.set(0, 3.65, z); light.target.position.set(0, .15, targetZ);
      light.castShadow = true;
      light.shadow.mapSize.set(size, size);
      light.shadow.camera.near = .2; light.shadow.camera.far = 23;
      light.shadow.bias = -.00015; light.shadow.normalBias = .025;
      light.shadow.radius = 2;
      group.add(light, light.target);
    });
    renderer.shadowMap.needsUpdate = true;
    window.addEventListener('maison-pilot-ready', () => { renderer.shadowMap.needsUpdate = true; }, {once:true});
    [4, -8, -20, -32].forEach(z => [-1, 1].forEach(s => {
      const light = new T.PointLight(0xffc47e, .85, 8.5, 2);
      light.position.set(s * 2.42, 2.4, z); group.add(light);
    }));
    T.RectAreaLightUniformsLib.init();
    [-1, 1].forEach(s => {
      const light = new T.RectAreaLight(0xffffff, 3.5, .05, .67);
      light.color.setRGB(1, .56, .22);
      light.position.set(s * 1.98, 2.25, 8.45);
      light.lookAt(s * 1.98, 2.25, 8);
      group.add(light);
    });

    const emission = new T.MeshBasicMaterial({ color: 0xffce88, toneMapped: false });
    emission.color.convertSRGBToLinear();
    const diffuser = new T.MeshBasicMaterial({ color: 0xffe0ac, toneMapped: false });
    diffuser.color.convertSRGBToLinear();
    const bars = [];
    function bar(w, h, d, x, y, z) {
      const geometry = new T.BoxGeometry(w, h, d).toNonIndexed();
      geometry.translate(x, y, z); bars.push(geometry);
    }
    [-1, 1].forEach(s => bar(.018, .018, 44, s * 2.82, .045, -14));
    for (let k = 0; k < 15; k++) bar(5.5, .012, .014, 0, 3.85, 6 - k * 3);
    const combined = new T.BufferGeometry();
    ['position', 'normal', 'uv'].forEach(name => {
      const values = [];
      bars.forEach(geometry => {
        const source = geometry.getAttribute(name).array;
        for (let i = 0; i < source.length; i++) values.push(source[i]);
      });
      combined.setAttribute(name, new T.Float32BufferAttribute(values, name === 'uv' ? 2 : 3));
    });
    bars.forEach(geometry => geometry.dispose());
    const led = new T.Mesh(combined, emission); led.name = 'Liserés lumineux'; group.add(led);
    const lens = new T.PlaneGeometry(.14, .38);
    for (let k = 0; k < 7; k++) [-1, 1].forEach(s => {
      const mesh = new T.Mesh(lens, diffuser);
      mesh.position.set(s * 2.52, 2.5, 5 - k * 6 + .034); group.add(mesh);
    });

    // One live planar reflection, softly filtered and blended over the PBR
    // stone. This uses Reflector's private virtual camera, never the visit cam.
    const shader = {
      uniforms: { color: { value: new T.Color(0xffffff) }, tDiffuse: { value: null },
        textureMatrix: { value: new T.Matrix4() }, normalMap: { value: null },
        texel: { value: new T.Vector2(1 / 1024, 1 / 512) } },
      vertexShader: `
        uniform mat4 textureMatrix;
        varying vec4 vReflection;
        varying vec3 vWorld;
        void main() {
          vReflection = textureMatrix * vec4(position, 1.0);
          vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform sampler2D normalMap;
        uniform vec2 texel;
        varying vec4 vReflection;
        varying vec3 vWorld;
        void main() {
          vec2 uv = vReflection.xy / vReflection.w;
          vec2 grain = texture2D(normalMap, vec2(vWorld.x, -vWorld.z) / 2.0).rg * 2.0 - 1.0;
          uv += grain * 0.0012;
          vec3 reflected = texture2D(tDiffuse, uv).rgb * 0.4;
          reflected += texture2D(tDiffuse, uv + texel * vec2(1.5, 0.0)).rgb * 0.15;
          reflected += texture2D(tDiffuse, uv - texel * vec2(1.5, 0.0)).rgb * 0.15;
          reflected += texture2D(tDiffuse, uv + texel * vec2(0.0, 1.5)).rgb * 0.15;
          reflected += texture2D(tDiffuse, uv - texel * vec2(0.0, 1.5)).rgb * 0.15;
          float facing = abs(normalize(cameraPosition - vWorld).y);
          float fresnel = pow(1.0 - facing, 3.0);
          gl_FragColor = vec4(reflected, mix(0.09, 0.38, fresnel));
        }`
    };
    const flatNormal = new T.DataTexture(new Uint8Array([128, 128, 255, 255]), 1, 1, T.RGBAFormat);
    flatNormal.needsUpdate = true; shader.uniforms.normalMap.value = flatNormal;
    const reflection = new T.Reflector(new T.PlaneGeometry(5.96, 43.9), {
      textureWidth: 1024, textureHeight: 512, clipBias: .003, shader
    });
    reflection.name = 'Reflet plan du marbre';
    reflection.rotation.x = -Math.PI / 2;
    reflection.position.set(0, .018, -14);
    reflection.material.transparent = true;
    reflection.material.depthWrite = false;
    reflection.material.toneMapped = false;
    reflection.renderOrder = 1;
    const renderReflection = reflection.onBeforeRender;
    let lastReflection = -Infinity;
    reflection.onBeforeRender = function (renderer, scene, camera) {
      const width = innerWidth < 800 ? 512 : 1024;
      const target = reflection.getRenderTarget();
      if (target.width !== width) {
        target.setSize(width, width / 2);
        reflection.material.uniforms.texel.value.set(1 / width, 2 / width);
        lastReflection = -Infinity;
      }
      const now = performance.now();
      if (now - lastReflection < 50) return;
      lastReflection = now;
      renderReflection.call(this, renderer, scene, camera);
    };
    scene.add(reflection);
    architecture.ready.then(() => {
      reflection.material.uniforms.normalMap.value = architecture.floor.normalMap;
      flatNormal.dispose();
    });
    return { group, reflection };
  };
})();
