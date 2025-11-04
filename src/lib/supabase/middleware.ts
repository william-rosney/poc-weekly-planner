import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Updates the user session in middleware
 * This function:
 * 1. Refreshes the Auth token by calling supabase.auth.getUser()
 * 2. Passes the refreshed session to Server Components via request.cookies.set
 * 3. Passes the refreshed session to the browser via response.cookies.set
 *
 * IMPORTANT: Always use supabase.auth.getUser() instead of getSession()
 * to ensure the token is properly revalidated server-side.
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
    const { data: { user: validatedUser } } = await supabase.auth.getUser();
    user = validatedUser;
  } catch (error) {
    console.error("[middleware] Session validation error:", error);
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
