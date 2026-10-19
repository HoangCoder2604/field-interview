let currentStatus = {
  connected: navigator.onLine,
  connectionType: navigator.onLine ? "unknown" : "none",
};

function getNativeNetworkPlugin() {
  const capacitor = window.Capacitor;

  if (
    capacitor?.isNativePlatform?.() !== true ||
    capacitor?.isPluginAvailable?.("Network") !== true
  ) {
    return null;
  }

  return capacitor.Plugins?.Network || null;
}

function normalizeStatus(status) {
  return {
    connected: Boolean(status?.connected),
    connectionType:
      status?.connectionType || (status?.connected ? "unknown" : "none"),
  };
}

function setCurrentStatus(status) {
  currentStatus = normalizeStatus(status);
  return currentStatus;
}

export function getNetworkStatus() {
  return { ...currentStatus };
}

export function isNetworkConnected() {
  return currentStatus.connected;
}

export async function initializeNetworkMonitoring(onStatusChanged) {
  const nativeNetwork = getNativeNetworkPlugin();

  if (nativeNetwork) {
    setCurrentStatus(await nativeNetwork.getStatus());

    await nativeNetwork.addListener("networkStatusChange", (status) => {
      const nextStatus = setCurrentStatus(status);

      Promise.resolve(onStatusChanged?.(nextStatus)).catch((error) => {
        console.error("Không thể xử lý thay đổi trạng thái mạng:", error);
      });
    });

    return getNetworkStatus();
  }

  const notifyBrowserStatus = () => {
    const nextStatus = setCurrentStatus({
      connected: navigator.onLine,
      connectionType: navigator.onLine ? "unknown" : "none",
    });

    Promise.resolve(onStatusChanged?.(nextStatus)).catch((error) => {
      console.error("Không thể xử lý thay đổi trạng thái mạng:", error);
    });
  };

  window.addEventListener("online", notifyBrowserStatus);
  window.addEventListener("offline", notifyBrowserStatus);
  // Some mobile browsers suspend events while the PWA is in the background.
  // Reconcile the badge as soon as the user returns to the app.
  window.addEventListener("pageshow", notifyBrowserStatus);
  window.addEventListener("focus", notifyBrowserStatus);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) notifyBrowserStatus();
  });
  notifyBrowserStatus();

  return getNetworkStatus();
}
