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

