-- Nettoyer d'abord
DROP TABLE IF EXISTS users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Créer la table users (indépendante de auth.users)
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid UNIQUE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  avatar_url text,
  role text DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_id ON users(auth_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Activer RLS sur la table users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Permettre la lecture publique (nécessaire pour la page de login)
CREATE POLICY "Permettre la lecture de tous les utilisateurs"
  ON users
  FOR SELECT
  USING (true);

-- Policy: Les utilisateurs authentifiés peuvent mettre à jour leur profil
CREATE POLICY "Les utilisateurs authentifiés peuvent mettre à jour leur profil"
  ON users
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insérer vos membres de la famille
-- IMPORTANT: Remplacez par vos vrais emails
INSERT INTO users (email, name, role) VALUES
  ('votre-email@example.com', 'Votre Nom', 'admin')
ON CONFLICT (email) DO NOTHING;