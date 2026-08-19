import { BasketIcon, ReceiptIcon } from '../booking/icons.jsx';
import { CartIcon } from '../products/icons.jsx';
import { Button, IconBadge } from '../ui';

/**
 * The empty state for each tab of /account/orders.
 *
 * An empty list is a dead end unless it says what to do next, so every
 * variant except "past" carries a way out. "Past" doesn't, because an
 * empty past list just means they're new — there's nothing to fix.
 */
const VARIANTS = {
  active: {
    icon: BasketIcon,
    title: 'Nothing on the go',
    sub: 'Book a laundry pickup or a clean and you can follow it from here — pickup, weigh, return.',
    cta: { label: 'Get my estimate', to: '/book', variant: 'gold' },
  },
  past: {
    icon: ReceiptIcon,
    title: 'No completed orders yet',
    sub: 'Once a job is finished and settled it moves here, with its invoice attached.',
  },
  shop: {
    icon: CartIcon,
    title: 'No shop orders yet',
    sub: 'Detergents, wipes and starter packs — delivered on their own or alongside a pickup.',
    cta: { label: 'Browse the shop', to: '/products', variant: 'outline' },
  },
};

export default function OrdersEmpty({ tab = 'active' }) {
  const v = VARIANTS[tab] ?? VARIANTS.active;

  return (
    <div className="rounded-card border border-line bg-white px-6 py-14 text-center shadow-card">
      <div className="flex justify-center">
        <IconBadge icon={v.icon} tone="sky" />
      </div>
      <h2 className="bc-h3">{v.title}</h2>
      <p className="bc-body mx-auto mt-2.5 max-w-[420px] text-muted">{v.sub}</p>
      {v.cta && (
        <div className="mt-7">
          <Button to={v.cta.to} variant={v.cta.variant}>
            {v.cta.label}
          </Button>
        </div>
      )}
    </div>
  );
}
