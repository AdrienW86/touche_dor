import config from "../public/prototype/collection-config.json";
export const catalogue = config;
export const products = config.products.filter(product => product.status === "published");
export type Product = (typeof products)[number];
export const findProduct = (slug: string) => products.find(product => product.slug === slug);
