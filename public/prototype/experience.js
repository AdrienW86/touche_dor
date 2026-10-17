/* One native document scroll. Existing tour occupies the same eight viewport
   heights as the original 900vh document; new camera motion starts after it. */
(function(){
  window.createMaisonExperience=function(T,scene,renderer,cam,architecture){
    const $=id=>document.getElementById(id),cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
    const smooth=v=>{v=cl(v);return v*v*(3-2*v);};
    const url=MAISON.brand.logo,width=3.8,height=width/MAISON.brand.aspect;
    const logoMaterial=new T.MeshBasicMaterial({transparent:true,toneMapped:false,fog:false});
    const logo=new T.Mesh(new T.PlaneGeometry(width,height),logoMaterial);logo.name='Logo original Touche d’Or';logo.position.set(0,1.85,-35.72);scene.add(logo);
    const logoReady=new Promise((resolve,reject)=>new T.TextureLoader().load(url,map=>{map.encoding=T.sRGBEncoding;map.anisotropy=8;logoMaterial.map=map;logoMaterial.needsUpdate=true;resolve();},undefined,reject));
    window.maisonLogoReady=logoReady;
    logoReady.catch(error=>console.error('Logo original indisponible',error));
    const wall=new T.Mesh(new T.BoxGeometry(6,4,.15),architecture.wallBase);wall.position.set(0,2,-35.9);wall.name='Mur de marque';wall.receiveShadow=true;scene.add(wall);
    const warm=new T.MeshBasicMaterial({color:0xcaaa6a,toneMapped:false});warm.color.convertSRGBToLinear();
    [[4.02,.018,0,.48],[4.02,.018,0,3.22],[.018,2.76,-2,1.85],[.018,2.76,2,1.85]].forEach(([w,h,x,y])=>{const m=new T.Mesh(new T.BoxGeometry(w,h,.012),warm);m.position.set(x,y,-35.79);scene.add(m);});
    document.querySelectorAll('[data-brand-image]').forEach(img=>{img.crossOrigin='anonymous';img.src=url;img.alt=MAISON.brand.name+' · Bijouterie';});
    const bridge=$('logo-bridge'),image=$('bridge-logo'),background=$('bridge-background');image.crossOrigin='anonymous';image.src=url;image.alt='';
    const reveal=document.createElement('div');reveal.className='bridge-discovery discovery';
    const copy=document.querySelector('.discovery .copy').cloneNode(true);
    copy.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
    reveal.append(copy);reveal.inert=true;bridge.insertBefore(reveal,image);
    let progress=scrollY/innerHeight,requested=false,visible=true,phase='entrance';
    let tourEndPosition=new T.Vector3(),tourEndQuaternion=new T.Quaternion();
    const endCamera=new T.PerspectiveCamera();
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    function projectLogo(){
      cam.updateMatrixWorld(true);
      const points=[new T.Vector3(-width/2,height/2,0),new T.Vector3(width/2,-height/2,0)].map(p=>{logo.localToWorld(p);p.project(cam);return{x:(p.x*.5+.5)*innerWidth,y:(-.5*p.y+.5)*innerHeight};});
      return{left:(points[0].x+points[1].x)/2,top:(points[0].y+points[1].y)/2,width:Math.abs(points[1].x-points[0].x),height:Math.abs(points[1].y-points[0].y)};
    }
    function applyRect(r){image.style.left=r.left+'px';image.style.top=r.top+'px';image.style.width=r.width+'px';image.style.height=r.height+'px';}
    function state(next){if(next===phase)return;phase=next;document.documentElement.dataset.phase=next;$('phase-label').textContent=({entrance:'Entrée',showcases:'Les six collections',approach:'La signature Touche d’Or',zoom:'Au cœur de la Maison',transfer:'La signature',dezoom:'Découvrir les collections',html:''})[next];}
    function afterTour(p){
      const ratio=innerWidth/innerHeight,tan=Math.tan(T.MathUtils.degToRad(cam.fov/2));
      const distance=Math.max(height/(2*tan*.7),width/(2*tan*ratio*.84));
      const endZ=logo.position.z+distance,approachZ=Math.max(-30.4,endZ+1.4);
      const a=smooth((p-8)/1.5),zoom=smooth((p-9.5));
      const end=new T.Vector3(0,1.85,approachZ+(endZ-approachZ)*zoom);
      cam.position.copy(tourEndPosition).lerp(end,a);
      endCamera.position.copy(cam.position);endCamera.lookAt(logo.position);cam.quaternion.copy(tourEndQuaternion).slerp(endCamera.quaternion,a);
      if(p<9.5)state('approach');else if(p<10.5)state('zoom');else if(p<11)state('transfer');else if(p<12)state('dezoom');else state('html');
      const transfer=smooth((p-10.5)/.5),dezoom=smooth(p-11);
      const rect=projectLogo(),finalWidth=Math.min(360,innerWidth*.6);
      const final={left:innerWidth/2,top:innerHeight*.3,width:finalWidth,height:finalWidth/MAISON.brand.aspect};
      const mixed=Object.fromEntries(Object.keys(rect).map(key=>[key,rect[key]+(final[key]-rect[key])*dezoom]));
      applyRect(mixed);bridge.style.visibility=p>=10.5&&p<12?'visible':'hidden';
      image.style.opacity=String(transfer);background.style.opacity=String(smooth((p-10.8)/.2));
      reveal.style.opacity=String(smooth((p-11.55)/.45));
      // The opaque gold pixels stay present under the incoming identical image.
      // Fading both copies independently would dim them halfway through.
      logoMaterial.opacity=1;
      const sceneOpacity=1-smooth((p-10.8)/.7);
      $('c').style.opacity=sceneOpacity;$('fx').style.opacity=sceneOpacity;$('gr').style.opacity=sceneOpacity*.035;
      visible=p<11.6; // No GPU scene render behind the opaque HTML section.
      $('c').style.visibility=visible?'visible':'hidden';
      $('top').classList.toggle('classic',p>=11.5);
      document.querySelector('.hero-logo').style.visibility=p>=12?'visible':'hidden';
      // Useful state for accessibility, diagnostics and end-to-end verification.
      document.documentElement.dataset.phase=phase;
      return{phase,progress:p,logoRect:mixed,logo3DRect:rect,transfer,dezoom,render3D:visible};
    }
    function update(tourCallback){
      const target=scrollY/innerHeight;
      // Same .06 interpolation as the original. At reduced motion each frame
      // maps directly to native scroll; no autonomous camera/scroll tween.
      progress+=(target-progress)*(motion.matches?1:.06);
      if(Math.abs(target-progress)<.00005)progress=target;
      const f=Math.min(progress,8)/8*6;
      tourCallback(f); // Original camera formula and door animation, unchanged.
      let info;
      if(progress>8){
        tourEndPosition.copy(cam.position);tourEndQuaternion.copy(cam.quaternion);
        info=afterTour(progress);
      }else{
        state(f<.34?'entrance':'showcases');visible=true;logoMaterial.opacity=1;bridge.style.visibility='hidden';document.querySelector('.hero-logo').style.visibility='hidden';$('c').style.opacity=1;$('c').style.visibility='visible';$('fx').style.opacity=1;$('gr').style.opacity=.035;$('top').classList.remove('classic');info={phase,progress,render3D:true};
      }
      $('phase-label').hidden=progress>=12;
      $('bar').style.width=cl(progress/12)*100+'%';
      window.maisonExperienceState={...info,tourProgress:f/6,scrollY,renderCount:window.maisonExperienceState?.renderCount||0};
      return{f,progress,render3D:visible};
    }
    function classic(){progress=$('classic').offsetTop/innerHeight;scrollTo({top:$('classic').offsetTop,behavior:'instant'});$('classic').focus({preventScroll:true});}
    document.querySelectorAll('[data-classic]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();classic();}));
    // Do not prevent wheel, touch, keyboard or pointer events: native scrolling
    // remains the sole input controller, including reverse travel.
    addEventListener('scroll',()=>{requested=true;},{passive:true});
    return{update,classic,shouldTick(){const dirty=requested;requested=false;return dirty||Math.abs(progress-scrollY/innerHeight)>.00005;},isStill:()=>motion.matches};
  };
})();
