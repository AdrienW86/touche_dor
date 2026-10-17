"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
import { change, read } from "../public/prototype/cart";
import type { Product } from "@/lib/catalogue";
import styles from "./productDetail.module.css";
const money=(value:number)=>value.toLocaleString("fr-FR",{style:"currency",currency:"EUR"});
const subscribe=(callback:()=>void)=>{window.addEventListener("storage",callback);window.addEventListener("touche-dor-cart",callback);return()=>{window.removeEventListener("storage",callback);window.removeEventListener("touche-dor-cart",callback);};};
export default function ProductDetail({product,products}:{product:Product;products:Product[]}){
 const [selected,setSelected]=useState(0),[failed,setFailed]=useState(false),[notice,setNotice]=useState("");
 const zoom=useRef<HTMLDialogElement>(null),basket=useRef<HTMLDialogElement>(null);
 const snapshot=useSyncExternalStore(subscribe,()=>JSON.stringify(read(products)),()=>"{}");
 const cart:Record<string,number>=JSON.parse(snapshot),photo=product.gallery[selected],lines=products.filter(p=>cart[p.id]);
 const count=Object.values(cart).reduce((a,b)=>a+b,0),total=lines.reduce((n,p)=>n+p.price*cart[p.id],0);
 function choose(index:number){setSelected((index+product.gallery.length)%product.gallery.length);setFailed(false);}
 function add(){change(products,product.id,1);setNotice("Ajouté au panier.");}
 return <main className={"productPage "+styles.page}>
  <header className={styles.header}><Link href="/?reprendre=1" className={styles.brand}>Touche d&apos;Or</Link><button onClick={()=>basket.current?.showModal()}>Panier ({count})</button></header>
  <nav className={styles.breadcrumb} aria-label="Fil d’Ariane"><Link href="/?reprendre=1">La boutique</Link><span aria-hidden="true">/</span><span>{product.cat}</span><span aria-hidden="true">/</span><span>{product.reference}</span></nav>
  <div className={styles.layout}>
   <section className={styles.gallery} aria-label="Photographies du bijou">
    <button className={styles.mainPhoto} onClick={()=>zoom.current?.showModal()} aria-label="Agrandir la photographie" disabled={!photo||failed}>
     {photo&&!failed?<Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} priority unoptimized sizes="(max-width: 800px) 92vw, 55vw" onError={()=>setFailed(true)}/>:<span>Photographie momentanément indisponible</span>}
     {!failed&&<span className={styles.zoomHint}>Agrandir ↗</span>}
    </button>
    <div className={styles.thumbnails} aria-label="Choisir une photographie">{product.gallery.map((image,index)=><button key={image.src} aria-label={"Photographie "+(index+1)} aria-pressed={selected===index} onClick={()=>choose(index)}><Image src={image.thumbnail} alt="" width={90} height={120} unoptimized/></button>)}</div>
   </section>
   <section className={styles.info}><p className={styles.eyebrow}>{product.subcategory}</p><h1>{product.name}</h1><p className={styles.price}>{money(product.price)}</p><p className={styles.description}>{product.description}</p><dl><div><dt>Matière</dt><dd>{product.material}</dd></div><div><dt>Couleur</dt><dd>{product.color}</dd></div><div><dt>Référence</dt><dd>{product.reference}</dd></div><div><dt>Livraison</dt><dd>Gratuite</dd></div></dl><button className={styles.add} onClick={add}>Ajouter au panier</button><p role="status" className={styles.notice}>{notice}</p><Link href="/?reprendre=1" className={styles.back}>← Revenir à la boutique</Link></section>
  </div>
  <footer className={styles.footer}>Touche d&apos;Or · Bijoux en acier inoxydable · Livraison gratuite</footer>
  <dialog ref={zoom} className={styles.zoomDialog} aria-label="Photographie agrandie" onKeyDown={event=>{if(event.key==="ArrowRight")choose(selected+1);if(event.key==="ArrowLeft")choose(selected-1);}}><div className={styles.dialogHeader}><span>{selected+1} / {product.gallery.length}</span><button onClick={()=>zoom.current?.close()} aria-label="Fermer l’agrandissement">Fermer ×</button></div>{photo&&<Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} unoptimized/>}<div className={styles.zoomNav}><button onClick={()=>choose(selected-1)}>← Précédente</button><button onClick={()=>choose(selected+1)}>Suivante →</button></div></dialog>
  <dialog ref={basket} className={styles.cartDialog} aria-labelledby="basket-title"><div className={styles.dialogHeader}><h2 id="basket-title">Votre panier</h2><button onClick={()=>basket.current?.close()} aria-label="Fermer le panier">Fermer ×</button></div>{lines.length?lines.map(p=><div key={p.id} className={styles.cartLine}>{p.gallery[0]&&<Image src={p.gallery[0].thumbnail} alt={p.name} width={72} height={96} unoptimized/>}<div><Link href={"/produits/"+p.slug}>{p.name}</Link><p>{money(p.price)}</p><button onClick={()=>change(products,p.id,-99)}>Supprimer</button></div><div className={styles.quantity}><button onClick={()=>change(products,p.id,-1)} aria-label={"Retirer un "+p.name}>−</button><span>{cart[p.id]}</span><button onClick={()=>change(products,p.id,1)} aria-label={"Ajouter un "+p.name}>+</button></div></div>):<p>Votre panier est vide.</p>}<p className={styles.total}>Total <strong>{money(total)}</strong></p><p>Livraison gratuite.</p><p className={styles.payment}>La commande en ligne n’est pas encore disponible. Aucun paiement n’est effectué.</p></dialog>
 </main>;
}
