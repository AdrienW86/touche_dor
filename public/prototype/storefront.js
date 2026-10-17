(function(){
  window.createMaisonStorefront=function(){
    const config=window.MAISON,$=id=>document.getElementById(id),demo=config.mode==='demo';
    const products=config.products,shows=config.showcases,indices=shows.map(()=>0);
    let active=-1,filter='all',detailList=[],detailIndex=0,cart={};
    const focusOrigins=new WeakMap();
    try{cart=JSON.parse(localStorage.getItem('maison-cart-v1')||'{}');}catch{}
    cart=Object.fromEntries(Object.entries(cart).filter(([id,qty])=>products.some(p=>p.id===id)&&Number.isInteger(qty)&&qty>0&&qty<=99));
    const money=value=>value.toLocaleString('fr-FR',{style:'currency',currency:'EUR'});
    const safe=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const price=p=>demo?'Exemple · '+money(p.price):money(p.price);
    const photo=p=>p.photo?`<img src="${safe(p.photo)}" alt="${safe(p.name)}" loading="lazy">`:`<span class="photo-missing">Photo produit<br>à renseigner</span><small>Exemple de catalogue</small>`;
    const candidates=index=>shows[index].productIds.map(id=>products.find(p=>p.id===id)).filter(Boolean);
    function toast(message){$('toast').textContent=message;$('toast').classList.add('o');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').classList.remove('o'),2600);}
    function count(){return Object.values(cart).reduce((a,b)=>a+b,0);}
    function persist(){try{localStorage.setItem('maison-cart-v1',JSON.stringify(cart));}catch{}$('cartB').textContent=(demo?'Panier démo':'Panier')+' ('+count()+')';}
    function add(id){if(!products.some(p=>p.id===id))return;cart[id]=Math.min(99,(cart[id]||0)+1);persist();toast(demo?'Ajouté au panier de démonstration':'Ajouté au panier');if($('cart-dialog').open)drawCart();}
    function open(dialog){focusOrigins.set(dialog,document.activeElement);dialog.showModal();document.documentElement.style.overflowY='hidden';}
    document.querySelectorAll('dialog').forEach(dialog=>{
      dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.documentElement.style.overflowY='';const origin=focusOrigins.get(dialog);if(origin?.isConnected)origin.focus({preventScroll:true});});
      dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
      dialog.querySelector('[data-close]').onclick=()=>dialog.close();
    });
    function tile(p){return `<article class="product-tile"><div class="product-visual">${photo(p)}</div><h3>${safe(p.name)}</h3><p class="muted">${safe(p.cat)} · ${safe(p.desc)}</p><p class="muted">${price(p)}</p><div class="actions"><button data-detail="${safe(p.id)}">Voir le produit</button><button class="gold" data-add="${safe(p.id)}">${demo?'Ajouter · démo':'Ajouter au panier'}</button></div></article>`;}
    function drawCatalogue(){
      $('filters').innerHTML=[['all','Toutes les pièces'],...shows.map(s=>[s.id,s.category])].map(([id,label])=>`<button data-filter="${id}" aria-pressed="${filter===id}">${safe(label)}</button>`).join('');
      const list=filter==='all'?products:candidates(shows.findIndex(s=>s.id===filter));
      $('list').innerHTML=list.length?list.map(tile).join(''):'<p class="empty-state">Cette catégorie attend les produits et les photographies du catalogue réel.</p>';
      $('catalogue-title').textContent=filter==='all'?'Toutes les pièces':shows.find(s=>s.id===filter).name;
    }
    function catalogue(category='all'){filter=category;drawCatalogue();open($('catalogue'));}
    function drawCard(){
      if(active<0)return;const s=shows[active],list=candidates(active),p=list[indices[active]%Math.max(1,list.length)];
      $('ch').textContent='Vitrine '+String(active+1).padStart(2,'0')+' / 06 · '+s.category;
      $('nm').textContent=p?p.name:s.name;$('mt').textContent=p?p.desc:'Catalogue à renseigner';$('pr').textContent=p?price(p):'Aucun article en vente';
      $('card-count').textContent=list.length?(indices[active]+1)+' / '+list.length:'Aucun produit';
      $('card-prev').disabled=$('card-next').disabled=list.length<2;
      $('view-product').disabled=$('add').disabled=!p;
      $('card-pending').textContent=demo?'Démonstration · articles et tarifs non commerciaux.':'';
      if(p?.photo){$('card-photo').src=p.photo;$('card-photo').alt=p.name;$('card-photo').hidden=false;}else $('card-photo').hidden=true;
    }
    function detail(id,list=products){detailList=list;detailIndex=Math.max(0,list.findIndex(p=>p.id===id));drawDetail();open($('product-detail'));}
    function drawDetail(){const p=detailList[detailIndex];$('detail-photo').innerHTML=photo(p);$('detail-title').textContent=p.name;$('detail-category').textContent=p.cat;$('detail-description').textContent=p.desc;$('detail-price').textContent=price(p);$('detail-count').textContent=(detailIndex+1)+' / '+detailList.length;$('detail-prev').disabled=$('detail-next').disabled=detailList.length<2;$('detail-add').onclick=()=>add(p.id);}
    function drawCart(){
      const lines=products.filter(p=>cart[p.id]);$('cart-list').innerHTML=lines.length?lines.map(p=>`<div class="cart-line"><div>${safe(p.name)}<p class="muted">${price(p)}</p></div><div class="quantity"><button data-qty="${p.id}" data-delta="-1" aria-label="Retirer un ${safe(p.name)}">−</button><span>${cart[p.id]}</span><button data-qty="${p.id}" data-delta="1" aria-label="Ajouter un ${safe(p.name)}">+</button></div></div>`).join(''):'<p class="empty-state">Votre panier est vide.</p>';
      $('tot').textContent=money(lines.reduce((sum,p)=>sum+p.price*cart[p.id],0));
      $('out').disabled=true;$('out').textContent=demo?'Commande indisponible · démonstration':'Paiement non configuré';
    }
    $('allB').onclick=()=>catalogue();$('cartB').onclick=()=>{drawCart();open($('cart-dialog'));};
    $('add').onclick=()=>{const p=candidates(active)[indices[active]];if(p)add(p.id);};
    $('view-product').onclick=()=>{const list=candidates(active),p=list[indices[active]];if(p)detail(p.id,list);};
    [-1,1].forEach(direction=>{
      $(direction<0?'card-prev':'card-next').onclick=()=>{const list=candidates(active);indices[active]=(indices[active]+direction+list.length)%list.length;drawCard();};
      $(direction<0?'detail-prev':'detail-next').onclick=()=>{detailIndex=(detailIndex+direction+detailList.length)%detailList.length;drawDetail();if(active>=0){const index=candidates(active).findIndex(p=>p.id===detailList[detailIndex].id);if(index>=0){indices[active]=index;drawCard();}}};
    });
    document.addEventListener('click',event=>{
      const button=event.target.closest('button,a');if(!button)return;
      if(button.dataset.add)add(button.dataset.add);
      if(button.dataset.detail){const list=filter==='all'?products:candidates(shows.findIndex(s=>s.id===filter));detail(button.dataset.detail,list.length?list:products);}
      if(button.dataset.filter){filter=button.dataset.filter;drawCatalogue();}
      if(button.dataset.category){event.preventDefault();catalogue(button.dataset.category);}
      if(button.dataset.qty){const id=button.dataset.qty;cart[id]=Math.min(99,(cart[id]||0)+Number(button.dataset.delta));if(cart[id]<=0)delete cart[id];persist();drawCart();}
      if(button.dataset.catalogue!==undefined){event.preventDefault();catalogue();}
      if(button.dataset.tour!==undefined){event.preventDefault();scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
    });
    $('categories').innerHTML=shows.map((s,i)=>`<button class="category-tile" data-category="${s.id}"><small>Collection / 0${i+1}</small><div><h3>${safe(s.name)}</h3><span>Découvrir la sélection</span></div><span class="arrow" aria-hidden="true">↗</span></button>`).join('');
    $('selection-grid').innerHTML=products.slice(0,4).map(tile).join('');
    $('footer-categories').innerHTML=shows.map(s=>`<a href="#collections" data-category="${s.id}">${safe(s.category)}</a>`).join('');
    const legal=[['contact','Contact'],['legal','Mentions légales'],['terms','Conditions générales de vente'],['privacy','Confidentialité'],['shipping','Livraison'],['returns','Retours']];
    $('footer-links').innerHTML=legal.map(([key,label])=>config.brand[key]?`<a href="${safe(config.brand[key])}">${label}</a>`:`<span class="unconfigured">${label} · à renseigner</span>`).join('');
    $('socials').innerHTML=config.brand.socials.map(s=>`<a href="${safe(s.url)}" rel="noopener noreferrer">${safe(s.label)}</a>`).join('');
    persist();
    return {setActive(index,visible){if(index!==active){active=index;if(index>=0&&index<6)drawCard();}const card=$('card');card.style.opacity=visible?'1':'0';card.style.pointerEvents=visible?'auto':'none';card.inert=!visible;},catalogue,toast};
  };
})();
