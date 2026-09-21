import {
  getPendingInterviewRecords,
  saveInterviewRecord,
} from "../data/database.js";

import { showSyncSuccessNotification } from "./notifications.js";
import { isNetworkConnected } from "./network.js";

const API_URL_KEY = "fieldInterviewApiUrl";
const DEFAULT_API_URL =
  "https://script.google.com/macros/s/AKfycbyFCe57R1mxWbF7oixC5nAcyQKcSRUdROKFmBUI46Q3I-e2OD-EZ7tuNUh60Ko5HfxEwg/exec";

export function getApiUrl() {
  return localStorage.getItem(API_URL_KEY)?.trim() || DEFAULT_API_URL;
}

export function setApiUrl(url) {
  const normalizedUrl = url.trim();

  if (!normalizedUrl || normalizedUrl === DEFAULT_API_URL) {
    localStorage.removeItem(API_URL_KEY);
    return;
  }

  localStorage.setItem(API_URL_KEY, normalizedUrl);
}

async function syncInterview(record) {
  const apiUrl = getApiUrl();

  if (!apiUrl) {
    throw new Error("Chưa cấu hình Apps Script URL.");
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      action: "saveInterview",
      interview: record,
    }),
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const result = await response.json();

  if (!result.ok) {
    throw new Error(result.error || "Đồng bộ thất bại.");
  }

  const syncedRecord = {
    ...record,
    syncStatus: "synced",
    syncedAt: new Date().toISOString(),
    remoteImageUrl: result.imageUrl || record.remoteImageUrl || null,
  };

  await saveInterviewRecord(syncedRecord);

  return syncedRecord;
}

export async function syncPendingInterviews() {
  if (!isNetworkConnected()) {
    return {
      successCount: 0,
      failedCount: 0,
      skipped: true,
    };
  }

  const pendingRecords = await getPendingInterviewRecords();

  if (!pendingRecords.length) {
    return {
      successCount: 0,
      failedCount: 0,
      skipped: false,
    };
  }

  let successCount = 0;
  let failedCount = 0;

  for (const record of pendingRecords) {
    try {
      await syncInterview(record);
      successCount += 1;
    } catch (error) {
      failedCount += 1;
      console.error(`Không thể đồng bộ ${record.id}:`, error);
    }
  }

  if (successCount > 0) {
    try {
      await showSyncSuccessNotification(successCount);
    } catch (error) {
      // Dữ liệu đã đồng bộ thành công; lỗi hiển thị thông báo không được làm
      // thay đổi kết quả đồng bộ hoặc khiến bản ghi được gửi lại.
      console.warn("Không thể hiển thị thông báo đồng bộ:", error);
    }
  }

  return {
    successCount,
    failedCount,
    skipped: false,
  };
}
