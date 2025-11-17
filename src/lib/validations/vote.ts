import { z } from "zod";

/**
 * Vote status enum matching database enum
 */
export const voteStatusEnum = z.enum(["yes", "no", "maybe"]);

export type VoteStatus = z.infer<typeof voteStatusEnum>;

/**
 * Schéma de validation Zod pour les votes
 */
export const voteSchema = z.object({
  event_id: z.string().uuid("ID d'événement invalide"),
  user_id: z.string().uuid("ID utilisateur invalide"),
  status: voteStatusEnum,
});

export type VoteFormValues = z.infer<typeof voteSchema>;

/**
 * Schéma de validation pour la soumission d'un vote (optionnel pour formulaire)
 */
export const submitVoteSchema = z.object({
  status: voteStatusEnum,
});

export type SubmitVoteFormValues = z.infer<typeof submitVoteSchema>;

/**
 * Labels pour l'affichage des statuts de vote
 */
export const VOTE_STATUS_LABELS: Record<VoteStatus, string> = {
  yes: "Je participe",
  no: "Je ne participe pas",
  maybe: "Je ne sais pas",
} as const;

/**
 * Labels courts pour l'affichage compact
 */
export const VOTE_STATUS_SHORT_LABELS: Record<VoteStatus, string> = {
  yes: "Oui",
  no: "Non",
  maybe: "Peut-être",
} as const;

/**
 * Icônes pour les statuts de vote (lucide-react)
 */
export const VOTE_STATUS_ICONS: Record<VoteStatus, string> = {
  yes: "CheckCircle",
  no: "XCircle",
  maybe: "HelpCircle",
} as const;

/**
 * Couleurs Tailwind pour les statuts de vote
 */
export const VOTE_STATUS_COLORS: Record<
  VoteStatus,
  {
    bg: string;
    text: string;
    border: string;
    hover: string;
  }
> = {
  yes: {
    bg: "bg-green-50",
    text: "text-green-600",
    border: "border-green-200",
    hover: "hover:bg-green-100",
  },
  no: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    hover: "hover:bg-red-100",
  },
  maybe: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-200",
    hover: "hover:bg-orange-100",
  },
} as const;
