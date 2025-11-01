import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Les variables d'environnement Supabase ne sont pas configurées. " +
      "Veuillez créer un fichier .env.local avec NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

/**
 * Client Supabase pour les opérations côté client
 * Utilisé pour l'authentification, les requêtes de données et les subscriptions en temps réel
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
