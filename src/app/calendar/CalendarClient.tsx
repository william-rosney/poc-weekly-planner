"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEvents } from "@/hooks/useEvents";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SnowfallBackground } from "@/components/christmas/SnowfallBackground";
import { Calendar } from "@/components/calendar/Calendar";
import { EventFormDrawer } from "@/components/calendar/EventFormDrawer";
import { FAB } from "@/components/calendar/FAB";
import { Event, User } from "@/lib/types";
import { EventFormValues } from "@/lib/validations/event";
import { createClient } from "@/lib/supabase/client";

interface CalendarClientProps {
  initialUser: User;
}

/**
 * Client Component pour le calendrier
 * Contient toute la logique UI interactive
 * Reçoit les données initiales validées du Server Component parent
 */
export default function CalendarClient({ initialUser }: CalendarClientProps) {
  const router = useRouter();
  const {
    events,
    loading: eventsLoading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useEvents();

  // État pour le drawer et l'événement sélectionné
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [prefilledDates, setPrefilledDates] = useState<{
    start: Date;
    end: Date;
  } | null>(null);

  /**
   * Gère la déconnexion
   */
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh(); // Force refresh pour réexécuter le Server Component
  };

  /**
   * Ouvre le drawer pour créer un nouvel événement via le FAB
   */
  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setPrefilledDates(null);
    setIsDrawerOpen(true);
  };

  /**
   * Ouvre le drawer en mode édition quand on clique sur un événement
   */
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setPrefilledDates(null);
    setIsDrawerOpen(true);
  };

  /**
   * Ouvre le drawer avec dates pré-remplies quand on sélectionne une plage horaire
   */
  const handleDateSelect = (start: Date, end: Date) => {
    setSelectedEvent(null);
    setPrefilledDates({ start, end });
    setIsDrawerOpen(true);
  };

  /**
   * Gère la soumission du formulaire (création ou modification)
   */
  const handleFormSubmit = async (values: EventFormValues) => {
    try {
      if (selectedEvent) {
        // Mode édition
        const { success, error: updateError } = await updateEvent(
          selectedEvent.id,
          {
            title: values.title,
            start_time: values.start_time.toISOString(),
            end_time: values.end_time.toISOString(),
            description: values.description,
            link: values.link,
            cost_per_person: values.cost_per_person,
            color: values.color,
          }
        );

        if (!success) {
          console.error("[CalendarClient] Error updating event:", updateError);
          alert("Erreur lors de la modification de l'événement");
        }
      } else {
        // Mode création
        const { success, error: createError } = await createEvent({
          title: values.title,
          start_time: values.start_time.toISOString(),
          end_time: values.end_time.toISOString(),
          description: values.description,
          link: values.link,
          cost_per_person: values.cost_per_person,
          color: values.color,
          user_id: values.user_id,
        });

        if (!success) {
          console.error("[CalendarClient] Error creating event:", createError);
          alert("Erreur lors de la création de l'événement");
        }
      }
    } catch (err: unknown) {
      console.error("[CalendarClient] Unexpected error:", err);
      alert("Une erreur inattendue s'est produite");
    }
  };

  /**
   * Gère la suppression d'un événement
   */
  const handleDeleteEvent = async (eventId: string) => {
    const { success, error: deleteError } = await deleteEvent(eventId);

    if (!success) {
      console.error("[CalendarClient] Error deleting event:", deleteError);
      alert("Erreur lors de la suppression de l'événement");
    }
  };

  /**
   * Gère le drag and drop d'un événement (modification de date/heure)
   */
  const handleEventUpdate = async (eventId: string, start: Date, end: Date) => {
    const { success, error: updateError } = await updateEvent(eventId, {
      start_time: start.toISOString(),
      end_time: end.toISOString(),
    });

    if (!success) {
      console.error(
        "[CalendarClient] Error updating event via drag:",
        updateError
      );
      throw new Error(updateError || "Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-linear-to-br from-christmas-cream via-christmas-red/10 to-christmas-green/10 relative">
      {/* Fond animé avec flocons de neige */}
      <SnowfallBackground />

      {/* Header avec design de Noël - animation d'entrée rapide */}
      <motion.header
        className="shrink-0 bg-white/95 backdrop-blur-sm shadow-lg border-b-4 border-christmas-gold relative z-10"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap justify-between items-center gap-4">
          {/* Titre avec icône de Noël */}
          <div className="flex items-center gap-3">
            <motion.span
              className="text-3xl"
              animate={{
                rotate: [0, -8, 8, -8, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatDelay: 4,
                ease: "easeInOut",
              }}
            >
              🎄
            </motion.span>
            <h1 className="text-2xl font-bold bg-linear-to-r from-christmas-red to-christmas-green bg-clip-text text-transparent">
              Mon Agenda Familial
            </h1>
          </div>

          {/* Section utilisateur et déconnexion - hover optimisé */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 font-medium">
              🎅 Bonjour,{" "}
              <strong className="text-christmas-red">{initialUser.name}</strong>
            </span>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="border-2 border-christmas-red text-christmas-red hover:bg-christmas-red hover:text-white transition-all duration-200 font-semibold"
            >
              Déconnexion
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Contenu principal - animations optimisées */}
      <main className="flex-1 overflow-y-auto max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
        >
          <Card className="border-2 border-christmas-gold/40 shadow-2xl backdrop-blur-sm bg-white/95">
            <CardContent className="p-4">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <p className="text-red-800 font-semibold">
                    ⚠️ Erreur lors du chargement des événements
                  </p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              )}

              <div style={{ height: "calc(100vh - 280px)" }}>
                <Calendar
                  events={events}
                  loading={eventsLoading}
                  onEventClick={handleEventClick}
                  onDateSelect={handleDateSelect}
                  onEventUpdate={handleEventUpdate}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Floating Action Button */}
      <FAB onClick={handleCreateEvent} />

      {/* Event Form Drawer */}
      <EventFormDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        event={selectedEvent}
        userId={initialUser.id}
        prefilledDates={prefilledDates}
        onSubmit={handleFormSubmit}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}
