"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SnowfallBackground } from "@/components/christmas/SnowfallBackground";
import SantaClause from "@/components/christmas/SantaClause";

/**
 * Page temporaire du calendrier
 * Sera complétée à l'étape 2 avec FullCalendar
 */
export default function CalendarPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-christmas-cream via-christmas-red/10 to-christmas-green/10 relative overflow-hidden">
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
    <div className="min-h-screen bg-gradient-to-br from-christmas-cream via-christmas-red/10 to-christmas-green/10 relative overflow-hidden">
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-christmas-red to-christmas-green bg-clip-text text-transparent">
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
            <CardHeader className="border-b-2 border-christmas-gold/30 bg-gradient-to-r from-christmas-cream/30 to-transparent">
              <CardTitle className="text-christmas-red flex items-center gap-2 text-xl font-bold">
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  🎁
                </motion.span>
                Calendrier de la semaine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                {/* Icône principale avec animation de floating */}
                <motion.div
                  className="text-8xl mb-6 inline-block"
                  animate={{
                    y: [0, -12, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  📅
                </motion.div>

                <h2 className="text-2xl font-bold text-christmas-red mb-3">
                  ✨ Calendrier en cours de développement
                </h2>

                <p className="text-gray-700 mb-6 font-medium">
                  L&apos;intégration de FullCalendar sera réalisée à
                  l&apos;étape 2
                </p>

                {/* Éléments décoratifs animés - animations synchronisées */}
                <div className="flex justify-center gap-8 text-5xl mt-8">
                  <motion.span
                    animate={{
                      y: [0, -12, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0,
                    }}
                    className="scale-50"
                  >
                    <SantaClause />
                  </motion.span>
                  <motion.span
                    animate={{
                      y: [0, -12, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.3,
                    }}
                  >
                    🎄
                  </motion.span>
                  <motion.span
                    animate={{
                      y: [0, -12, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.6,
                    }}
                  >
                    🎁
                  </motion.span>
                  <motion.span
                    animate={{
                      y: [0, -12, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.9,
                    }}
                  >
                    ⛄
                  </motion.span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
