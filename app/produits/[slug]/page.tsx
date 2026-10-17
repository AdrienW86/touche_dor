import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products, findProduct } from "@/lib/catalogue";
import ProductDetail from "@/components/ProductDetail";
export function generateStaticParams(){ return products.map(product=>({slug:product.slug})); }
export const dynamicParams = false;
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const product=findProduct((await params).slug);if(!product)return {};
 return {title:product.name,description:product.desc+" Livraison gratuite.",openGraph:{title:product.name+" | Touche d'Or",description:product.desc+" Livraison gratuite.",type:"website"}};
}
export default async function ProductPage({params}:{params:Promise<{slug:string}>}){
 const product=findProduct((await params).slug);if(!product)notFound();
 return <ProductDetail key={product.id} product={product} products={products}/>;
}
