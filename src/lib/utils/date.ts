import dayjs from '../dayjs';

/**
 * Days of the week considered as "big week".
 *
 * Days:
 * - 0: Monday
 * - 1: Tuesday
 * - 2: Wednesday
 * - 3: Thursday
 * - 4: Friday
 * - 5: Saturday
 * - 6: Sunday
 */
export const BIG_WEEK_DAYS = [0, 1, 2, 5, 6];

/**
 * Returns an array of 7 dates corresponding to the days of the week from Monday to Sunday,
 * for the week containing the given date (or the current week by default).
 *
 * @param date - The reference date (default: today)
 * @returns An array of 7 Date objects, from Monday to Sunday
 */
export function getWeekDays(date: Date = new Date()) {
  const today = date;
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
  const weekDays = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    weekDays.push(date);
  }

  return weekDays;
}

/**
 * Formats a date into a readable French string, including the day of the week, month, and day of the month.
 *
 * @param date - The date to format
 * @returns A formatted string, e.g.: "lundi 1 janvier"
 */
export function formatDate(date: Date) {
  return date.toLocaleDateString('fr-FR', { weekday: 'long', month: 'long', day: 'numeric' });
}

/**
 * Calculates the week number (ISO 8601) for a given date.
 *
 * @param date - The reference date (default: today)
 * @returns The week number (1 to 53)
 */
export function getWeekNumber(date: Date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(
    (((d as unknown as number) - (yearStart as unknown as number)) / 86400000 + 1) / 7,
  );
}

/**
 * Indicates whether the given day is part of the "big week days" (see BIG_WEEK_DAYS).
 *
 * @param day - The date to test (default: today)
 * @returns true if the day is a "big week day", otherwise false
 */
export function isBigWeek(day: Date = new Date()) {
  return BIG_WEEK_DAYS.includes(day.getDay());
}

/**
 * Returns a new date corresponding to the date passed as a parameter,
 * but with hours, minutes, seconds, and milliseconds set to zero.
 *
 * @param date - The reference date (default: today)
 * @returns A new Date instance set to midnight
 */
export function getDate(date: Date = new Date()) {
  return new Date(date.setHours(0, 0, 0, 0));
}

export function getWeekDay(day: number): string {
  return dayjs().weekday(day).format('dddd');
}
