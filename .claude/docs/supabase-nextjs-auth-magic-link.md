# Configuration de l'authentification Magic Link avec Supabase & Next.js

Guide d'implémentation moderne pour Next.js 15+ avec Supabase Auth (Magic Link).

## Prérequis

- Un projet Supabase existant
- Un projet Next.js 15+ (App Router) déjà initialisé
- Le SDK Supabase installé (`@supabase/supabase-js` et `@supabase/ssr`)
- L'option « Email Magic Link » activée dans Supabase > Auth > Paramètres
- Les URLs de redirection configurées dans Supabase > Auth > Settings > Redirect URLs

---

## 1. Installer les dépendances

```bash
npm install @supabase/supabase-js @supabase/ssr
```

---

## 2. Configurer les variables d'environnement

Dans `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://<votre-projet>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<clé_publishable_ou_anon>
```

> **Note:** Utilisez `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (nouvelle convention Supabase)

---

## 3. Créer les utilitaires Supabase

### 3.1 Client côté navigateur — `src/lib/supabase/client.ts`

```ts
import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for use in browser/client components
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
```

### 3.2 Client côté serveur — `src/lib/supabase/server.ts`

**⚠️ API Moderne (Next.js 15+)** - Utilise `createServerClient` avec async cookies

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase client for use in Server Components, Server Actions, and Route Handlers
 * Automatically handles cookie-based session management
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
```

### 3.3 Middleware utilities — `src/lib/supabase/middleware.ts`

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Updates the user session in middleware
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

  // IMPORTANT: Triggers automatic token refresh and validation
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if user is not authenticated and trying to access protected routes
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
```

---

## 4. Middleware pour gérer la session

`middleware.ts` (à la racine du projet) :

```ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Middleware pour rafraîchir automatiquement les tokens d'authentification
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

---

## 5. Page de connexion (Magic Link)

`app/(auth)/login/page.tsx` :

```tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    setMessage(
      error
        ? `Erreur : ${error.message}`
        : "Vérifiez votre email pour le lien de connexion."
    );
  };

  return (
    <main>
      <h1>Connexion</h1>
      <form onSubmit={handleLogin}>
        <label>
          Email :
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <button type="submit">Envoyer le lien magique</button>
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}
```

---

## 6. Page de callback après connexion

`app/auth/callback/page.tsx` - **Version moderne avec gestion PKCE + Implicit flow** :

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Page de callback pour l'authentification Magic Link
 * Gère à la fois le PKCE flow (moderne) et l'Implicit flow (legacy)
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");
      const next = searchParams.get("next") ?? "/calendar";

      try {
        const supabase = createClient();

        // Handle PKCE flow (modern - with code parameter)
        if (code) {
          const { data, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error("[Callback] Exchange error:", exchangeError);
            setError(`Erreur: ${exchangeError.message}`);
            setTimeout(() => router.push("/login"), 3000);
            return;
          }

          if (data.session) {
            router.push(next);
            return;
          }
        }

        // Handle Implicit flow (legacy - with token_hash and type)
        if (tokenHash && type) {
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as "email" | "magiclink",
          });

          if (verifyError) {
            console.error("[Callback] Verify error:", verifyError);
            setError(`Erreur: ${verifyError.message}`);
            setTimeout(() => router.push("/login"), 3000);
            return;
          }

          if (data.session) {
            router.push(next);
            return;
          }
        }

        // No valid authentication parameters found
        console.error("[Callback] No valid auth parameters in URL");
        setError("Paramètres d'authentification invalides");
        setTimeout(() => router.push("/login"), 3000);
      } catch (err: unknown) {
        console.error("[Callback] Unexpected error:", err);
        const message = err instanceof Error ? err.message : "Erreur inconnue";
        setError(message);
        setTimeout(() => router.push("/login"), 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div>
        <h1>Erreur d'authentification</h1>
        <p>{error}</p>
        <p>Redirection vers la page de connexion...</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Connexion en cours...</h1>
      <p>Vérification de votre identité</p>
    </div>
  );
}
```

---

## 7. Exemple de page protégée

`app/calendar/page.tsx` :

```tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <main>
      <h1>Bienvenue {user.email}</h1>
      <p>Calendrier partagé</p>
    </main>
  );
}
```

---

## 8. Configuration Supabase Dashboard

### Redirect URLs (OBLIGATOIRE)

Allez dans **Authentication > URL Configuration** :

**Site URL:**

```
http://localhost:3000
```

**Redirect URLs:**

```
http://localhost:3000/auth/callback
http://localhost:3000/
```

Pour la production :

```
https://votre-domaine.com/auth/callback
https://votre-domaine.com/
```

### Email Templates

Allez dans **Authentication > Email Templates** > "Magic Link" :

**Sujet :**

```
Connexion à Mon Agenda Familial 🎄
```

**Corps :**

```html
<h2>Bonjour 👋</h2>
<p>Cliquez sur le lien ci-dessous pour vous connecter :</p>
<p><a href="{{ .ConfirmationURL }}">Se connecter</a></p>
<p>Ce lien expire dans 1 heure.</p>
```

---

## 9. Structure du projet

```
/src
  /app
    /(auth)
      /login
        page.tsx
    /auth
      /callback
        page.tsx
    /calendar
      page.tsx
  /lib
    /supabase
      client.ts       # Client browser
      server.ts       # Client server (moderne)
      middleware.ts   # Session refresh
/middleware.ts
/.env.local
```

---

## 10. Bonnes pratiques

### Sécurité

- ✅ Toujours utiliser `getUser()` dans le middleware (pas `getSession()`)
- ✅ Activer Row Level Security (RLS) dans Supabase
- ✅ Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` côté client
- ✅ Vérifier les Redirect URLs configurées

### TypeScript

- ✅ Utiliser `strict: true` dans `tsconfig.json`
- ✅ Ne jamais utiliser le type `any` - préférer `unknown` avec type guards
- ✅ Typer correctement les erreurs dans les blocs `catch`

### Performance

- ✅ Utiliser `createClient()` dans les Server Components (pas de re-render)
- ✅ Memoïser les callbacks côté client avec `useCallback`
- ✅ Nettoyer les subscriptions avec `cleanup` dans `useEffect`

---

## 11. Debugging

### Problème : "Code d'authentification manquant"

**Cause :** Les Redirect URLs ne sont pas configurées correctement.

**Solution :** Vérifiez que `http://localhost:3000/auth/callback` est bien dans la liste des Redirect URLs dans Supabase Dashboard.

### Problème : Email non reçu

**Solutions :**

- Vérifiez les logs Supabase (Dashboard > Logs > Auth Logs)
- Vérifiez que l'email existe dans votre table `users`
- Consultez votre dossier spam
- En développement, utilisez les "Email Testing" logs de Supabase

---

## 12. Références officielles

- [Server-Side Auth with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs?router=app)
- [Magic Link Auth](https://supabase.com/docs/guides/auth/passwordless-login/auth-magic-link)
- [Supabase JavaScript Library](https://supabase.com/docs/reference/javascript/auth-signinwithotp)
- [@supabase/ssr Package](https://www.npmjs.com/package/@supabase/ssr)

---

**Dernière mise à jour :** 1 novembre 2025
**Version :** 2.0.0 (API moderne Next.js 15+)
