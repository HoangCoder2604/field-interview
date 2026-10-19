const LAST_LOCATION_KEY = "field-interview-last-location-v1";
const MAX_CACHED_AGE_MS = 15 * 60 * 1000;

function nativeGeolocation() {
  const capacitor = window.Capacitor;
  return capacitor?.isNativePlatform?.() === true &&
    capacitor?.isPluginAvailable?.("Geolocation") === true
    ? capacitor.Plugins?.Geolocation
    : null;
}

function normalizePosition(position, source) {
  const lat = Number(position?.coords?.latitude);
  const lng = Number(position?.coords?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("Thiết bị chưa trả về tọa độ hợp lệ.");
  }
  return {
    lat,
    lng,
    accuracy: Math.round(position.coords.accuracy ?? 0),
    capturedAt: new Date(position.timestamp || Date.now()).toISOString(),
    source,
    cached: false,
  };
}

function saveLastLocation(location) {
  try {
    localStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(location));
  } catch (error) {
    console.warn("Không lưu được vị trí gần nhất:", error);
  }
}

function getRecentLocation() {
  try {
    const location = JSON.parse(localStorage.getItem(LAST_LOCATION_KEY) || "null");
    const age = Date.now() - Date.parse(location?.capturedAt);
    if (Number.isFinite(location?.lat) && Number.isFinite(location?.lng) &&
        age >= 0 && age <= MAX_CACHED_AGE_MS) {
      return { ...location, cached: true, source: "saved" };
    }
  } catch (error) {
    console.warn("Không đọc được vị trí gần nhất:", error);
  }
  return null;
}

function getBrowserPosition(options) {
  if (!navigator.geolocation) {
    return Promise.reject(new Error("Trình duyệt không hỗ trợ định vị."));
  }
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

export async function getCurrentLocation(options = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 30000,
    maximumAge = 0,
    allowRecentFallback = true,
  } = options;
  const settings = { enableHighAccuracy, timeout, maximumAge };

  try {
    const native = nativeGeolocation();
    const position = native
      ? await native.getCurrentPosition(settings)
      : await getBrowserPosition(settings);
    const location = normalizePosition(position, native ? "device" : "browser");
    saveLastLocation(location);
    return location;
  } catch (error) {
    // Permission denied must not silently be replaced with old coordinates.
    const denied = error?.code === 1 || /permission|denied|từ chối|quyền/i.test(error?.message || "");
    if (!denied && allowRecentFallback) {
      const lastLocation = getRecentLocation();
      if (lastLocation) return lastLocation;
    }
    throw new Error(denied
      ? "Hãy cấp quyền vị trí cho trình duyệt/ứng dụng và bật Vị trí (GPS)."
      : "Không lấy được GPS mới. Hãy bật Vị trí (GPS), ra nơi thoáng và thử lại.");
  }
}
