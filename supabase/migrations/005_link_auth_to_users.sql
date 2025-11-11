-- Migration pour lier automatiquement auth.users à public.users
-- Résout le problème où auth_id reste NULL après la première connexion Magic Link

-- Fonction pour lier un utilisateur auth à un utilisateur existant dans public.users
CREATE OR REPLACE FUNCTION link_auth_user_to_public_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le user existant dans public.users avec l'auth_id
  -- uniquement si auth_id est NULL (première connexion)
  UPDATE users
  SET auth_id = NEW.id
  WHERE email = NEW.email
    AND auth_id IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger qui s'exécute après la création d'un utilisateur dans auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION link_auth_user_to_public_user();

-- Commentaire pour documentation
COMMENT ON FUNCTION link_auth_user_to_public_user() IS
'Lie automatiquement un nouvel utilisateur auth.users à un utilisateur existant dans public.users en matchant par email.
S''exécute uniquement si auth_id est NULL (première connexion).';
