import { isPhoto, readImageFile } from './imageFile.js';
import { PencilIcon } from '../icons.jsx';

/**
 * The click-to-replace catalogue thumbnail.
 *
 * A <label> wrapping a hidden file input, so the whole square is the
 * upload target and keyboard users still get the native control. Falls
 * back to the emoji or letter the catalogue item carries when there's
 * no photo yet — a lot of these items have never had one.
 */
export default function CatalogueThumb({ image, fallback, onPick, size = 'md', className = '' }) {
  const box = size === 'lg' ? 'h-16 w-16' : 'h-12 w-12';

  const handle = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      onPick(await readImageFile(file));
    } catch {
      /* a picked file that won't decode just leaves the old image in place */
    }
  };

  return (
    <label
      title="Change photo"
      className={`group/img relative grid ${box} shrink-0 cursor-pointer place-items-center overflow-hidden rounded-btn border border-line bg-sky-50 text-xl ${className}`}
    >
      {isPhoto(image) ? (
        <img src={image} alt="" className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden="true">{image || fallback}</span>
      )}

      <span className="absolute inset-0 grid place-items-center bg-navy-900/60 text-white opacity-0 transition-opacity group-hover/img:opacity-100">
        <PencilIcon width={16} height={16} />
      </span>

      <input type="file" accept="image/*" className="hidden" onChange={handle} />
    </label>
  );
}
