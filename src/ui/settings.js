import {
  formatBytesAsMegabytes,
  getStorageEstimate,
} from "../services/storage.js";

import {
  requestNotificationPermission,
} from "../services/notifications.js";

import {
  getApiUrl,
  setApiUrl,
} from "../services/sync.js";

export function createSettingsController({ elements, showToast }) {
  async function updateStorageInfo() {
    const estimate = await getStorageEstimate();

    if (!estimate) {
      elements.storageInfo.textContent =
        "Trình duyệt không cung cấp thông tin dung lượng.";
      return;
    }

    elements.storageInfo.textContent =
      `Đã dùng khoảng ${formatBytesAsMegabytes(estimate.usage)} MB / ` +
      `${formatBytesAsMegabytes(estimate.quota)} MB bộ nhớ web khả dụng.`;
  }

  function saveApiUrl() {
    setApiUrl(elements.apiUrl.value);
    showToast("Đã lưu URL Google Apps Script.");
  }

  async function enableNotifications() {
    const result = await requestNotificationPermission();

    if (!result.supported) {
      showToast("Trình duyệt không hỗ trợ notification.");
      return;
    }

    showToast(
      result.permission === "granted"
        ? "Đã bật thông báo."
        : "Bạn chưa cấp quyền thông báo."
    );
  }

  function init() {
    elements.apiUrl.value = getApiUrl();

    elements.saveApiBtn.addEventListener("click", saveApiUrl);
    elements.enableNotificationsBtn.addEventListener(
      "click",
      enableNotifications
    );
  }

  return {
    init,
    updateStorageInfo,
  };
}
