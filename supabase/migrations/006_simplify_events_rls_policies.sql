-- Migration: Simplify RLS policies for family context
-- Description: Dans un contexte familial, tous les membres authentifiés peuvent gérer tous les événements

-- Supprimer les anciennes politiques restrictives
DROP POLICY IF EXISTS "Les utilisateurs authentifiés peuvent créer des événements" ON events;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leurs propres événements" ON events;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs propres événements" ON events;

-- Policy: Les utilisateurs authentifiés peuvent créer des événements
-- Contexte familial : pas besoin de vérifier auth_id
CREATE POLICY "Les utilisateurs authentifiés peuvent créer des événements"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Les utilisateurs authentifiés peuvent modifier tous les événements
-- Contexte familial : partage complet entre membres
CREATE POLICY "Les utilisateurs authentifiés peuvent modifier tous les événements"
  ON events
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Les utilisateurs authentifiés peuvent supprimer tous les événements
-- Contexte familial : gestion partagée
CREATE POLICY "Les utilisateurs authentifiés peuvent supprimer tous les événements"
  ON events
  FOR DELETE
  TO authenticated
  USING (true);
