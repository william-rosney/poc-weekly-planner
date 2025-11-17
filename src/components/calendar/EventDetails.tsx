"use client";

import { Event } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  DollarSign,
  ExternalLink,
  Edit,
  Trash2,
  MapPin,
  Copy,
  CopyCheck,
  Users,
  Edit2,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState, useEffect } from "react";
import { useVotes } from "@/hooks/useVotes";
import { useUsers } from "@/hooks/useUsers";
import { VoteListsDisplay } from "./VoteListsDisplay";
import { VoteSelector } from "./VoteSelector";
import { AdminVoteManager } from "./AdminVoteManager";
import { VoteStatus } from "@/lib/validations/vote";

interface EventDetailsProps {
  event: Event;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Affiche les détails d'un événement de manière élégante
 * Mode lecture seule avec bouton d'édition
 */
export function EventDetails({ event, onEdit, onDelete }: EventDetailsProps) {
  const [copiedPlace, setCopiedPlace] = useState(false);
  const [isEditingVote, setIsEditingVote] = useState(false);

  // Hooks pour gérer les votes
  const {
    groupedVotes,
    stats,
    loading: votesLoading,
    getVotesForEvent,
    submitVote,
    deleteVote,
    getUserVote,
  } = useVotes();

  const { users, getCurrentUser } = useUsers();
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
    role: string;
  } | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);

  // Charger les votes et l'utilisateur courant au montage
  useEffect(() => {
    if (event.id) {
      getVotesForEvent(event.id);
    }

    getCurrentUser()
      .then((user) => {
        setCurrentUser(user);
        setUserLoaded(true);
      })
      .catch((error: unknown) => {
        console.error("[EventDetails] Error loading current user:", error);
        setUserLoaded(true);
      });
  }, [event.id, getVotesForEvent, getCurrentUser]);

  // Récupérer le vote de l'utilisateur courant
  const currentUserVote = currentUser
    ? getUserVote(event.id, currentUser.id)
    : null;

  // Gérer le vote de l'utilisateur
  const handleVote = async (status: VoteStatus) => {
    if (!currentUser) return;

    const result = await submitVote(event.id, currentUser.id, status);
    if (result.success) {
      // Rafraîchir les votes après soumission
      await getVotesForEvent(event.id);
      // Fermer le mode édition après avoir voté
      setIsEditingVote(false);
    } else {
      console.error("Failed to submit vote:", result.error);
    }
  };

  // Gérer la mise à jour des votes par l'admin
  const handleAdminUpdateVote = async (
    userId: string,
    status: VoteStatus | null
  ) => {
    if (status === null) {
      // Supprimer le vote
      const result = await deleteVote(event.id, userId);
      if (result.success) {
        await getVotesForEvent(event.id);
      }
    } else {
      // Créer ou mettre à jour le vote
      const result = await submitVote(event.id, userId, status);
      if (result.success) {
        await getVotesForEvent(event.id);
      }
    }
  };

  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);

  const formatDate = (date: Date) => {
    return format(date, "EEEE d MMMM yyyy", { locale: fr });
  };

  const formatTime = (date: Date) => {
    return format(date, "HH:mm", { locale: fr });
  };

  const formatDuration = (start: Date, end: Date) => {
    const totalMinutes = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60)
    );
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
      return `${minutes}min`;
    }

    if (minutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h${minutes.toString().padStart(2, "0")}`;
  };

  const isUrl = (text: string) => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  const copyPlaceToClipboard = async () => {
    if (event.place) {
      try {
        await navigator.clipboard.writeText(event.place);
        setCopiedPlace(true);
        setTimeout(() => setCopiedPlace(false), 2000);
      } catch (error: unknown) {
        console.error("Failed to copy place:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec titre et actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {event.title}
          </h2>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-9 w-9 hover:bg-background/50"
          >
            <Edit className="h-4 w-4 text-primary" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-9 w-9 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>

      <div className="flex-1">
        {event.description && (
          <p className="text-gray-700 text-base leading-relaxed text-justify">
            {event.description}
          </p>
        )}
      </div>

      {/* Détails de l'événement */}
      <div className="space-y-4">
        {/* Date et heure */}
        <div className="flex items-start gap-3 p-4 bg-background/30 rounded-lg">
          <Calendar className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="font-semibold text-gray-900 mb-1">
              {formatDate(startDate)}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>
                {formatTime(startDate)} - {formatTime(endDate)}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">
                {formatDuration(startDate, endDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Coût par personne */}
        {
          event.cost_per_person != null && event.cost_per_person === 0 && (
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
            <div className="flex-1">
              <div className="text-lg font-bold text-green-600">
                Gratuit
              </div>
            </div>
          </div>
          )
        }

        {event.cost_per_person != null && event.cost_per_person > 0 && (
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
            <DollarSign className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-1">
                Coût par personne
              </div>
              <div className="text-lg font-bold text-green-600">
                {event.cost_per_person.toFixed(2)} $
              </div>
            </div>
          </div>
        )}

        {/* Lien externe */}
        {event.link && (
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <ExternalLink className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 mb-2">
                Lien associé
              </div>
              <a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline text-sm"
              >
                <span className="truncate min-w-0">{event.link}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
          </div>
        )}

        {/* Lieu */}
        {event.place && (
          <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
            <MapPin className="h-5 w-5 text-purple-600 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="font-semibold text-gray-900">Lieu</div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyPlaceToClipboard}
                  className="h-7 w-7 hover:bg-purple-100"
                  title="Copier le lieu"
                >
                  {copiedPlace ? (
                    <CopyCheck className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-purple-600" />
                  )}
                </Button>
              </div>
              {isUrl(event.place) ? (
                <a
                  href={event.place}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:underline text-sm"
                >
                  <span className="truncate min-w-0">{event.place}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              ) : (
                <p className="text-sm text-gray-700">{event.place}</p>
              )}
            </div>
          </div>
        )}

        {/* Participations */}
        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-5 w-5 text-indigo-600 shrink-0" />
            <div className="font-semibold text-gray-900">Participations</div>
          </div>

          <div className="space-y-4">
            {/* Affichage des listes de participants */}
            <VoteListsDisplay groupedVotes={groupedVotes} stats={stats} />

            {/* Sélecteur de vote pour l'utilisateur courant */}
            {userLoaded && currentUser && (
              <div className="pt-4 border-t border-indigo-200">
                {/* Si l'utilisateur n'a pas encore voté, afficher directement le sélecteur */}
                {!currentUserVote && (
                  <VoteSelector
                    currentVote={currentUserVote}
                    onVote={handleVote}
                    loading={votesLoading}
                  />
                )}

                {/* Si l'utilisateur a déjà voté */}
                {currentUserVote && (
                  <>
                    {/* Afficher le bouton modifier si pas en mode édition */}
                    {!isEditingVote && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingVote(true)}
                        className="gap-2 w-full sm:w-auto"
                      >
                        <Edit2 className="h-4 w-4" />
                        Modifier ma participation
                      </Button>
                    )}

                    {/* Afficher le sélecteur si en mode édition */}
                    {isEditingVote && (
                      <VoteSelector
                        currentVote={currentUserVote}
                        onVote={handleVote}
                        loading={votesLoading}
                      />
                    )}
                  </>
                )}
              </div>
            )}

            {/* Message d'erreur si l'utilisateur n'est pas trouvé */}
            {userLoaded && !currentUser && (
              <div className="pt-4 border-t border-indigo-200">
                <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    Impossible de charger votre profil utilisateur. Veuillez vous reconnecter ou contacter un administrateur.
                  </p>
                </div>
              </div>
            )}

            {/* État de chargement */}
            {!userLoaded && (
              <div className="pt-4 border-t border-indigo-200">
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                </div>
              </div>
            )}

            {/* Interface de gestion admin */}
            {currentUser && currentUser.role === "admin" && (
              <div className="pt-4 border-t border-indigo-200">
                <AdminVoteManager
                  users={users}
                  votes={[...groupedVotes.yes, ...groupedVotes.no, ...groupedVotes.maybe]}
                  onUpdateVote={handleAdminUpdateVote}
                  isAdmin={currentUser.role === "admin"}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
