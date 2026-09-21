const SYNC_CHANNEL_ID = "interview-sync";

function getNativeNotificationsPlugin() {
  const capacitor = window.Capacitor;

  if (
    capacitor?.isNativePlatform?.() !== true ||
    capacitor?.isPluginAvailable?.("LocalNotifications") !== true
  ) {
    return null;
  }

  return capacitor.Plugins?.LocalNotifications || null;
}

async function prepareNativeNotificationChannel(plugin) {
  await plugin.createChannel({
    id: SYNC_CHANNEL_ID,
    name: "Đồng bộ phỏng vấn",
    description: "Thông báo khi dữ liệu phỏng vấn đã đồng bộ thành công.",
    importance: 4,
    visibility: 1,
    vibration: true,
  });
}

export async function requestNotificationPermission() {
  const nativeNotifications = getNativeNotificationsPlugin();

  if (nativeNotifications) {
    let permission = await nativeNotifications.checkPermissions();

    if (permission.display !== "granted") {
      permission = await nativeNotifications.requestPermissions();
    }

    if (permission.display === "granted") {
      await prepareNativeNotificationChannel(nativeNotifications);
    }

    return {
      supported: true,
      permission: permission.display,
      platform: "native",
    };
  }

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
    platform: "web",
  };
}

export async function showSyncSuccessNotification(count) {
  const nativeNotifications = getNativeNotificationsPlugin();

  if (nativeNotifications) {
    const permission = await nativeNotifications.checkPermissions();

    if (permission.display !== "granted") {
      return false;
    }

    await prepareNativeNotificationChannel(nativeNotifications);
    await nativeNotifications.schedule({
      notifications: [
        {
          id: Math.floor(Date.now() / 1000) % 2147483647,
          title: "Đồng bộ hoàn tất",
          body: `${count} phiên phỏng vấn đã được lưu lên Google Sheet.`,
          channelId: SYNC_CHANNEL_ID,
          autoCancel: true,
          foreground: true,
          isExactNotification: false,
          extra: {
            type: "sync-success",
            syncedCount: count,
          },
        },
      ],
    });

    return true;
  }

  if (
    !("Notification" in window) ||
    Notification.permission !== "granted" ||
    !("serviceWorker" in navigator)
  ) {
    return false;
  }

  const registration = await navigator.serviceWorker.ready;

  await registration.showNotification("Đồng bộ hoàn tất", {
    body: `${count} phiên phỏng vấn đã được lưu lên Google Sheet.`,
    icon: "./icons/icon-192.png",
    badge: "./icons/icon-192.png",
    tag: "sync-success",
  });

  return true;
}
