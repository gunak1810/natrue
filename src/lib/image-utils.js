/**
 * Optimizes an image file before upload.
 * Resizes to a max dimension and converts to WebP format.
 * 
 * @param {File} file - The original image file.
 * @param {Object} options - Optimization options.
 * @param {number} options.maxWidth - Max width (default 1200).
 * @param {number} options.maxHeight - Max height (default 1200).
 * @param {number} options.quality - Quality (0 to 1, default 0.8).
 * @returns {Promise<Blob>} - Optimized image blob.
 */
export async function optimizeImage(file, { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas toBlob failed'));
          }
        }, 'image/webp', quality);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
