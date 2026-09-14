export function formatDateTime(isoDate) {
  if (!isoDate) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoDate));
}
