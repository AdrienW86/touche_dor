/* Commercially licensed decorative meshes; never catalogue product geometry. */
(function(){
  const cache=new Map();window.maisonModelLoads=[];
  function source(T,name){const path=name==='bust'?'/assets/models/pilot/necklace-bust.glb':['stud','drop','hoops'].includes(name)?'/assets/models/showcase-finish/'+name+'.glb':'/assets/models/architecture/'+name+'.glb';if(!cache.has(path))cache.set(path,new Promise((resolve,reject)=>new T.GLTFLoader().load(path,g=>resolve(g.scene),undefined,reject)));return cache.get(path);}
  function palette(T,architecture,m){const gold=m.brass.clone();gold.color.set(0xd1b17b).convertSRGBToLinear();gold.roughness=.27;gold.envMap=architecture.brass.envMap;gold.envMapIntensity=.75;gold.normalMap=null;const silver=gold.clone();silver.color.set(0xd3d0c7).convertSRGBToLinear();const gem=new T.MeshPhysicalMaterial({color:0xe7e4db,roughness:.09,metalness:.03,clearcoat:.7,envMap:architecture.brass.envMap,envMapIntensity:1});const velvet=m.velvet.clone();velvet.color.set(0x14151a).convertSRGBToLinear();velvet.normalScale.set(.008,.008);velvet.roughness=.96;return{gold,silver,gem,velvet};}
  function dress(model,p,name){model.traverse(o=>{if(!o.isMesh)return;const mat=m=>{const n=m.name.toLowerCase();if(name==='pearls')return m;if(n.includes('diamond')||n.includes('gemstone'))return p.gem;if(n.includes('velvet')||n==='stand')return p.velvet;if(n.includes('walnut')||n.includes('wood'))return p.velvet;if(n.includes('platinum'))return p.silver;return p.gold;};o.material=Array.isArray(o.material)?o.material.map(mat):mat(o.material);o.castShadow=true;o.receiveShadow=true;});return model;}
  function place(T,root,template,size,x,y,z,rx=0,ry=0,rz=0){const model=template.clone(true),holder=new T.Group();model.rotation.set(rx,ry,rz);holder.add(model);model.updateMatrixWorld(true);const b=new T.Box3().setFromObject(model),v=b.getSize(new T.Vector3()),c=b.getCenter(new T.Vector3()),scale=size/Math.max(v.x,v.y,v.z);model.position.sub(new T.Vector3(c.x,b.min.y,c.z));holder.scale.setScalar(scale);holder.position.set(x,y,z);root.add(holder);return holder;}
  function cushion(T,root,m,w,h,d,x,y,z,holes=[]){const shape=new T.Shape(),r=Math.min(.012,w/8,h/4);shape.moveTo(-w/2+r,-h/2);shape.lineTo(w/2-r,-h/2);shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);shape.lineTo(w/2,h/2-r);shape.quadraticCurveTo(w/2,h/2,w/2-r,h/2);shape.lineTo(-w/2+r,h/2);shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);shape.lineTo(-w/2,-h/2+r);shape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);holes.forEach(([hx,hy])=>{const hole=new T.Path();hole.absarc(hx,hy,.0025,0,Math.PI*2,true);shape.holes.push(hole);});const g=new T.ExtrudeGeometry(shape,{depth:d-.004,bevelEnabled:true,bevelThickness:.002,bevelSize:holes.length?.0006:.002,bevelSegments:2,curveSegments:8});g.translate(0,0,-d/2+.002);const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;root.add(o);return o;}
  // Purpose-made padded cards, not jewelry approximations. All earrings below
  // are licensed authored GLBs, including actual prongs, hooks and clasps.
  function earringCard(T,root,p,w,height,x,z){const card=new T.Group();card.position.set(x,1.09,z);root.add(card);const velvet=p.velvet.clone();velvet.map=null;velvet.color.set(0x23252a).convertSRGBToLinear();velvet.roughness=.98;velvet.envMapIntensity=.03;
    cushion(T,card,velvet,w+.025,.025,.15,0,.0125,0);
    cushion(T,card,velvet,.044,height*.47,.035,0,height*.235,-.025);
    const spacing=height>.6?.074:height>.48?.073:height>.4?.064:.05,holeY=height>.48?height-.08:height>.4?height-.125:.2575;
    const panel=cushion(T,card,velvet,w,height*.68,.024,0,height*.66,0,[[-spacing,holeY-height*.66],[spacing,holeY-height*.66]]);panel.name='Carte capitonnée en velours anthracite';card.userData.pinHoles=[[-spacing,holeY],[spacing,holeY]];
    card.name='Présentoir vertical capitonné';card.userData.supportHeight=height;return card;
  }
  function bust(T,root,model,m,x,h,z,angle){const foot=cushion(T,root,m.stone,h*.62,.025,h*.5,x,1.1025,z);foot.name='Embase du buste';return place(T,root,model,h,x,1.115,z,0,angle);}
  function hang(T,root,template,size,x,y,z){const holder=place(T,root,template,size,0,0,0);holder.updateWorldMatrix(true,true);const inverse=new T.Matrix4().copy(root.matrixWorld).invert(),points=[];holder.traverse(o=>{if(!o.isMesh)return;const matrix=new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld),a=o.geometry.attributes.position;for(let k=0;k<a.count;k++)points.push(new T.Vector3().fromBufferAttribute(a,k).applyMatrix4(matrix));});const highest=Math.max(...points.map(p=>p.y)),top=points.filter(p=>p.y>highest-.0005),contact=top.reduce((sum,p)=>sum.add(p),new T.Vector3()).multiplyScalar(1/top.length);holder.position.set(x-contact.x,y-highest,z-contact.z);holder.userData.attachment=[x,y,z];return holder;}
  // Repeated static jewelry shares buffers and draw calls. Keep the cards and
  // semantic pair groups; no scene/camera changes or per-frame processing.
  function instanceRepeats(T,root){
    root.updateWorldMatrix(true,true);const inverse=new T.Matrix4().copy(root.matrixWorld).invert(),sets=new Map();
    root.traverseVisible(o=>{if(!o.isMesh||Array.isArray(o.material))return;const key=o.geometry.uuid+'/'+o.material.uuid;if(!sets.has(key))sets.set(key,[]);sets.get(key).push(o);});
    let saved=0;sets.forEach(objects=>{if(objects.length<2)return;const source=objects[0].geometry,geometry=new T.BufferGeometry(),bounds=new T.Box3();Object.keys(source.attributes).forEach(key=>geometry.setAttribute(key,source.attributes[key]));geometry.setIndex(source.index);source.groups.forEach(g=>geometry.addGroup(g.start,g.count,g.materialIndex));if(!source.boundingBox)source.computeBoundingBox();
      const instanced=new T.InstancedMesh(geometry,objects[0].material,objects.length);instanced.name='Bijoux répétés — géométrie partagée';instanced.castShadow=instanced.receiveShadow=true;instanced.frustumCulled=true;
      objects.forEach((o,k)=>{const matrix=new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld);instanced.setMatrixAt(k,matrix);bounds.union(source.boundingBox.clone().applyMatrix4(matrix));});
      // r128 frustum culling uses geometry bounds, not instance bounds.
      geometry.boundingBox=bounds;geometry.boundingSphere=bounds.getBoundingSphere(new T.Sphere());instanced.instanceMatrix.needsUpdate=true;objects.forEach(o=>o.parent.remove(o));root.add(instanced);saved+=objects.length-1;
    });root.userData.drawCallsSaved=saved;
  }
  window.loadMaisonShowcaseComposition=function(T,scene,display,architecture,m,i,study){
    const roles=[['bust'],['bracelet'],['ring'],['stud','drop','hoops'],['jewel-stand','chain'],['bust','ring','bracelet','stud']][i];
    let start;const requested=new Promise(resolve=>{start=resolve;});
    const ready=requested.then(()=>Promise.all([architecture.ready,window.maisonDisplayAssetsReady,...roles.map(role=>source(T,role))])).then(([, ,...assets])=>{
      const p=palette(T,architecture,m),models={};roles.forEach((name,k)=>models[name]=dress(assets[k].clone(true),p,name));
      if(i===4){const satin=p.gold.clone();satin.roughness=.62;satin.envMapIntensity=.2;satin.color.set(0xa58c66).convertSRGBToLinear();models['jewel-stand'].traverse(o=>{if(!o.isMesh)return;if(o.name.replace(/_/g,' ').startsWith('Earring cross rail'))o.visible=false;if(o.material===p.gold)o.material=satin;});}
      const decor=new T.Group();decor.name='Composition détaillée / '+MAISON.showcases[i].id;display.add(decor);
      if([0,3,4,5].includes(i))study.visible=false;
      if(i===0){bust(T,decor,models.bust,m,0,.71,-.18,.215);bust(T,decor,models.bust,m,-.40,.44,.20,.215);bust(T,decor,models.bust,m,.40,.51,.16,.215);}
      if(i===1){decor.rotation.y=-.215;[.22,-.2].forEach((z,k)=>{for(let j=0;j<4;j++)place(T,decor,models.bracelet,.135,-.30+j*.20,1.09+.22+k*.21-.0775,z,0,0,Math.PI/2);});}
      if(i===2){[[0,.24,-.08],[-.46,.07,.20],[.46,.09,.20],[-.23,.14,-.17],[.23,.17,-.17]].forEach(([x,h,z],k)=>place(T,decor,models.ring,k===0?.135:.105,x,1.09+h+.001,z,-.23,.215));}
      if(i===3){
        decor.rotation.y=-.215;
        const left=earringCard(T,decor,p,.29,.52,-.39,.10),center=earringCard(T,decor,p,.29,.68,0,-.13),right=earringCard(T,decor,p,.25,.43,.39,.10);
        const hoops=new T.Group();left.add(hoops);hoops.name='Paire de créoles pavées';hoops.userData={jewelryPair:true,elements:2,kind:'creoles'};[-.073,.073].forEach((x,k)=>place(T,hoops,models.hoops,.128,x,.52-.08-.128,.026,0,k?.08:-.08));
        const drops=new T.Group();center.add(drops);drops.name='Paire centrale de boucles pendantes';drops.userData={jewelryPair:true,elements:2,kind:'pendantes'};[-.074,.074].forEach(x=>place(T,drops,models.drop,.255,x,.68-.08-.255,.028));
        const studs=new T.Group();right.add(studs);studs.name='Paire de puces serties';studs.userData={jewelryPair:true,elements:2,kind:'puces'};[-.064,.064].forEach(x=>place(T,studs,models.stud,.070,x,.43-.16,.016));
      }
      if(i===4){decor.rotation.y=.215;place(T,decor,models['jewel-stand'],.58,0,1.09,-.07);hang(T,decor,models.chain,.26,-.12,1.09+.269/.36*.58,-.07-.037/.36*.58);hang(T,decor,models.chain,.24,.17,1.09+.357/.36*.58,-.07-.037/.36*.58);}
      if(i===5){
        bust(T,decor,models.bust,m,0,.62,-.16,-.215);
        cushion(T,decor,p.velvet,.23,.045,.20,-.36,1.1125,.23);place(T,decor,models.bracelet,.18,-.36,1.135,.23);
        cushion(T,decor,p.velvet,.17,.075,.17,.22,1.1275,.27);place(T,decor,models.ring,.105,.22,1.165,.27,-.23,-.215);
        const card=earringCard(T,decor,p,.20,.38,.39,-.06);card.rotation.y=-.215;
        const studs=new T.Group();card.add(studs);studs.name='Paire assortie de puces';studs.userData={jewelryPair:true,elements:2,kind:'puces'};[-.05,.05].forEach(x=>place(T,studs,models.stud,.055,x,.23,.016));
      }
      instanceRepeats(T,decor);
      display.userData.status='detailed-decorative-composition';display.userData.modelsPending=false;display.userData.decorativeOnly=true;display.userData.models=roles;
      return display;
    }).catch(error=>{console.error('Composition détaillée indisponible',i,error);throw error;});ready.start=start;if(i<4)start();window.maisonModelLoads.push(ready);return ready;
  };
  window.installMaisonSconceFamily=function(T,scene,architecture,finish){return Promise.all([source(T,'vertical-sconce'),architecture.ready,finish]).then(([model])=>{
    const group=new T.Group();group.name='Famille unique : appliques verticales montées';scene.add(group);
    const metal=architecture.brass.clone();metal.roughness=.34;metal.envMapIntensity=.4;
    const opal=new T.MeshStandardMaterial({color:0xe9dfcb,roughness:.55,emissive:0xffc88c,emissiveIntensity:.25});opal.color.convertSRGBToLinear();opal.emissive.convertSRGBToLinear();
    const ceramic=new T.MeshStandardMaterial({color:0xcfc6b1,roughness:.6});ceramic.color.convertSRGBToLinear();
    model.updateMatrixWorld(true);const size=new T.Box3().setFromObject(model).getSize(new T.Vector3()),scale=.78/size.y,mounts=[];
    for(let k=0;k<8;k++)[-1,1].forEach(s=>{const transform=new T.Object3D();transform.rotation.y=-s*Math.PI/2;transform.scale.setScalar(scale);transform.position.set(s*(2.539+.01707742177*scale),2.6562694083,5-k*6);transform.updateMatrix();mounts.push({matrix:transform.matrix.clone(),side:s,z:5-k*6,backplate:[s*2.539,2.5,5-k*6]});});
    model.traverse(o=>{if(!o.isMesh)return;const assign=m=>m.name==='glass_cy'?opal:m.name.includes('Ceramic')?ceramic:metal;const material=Array.isArray(o.material)?o.material.map(assign):assign(o.material);const mesh=new T.InstancedMesh(o.geometry,material,mounts.length);mesh.name='Appliques / '+o.name;mesh.frustumCulled=false;mesh.castShadow=false;mesh.receiveShadow=true;mounts.forEach((m,i)=>mesh.setMatrixAt(i,new T.Matrix4().multiplyMatrices(m.matrix,o.matrixWorld)));mesh.instanceMatrix.needsUpdate=true;group.add(mesh);});
    scene.traverse(o=>{if(!o.isMesh||o.isInstancedMesh)return;const p=o.geometry.parameters||{};if(Math.abs(Math.abs(o.position.x)-2.52)<.001&&o.position.y===2.5&&((p.width===.5&&p.height===.5&&p.depth===.06)||(p.width===.14&&p.height===.38)))o.visible=false;});
    group.userData={fixtureCount:16,mounts:mounts.map(({side,z,backplate})=>({side,z,backplate})),backGap:.001,approvedGeometry:'abd3d vertical-sconce',normalLeft:[1,0,0],normalRight:[-1,0,0]};return group;
  });};
})();
