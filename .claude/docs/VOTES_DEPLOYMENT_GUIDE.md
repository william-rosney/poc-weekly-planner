# Guide de Déploiement et Test - Système de Votes

Ce document explique comment déployer et tester le nouveau système de votes (Étape 4).

---

## 📋 Prérequis

Avant de commencer, assurez-vous que :

- ✅ La base de données Supabase est accessible
- ✅ Les migrations précédentes (001-008) sont appliquées
- ✅ Vous avez accès à la CLI Supabase ou au dashboard Supabase
- ✅ Au moins un utilisateur avec `role = 'admin'` existe dans la table `users`

---

## 🚀 Étape 1 : Appliquer la Migration SQL

### Option A : Via Supabase CLI (Recommandé)

```bash
# Depuis la racine du projet
supabase db push
```

Cette commande appliquera automatiquement la migration `009_create_votes_table.sql`.

### Option B : Via le Dashboard Supabase

1. Ouvrez le [Dashboard Supabase](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Ouvrez le fichier `supabase/migrations/009_create_votes_table.sql`
5. Copiez tout le contenu
6. Collez dans l'éditeur SQL
7. Cliquez sur **Run**

### Vérification

Vérifiez que la table `votes` a été créée :

```sql
SELECT * FROM votes LIMIT 1;
```

Vérifiez que le type enum `vote_status` existe :

```sql
SELECT enum_range(NULL::vote_status);
```

Résultat attendu : `{yes,no,maybe}`

---

## 🔐 Étape 2 : Vérifier les RLS Policies

Assurez-vous que les policies de sécurité sont actives :

```sql
-- Vérifier que RLS est activé
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'votes';
-- Doit retourner: rowsecurity = true

-- Lister les policies
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'votes';
```

Vous devriez voir **7 policies** :
1. Anyone can view votes (SELECT)
2. Users can create their own vote (INSERT)
3. Admins can create any vote (INSERT)
4. Users can update their own vote (UPDATE)
5. Admins can update any vote (UPDATE)
6. Users can delete their own vote (DELETE)
7. Admins can delete any vote (DELETE)

---

## 👤 Étape 3 : Vérifier les Utilisateurs

Assurez-vous que tous les utilisateurs authentifiés ont un enregistrement dans la table `users` :

```sql
-- Lister tous les utilisateurs
SELECT id, name, email, role FROM users ORDER BY name;
```

### Créer un utilisateur admin (si nécessaire)

Si vous n'avez pas d'utilisateur admin, créez-en un :

```sql
-- Remplacez 'user-uuid-here' par l'ID d'un utilisateur existant
UPDATE users
SET role = 'admin'
WHERE email = 'votre-email@exemple.com';
```

---

## 🧪 Étape 4 : Tests Manuels

### Test 1 : Utilisateur Normal - Voter pour soi-même

1. **Se connecter** avec un utilisateur normal (non-admin)
2. **Ouvrir un événement** dans le calendrier
3. **Vérifier** que la section "Participations" apparaît
4. **Voter** en cliquant sur "Je participe", "Je ne participe pas" ou "Je ne sais pas"
5. **Vérifier** que :
   - Le bouton sélectionné est visuellement distinct (couleur, ✓)
   - Votre nom apparaît dans la liste correspondante
   - Les statistiques se mettent à jour (nombre de participants)
6. **Changer de vote** en cliquant sur une autre option
7. **Vérifier** que :
   - Votre nom est déplacé vers la nouvelle liste
   - Vous n'apparaissez **pas** dans 2 listes simultanément (exclusivité)

### Test 2 : Plusieurs Utilisateurs - Synchronisation

1. **Ouvrir l'événement** dans 2 navigateurs différents (ou onglets en navigation privée)
2. **Se connecter** avec 2 utilisateurs différents
3. **Voter** avec chaque utilisateur
4. **Rafraîchir** les pages
5. **Vérifier** que les votes des 2 utilisateurs apparaissent correctement

### Test 3 : Utilisateur Admin - Modifier les Votes

1. **Se connecter** avec un utilisateur admin
2. **Ouvrir un événement**
3. **Vérifier** que le bouton "Gestion des participations (Admin)" apparaît
4. **Cliquer** sur "Modifier"
5. **Modifier** le vote de plusieurs utilisateurs via les dropdowns
6. **Enregistrer**
7. **Vérifier** que :
   - Les listes se mettent à jour immédiatement
   - Aucun utilisateur n'apparaît dans 2 listes (validation d'exclusivité)
   - Les modifications sont persistées (rafraîchir la page)

### Test 4 : Validation de Sécurité RLS

