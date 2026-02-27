import { differenceInDays, format, formatDistanceToNow } from "date-fns";

/**
 * Formats a Firestore Timestamp, Date, or date string into a relative string
 * if recent (within 7 days and has time precision), or a formatted date otherwise.
 *
 * Examples:
 *   "just now"
 *   "3 minutes ago"
 *   "2 hours ago"
 *   "5 days ago"
 *   "Feb 12, 2026"
 */
export function formatTimestamp(value: any): string {
  if (!value) return "";

  // If it's already a plain date string with no time (e.g. "Feb 24, 2026"), return as-is
  if (typeof value === "string" && !/T|Z|\d{2}:\d{2}/.test(value)) {
    return value;
  }

  let date: Date;

  if (value?.toDate) {
    // Firestore Timestamp with toDate() method
    date = value.toDate();
  } else if (value?.seconds) {
    // Plain Firestore Timestamp-like object { seconds, nanoseconds }
    date = new Date(value.seconds * 1000);
  } else {
    date = new Date(value);
  }

  if (isNaN(date.getTime())) return "";

  const daysDiff = differenceInDays(new Date(), date);

  if (daysDiff >= 7) {
    return format(date, "MMM d, yyyy");
  }

  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Converts a Firestore Timestamp, ISO string, or plain { seconds } object to
 * a Unix timestamp in milliseconds. Returns 0 for null / undefined / unknown
 * values so callers can safely subtract for numeric sorting.
 */
export function toUnixMs(value: any): number {
  if (!value) return 0;
  if (typeof value === "string") return new Date(value).getTime();
  if (typeof value.toMillis === "function") return value.toMillis();
  if (typeof value.seconds === "number") return value.seconds * 1000;
  return 0;
}
