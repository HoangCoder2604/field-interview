export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    console.warn("Trình duyệt không hỗ trợ Service Worker.");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("./sw.js", {
      updateViaCache: "none",
    });

    console.log(
      "Service Worker đã đăng ký:",
      registration.scope
    );

    // Kiểm tra phiên bản Service Worker mới
    try {
      await registration.update();
    } catch (error) {
      console.warn(
        "Không thể kiểm tra bản cập nhật Service Worker:",
        error
      );
    }

    return registration;
  } catch (error) {
    console.error(
      "Đăng ký Service Worker thất bại:",
      error
    );

    return null;
  }
}

export async function registerBackgroundSync() {
  if (!("serviceWorker" in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    if (!("sync" in registration)) {
      console.warn(
        "Trình duyệt không hỗ trợ Background Sync."
      );

      return false;
    }

    await registration.sync.register("sync-interviews");

    console.log(
      "Đã đăng ký Background Sync: sync-interviews"
    );

    return true;
  } catch (error) {
    console.warn(
      "Background Sync không khả dụng:",
      error
    );

    return false;
  }
}

export function onServiceWorkerSyncRequest(callback) {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  navigator.serviceWorker.addEventListener(
    "message",
    (event) => {
      if (event.data?.type === "SYNC_REQUESTED") {
        console.log(
          "Service Worker yêu cầu đồng bộ dữ liệu."
        );

        callback();
      }
    }
  );
}