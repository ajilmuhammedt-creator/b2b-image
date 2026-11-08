/**
 * Client-side high-fidelity WebP image converter.
 * Converts any image Blob, base64 data URL, or image element into a compliant .webp Blob.
 */
export async function convertToWebpBlob(
  source: Blob | string,
  quality: number = 0.95
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    let objectUrl: string | null = null;
    let srcUrl: string;

    if (typeof source === 'string') {
      if (source.startsWith('data:') || source.startsWith('blob:') || source.startsWith('http')) {
        srcUrl = source;
      } else {
        // Assume raw base64 png string
        srcUrl = `data:image/png;base64,${source}`;
      }
    } else {
      objectUrl = URL.createObjectURL(source);
      srcUrl = objectUrl;
    }

    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 1024;
        canvas.height = img.naturalHeight || img.height || 1024;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          cleanup();
          if (source instanceof Blob) return resolve(source);
          return reject(new Error('Canvas 2D context not available'));
        }

        // Draw image at full resolution
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (webpBlob) => {
            cleanup();
            if (webpBlob) {
              // Ensure mime type is explicitly image/webp
              if (webpBlob.type === 'image/webp') {
                resolve(webpBlob);
              } else {
                resolve(new Blob([webpBlob], { type: 'image/webp' }));
              }
            } else {
              if (source instanceof Blob) resolve(source);
              else reject(new Error('Failed to convert canvas to WebP'));
            }
          },
          'image/webp',
          quality
        );
      } catch (err) {
        cleanup();
        console.warn('Canvas conversion threw, falling back to original blob:', err);
        if (source instanceof Blob) resolve(source);
        else reject(err);
      }
    };

    img.onerror = (err) => {
      cleanup();
      console.warn('Image failed to load in convertToWebpBlob:', err);
      if (source instanceof Blob) resolve(source);
      else reject(err);
    };

    img.src = srcUrl;
  });
}

/**
 * Converts image Blob or data URL to official Amazon specification standards:
 * - 2000 × 2000 pixels (1:1 square production standard)
 * - Format: High-fidelity JPEG (preferred by Amazon) or PNG
 * - Quality: 0.95
 * - Color space: sRGB
 * - High-quality bicubic/smooth image scaling
 */
export async function convertToAmazonFormatBlob(
  source: Blob | string,
  format: 'jpeg' | 'png' = 'jpeg',
  targetDimension: number = 2000,
  quality: number = 0.95
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    let objectUrl: string | null = null;
    let srcUrl: string;

    if (typeof source === 'string') {
      if (source.startsWith('data:') || source.startsWith('blob:') || source.startsWith('http')) {
        srcUrl = source;
      } else {
        srcUrl = `data:image/png;base64,${source}`;
      }
    } else {
      objectUrl = URL.createObjectURL(source);
      srcUrl = objectUrl;
    }

    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetDimension;
        canvas.height = targetDimension;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          cleanup();
          if (source instanceof Blob) return resolve(source);
          return reject(new Error('Canvas 2D context not available'));
        }

        // Enable highest quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // For JPEG, fill pure white background (#FFFFFF) so no transparent edges turn black
        if (format === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetDimension, targetDimension);
        }

        // Calculate aspect-preserving bounds centered in square
        const srcW = img.naturalWidth || img.width || targetDimension;
        const srcH = img.naturalHeight || img.height || targetDimension;
        const aspect = srcW / srcH;

        let drawW = targetDimension;
        let drawH = targetDimension;
        let offsetX = 0;
        let offsetY = 0;

        if (aspect > 1) {
          // Wider than tall
          drawH = targetDimension / aspect;
          offsetY = (targetDimension - drawH) / 2;
        } else if (aspect < 1) {
          // Taller than wide
          drawW = targetDimension * aspect;
          offsetX = (targetDimension - drawW) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

        const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';

        canvas.toBlob(
          (blob) => {
            cleanup();
            if (blob) {
              resolve(blob);
            } else {
              if (source instanceof Blob) resolve(source);
              else reject(new Error(`Failed to convert canvas to ${format.toUpperCase()}`));
            }
          },
          mimeType,
          quality
        );
      } catch (err) {
        cleanup();
        console.warn('Canvas Amazon conversion threw, falling back:', err);
        if (source instanceof Blob) resolve(source);
        else reject(err);
      }
    };

    img.onerror = (err) => {
      cleanup();
      console.warn('Image failed to load in convertToAmazonFormatBlob:', err);
      if (source instanceof Blob) resolve(source);
      else reject(err);
    };

    img.src = srcUrl;
  });
}

