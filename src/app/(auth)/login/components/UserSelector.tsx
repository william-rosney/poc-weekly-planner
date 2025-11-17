"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { User } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserSelectorProps {
  onSelectUser: (email: string, userName: string) => void;
  selectedEmail: string | null;
}

/**
 * Composant pour afficher et sélectionner un membre de la famille
 */
export function UserSelector({
  onSelectUser,
  selectedEmail,
}: UserSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .order("name");

        if (error) throw error;

        setUsers(data || []);
      } catch (err: unknown) {
        console.error("Erreur lors du chargement des utilisateurs:", err);
        setError("Impossible de charger les membres de la famille");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  /**
   * Retourne les initiales d'un nom pour l'avatar
   */
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <motion.div
        className="text-center py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="inline-block h-8 w-8 rounded-full border-4 border-solid border-primary border-r-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p className="mt-4 text-sm text-gray-600">Chargement des membres...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="text-center py-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <p className="text-sm text-primary">{error}</p>
      </motion.div>
    );
  }

  if (users.length === 0) {
    return (
      <motion.div
        className="text-center py-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm text-gray-600">
          Aucun membre trouvé. Veuillez configurer les utilisateurs dans
          Supabase.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Titre avec animation optimisée - durée réduite pour fluidité */}
      <motion.h2
        className="text-lg font-semibold text-center mb-4 text-primary"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        🎁 Qui êtes-vous ?
      </motion.h2>

      {/* Liste des utilisateurs avec animations échelonnées optimisées */}
      <div className="grid gap-3 max-h-[400px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-secondary scrollbar-track-secondary/10">
        <AnimatePresence>
          {users
            .filter((user) => user.email)
            .map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.15,
                delay: index * 0.03, // Délai très court pour apparition quasi instantanée
                ease: "easeOut",
              }}
            >
              <Card
                className="cursor-pointer transition-shadow duration-150 ease-out hover:shadow-xl border-secondary/30 hover:border-secondary"
                onClick={() => onSelectUser(user.email, user.name)}
              >
                <CardContent className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4">
                  {/* Avatar avec bordure festive */}
                  <Avatar className="h-10 w-10 sm:h-14 sm:w-14 border-2 border-secondary shadow-md shrink-0">
                    <AvatarFallback className="bg-linear-to-br from-primary/20 to-chart-2/20 text-primary font-bold text-sm sm:text-lg">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info utilisateur */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{user.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</p>
                  </div>

                  {/* Icône selon le rôle - Administrateur ou Membre */}
                  {user.role === "admin" ? (
                    <span className="text-xl sm:text-2xl shrink-0" title="Administrateur">
                      👑
                    </span>
                  ) : (
                    <span className="text-xl sm:text-2xl shrink-0" title="Membre">
                      ✨
                    </span>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
