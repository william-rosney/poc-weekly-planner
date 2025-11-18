"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * User type (simplified for vote management)
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  role: string;
}

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  refreshUsers: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
}

/**
 * Hook to manage users
 * Provides access to user list and current user info
 */
export function useUsers(): UseUsersReturn {
  const supabase = createClient();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all users from Supabase
   */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("users")
        .select("id, name, email, avatar_url, role")
        .order("name", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setUsers(data || []);
    } catch (err: unknown) {
      console.error("[useUsers] Error fetching users:", err);
      const message =
        err instanceof Error ? err.message : "Failed to fetch users";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  /**
   * Get current authenticated user's full info
   */
  const getCurrentUser = useCallback(async (): Promise<User | null> => {
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        return null;
      }

      const { data, error: fetchError } = await supabase
        .from("users")
        .select("id, name, email, avatar_url, role, created_at, updated_at")
        .eq("auth_id", authUser.id)
        .maybeSingle();

      if (fetchError) {
        console.error(
          "[useUsers] Error fetching user from database:",
          fetchError
        );
        return null;
      }

      return data;
    } catch (err: unknown) {
      console.error("[useUsers] Error fetching current user:", err);
      return null;
    }
  }, [supabase]);

  /**
   * Refresh users manually
   */
  const refreshUsers = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  // Initial fetch on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refreshUsers,
    getCurrentUser,
  };
}
