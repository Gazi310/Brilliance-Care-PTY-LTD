import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getSettings } from '../services/settingsService.js';

const CartContext = createContext(null);
const STORAGE_KEY = 'bc_cart';
const DEFAULT_FEE = 9.99;

const round2 = (n) => Math.round(n * 100) / 100;
const slotKey = (s) => (s ? `${s.date}|${s.window}` : null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      // Older carts had no `kind`; treat them as products.
      return saved.map((i) => ({ kind: 'product', ...i }));
    } catch {
      return [];
    }
  });

  // Chosen visit windows (kept in memory; availability can change between sessions).
  const [deliverySlot, setDeliverySlot] = useState(null); // products
  const [laundryPickupSlot, setLaundryPickupSlot] = useState(null);
  const [laundryReturnSlot, setLaundryReturnSlot] = useState(null);
  const [cleaningSlot, setCleaningSlot] = useState(null); // cleaning appointment

  // Per-visit delivery fee, loaded from store settings.
  const [deliveryFee, setDeliveryFee] = useState(DEFAULT_FEE);
  useEffect(() => {
    let active = true;
    getSettings()
      .then((s) => active && typeof s.deliveryFee === 'number' && setDeliveryFee(s.deliveryFee))
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

  const addLaundry = (service, qty = 1) => {
    setItems((cur) => {
      const found = cur.find((i) => i.id === service._id);
      if (found) {
        return cur.map((i) => (i.id === service._id ? { ...i, qty: i.qty + qty } : i));
      }
      return [
        ...cur,
        { kind: 'laundry', id: service._id, name: service.name, price: service.price, image: service.image, unit: service.unit, qty },
      ];
    });
  };

  const addCleaning = (service, qty = 1) => {
    setItems((cur) => {
      const found = cur.find((i) => i.id === service._id);
      if (found) {
        return cur.map((i) => (i.id === service._id ? { ...i, qty: i.qty + qty } : i));
      }
      return [
        ...cur,
        { kind: 'cleaning', id: service._id, name: service.name, price: service.price, image: service.image, unit: service.unit, qty },
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
    setLaundryPickupSlot(null);
    setLaundryReturnSlot(null);
    setCleaningSlot(null);
  };

  // ---- derived ----
  const productItems = useMemo(() => items.filter((i) => i.kind === 'product'), [items]);
  const laundryItems = useMemo(() => items.filter((i) => i.kind === 'laundry'), [items]);
  const cleaningItems = useMemo(() => items.filter((i) => i.kind === 'cleaning'), [items]);
  const count = useMemo(() => items.reduce((n, i) => n + i.qty, 0), [items]);
  const subtotal = useMemo(() => round2(items.reduce((s, i) => s + i.price * i.qty, 0)), [items]);

  const hasProducts = productItems.length > 0;
  const hasLaundry = laundryItems.length > 0;
  const hasCleaning = cleaningItems.length > 0;

  // The home visits actually required by the current cart + chosen slots,
  // de-duplicated by date+window so a shared slot is only one visit.
  const visits = useMemo(() => {
    const entries = [];
    if (hasProducts && deliverySlot) entries.push({ slot: deliverySlot, role: 'delivery' });
    if (hasLaundry && laundryPickupSlot) entries.push({ slot: laundryPickupSlot, role: 'pickup' });
    if (hasLaundry && laundryReturnSlot) entries.push({ slot: laundryReturnSlot, role: 'return' });
    if (hasCleaning && cleaningSlot) entries.push({ slot: cleaningSlot, role: 'cleaning' });
    const byKey = new Map();
    for (const { slot, role } of entries) {
      const key = slotKey(slot);
      if (!byKey.has(key)) byKey.set(key, { ...slot, roles: [role] });
      else byKey.get(key).roles.push(role);
    }
    return [...byKey.values()];
  }, [hasProducts, hasLaundry, hasCleaning, deliverySlot, laundryPickupSlot, laundryReturnSlot, cleaningSlot]);

  const visitCount = visits.length;
  const deliveryTotal = useMemo(() => round2(deliveryFee * visitCount), [deliveryFee, visitCount]);
  const grandTotal = round2(subtotal + deliveryTotal);

  // Are all the slots the cart needs actually chosen?
  const slotsReady =
    (!hasProducts || !!deliverySlot) &&
    (!hasLaundry || (!!laundryPickupSlot && !!laundryReturnSlot)) &&
    (!hasCleaning || !!cleaningSlot);

  const value = {
    items,
    productItems,
    laundryItems,
    cleaningItems,
    add,
    addLaundry,
    addCleaning,
    setQty,
    remove,
    clear,
    count,
    subtotal,
    // slots
    deliverySlot,
    setDeliverySlot,
    laundryPickupSlot,
    setLaundryPickupSlot,
    laundryReturnSlot,
    setLaundryReturnSlot,
    cleaningSlot,
    setCleaningSlot,
    // fee
    deliveryFee,
    visits,
    visitCount,
    deliveryTotal,
    grandTotal,
    slotsReady,
    hasProducts,
    hasLaundry,
    hasCleaning,
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
