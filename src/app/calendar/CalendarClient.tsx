"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
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
            place: values.place,
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
          place: values.place,
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
    <div className="h-screen flex flex-col overflow-hidden bg-linear-to-br from-background via-primary/10 to-chart-2/10 relative">
      {/* Fond animé avec flocons de neige */}
      <SnowfallBackground />

      {/* Header avec design de Noël - animation d'entrée rapide */}
      <motion.header
        className="sticky top-0 shrink-0 bg-white/95 backdrop-blur-sm shadow-lg border-b-4 border-secondary z-50"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-4">
          {/* Sur mobile: layout en colonne avec 2 lignes, sur desktop: une seule ligne */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            {/* Ligne 1 sur mobile: Titre centré + icône déconnexion */}
            <div className="flex justify-between items-center sm:justify-start">
              {/* Titre avec icône de Noël */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 sm:flex-initial justify-center sm:justify-start">
                <motion.span
                  className="text-xl sm:text-3xl"
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
                <h1 className="text-base sm:text-2xl font-bold bg-linear-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                  Mon Agenda Familial
                </h1>
              </div>

              {/* Bouton déconnexion mobile uniquement (à droite du titre) */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="sm:hidden text-primary hover:bg-primary hover:text-white transition-all duration-200 h-8 w-8 shrink-0"
                aria-label="Déconnexion"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            {/* Ligne 2 sur mobile: Message de bienvenue centré, sur desktop: message + bouton déconnexion */}
            <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-4">
              {/* Message de bienvenue */}
              <span className="text-xs sm:text-sm text-gray-700 font-medium">
                🎅 Bonjour, <strong className="text-primary">{initialUser.name}</strong>
              </span>

              {/* Bouton déconnexion - version desktop uniquement */}
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="hidden sm:flex border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200 font-semibold"
              >
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Contenu principal - animations optimisées */}
      <main className="flex-1 overflow-hidden max-w-7xl w-full mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-4 relative z-10 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
          className="flex-1 flex flex-col min-h-0"
        >
          <Card className="border-2 border-secondary/40 shadow-2xl backdrop-blur-sm bg-white/95 flex-1 flex flex-col min-h-0">
            <CardContent className="p-2 sm:p-4 flex-1 flex flex-col min-h-0">
              {error && (
                <div className="mb-2 sm:mb-4 p-3 sm:p-4 bg-red-50 border-2 border-red-200 rounded-lg shrink-0">
                  <p className="text-red-800 font-semibold text-sm sm:text-base">
                    ⚠️ Erreur lors du chargement des événements
                  </p>
                  <p className="text-red-600 text-xs sm:text-sm mt-1">{error}</p>
                </div>
              )}

              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="h-full">
                  <Calendar
                    events={events}
                    loading={eventsLoading}
                    onEventClick={handleEventClick}
                    onDateSelect={handleDateSelect}
                    onEventUpdate={handleEventUpdate}
                  />
                </div>
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
