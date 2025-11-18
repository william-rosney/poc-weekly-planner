import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { User } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Determines if a user can edit an event based on ownership and role.
 * @param eventUserId - The ID of the user who created the event
 * @param currentUser - The current authenticated user
 * @returns true if the user is an admin OR owns the event, false otherwise
 */
export function canEditEvent(eventUserId: string, currentUser: User): boolean {
  // Admins can edit any event
  if (currentUser.role === "admin") {
    return true;
  }

  // Members can only edit their own events
  return currentUser.id === eventUserId;
}
