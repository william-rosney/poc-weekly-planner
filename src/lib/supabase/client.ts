import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for use in browser/client components
 * Uses createBrowserClient from @supabase/ssr package
 *
 * Configuration:
 * - Implements a singleton pattern internally (no need for external memoization)
 * - Auto-refresh tokens enabled
 * - Session persistence via cookies
 * - Session detection in URL enabled (for OAuth/Magic Link callbacks)
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  );
}
