"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { UserSelector } from "./components/UserSelector";
import { MagicLinkForm } from "./components/MagicLinkForm";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SnowfallBackground } from "@/components/christmas/SnowfallBackground";
import { ArrowLeft } from "lucide-react";

/**
 * Page de connexion avec sélection d'utilisateur et Magic Link - Client Component
 *
 * Pattern Supabase 2025:
 * - Crée son propre client Supabase pour l'authentification
 * - Pas de dépendance sur AuthProvider
 * - La validation de session est gérée par les Server Components
 */
export default function LoginPage() {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");

  /**
   * Envoie un Magic Link à l'email spécifié
   */
  const signInWithMagicLink = useCallback(async (email: string) => {
    try {
      const supabase = createClient();

      // Use localhost:3000 explicitly for local dev to match Supabase config
      const redirectUrl =
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000/auth/callback"
          : `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
          shouldCreateUser: true,
        },
      });

      if (error) throw error;
      return { success: true, error: null };
    } catch (error: unknown) {
      console.error("[LoginPage] Error sending Magic Link:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      return { success: false, error: message };
    }
  }, []);

  const handleSelectUser = (email: string, userName: string) => {
    setSelectedEmail(email);
    setSelectedUserName(userName);
  };

  const handleBackToSelection = () => {
    setSelectedEmail(null);
    setSelectedUserName("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-christmas-cream via-christmas-red/10 to-christmas-green/10 p-4 relative overflow-hidden">
      {/* Fond animé avec flocons de neige */}
      <SnowfallBackground />

      <motion.div
        className="w-full max-w-md space-y-6 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* En-tête avec icône de Noël - animation optimisée */}
        <div className="text-center">
          {/* Icône de Noël animée - animation plus subtile */}
          <motion.div
            className="text-6xl mb-4 inline-block"
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
          </motion.div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-christmas-red to-christmas-green bg-clip-text text-transparent">
            Mon Agenda Familial
          </h1>
          <p className="mt-2 text-sm text-gray-700 font-medium">
            Connectez-vous pour accéder au calendrier partagé
          </p>
        </div>

        {/* Carte principale avec animation d'entrée optimisée */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3, ease: "easeOut" }}
        >
          <Card className="border-2 border-christmas-gold/40 shadow-2xl backdrop-blur-sm bg-white/95">
            <CardHeader className="border-b-2 border-christmas-gold/30 bg-gradient-to-r from-christmas-cream/30 to-transparent">
              <CardTitle className="text-christmas-red text-xl font-bold">
                {selectedEmail ? "🎅 Connexion" : "🎁 Sélection du membre"}
              </CardTitle>
            </CardHeader>

            {!selectedEmail ? (
              <div className="p-6 pt-0">
                <UserSelector
                  onSelectUser={handleSelectUser}
                  selectedEmail={selectedEmail}
                />
              </div>
            ) : (
              <div className="p-6 pt-0 space-y-4">
                {/* Bouton retour avec hover optimisé */}
                <Button
                  variant="ghost"
                  onClick={handleBackToSelection}
                  className="text-sm text-christmas-green hover:text-christmas-green-dark hover:bg-christmas-green/10 -ml-2 transition-colors duration-200 font-medium"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Changer de membre
                </Button>
                <MagicLinkForm
                  email={selectedEmail}
                  userName={selectedUserName}
                  onSendMagicLink={signInWithMagicLink}
                />
              </div>
            )}
          </Card>
        </motion.div>

        {/* Message d'info - pas d'animation */}
        <p className="text-center text-xs text-gray-600 font-medium">
          ✨ Un lien de connexion vous sera envoyé par email
        </p>
      </motion.div>
    </div>
  );
}
