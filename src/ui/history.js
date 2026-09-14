import {
  getAllInterviewRecords,
  getInterviewRecord,
} from "../data/database.js";

import { formatDateTime } from "../utils/date.js";
import { escapeHtml } from "../utils/html.js";

function renderDetail(record, elements) {
  const hasLocation =
    record.location &&
    Number.isFinite(Number(record.location.lat)) &&
    Number.isFinite(Number(record.location.lng));

  const latitude = hasLocation
    ? Number(record.location.lat)
    : null;

  const longitude = hasLocation
    ? Number(record.location.lng)
    : null;

  const accuracy = hasLocation
    ? Number(record.location.accuracy || 0)
    : null;

  const locationText = hasLocation
    ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}${
        accuracy ? ` (±${accuracy}m)` : ""
      }`
    : "Không có";

  const mapUrl = hasLocation
    ? `https://www.google.com/maps?q=${encodeURIComponent(
        `${latitude},${longitude}`
      )}`
    : "";

  const notes = escapeHtml(record.notes || "").replace(/\n/g, "<br>");

  elements.detailContent.innerHTML = `
    <div class="detail-row">
      <strong>Mã phiên</strong>
      <span>${escapeHtml(record.id || "")}</span>
    </div>

    <div class="detail-row">
      <strong>Người phỏng vấn</strong>
      <span>${escapeHtml(record.interviewer || "")}</span>
    </div>

    <div class="detail-row">
      <strong>Người được hỏi</strong>
      <span>${escapeHtml(record.respondent || "—")}</span>
    </div>

    <div class="detail-row">
      <strong>Chủ đề</strong>
      <span>${escapeHtml(record.topic || "—")}</span>
    </div>

    <div class="detail-row">
      <strong>Loại</strong>
      <span>${escapeHtml(record.interviewType || "—")}</span>
    </div>

    <div class="detail-row">
      <strong>Bắt đầu</strong>
      <span>${formatDateTime(record.startedAt)}</span>
    </div>

    <div class="detail-row">
      <strong>Kết thúc</strong>
      <span>${formatDateTime(record.endedAt)}</span>
    </div>

    <div class="detail-location">
      <div class="detail-row">
        <strong>Vị trí hiện trường</strong>
        <span>${locationText}</span>
      </div>

      ${
        hasLocation
          ? `
            <div class="location-meta">
              <span>
                <strong>Latitude:</strong>
                ${latitude.toFixed(6)}
              </span>

              <span>
                <strong>Longitude:</strong>
                ${longitude.toFixed(6)}
              </span>

              ${
                accuracy
                  ? `
                    <span>
                      <strong>Độ chính xác:</strong>
                      ±${accuracy} m
                    </span>
                  `
                  : ""
              }
            </div>

            <a
              class="map-button"
              href="${mapUrl}"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Xem vị trí hiện trường trên Google Maps"
            >
              📍 Xem trên Google Maps
            </a>
          `
          : ""
      }
    </div>

    <div class="detail-row">
      <strong>Đồng bộ</strong>
      <span>
        ${
          record.syncStatus === "synced"
            ? "Đã đồng bộ"
            : "Chưa đồng bộ"
        }
      </span>
    </div>

    <div>
      <strong>Nội dung phỏng vấn</strong>
      <p>${notes || "Không có nội dung"}</p>
    </div>

    ${
      record.photoDataUrl
        ? `
          <img
            class="detail-img"
            src="${record.photoDataUrl}"
            alt="Ảnh hiện trường"
          >
        `
        : ""
    }

    ${
      record.remoteImageUrl
        ? `
          <a
            href="${escapeHtml(record.remoteImageUrl)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mở ảnh trên Google Drive
          </a>
        `
        : ""
    }
  `;

  if (typeof elements.detailDialog.showModal === "function") {
    elements.detailDialog.showModal();
  }
}

async function openInterviewDetail(id, elements) {
  try {
    const record = await getInterviewRecord(id);

    if (record) {
      renderDetail(record, elements);
    }
  } catch (error) {
    console.error("Không thể mở chi tiết phiên:", error);
  }
}

export async function renderHistory(elements) {
  try {
    const records = await getAllInterviewRecords();

    elements.historyList.innerHTML = "";

    elements.emptyHistory.classList.toggle(
      "hidden",
      records.length > 0
    );

    const fragment = document.createDocumentFragment();

    records.forEach((record) => {
      const item = document.createElement("article");

      item.className = "history-item";
      item.tabIndex = 0;
      item.setAttribute("role", "button");

      item.setAttribute(
        "aria-label",
        `Mở chi tiết phiên ${record.topic || ""}`
      );

      item.dataset.id = record.id;

      const isSynced = record.syncStatus === "synced";

      item.innerHTML = `
        <div class="history-top">
          <div>
            <div class="history-title">
              ${escapeHtml(record.topic || "Không có chủ đề")}
            </div>

            <div class="muted">
              ${escapeHtml(
                record.respondent ||
                  "Không ghi người được phỏng vấn"
              )}
            </div>
          </div>

          <span
            class="status ${
              isSynced
                ? "status--synced"
                : "status--pending"
            }"
          >
            ${isSynced ? "Đã đồng bộ" : "Chờ đồng bộ"}
          </span>
        </div>

        <div class="meta">
          <span>
            ${formatDateTime(record.startedAt)}
          </span>

          <span>
            ${escapeHtml(record.interviewer || "—")}
          </span>

          <span>
            ${escapeHtml(record.interviewType || "—")}
          </span>
        </div>
      `;

      const open = () => {
        openInterviewDetail(record.id, elements);
      };

      item.addEventListener("click", open);

      item.addEventListener("keydown", (event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          open();
        }
      });

      fragment.appendChild(item);
    });

    elements.historyList.appendChild(fragment);
  } catch (error) {
    console.error("Không thể tải lịch sử:", error);

    elements.historyList.innerHTML = `
      <p class="muted">
        Không thể tải lịch sử phỏng vấn.
      </p>
    `;
  }
}

export function initHistoryDialog(elements) {
  elements.closeDialogBtn.addEventListener(
    "click",
    () => {
      elements.detailDialog.close();
    }
  );

  elements.detailDialog.addEventListener(
    "click",
    (event) => {
      if (event.target === elements.detailDialog) {
        elements.detailDialog.close();
      }
    }
  );
}