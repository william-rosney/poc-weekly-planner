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
 * Supporte deux formats d'authentification:
 * 1. PKCE flow (nouveau): ?code=xxx
 *    - Utilise exchangeCodeForSession()
 * 2. Magic Link flow (ancien): ?token_hash=xxx&type=magiclink
 *    - Utilise verifyOtp()
 *
 * Pattern Supabase 2025 (recommandé):
 * - Utilise un Route Handler (pas Server Component) pour gérer les cookies correctement
 * - Échange le code/token pour une session
 * - Les cookies sont correctement propagés au navigateur
 * - Redirige vers la destination
 *
 * Pourquoi un Route Handler?
 * - Les Route Handlers peuvent écrire des cookies de manière fiable
 * - Les Server Components ne peuvent pas toujours écrire les cookies correctement
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/calendar";

  // Get the proper base URL for redirects
  const baseUrl = getBaseUrl(request);

  console.log("[AuthCallback] Received params:", {
    token_hash: token_hash ? "present" : "missing",
    type,
    code: code ? "present" : "missing",
    baseUrl,
  });

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

  const supabase = await createClient();

  // Handle PKCE flow (new format with code parameter)
  if (code) {
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("[AuthCallback] Error exchanging code:", exchangeError);
      return NextResponse.redirect(
        new URL("/login?error=exchange_error", baseUrl)
      );
    }

    console.log("[AuthCallback] Successfully exchanged code for session");
  }
  // Handle Magic Link flow (old format with token_hash parameter)
  else if (token_hash && type) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "magiclink" | "email",
    });

    if (verifyError) {
      console.error("[AuthCallback] Error verifying OTP:", verifyError);
      return NextResponse.redirect(
        new URL("/login?error=verify_error", baseUrl)
      );
    }

    console.log("[AuthCallback] Successfully verified magic link");
  }
  // No valid auth parameters found
  else {
    console.error("[AuthCallback] No valid auth parameters found");
    return NextResponse.redirect(
      new URL("/login?error=missing_params", baseUrl)
    );
  }

  // Rediriger vers page de vérification qui affichera le spinner
  // Cette page vérifie la session et redirige ensuite vers la destination finale
  return NextResponse.redirect(
    new URL(`/auth/verifying?next=${encodeURIComponent(next)}`, baseUrl)
  );
}
