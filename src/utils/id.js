export function createSessionId() {
  const timestamp = new Date()
    .toISOString()
    .replace(/\D/g, "")
    .slice(0, 14);

  const suffix = Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase();

  return `PV-${timestamp}-${suffix}`;
}
