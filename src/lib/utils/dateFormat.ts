import { format } from "date-fns";

const dateFormat = (
  date: Date | string,
  pattern: string = "dd MMM, yyyy",
): string => {
  // Parse date-only strings (YYYY-MM-DD) as local time so the calendar
  // day matches the stored value instead of shifting under the server timezone.
  const dateObj =
    typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date.trim())
      ? new Date(`${date.trim()}T12:00:00`)
      : new Date(date);
  const output = format(dateObj, pattern);
  return output;
};

export default dateFormat;
