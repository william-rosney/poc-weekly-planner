# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# Application Familiale de Gestion du Quotidien

**Rôle:** Développeur Next.js full-stack expert en TypeScript, Supabase et UI moderne.
**Mission:** Construire et maintenir un POC fonctionnel, clair et extensible.

**État Actuel:** Projet en phase d'initialisation (Étape 0 - voir [Plan_Developpement_V1_WeeklyPlanner.md](Plan_Developpement_V1_WeeklyPlanner.md))

---

## 📋 Aperçu du Projet

**Nom:** Application Familiale de Gestion du Quotidien (POC)  
**Description:** Plateforme web permettant aux familles de gérer un calendrier partagé avec authentification simplifiée (Magic Link).  
**État:** Phase POC – Fondations techniques + MVP fonctionnel.  
**Contexte:** Chaleur familiale > rigueur administrative.

### Valeurs du Projet

- **Simplicité:** Code lisible, maintenable, évitant la sur-ingénierie.
- **Fluidité:** Zéro friction UX, transitions fluides, feedback immédiat.
- **Extensibilité:** Fondations solides pour croissance future.
- **Transparence:** Code bien commenté, décisions documentées.

---

## 🏗️ Stack Technique

### Frontend

- **Framework:** Next.js 16 (App Router avec Turbopack)
- **Langage:** TypeScript 5.9+
- **Styling:** Tailwind CSS v4.1+ (configuration CSS-first avec @theme)
- **UI Components:** shadcn/ui (avec couleurs OKLCH)
- **Animations:** Framer Motion 12+ (transitions, micro-interactions)
- **Calendrier:** FullCalendar (Community Edition) - à implémenter
- **Validation:** React Hook Form + Zod (légère) - à implémenter

### Backend & Données

