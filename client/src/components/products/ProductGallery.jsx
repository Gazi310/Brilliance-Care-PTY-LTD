import { useState } from 'react';
import ImagePlaceholder from '../ui/ImagePlaceholder.jsx';

/**
 * ProductGallery — the square hero shot with a thumbnail strip under it.
 *
 * The wireframe shows four thumbs. The Product model holds a single
 * `image`, so the strip renders only when there's genuinely more than
 * one shot to switch between; four decorative thumbs that all show the
 * same picture would be a lie told in the UI. The component already
 * takes an array, so the day the model grows a gallery this is a
 * one-line change at the call site.
 */

const isPhoto = (img) =>
  typeof img === 'string' &&
  (/^https?:\/\//.test(img) ||
    img.startsWith('data:') ||
    img.startsWith('/') ||
    /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(img));

export default function ProductGallery({ images = [], name = '', subject }) {
  const [active, setActive] = useState(0);
  const shots = images.filter(Boolean);
  const current = shots[active] ?? shots[0];
  const photo = isPhoto(current);

  return (
    <div>
      <div className="relative">
        <ImagePlaceholder
          ratio="1"
          src={photo ? current : undefined}
          alt={name}
          subject={subject || `${name} — product shot on white · 1:1`}
        />

        {/* Emoji-only products still get their glyph, centred at scale. */}
        {!photo && current && (
          <span
            className="pointer-events-none absolute inset-0 grid place-items-center text-[7rem] lg:text-[9rem]"
            aria-hidden="true"
          >
            {current}
          </span>
        )}
      </div>

      {shots.length > 1 && (
        <div className="mt-3.5 flex gap-3">
          {shots.map((img, i) => (
            <button
              key={`${img}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${shots.length}`}
              aria-current={i === active}
              className={`flex-1 overflow-hidden rounded-xl border-2 transition-colors ${
                i === active ? 'border-navy-900' : 'border-transparent hover:border-line'
              }`}
            >
              <ImagePlaceholder
                ratio="1"
                src={isPhoto(img) ? img : undefined}
                alt=""
                subject={`Shot ${i + 1}`}
                className="!rounded-none"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
