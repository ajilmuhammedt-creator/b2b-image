import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Use bundled worker with CDN fallback
pdfjsLib.GlobalWorkerOptions.workerSrc =
  pdfWorker || `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function renderPdfToImage(file: File): Promise<{
  imageDataUrl: string;
  extractedText: string;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);

  // Extract textual elements across first 3 pages if available
  let extractedText = '';
  const numPages = Math.min(pdf.numPages || 1, 3);
  for (let i = 1; i <= numPages; i++) {
    try {
      const p = await pdf.getPage(i);
      const textContent = await p.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .filter(Boolean)
        .join(' ')
        .trim();
      if (pageText) {
        extractedText += (extractedText ? '\n\n' : '') + `[Page ${i}]: ${pageText}`;
      }
    } catch (textErr) {
      console.warn(`PDF page ${i} text extraction note:`, textErr);
    }
  }

  // Calculate optimal rendering scale so longest dimension is capped at ~1600px
  // (Prevents giant multi-megabyte canvas allocations while preserving pin-sharp text for Vision AI)
  const initialViewport = page.getViewport({ scale: 1.0 });
  const longestSide = Math.max(initialViewport.width, initialViewport.height);
  const targetMaxDim = 1600;
  const scale = longestSide > 0 ? Math.min(2.0, Math.max(1.0, targetMaxDim / longestSide)) : 1.5;

  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas 2D context not available.');
  }

  // Paint clean white background first so transparent PDF vector layers don't render black
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: context,
    canvas,
    viewport,
  } as any).promise;

  // Use image/jpeg at 0.85 quality: produces a crisp 200-400 KB payload instead of an 8-15 MB PNG!
  const imageDataUrl = canvas.toDataURL('image/jpeg', 0.85);
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

      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.onerror = () => resolve(sourceDataUrl);
    img.src = sourceDataUrl;
  });
}
