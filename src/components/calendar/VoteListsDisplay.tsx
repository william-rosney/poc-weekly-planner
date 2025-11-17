"use client";

import { GroupedVotes, VoteStats } from "@/hooks/useVotes";
import {
  VOTE_STATUS_LABELS,
  VOTE_STATUS_COLORS,
} from "@/lib/validations/vote";
import { CheckCircle, XCircle, HelpCircle, Users } from "lucide-react";

interface VoteListsDisplayProps {
  groupedVotes: GroupedVotes;
  stats: VoteStats;
}

/**
 * Affiche les listes de participants groupés par statut de vote
 * Trois sections : Je participe / Je ne participe pas / Je ne sais pas
 */
export function VoteListsDisplay({
  groupedVotes,
  stats,
}: VoteListsDisplayProps) {
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

  const voteIcons = {
    yes: CheckCircle,
    no: XCircle,
    maybe: HelpCircle,
  };

  return (
    <div className="space-y-3">
      {/* Section: Je participe */}
      {groupedVotes.yes.length > 0 && (
        <div
          className={`flex items-start gap-3 p-4 rounded-lg border ${VOTE_STATUS_COLORS.yes.bg} ${VOTE_STATUS_COLORS.yes.border}`}
        >
          <CheckCircle
            className={`h-5 w-5 mt-0.5 shrink-0 ${VOTE_STATUS_COLORS.yes.text}`}
          />
          <div className="flex-1">
            <div className="font-semibold text-gray-900 mb-2">
              {VOTE_STATUS_LABELS.yes}{" "}
              <span
                className={`text-sm font-normal ${VOTE_STATUS_COLORS.yes.text}`}
              >
                ({groupedVotes.yes.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {groupedVotes.yes.map((vote) => (
                <div
                  key={vote.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${VOTE_STATUS_COLORS.yes.bg} ${VOTE_STATUS_COLORS.yes.border}`}
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
        </div>
      )}

      {/* Section: Je ne participe pas */}
      {groupedVotes.no.length > 0 && (
        <div
          className={`flex items-start gap-3 p-4 rounded-lg border ${VOTE_STATUS_COLORS.no.bg} ${VOTE_STATUS_COLORS.no.border}`}
        >
          <XCircle
            className={`h-5 w-5 mt-0.5 shrink-0 ${VOTE_STATUS_COLORS.no.text}`}
          />
          <div className="flex-1">
            <div className="font-semibold text-gray-900 mb-2">
              {VOTE_STATUS_LABELS.no}{" "}
              <span
                className={`text-sm font-normal ${VOTE_STATUS_COLORS.no.text}`}
              >
                ({groupedVotes.no.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {groupedVotes.no.map((vote) => (
                <div
                  key={vote.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${VOTE_STATUS_COLORS.no.bg} ${VOTE_STATUS_COLORS.no.border}`}
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
        </div>
      )}

      {/* Section: Je ne sais pas */}
      {groupedVotes.maybe.length > 0 && (
        <div
          className={`flex items-start gap-3 p-4 rounded-lg border ${VOTE_STATUS_COLORS.maybe.bg} ${VOTE_STATUS_COLORS.maybe.border}`}
        >
          <HelpCircle
            className={`h-5 w-5 mt-0.5 shrink-0 ${VOTE_STATUS_COLORS.maybe.text}`}
          />
          <div className="flex-1">
            <div className="font-semibold text-gray-900 mb-2">
              {VOTE_STATUS_LABELS.maybe}{" "}
              <span
                className={`text-sm font-normal ${VOTE_STATUS_COLORS.maybe.text}`}
              >
                ({groupedVotes.maybe.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {groupedVotes.maybe.map((vote) => (
                <div
                  key={vote.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${VOTE_STATUS_COLORS.maybe.bg} ${VOTE_STATUS_COLORS.maybe.border}`}
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
        </div>
      )}
    </div>
  );
}
