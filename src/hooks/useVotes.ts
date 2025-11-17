"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Vote } from "@/lib/types";

/**
 * Extended vote type with user information (from JOIN)
 */
export interface VoteWithUser extends Vote {
  users: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  } | null;
}

/**
 * Grouped votes by status for easy display
 */
export interface GroupedVotes {
  yes: VoteWithUser[];
  no: VoteWithUser[];
  maybe: VoteWithUser[];
}

/**
 * Vote statistics
 */
export interface VoteStats {
  yes: number;
  no: number;
  maybe: number;
  total: number;
}

interface UseVotesReturn {
  votes: VoteWithUser[];
  groupedVotes: GroupedVotes;
  stats: VoteStats;
  loading: boolean;
  error: string | null;
  getVotesForEvent: (eventId: string) => Promise<void>;
  submitVote: (
    eventId: string,
    userId: string,
    status: "yes" | "no" | "maybe"
  ) => Promise<{ success: boolean; error: string | null }>;
  deleteVote: (
    eventId: string,
    userId: string
  ) => Promise<{ success: boolean; error: string | null }>;
  getUserVote: (eventId: string, userId: string) => VoteWithUser | null;
}

/**
 * Hook to manage event votes
 * Provides CRUD operations for votes with user information
 *
 * Features:
 * - Fetch votes for an event with user details (JOIN)
 * - Submit/update votes (regular users for themselves, admins for anyone)
 * - Delete votes
 * - Group votes by status (yes/no/maybe) for display
 * - Calculate statistics
 */
export function useVotes(): UseVotesReturn {
  const supabase = createClient();
  const [votes, setVotes] = useState<VoteWithUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all votes for a specific event with user information
   */
  const getVotesForEvent = useCallback(
    async (eventId: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from("votes")
          .select(
            `
            *,
            users (
              id,
              name,
              email,
              avatar_url
            )
          `
          )
          .eq("event_id", eventId)
          .order("created_at", { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        setVotes((data as VoteWithUser[]) || []);
      } catch (err: unknown) {
        console.error("[useVotes] Error fetching votes:", err);
        const message =
          err instanceof Error ? err.message : "Failed to fetch votes";
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  /**
   * Submit a vote (create or update)
   * Regular users can only vote for themselves
   * Admins can vote for anyone (handled by RLS policies)
   */
  const submitVote = useCallback(
    async (
      eventId: string,
      userId: string,
      status: "yes" | "no" | "maybe"
    ): Promise<{ success: boolean; error: string | null }> => {
      try {
        // Use upsert to handle both insert and update
        // The unique constraint (event_id, user_id) makes this safe
        const { data, error: upsertError } = await supabase
          .from("votes")
          .upsert(
            {
              event_id: eventId,
              user_id: userId,
              status: status,
            },
            {
              onConflict: "event_id,user_id",
            }
          )
          .select(
            `
            *,
            users (
              id,
              name,
              email,
              avatar_url
            )
          `
          )
          .single();

        if (upsertError) {
          throw upsertError;
        }

        // Update local state optimistically
        if (data) {
          const voteWithUser = data as VoteWithUser;
          setVotes((prev) => {
            const existingIndex = prev.findIndex(
              (v) => v.event_id === eventId && v.user_id === userId
            );

            if (existingIndex >= 0) {
              // Update existing vote
              const updated = [...prev];
              updated[existingIndex] = voteWithUser;
              return updated;
            } else {
              // Add new vote
              return [...prev, voteWithUser];
            }
          });
        }

        return { success: true, error: null };
      } catch (err: unknown) {
        console.error("[useVotes] Error submitting vote:", err);
        const message =
          err instanceof Error ? err.message : "Failed to submit vote";
        return { success: false, error: message };
      }
    },
    [supabase]
  );

  /**
   * Delete a vote
   * Regular users can only delete their own vote
   * Admins can delete any vote (handled by RLS policies)
   */
  const deleteVote = useCallback(
    async (
      eventId: string,
      userId: string
    ): Promise<{ success: boolean; error: string | null }> => {
      try {
        const { error: deleteError } = await supabase
          .from("votes")
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", userId);

        if (deleteError) {
          throw deleteError;
        }

        // Update local state
        setVotes((prev) =>
          prev.filter((v) => !(v.event_id === eventId && v.user_id === userId))
        );

        return { success: true, error: null };
      } catch (err: unknown) {
        console.error("[useVotes] Error deleting vote:", err);
        const message =
          err instanceof Error ? err.message : "Failed to delete vote";
        return { success: false, error: message };
      }
    },
    [supabase]
  );

  /**
   * Get a specific user's vote for an event
   */
  const getUserVote = useCallback(
    (eventId: string, userId: string): VoteWithUser | null => {
      return (
        votes.find((v) => v.event_id === eventId && v.user_id === userId) ||
        null
      );
    },
    [votes]
  );

  /**
   * Group votes by status for easy display
   */
  const groupedVotes: GroupedVotes = {
    yes: votes.filter((v) => v.status === "yes"),
    no: votes.filter((v) => v.status === "no"),
    maybe: votes.filter((v) => v.status === "maybe"),
  };

  /**
   * Calculate vote statistics
   */
  const stats: VoteStats = {
    yes: groupedVotes.yes.length,
    no: groupedVotes.no.length,
    maybe: groupedVotes.maybe.length,
    total: votes.length,
  };

  return {
    votes,
    groupedVotes,
    stats,
    loading,
    error,
    getVotesForEvent,
    submitVote,
    deleteVote,
    getUserVote,
  };
}
