import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { getLaundryServices } from '../services/laundryService.js';
import LaundryCatalogue from '../components/laundry/LaundryCatalogue.jsx';
import CartDrawer from '../components/products/CartDrawer.jsx';
import ToastStack from '../components/products/ToastStack.jsx';

/**
 * /laundry/book — the booking catalogue / estimate builder. Reached from the
 * /laundry overview. Loads services, lets the customer pick quantities to build
 * a live estimate, then feeds the chosen items into the cart (pickup & return
 * windows are chosen there).
 */
export default function LaundryBook() {
  const { addLaundry } = useCart();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [cartOpen, setCartOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const notify = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  };
  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  const load = async () => {
    setLoading(true);
    try {
      const data = await getLaundryServices();
      setServices(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getLaundryServices();
        if (active) {
          setServices(data);
          setError('');
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleCheckout = (selections) => {
    selections.forEach(({ service, qty }) => addLaundry(service, qty));
    const n = selections.reduce((a, x) => a + x.qty, 0);
    setCartOpen(true);
    notify(`Added ${n} ${n === 1 ? 'item' : 'items'} — choose pickup & return in your cart`, 'success');
  };

  return (
    <main className="min-h-screen bg-surface pb-24 lg:pb-16">
      <div className="mx-auto max-w-2xl px-4 py-5 sm:px-6 sm:py-8">
        <Link
          to="/laundry"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-navy"
        >
          <span className="text-base leading-none">‹</span>
          All laundry services
        </Link>

        <LaundryCatalogue
          services={services}
          loading={loading}
          error={error}
          onRetry={load}
          onCheckout={handleCheckout}
        />
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} notify={notify} />
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </main>
  );
}
