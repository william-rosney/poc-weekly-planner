/**
 * Global application constants
 */

export const ROUTES = {
  HOME: "/",
  LOGIN: "/auth/login",
  CALLBACK: "/auth/callback",
  CALENDAR: "/dashboard/calendar",
} as const;

export const APP_NAME =
  process.env.NEXT_PUBLIC_APP_NAME || "Mon Agenda Familial";

export const COLORS = {
  BLUE: "blue",
  GREEN: "green",
  RED: "red",
  YELLOW: "yellow",
  PURPLE: "purple",
  PINK: "pink",
  ORANGE: "orange",
} as const;

/**
 * Application timezone - All dates are displayed in this timezone
 * regardless of the user's local timezone
 */
export const APP_TIMEZONE = "America/Toronto";
