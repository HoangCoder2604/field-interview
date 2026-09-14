export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  return navigator.serviceWorker.register("./sw.js");
}

export async function registerBackgroundSync() {
  if (!("serviceWorker" in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    if (!("sync" in registration)) {
      return false;
    }

    await registration.sync.register("sync-interviews");
    return true;
  } catch (error) {
    console.warn("Background Sync không khả dụng:", error);
    return false;
  }
}

export function onServiceWorkerSyncRequest(callback) {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "SYNC_REQUESTED") {
      callback();
    }
  });
}
