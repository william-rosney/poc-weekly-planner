"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { CalendarIcon } from "lucide-react";
import { APP_TIMEZONE } from "@/lib/constants";
import {
  eventFormSchema,
  type EventFormValues,
  EVENT_COLORS,
  DEFAULT_EVENT_COLOR,
} from "@/lib/validations/event";
import { Button } from "@/components/ui/button";
import { CostInput } from "@/components/ui/CostInput";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

/**
 * Format a date in the app timezone
 */
const formatInTimezone = (date: Date, formatStr: string) => {
  const zonedDate = toZonedTime(date, APP_TIMEZONE);
  return format(zonedDate, formatStr, { locale: fr });
};

interface EventFormProps {
  defaultValues?: Partial<EventFormValues>;
  onSubmit: (values: EventFormValues) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

/**
 * Formulaire de création/édition d'événements
 * Utilise React Hook Form + Zod pour la validation
 */
export function EventForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Enregistrer",
  isLoading = false,
}: EventFormProps) {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      start_time: defaultValues?.start_time || new Date(),
      end_time: defaultValues?.end_time || new Date(),
      description: defaultValues?.description || "",
      link: defaultValues?.link || "",
      place: defaultValues?.place || "",
      travel_time_minutes: defaultValues?.travel_time_minutes || undefined,
      cost_per_person: defaultValues?.cost_per_person || undefined,
      color: defaultValues?.color || DEFAULT_EVENT_COLOR,
      user_id: defaultValues?.user_id || "",
    },
  });

  const handleSubmit = async (values: EventFormValues) => {
    try {
      await onSubmit(values);
      form.reset();
    } catch (error: unknown) {
      console.error("[EventForm] Error submitting form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Titre */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Dîner de famille"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date et heure de début */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de début *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        {field.value ? (
                          formatInTimezone(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Choisir une date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={toZonedTime(field.value, APP_TIMEZONE)}
                      onSelect={(date) => {
                        if (date) {
                          // Preserve the time when changing date
                          const zonedCurrent = toZonedTime(field.value, APP_TIMEZONE);
                          const newDate = new Date(date);
                          newDate.setHours(zonedCurrent.getHours());
                          newDate.setMinutes(zonedCurrent.getMinutes());
                          // Convert back to UTC for storage
                          const utcDate = fromZonedTime(newDate, APP_TIMEZONE);
                          field.onChange(utcDate);
                        }
                      }}
                      locale={fr}
                      disabled={isLoading}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heure *</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    value={field.value ? formatInTimezone(field.value, "HH:mm") : ""}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(":");
                      // Get current date in Toronto timezone
                      const zonedDate = toZonedTime(field.value, APP_TIMEZONE);
                      zonedDate.setHours(parseInt(hours, 10));
                      zonedDate.setMinutes(parseInt(minutes, 10));
                      // Convert back to UTC for storage
                      const utcDate = fromZonedTime(zonedDate, APP_TIMEZONE);
                      field.onChange(utcDate);
                    }}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Date et heure de fin */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de fin *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        {field.value ? (
                          formatInTimezone(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Choisir une date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={toZonedTime(field.value, APP_TIMEZONE)}
                      onSelect={(date) => {
                        if (date) {
                          // Preserve the time when changing date
                          const zonedCurrent = toZonedTime(field.value, APP_TIMEZONE);
                          const newDate = new Date(date);
                          newDate.setHours(zonedCurrent.getHours());
                          newDate.setMinutes(zonedCurrent.getMinutes());
                          // Convert back to UTC for storage
                          const utcDate = fromZonedTime(newDate, APP_TIMEZONE);
                          field.onChange(utcDate);
                        }
                      }}
                      locale={fr}
                      disabled={isLoading}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heure *</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    value={field.value ? formatInTimezone(field.value, "HH:mm") : ""}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(":");
                      // Get current date in Toronto timezone
                      const zonedDate = toZonedTime(field.value, APP_TIMEZONE);
                      zonedDate.setHours(parseInt(hours, 10));
                      zonedDate.setMinutes(parseInt(minutes, 10));
                      // Convert back to UTC for storage
                      const utcDate = fromZonedTime(zonedDate, APP_TIMEZONE);
                      field.onChange(utcDate);
                    }}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Détails de l'événement..."
                  className="resize-none"
                  rows={3}
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Lien */}
        <FormField
          control={form.control}
          name="link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lien</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://..."
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Lieu */}
        <FormField
          control={form.control}
          name="place"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lieu</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Adresse ou lien Google Maps..."
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Temps de trajet */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Temps de trajet
          </label>
          <FormField
            control={form.control}
            name="travel_time_minutes"
            render={({ field }) => {
              const hours = field.value ? Math.floor(field.value / 60) : 0;
              const minutes = field.value ? field.value % 60 : 0;

              return (
                <FormItem>
                  <div className="flex gap-4 max-w-xs">
                    <FormControl>
                      <div className="relative w-24">
                        <Input
                          type="number"
                          min="0"
                          max="23"
                          placeholder="0"
                          value={hours || ""}
                          onChange={(e) => {
                            const newHours = e.target.value
                              ? parseInt(e.target.value, 10)
                              : 0;
                            const newTotal = newHours * 60 + minutes;
                            field.onChange(newTotal > 0 ? newTotal : undefined);
                          }}
                          disabled={isLoading}
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          h
                        </span>
                      </div>
                    </FormControl>
                    <FormControl>
                      <div className="relative w-24">
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          step="1"
                          placeholder="0"
                          value={minutes || ""}
                          onChange={(e) => {
                            const newMinutes = e.target.value
                              ? parseInt(e.target.value, 10)
                              : 0;
                            const newTotal = hours * 60 + newMinutes;
                            field.onChange(newTotal > 0 ? newTotal : undefined);
                          }}
                          disabled={isLoading}
                          className="pr-10"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          min
                        </span>
                      </div>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        {/* Coût par personne */}
        <FormField
          control={form.control}
          name="cost_per_person"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coût par personne (CAD)</FormLabel>
              <FormControl>
                <CostInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Couleur */}
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Couleur</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded border border-gray-300"
                        style={{ backgroundColor: field.value }}
                      />
                      <SelectValue placeholder="Choisir une couleur" />
                    </div>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EVENT_COLORS.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-4 w-4 rounded border border-gray-300"
                          style={{ backgroundColor: color.value }}
                        />
                        <span>{color.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Enregistrement..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
