/* Licensed downloaded geometry. Only showcase 0 and the left sconce at z=-1.
   Sources, authors and modifications: /assets/models/pilot/ATTRIBUTION.html */
(function () {
  window.loadMaisonPilotShowcase = function (T, scene, display, architecture, materials) {
    const loader = new T.GLTFLoader();
    const load = name => new Promise((resolve, reject) => loader.load('/assets/models/pilot/' + name + '.glb', gltf => resolve(gltf.scene), undefined, reject));
    const metal = materials.brass.clone(); metal.roughness = .28;
    const edge = metal.clone();edge.emissive.set(0xffd49a).convertSRGBToLinear();edge.emissiveIntensity=.12;
    const gold = metal.clone(); gold.color.set(0xd7b474).convertSRGBToLinear(); gold.roughness = .21;
    const glass = new T.MeshPhysicalMaterial({color:0xffffff,transparent:true,opacity:.035,roughness:.055,metalness:0,depthWrite:false,side:T.DoubleSide,envMapIntensity:.35});
    const velvet = materials.velvet.clone(); velvet.color.set(0x08090d).convertSRGBToLinear(); velvet.roughness = .97; velvet.normalScale.set(.018,.018);
    const gem = new T.MeshPhysicalMaterial({color:0xe4e5df,metalness:.05,roughness:.075,clearcoat:1,clearcoatRoughness:.06,envMapIntensity:1.2});
    const sourceChildren = [...display.children];
    const showcaseReady = Promise.all([load('necklace-cabinet'),load('necklace-bust'),window.maisonDisplayAssetsReady]).then(([cabinet,bust]) => {
      // Clones share the texture maps loaded by the established material pass.
      [velvet,metal,gold,edge].forEach(mat => {
        const original = mat === velvet ? materials.velvet : materials.brass;
        mat.map=original.map;mat.normalMap=original.normalMap;mat.roughnessMap=original.roughnessMap;mat.needsUpdate=true;
      });
      cabinet.name='Pilote : meuble téléchargé / Mick Chambers';
      cabinet.traverse(o=>{if(!o.isMesh)return;
        const old=o.material;
        if(old.name==='Pilot clear glass'){o.material=glass;o.renderOrder=3;}
        else if(old.name==='Pilot champagne trim'){o.material=metal;}
        else if(old.name==='Pilot warm integrated edge'){o.material=edge;}
        else {o.material=old.clone();o.material.color.set(0x413329).convertSRGBToLinear();o.material.roughness=.4;}
        o.castShadow=!o.material.transparent;o.receiveShadow=true;
      });
      bust.traverse(o=>{if(!o.isMesh)return;
        o.material=o.material.name.includes('velvet')?velvet:o.material.name.includes('gemstone')?gem:gold;
        o.castShadow=true;o.receiveShadow=true;
      });
      const bustBounds=new T.Box3().setFromObject(bust);bust.position.y-=bustBounds.min.y;
      const centeredBust=new T.Group();centeredBust.add(bust);
      const composition=new T.Group();composition.name='Pilote : trois bustes et colliers téléchargés / muratgt';
      [[0,.74,-.17,0],[-.40,.46,.16,.08],[.40,.54,.12,-.08]].forEach(([x,height,z,angle],i)=>{
        const copy=centeredBust.clone(true);copy.name=['Buste central','Buste secondaire petit','Buste secondaire moyen'][i];
        copy.scale.setScalar(height/.74);copy.position.set(x,1.05,z);copy.rotation.y=angle;composition.add(copy);
      });
      sourceChildren.forEach(o=>display.remove(o));display.add(cabinet,composition);
      display.userData={...display.userData,status:'downloaded-model-pilot',modelsPending:false,source:'CC BY 4.0 / Mick Chambers + muratgt',reviewRequired:true};
      return display;
    });
    const sconceReady = load('wall-light').then(model=>{
      const shade=new T.MeshPhysicalMaterial({color:0xffe6bf,roughness:.4,metalness:0,clearcoat:.25,emissive:0xffcd87,emissiveIntensity:.12});
      shade.color.convertSRGBToLinear();shade.emissive.convertSRGBToLinear();
      const source=new T.MeshBasicMaterial({color:0xffdda8,toneMapped:false});source.color.convertSRGBToLinear();
      const crystal=glass.clone();crystal.opacity=.25;crystal.roughness=.07;
      const ceramic=new T.MeshStandardMaterial({color:0xddd1b9,roughness:.45});ceramic.color.convertSRGBToLinear();
      model.traverse(o=>{if(!o.isMesh)return;const name=o.material.name.toLowerCase();
        o.material=name==='glass_2'?shade:name.includes('emis')?source:name.includes('glassbulb')?crystal:name.includes('ceramic')?ceramic:metal;
        o.castShadow=false;o.receiveShadow=true;
      });
      const size=new T.Box3().setFromObject(model).getSize(new T.Vector3());model.scale.setScalar(.48/size.y);
      model.position.set(-2.52,2.5,-.966);model.name='Pilote : applique téléchargée / abd3d';
      // Remove only the original plate and diffuser at this exact anchor.
      scene.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.parameters||{};
        if(Math.abs(o.position.x+2.52)<.001&&Math.abs(o.position.y-2.5)<.001&&Math.abs(o.position.z+1)<.04&&((p.width===.5&&p.height===.5)||(p.width===.14&&p.height===.38)))o.visible=false;
      });
      scene.add(model);model.userData={pilot:true,source:'CC0 / abd3d',reviewRequired:true};
      return model;
    });
    window.maisonPilotAssetsReady = Promise.all([showcaseReady,sconceReady]).then(models=>{
      // Refresh the existing static shadow maps once, without changing lights.
      window.dispatchEvent(new Event('maison-pilot-ready'));return models;
    }).catch(error=>{console.error('Modèles pilotes indisponibles',error);throw error;});
    return window.maisonPilotAssetsReady;
  };
})();