#### Test 4a : User Normal ne peut PAS modifier le vote d'autrui

```sql
-- Depuis le Dashboard SQL Editor, en tant qu'utilisateur normal
-- Remplacez les UUIDs par des valeurs réelles
UPDATE votes
SET status = 'yes'
WHERE user_id != 'votre-user-id' -- ID d'un autre utilisateur
AND event_id = 'event-id';

-- Résultat attendu : 0 rows updated (bloqué par RLS)
```

#### Test 4b : Admin PEUT modifier le vote d'autrui

```sql
-- Depuis le Dashboard SQL Editor, en tant qu'admin
UPDATE votes
SET status = 'yes'
WHERE user_id = 'autre-user-id'
AND event_id = 'event-id';

-- Résultat attendu : 1 row updated (autorisé par RLS)
```

### Test 5 : Contrainte d'Exclusivité

Tentez d'insérer 2 votes pour le même utilisateur sur le même événement :

```sql
-- Première insertion (doit réussir)
INSERT INTO votes (event_id, user_id, status)
VALUES ('event-id', 'user-id', 'yes');

-- Deuxième insertion (doit échouer avec erreur unique constraint)
INSERT INTO votes (event_id, user_id, status)
VALUES ('event-id', 'user-id', 'no');

-- Résultat attendu : ERROR: duplicate key value violates unique constraint "unique_vote_per_user_per_event"
```

---

## 🐛 Dépannage

### Problème 1 : "Cannot coerce the result to a single JSON object"

**Cause :** L'utilisateur authentifié n'existe pas dans la table `users`.

**Solution :**
```sql
-- Vérifier si l'utilisateur existe
SELECT * FROM auth.users WHERE id = 'auth-user-id';

-- Insérer manuellement dans la table users
INSERT INTO users (id, email, name, role)
VALUES ('auth-user-id', 'email@exemple.com', 'Nom Utilisateur', 'member');
```

### Problème 2 : Section "Participations" ne s'affiche pas

**Causes possibles :**
1. L'utilisateur n'est pas connecté
2. La migration n'a pas été appliquée
3. Erreur JavaScript dans la console

**Solution :**
1. Vérifier la console navigateur (F12) pour les erreurs
2. Vérifier que `getCurrentUser()` retourne un utilisateur valide
3. Vérifier que la table `votes` existe

### Problème 3 : "Permission denied" lors du vote

**Cause :** RLS policies mal configurées

**Solution :**
```sql
-- Vérifier les policies
SELECT * FROM pg_policies WHERE tablename = 'votes';

-- Réappliquer la migration si nécessaire
```

### Problème 4 : Interface admin ne s'affiche pas

**Cause :** L'utilisateur n'a pas le rôle 'admin'

**Solution :**
```sql
-- Vérifier le rôle
SELECT id, name, role FROM users WHERE email = 'votre-email@exemple.com';

-- Définir comme admin
UPDATE users SET role = 'admin' WHERE email = 'votre-email@exemple.com';
```

---

## ✅ Checklist de Validation Finale

Avant de marquer l'Étape 4 comme terminée :

- [ ] Migration SQL appliquée avec succès
- [ ] Table `votes` existe avec toutes les colonnes
- [ ] Type enum `vote_status` créé (yes, no, maybe)
- [ ] 7 RLS policies actives
- [ ] Au moins 1 utilisateur admin existe
- [ ] Tous les utilisateurs auth ont un enregistrement dans `users`
- [ ] Test 1 réussi : Utilisateur normal peut voter
- [ ] Test 2 réussi : Synchronisation entre utilisateurs
- [ ] Test 3 réussi : Admin peut modifier les votes
- [ ] Test 4 réussi : Sécurité RLS validée
- [ ] Test 5 réussi : Contrainte d'exclusivité fonctionne
- [ ] Aucune erreur dans la console navigateur
- [ ] TypeScript compile sans erreur (`npm run typecheck`)
- [ ] ESLint passe sans erreur (`npm run lint`)

---

## 📝 Prochaines Étapes

Une fois l'Étape 4 validée, vous pouvez passer à :

- **Étape 5 :** Améliorations UI/UX
- **Étape 6 :** Realtime et cohérence des données (synchronisation automatique des votes)
- **Étape 7 :** Finalisation & tests

---

## 🆘 Besoin d'Aide ?

Si vous rencontrez des problèmes :

1. Vérifiez les logs Supabase (Dashboard > Logs)
2. Vérifiez la console navigateur (F12)
3. Consultez le fichier `CLAUDE.md` pour les conventions du projet
4. Relisez cette documentation

Bon testing ! 🚀
