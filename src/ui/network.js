export function updateNetworkBadge(element, status = {}) {
  const isOnline = status.connected ?? navigator.onLine;
  const connectionType = status.connectionType || "unknown";

  element.textContent = isOnline ? "Online" : "Offline";
  element.className = `badge ${isOnline ? "badge--online" : "badge--offline"}`;
  element.title = isOnline
    ? `Đang kết nối (${connectionType})`
    : "Không có kết nối mạng";
}
