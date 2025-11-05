"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEvents";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SnowfallBackground } from "@/components/christmas/SnowfallBackground";
import { Calendar } from "@/components/calendar/Calendar";
import { Event } from "@/lib/types";

/**
 * Page du calendrier hebdomadaire
 * Affiche les événements de la famille avec FullCalendar
 */
export default function CalendarPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated, signOut } = useAuth();
  const { events, loading: eventsLoading, error } = useEvents();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const handleEventClick = (_event: Event) => {
    // TODO: Ouvrir un modal avec les détails de l'événement (Étape 3)
  };

  const handleDateSelect = (_start: Date, _end: Date) => {
    // TODO: Ouvrir un modal pour créer un événement (Étape 3)
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-christmas-cream via-christmas-red/10 to-christmas-green/10 relative overflow-hidden">
        <SnowfallBackground />
        <motion.div
          className="text-center relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-christmas-red border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-700 font-medium">
            Chargement...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-christmas-cream via-christmas-red/10 to-christmas-green/10 relative overflow-hidden">
      {/* Fond animé avec flocons de neige */}
      <SnowfallBackground />

      {/* Header avec design de Noël - animation d'entrée rapide */}
      <motion.header
        className="bg-white/95 backdrop-blur-sm shadow-lg border-b-4 border-christmas-gold relative z-10"
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
              <strong className="text-christmas-red">{user.name}</strong>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
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

              <Calendar
                events={events}
                loading={eventsLoading}
                onEventClick={handleEventClick}
                onDateSelect={handleDateSelect}
              />
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
