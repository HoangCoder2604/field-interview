import { saveInterviewRecord } from "../data/database.js";
import { compressImage } from "../services/image.js";
import { getCurrentLocation } from "../services/location.js";
import { registerBackgroundSync } from "../services/service-worker.js";
import { formatDateTime } from "../utils/date.js";
import { createSessionId } from "../utils/id.js";

const INTERVIEWER_NAME_KEY = "interviewerName";

export function createInterviewFormController({
  elements,
  showToast,
  onSaved,
  syncPending,
}) {
  const session = {
    id: "",
    startedAt: "",
    location: null,
    photoDataUrl: null,
  };

  function resetPhoto() {
    session.photoDataUrl = null;
    elements.photoInput.value = "";
    elements.photoPreview.src = "";
    elements.photoPreviewWrap.classList.add("hidden");
  }

  function startNewSession() {
    session.id = createSessionId();
    session.startedAt = new Date().toISOString();
    session.location = null;

    elements.form.reset();
    resetPhoto();

    elements.sessionIdText.textContent = session.id;
    elements.startedAt.value = formatDateTime(session.startedAt);
    elements.locationText.value = "";
    elements.locationMeta.textContent = "";
    elements.getLocationBtn.textContent = "Lấy vị trí";

    const rememberedName = localStorage.getItem(INTERVIEWER_NAME_KEY);

    if (rememberedName) {
      elements.interviewer.value = rememberedName;
    }
  }

  async function handleLocationRequest() {
    const originalLabel = elements.getLocationBtn.textContent;

    elements.getLocationBtn.disabled = true;
    elements.getLocationBtn.textContent = "Đang lấy...";

    try {
      session.location = await getCurrentLocation();

      elements.locationText.value =
        `${session.location.lat.toFixed(6)}, ${session.location.lng.toFixed(6)}`;

      elements.locationMeta.textContent =
        `Độ chính xác khoảng ${session.location.accuracy} m`;

      elements.getLocationBtn.textContent = "Lấy lại vị trí";
    } catch (error) {
      elements.getLocationBtn.textContent = originalLabel;
      showToast(error.message);
    } finally {
      elements.getLocationBtn.disabled = false;
    }
  }

  async function handlePhotoSelected() {
    const file = elements.photoInput.files?.[0];

    if (!file) return;

    try {
      session.photoDataUrl = await compressImage(file);

      elements.photoPreview.src = session.photoDataUrl;
      elements.photoPreviewWrap.classList.remove("hidden");
    } catch (error) {
      console.error(error);
      showToast("Không xử lý được ảnh.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const now = new Date().toISOString();

    const record = {
      id: session.id,
      interviewer: elements.interviewer.value.trim(),
      respondent: elements.respondent.value.trim(),
      topic: elements.topic.value.trim(),
      interviewType: elements.interviewType.value,
      notes: elements.notes.value.trim(),
      startedAt: session.startedAt,
      endedAt: now,
      createdAt: now,
      location: session.location,
      photoDataUrl: session.photoDataUrl,
      syncStatus: "pending",
      syncedAt: null,
      remoteImageUrl: null,
    };

    await saveInterviewRecord(record);
    localStorage.setItem(INTERVIEWER_NAME_KEY, record.interviewer);

    showToast(
      navigator.onLine
        ? "Đã lưu. Đang đồng bộ..."
        : "Đã lưu offline trên thiết bị."
    );

    await onSaved();

    if (navigator.onLine) {
      await syncPending();
    } else {
      await registerBackgroundSync();
    }

    startNewSession();
  }

  function init() {
    elements.form.addEventListener("submit", handleSubmit);
    elements.getLocationBtn.addEventListener("click", handleLocationRequest);
    elements.photoInput.addEventListener("change", handlePhotoSelected);
    elements.removePhotoBtn.addEventListener("click", resetPhoto);
    elements.newSessionBtn.addEventListener("click", startNewSession);

    startNewSession();
  }

  return {
    init,
    startNewSession,
  };
}
