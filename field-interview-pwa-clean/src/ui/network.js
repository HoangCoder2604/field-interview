export function updateNetworkBadge(element) {
  const isOnline = navigator.onLine;

  element.textContent = isOnline ? "Online" : "Offline";
  element.className = `badge ${isOnline ? "badge--online" : "badge--offline"}`;
}
