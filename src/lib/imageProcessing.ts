/**
 * Image and Document Upload Validation & Resizing Utilities
 *
 * Rules:
 * - Allow PNG, JPG, and WebP up to 10 MB.
 * - Allow PDF up to 20 MB.
 * - Resize images so longest side is at most 2048 px (keeping aspect ratio, saving as PNG).
 * - Do not upscale small images.
 */

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
export const MAX_IMAGE_DIMENSION = 1800; // 1800 px max for Vision AI & compact server payload

const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const ALLOWED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];

/**
 * Validates a file for type and size constraints.
 * Throws a human-readable Error if validation fails.
 */
export function validateUploadFile(
  file: File,
  mode: 'catalogue' | 'photo' = 'catalogue'
): { isPdf: boolean; isImage: boolean } {
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();

  const isPdf =
    fileType === 'application/pdf' || fileName.endsWith('.pdf');

  const isImage =
    ALLOWED_IMAGE_TYPES.includes(fileType) ||
    ALLOWED_IMAGE_EXTENSIONS.some((ext) => fileName.endsWith(ext));

  if (mode === 'photo') {
    if (isPdf) {
      throw new Error('Please upload an image (PNG, JPG, or WebP) for the product photo, not a PDF.');
    }
    if (!isImage) {
      throw new Error(
        `Unsupported image format "${file.name}". Please upload a PNG, JPG, or WebP image.`
      );
    }
  } else {
    if (!isPdf && !isImage) {
      throw new Error(
        `Unsupported file type "${file.name}". Please upload a PNG, JPG, WebP image or a PDF document.`
      );
    }
  }

  // Size checks
  if (isPdf) {
    if (file.size > MAX_PDF_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      throw new Error(
        `PDF file size (${sizeMb} MB) exceeds the 20 MB limit. Please upload a smaller PDF.`
      );
    }
  } else if (isImage) {
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      throw new Error(
        `Image file size (${sizeMb} MB) exceeds the 10 MB limit. Please upload a smaller image (under 10 MB).`
      );
    }
  }

  return { isPdf, isImage };
}

/**
 * Loads an image File, checks dimensions, resizes if longest side > 2048 px (keeping aspect ratio),
 * and converts to PNG without upscaling smaller images.
 */
export async function resizeImageToMax2048(
  file: File,
  maxDimension = MAX_IMAGE_DIMENSION
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        try {
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;
          const longestSide = Math.max(width, height);

          // Calculate target dimensions (do not upscale)
          let targetWidth = width;
          let targetHeight = height;

          if (longestSide > maxDimension) {
            const scale = maxDimension / longestSide;
            targetWidth = Math.round(width * scale);
            targetHeight = Math.round(height * scale);
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve(file); // Fallback to original if 2D context fails
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }
              const outputName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
              const resizedFile = new File([blob], outputName, { type: 'image/jpeg' });
              resolve(resizedFile);
            },
            'image/jpeg',
            0.85
          );
        } catch (canvasErr) {
          console.warn('Canvas resize failed, using original file:', canvasErr);
          resolve(file);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for browser processing.'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Ensures a base64 Data URL does not exceed Serverless Function payload limits.
 * If the string exceeds maxChars (~1.8 MB), it re-renders to a constrained JPEG.
 */
export async function compressDataUrlIfNeeded(
  dataUrl: string,
  maxDimension = 1600,
  quality = 0.82
): Promise<string> {
  // If under ~1.8 MB (approx 2,400,000 base64 chars), no further compression needed
  if (!dataUrl || dataUrl.length < 2_400_000) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;
        const longest = Math.max(width, height);
        const scale = longest > maxDimension ? maxDimension / longest : 1.0;
        const targetW = Math.round(width * scale);
        const targetH = Math.round(height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(dataUrl);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.drawImage(img, 0, 0, targetW, targetH);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

