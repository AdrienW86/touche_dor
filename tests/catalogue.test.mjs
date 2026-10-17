import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';
import basket from '../public/prototype/cart.js';
const config=JSON.parse(fs.readFileSync('public/prototype/collection-config.json','utf8'));
test('exactly the five validated references and prices',()=>{
 assert.deepEqual(config.products.map(p=>[p.reference,p.price]),[['TD-COL-001',25],['TD-COL-002',20],['TD-COL-003',20],['TD-SAU-001',25],['TD-BRA-001',20]]);
 assert.equal(new Set(config.products.map(p=>p.id)).size,5);assert.equal(new Set(config.products.map(p=>p.slug)).size,5);
 assert.equal(config.products.reduce((n,p)=>n+p.price,0),110);
 for(const p of config.products){assert.equal(p.material,'Acier inoxydable');assert.equal(p.color,'Doré');assert.equal(p.status,'published');assert(p.desc&&p.description&&p.cat&&p.subcategory);}
});
test('real photographs belong to their product folder',()=>{let photos=0;for(const p of config.products){assert(p.gallery.length);for(const image of p.gallery){for(const key of ['src','thumbnail']){assert(image[key].startsWith('/produits/'+p.id+'/'));assert(fs.existsSync('public'+image[key]));}assert(image.width>0&&image.height>0&&image.alt);photos++;}}assert.equal(photos,23);});
test('four necklaces, one bracelet, no fictitious products in the other showcases',()=>{assert.deepEqual(config.showcases[0].productIds,config.products.slice(0,4).map(p=>p.id));assert.deepEqual(config.showcases[1].productIds,['td-bra-001']);for(const s of config.showcases.slice(2))assert.deepEqual(s.productIds,[]);});
test('basket quantities, persistence, totals, rejection of old fake products',()=>{const memory=new Map();global.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};global.window={dispatchEvent:()=>{}};const products=config.products;
 for(const p of products)basket.change(products,p.id,1);assert.equal(Object.values(basket.read(products)).reduce((n,q)=>n+q,0),5);assert.equal(products.reduce((n,p)=>n+p.price*basket.read(products)[p.id],0),110);
 basket.change(products,products[0].id,1);assert.equal(basket.read(products)[products[0].id],2);basket.change(products,products[0].id,-1);assert.equal(basket.read(products)[products[0].id],1);basket.change(products,products[4].id,-99);assert(!basket.read(products)[products[4].id]);basket.change(products,'aurore',1);assert(!basket.read(products).aurore);
 memory.set('touche-dor-cart-v1',JSON.stringify({aurore:1,'td-col-001':3,'td-col-002':-5,'td-col-003':1.5}));assert.deepEqual(basket.read(products),{'td-col-001':3});delete global.localStorage;delete global.window;
});
test('shared textures load once with independent transforms',async()=>{let calls=0;const window={};class Loader{load(url,done){calls++;queueMicrotask(()=>done({encoding:null,clone(){return {source:this,repeat:{x:1,y:1}}}}));}}const T={TextureLoader:Loader,sRGBEncoding:3001,LinearEncoding:3000};vm.runInNewContext(fs.readFileSync('public/prototype/scene-assets.js','utf8'),{window,Map,Promise});const [a,b]=await Promise.all([window.loadMaisonTexture(T,'/same.webp',true),window.loadMaisonTexture(T,'/same.webp',true)]);assert.equal(calls,1);assert.notEqual(a,b);a.repeat.x=4;assert.equal(b.repeat.x,1);});
test('compressed HDR is byte-identical to the approved original',()=>{const original=fs.readFileSync('public/prototype/assets/interior/studio_small_09_1k.hdr'),compressed=fs.readFileSync('public/prototype/assets/interior/studio_small_09_1k.hdr.gz');assert(zlib.gunzipSync(compressed).equals(original));assert(compressed.length<original.length);});
