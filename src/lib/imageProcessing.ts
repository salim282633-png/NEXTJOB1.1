function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('تعذر قراءة الصورة.'));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('تعذر معالجة الصورة.')), 'image/webp', quality);
  });
}

/** Center-square crop with user-controlled zoom and offsets. */
export async function cropAndCompressAvatar(
  file: File,
  zoom = 1,
  offsetX = 0,
  offsetY = 0
): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('الملف المختار ليس صورة.');
  if (file.size > 8 * 1024 * 1024) throw new Error('حجم الصورة يجب ألا يتجاوز 8MB.');

  const image = await loadImage(file);
  const safeZoom = Math.min(3, Math.max(1, zoom));
  const cropSize = Math.min(image.naturalWidth, image.naturalHeight) / safeZoom;
  const maxX = Math.max(0, image.naturalWidth - cropSize);
  const maxY = Math.max(0, image.naturalHeight - cropSize);
  const x = Math.min(maxX, Math.max(0, maxX / 2 + (offsetX / 100) * (maxX / 2)));
  const y = Math.min(maxY, Math.max(0, maxY / 2 + (offsetY / 100) * (maxY / 2)));

  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('المتصفح لا يدعم معالجة الصورة.');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 400, 400);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, x, y, cropSize, cropSize, 0, 0, 400, 400);

  let blob = await canvasToBlob(canvas, 0.82);
  if (blob.size > 260 * 1024) blob = await canvasToBlob(canvas, 0.68);
  return blob;
}
