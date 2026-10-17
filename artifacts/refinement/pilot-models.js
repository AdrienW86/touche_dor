/* Downloaded contemporary pilot. Tour anchors and global lighting preserved.
   Sources: /assets/models/refinement/ATTRIBUTION.html
   Previous GLBs stay in /assets/models/pilot/ as unloaded backups. */
(function () {
  window.loadMaisonPilotShowcase=function(T,scene,display,architecture,materials){
    const loader=new T.GLTFLoader();
    const load=url=>new Promise((resolve,reject)=>loader.load(url,gltf=>resolve(gltf.scene),undefined,reject));
    const ready=Promise.all([architecture.ready,window.maisonDisplayAssetsReady]);
    const metal=materials.brass.clone();metal.roughness=.34;metal.envMapIntensity=.4;
    const gold=metal.clone();gold.color.set(0xe4c185).convertSRGBToLinear();gold.roughness=.24;gold.envMapIntensity=.9;
    const glass=new T.MeshPhysicalMaterial({color:0xffffff,transparent:true,opacity:.018,roughness:.09,metalness:0,depthWrite:false,side:T.FrontSide,envMapIntensity:.16});
    const velvet=materials.velvet.clone();velvet.color.set(0x12151c).convertSRGBToLinear();velvet.roughness=.96;velvet.normalScale.set(.008,.008);
    const gem=new T.MeshPhysicalMaterial({color:0xf2ede2,metalness:.03,roughness:.08,clearcoat:.75,clearcoatRoughness:.1,envMapIntensity:1});
    const led=new T.MeshStandardMaterial({color:0xf2e4cd,roughness:.5,emissive:0xffd4a2,emissiveIntensity:.55});
    led.color.convertSRGBToLinear();led.emissive.convertSRGBToLinear();
    const sourceChildren=[...display.children];
    const showcaseReady=Promise.all([load('/assets/models/refinement/gem-counter.glb'),load('/assets/models/pilot/necklace-bust.glb'),ready]).then(([cabinet,bust])=>{
      metal.normalMap=materials.brass.normalMap;metal.normalScale.set(.025,.025);metal.roughnessMap=materials.brass.roughnessMap;
      // Environment reflections reveal real chain links without enlarging them.
      [metal,gold,gem,glass].forEach(m=>{m.envMap=architecture.brass.envMap;m.needsUpdate=true;});
      gold.normalMap=null;gold.roughnessMap=null;gold.map=null;
      velvet.map=materials.velvet.map;velvet.roughnessMap=materials.velvet.roughnessMap;velvet.normalMap=materials.velvet.normalMap;velvet.needsUpdate=true;
      cabinet.name='Pilote contemporain : GEM / Innerscene';
      cabinet.traverse(o=>{if(!o.isMesh)return;const name=o.material.name;
        if(name.includes('Glass')){o.material=glass;o.renderOrder=3;}
        else if(name.includes('Bronze'))o.material=metal;
        else if(name==='Refined LED opal')o.material=led;
        else if(name.includes('Flax')){o.material=velvet.clone();o.material.color.set(0x202229).convertSRGBToLinear();}
        else if(name.includes('Walnut')){o.material=o.material.clone();o.material.color.set(0x55493e).convertSRGBToLinear();o.material.roughness=.52;}
        o.castShadow=!o.material.transparent;o.receiveShadow=true;
      });
      bust.traverse(o=>{if(!o.isMesh)return;o.material=o.material.name.includes('velvet')?velvet:o.material.name.includes('gemstone')?gem:gold;o.castShadow=true;o.receiveShadow=true;});
      const bounds=new T.Box3().setFromObject(bust);bust.position.y-=bounds.min.y;
      const template=new T.Group();template.add(bust);
      const composition=new T.Group();composition.name='Trois bustes velours / colliers maillés de muratgt';
      [[0,.55,0,.215],[-.39,.42,.055,.31],[.39,.46,.045,.10]].forEach(([x,height,z,angle],i)=>{
        const model=template.clone(true);model.name=['Buste central','Buste secondaire petit','Buste secondaire moyen'][i];model.scale.setScalar(height/.74);model.position.set(x,.744,z);model.rotation.y=angle;composition.add(model);
      });
      const lighting=new T.Group();lighting.name='LED locales première vitrine';
      [-.34,.34].forEach(x=>{
        const light=new T.SpotLight(0xffd9ac,.62,.92,.64,.85,2);light.position.set(x,1.365,.12);light.target.position.set(x*.75,1.02,-.015);light.castShadow=false;light.userData={localShowcase:true};lighting.add(light,light.target);
      });
      // Dispose only owned geometry; shared materials remain for the other five.
      sourceChildren.forEach(o=>{display.remove(o);o.traverse(child=>{if(child.geometry)child.geometry.dispose();});});
      display.add(cabinet,composition,lighting);
      display.userData={...display.userData,status:'downloaded-model-pilot',modelsPending:false,source:'GEM / Innerscene CC0 + muratgt CC BY 4.0',reviewRequired:true,version:'contemporary-refinement'};
      return display;
    });
    const sconceReady=Promise.all([load('/assets/models/refinement/vertical-sconce.glb'),ready]).then(([model])=>{
      const opal=new T.MeshStandardMaterial({color:0xe9dfcb,roughness:.55,emissive:0xffd3a0,emissiveIntensity:.28});opal.color.convertSRGBToLinear();opal.emissive.convertSRGBToLinear();
      const ceramic=new T.MeshStandardMaterial({color:0xd7cfbd,roughness:.55});ceramic.color.convertSRGBToLinear();
      model.traverse(o=>{if(!o.isMesh)return;const assign=m=>m.name==='glass_cy'?opal:m.name.includes('Ceramic')?ceramic:metal;o.material=Array.isArray(o.material)?o.material.map(assign):assign(o.material);o.castShadow=false;o.receiveShadow=true;});
      const size=new T.Box3().setFromObject(model).getSize(new T.Vector3());model.scale.setScalar(.78/size.y);model.position.set(-2.52,2.5,-.966);model.name='Pilote : applique verticale contemporaine / abd3d';
      scene.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.parameters||{};if(Math.abs(o.position.x+2.52)<.001&&Math.abs(o.position.y-2.5)<.001&&Math.abs(o.position.z+1)<.04&&((p.width===.5&&p.height===.5)||(p.width===.14&&p.height===.38)))o.visible=false;});
      scene.add(model);model.userData={pilot:true,source:'Wall Light / abd3d / CC0',reviewRequired:true,version:'contemporary-refinement'};return model;
    });
    window.maisonPilotAssetsReady=Promise.all([showcaseReady,sconceReady]).then(models=>{window.dispatchEvent(new Event('maison-pilot-ready'));return models;}).catch(error=>{console.error('Modèles pilotes indisponibles',error);throw error;});
    return window.maisonPilotAssetsReady;
  };
})();
