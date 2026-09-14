import { getPendingInterviewRecords } from "./data/database.js";
import { registerServiceWorker, onServiceWorkerSyncRequest } from "./services/service-worker.js";
import { syncPendingInterviews } from "./services/sync.js";
import { getElements } from "./ui/dom.js";
import { createInterviewFormController } from "./ui/form.js";
import { initHistoryDialog, renderHistory } from "./ui/history.js";
import { initNavigation } from "./ui/navigation.js";
import { updateNetworkBadge } from "./ui/network.js";
import { createSettingsController } from "./ui/settings.js";
import { createToastController } from "./ui/toast.js";

const elements = getElements();
const showToast = createToastController(elements.toast);

async function updateSyncSummary() {
  const pendingRecords = await getPendingInterviewRecords();
  elements.syncSummary.textContent = `${pendingRecords.length} chờ đồng bộ`;
}

async function refreshDataViews() {
  await Promise.all([
    renderHistory(elements),
    updateSyncSummary(),
  ]);
}

async function syncAndRefresh({ showResultToast = false } = {}) {
  if (!navigator.onLine) {
    if (showResultToast) {
      showToast("Thiết bị đang offline.");
    }
    return;
  }

  const result = await syncPendingInterviews();
  await refreshDataViews();

  if (!showResultToast) return;

  if (result.successCount > 0) {
    showToast(`Đồng bộ thành công ${result.successCount} phiên.`);
  } else if (result.failedCount > 0) {
    showToast("Có dữ liệu chưa đồng bộ được. Hãy kiểm tra cấu hình.");
  } else {
    showToast("Không có dữ liệu chờ đồng bộ.");
  }
}

function bindNetworkEvents() {
  window.addEventListener("online", async () => {
    updateNetworkBadge(elements.networkBadge);
    showToast("Đã có mạng. Đang đồng bộ dữ liệu...");
    await syncAndRefresh();
  });

  window.addEventListener("offline", () => {
    updateNetworkBadge(elements.networkBadge);
  });
}

async function initApp() {
  updateNetworkBadge(elements.networkBadge);

  const settingsController = createSettingsController({
    elements,
    showToast,
  });

  const formController = createInterviewFormController({
    elements,
    showToast,
    onSaved: refreshDataViews,
    syncPending: () => syncAndRefresh(),
  });

  initNavigation({
    onViewChanged: async (viewId) => {
      if (viewId === "historyView") {
        await renderHistory(elements);
      }

      if (viewId === "settingsView") {
        await settingsController.updateStorageInfo();
      }
    },
  });

  initHistoryDialog(elements);
  settingsController.init();
  formController.init();
  bindNetworkEvents();

  elements.syncNowBtn.addEventListener("click", () => {
    syncAndRefresh({ showResultToast: true });
  });

  onServiceWorkerSyncRequest(async () => {
    if (navigator.onLine) {
      await syncAndRefresh();
    }
  });

  await registerServiceWorker();
  await refreshDataViews();
  await settingsController.updateStorageInfo();

  if (navigator.onLine) {
    await syncAndRefresh();
  }
}

initApp().catch((error) => {
  console.error("Không thể khởi tạo ứng dụng:", error);
  showToast("Ứng dụng gặp lỗi khi khởi tạo.");
});
