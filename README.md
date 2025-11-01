# Mon Agenda Familial - POC

Application web moderne permettant aux familles de gérer leur organisation quotidienne avec un calendrier partagé et une authentification simplifiée.

## 🚀 Stack Technique

- **Framework:** Next.js 15 (App Router)
- **Langage:** TypeScript 5.2+
- **Styling:** Tailwind CSS 3.4+ + shadcn/ui
- **Animations:** Framer Motion
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **Calendrier:** FullCalendar (à venir)

## 📋 Prérequis

- Node.js 18+ et npm
- Un compte Supabase (https://supabase.com)

## 🛠️ Installation

1. Cloner le repository

```bash
git clone https://github.com/william-rosney/poc-weekly-planner.git
cd poc-weekly-planner
```

2. Installer les dépendances

```bash
npm install
```

3. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Puis éditer `.env.local` avec vos identifiants Supabase:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📦 Scripts Disponibles

```bash
npm run dev              # Démarrer serveur dev
npm run build            # Build de production
npm start                # Serveur production
npm run lint             # Linter le code
npm run format           # Formatter le code avec Prettier
npm run typecheck        # Vérifier les types TypeScript
```

## 🗂️ Structure du Projet

```
poc-weekly-planner/
├── src/                   # Code source de l'application
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx   # Layout racine
│   │   ├── page.tsx     # Page d'accueil
│   │   └── globals.css  # Styles globaux
│   ├── components/       # Composants React
│   │   ├── ui/          # Composants shadcn/ui
│   │   ├── layout/      # Composants de layout
│   │   ├── common/      # Composants communs
│   │   └── features/    # Composants par fonctionnalité
│   ├── hooks/           # Hooks React personnalisés
│   ├── lib/             # Bibliothèques et utilitaires
│   │   ├── supabase/   # Configuration Supabase
│   │   ├── types.ts    # Types TypeScript
│   │   ├── utils.ts    # Fonctions utilitaires
│   │   └── constants.ts # Constantes
│   └── styles/          # Styles CSS additionnels
├── public/              # Fichiers statiques
├── supabase/            # Migrations et schémas SQL
└── .claude/             # Configuration Claude Code
```

## 🔐 Authentification

L'application utilise Supabase Auth avec Magic Link:

1. Les utilisateurs sont pré-enregistrés dans la base de données
2. Sélection du profil depuis une liste
3. Réception d'un Magic Link par email
4. Connexion automatique après validation

## 📊 État du Projet

### ✅ Étape 0 - Initialisation (Complétée)

- [x] Projet Next.js 15 avec TypeScript
- [x] Configuration Tailwind CSS
- [x] Configuration ESLint + Prettier
- [x] Structure de base des dossiers avec `src/`
- [x] Configuration Supabase client
- [x] README du projet

### 🔄 Prochaines Étapes

1. **Étape 1:** Authentification et gestion des utilisateurs
2. **Étape 2:** Tableau de bord avec vue calendrier
3. **Étape 3:** CRUD des événements
4. **Étape 4:** Système de votes
5. **Étape 5:** Améliorations UI/UX
6. **Étape 6:** Synchronisation Realtime
7. **Étape 7:** Finalisation et tests
8. **Étape 8:** Déploiement sur Vercel

Voir [Plan_Developpement_V1_WeeklyPlanner.md](Plan_Developpement_V1_WeeklyPlanner.md) pour plus de détails.

## 📚 Documentation

- [CLAUDE.md](CLAUDE.md) - Guide de développement pour l'IA
- [POC_Familial_WeeklyPlanner.md](POC_Familial_WeeklyPlanner.md) - Spécifications initiales
- [Plan_Developpement_V1_WeeklyPlanner.md](Plan_Developpement_V1_WeeklyPlanner.md) - Plan de développement détaillé

## 🤝 Contribution

Ce projet est actuellement en phase POC. Les contributions seront ouvertes après la finalisation de la première version.

## 📄 Licence

ISC
