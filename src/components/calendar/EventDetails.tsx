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
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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
  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);

  const formatDate = (date: Date) => {
    return format(date, "EEEE d MMMM yyyy", { locale: fr });
  };

  const formatTime = (date: Date) => {
    return format(date, "HH:mm", { locale: fr });
  };

  return (
    <div className="space-y-6">
      {/* Header avec titre et actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {event.title}
          </h2>
          {event.description && (
            <p className="text-gray-700 text-base leading-relaxed">
              {event.description}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-9 w-9 hover:bg-christmas-cream/50"
          >
            <Edit className="h-4 w-4 text-christmas-red" />
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

      {/* Détails de l'événement */}
      <div className="space-y-4">
        {/* Date et heure */}
        <div className="flex items-start gap-3 p-4 bg-christmas-cream/30 rounded-lg">
          <Calendar className="h-5 w-5 text-christmas-red mt-0.5 flex-shrink-0" />
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
                {(
                  (endDate.getTime() - startDate.getTime()) /
                  (1000 * 60 * 60)
                ).toFixed(1)}
                h
              </span>
            </div>
          </div>
        </div>

        {/* Coût par personne */}
        {event.cost_per_person && event.cost_per_person > 0 && (
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
            <DollarSign className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-1">
                Coût par personne
              </div>
              <div className="text-lg font-bold text-green-600">
                {event.cost_per_person.toFixed(2)} €
              </div>
            </div>
          </div>
        )}

        {/* Lien externe */}
        {event.link && (
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <ExternalLink className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-2">
                Lien associé
              </div>
              <a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline text-sm break-all"
              >
                <span className="truncate">{event.link}</span>
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