- **Base de données:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Magic Link)
- **Temps réel:** Supabase Realtime API
- **Sécurité:** Row Level Security (RLS)
- **Stockage:** Supabase Storage (optionnel, préparé pour l'avenir)

### Outillage

- **Package Manager:** npm (ou pnpm)
- **Build:** Next.js / Turbo (optimisé)
- **Testing:** Jest + React Testing Library (à implémenter)
- **Linting/Formatting:** ESLint + Prettier (config stricte)
- **VCS:** Git (Conventional Commits)

---

## 📁 Structure du Projet

```
familial-planner/
│
├── .claude/                           # Configuration Claude Code
│   ├── commands/
│   │   ├── quick-test.md
│   │   ├── quick-lint.md
│   │   └── quick-review.md
│   └── settings.json
│
├── .github/
│   └── workflows/                     # CI/CD (optionnel pour POC)
│
├── app/                               # Next.js App Router
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │       ├── UserSelector.tsx
│   │   │       └── MagicLinkForm.tsx
│   │   └── callback/page.tsx          # Callback Supabase Auth
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   └── calendar/
│   │       ├── page.tsx
│   │       ├── components/
│   │       │   ├── Calendar.tsx
│   │       │   ├── EventForm.tsx
│   │       │   └── EventList.tsx
│   │       └── hooks/
│   │           ├── useEvents.ts
│   │           └── useRealtimeEvents.ts
│   │
│   ├── api/                           # Routes API optionnelles
│   │   └── events/route.ts
│   │
│   ├── layout.tsx                     # Layout racine
│   ├── page.tsx                       # Redirection intelligente
│   └── globals.css                    # Styles globaux + Tailwind
│
├── components/
│   ├── ui/                            # shadcn/ui (Button, Input, etc.)
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── common/
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── Toast.tsx
│   └── features/
│       ├── calendar/
│       └── auth/
│
├── hooks/
│   ├── useAuth.ts                     # Contexte utilisateur Supabase
│   ├── useEvents.ts                   # CRUD événements
│   ├── useRealtimeSync.ts             # Sync Realtime
│   └── useMediaQuery.ts               # Responsive utilities
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  # Client Supabase instancié
│   │   ├── server.ts                  # (Si SSR nécessaire)
│   │   └── middleware.ts              # Validation sessions
│   ├── types.ts                       # Types TS globaux
│   ├── utils.ts                       # Utilitaires génériques
│   ├── constants.ts                   # Constantes (couleurs, routes)
│   └── validators.ts                  # Zod schemas
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_events.sql
│   │   ├── 003_enable_rls.sql
│   │   └── 004_create_policies.sql
│   ├── seed.sql                       # Données de test
│   └── schema.sql                     # Schéma complet (vue)
│
├── styles/
│   ├── variables.css                  # CSS custom properties
│   └── animations.css                 # Animations Framer Motion
│
├── public/
│   ├── images/
│   │   ├── logo.svg
│   │   └── avatars/
│   └── fonts/
│
├── .env.example
├── .env.local                         # 🔒 Local only
├── .eslintrc.json
├── .prettierrc
├── next.config.ts
├── postcss.config.mjs                 # PostCSS avec @tailwindcss/postcss v4
├── tsconfig.json
├── package.json
├── package-lock.json
├── README.md
└── CLAUDE.md                          # ← Vous êtes ici
```

---

## 🔐 Authentification & Sécurité

### Flux Magic Link

1. **Écran de sélection:** Liste des utilisateurs pré-enregistrés (table `users`)
2. **Envoi du lien:** Supabase Auth envoie un Magic Link à `user.email`
3. **Callback:** Redirection vers `/auth/callback` avec le token
4. **Session:** Création de la session Supabase, stockée en HttpOnly cookie
5. **Dashboard:** Redirection automatique vers `/dashboard/calendar`

### Protection des Données (RLS)

- **Policy pour `users`:** Chacun voit son profil + les profils publics (nom, avatar)
- **Policy pour `events`:** Accès selon l'ownership ou partage familial (tous les événements visibles pour la famille)
- **Audit:** Supabase gère `created_at` automatiquement, no manual timestamps

### Variables d'Environnement

```env
# .env.local (JAMAIS COMMITER)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx  # Backend only

# Optionnel
NEXT_PUBLIC_APP_NAME=Mon Agenda Familial
NEXT_PUBLIC_API_TIMEOUT=5000
```

---

## 📊 Modèle de Données

### Table `users`

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  avatar_url text,
  role text DEFAULT 'member',  -- 'admin' | 'member'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Table `events`

```sql
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  color text DEFAULT 'blue',  -- Support couleurs personnalisées
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Relations:**

- Un utilisateur peut créer plusieurs événements
- Les événements sont publics pour la famille (pas de privacy par défaut)

---

## 🎨 Conventions de Code

### TypeScript Best Practices

**IMPORTANT:** Ce projet suit des pratiques TypeScript strictes pour garantir la qualité et la maintenabilité du code.

#### Règles Strictes

- **Strict Mode:** `tsconfig.json` avec `strict: true` (NON NÉGOCIABLE)
- **Never `any`:** JAMAIS utiliser le type `any` - utiliser `unknown` avec type guards
- **Exports Named:** Privilégier les imports nommés (`import { foo }`)
- **Interfaces > Types:** Pour les contrats publics et props de composants
- **Generics:** Utiliser pour les composants et fonctions réutilisables
- **Type Guards:** Toujours vérifier les types avec `instanceof`, `typeof`, ou type predicates
- **Error Handling:** Utiliser `unknown` dans les blocs catch, jamais `any`

**Exemples de Bonnes Pratiques:**

```typescript
// ✅ BON - Types explicites et type guards
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = async (id: string): Promise<User | null> => {
  try {
    const response = await fetch(`/api/users/${id}`);
    return await response.json();
  } catch (error: unknown) {
    // ✅ Type guard pour extraire le message d'erreur
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching user:", message);
    return null;
  }
};

// ❌ MAUVAIS - Utilisation de any
const getUser = async (id: any) => {
  try {
    const response = await fetch(`/api/users/${id}`);
    return await response.json();
  } catch (error: any) {
    // ❌ Ne jamais faire ça!
    console.error("Error:", error.message);
    return null;
  }
};
```

### React & Composants

- **Functional Components:** Toujours (`const Component = () => {}`)
- **Props Typing:** Interface dédiée par composant
- **Hooks:** Grouper au début du composant
- **Événements:** Utiliser `React.MouseEvent<>`, `React.FormEvent<>`
- **Refs:** Préférer `useRef` avec `ForwardRef` si nécessaire

**Exemple:**

```typescript
interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, disabled, children }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
```

### Supabase Client

- **Client-side:** Importer depuis `@/lib/supabase/client`
- **Server-side:** Utiliser `@/lib/supabase/server` avec cookies
- **Middleware:** Vérifier les sessions côté serveur
- **Never Hardcode:** Secrets dans `.env.local`

**Exemple:**

```typescript
// lib/supabase/client.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);
```

### Tailwind CSS v4

- **Configuration CSS-First:** Utiliser `@theme` dans `globals.css` (pas de tailwind.config.ts)
- **Format OKLCH:** Toutes les couleurs custom en OKLCH pour précision perceptuelle
- **Utility-first:** Composition plutôt que classes custom
- **Design System:** Couleurs centralisées dans `@theme` directive
- **Responsive:** Mobile-first (`sm:`, `md:`, `lg:`)

**Couleurs disponibles:**

- **Thème Christmas:** `christmas-red`, `christmas-green`, `christmas-gold`, `christmas-cream` (+ variants `-light`, `-dark`)
- **shadcn/ui:** `primary`, `secondary`, `muted`, `accent`, `destructive`, `background`, `foreground`, `border`, `input`, `ring`

**Exemple de configuration (globals.css):**

```css
@import "tailwindcss";

