-- Migration: Create events table
-- Description: Table pour stocker les événements du calendrier familial

-- Créer la table events
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  link text,
  cost_per_person decimal(10, 2),
  color text DEFAULT 'blue',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Créer un index pour améliorer les performances de recherche par utilisateur
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);

-- Créer un index pour améliorer les performances de recherche par date
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Commentaires sur la table et les colonnes
COMMENT ON TABLE events IS 'Événements du calendrier familial';
COMMENT ON COLUMN events.title IS 'Titre de l''événement';
COMMENT ON COLUMN events.description IS 'Description détaillée de l''événement';
COMMENT ON COLUMN events.start_time IS 'Date et heure de début de l''événement';
COMMENT ON COLUMN events.end_time IS 'Date et heure de fin de l''événement';
COMMENT ON COLUMN events.user_id IS 'Créateur de l''événement';
COMMENT ON COLUMN events.link IS 'Lien optionnel associé à l''événement';
COMMENT ON COLUMN events.cost_per_person IS 'Coût par personne (optionnel)';
COMMENT ON COLUMN events.color IS 'Couleur d''affichage dans le calendrier';
