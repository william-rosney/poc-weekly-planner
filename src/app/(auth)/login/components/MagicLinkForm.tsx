"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";

interface MagicLinkFormProps {
  email: string;
  userName: string;
  onSendMagicLink: (
    email: string
  ) => Promise<{ success: boolean; error: string | null }>;
}

/**
 * Composant pour envoyer le Magic Link
 */
export function MagicLinkForm({
  email,
  userName,
  onSendMagicLink,
}: MagicLinkFormProps) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendLink = async () => {
    setLoading(true);
    setError(null);

    const result = await onSendMagicLink(email);

    setLoading(false);

    if (result.success) {
      setSent(true);
    } else {
      setError(result.error || "Une erreur s'est produite");
    }
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <Card className="border-2 border-christmas-green bg-gradient-to-br from-christmas-green/10 to-christmas-green/5">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Icône de succès avec animation de pop optimisée */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: 0.4,
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
              >
                <CheckCircle2 className="h-16 w-16 text-christmas-green drop-shadow-lg" />
              </motion.div>

              {/* Texte avec animation rapide */}
              <div>
                <h3 className="font-bold text-xl text-christmas-green-dark">
                  🎉 Email envoyé avec succès !
                </h3>
                <p className="text-sm text-gray-700 mt-2">
                  Un lien de connexion magique a été envoyé à{" "}
                  <strong className="text-christmas-red">{email}</strong>
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  ✨ Vérifiez votre boîte de réception et cliquez sur le lien
                  pour vous connecter.
                </p>
              </div>

              {/* Bouton de renvoi - hover optimisé */}
              <Button
                variant="outline"
                onClick={() => setSent(false)}
                className="mt-4 border-2 border-christmas-green text-christmas-green hover:bg-christmas-green hover:text-white transition-all duration-200 font-semibold"
              >
                🔄 Renvoyer le lien
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card className="border-2 border-christmas-gold/40">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Message d'accueil - pas d'animation pour éviter lag */}
            <div className="text-center">
              <h3 className="font-bold text-xl text-christmas-red">
                🎅 Bonjour, {userName} !
              </h3>
              <CardDescription className="mt-2 text-gray-700">
                Cliquez sur le bouton ci-dessous pour recevoir un lien de
                connexion magique par email
              </CardDescription>
            </div>

            {/* Message d'erreur optimisé */}
            {error && (
              <motion.div
                className="flex items-center gap-2 p-3 bg-christmas-red/10 text-christmas-red rounded-md border border-christmas-red/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}

            {/* Affichage de l'email avec style festif - animation subtile supprimée */}
            <div className="bg-linear-to-r from-christmas-cream to-christmas-gold/10 p-4 rounded-lg border-2 border-christmas-gold/40 shadow-sm">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-christmas-gold shrink-0" />
                <p className="text-sm font-semibold text-gray-800 break-all">
                  {email}
                </p>
              </div>
            </div>

            {/* Bouton d'envoi optimisé - texte toujours visible */}
            <Button
              onClick={handleSendLink}
              disabled={loading}
              className="w-full h-11 px-8 inline-flex items-center justify-center rounded-md text-white font-bold bg-linear-to-r from-christmas-red to-christmas-red-light hover:from-christmas-red-dark hover:to-christmas-red shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-christmas-red focus-visible:ring-offset-2"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <motion.span
                    className="inline-block h-4 w-4 rounded-full border-2 border-solid border-white border-r-transparent mr-2"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <span className="font-semibold">Envoi en cours...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Mail className="mr-2 h-5 w-5" />
                  <span className="font-semibold">
                    ✨ Envoyer le lien magique
                  </span>
                </span>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
