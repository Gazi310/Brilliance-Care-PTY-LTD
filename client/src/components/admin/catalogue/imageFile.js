/**
 * Catalogue image helpers.
 *
 * These were copy-pasted byte-for-byte into all three admin panels
 * (laundry, cleaning, shop). Phase 8 pulls them into one plain `.js`
 * module — plain so it can be imported anywhere without tripping
 * Fast Refresh's components-only rule.
 */

/** Is this an actual image (URL / data URI / path) rather than an emoji? */
export const isPhoto = (img) =>
  typeof img === 'string' &&
  (/^https?:\/\//.test(img) ||
    img.startsWith('data:') ||
    img.startsWith('/') ||
    /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(img));

/**
 * Read an image file, downscale it to `max` on the long edge and return
 * a compact JPEG data URL.
 *
 * The downscale matters: catalogue images go into the document as data
 * URLs, so a straight 4MB phone photo would be inlined into every
 * catalogue response the customer site fetches.
 */
export function readImageFile(file, max = 800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
