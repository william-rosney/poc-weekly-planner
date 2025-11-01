/**
 * Constantes globales de l'application
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
