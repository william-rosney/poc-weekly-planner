import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Route Handler pour le callback d'authentification Magic Link
 *
 * Pattern Supabase 2025 (recommandé):
 * - Utilise un Route Handler (pas Server Component) pour gérer les cookies correctement
 * - Échange le code pour une session
 * - Les cookies sont correctement propagés au navigateur
 * - Redirige vers la destination
 *
 * Pourquoi un Route Handler?
 * - Les Route Handlers peuvent écrire des cookies de manière fiable
 * - Les Server Components ne peuvent pas toujours écrire les cookies correctement
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/calendar';

  // Vérifier si Supabase a retourné une erreur
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  if (error) {
    console.error('[AuthCallback] Supabase error:', { error, errorDescription });
    return NextResponse.redirect(new URL('/login?error=auth_error', request.url));
  }

  if (code) {
    const supabase = await createClient();

    // Échanger le code pour une session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('[AuthCallback] Error exchanging code:', exchangeError);
      return NextResponse.redirect(new URL('/login?error=exchange_error', request.url));
    }
  }

  // Rediriger vers page de vérification qui affichera le spinner
  // Cette page vérifie la session et redirige ensuite vers la destination finale
  return NextResponse.redirect(new URL(`/auth/verifying?next=${encodeURIComponent(next)}`, request.url));
}