@theme {
  --color-christmas-red: oklch(0.45 0.16 25);
  --color-primary: oklch(0.57 0.22 250);
  --radius: 0.5rem;
}
```

**Exemple d'utilisation:**

```tsx
<div className="flex items-center gap-4 p-6 bg-christmas-cream rounded-lg shadow-sm">
  <p className="text-lg font-semibold text-christmas-red">Hello</p>
</div>
```

### Commentaires & Documentation

- **JSDoc:** Pour les fonctions publiques
- **Inline:** Expliquer le "pourquoi", pas le "quoi"
- **TODO:** Marquer les portions à completer (`// TODO: Ajouter validation`)
- **Sections:** Grouper le code par responsabilité

**Exemple:**

```typescript
/**
 * Synchronise les événements avec Supabase Realtime.
 * @param userId - L'ID de l'utilisateur
 * @returns Fonction de nettoyage pour se désabonner
 */
export const syncEvents = (userId: string) => {
  // S'abonner aux changements pour cet utilisateur
  const subscription = supabase
    .channel(`events:${userId}`)
    .on("*", handleChange)
    .subscribe();

  return () => subscription.unsubscribe();
};
```

---

## ✅ Checklist de Qualité de Code

### Avant chaque commit:

**🚨 OBLIGATOIRE: Exécuter `/quick-lint` avant tout commit!**

Cette commande exécute automatiquement:

- TypeScript compilation (`npm run typecheck`)
- ESLint avec auto-fix (`npm run lint`)
- Prettier formatting (`npm run format`)

**Checklist complète:**

- [ ] **Exécuter `/quick-lint`** (ou `npm run typecheck && npm run lint && npm run format`)
- [ ] TypeScript compile sans erreur - **AUCUN type `any` autorisé**
- [ ] ESLint passe sans erreurs ni warnings
- [ ] Prettier formaté automatiquement
- [ ] Tests passent (quand implémentés)
- [ ] Pas de `console.log` en production (seulement `console.error` et `console.warn`)
- [ ] Pas de secrets en dur dans le code
- [ ] Accessibilité vérifiée (Alt text, ARIA labels, contraste)
- [ ] Performance acceptable (aucun re-render inutile)

### À la revue de code:

- [ ] Le code suit les conventions du projet
- [ ] La logique est compréhensible
- [ ] Pas de dépendances inutiles ajoutées
- [ ] Les tests couvrent les cas limites
- [ ] Documentation à jour (README, JSDoc)
- [ ] Pas de sécurité compromise (injection, CORS, etc.)

---

## 🎯 Fonctionnalités Clés

### 1. Page de Connexion (`/auth/login`)

**Fichiers:** `app/(auth)/login/page.tsx`, `components/auth/UserSelector.tsx`, `components/auth/MagicLinkForm.tsx`

- Afficher liste dynamique des utilisateurs (`users` table)
- Formulaire simple: email + bouton "Envoyer le lien"
- État de chargement + feedback (succès / erreur)
- Redirection automatique après validation du token

**Hooks utilisés:**

- `useAuth()` pour l'état
- `useState` pour le formulaire local

**Dépendances Supabase:**

- `supabase.auth.signInWithOtp()`

### 2. Tableau de Bord (`/dashboard/calendar`)

**Fichiers:** `app/(dashboard)/calendar/page.tsx`, `components/calendar/Calendar.tsx`, `components/calendar/EventForm.tsx`

