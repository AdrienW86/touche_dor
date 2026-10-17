/* Surface refinements inside the existing architectural envelopes. */
(function(){
  window.refineMaisonArchitecture=function(T,scene,renderer,architecture){
    const group=new T.Group();group.name='Habillages noyer, marbre et champagne';scene.add(group);
    const load=(name,color)=>window.loadMaisonTexture(T,'/assets/materials/'+name+'.webp',color).then(map=>{map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=4;return map;});
    const wood=architecture.wallUpper,metal=architecture.brass;
    const batches=new Map();
    function box(w,h,d,x,y,z,mat){
      const geo=new T.BoxGeometry(w,h,d).toNonIndexed();geo.translate(x,y,z);
      const p=geo.attributes.position,n=geo.attributes.normal,uv=geo.attributes.uv;
      for(let i=0;i<p.count;i++){if(Math.abs(n.getX(i))>.9)uv.setXY(i,-p.getZ(i)/2.4,p.getY(i)/2.4);else uv.setXY(i,p.getX(i)/2.4,-p.getZ(i)/2.4);}
      if(!batches.has(mat))batches.set(mat,[]);batches.get(mat).push(geo);
    }
    const glow=new T.MeshBasicMaterial({color:0xffcc8a,toneMapped:false});glow.color.convertSRGBToLinear();
    // Preserve the wall's original vertex positions and all outer faces. Its
    // interior face becomes a recessed backing and ribs INSIDE the same 10cm.
    scene.children.filter(o=>o.isMesh&&o.userData.architectureSurface==='wallUpper').forEach(o=>{
      const s=Math.sign(o.position.x);o.geometry=o.geometry.clone();o.geometry.groups=o.geometry.groups.filter(g=>g.materialIndex!==(s<0?0:1));
      // Single material meshes ignore groups, so retain the other five index sets.
      const index=o.geometry.index,indices=[];o.geometry.groups.forEach(g=>{for(let i=g.start;i<g.start+g.count;i++)indices.push(index.getX(i));});o.geometry.setIndex(indices);o.geometry.clearGroups();
      box(.055,2.72,44,s*2.95,2.60,-14,wood);
      for(let z=7.95;z>-35.98;z-=.035){let nearColumn=false;for(let k=0;k<8;k++)if(Math.abs(z-(5-k*6))<.62)nearColumn=true;if(!nearColumn)box(.022,2.70,.022,s*2.911,2.60,z,wood);}
    });
    // Replace broad brass backing slabs by narrow architectural profiles.
    scene.children.forEach(o=>{if(!o.isMesh)return;const p=o.geometry.parameters||{};
      if(p.width===.05&&p.height===2.3&&p.depth===1.3)o.visible=false;
      if(o.isMesh&&o.geometry.type==='PlaneGeometry'&&p.width===1.1&&p.height===2.1&&Math.abs(o.position.x)===2.85)o.material=architecture.wallBase;
    });
    for(let k=0;k<7;k++)[-1,1].forEach(s=>{const z=2-k*6;
      [-.558,.558].forEach(d=>box(.016,2.14,.016,s*2.846,2.35,z+d,metal));
      [1.28,3.42].forEach(y=>box(.016,.016,1.132,s*2.846,y,z,metal));
      box(.012,.009,1.07,s*2.84,3.393,z,glow);
    });
    for(let k=0;k<8;k++)[-1,1].forEach(s=>{const z=5-k*6;
      [-.204,.204].forEach(dx=>[-.204,.204].forEach(dz=>box(.008,3.65,.008,s*2.75+dx,1.95,z+dz,metal)));
      [.125,3.775].forEach(y=>{box(.425,.009,.425,s*2.75,y,z,metal);});
    });
    // Fine seams on the original lower marble panels; no corridor narrowing.
    [-1,1].forEach(s=>{for(let z=6;z>-36;z-=3)box(.006,1.08,.009,s*2.897,.64,z,metal);});
    batches.forEach((parts,material)=>{const geo=new T.BufferGeometry();['position','normal','uv'].forEach(key=>{let length=0;parts.forEach(g=>length+=g.attributes[key].array.length);const data=new Float32Array(length);let at=0;parts.forEach(g=>{data.set(g.attributes[key].array,at);at+=g.attributes[key].array.length;});geo.setAttribute(key,new T.BufferAttribute(data,key==='uv'?2:3));});parts.forEach(g=>g.dispose());const mesh=new T.Mesh(geo,material);mesh.name=material===wood?'Rainures réelles et fonds noyer':material===glow?'Éclairage indirect des niches':'Profilés et joints champagne';mesh.receiveShadow=true;mesh.castShadow=false;group.add(mesh);});
    // Three broad, low-intensity emitters beneath existing ceiling crosspieces.
    // Their soft downward light replaces no existing architectural light point.
    [3,-9,-21].forEach(z=>{const light=new T.RectAreaLight(0xffffff,1.25,4.2,.07);light.color.setRGB(1,.68,.39);light.position.set(0,3.80,z);light.rotation.x=-Math.PI/2;light.name='Bain chaud sous traverse';group.add(light);});
    const finish=Promise.all([architecture.ready,load('walnut-color',true),load('walnut-normal',false),load('walnut-roughness',false),load('brass-normal',false),load('brass-roughness',false)]).then(([,color,normal,rough,bnormal,brough])=>{
      wood.map=color;wood.normalMap=normal;wood.roughnessMap=rough;wood.color.set(0x463124).convertSRGBToLinear();wood.normalScale.set(.035,.035);wood.roughness=.72;wood.needsUpdate=true;
      metal.normalMap=bnormal;metal.normalScale.set(.025,.025);metal.roughnessMap=brough;metal.roughness=.34;metal.needsUpdate=true;
      architecture.column.color.set(0xc6b89e).convertSRGBToLinear();architecture.column.normalScale.set(.025,.025);architecture.column.roughness=.82;
      // Grade the REAL Marble016 albedo: retain its photographed veins, maps
      // and UV continuity; suppress small flecks and tint major veins warm.
      [architecture.floor,architecture.runner,architecture.wallBase].forEach((mat,i)=>{
        mat.color.set(0xffffff);mat.roughness=i===1?.55:.45;mat.clearcoat=.04;mat.clearcoatRoughness=.3;mat.normalScale.set(.018,.018);mat.envMapIntensity=i===2?.045:.015;
        mat.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
          float veinSignal=dot(diffuseColor.rgb,vec3(.2126,.7152,.0722));
          float majorVein=smoothstep(.17,.55,veinSignal);
          diffuseColor.rgb=mix(vec3(.008,.007,.006),vec3(.42,.31,.15),majorVein)*mix(.85,1.08,clamp(veinSignal*2.0,0.0,1.0));`);};
        mat.customProgramCacheKey=()=> 'maison-black-warm-marble-v1';mat.needsUpdate=true;
      });
      renderer.shadowMap.needsUpdate=true;
      return group;
    });
    const sconces=window.installMaisonSconceFamily(T,scene,architecture,finish);
    window.maisonArchitecturalReady=Promise.all([finish,sconces]);
    window.maisonPilotAssetsReady=Promise.all([window.maisonPilotAssetsReady,window.maisonArchitecturalReady]).then(()=>{renderer.shadowMap.needsUpdate=true;return group;});
    return window.maisonArchitecturalReady;
  };
})();
