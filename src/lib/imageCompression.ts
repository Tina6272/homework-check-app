const MAX_WIDTH = 1600;
const JPEG_QUALITY = 0.78;

export async function compressImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("無法處理圖片壓縮");
  }

  context.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("圖片轉檔失敗"))),
      "image/jpeg",
      JPEG_QUALITY,
    );
  });

  const safeName = file.name.replace(/\.[^.]+$/, "") || "homework";
  return new File([blob], `${safeName}.jpg`, { type: "image/jpeg" });
}
