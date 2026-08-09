import { Link } from 'react-router-dom';
import ImagePlaceholder from '../ui/ImagePlaceholder.jsx';
import QtyControl from './QtyControl.jsx';

/**
 * CartLine — one `.rowitem`: thumbnail, name, stepper, line total, remove.
 *
 * Rows live inside a single Card and are separated by a hairline rather
 * than each being its own floating card. Eight shadows stacked down a
 * page reads as noise, and the cart is the screen where the customer is
 * counting things — it should look like a list, not a gallery.
 */

const isPhoto = (img) =>
  typeof img === 'string' &&
  (/^https?:\/\//.test(img) ||
    img.startsWith('data:') ||
    img.startsWith('/') ||
    /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(img));

export default function CartLine({ item, setQty, remove }) {
  const photo = isPhoto(item.image);
  const lineTotal = (item.price * item.qty).toFixed(2);

  return (
    <li className="flex gap-4 border-b border-line py-[18px] last:border-b-0">
      {/* Thumb */}
      <div className="relative h-[88px] w-[88px] flex-none">
        <ImagePlaceholder
          ratio="1"
          src={photo ? item.image : undefined}
          alt=""
          subject="Product"
          className="!rounded-xl !p-1.5 [&>span]:text-[10px]"
        />
        {!photo && item.image && (
          <span
            className="pointer-events-none absolute inset-0 grid place-items-center text-3xl"
            aria-hidden="true"
          >
            {item.image}
          </span>
        )}
      </div>

      {/* Name + stepper */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Link
          to={`/products/${item.id}`}
          className="font-semibold leading-snug text-navy-900 no-underline hover:underline"
        >
          {item.name}
        </Link>
        <p className="bc-meta text-muted">${item.price.toFixed(2)} each</p>
        <div className="mt-1.5">
          <QtyControl
            size="sm"
            value={item.qty}
            onChange={(q) => setQty(item.id, q)}
            min={1}
            max={item.stock ?? 99}
            label={`quantity of ${item.name}`}
          />
        </div>
      </div>

      {/* Money + remove */}
      <div className="flex flex-none flex-col items-end gap-2 text-right">
        <div className="font-display text-lg font-bold text-navy-900 lg:text-[22px]">
          ${lineTotal}
        </div>
        <button
          type="button"
          onClick={() => remove(item.id)}
          className="text-[13px] font-bold text-navy-500 underline decoration-2 underline-offset-4 transition-colors hover:text-navy-900"
        >
          Remove
        </button>
      </div>
    </li>
  );
}
