"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VoteWithUser } from "@/hooks/useVotes";
import {
  VOTE_STATUS_LABELS,
  VOTE_STATUS_SHORT_LABELS,
  VOTE_STATUS_COLORS,
  VoteStatus,
} from "@/lib/validations/vote";
import { UserCog, Save, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
}

interface AdminVoteManagerProps {
  users: User[];
  votes: VoteWithUser[];
  onUpdateVote: (userId: string, status: VoteStatus | null) => Promise<void>;
  isAdmin: boolean;
}

/**
 * Interface de gestion des votes pour les administrateurs
 * Permet de modifier les votes de tous les utilisateurs
 */
export function AdminVoteManager({
  users,
  votes,
  onUpdateVote,
  isAdmin,
}: AdminVoteManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [pendingVotes, setPendingVotes] = useState<
    Record<string, VoteStatus | null>
  >({});
  const [saving, setSaving] = useState(false);

  // Ne pas afficher si l'utilisateur n'est pas admin
  if (!isAdmin) {
    return null;
  }

  const handleStartEditing = () => {
    // Initialiser les votes en attente avec les votes actuels
    const initialVotes: Record<string, VoteStatus | null> = {};
    users.forEach((user) => {
      const userVote = votes.find((v) => v.user_id === user.id);
      initialVotes[user.id] = userVote?.status || null;
    });
    setPendingVotes(initialVotes);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setPendingVotes({});
  };

  const handleVoteChange = (userId: string, value: string) => {
    const status = value === "none" ? null : (value as VoteStatus);
    setPendingVotes((prev) => ({
      ...prev,
      [userId]: status,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Mettre à jour tous les votes modifiés
      const updatePromises = Object.entries(pendingVotes).map(
        ([userId, status]) => {
          const currentVote = votes.find((v) => v.user_id === userId);
          const currentStatus = currentVote?.status || null;

          // Ne mettre à jour que si le vote a changé
          if (status !== currentStatus) {
            return onUpdateVote(userId, status);
          }
          return Promise.resolve();
        }
      );

      await Promise.all(updatePromises);
      setIsEditing(false);
      setPendingVotes({});
    } catch (error: unknown) {
      console.error("[AdminVoteManager] Error saving votes:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {!isEditing && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartEditing}
            className="gap-2 w-full sm:w-auto"
          >
            <UserCog className="h-4 w-4" />
            <span className="hidden sm:inline">Gérer les participants</span>
            <span className="sm:hidden">Gérer</span>
          </Button>
        )}

        {isEditing && (
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelEditing}
              disabled={saving}
              className="flex-1 sm:flex-none"
              title="Annuler"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Annuler</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 sm:flex-none"
              title="Enregistrer"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span className="hidden sm:inline ml-2">Enregistrer</span>
            </Button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              {users.map((user) => {
                const currentValue =
                  pendingVotes[user.id] || (null as VoteStatus | null);

                return (
                  <div
                    key={user.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {user.avatar_url && (
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          className="h-8 w-8 rounded-full object-cover shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 truncate">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>

                    <Select
                      value={currentValue || "none"}
                      onValueChange={(value) =>
                        handleVoteChange(user.id, value)
                      }
                      disabled={saving}
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Aucun vote" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucun vote</SelectItem>
                        {(["yes", "no", "maybe"] as VoteStatus[]).map(
                          (status) => {
                            const colors = VOTE_STATUS_COLORS[status];
                            return (
                              <SelectItem key={status} value={status}>
                                <span className={colors.text}>
                                  {VOTE_STATUS_SHORT_LABELS[status]}
                                </span>
                              </SelectItem>
                            );
                          }
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-gray-500 text-center">
              Modifiez les participations de tous les membres de la famille
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
