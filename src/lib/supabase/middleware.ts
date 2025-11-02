import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Timeout wrapper pour les appels async
 * Permet d'éviter les blocages infinis si Supabase ne répond pas
 * Timeout court pour une réponse rapide en cas de cookies corrompus
 */
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 1000
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
    ),
  ]);
}

/**
 * Updates the user session in middleware
 * This function:
 * 1. Refreshes the Auth token by calling supabase.auth.getUser()
 * 2. Passes the refreshed session to Server Components via request.cookies.set
 * 3. Passes the refreshed session to the browser via response.cookies.set
 *
 * IMPORTANT: Always use supabase.auth.getUser() instead of getSession()
 * to ensure the token is properly revalidated server-side.
 *
 * Includes timeout and error handling to prevent infinite loading states
 * when sessions become invalid (e.g., after server restart).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Set cookies in the request for Server Components
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Create a new response with updated request
          supabaseResponse = NextResponse.next({
            request,
          });
          // Set cookies in the response for the browser
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;

  try {
    // Timeout très court (800ms) pour détecter rapidement les sessions corrompues
    const result = await withTimeout(supabase.auth.getUser(), 800);
    user = result.data.user;
  } catch (error) {
    // En cas d'erreur ou timeout, on considère l'utilisateur comme non authentifié
    console.warn("[middleware] Session validation timeout or error:", error);

    // Clear les cookies invalides pour permettre une nouvelle connexion
    const authCookies = request.cookies
      .getAll()
      .filter((cookie) => cookie.name.startsWith("sb-"));

    authCookies.forEach((cookie) => {
      supabaseResponse.cookies.delete(cookie.name);
    });

    user = null;
  }

  // Redirect to login if user is not authenticated and trying to access protected routes
  // Allow access to /auth/* routes (login, callback, etc.) and root
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    !request.nextUrl.pathname.startsWith("/login") &&
    request.nextUrl.pathname !== "/"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
