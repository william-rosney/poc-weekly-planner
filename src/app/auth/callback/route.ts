import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Get the base URL for redirects, handling various deployment environments
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL (explicit configuration)
 * 2. x-forwarded-host header (from reverse proxy like Traefik)
 * 3. host header (direct access)
 * 4. Fallback to request.url origin
 */
function getBaseUrl(request: NextRequest): string {
  // 1. Check for explicit NEXT_PUBLIC_SITE_URL
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // 2. Check for x-forwarded-* headers (reverse proxy)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedHost) {
    return `${forwardedProto || "https"}://${forwardedHost}`;
  }

  // 3. Check for host header
  const host = request.headers.get("host");
  if (host) {
    // In production, assume https; in development, check the protocol
    const protocol = host.includes("localhost") ? "http" : "https";
    return `${protocol}://${host}`;
  }

  // 4. Fallback to request URL origin
  return new URL(request.url).origin;
}

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
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/calendar";

  // Get the proper base URL for redirects
  const baseUrl = getBaseUrl(request);

  // Vérifier si Supabase a retourné une erreur
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  if (error) {
    console.error("[AuthCallback] Supabase error:", {
      error,
      errorDescription,
    });
    return NextResponse.redirect(new URL("/login?error=auth_error", baseUrl));
  }

  if (code) {
    const supabase = await createClient();

    // Échanger le code pour une session
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("[AuthCallback] Error exchanging code:", exchangeError);
      return NextResponse.redirect(
        new URL("/login?error=exchange_error", baseUrl)
      );
    }
  }

  // Rediriger vers page de vérification qui affichera le spinner
  // Cette page vérifie la session et redirige ensuite vers la destination finale
  return NextResponse.redirect(
    new URL(`/auth/verifying?next=${encodeURIComponent(next)}`, baseUrl)
  );
}
