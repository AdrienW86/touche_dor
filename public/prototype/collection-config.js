/* Existing examples only. Replace this source with a verified catalogue adapter.
   Decorative scene objects never determine a product's price or availability. */
window.MAISON = {
  brand: { name: "Touche d’Or", logo: '/assets/branding/touche-dor.webp', aspect: 1.5,
    // Set logo to the original transparent PNG/WebP/SVG in /assets/branding/.
    // No approximate monogram is substituted for the supplied reference.
    contact: null, legal: null, terms: null, privacy: null, shipping: null, returns: null, socials: [] },
  mode: 'demo',
  products: [
    {id:'aurore',name:'Bague Aurore',cat:'Bagues',desc:'Or rose, saphir rose',price:890,type:'ring',metal:0xe8a28e,gem:0xff7fb0},
    {id:'lune',name:'Collier Lune',cat:'Colliers',desc:'Or jaune, perle de culture',price:640,type:'neck',metal:0xe9bd6b,gem:0xf7f1ea},
    {id:'etoile',name:'Boucles Étoile',cat:"Boucles d’oreilles",desc:'Or blanc, topaze bleue',price:420,type:'ear',metal:0xe9e9f2,gem:0x6fd8ff},
    {id:'soleil',name:'Bracelet Soleil',cat:'Bracelets',desc:'Or jaune, citrines',price:760,type:'brac',metal:0xe9bd6b,gem:0xffc24d},
    {id:'nuit',name:'Bague Nuit',cat:'Bagues',desc:'Or blanc, saphir bleu',price:1150,type:'ring2',metal:0xe9e9f2,gem:0x5f8bff},
    {id:'coeur',name:'Collier Cœur',cat:'Colliers',desc:'Or rose, rubis',price:530,type:'heart',metal:0xe8a28e,gem:0xe0305a}
  ].map(product => ({...product, demo:true, photo:null, stock:null})),
  showcases: [
    {id:'colliers',category:'Colliers',name:'Colliers & sautoirs',description:'Lignes fines et pendentifs, autour d’un buste central.',productIds:['lune','coeur'],decor:['neck','heart'],modelSlots:[{role:'buste principal',url:null,height:.72,position:[0,0,-.08]},{role:'buste secondaire',url:null,height:.4,position:[-.35,0,.12]}],lighting:{intensity:1.8,color:0xffdeb0,angle:.42}},
    {id:'bracelets',category:'Bracelets',name:'Bracelets & gourmettes',description:'Une composition horizontale sur plusieurs niveaux.',productIds:['soleil'],decor:['brac'],modelSlots:[{role:'rouleau velours double',url:null,height:.4,position:[0,0,0]}],lighting:{intensity:1.6,color:0xffe4c4,angle:.52}},
    {id:'bagues',category:'Bagues',name:'Bagues femme & homme',description:'Une pièce centrale et des bagues à différentes hauteurs.',productIds:['aurore','nuit'],decor:['ring','ring2'],modelSlots:[{role:'plots individuels de joaillerie',url:null,height:.22,position:[0,0,0]}],lighting:{intensity:1.7,color:0xffead6,angle:.38}},
    {id:'boucles',category:'Boucles d’oreilles',name:'Boucles d’oreilles',description:'Des silhouettes suspendues sur de fines lignes champagne.',productIds:['etoile'],decor:['ear'],modelSlots:[{role:'portants fins à boucles',url:null,height:.65,position:[0,0,0]}],lighting:{intensity:1.5,color:0xffe9cd,angle:.48}},
    {id:'chevilles',category:'Bijoux de cheville',name:'Bijoux de cheville',description:'Le support anatomique sera installé après sélection du modèle.',productIds:[],decor:[],modelSlots:[{role:'pied anatomique de présentation professionnel',url:null,height:.65,position:[0,0,0]}],lighting:{intensity:1.5,color:0xffdfb5,angle:.5}},
    {id:'ensembles',category:'Ensembles',name:'Ensembles tendance',description:'Collier, boucles, bracelet et bagues dans une même composition.',productIds:['lune','etoile','soleil','aurore'],decor:['neck','ear','brac','ring'],modelSlots:[{role:'buste pour ensemble',url:null,height:.6,position:[-.15,0,-.08]},{role:'portant et plots assortis',url:null,height:.35,position:[.3,0,.12]}],lighting:{intensity:1.8,color:0xffe3bd,angle:.54}}
  ]
};