- Intégration FullCalendar
- Vue mensuelle + week + day
- Affichage des événements en couleur (par utilisateur)
- Modal pour ajouter/modifier/supprimer événements

**Hooks utilisés:**

- `useEvents()` pour CRUD
- `useRealtimeSync()` pour la synchro temps réel
- `useAuth()` pour l'utilisateur actuel

**Dépendances:**

- FullCalendar + plugins React
- Framer Motion pour modal entrance

### 3. Synchronisation Realtime

**Fichier:** `hooks/useRealtimeSync.ts`

- Écoute les changements via `supabase.channel()`
- Mise à jour état local à la réception
- Désabonnement au unmount du composant
- Gestion des erreurs de connexion

**Avantages:** Multi-utilisateur en temps réel sans polling.

---

## 📦 Commandes de Développement

### Projet Next.js (une fois initialisé)

```bash
npm run dev              # Démarrer serveur dev (localhost:3000)
npm run build            # Next.js build
npm start                # Serveur production
npm run typecheck        # Vérifier TypeScript
npm run lint             # ESLint
npm run format           # Prettier
```

### Supabase (avec CLI installée)

```bash
supabase start           # Serveur local Supabase
supabase db push         # Déployer migrations
supabase db reset        # Réinitialiser DB locale avec seed data
```

### Tests (à implémenter dans les prochaines étapes)

```bash
npm test                 # Jest
npm run test:watch       # Mode watch
```

---

## 🚀 Étapes d'Implémentation (Ordre Recommandé)

1. **[Semaine 1] Initialisation & Auth**
   - [ ] Créer projet Next.js + config TypeScript
   - [ ] Intégrer Tailwind CSS + shadcn/ui
   - [ ] Configurer Supabase client
   - [ ] Implémenter `UserSelector` + `MagicLinkForm`
   - [ ] Callback auth + session management

2. **[Semaine 1-2] Base de Données & API**
   - [ ] Migrations SQL (`users`, `events`)
   - [ ] RLS policies
   - [ ] Hooks Supabase (`useAuth`, `useEvents`)

3. **[Semaine 2] Interface Calendrier**
   - [ ] Intégrer FullCalendar
   - [ ] Composer `Calendar.tsx` + `EventForm.tsx`
   - [ ] CRUD basique (add, edit, delete)
   - [ ] Affichage des événements

4. **[Semaine 2-3] Polish & Realtime**
   - [ ] Framer Motion animations
   - [ ] Supabase Realtime sync
   - [ ] Gestion des erreurs + états loading
   - [ ] Responsive design (mobile + desktop)

5. **[Semaine 3] Finalisation & Docs**
   - [ ] Tests si temps
   - [ ] README complet
   - [ ] Cleanup + optims
   - [ ] Git conventions

---

## ⚠️ Pièges Courants à Éviter

1. **TypeScript `any`:** ❌ INTERDIT - utiliser `unknown` + type guards (voir exemples ci-dessus)
2. **Oublier `/quick-lint`:** ❌ Toujours exécuter avant un commit pour éviter les erreurs
3. **Auth Token Expiration:** Toujours gérer les erreurs 401 + refresh token automatique
4. **Realtime Débouncing:** Ne pas recréer les subscriptions à chaque render (useEffect avec deps)
5. **Tailwind v4 Configuration:** Ne JAMAIS créer de `tailwind.config.ts` - utiliser `@theme` dans globals.css uniquement
6. **Format OKLCH:** Toujours utiliser OKLCH pour les nouvelles couleurs (pas HSL ou RGB)
7. **Re-renders Inutiles:** Memoïzer les callbacks avec `useCallback` si nécessaire
8. **Secrets Hardcodés:** Toujours utiliser `.env.local`, jamais dans le code source
9. **UX Bloquant:** Afficher loading + permettre annulation sur opérations longues
10. **Console.log en Production:** Nettoyer tous les logs de debug avant commit

---

## 🔍 Debugging & Workflow

### Slash Commands Personnalisés

#### `/quick-lint` – 🚨 COMMANDE OBLIGATOIRE PRÉ-COMMIT

**À exécuter AVANT chaque commit!**

Lance dans l'ordre:

1. TypeScript compilation (`npm run typecheck`)
2. ESLint avec auto-fix (`npm run lint`)
3. Prettier formatting (`npm run format`)

