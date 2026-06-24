import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'bc_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  // Persist the cart so it survives reloads.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

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
        {
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: max,
          qty: Math.min(max, qty),
        },
      ];
    });
  };

  const setQty = (id, qty) =>
    setItems((cur) =>
      cur.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(i.stock ?? 99, qty)) } : i))
    );

  const remove = (id) => setItems((cur) => cur.filter((i) => i.id !== id));
  const clear = () => setItems([]);

  const count = useMemo(() => items.reduce((n, i) => n + i.qty, 0), [items]);
  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);

  const value = { items, add, setQty, remove, clear, count, total };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
