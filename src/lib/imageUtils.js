/**
 * Converts an image File to a WebP File.
 * @param {File} file - The original image file
 * @param {number} maxWidth - Max width of the image (default 1600 for banners)
 * @param {number} quality - WebP quality 0 to 1 (default 0.8)
 * @returns {Promise<File>} - The converted WebP file
 */
export async function convertToWebP(file, maxWidth = 1600, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Invalid image file.'));
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // Fill white background in case of transparent png -> webp to avoid black backgrounds
        // Wait, for banners it's fine, but if they upload transparent PNGs we might want transparency.
        // I will clear the rect to allow transparency.
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Canvas to Blob conversion failed.'));
            }
            // Create a new File from the blob
            const newFileName = file.name.replace(/\.[^/.]+$/, "") + '.webp';
            const webpFile = new File([blob], newFileName, {
              type: 'image/webp',
              lastModified: Date.now()
            });
            resolve(webpFile);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}
