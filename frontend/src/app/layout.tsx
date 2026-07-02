import "./globals.css";

export const metadata = {
  title: "CMC Connect — Cité des Métiers et des Compétences de l'Oriental",
  description: "Plateforme emploi, stages et PFE pour les lauréats et entreprises du CMC de l'Oriental.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
