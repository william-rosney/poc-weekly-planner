"use client";

import { useState } from "react";
import { GroupedVotes, VoteStats } from "@/hooks/useVotes";
import {
  VOTE_STATUS_LABELS,
  VOTE_STATUS_COLORS,
  VoteStatus,
} from "@/lib/validations/vote";
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VoteListsDisplayProps {
  groupedVotes: GroupedVotes;
  stats: VoteStats;
}

/**
 * Affiche les listes de participants groupés par statut de vote
 * Trois sections : Je participe / Je ne participe pas / Je ne sais pas
 * Chaque section est collapsible
 */
export function VoteListsDisplay({
  groupedVotes,
  stats,
}: VoteListsDisplayProps) {
  const [expandedSections, setExpandedSections] = useState<Set<VoteStatus>>(
    new Set()
  );

  // Ne rien afficher si aucun vote
  if (stats.total === 0) {
    return (
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <Users className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-gray-500">
            Aucune participation enregistrée pour le moment
          </p>
        </div>
      </div>
    );
  }

  const toggleSection = (status: VoteStatus) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(status)) {
        newSet.delete(status);
      } else {
        newSet.add(status);
      }
      return newSet;
    });
  };

  const voteIcons = {
    yes: CheckCircle,
    no: XCircle,
    maybe: HelpCircle,
  };

  const voteSections: Array<{
    status: VoteStatus;
    votes: typeof groupedVotes.yes;
    count: number;
  }> = [
    { status: "yes", votes: groupedVotes.yes, count: stats.yes },
    { status: "no", votes: groupedVotes.no, count: stats.no },
    { status: "maybe", votes: groupedVotes.maybe, count: stats.maybe },
  ];

  return (
    <div className="space-y-2">
      {voteSections.map(({ status, votes, count }) => {
        if (count === 0) return null;

        const Icon = voteIcons[status];
        const colors = VOTE_STATUS_COLORS[status];
        const isExpanded = expandedSections.has(status);

        return (
          <div
            key={status}
            className={`rounded-lg border ${colors.bg} ${colors.border} overflow-hidden`}
          >
            {/* Header - Always visible, clickable */}
            <button
              onClick={() => toggleSection(status)}
              className={`w-full flex items-center justify-between p-4 ${colors.hover} transition-colors`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-5 w-5 shrink-0 ${colors.text}`} />
                <div className="font-semibold text-gray-900">
                  {VOTE_STATUS_LABELS[status]}
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-sm font-medium ${colors.bg} ${colors.text} border ${colors.border}`}
                >
                  {count}
                </span>
              </div>

              {/* Chevron icon */}
              {isExpanded ? (
                <ChevronUp className={`h-5 w-5 ${colors.text}`} />
              ) : (
                <ChevronDown className={`h-5 w-5 ${colors.text}`} />
              )}
            </button>

            {/* Expanded content - List of users */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-2 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {votes.map((vote) => (
                        <div
                          key={vote.id}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white ${colors.border}`}
                        >
                          {vote.users?.avatar_url && (
                            <img
                              src={vote.users.avatar_url}
                              alt={vote.users.name}
                              className="h-5 w-5 rounded-full object-cover"
                            />
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {vote.users?.name || "Utilisateur inconnu"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
