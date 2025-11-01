-- Migration: Enable RLS on events table
-- Description: Activer Row Level Security pour la table events

-- Activer RLS sur la table events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy: Tous les membres de la famille peuvent voir tous les événements
-- (contexte familial - pas de privacy par défaut)
CREATE POLICY "Les membres de la famille peuvent voir tous les événements"
  ON events
  FOR SELECT
  USING (true);

-- Policy: Les utilisateurs authentifiés peuvent créer des événements
CREATE POLICY "Les utilisateurs authentifiés peuvent créer des événements"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent modifier leurs propres événements
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres événements"
  ON events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent supprimer leurs propres événements
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres événements"
  ON events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
