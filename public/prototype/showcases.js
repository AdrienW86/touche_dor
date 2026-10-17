/* Replaceable display studies. No parametric study is labelled a final model.
   modelSlots accept licensed, locally hosted GLBs without changing tour anchors. */
(function () {
  window.createMaisonShowcases = function (T, scene, architecture, build, anchors) {
    const gltf = new T.GLTFLoader(), pending = new Map();
    const velvet = new T.MeshPhysicalMaterial({color:0x181715,roughness:.94,metalness:0,sheen:new T.Color(.12,.1,.08)});
    const walnut = new T.MeshStandardMaterial({color:0x3c3026,roughness:.38,metalness:0});
    const brass = new T.MeshStandardMaterial({color:0xc8ad78,metalness:1,roughness:.3,envMapIntensity:.5});
    // Subpixel profiles need a broad highlight, without the source roughness
    // map multiplying .3 down to a mirror-like finish. Keep body materials.
    const trimBrass = brass.clone();trimBrass.roughness=.56;trimBrass.envMapIntensity=.3;
    trimBrass.name='Champagne satiné — profils stables';
    const stone = architecture.wallBase;
    architecture.ready.then(() => {brass.envMap=architecture.brass.envMap;brass.needsUpdate=true;trimBrass.envMap=architecture.brass.envMap;trimBrass.needsUpdate=true;}).catch(()=>{});
    [velvet,walnut,brass].forEach(m=>m.color.convertSRGBToLinear());
    trimBrass.color.copy(brass.color);
    window.maisonDisplayAssetsReady = Promise.all([
      ...[[velvet,'velvet'],[walnut,'walnut']].flatMap(([mat,name])=>['color','normal','roughness'].map(kind=>window.loadMaisonTexture(T,'/assets/materials/'+name+'-'+kind+'.webp',kind==='color').then(map=>{
          map.encoding=kind==='color'?T.sRGBEncoding:T.LinearEncoding;map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(2,2);map.anisotropy=4;
          mat[kind==='color'?'map':kind==='normal'?'normalMap':'roughnessMap']=map;
          if(kind==='normal')mat.normalScale.set(.1,.1);mat.needsUpdate=true;
      }))),
      ...['normal','roughness'].map(kind=>window.loadMaisonTexture(T,'/assets/materials/brass-'+kind+'.webp',false).then(map=>{
        map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(1,4);brass[kind==='normal'?'normalMap':'roughnessMap']=map;brass.normalScale.set(.06,.06);brass.needsUpdate=true;
      }))
    ]).catch(error=>{console.error('Matériaux des présentoirs indisponibles',error);throw error;});
    const mesh=(geometry,material,parent,x=0,y=0,z=0)=>{const o=new T.Mesh(geometry,material);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;};
    function rounded(w,h,d,r=.015){const s=new T.Shape();s.moveTo(-w/2+r,-h/2+r);s.lineTo(w/2-r,-h/2+r);s.lineTo(w/2-r,h/2-r);s.lineTo(-w/2+r,h/2-r);s.closePath();const g=new T.ExtrudeGeometry(s,{depth:d-r*2,bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:3,steps:1});g.translate(0,0,-d/2+r);return g;}
    function block(parent,w,h,d,mat,x,y,z){return mesh(rounded(w,h,d,Math.min(.012,h/5,d/5)),mat,parent,x,y,z);}
    function pin(parent,x,y,z,h){return mesh(new T.CylinderGeometry(.007,.007,h,12),brass,parent,x,y+h/2,z);}
    function batchStudy(root){
      root.updateMatrixWorld(true);const inverse=new T.Matrix4().copy(root.matrixWorld).invert(),sets=new Map();
      root.traverse(o=>{if(o.isMesh&&!o.material.transparent){if(!sets.has(o.material))sets.set(o.material,[]);sets.get(o.material).push(o);}});
      sets.forEach((objects,material)=>{if(objects.length<2)return;const arrays={position:[],normal:[],uv:[]};
        objects.forEach(o=>{const geometry=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geometry.applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld));Object.keys(arrays).forEach(key=>{const attr=geometry.getAttribute(key);for(let k=0;k<attr.array.length;k++)arrays[key].push(attr.array[k]);});geometry.dispose();o.parent.remove(o);});
        const geometry=new T.BufferGeometry();Object.keys(arrays).forEach(key=>geometry.setAttribute(key,new T.Float32BufferAttribute(arrays[key],key==='uv'?2:3)));const merged=new T.Mesh(geometry,material);merged.name='Décor statique regroupé';merged.castShadow=merged.receiveShadow=true;root.add(merged);
      });
    }
    const displays=MAISON.showcases.map((config,i)=>{
      const group=new T.Group();group.name='Vitrine / '+config.id;group.position.set(anchors.side(i)*1.5,0,anchors.Zs[i+1]-3.2);group.userData={showcaseId:config.id,status:'composition-study',modelsPending:true};scene.add(group);
      block(group,1.3,1,1.1,walnut,0,.5,0);block(group,1.36,.045,1.16,trimBrass,0,.99,0);block(group,1.38,.065,1.18,stone,0,1.045,0);block(group,1.32,.035,1.12,trimBrass,0,.045,0);
      const top=new T.Group();top.position.y=1.09;group.add(top);
      const deck=velvet.clone();deck.color.set(0x9d8b70).convertSRGBToLinear();deck.roughness=.98;deck.envMapIntensity=.02;deck.normalScale.set(.008,.008);
      window.maisonDisplayAssetsReady.then(()=>{deck.map=velvet.map;deck.normalMap=velvet.normalMap;deck.roughnessMap=velvet.roughnessMap;deck.needsUpdate=true;}).catch(()=>{});
      const lining=block(group,1.24,.012,1.04,deck,0,1.084,0);lining.name='Fond textile mat du plateau de marbre';
      // Clear protective panes; their decorative contents are independent of products.
      const glass=new T.MeshPhysicalMaterial({color:0xffffff,opacity:.018,transparent:true,roughness:.09,depthWrite:false,side:T.FrontSide,envMapIntensity:.16});
      const enclosure=new T.Group();enclosure.name='Cinq panneaux de verre sans superposition';group.add(enclosure);
      const pane=(w,h,x,y,z,rx,ry)=>{const p=mesh(new T.PlaneGeometry(w,h),glass,enclosure,x,y,z);p.rotation.set(rx||0,ry||0,0);p.castShadow=false;return p;};
      pane(1.28,.92,0,1.55,.54);pane(1.28,.92,0,1.55,-.54,0,Math.PI);pane(1.08,.92,-.64,1.55,0,0,-Math.PI/2);pane(1.08,.92,.64,1.55,0,0,Math.PI/2);pane(1.28,1.08,0,2.01,0,-Math.PI/2,0);
      // Butt joints: no coplanar overlapping crown faces at the four corners.
      [-.635,.635].forEach(x=>[-.535,.535].forEach(z=>block(group,.009,.9105,.009,trimBrass,x,1.54525,z)));
      [-.535,.535].forEach(z=>block(group,1.28,.009,.009,trimBrass,0,2.005,z));[-.635,.635].forEach(x=>block(group,.009,.009,1.061,trimBrass,x,2.005,0));
      const led=new T.MeshBasicMaterial({color:0xffd3a0,toneMapped:false});led.color.convertSRGBToLinear();block(group,1.21,.004,.007,led,0,1.994,-.518);
      const study=new T.Group();study.name='Supports définitifs';top.add(study);
      if(i===1){
        [.22,-.2].forEach((z,k)=>{const bar=mesh(new T.CylinderGeometry(.042,.042,.94,48),velvet,study,0,.22+k*.21,z);bar.rotation.z=Math.PI/2;[-.34,.34].forEach(x=>pin(study,x,0,z,.22+k*.21));});study.rotation.y=-.215;
      } else if(i===2){
        [[0,.24,-.08],[-.46,.07,.20],[.46,.09,.20],[-.23,.14,-.17],[.23,.17,-.17]].forEach(([x,h,z])=>block(study,.18,h,.18,velvet,x,h/2,z));
      }
      if(i===1||i===2){const remove=[];study.traverse(o=>{if((i===1&&o.isMesh&&o.geometry.type==='TorusGeometry')||(i===2&&o.isGroup&&o!==study))remove.push(o);});remove.forEach(o=>o.parent&&o.parent.remove(o));}
      batchStudy(study);
      const modelRoot=new T.Group();modelRoot.name='Emplacements GLB';top.add(modelRoot);
      const slots=[];
      config.modelSlots.forEach(slot=>{
        const anchor=new T.Group();anchor.name=slot.role;anchor.position.fromArray(slot.position);anchor.userData={...slot,pending:!slot.url};modelRoot.add(anchor);
        if(slot.url)slots.push(new Promise((resolve,reject)=>gltf.load(slot.url,result=>{const model=result.scene;const bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());model.position.sub(new T.Vector3(center.x,bounds.min.y,center.z));const fit=new T.Group();fit.add(model);fit.scale.setScalar(slot.height/size.y);anchor.add(fit);study.visible=false;anchor.userData.pending=false;resolve();},undefined,reject)));
      });
      // Keep a stable target for the existing focus-light animation.
      const composition=window.loadMaisonShowcaseComposition(T,scene,group,architecture,{velvet,walnut,brass,stone},i,study);
      const ready=Promise.all([composition,...slots]);
      pending.set(group,{ready,start:composition.start});
      ready.then(()=>pending.delete(group),()=>{});
      const target=new T.Group();target.position.set(group.position.x,1.62,group.position.z);scene.add(target);target.userData.display=group;
      return target;
    });
    window.maisonPilotAssetsReady=Promise.all([window.maisonDisplayAssetsReady,...window.maisonModelLoads]);
    // The glass enclosure bounds include every authored composition. Fog makes
    // distant displays irrelevant to the current view, not to later navigation.
    const frustum=new T.Frustum(),matrix=new T.Matrix4();
    function needed(camera){
      camera.updateMatrixWorld(true);
      frustum.setFromProjectionMatrix(matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
      return Array.from(pending.keys()).filter(group=>{
        const bounds=new T.Box3(new T.Vector3(-.7,0,-.6),new T.Vector3(.7,2.1,.6)).translate(group.position);
        if(!frustum.intersectsBox(bounds))return false;
        const viewBounds=bounds.clone().applyMatrix4(camera.matrixWorldInverse);
        return -viewBounds.max.z<(scene.fog?scene.fog.far:camera.far);
      });
    }
    return {displays,brass,readyForView:camera=>Promise.all(needed(camera).map(group=>{const item=pending.get(group);item.start();return item.ready;})),isReadyForView:camera=>needed(camera).length===0,preloadRest:()=>pending.forEach(item=>item.start())};
  };
})();
