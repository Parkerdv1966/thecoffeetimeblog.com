/**
 * Format helpers for the journal-style date markers.
 */

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** "Tuesday" */
export function formatDay(date: Date): string {
  return DAY_NAMES[date.getDay()] ?? '';
}

/** "Tuesday — Lisbon, October" */
export function formatDateline(date: Date, location: string): string {
  const day = DAY_NAMES[date.getDay()] ?? '';
  const month = MONTH_NAMES[date.getMonth()] ?? '';
  return `${day} — ${location}, ${month}`;
}

/** "October 14, 2025" — used for machine readability and footers */
export function formatLongDate(date: Date): string {
  const month = MONTH_NAMES[date.getMonth()] ?? '';
  return `${month} ${date.getDate()}, ${date.getFullYear()}`;
}
