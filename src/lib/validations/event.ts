import { z } from "zod";

/**
 * Schéma de validation Zod pour les événements
 */
export const eventFormSchema = z
  .object({
    title: z.string().min(1, "Le titre est requis"),
    start_time: z.date({
      required_error: "La date de début est requise",
    }),
    end_time: z.date({
      required_error: "La date de fin est requise",
    }),
    description: z.string().optional(),
    link: z.string().url("L'URL doit être valide").optional().or(z.literal("")),
    cost_per_person: z
      .number()
      .positive("Le coût doit être positif")
      .optional()
      .or(z.nan()),
    color: z
      .string()
      .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Couleur invalide")
      .optional()
      .or(z.literal("")),
    user_id: z.string().uuid("ID utilisateur invalide"),
  })
  .refine((data) => data.end_time > data.start_time, {
    message: "La date de fin doit être après la date de début",
    path: ["end_time"],
  });

export type EventFormValues = z.infer<typeof eventFormSchema>;

/**
 * Palette de couleurs prédéfinies pour les événements
 */
export const EVENT_COLORS = [
  { label: "Rouge", value: "#C8102E" },
  { label: "Vert", value: "#165B33" },
  { label: "Or", value: "#D4AF37" },
  { label: "Bleu", value: "#3B82F6" },
  { label: "Violet", value: "#8B5CF6" },
  { label: "Rose", value: "#EC4899" },
  { label: "Orange", value: "#F97316" },
  { label: "Jaune", value: "#EAB308" },
] as const;

/**
 * Couleur par défaut pour les nouveaux événements
 */
export const DEFAULT_EVENT_COLOR = "#C8102E";
