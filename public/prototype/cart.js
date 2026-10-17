/* Shared anonymous local basket. No payment, stock or customer data. */
(function(root){
 const key='touche-dor-cart-v1';
 function read(products){try{const value=JSON.parse(localStorage.getItem(key)||'{}');return Object.fromEntries(Object.entries(value||{}).filter(([id,qty])=>products.some(p=>p.id===id&&p.status==='published')&&Number.isInteger(qty)&&qty>0&&qty<=99));}catch{return {};}}
 function save(cart){try{localStorage.setItem(key,JSON.stringify(cart));window.dispatchEvent(new Event('touche-dor-cart'));}catch{}return cart;}
 function change(products,id,delta){const cart=read(products);if(!products.some(p=>p.id===id&&p.status==='published'))return cart;const quantity=Math.min(99,Math.max(0,(cart[id]||0)+delta));if(quantity)cart[id]=quantity;else delete cart[id];return save(cart);}
 const api={read,change};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.ToucheDorCart=api;
})(typeof window==='undefined'?null:window);
