# Supabase SSR Architecture (2025 Pattern)

## Problem Solved

Authentication sessions were not persisting after page reload due to cookie synchronization conflicts between middleware and client-side auth management.

## Solution Architecture

### Server Components for Auth Validation
- **Home page** (`app/page.tsx`): Server Component that validates session with `getUser()` and redirects
- **Calendar page** (`app/calendar/page.tsx`): Server Component that validates user and fetches data server-side
- **Auth callback** (`app/auth/callback/route.ts`): Route Handler (not Server Component) for reliable cookie writing

### Client Components for Interactivity
- **CalendarClient** (`app/calendar/CalendarClient.tsx`): Receives validated user data as props, handles all UI interactions
- **Login page** (`app/(auth)/login/page.tsx`): Creates own Supabase client for sending magic links

### Key Patterns

1. **Server-side validation**: Use `await supabase.auth.getUser()` in Server Components
2. **Route Handler for callbacks**: Use Route Handler instead of Server Component to ensure cookies are written correctly
3. **No global AuthProvider**: Each component creates its own Supabase client (internal singleton)
4. **Props-based data flow**: Server Components pass validated data to Client Components via props

## Files Changed

**Removed:**
- `src/providers/AuthProvider.tsx` (replaced by Server Component pattern)
- `src/hooks/useAuth.ts` (no longer needed)
- `src/app/auth/callback/page.tsx` (replaced by Route Handler)

**Created:**
- `src/app/auth/callback/route.ts` (Route Handler for cookie management)
- `src/app/auth/verifying/page.tsx` (Loading state with spinner)
- `src/app/calendar/CalendarClient.tsx` (Interactive UI component)

**Modified:**
- `src/app/calendar/page.tsx` (converted to Server Component)
- `src/app/page.tsx` (converted to Server Component)
- `src/app/(auth)/login/page.tsx` (removed AuthProvider dependency)
- `src/app/layout.tsx` (removed global AuthProvider wrapper)
- `src/hooks/useEvents.ts` (creates own Supabase client)
- `src/lib/supabase/client.ts` (added explicit auth config)

## Benefits

✅ Session persists after page reload/app restart
✅ No cookie conflicts between middleware and client
✅ Follows official Supabase SSR best practices (2025)
✅ Server-side validation for security
✅ Simplified architecture (no global Context)
