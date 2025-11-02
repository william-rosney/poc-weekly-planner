"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@/lib/types";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  error: string | null;
}

/**
 * Timeout wrapper pour les appels async
 * Permet d'éviter les blocages infinis si Supabase ne répond pas
 * Avec un timeout très court pour une UX réactive
 */
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 1000
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
    ),
  ]);
}

/**
 * Hook pour gérer l'authentification et l'état de l'utilisateur
 * Synchronise automatiquement avec Supabase Auth
 *
 * Includes timeout and error handling to prevent infinite loading states
 * when sessions become invalid (e.g., after server restart).
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    supabaseUser: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Créer le client Supabase
    const supabase = createClient();

    // Récupérer la session initiale
    const getInitialSession = async () => {
      try {
        // Approche rapide: timeout très court (800ms) pour détecter les sessions corrompues
        const sessionResult = await withTimeout(
          supabase.auth.getSession(),
          800
        );

        const { session } = sessionResult.data;

        if (!session) {
          // Pas de session, c'est normal si non connecté
          setState({
            user: null,
            supabaseUser: null,
            loading: false,
            error: null,
          });
          return;
        }

        // Valider rapidement avec le serveur (timeout court)
        const {
          data: { user: supabaseUser },
          error,
        } = await withTimeout(supabase.auth.getUser(), 800);

        if (error || !supabaseUser) {
          // Session invalide, nettoyer silencieusement
          console.warn("[useAuth] Invalid session detected, clearing...");
          await withTimeout(supabase.auth.signOut(), 500);
          setState({
            user: null,
            supabaseUser: null,
            loading: false,
            error: null,
          });
          return;
        }

        // Session valide, récupérer les données utilisateur
        if (supabaseUser.email) {
          const getUserData = async () => {
            return await supabase
              .from("users")
              .select("*")
              .eq("email", supabaseUser.email)
              .single();
          };

          const { data: userData, error: userError } = await withTimeout(
            getUserData(),
            1000
          );

          if (userError) {
            console.error("[useAuth] Error fetching user data:", userError);
            setState({
              user: null,
              supabaseUser,
              loading: false,
              error: null,
            });
            return;
          }

          // Synchroniser auth_id si pas déjà fait
          if (userData && !userData.auth_id) {
            await supabase
              .from("users")
              .update({ auth_id: supabaseUser.id })
              .eq("email", supabaseUser.email);
            userData.auth_id = supabaseUser.id;
          }

          setState({
            user: userData,
            supabaseUser,
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
      } catch (error) {
        // Timeout ou erreur: nettoyer immédiatement et continuer
        console.warn(
          "[useAuth] Session check failed (possibly after server restart):",
          error
        );

        // Nettoyer la session corrompue (avec timeout pour ne pas bloquer)
        try {
          await withTimeout(supabase.auth.signOut(), 500);
        } catch (signOutError) {
          // Ignorer les erreurs de sign out, juste continuer
          console.warn("[useAuth] Could not sign out:", signOutError);
        }

        // Continuer sans bloquer l'UI
        setState({
          user: null,
          supabaseUser: null,
          loading: false,
          error: null,
        });
      }
    };

    getInitialSession();

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          // Récupérer les données utilisateur par email avec timeout court
          const getUserData = async () => {
            return await supabase
              .from("users")
              .select("*")
              .eq("email", session.user.email)
              .single();
          };

          const { data: userData, error } = await withTimeout(
            getUserData(),
            1000
          );

          if (error) {
            console.warn(
              "[useAuth] Error fetching user in auth state change:",
              error
            );
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
      } catch (error) {
        console.warn(
          "[useAuth] Error in auth state change listener:",
          error
        );
        // En cas d'erreur, au moins mettre à jour avec l'utilisateur Supabase
        if (session?.user) {
          setState({
            user: null,
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
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      return { success: true, error: null };
    } catch (error: unknown) {
      console.error("Erreur lors de l'envoi du Magic Link:", error);
      const message =
        error instanceof Error ? error.message : "Erreur inconnue";
      return { success: false, error: message };
    }
  };

  /**
   * Déconnecte l'utilisateur
   */
  const signOut = async () => {
    const supabase = createClient();
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
    } catch (error: unknown) {
      console.error("Erreur lors de la déconnexion:", error);
      const message =
        error instanceof Error ? error.message : "Erreur inconnue";
      return { success: false, error: message };
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
