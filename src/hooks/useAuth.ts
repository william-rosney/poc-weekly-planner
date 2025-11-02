"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@/lib/types";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { withTimeout } from "@/lib/timeout";
import { TIMEOUTS } from "@/lib/constants";

interface AuthState {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to manage authentication and user state
 * Automatically synchronizes with Supabase Auth
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
    // Create Supabase client
    const supabase = createClient();

    // Retrieve initial session
    const getInitialSession = async () => {
      try {
        // Fast check with generous timeout to detect corrupted sessions
        const sessionResult = await withTimeout(
          supabase.auth.getSession(),
          TIMEOUTS.SESSION_CHECK
        );

        const { session } = sessionResult.data;

        if (!session) {
          // No session - normal if not logged in
          setState({
            user: null,
            supabaseUser: null,
            loading: false,
            error: null,
          });
          return;
        }

        // Validate with server using generous timeout
        const {
          data: { user: supabaseUser },
          error,
        } = await withTimeout(supabase.auth.getUser(), TIMEOUTS.SESSION_CHECK);

        if (error || !supabaseUser) {
          // Invalid session, clean up silently
          console.warn("[useAuth] Invalid session detected, clearing...");
          await withTimeout(supabase.auth.signOut(), TIMEOUTS.SIGN_OUT);
          setState({
            user: null,
            supabaseUser: null,
            loading: false,
            error: null,
          });
          return;
        }

        // Valid session, fetch user data
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
            TIMEOUTS.USER_FETCH
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

          // Synchronize auth_id if not already set
          if (userData && !userData.auth_id) {
            try {
              const updateAuthId = async () => {
                return await supabase
                  .from("users")
                  .update({ auth_id: supabaseUser.id })
                  .eq("email", supabaseUser.email);
              };

              await withTimeout(updateAuthId(), TIMEOUTS.DB_UPDATE);
              userData.auth_id = supabaseUser.id;
            } catch (updateError) {
              console.warn("[useAuth] Failed to update auth_id:", updateError);
              // Continue anyway - not critical
            }
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
        // Timeout or error: clean up immediately and continue
        console.warn(
          "[useAuth] Session check failed (possibly after server restart):",
          error
        );

        // Clean up corrupted session (with timeout to avoid blocking)
        try {
          await withTimeout(supabase.auth.signOut(), TIMEOUTS.SIGN_OUT);
        } catch (signOutError) {
          // Ignore sign out errors, just continue
          console.warn("[useAuth] Could not sign out:", signOutError);
        }

        // Continue without blocking UI
        setState({
          user: null,
          supabaseUser: null,
          loading: false,
          error: null,
        });
      }
    };

    // IMPORTANT: Wait for initial session before setting up listener
    // This prevents race conditions between initialization and auth state changes
    let subscription: { unsubscribe: () => void } | null = null;

    const initializeAuth = async () => {
      await getInitialSession();

      // Listen for authentication changes
      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        try {
          if (session?.user) {
            // Fetch user data by email with timeout
            const getUserData = async () => {
              return await supabase
                .from("users")
                .select("*")
                .eq("email", session.user.email)
                .single();
            };

            const { data: userData, error } = await withTimeout(
              getUserData(),
              TIMEOUTS.USER_FETCH
            );

            if (error) {
              console.warn(
                "[useAuth] Error fetching user in auth state change:",
                error
              );
            }

            // Synchronize auth_id if not already set
            if (userData && !userData.auth_id) {
              try {
                const updateAuthId = async () => {
                  return await supabase
                    .from("users")
                    .update({ auth_id: session.user.id })
                    .eq("email", session.user.email);
                };

                await withTimeout(updateAuthId(), TIMEOUTS.DB_UPDATE);
                userData.auth_id = session.user.id;
              } catch (updateError) {
                console.warn(
                  "[useAuth] Failed to update auth_id:",
                  updateError
                );
                // Continue anyway - not critical
              }
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
          console.warn("[useAuth] Error in auth state change listener:", error);
          // On error, at least update with Supabase user
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

      subscription = authSubscription;
    };

    initializeAuth();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  /**
   * Sends a Magic Link to the specified email
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