Corrige automatiquement les problèmes de formatage détectés.

#### `/qtest` – Tests rapides

Exécute les tests pertinents et valide.

#### `/qreview` – Revue rapide

Passe en revue les changements selon la checklist qualité.

#### `/qcheck` – Checklist complète

Valide TypeScript, Lint, Format, et qualité globale.

### Debugging Supabase

```bash
# Vérifier l'état de la session
supabase.auth.getSession()

# Inspecter le payload JWT
console.log(supabase.auth.getUser())

# Logs en temps réel
supabase.channel().on('*', console.log)
```

### DevTools Recommandés

- **React DevTools:** Profiler + component tree
- **Redux DevTools:** Si état complexe (non applicable pour POC)
- **Network Tab:** Inspecter requêtes API + Realtime
- **Lighthouse:** Perf audit avant production

---

## 📚 Ressources & Documentation Externe

### Next.js & React

- [Next.js Docs – App Router](https://nextjs.org/docs/app)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### Supabase

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [RLS Security](https://supabase.com/docs/guides/auth/row-level-security)

### UI & Styling

- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [Tailwind v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Framer Motion Guide](https://www.framer.com/motion/)
- [OKLCH Color Picker](https://oklch.com/) - Pour créer de nouvelles couleurs

### Calendrier

- [FullCalendar React Plugin](https://fullcalendar.io/docs/react)
- [FullCalendar Event Handling](https://fullcalendar.io/docs/event-handling)

### Validation

- [Zod Documentation](https://zod.dev/)
- [React Hook Form](https://react-hook-form.com/)

---

## 🔄 Git & Commits

### Workflow de Commit

**Avant de créer un commit, TOUJOURS:**

1. Exécuter `/quick-lint` pour valider le code
2. Vérifier que tous les tests passent
3. S'assurer qu'aucun fichier sensible n'est inclus (`.env.local`, secrets, etc.)
4. Créer un commit avec un message conventionnel

### Convention Commits

```
<type>[optional scope]: <description>

[optional body]
[optional footer(s)]
```

**Types:**

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `refactor:` Restructuration de code
- `style:` Formatage uniquement (pas de logique)
- `docs:` Documentation
- `chore:` Dépendances, config
- `test:` Ajout ou modification de tests

**Exemples:**

```
feat(auth): implémenter Magic Link via Supabase
fix(calendar): corriger affichage événements fullcalendar
refactor(api): simplifier logique useEvents hook
docs: ajouter instructions d'installation
```

### Branches

- `main` – Production (tags + releases)
- `develop` – Intégration continue
- `feature/xyz` – Développement de features
- `bugfix/xyz` – Corrections de bugs

---

## 🎓 Notes Personnelles pour le Développeur

> Bienvenue dans ce projet ! 🚀
>
> Ce POC est une opportunité de démontrer qu'une plateforme familiale peut être moderne, fluide et conviviale sans être complexe.
>
> **Gardez en tête:**
>
> - Chaque ligne de code doit servir un but.
> - La lisibilité > la cleverness.
> - Testez les cas limites (erreurs réseau, timeouts, etc.).
> - Les animations sont du polish, pas du contenu.
> - Le design responsive n'est pas optionnel.
>
> Bon coding ! 💪

---

**Dernière mise à jour:** 1 novembre 2025
**Version:** 1.1.0 (POC - Tailwind v4 Migration)
**Auteur:** Architecture POC
**Questions?** Vérifiez le `README.md` ou ouvrez une discussion!

---

## 📝 Changelog

### Version 1.1.0 (1 novembre 2025)

- ✅ Migration complète vers Tailwind CSS v4 avec configuration CSS-first
- ✅ Conversion de toutes les couleurs de HSL vers OKLCH
- ✅ Suppression de `tailwind.config.ts` (remplacé par `@theme` dans globals.css)
- ✅ Implémentation du thème Christmas avec 12 variantes de couleurs
- ✅ Nettoyage des variables CSS inutilisées (charts, dark mode)
- ✅ Amélioration des performances de build (jusqu'à 5x plus rapide)

### Version 1.0.0 (31 octobre 2025)

- ✅ Initialisation du projet Next.js 16 avec TypeScript
- ✅ Configuration de base avec Tailwind CSS et shadcn/ui
- ✅ Implémentation de l'authentification Magic Link avec Supabase
- ✅ Création de la structure du projet POC
