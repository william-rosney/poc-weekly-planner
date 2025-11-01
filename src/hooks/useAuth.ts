"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { User } from "@/lib/types";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook pour gérer l'authentification et l'état de l'utilisateur
 * Synchronise automatiquement avec Supabase Auth
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    supabaseUser: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Récupérer la session initiale
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: error.message,
          }));
          return;
        }

        if (session?.user) {
          // Récupérer les données utilisateur de la table users par email
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("email", session.user.email)
            .single();

          if (userError) {
            console.error(
              "Erreur lors de la récupération des données utilisateur:",
              userError
            );
            setState((prev) => ({
              ...prev,
              supabaseUser: session.user,
              loading: false,
            }));
            return;
          }

          // Synchroniser auth_id si pas déjà fait
          if (userData && !userData.auth_id) {
            await supabase
              .from("users")
              .update({ auth_id: session.user.id })
              .eq("email", session.user.email);
            userData.auth_id = session.user.id;
          }

          setState({
            user: userData,
            supabaseUser: session.user,
            loading: false,
            error: null,
          });
        } else {
          setState((prev) => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la session:", error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Erreur de connexion",
        }));
      }
    };

    getInitialSession();

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Récupérer les données utilisateur par email
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("email", session.user.email)
          .single();

        // Synchroniser auth_id si pas déjà fait
        if (userData && !userData.auth_id) {
          await supabase
            .from("users")
            .update({ auth_id: session.user.id })
            .eq("email", session.user.email);
          userData.auth_id = session.user.id;
        }

        setState({
          user: userData || null,
          supabaseUser: session.user,
          loading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          supabaseUser: null,
          loading: false,
          error: null,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Envoie un Magic Link à l'email spécifié
   */
  const signInWithMagicLink = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Erreur lors de l'envoi du Magic Link:", error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Déconnecte l'utilisateur
   */
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setState({
        user: null,
        supabaseUser: null,
        loading: false,
        error: null,
      });
      return { success: true, error: null };
    } catch (error: any) {
      console.error("Erreur lors de la déconnexion:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    user: state.user,
    supabaseUser: state.supabaseUser,
    loading: state.loading,
    error: state.error,
    signInWithMagicLink,
    signOut,
    isAuthenticated: !!state.user,
  };
}
