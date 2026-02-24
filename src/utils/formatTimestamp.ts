import { formatDistanceToNow, differenceInDays, format } from "date-fns";

/**
 * Formats a Firestore Timestamp or Date into a relative string if recent,
 * or a formatted date string if older than 7 days.
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

  // Handle Firestore Timestamp
  const date: Date = value?.toDate ? value.toDate() : new Date(value);

  if (isNaN(date.getTime())) return "";

  const daysDiff = differenceInDays(new Date(), date);

  if (daysDiff >= 7) {
    return format(date, "MMM d, yyyy"); // e.g. "Feb 12, 2026"
  }

  return formatDistanceToNow(date, { addSuffix: true }); // e.g. "3 minutes ago"
}
