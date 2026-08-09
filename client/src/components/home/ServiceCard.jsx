import { Link } from 'react-router-dom';
import ImagePlaceholder from '../ui/ImagePlaceholder.jsx';
import { ArrowRight } from './icons';

/**
 * One service on the homepage — laundry, cleaning, or the shop.
 *
 * Replaces v1's `TabCard`. That was a small gradient tile with an emoji
 * and two lines of text, four of them above the fold; this is a proper
 * card with a photograph, the pitch, and a "from" price. Same three
 * destinations, very different job: the tiles were navigation, these
 * have to sell.
 *
 * The whole card is the link. The gold disc is decorative — making it
 * a second anchor to the same place gives screen readers a duplicate
 * and gives everyone else a smaller tap target.
 */
export default function ServiceCard({ to, photo, name, body, price, priceNote }) {
  return (
    <Link
      to={to}
      className="group flex h-full flex-col overflow-hidden rounded-card bg-white text-inherit no-underline shadow-card transition-transform duration-200 hover:-translate-y-1"
    >
      <ImagePlaceholder flush subject={photo} />

      <div className="flex flex-1 flex-col gap-3 p-6 lg:p-7">
        <h3 className="bc-h3">{name}</h3>
        <p className="bc-body text-muted">{body}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-[18px]">
          <div className="font-display text-[22px] font-bold leading-[1.2] text-navy-900">
            {price}
            <small className="mt-[3px] block font-body text-[13px] font-medium leading-[1.4] text-muted">
              {priceNote}
            </small>
          </div>

          <span
            aria-hidden="true"
            className="grid h-12 w-12 flex-none place-items-center rounded-full bg-gold-500 text-navy-900 transition-transform duration-200 group-hover:translate-x-0.5"
          >
            <ArrowRight width={20} height={20} strokeWidth={2.2} />
          </span>
        </div>
      </div>
    </Link>
  );
}
