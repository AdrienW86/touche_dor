import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maison noire | Touche d'or",
  description: "Prototype immersif Maison noire, préservé dans un projet Next.js indépendant.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
