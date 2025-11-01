# 🚀 Proof of Concept – Application Familiale de Gestion du Quotidien

## 🎯 Rôle

Tu es un **développeur Next.js full-stack expérimenté** spécialisé en **TypeScript**, **Supabase**, et **UI moderne**.  
Ta mission est d’aider à concevoir et coder un **proof of concept (POC)** d’une application web familiale moderne, selon la stack, les spécifications et la structure ci-dessous.

Ton objectif est de livrer une **base fonctionnelle, claire, maintenable et extensible**, prête à évoluer vers une application complète.

---

## 🧩 Projet : Application Familiale de Gestion du Quotidien

### 🧠 Objectif général

Créer une application web permettant à une famille de **gérer son organisation quotidienne**, avec :

- Un **calendrier partagé**
- Une **authentification ultra simple** via Magic Link
- Une **interface fluide et intuitive**

Ce POC doit démontrer la viabilité du concept et poser les fondations techniques du futur produit.

---

## ⚙️ Stack technique

### Frontend

- **Next.js 15** (ou dernière version stable)
  - App Router (`/app` directory)
  - Support SSR + ISR
- **TypeScript**
- **Tailwind CSS** pour le design system
- **shadcn/ui** pour les composants
- **Framer Motion** pour les animations
- **FullCalendar** pour la vue calendrier
- **React Hook Form** ou **Zod** pour la validation légère des formulaires

### Backend & Base de données

- **Supabase**
  - Base de données **PostgreSQL**
  - **Auth intégrée** avec Magic Link
  - **Realtime API** pour la synchro du calendrier
  - **Row Level Security (RLS)** pour la sécurité des données
  - **Supabase Storage** (préparé pour une future extension, ex. upload de fichiers)

---

## 🔐 Authentification simplifiée (via Supabase Auth)

- Les membres de la famille sont **préenregistrés** dans la base (nom + email).
- Lors du premier accès :
  1. L’utilisateur **choisit son profil** dans une liste (ex. Papa, Maman, Emma, Lucas).
  2. Un **Magic Link** Supabase est envoyé à son email.
  3. En cliquant sur ce lien, il est automatiquement connecté et redirigé vers le tableau de bord.
- Option future : reconnexion automatique persistante.

---

## 🧱 Fonctionnalités du POC

### 1. Page d’accueil / Sélecteur d’utilisateur

- Affiche la liste des membres (issus de la table `users`)
- Envoi du Magic Link à l’utilisateur sélectionné
- Feedback visuel après envoi
- Redirection automatique après authentification

### 2. Tableau de bord familial

- Intégration de **FullCalendar**
- Ajout / modification / suppression d’événements :
  - titre
  - date / heure
  - membre concerné
- Événements partagés visibles par tous
- Synchronisation en temps réel avec Supabase Realtime

### 3. Design & UX

- Interface minimaliste, chaleureuse et responsive
- Couleurs douces, typographie conviviale
- Transitions fluides (Framer Motion)
- Layout clair avec sidebar ou topbar (selon viewport)

---

## 🗂️ Structure du projet attendue

```
project/
│
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (dashboard)/calendar/page.tsx
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/ (shadcn)
│   ├── calendar/
│   └── auth/
│
├── lib/
│   ├── supabaseClient.ts
│   ├── types.ts
│   └── utils.ts
│
├── supabase/
│   ├── schema.sql (tables : users, events)
│   └── policies.sql (RLS)
│
├── package.json
└── README.md
```

---

## 📦 Modèle de données (brouillon)

### Table `users`

| champ      | type             | description             |
| ---------- | ---------------- | ----------------------- |
| id         | uuid (PK)        | généré automatiquement  |
| name       | text             | prénom ou nom visible   |
| email      | text             | utilisé pour Magic Link |
| avatar_url | text (optionnel) | image de profil         |

### Table `events`

| champ      | type                    | description          |
| ---------- | ----------------------- | -------------------- |
| id         | uuid (PK)               | identifiant          |
| title      | text                    | titre de l’événement |
| start_date | timestamptz             | début                |
| end_date   | timestamptz             | fin                  |
| user_id    | uuid (FK vers users.id) | membre concerné      |
| created_at | timestamptz             | par défaut = now()   |

---

## 🧠 Objectif de livraison du POC

- Authentification fonctionnelle avec Magic Link
- Sélecteur d’utilisateur fonctionnel
- Tableau de bord avec calendrier interactif et CRUD basique des événements
- Synchronisation en temps réel entre plusieurs sessions
- Code clair, modulable, conforme aux bonnes pratiques Next.js + Supabase

---

## 💬 Règles de développement

- Toujours commenter les parties importantes du code.
- Séparer clairement la logique front, data et UI.
- Utiliser les hooks et composables (React) pour la logique réutilisable.
- Favoriser la lisibilité et la simplicité avant l’optimisation.

---

## 🔄 Étapes de développement recommandées

1. Initialiser le projet Next.js + Supabase + Tailwind
2. Configurer l’authentification (Magic Link)
3. Créer la structure de la base (`users`, `events`)
4. Mettre en place le sélecteur d’utilisateur et la connexion
5. Intégrer le calendrier avec CRUD Supabase
6. Ajouter la synchronisation Realtime
7. Soigner le design et l’expérience utilisateur
8. Finaliser le README et la documentation

---

## ✅ Critères de succès du POC

- L’utilisateur peut s’identifier facilement (sélection + Magic Link)
- Il accède à un tableau de bord avec un calendrier partagé
- Les événements s’affichent et se synchronisent entre utilisateurs
- L’expérience est fluide, intuitive et moderne

---

### Souhaits du créateur

> “Je veux un POC fluide, propre et simple.  
> La priorité, c’est que tout marche sans friction et que ce soit agréable à utiliser.  
> On doit sentir que c’est un espace familial avant tout, pas une appli de gestion froide.”
