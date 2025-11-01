# Migrations Supabase

Ce dossier contient les migrations SQL pour configurer la base de données Supabase.

## Comment appliquer les migrations

### Option 1 : Via l'interface web Supabase (Recommandé pour le POC)

1. Connectez-vous à [https://app.supabase.com/](https://app.supabase.com/)
2. Sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur **SQL Editor**
4. Cliquez sur **New query**
5. Copiez-collez le contenu de chaque fichier de migration **dans l'ordre** :
   - `001_create_users.sql`
   - `002_create_events.sql`
   - `003_enable_events_rls.sql`
6. Exécutez chaque requête en cliquant sur **Run** (ou `Ctrl+Enter`)

### Option 2 : Via Supabase CLI

Si vous préférez utiliser la ligne de commande :

```bash
# Installer Supabase CLI (si pas déjà fait)
npm install -g supabase

# Se connecter à Supabase
supabase login

# Lier votre projet local au projet Supabase
supabase link --project-ref njdquksyyhexnrqxrhun

# Appliquer les migrations
supabase db push
```

## Configuration des utilisateurs

Après avoir appliqué la migration `001_create_users.sql`, vous devez modifier les emails des membres de la famille.

### Modifier les emails dans la migration

Avant d'exécuter `001_create_users.sql`, remplacez les emails d'exemple par les vrais emails de votre famille :

```sql
-- Dans 001_create_users.sql, ligne ~55
INSERT INTO users (id, email, name, role) VALUES
  (gen_random_uuid(), 'votre-email@exemple.com', 'Votre Nom', 'admin'),
  (gen_random_uuid(), 'membre2@exemple.com', 'Membre 2', 'admin'),
  (gen_random_uuid(), 'membre3@exemple.com', 'Membre 3', 'member'),
  (gen_random_uuid(), 'membre4@exemple.com', 'Membre 4', 'member')
ON CONFLICT (email) DO NOTHING;
```

### Ou ajouter des utilisateurs après coup

Si vous avez déjà exécuté la migration, vous pouvez ajouter/modifier les utilisateurs via SQL Editor :

```sql
-- Supprimer les utilisateurs d'exemple
DELETE FROM users WHERE email LIKE '%@exemple.com';

-- Ajouter vos vrais utilisateurs
INSERT INTO users (id, email, name, role) VALUES
  (gen_random_uuid(), 'papa@famille.com', 'Papa', 'admin'),
  (gen_random_uuid(), 'maman@famille.com', 'Maman', 'admin'),
  (gen_random_uuid(), 'enfant1@famille.com', 'Enfant 1', 'member')
ON CONFLICT (email) DO NOTHING;
```

## Vérification

Pour vérifier que tout fonctionne :

```sql
-- Vérifier les utilisateurs
SELECT * FROM users;

-- Vérifier que RLS est activé
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'users';

-- Vérifier les policies
SELECT * FROM pg_policies WHERE tablename = 'users';
```

## Structure des tables

### Table `users`

- `id` : UUID (lié à auth.users)
- `email` : Email unique
- `name` : Nom complet
- `avatar_url` : URL de l'avatar (optionnel)
- `role` : 'admin' ou 'member'
- `created_at`, `updated_at` : Timestamps automatiques

### Table `events`

- `id` : UUID
- `title` : Titre de l'événement
- `description` : Description (optionnel)
- `start_time` : Date/heure de début
- `end_time` : Date/heure de fin
- `user_id` : Créateur (FK vers users)
- `link` : Lien optionnel
- `cost_per_person` : Coût par personne (optionnel)
- `color` : Couleur d'affichage
- `created_at`, `updated_at` : Timestamps automatiques

## Row Level Security (RLS)

### Policies sur `users`

- **SELECT** : Tous les utilisateurs authentifiés peuvent voir tous les profils
- **UPDATE** : Les utilisateurs peuvent modifier leur propre profil

### Policies sur `events`

- **SELECT** : Tous les membres peuvent voir tous les événements (contexte familial)
- **INSERT** : Les utilisateurs authentifiés peuvent créer des événements
- **UPDATE** : Les utilisateurs peuvent modifier leurs propres événements
- **DELETE** : Les utilisateurs peuvent supprimer leurs propres événements

## Prochaines étapes

Une fois les migrations appliquées :

1. Vérifiez que les utilisateurs sont bien créés
2. Testez la connexion avec Magic Link depuis l'application
3. Passez à l'étape 2 : Intégration du calendrier
