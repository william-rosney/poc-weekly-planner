-- Migration: Permettre à tous les utilisateurs de gérer tous les événements
-- Description: Dans un contexte familial, tous les membres peuvent modifier et supprimer
--              tous les événements (pas seulement les leurs)

-- Supprimer les anciennes politiques restrictives
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leurs propres événements" ON events;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs propres événements" ON events;

-- Policy UPDATE: Tous les utilisateurs authentifiés peuvent modifier tous les événements
CREATE POLICY "Tous les utilisateurs authentifiés peuvent modifier tous les événements"
  ON events
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy DELETE: Tous les utilisateurs authentifiés peuvent supprimer tous les événements
CREATE POLICY "Tous les utilisateurs authentifiés peuvent supprimer tous les événements"
  ON events
  FOR DELETE
  TO authenticated
  USING (true);

-- Commentaire pour documentation
COMMENT ON TABLE events IS
'Table des événements du calendrier familial.
Tous les membres de la famille peuvent voir, créer, modifier et supprimer tous les événements.
Contexte: Partage familial sans restrictions de propriété individuelle.';
