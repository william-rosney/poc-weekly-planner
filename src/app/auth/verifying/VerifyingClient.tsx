"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface VerifyingClientProps {
  next: string;
}

/**
 * Composant client pour afficher le spinner de vérification
 * et rediriger après un court délai
 */
export function VerifyingClient({ next }: VerifyingClientProps) {
  const router = useRouter();

  useEffect(() => {
    // Attendre 1 seconde pour donner un feedback visuel
    // puis rediriger vers la destination
    const timer = setTimeout(() => {
      router.push(next);
      router.refresh(); // Force Server Component refresh
    }, 1000);

    return () => clearTimeout(timer);
  }, [router, next]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-primary/10 to-chart-2/10">
      <motion.div
        className="text-center p-8 bg-white rounded-lg shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Spinner de chargement avec animation */}
        <motion.div
          className="inline-block h-16 w-16 rounded-full border-4 border-solid border-primary border-r-transparent mb-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />

        <h1 className="text-2xl font-bold text-chart-2 mb-2">
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
              className="w-2 h-2 bg-secondary rounded-full"
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
