import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Page d'accueil - Server Component
 * Redirige vers login ou calendar selon l'état d'authentification
 *
 * Pattern Supabase 2025:
 * - Server-side validation avec getUser()
 * - Redirection côté serveur (pas de flash de contenu)
 * - Pas de loading state nécessaire
 */
export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Utilisateur authentifié → calendrier
    redirect('/calendar');
  } else {
    // Utilisateur non authentifié → page de login
    redirect('/login');
  }
}
