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

/**
 * Returns the name of the day of the week corresponding to the given number.
 *
 * @param day - The number of the day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 * @returns The name of the day in French
 */
export function getWeekDay(day: number): string {
  return dayjs().weekday(day).format('dddd');
}

/**
 * Returns the first day of the week corresponding to the given week number and year.
 *
 * @param weekNumber - The week number {@link getWeekNumber}
 * @param year - The year (default: current year)
 * @returns A Date object representing the first day of the week
 */
export function getFirstDayOfWeek(weekNumber: number, year: number = new Date().getFullYear()) {
  const firstDayOfYear = new Date(year, 0, 1);
  const daysToAdd = (weekNumber - 1) * 7 - firstDayOfYear.getDay() + 1;
  return new Date(firstDayOfYear.setDate(firstDayOfYear.getDate() + daysToAdd));
}

/**
 * Returns the day of the week (1 = Monday, 2 = Tuesday, ..., 6 = Saturday, 0 = Sunday)
 * for a given date string.
 *
 * @param date - The date to get the day of the week from
 * @returns The day of the week (0-6)
 */
export function getDay(date: string) {
  const day = dayjs(date).day();
  return day === 0 ? 6 : day - 1;
}

/**
 * Returns the start of the week (Monday) for a given date string.
 *
 * @param date - The date to get the start of the week from
 * @returns A Date object representing the start of the week
 */
export function startOfWeek(date: string) {
  return dayjs(date).subtract(getDay(date), 'day').startOf('day').toDate();
}

/**
 * Returns the end of the week (Sunday) for a given date string.
 *
 * @param date - The date to get the end of the week from
 * @returns A Date object representing the end of the week
 */
export function endOfWeek(date: string) {
  return dayjs(date)
    .add(6 - getDay(date), 'day')
    .endOf('day')
    .toDate();
}

/**
 * Checks if a given date is within the week range of a specified value.
 *
 * @param date - The date to check
 * @param value - The reference date (or null)
 * @returns true if the date is within the week range, otherwise false
 */
export function isInWeekRange(date: string, value: string | null) {
  return value
    ? dayjs(date).isBefore(endOfWeek(value)) &&
        dayjs(date).millisecond(1).isAfter(startOfWeek(value))
    : false;
}
