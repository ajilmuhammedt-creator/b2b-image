import * as pdfjsLib from 'pdfjs-dist';

// Use cloudflare CDN worker for reliable cross-browser execution without asset bundling issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function renderPdfToImage(file: File): Promise<{
  imageDataUrl: string;
  extractedText: string;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);

  // Extract textual elements from PDF
  let extractedText = '';
  try {
    const textContent = await page.getTextContent();
    extractedText = textContent.items
      .map((item: any) => item.str || '')
      .filter(Boolean)
      .join(' ');
  } catch (textErr) {
    console.warn('PDF text extraction note:', textErr);
  }

  // Render Page to high-res Canvas
  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas 2D context not available.');
  }

  await page.render({
    canvasContext: context,
    canvas,
    viewport,
  } as any).promise;

  const imageDataUrl = canvas.toDataURL('image/png');
  return { imageDataUrl, extractedText };
}

export function cropImageByBox(
  sourceDataUrl: string,
  box: { ymin: number; xmin: number; ymax: number; xmax: number }
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const rawX = box.xmin * img.width;
      const rawY = box.ymin * img.height;
      const rawW = (box.xmax - box.xmin) * img.width;
      const rawH = (box.ymax - box.ymin) * img.height;

      // Generous 5% padding around product
      const padX = rawW * 0.05;
      const padY = rawH * 0.05;

      const x = Math.max(0, rawX - padX);
      const y = Math.max(0, rawY - padY);
      const w = Math.min(img.width - x, rawW + padX * 2);
      const h = Math.min(img.height - y, rawH + padY * 2);

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(sourceDataUrl);

      // Clean white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, x, y, w, h, 0, 0, w, h);

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(sourceDataUrl);
    img.src = sourceDataUrl;
  });
}
