export function getCurrentLocation(options = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 12000,
    maximumAge = 0,
  } = options;

  if (!navigator.geolocation) {
    return Promise.reject(new Error("Thiết bị không hỗ trợ định vị."));
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
          capturedAt: new Date(position.timestamp).toISOString(),
        });
      },
      (error) => reject(new Error(error.message || "Không lấy được vị trí.")),
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );
  });
}
