import { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { checkout } from '../services/orderService.js';
import Band from '../components/ui/Band.jsx';
import Container from '../components/ui/Container.jsx';
import PageHero from '../components/ui/PageHero.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import IconBadge from '../components/ui/IconBadge.jsx';
import CartLine from '../components/products/CartLine.jsx';
import CartSummary from '../components/products/CartSummary.jsx';
import DeliveryNotice from '../components/products/DeliveryNotice.jsx';
import RelatedProducts from '../components/products/RelatedProducts.jsx';
import ToastStack from '../components/products/ToastStack.jsx';
import { CartIcon, CheckIcon } from '../components/products/icons.jsx';

/**
 * /cart — the SHOP cart. Products only, paid in full.
 *
 * Restructured for v2: rows in one <Card> instead of a stack of
 * floating cards, a sticky <SummaryCard> that shares its money layout
 * with checkout and the invoice, and an "add to your order" row under
 * the fold. Laundry and cleaning still go through /book — this page has
 * deliberately never known about the estimate → deposit model.
 *
 * The order-placing logic is untouched from v1. Restructuring the
 * revenue path's *appearance* is this phase's job; changing what it
 * does is not.
 */
export default function Cart() {
  const {
    items,
    add,
    setQty,
    remove,
    clear,
    count,
    subtotal,
    deliveryTotal,
    gstAmount,
    grandTotal,
    deliveryFee,
  } = useCart();

  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(null);
  const [toasts, setToasts] = useState([]);

  const notify = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  };
  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  const empty = count === 0;

  const placeOrder = async () => {
    setSubmitting(true);
    try {
      const order = await checkout({ products: items });
      clear();
      setPlaced(order);
      window.scrollTo({ top: 0 });
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- Placed ---------------- */
  if (placed) {
    return (
      <main>
        <Band tone="sky">
          <Container width="prose">
            <Card className="text-center">
              <IconBadge
                icon={<CheckIcon width={28} height={28} />}
                tone="gold"
                className="mx-auto"
              />
              <h1 className="bc-h2">Order placed</h1>
              <p className="bc-lead mt-3 text-muted">
                Thanks — we've got it. We'll deliver at the earliest suitable time and
                message you on the way.
              </p>
              <p className="mt-6 font-display text-[34px] font-bold text-navy-900">
                ${Number(placed.total).toFixed(2)}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button to="/account/orders" variant="gold">
                  View my orders
                </Button>
                <Button to="/products" variant="outline">
                  Keep shopping
                </Button>
              </div>
            </Card>
          </Container>
        </Band>
      </main>
    );
  }

  /* ---------------- Empty ---------------- */
  if (empty) {
    return (
      <main>
        <PageHero
          title="Your cart"
          sub="Shop products are paid in full. Laundry and cleaning bookings go through the estimate flow instead."
          crumbs={[
            { label: 'Home', to: '/' },
            { label: 'Shop', to: '/products' },
            { label: 'Cart' },
          ]}
        />

        <Band tone="white">
          <Container width="prose">
            <div className="rounded-card border border-line bg-sky-50 px-6 py-16 text-center lg:py-20">
              <IconBadge
                icon={<CartIcon width={28} height={28} />}
                tone="gold"
                className="mx-auto"
              />
              <h2 className="bc-h3">Your cart is empty</h2>
              <p className="bc-body mx-auto mt-2 max-w-[420px] text-muted">
                Add something from the shop, or book a laundry or cleaning job and we'll
                bring the products with us.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button to="/products" variant="gold">
                  Browse the shop
                </Button>
                <Button to="/book" variant="outline">
                  Get an estimate
                </Button>
              </div>
            </div>
          </Container>
        </Band>

        <ToastStack toasts={toasts} onDismiss={dismiss} />
      </main>
    );
  }

  /* ---------------- Cart ---------------- */
  return (
    <main>
      <PageHero
        title="Your cart"
        sub="Shop products are paid in full. Laundry and cleaning bookings go through the estimate flow instead."
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Shop', to: '/products' },
          { label: 'Cart' },
        ]}
      />

      <Band tone="white">
        <Container>
          <div className="grid items-start gap-8 lg:grid-cols-[1.6fr_1fr] lg:gap-12">
            {/* Lines */}
            <div>
              <Card className="!p-0">
                <ul className="m-0 list-none px-6 lg:px-8">
                  {items.map((i) => (
                    <CartLine key={i.id} item={i} setQty={setQty} remove={remove} />
                  ))}
                </ul>
              </Card>

              <DeliveryNotice fee={deliveryFee} className="mt-6" />

              <div className="mt-6">
                <Button to="/products" variant="ghost">
                  ← Keep shopping
                </Button>
              </div>
            </div>

            {/* Money */}
            <CartSummary
              count={count}
              subtotal={subtotal}
              deliveryTotal={deliveryTotal}
              gstAmount={gstAmount}
              grandTotal={grandTotal}
              submitting={submitting}
              onCheckout={placeOrder}
            />
          </div>
        </Container>
      </Band>

      <RelatedProducts
        tone="sand"
        title="Add to your order"
        excludeIds={items.map((i) => i.id)}
        onAdd={(p) => {
          add(p);
          notify(`${p.name} added to cart`);
        }}
      />

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </main>
  );
}
