export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    return {
      supported: false,
      permission: "unsupported",
    };
  }

  const permission = await Notification.requestPermission();

  return {
    supported: true,
    permission,
  };
}

export async function showSyncSuccessNotification(count) {
  if (
    !("Notification" in window) ||
    Notification.permission !== "granted" ||
    !("serviceWorker" in navigator)
  ) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;

  await registration.showNotification("Đồng bộ hoàn tất", {
    body: `${count} phiên phỏng vấn đã được lưu lên Google Sheet.`,
    icon: "./icons/icon-192.png",
    badge: "./icons/icon-192.png",
    tag: "sync-success",
  });
}
