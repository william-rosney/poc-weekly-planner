"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import SnowFlake from "./SnowFlake";

/**
 * Composant de fond avec flocons de neige animés pour l'ambiance de Noël
 * Utilise Framer Motion pour des animations fluides et performantes
 *
 * Note: Ce composant utilise useState pour éviter les erreurs d'hydratation
 * car il génère des valeurs aléatoires qui doivent être identiques côté client
 */
export function SnowfallBackground() {
  // État monté pour éviter l'hydratation mismatch
  const [mounted, setMounted] = useState(false);

  // Générer les flocons uniquement côté client après le montage
  const [snowflakes] = useState(() => {
    const count = Math.floor(Math.random() * 20) + 30;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      // Position X aléatoire sur toute la largeur
      left: `${Math.random() * 100}%`,
      // Taille aléatoire pour plus de profondeur
      size: Math.random() * 8 + 4,
      // Durée d'animation aléatoire (entre 10 et 30 secondes)
      duration: Math.random() * 20 + 10,
      // Délai initial aléatoire pour effet décalé
      delay: Math.random() * 5,
      // Opacité aléatoire pour effet de profondeur
      opacity: Math.random() * 0.4 + 0.2,
    }));
  });

  // Marquer le composant comme monté après le premier rendu côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Ne rien afficher pendant le SSR pour éviter l'hydratation mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="absolute text-white"
          style={{
            left: flake.left,
            fontSize: `${flake.size}px`,
            opacity: flake.opacity,
          }}
          initial={{ y: -20, rotate: 0 }}
          animate={{
            y: "100vh",
            rotate: 360,
            x: [0, 20, -20, 0], // Mouvement horizontal léger (effet vent)
          }}
          transition={{
            duration: flake.duration,
            repeat: Infinity,
            delay: flake.delay,
            ease: "linear",
            x: {
              duration: flake.duration / 3,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          <SnowFlake />
        </motion.div>
      ))}
    </div>
  );
}
