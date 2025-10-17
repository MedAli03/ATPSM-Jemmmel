const rtf = new Intl.RelativeTimeFormat("ar", { numeric: "auto" });

const DIVISIONS = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
];

export function formatRelativeTime(dateLike) {
  if (!dateLike) return "";
  const date = typeof dateLike === "string" || typeof dateLike === "number" ? new Date(dateLike) : dateLike;
  const now = new Date();
  let duration = (date.getTime() - now.getTime()) / 1000;
  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return rtf.format(Math.round(duration), "year");
}

export function formatDateLabel(dateLike) {
  const date = typeof dateLike === "string" || typeof dateLike === "number" ? new Date(dateLike) : dateLike;
  return date.toLocaleDateString("ar-TN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
