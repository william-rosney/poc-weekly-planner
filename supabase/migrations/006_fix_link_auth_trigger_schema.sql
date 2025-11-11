-- Migration pour corriger le trigger link_auth_user_to_public_user
-- Problème : Le trigger utilisait UPDATE users sans spécifier le schéma public
-- Cela causait une erreur car il essayait de mettre à jour auth.users au lieu de public.users

-- Recréer la fonction avec le schéma explicite
CREATE OR REPLACE FUNCTION link_auth_user_to_public_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le user existant dans public.users avec l'auth_id
  -- uniquement si auth_id est NULL (première connexion)
  -- IMPORTANT: Utiliser public.users explicitement pour éviter les conflits de schéma
  UPDATE public.users
  SET auth_id = NEW.id
  WHERE email = NEW.email
    AND auth_id IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Le trigger on_auth_user_created existe déjà, pas besoin de le recréer
-- Il utilisera automatiquement la nouvelle définition de la fonction

-- Commentaire pour documentation
COMMENT ON FUNCTION link_auth_user_to_public_user() IS
'Lie automatiquement un nouvel utilisateur auth.users à un utilisateur existant dans public.users en matchant par email.
S''exécute uniquement si auth_id est NULL (première connexion).
FIXÉ: Utilise maintenant public.users explicitement pour éviter les conflits de schéma.';
