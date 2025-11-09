"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Event } from "@/lib/types";

interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  createEvent: (
    event: Omit<Event, "id" | "created_at" | "updated_at">
  ) => Promise<{ success: boolean; error: string | null; data?: Event }>;
  updateEvent: (
    id: string,
    updates: Partial<Omit<Event, "id" | "created_at" | "updated_at">>
  ) => Promise<{ success: boolean; error: string | null }>;
  deleteEvent: (
    id: string
  ) => Promise<{ success: boolean; error: string | null }>;
  refreshEvents: () => Promise<void>;
}

/**
 * Hook to manage calendar events
 * Provides CRUD operations and real-time synchronization
 *
 * Pattern Supabase 2025:
 * - Crée son propre client Supabase (singleton interne)
 * - Pas de dépendance sur AuthProvider/Context
 * - L'authentification est gérée par les Server Components
 */
export function useEvents(): UseEventsReturn {
  // Créer une instance du client Supabase (singleton interne)
  const supabase = createClient();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all events from Supabase
   */
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("events")
        .select("*")
        .order("start_time", { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setEvents(data || []);
    } catch (err: unknown) {
      console.error("[useEvents] Error fetching events:", err);
      const message =
        err instanceof Error ? err.message : "Failed to fetch events";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  /**
   * Create a new event
   */
  const createEvent = useCallback(
    async (
      event: Omit<Event, "id" | "created_at" | "updated_at">
    ): Promise<{ success: boolean; error: string | null; data?: Event }> => {
      try {
        const { data, error: insertError } = await supabase
          .from("events")
          .insert([event])
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        // Update local state
        if (data) {
          setEvents((prev) => [...prev, data]);
        }

        return { success: true, error: null, data: data || undefined };
      } catch (err: unknown) {
        console.error("[useEvents] Error creating event:", err);
        const message =
          err instanceof Error ? err.message : "Failed to create event";
        return { success: false, error: message };
      }
    },
    [supabase]
  );

  /**
   * Update an existing event
   */
  const updateEvent = useCallback(
    async (
      id: string,
      updates: Partial<Omit<Event, "id" | "created_at" | "updated_at">>
    ): Promise<{ success: boolean; error: string | null }> => {
      try {
        const { data, error: updateError } = await supabase
          .from("events")
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        // Update local state
        if (data) {
          setEvents((prev) =>
            prev.map((event) => (event.id === id ? data : event))
          );
        }

        return { success: true, error: null };
      } catch (err: unknown) {
        console.error("[useEvents] Error updating event:", err);
        const message =
          err instanceof Error ? err.message : "Failed to update event";
        return { success: false, error: message };
      }
    },
    [supabase]
  );

  /**
   * Delete an event
   */
  const deleteEvent = useCallback(
    async (id: string): Promise<{ success: boolean; error: string | null }> => {
      try {
        const { error: deleteError } = await supabase
          .from("events")
          .delete()
          .eq("id", id);

        if (deleteError) {
          throw deleteError;
        }

        // Update local state
        setEvents((prev) => prev.filter((event) => event.id !== id));

        return { success: true, error: null };
      } catch (err: unknown) {
        console.error("[useEvents] Error deleting event:", err);
        const message =
          err instanceof Error ? err.message : "Failed to delete event";
        return { success: false, error: message };
      }
    },
    [supabase]
  );

  /**
   * Refresh events manually
   */
  const refreshEvents = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  // Initial fetch on mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents,
  };
}
