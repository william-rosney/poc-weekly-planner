"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

/**
 * Page de vérification de session après authentification - Client Component
 *
 * Cette page affiche un spinner pendant que la session est vérifiée
 * puis redirige automatiquement vers la destination
 *
 * Le Route Handler a déjà échangé le code pour une session,
 * cette page attend juste un peu pour donner un feedback visuel
 * puis redirige l'utilisateur
 */
export default function VerifyingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Attendre 1 seconde pour donner un feedback visuel
    // puis rediriger vers la destination
    const next = searchParams.get('next') ?? '/calendar';

    const timer = setTimeout(() => {
      router.push(next);
      router.refresh(); // Force Server Component refresh
    }, 1000);

    return () => clearTimeout(timer);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-christmas-cream via-christmas-red/10 to-christmas-green/10">
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
