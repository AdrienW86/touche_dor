import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Touche d'Or — Bijoux en acier inoxydable", template: "%s | Touche d'Or" },
  description: "Découvrez les colliers, sautoirs et bracelets Touche d'Or en acier inoxydable doré. Photographies des bijoux et livraison gratuite.",
  openGraph: { title: "Touche d'Or — Bijoux en acier inoxydable", description: "Colliers, sautoirs et bracelets dorés. Livraison gratuite.", locale: "fr_FR", type: "website" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
 return <html lang="fr"><body>{children}</body></html>;
}
