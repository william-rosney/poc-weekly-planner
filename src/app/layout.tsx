import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mon Agenda Familial",
  description: "Application familiale de gestion du quotidien",
};

/**
 * Root Layout - Server Component
 *
 * Pattern Supabase 2025:
 * - Pas de AuthProvider global (authentification gérée par Server Components)
 * - Les Server Components valident les sessions avec getUser()
 * - Les Client Components créent leur propre client Supabase si nécessaire
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
