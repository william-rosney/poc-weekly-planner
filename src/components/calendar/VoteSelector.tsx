"use client";

import { Button } from "@/components/ui/button";
import { VoteWithUser } from "@/hooks/useVotes";
import {
  VOTE_STATUS_LABELS,
  VOTE_STATUS_COLORS,
  VoteStatus,
} from "@/lib/validations/vote";
import { CheckCircle, XCircle, HelpCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface VoteSelectorProps {
  currentVote: VoteWithUser | null;
  onVote: (status: VoteStatus) => void;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Sélecteur de vote pour un événement
 * Permet à l'utilisateur de choisir sa participation
 */
export function VoteSelector({
  currentVote,
  onVote,
  disabled = false,
  loading = false,
}: VoteSelectorProps) {
  const voteOptions: Array<{
    status: VoteStatus;
    label: string;
    icon: typeof CheckCircle;
  }> = [
    { status: "yes", label: VOTE_STATUS_LABELS.yes, icon: CheckCircle },
    { status: "no", label: VOTE_STATUS_LABELS.no, icon: XCircle },
    { status: "maybe", label: VOTE_STATUS_LABELS.maybe, icon: HelpCircle },
  ];

  const handleVoteClick = (status: VoteStatus) => {
    if (disabled || loading) return;

    // Si l'utilisateur clique sur le même vote, on le supprime (non implémenté ici)
    // Sinon on met à jour le vote
    onVote(status);
  };

  return (
    <div className="space-y-4">
      <div className="font-medium text-gray-900 text-sm">Votre participation</div>

      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {voteOptions.map(({ status, label, icon: Icon }) => {
            const isSelected = currentVote?.status === status;
            const colors = VOTE_STATUS_COLORS[status];

            return (
              <motion.div
                key={status}
                whileHover={!disabled ? { scale: 1.02 } : {}}
                whileTap={!disabled ? { scale: 0.98 } : {}}
              >
                <Button
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => handleVoteClick(status)}
                  disabled={disabled}
                  className={`
                    w-full h-auto py-3 px-4 flex flex-col items-center gap-2
                    transition-all duration-200
                    ${
                      isSelected
                        ? `${colors.bg} ${colors.text} ${colors.border} border-2 shadow-md`
                        : `bg-white border-gray-200 hover:${colors.bg} hover:${colors.border}`
                    }
                    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  <Icon
                    className={`h-6 w-6 ${isSelected ? colors.text : "text-gray-400"}`}
                  />
                  <span
                    className={`text-sm font-medium ${isSelected ? colors.text : "text-gray-700"}`}
                  >
                    {label}
                  </span>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`text-xs ${colors.text}`}
                    >
                      ✓ Sélectionné
                    </motion.div>
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}

      {!loading && currentVote && (
        <p className="text-xs text-gray-500 text-center">
          Cliquez sur une option pour modifier votre participation
        </p>
      )}

      {!loading && !currentVote && (
        <p className="text-xs text-gray-500 text-center">
          Sélectionnez votre participation à cet événement
        </p>
      )}
    </div>
  );
}
