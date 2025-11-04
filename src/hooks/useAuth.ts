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
 * Hook to manage authentication and user state
 * Automatically synchronizes with Supabase Auth
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    supabaseUser: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setState({
            user: null,
            supabaseUser: null,
            loading: false,
            error: null,
          });
          return;
        }

        // Fetch user data
        if (session.user.email) {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("email", session.user.email)
            .single();

          if (userError) {
            console.error("[useAuth] Error fetching user data:", userError);
          }

          // Sync auth_id if needed
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
        }
      } catch (error) {
        console.error("[useAuth] Session check failed:", error);
        setState({
          user: null,
          supabaseUser: null,
          loading: false,
          error: null,
        });
      }
    };

    // Initialize and listen for changes
    const initializeAuth = async () => {
      await getInitialSession();

      // Listen for auth state changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: userData } = await supabase
            .from("users")
            .select("*")
            .eq("email", session.user.email)
            .single();

          // Sync auth_id if needed
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

      return subscription;
    };

    const subscriptionPromise = initializeAuth();

    return () => {
      subscriptionPromise.then((sub) => sub?.unsubscribe());
    };
  }, []);

  /**
   * Sends a Magic Link to the specified email
   */
  const signInWithMagicLink = async (email: string) => {
    const supabase = createClient();
    try {
      // Use localhost:3000 explicitly for local dev to match Supabase config
      const redirectUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000/auth/callback"
          : `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
          shouldCreateUser: false, // Don't create new users, only allow existing ones
        },
      });

      if (error) throw error;
      return { success: true, error: null };
    } catch (error: unknown) {
      console.error("[useAuth] Error sending Magic Link:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: message };
    }
  };

  /**
   * Signs out the current user
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
      console.error("[useAuth] Error signing out:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
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
