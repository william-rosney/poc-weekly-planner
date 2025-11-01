# 🗺️ Plan de Développement – Application Familiale de Gestion du Quotidien

## 🎯 Objectif
Ce document définit le **plan détaillé des fonctionnalités** à implémenter pour atteindre la **version 1 (v1)** du proof of concept.  
L’objectif est d’avancer par **petites itérations**, chacune livrant une partie fonctionnelle, stable et testable.

---

## 🧩 Étape 0 – Initialisation du projet
### 🎯 Objectif
Poser les bases techniques du projet.

### 🧱 Tâches
- [ ] Initialiser le projet **Next.js 15** avec **TypeScript**
- [ ] Ajouter et configurer **Tailwind CSS**
- [ ] Ajouter et configurer **shadcn/ui**
- [ ] Configurer **Framer Motion**
- [ ] Créer la structure de base du dossier `/app`
- [ ] Créer la configuration du client **Supabase** (`lib/supabaseClient.ts`)
- [ ] Configurer ESLint + Prettier + conventions de code
- [ ] Ajouter un README de projet

### ✅ Livrable
Une application Next.js vierge avec la stack installée et fonctionnelle.

---

## 🧩 Étape 1 – Authentification et gestion des utilisateurs
### 🎯 Objectif
Permettre aux membres de la famille de se connecter via un **Magic Link**.

### 🧱 Tâches
- [ ] Créer la table `users` dans Supabase
- [ ] Pré-enregistrer les membres de la famille (nom + email)
- [ ] Mettre en place Supabase Auth avec Magic Link
- [ ] Créer la page `/login` avec la liste des membres (sélecteur d’utilisateur)
- [ ] Ajouter l’envoi du Magic Link après sélection d’un membre
- [ ] Gérer la redirection automatique après authentification
- [ ] Mettre en place le stockage de session utilisateur (auth persistente)

### ✅ Livrable
Une page de connexion fonctionnelle avec authentification Supabase.

---

## 🧩 Étape 2 – Tableau de bord de la semaine
### 🎯 Objectif
Afficher une **vue calendrier** de la semaine et permettre la navigation entre semaines.

### 🧱 Tâches
- [ ] Créer la table `events` dans Supabase
- [ ] Intégrer **FullCalendar** dans la page `/calendar`
- [ ] Configurer la vue hebdomadaire sur mobile et desktop
  - Mobile : affichage d’un seul jour à la fois
  - Web : affichage de la semaine complète
- [ ] Ajouter la navigation entre semaines
- [ ] Charger les événements depuis Supabase (SSR ou Realtime)

### ✅ Livrable
Un calendrier fonctionnel affichant les événements enregistrés dans la base.

---

## 🧩 Étape 3 – CRUD des événements
### 🎯 Objectif
Permettre d’ajouter, modifier et supprimer des événements dans le calendrier.

### 🧱 Tâches
- [ ] Créer un composant modal ou drawer pour ajouter/éditer un événement
- [ ] Champs requis :
  - [ ] Titre
  - [ ] Date / heure
  - [ ] Lien (optionnel)
  - [ ] Coût par personne (optionnel)
- [ ] Validation des formulaires (React Hook Form + Zod)
- [ ] Ajout en base Supabase
- [ ] Mise à jour et suppression des événements
- [ ] Rafraîchissement automatique via Realtime

### ✅ Livrable
Un calendrier interactif avec CRUD complet des événements.

---

## 🧩 Étape 4 – Système de votes pour les événements
### 🎯 Objectif
Permettre aux membres de voter sur leur participation à chaque événement.

### 🧱 Tâches
- [ ] Créer la table `votes` :  
  - id (uuid), event_id (FK), user_id (FK), status (enum : "yes" | "no" | "maybe")
- [ ] Ajouter un composant de vote sur chaque événement
- [ ] Sauvegarder les votes dans Supabase
- [ ] Afficher le résumé des votes (ex. : 3 oui, 1 non, 1 peut-être)
- [ ] Mettre à jour les votes en temps réel

### ✅ Livrable
Un calendrier interactif où chaque membre peut voter sur les événements.

---

## 🧩 Étape 5 – Améliorations UI/UX
### 🎯 Objectif
Améliorer l’expérience visuelle et la fluidité de navigation.

### 🧱 Tâches
- [ ] Thème visuel doux et chaleureux (familial)
- [ ] Animation d’ouverture/fermeture (Framer Motion)
- [ ] Responsivité mobile / desktop
- [ ] Ajout d’un indicateur de chargement et d’erreur
- [ ] Ajout d’un feedback utilisateur (snackbar, toasts)
- [ ] Icônes personnalisées (Heroicons ou Lucide)

### ✅ Livrable
Une interface fluide et agréable à utiliser sur tous les écrans.

---

## 🧩 Étape 6 – Realtime et cohérence des données
### 🎯 Objectif
Synchroniser automatiquement le calendrier entre plusieurs utilisateurs.

### 🧱 Tâches
- [ ] Configurer Supabase Realtime sur la table `events`
- [ ] Écouter les changements (insert, update, delete)
- [ ] Mettre à jour le calendrier dynamiquement
- [ ] Tester sur plusieurs navigateurs / sessions simultanées

### ✅ Livrable
Une expérience partagée en temps réel entre les membres de la famille.

---

## 🧩 Étape 7 – Finalisation & tests
### 🎯 Objectif
Stabiliser le POC et valider la cohérence de l’ensemble.

### 🧱 Tâches
- [ ] Tests manuels de chaque flux utilisateur
- [ ] Vérification de la sécurité RLS Supabase
- [ ] Nettoyage du code et commentaires
- [ ] Ajout d’une documentation rapide dans le README

### ✅ Livrable
Version stable du POC prête à être utilisée pendant le séjour au chalet 🎄

---

## 🧩 Étape 8 (optionnelle) – Préparation à l’hébergement
### 🎯 Objectif
Rendre le POC accessible à tous les membres de la famille.

### 🧱 Tâches
- [ ] Déploiement sur **Vercel**
- [ ] Configuration des variables d’environnement (Supabase URL & Keys)
- [ ] Test complet de l’authentification Magic Link sur le déploiement
- [ ] Validation finale sur mobile et desktop

### ✅ Livrable
Une version hébergée, accessible à tous les membres de la famille.

---

## 🧭 Résumé visuel des étapes
| Étape | Nom | Objectif principal |
|-------|-----|---------------------|
| 0 | Initialisation | Setup du projet Next.js + Tailwind + Supabase |
| 1 | Auth | Magic Link + Sélecteur d’utilisateur |
| 2 | Calendrier | Vue hebdo avec FullCalendar |
| 3 | CRUD | Gestion complète des événements |
| 4 | Votes | Système de participation |
| 5 | UX | Animations + UI responsive |
| 6 | Realtime | Synchronisation en direct |
| 7 | Finalisation | Tests + nettoyage |
| 8 | Hébergement | Déploiement sur Vercel |

---

## 🏁 Objectif final
Avoir une application simple, fluide et collaborative où chaque membre de la famille peut :
- Se connecter facilement
- Voir les activités de la semaine
- Voter pour sa participation
- Partager un moment commun dans une interface moderne et intuitive ❤️
