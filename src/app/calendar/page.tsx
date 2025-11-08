import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CalendarClient from './CalendarClient';

/**
 * Page du calendrier - Server Component
 * Valide l'authentification côté serveur et passe les données au Client Component
 *
 * Pattern Supabase 2025:
 * - Server Component avec validation via getUser()
 * - Pas de hooks, pas de "use client"
 * - Récupère les données validées côté serveur
 * - Passe les données au Client Component pour l'interactivité
 */
export default async function CalendarPage() {
  const supabase = await createClient();

  // Validation côté serveur avec getUser() (recommandé par Supabase)
  // getUser() valide le token JWT côté serveur, contrairement à getSession()
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Récupérer les données de l'utilisateur depuis la table users
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', user.email)
    .single();

  if (userError || !userData) {
    console.error('[CalendarPage] Error fetching user data:', userError);
    redirect('/login');
  }

  // Rendre le Client Component avec les données validées
  // Le Client Component gère toute l'interactivité (événements, drawer, etc.)
  return <CalendarClient initialUser={userData} />;
}
