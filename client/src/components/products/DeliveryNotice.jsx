import Notice from '../ui/Notice.jsx';
import { TruckIcon } from './icons.jsx';

/**
 * The one shop rule customers get wrong, said the same way in all
 * three places they might be about to get it wrong.
 *
 * Shop orders are *delivered*, not scheduled — there's no slot picker,
 * and a flat fee applies. Add the same products to a laundry or
 * cleaning booking and they ride along free. Products, product detail
 * and cart each show this; the migration plan calls for keeping it
 * prominent on all three.
 *
 * `fee` comes from settings via CartContext, so the number in the copy
 * can never drift from the number charged.
 */
export default function DeliveryNotice({ fee, variant = 'full', className = '' }) {
  const amount = typeof fee === 'number' ? `$${fee.toFixed(2)}` : 'a flat';

  const icon = (
    <TruckIcon className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
  );

  if (variant === 'short') {
    return (
      <Notice tone="info" icon={icon} className={className}>
        Delivered, not scheduled — there's no slot to pick.{' '}
        {typeof fee === 'number' ? `A flat ${amount} delivery fee` : 'A flat delivery fee'} is
        added at checkout, or it's free when it comes with a booking.
      </Notice>
    );
  }

  return (
    <Notice tone="info" icon={icon} className={className}>
      <strong>Shop orders are delivered, not scheduled.</strong> There's no pickup slot to
      choose —{' '}
      {typeof fee === 'number' ? `a flat ${amount} delivery fee` : 'a flat delivery fee'} is
      added at checkout. Adding products to an existing laundry or cleaning booking? They
      ride along free.
    </Notice>
  );
}
