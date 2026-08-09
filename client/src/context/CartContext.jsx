import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getSettings } from '../services/settingsService.js';

/* ------------------------------------------------------------------ */
/*  The SHOP cart — retail products only, paid in full at checkout.    */
/*  Laundry & cleaning are booked through the /book flow instead       */
/*  (BookingContext) with the estimate → deposit → invoice model.      */
/* ------------------------------------------------------------------ */

const CartContext = createContext(null);
const STORAGE_KEY = 'bc_cart';
const DEFAULT_FEE = 9.99;

const round2 = (n) => Math.round(n * 100) / 100;

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      // Older carts mixed in laundry/cleaning lines — those live in the
      // booking flow now, so keep only product lines.
      return saved
        .map((i) => ({ kind: 'product', ...i }))
        .filter((i) => i.kind === 'product');
    } catch {
      return [];
    }
  });

  // Chosen delivery window (kept in memory; availability can change between sessions).
  const [deliverySlot, setDeliverySlot] = useState(null);

  // Per-visit delivery fee, loaded from store settings.
  const [deliveryFee, setDeliveryFee] = useState(DEFAULT_FEE);

  // GST is display-only here. Prices are stored GST-INCLUSIVE, so the cart
  // never adds tax — it just breaks out how much of the total already is
  // tax, which is what an AU customer expects to see on a receipt. The
  // server recomputes its own gstAmount when the order is written, so a
  // stale settings read can't affect what's actually charged.
  const [gst, setGst] = useState({ enabled: true, rate: 0.1 });

  useEffect(() => {
    let active = true;
    getSettings()
      .then((s) => {
        if (!active) return;
        if (typeof s.deliveryFee === 'number') setDeliveryFee(s.deliveryFee);
        setGst({
          enabled: s.gstEnabled !== false,
          rate: typeof s.gstRate === 'number' && s.gstRate > 0 ? s.gstRate : 0.1,
        });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // ---- add / update ----
  const add = (product, qty = 1) => {
    setItems((cur) => {
      const max = product.stock ?? 99;
      const found = cur.find((i) => i.id === product._id);
      if (found) {
        return cur.map((i) =>
          i.id === product._id ? { ...i, qty: Math.min(max, i.qty + qty), stock: max } : i
        );
      }
      return [
        ...cur,
        { kind: 'product', id: product._id, name: product.name, price: product.price, image: product.image, stock: max, qty: Math.min(max, qty) },
      ];
    });
  };

  const setQty = (id, qty) =>
    setItems((cur) =>
      cur.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(i.stock ?? 99, qty)) } : i))
    );

  const remove = (id) => setItems((cur) => cur.filter((i) => i.id !== id));

  const clear = () => {
    setItems([]);
    setDeliverySlot(null);
  };

  // ---- derived ----
  const count = useMemo(() => items.reduce((n, i) => n + i.qty, 0), [items]);
  const subtotal = useMemo(() => round2(items.reduce((s, i) => s + i.price * i.qty, 0)), [items]);

  const hasProducts = items.length > 0;
  // Products are delivered on the seller's schedule (customers no longer pick a
  // slot), but a flat delivery fee still applies to every shop order.
  const deliveryTotal = hasProducts ? round2(deliveryFee) : 0;
  const grandTotal = round2(subtotal + deliveryTotal);

  // GST already inside a GST-inclusive total: at 10%, total / 11.
  // Mirrors getGstAmount() in the server's settingsController.
  const gstAmount = gst.enabled ? round2(grandTotal - grandTotal / (1 + gst.rate)) : 0;

  const value = {
    items,
    add,
    setQty,
    remove,
    clear,
    count,
    subtotal,
    // slot
    deliverySlot,
    setDeliverySlot,
    // fee
    deliveryFee,
    deliveryTotal,
    grandTotal,
    hasProducts,
    // gst (display only — see the note above)
    gstEnabled: gst.enabled,
    gstRate: gst.rate,
    gstAmount,
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
