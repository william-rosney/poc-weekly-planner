"use client";

import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
 * Composant hybride affichant le formulaire d'événement ou les détails
 * Supporte la création et l'édition d'événements avec mode vue/édition
 *
 * UX adaptative selon la taille d'écran:
 * - Mobile (<768px): Drawer (bottom sheet) avec swipe gestures
 * - Desktop (≥768px): Sheet (side panel de droite, 900px de large)
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

  // Detect if we're on desktop (md breakpoint = 768px)
  const isDesktop = useMediaQuery("(min-width: 768px)");

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
        place: event.place || "",
        travel_time_minutes: event.travel_time_minutes || undefined,
        cost_per_person: event.cost_per_person || undefined,
        color: event.color || undefined,
        user_id: event.user_id,
      }
    : {
        user_id: userId,
        start_time: prefilledDates?.start || new Date(),
        end_time: prefilledDates?.end || new Date(),
      };

  // Contenu réutilisable pour Sheet et Drawer
  const content = (
    <div className="mx-auto w-full h-full flex flex-col overflow-hidden">
      {isViewMode && event ? (
        // Mode vue: afficher les détails de l'événement
        <>
          <div className="flex-1 overflow-y-auto px-4 pb-8">
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
          <div className="flex-1 overflow-y-auto px-4 pb-8">
            <EventForm
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              onCancel={() => onOpenChange(false)}
              submitLabel={isExistingEvent ? "Enregistrer" : "Créer"}
            />
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {isDesktop ? (
        // Desktop: utiliser Sheet (side panel)
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent side="right" className="w-[900px] sm:max-w-[900px]">
            {isViewMode && event ? (
              <>
                <SheetHeader>
                  <SheetTitle className="text-xl font-bold text-primary">
                    Détails de l&apos;événement
                  </SheetTitle>
                </SheetHeader>
                {content}
              </>
            ) : (
              <>
                <SheetHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <SheetTitle className="text-xl font-bold text-primary">
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
                {content}
              </>
            )}
          </SheetContent>
        </Sheet>
      ) : (
        // Mobile: utiliser Drawer (bottom sheet)
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent className="h-[90vh]">
            <div className="mx-auto w-full max-w-3xl h-full flex flex-col overflow-hidden">
              {isViewMode && event ? (
                <>
                  <DrawerHeader>
                    <DrawerTitle className="text-xl font-bold text-primary">
                      Détails de l&apos;événement
                    </DrawerTitle>
                  </DrawerHeader>
                  {content}
                </>
              ) : (
                <>
                  <DrawerHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <DrawerTitle className="text-xl font-bold text-primary">
                          {isExistingEvent
                            ? "Modifier l'événement"
                            : "Nouvel événement"}
                        </DrawerTitle>
                        <DrawerDescription>
                          {isExistingEvent
                            ? "Modifiez les détails de votre événement"
                            : "Créez un nouvel événement pour votre famille"}
                        </DrawerDescription>
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
                  </DrawerHeader>
                  {content}
                </>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      )}

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
