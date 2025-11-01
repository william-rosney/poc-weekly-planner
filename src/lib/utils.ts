import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitaire pour fusionner des classes Tailwind CSS de manière intelligente
 * Combine clsx et tailwind-merge pour éviter les conflits de classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
