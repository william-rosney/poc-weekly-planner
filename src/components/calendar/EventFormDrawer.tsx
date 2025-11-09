"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { EventForm } from "./EventForm";
import { EventDetails } from "./EventDetails";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { Event } from "@/lib/types";
import { EventFormValues } from "@/lib/validations/event";

interface EventFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event | null;
  userId: string;
  prefilledDates?: { start: Date; end: Date } | null;
  onSubmit: (values: EventFormValues) => Promise<void>;
  onDelete?: (eventId: string) => Promise<void>;
}

/**
 * Drawer (Sheet) contenant le formulaire d'événement ou les détails
 * Supporte la création et l'édition d'événements avec mode vue/édition
 */
export function EventFormDrawer({
  open,
  onOpenChange,
  event,
  userId,
  prefilledDates,
  onSubmit,
  onDelete,
}: EventFormDrawerProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const isExistingEvent = !!event;
  const isViewMode = isExistingEvent && !isEditMode;

  // Reset edit mode when drawer closes
  useEffect(() => {
    if (!open) {
      setIsEditMode(false);
    }
  }, [open]);

  // If creating new event (no event prop), go directly to edit mode
  useEffect(() => {
    if (!isExistingEvent && open) {
      setIsEditMode(true);
    }
  }, [isExistingEvent, open]);

  const handleSubmit = async (values: EventFormValues) => {
    await onSubmit(values);
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!event || !onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(event.id);
      setShowDeleteDialog(false);
      onOpenChange(false);
    } catch (error: unknown) {
      console.error("[EventFormDrawer] Error deleting event:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const defaultValues: Partial<EventFormValues> = event
    ? {
        title: event.title,
        start_time: new Date(event.start_time),
        end_time: new Date(event.end_time),
        description: event.description || "",
        link: event.link || "",
        cost_per_person: event.cost_per_person || undefined,
        color: event.color || undefined,
        user_id: event.user_id,
      }
    : {
        user_id: userId,
        start_time: prefilledDates?.start || new Date(),
        end_time: prefilledDates?.end || new Date(),
      };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          {isViewMode && event ? (
            // Mode vue: afficher les détails de l'événement
            <>
              <SheetHeader>
                <SheetTitle className="text-xl font-bold text-christmas-red">
                  Détails de l&apos;événement
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6">
                <EventDetails
                  event={event}
                  onEdit={handleEdit}
                  onDelete={() => setShowDeleteDialog(true)}
                />
              </div>
            </>
          ) : (
            // Mode édition/création: afficher le formulaire
            <>
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <SheetTitle className="text-xl font-bold text-christmas-red">
                      {isExistingEvent
                        ? "Modifier l'événement"
                        : "Nouvel événement"}
                    </SheetTitle>
                    <SheetDescription>
                      {isExistingEvent
                        ? "Modifiez les détails de votre événement"
                        : "Créez un nouvel événement pour votre famille"}
                    </SheetDescription>
                  </div>

                  {isExistingEvent && onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Supprimer l'événement"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                </div>
              </SheetHeader>

              <div className="mt-6">
                <EventForm
                  defaultValues={defaultValues}
                  onSubmit={handleSubmit}
                  onCancel={() => onOpenChange(false)}
                  submitLabel={isExistingEvent ? "Enregistrer" : "Créer"}
                />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      {isExistingEvent && (
        <DeleteConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
          eventTitle={event?.title || ""}
        />
      )}
    </>
  );
}
