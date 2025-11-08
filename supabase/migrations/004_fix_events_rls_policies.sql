-- Migration: Fix RLS policies for events table
-- Description: Corriger les politiques RLS pour utiliser auth_id au lieu de user_id

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent créer des événements" ON events;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leurs propres événements" ON events;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs propres événements" ON events;

-- Policy: Les utilisateurs authentifiés peuvent créer des événements
-- Vérifie que auth.uid() correspond au auth_id de l'utilisateur dans la table users
CREATE POLICY "Les utilisateurs authentifiés peuvent créer des événements"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = events.user_id
      AND users.auth_id = auth.uid()
    )
  );

-- Policy: Les utilisateurs peuvent modifier leurs propres événements
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres événements"
  ON events
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = events.user_id
      AND users.auth_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = events.user_id
      AND users.auth_id = auth.uid()
    )
  );

-- Policy: Les utilisateurs peuvent supprimer leurs propres événements
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres événements"
  ON events
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = events.user_id
      AND users.auth_id = auth.uid()
    )
  );
