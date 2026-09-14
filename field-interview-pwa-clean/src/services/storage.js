export async function getStorageEstimate() {
  if (!navigator.storage?.estimate) {
    return null;
  }

  const { usage = 0, quota = 0 } = await navigator.storage.estimate();

  return {
    usage,
    quota,
  };
}

export function formatBytesAsMegabytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(1);
}
