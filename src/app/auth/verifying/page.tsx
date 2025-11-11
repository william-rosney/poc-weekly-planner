import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { VerifyingClient } from "./VerifyingClient";

/**
 * Page de vérification de session après authentification - Server Component
 *
 * Cette page :
 * 1. Vérifie la session de l'utilisateur
 * 2. S'assure que auth_id est lié dans public.users (fallback si trigger DB échoue)
 * 3. Affiche un spinner via le Client Component
 * 4. Redirige automatiquement vers la destination
 */
export default async function VerifyingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const next = params.next ?? "/calendar";

  // Récupérer l'utilisateur authentifié
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Si pas d'utilisateur authentifié, rediriger vers login
  if (userError || !user) {
    console.error("[VerifyingPage] No authenticated user:", userError);
    redirect("/login?error=no_session");
  }

  // Vérifier si l'auth_id est déjà lié dans public.users
  const { data: publicUser, error: fetchError } = await supabase
    .from("users")
    .select("id, auth_id, email")
    .eq("email", user.email)
    .maybeSingle();

  if (fetchError) {
    console.error("[VerifyingPage] Error fetching public user:", fetchError);
  }

  // Si l'utilisateur existe mais auth_id est NULL, le mettre à jour (fallback)
  if (publicUser && !publicUser.auth_id) {
    const { error: updateError } = await supabase
      .from("users")
      .update({ auth_id: user.id })
      .eq("id", publicUser.id);

    if (updateError) {
      console.error(
        "[VerifyingPage] Error updating auth_id (fallback):",
        updateError
      );
    }
  }

  // Afficher le spinner de chargement et rediriger côté client
  return <VerifyingClient next={next} />;
}
