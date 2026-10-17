/* Replaceable display studies. No parametric study is labelled a final model.
   modelSlots accept licensed, locally hosted GLBs without changing tour anchors. */
(function () {
  window.createMaisonShowcases = function (T, scene, architecture, build, anchors) {
    const loader = new T.TextureLoader(), gltf = new T.GLTFLoader();
    const velvet = new T.MeshPhysicalMaterial({color:0x181715,roughness:.94,metalness:0,sheen:new T.Color(.12,.1,.08)});
    const walnut = new T.MeshStandardMaterial({color:0x3c3026,roughness:.38,metalness:0});
    const brass = new T.MeshStandardMaterial({color:0xc8ad78,metalness:1,roughness:.3,envMapIntensity:.5});
    const stone = architecture.wallBase;
    architecture.ready.then(() => {brass.envMap=architecture.brass.envMap;brass.needsUpdate=true;});
    [velvet,walnut,brass].forEach(m=>m.color.convertSRGBToLinear());
    window.maisonDisplayAssetsReady = Promise.all([
      ...[[velvet,'velvet'],[walnut,'walnut']].flatMap(([mat,name])=>['color','normal','roughness'].map(kind=>new Promise((resolve,reject)=>{
        loader.load('/assets/materials/'+name+'-'+kind+'.webp',map=>{
          map.encoding=kind==='color'?T.sRGBEncoding:T.LinearEncoding;map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(2,2);map.anisotropy=4;
          mat[kind==='color'?'map':kind==='normal'?'normalMap':'roughnessMap']=map;
          if(kind==='normal')mat.normalScale.set(.1,.1);mat.needsUpdate=true;resolve();
        },undefined,reject);
      }))),
      ...['normal','roughness'].map(kind=>new Promise((resolve,reject)=>loader.load('/assets/materials/brass-'+kind+'.webp',map=>{
        map.wrapS=map.wrapT=T.RepeatWrapping;map.repeat.set(1,4);brass[kind==='normal'?'normalMap':'roughnessMap']=map;brass.normalScale.set(.06,.06);brass.needsUpdate=true;resolve();
      },undefined,reject)))
    ]).catch(error=>console.error('Matériaux des présentoirs indisponibles',error));
    const mesh=(geometry,material,parent,x=0,y=0,z=0)=>{const o=new T.Mesh(geometry,material);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;};
    function rounded(w,h,d,r=.015){const s=new T.Shape();s.moveTo(-w/2+r,-h/2+r);s.lineTo(w/2-r,-h/2+r);s.lineTo(w/2-r,h/2-r);s.lineTo(-w/2+r,h/2-r);s.closePath();const g=new T.ExtrudeGeometry(s,{depth:d-r*2,bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:3,steps:1});g.translate(0,0,-d/2+r);return g;}
    function block(parent,w,h,d,mat,x,y,z){return mesh(rounded(w,h,d,Math.min(.012,h/5,d/5)),mat,parent,x,y,z);}
    function pin(parent,x,y,z,h){return mesh(new T.CylinderGeometry(.007,.007,h,12),brass,parent,x,y+h/2,z);}
    function ring(parent,type,x,y,z,scale){const p=MAISON.products.find(p=>p.type===type)||MAISON.products[0];const o=build(p);o.scale.setScalar(scale);o.position.set(x,y,z);parent.add(o);return o;}
    function necklace(parent,x,y,z,scale){const g=new T.Group();g.position.set(x,y,z);g.scale.setScalar(scale);const points=[];for(let k=0;k<=48;k++){const a=Math.PI*k/48;points.push(new T.Vector3(Math.cos(a)*.22,-Math.sin(a)*.29,.015+Math.sin(a)*.018));}const curve=new T.CatmullRomCurve3(points);mesh(new T.TubeGeometry(curve,48,.0035,6,false),brass,g);mesh(new T.SphereGeometry(.024,16,12),brass,g,0,-.31,.035);parent.add(g);}
    function plaque(text,parent,y){const c=document.createElement('canvas');c.width=768;c.height=96;const ctx=c.getContext('2d');ctx.fillStyle='#d9bf8a';ctx.textAlign='center';ctx.font='24px sans-serif';ctx.fillText(text,384,53);const map=new T.CanvasTexture(c);map.encoding=T.sRGBEncoding;const p=mesh(new T.PlaneGeometry(.95,.12),new T.MeshBasicMaterial({map,transparent:true,depthWrite:false}),parent,0,y,.563);p.name='Étude de composition — modèles à valider';}
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
      block(group,1.3,1,1.1,walnut,0,.5,0);block(group,1.36,.045,1.16,brass,0,.99,0);block(group,1.38,.065,1.18,stone,0,1.045,0);block(group,1.32,.035,1.12,brass,0,.045,0);
      const top=new T.Group();top.position.y=1.09;group.add(top);
      const deck=velvet.clone();deck.color.set(0x9d8b70).convertSRGBToLinear();deck.roughness=.98;deck.envMapIntensity=.02;deck.normalScale.set(.008,.008);
      window.maisonDisplayAssetsReady.then(()=>{deck.map=velvet.map;deck.normalMap=velvet.normalMap;deck.roughnessMap=velvet.roughnessMap;deck.needsUpdate=true;});
      const lining=block(group,1.24,.012,1.04,deck,0,1.084,0);lining.name='Fond textile mat du plateau de marbre';
      // Clear protective panes; their decorative contents are independent of products.
      const glass=new T.MeshPhysicalMaterial({color:0xffffff,opacity:.018,transparent:true,roughness:.09,depthWrite:false,side:T.FrontSide,envMapIntensity:.16});
      const enclosure=new T.Group();enclosure.name='Cinq panneaux de verre sans superposition';group.add(enclosure);
      const pane=(w,h,x,y,z,rx,ry)=>{const p=mesh(new T.PlaneGeometry(w,h),glass,enclosure,x,y,z);p.rotation.set(rx||0,ry||0,0);p.castShadow=false;return p;};
      pane(1.28,.92,0,1.55,.54);pane(1.28,.92,0,1.55,-.54,0,Math.PI);pane(1.08,.92,-.64,1.55,0,0,-Math.PI/2);pane(1.08,.92,.64,1.55,0,0,Math.PI/2);pane(1.28,1.08,0,2.01,0,-Math.PI/2,0);
      [-.635,.635].forEach(x=>[-.535,.535].forEach(z=>block(group,.009,.92,.009,brass,x,1.55,z)));
      [-.535,.535].forEach(z=>block(group,1.28,.009,.009,brass,0,2.005,z));[-.635,.635].forEach(x=>block(group,.009,.009,1.08,brass,x,2.005,0));
      const led=new T.MeshBasicMaterial({color:0xffd3a0,toneMapped:false});led.color.convertSRGBToLinear();block(group,1.21,.004,.007,led,0,1.994,-.518);
      const study=new T.Group();study.name='Étude provisoire';top.add(study);
      if(i===0){
        // Jewelry outlines preserve the intended bust silhouette without fabricating
        // a coarse torso in place of the required professional scanned model.
        necklace(study,0,.72,-.08,1.3);necklace(study,0,.72,-.06,1.65);necklace(study,-.36,.42,.14,.7);necklace(study,.37,.49,.1,.8);
        [-.36,0,.37].forEach((x,k)=>pin(study,x,0,k===1?-.13:.09,k===1?.72:.48));
      } else if(i===1){
        [-.16,.2].forEach((z,k)=>{const bar=mesh(new T.CylinderGeometry(.047,.047,.94,48),velvet,study,0,.23+k*.18,z);bar.rotation.z=Math.PI/2;[-.34,.34].forEach(x=>pin(study,x,0,z,.23+k*.18));for(let j=0;j<5;j++){const b=mesh(new T.TorusGeometry(.081,.006,8,40),brass,study,-.33+j*.16,.23+k*.18,z);b.rotation.y=Math.PI/2;}});
      } else if(i===2){
        [[0,.18,0],[-.35,.07,.2],[.35,.1,.18],[-.27,.12,-.23],[.27,.08,-.24]].forEach(([x,h,z],k)=>{block(study,.18,h,.18,velvet,x,h/2,z);ring(study,k%2?'ring':'ring2',x,h+.10,z,.19);});
      } else if(i===3){
        [-.33,0,.33].forEach((x,k)=>{const h=.43+(k%2)*.22;block(study,.21,.025,.16,stone,x,.014,0);pin(study,x,.025,0,h);const bar=pin(study,x,.025+h/2,0,.24);bar.rotation.z=Math.PI/2;bar.position.y=h+.025;ring(study,'ear',x,h-.10,.015,.4);});
      } else if(i===4){
        // Intentionally empty: a convincing anatomical foot is not approximated.
        block(study,.7,.045,.54,velvet,0,.025,0);
      } else {
        necklace(study,-.17,.67,-.12,1.2);pin(study,-.17,0,-.15,.67);
        pin(study,.35,0,-.07,.47);ring(study,'ear',.35,.43,-.04,.34);
        block(study,.2,.12,.18,velvet,.34,.06,.25);ring(study,'ring',.34,.21,.25,.19);
        const roller=mesh(new T.CylinderGeometry(.065,.065,.38,40),velvet,study,-.27,.12,.26);roller.rotation.z=Math.PI/2;for(let k=0;k<3;k++){const b=mesh(new T.TorusGeometry(.071,.006,8,36),brass,study,-.39+k*.12,.12,.26);b.rotation.y=Math.PI/2;}
      }
      if(i===1||i===2){const remove=[];study.traverse(o=>{if((i===1&&o.isMesh&&o.geometry.type==='TorusGeometry')||(i===2&&o.isGroup&&o!==study))remove.push(o);});remove.forEach(o=>o.parent&&o.parent.remove(o));}
      batchStudy(study);
      const modelRoot=new T.Group();modelRoot.name='Emplacements GLB';top.add(modelRoot);
      config.modelSlots.forEach(slot=>{
        const anchor=new T.Group();anchor.name=slot.role;anchor.position.fromArray(slot.position);anchor.userData={...slot,pending:!slot.url};modelRoot.add(anchor);
        if(slot.url)gltf.load(slot.url,result=>{const model=result.scene;const bounds=new T.Box3().setFromObject(model),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());model.position.sub(new T.Vector3(center.x,bounds.min.y,center.z));const fit=new T.Group();fit.add(model);fit.scale.setScalar(slot.height/size.y);anchor.add(fit);study.visible=false;anchor.userData.pending=false;},undefined,error=>console.error('Chargement du présentoir : '+slot.role,error));
      });
      // Keep a stable target for the existing focus-light animation.
      window.loadMaisonShowcaseComposition(T,scene,group,architecture,{velvet,walnut,brass,stone},i,study);
      const target=new T.Group();target.position.set(group.position.x,1.62,group.position.z);scene.add(target);target.userData.display=group;
      return target;
    });
    window.maisonPilotAssetsReady=Promise.all([window.maisonDisplayAssetsReady,...window.maisonModelLoads]);
    return {displays,brass};
  };
})();
