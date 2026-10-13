const dateFormat = (
  date: Date | string,
  locale?: string | undefined,
): string => {
  // Keep date-only CMS values on the stored calendar day in every time zone.
  const dateObj =
    typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date.trim())
      ? new Date(`${date.trim()}T12:00:00Z`)
      : new Date(date);
  return new Intl.DateTimeFormat(locale?.replace("_", "-"), {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(dateObj);
};

export default dateFormat;
