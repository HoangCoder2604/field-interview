export async function compressImage(file, options = {}) {
  const {
    maxSize = 1280,
    quality = 0.72,
  } = options;

  const bitmap = await createImageBitmap(file);

  try {
    const scale = Math.min(
      1,
      maxSize / Math.max(bitmap.width, bitmap.height)
    );

    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Không thể tạo canvas để xử lý ảnh.");
    }

    context.drawImage(bitmap, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    bitmap.close();
  }
}
