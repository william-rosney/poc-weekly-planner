import { startOfWeek, endOfWeek, format, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Date utility functions for calendar navigation
 */

/**
 * Get the start and end dates of a week containing the given date
 * Week starts on Monday (French locale)
 */
export const getWeekRange = (date: Date) => {
  const start = startOfWeek(date, { locale: fr, weekStartsOn: 1 });
  const end = endOfWeek(date, { locale: fr, weekStartsOn: 1 });
  return { start, end };
};

/**
 * Format a week range for display
 * Example: "Semaine du 22 au 28 décembre"
 */
export const formatWeekTitle = (date: Date): string => {
  const { start, end } = getWeekRange(date);

  // If start and end are in the same month
  if (start.getMonth() === end.getMonth()) {
    return `Semaine du ${format(start, "d")} au ${format(end, "d MMMM", { locale: fr })}`;
  }

  // If start and end are in different months
  return `Semaine du ${format(start, "d MMMM", { locale: fr })} au ${format(end, "d MMMM", { locale: fr })}`;
};

/**
 * Format a single day for display
 * Example: "Jeudi 26 décembre"
 */
export const formatDayTitle = (date: Date): string => {
  return format(date, "EEEE d MMMM", { locale: fr });
};

/**
 * Get the start of day (for consistent date comparisons)
 */
export const normalizeDate = (date: Date): Date => {
  return startOfDay(date);
};
