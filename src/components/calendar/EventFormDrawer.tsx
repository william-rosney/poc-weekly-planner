"use client";

import { useState } from "react";
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
 * Drawer (Sheet) contenant le formulaire d'événement
 * Supporte la création et l'édition d'événements
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

  const isEditing = !!event;

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
          <SheetHeader>
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-xl font-bold text-christmas-red">
                  {isEditing ? "Modifier l'événement" : "Nouvel événement"}
                </SheetTitle>
                <SheetDescription>
                  {isEditing
                    ? "Modifiez les détails de votre événement"
                    : "Créez un nouvel événement pour votre famille"}
                </SheetDescription>
              </div>

              {isEditing && onDelete && (
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
              submitLabel={isEditing ? "Enregistrer" : "Créer"}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      {isEditing && (
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
