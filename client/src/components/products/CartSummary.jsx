import SummaryCard from '../ui/SummaryCard.jsx';
import LineItems from '../ui/LineItems.jsx';
import Button from '../ui/Button.jsx';

/**
 * CartSummary — the sticky money panel beside the cart.
 *
 * Uses the shared <LineItems>, which is the same component the booking
 * review, checkout and invoice screens use. That's deliberate: the
 * deposit model is the thing customers most often misread, and the
 * fastest way to make it misread worse is for the shop's totals to be
 * laid out differently from the booking's.
 *
 * The wireframe also had a promo-code field. There's no promo code in
 * the data model, so it isn't here — an input that always answers
 * "invalid code" is worse than no input.
 */
export default function CartSummary({
  count,
  subtotal,
  deliveryTotal,
  gstAmount,
  grandTotal,
  submitting,
  onCheckout,
}) {
  const money = (n) => `$${Number(n || 0).toFixed(2)}`;

  const lines = [
    { label: `Subtotal (${count} ${count === 1 ? 'item' : 'items'})`, value: money(subtotal) },
    { label: 'Delivery', value: money(deliveryTotal) },
    ...(gstAmount > 0 ? [{ label: 'GST (included)', value: money(gstAmount) }] : []),
    { label: 'Total', value: money(grandTotal), emphasis: 'total' },
  ];

  return (
    <SummaryCard title="Order summary">
      <LineItems lines={lines} />

      <Button
        variant="gold"
        block
        onClick={onCheckout}
        disabled={submitting}
        className="mt-5"
      >
        {submitting ? 'Placing your order…' : `Checkout · ${money(grandTotal)}`}
      </Button>

      <p className="bc-meta mt-3.5 text-muted">
        Shop orders are paid in full at checkout — no deposit split.
      </p>
    </SummaryCard>
  );
}
