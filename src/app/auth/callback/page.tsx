"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";

/**
 * Composant de chargement affiché pendant la suspension
 */
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-christmas-cream via-christmas-red/10 to-christmas-green/10">
      <motion.div
        className="text-center p-8 bg-white rounded-lg shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="inline-block h-16 w-16 rounded-full border-4 border-solid border-christmas-red border-r-transparent mb-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <h1 className="text-2xl font-bold text-christmas-green mb-2">
          Chargement...
        </h1>
        <p className="text-gray-600">Veuillez patienter</p>
      </motion.div>
    </div>
  );
}

/**
 * Composant contenant la logique du callback
 * Doit être wrappé dans Suspense car il utilise useSearchParams()
 */
function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createClient();
        const next = searchParams.get("next") ?? "/calendar";

        const code = searchParams.get("code");
        const tokenHash = searchParams.get("token_hash");
        const type = searchParams.get("type");

        // Check for existing session first (local Supabase creates session before redirect)
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (existingSession) {
          router.push(next);
          return;
        }

        // Handle PKCE flow (production with code parameter)
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error("[Callback] PKCE exchange error:", exchangeError);
            setError(`Erreur: ${exchangeError.message}`);
            setTimeout(() => router.push("/login"), 3000);
            return;
          }

          if (data.session) {
            router.push(next);
            return;
          }
        }

        // Handle implicit flow (production with token_hash)
        if (tokenHash && type) {
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as "email" | "magiclink",
          });

          if (verifyError) {
            console.error("[Callback] Token verification error:", verifyError);
            setError(`Erreur: ${verifyError.message}`);
            setTimeout(() => router.push("/login"), 3000);
            return;
          }

          if (data.session) {
            router.push(next);
            return;
          }
        }

        // No valid authentication found
        setError("Paramètres d'authentification invalides");
        setTimeout(() => router.push("/login"), 3000);
      } catch (err: unknown) {
        console.error("[Callback] Error:", err);
        const message = err instanceof Error ? err.message : "Erreur inconnue";
        setError(message);
        setTimeout(() => router.push("/login"), 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-christmas-cream via-christmas-red/10 to-christmas-green/10">
        <motion.div
          className="text-center p-8 bg-white rounded-lg shadow-xl max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-christmas-red mb-2">
            Erreur d&apos;authentification
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Redirection vers la page de connexion...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-christmas-cream via-christmas-red/10 to-christmas-green/10">
      <motion.div
        className="text-center p-8 bg-white rounded-lg shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Spinner de chargement avec animation */}
        <motion.div
          className="inline-block h-16 w-16 rounded-full border-4 border-solid border-christmas-red border-r-transparent mb-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />

        <h1 className="text-2xl font-bold text-christmas-green mb-2">
          Connexion en cours...
        </h1>
        <p className="text-gray-600">Vérification de votre identité</p>

        {/* Animation de points */}
        <motion.div
          className="flex justify-center gap-1 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-christmas-gold rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

/**
 * Page de callback pour l'authentification Magic Link
 *
 * Cette page gère deux scénarios:
 * 1. Local Supabase: Vérifie la session existante (déjà créée avant redirect)
 * 2. Production: Échange le code/token_hash depuis l'URL pour créer la session
 * 3. Redirige vers le calendrier ou affiche une erreur
 *
 * Note: Le composant CallbackContent est wrappé dans Suspense
 * car il utilise useSearchParams() (requis par Next.js)
 */
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CallbackContent />
    </Suspense>
  );
}
