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
 * Timeout constants for async operations (in milliseconds)
 * These values balance user experience with reliability for slower connections
 */
export const TIMEOUTS = {
  /** Session validation timeout - generous for slower networks */
  SESSION_CHECK: 3000,
  /** User data fetch timeout - allows for database latency */
  USER_FETCH: 5000,
  /** Database update operations timeout */
  DB_UPDATE: 3000,
  /** Sign out operation timeout */
  SIGN_OUT: 2000,
} as const;
