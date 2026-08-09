import { useEffect, useMemo, useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { getProducts } from '../services/productService.js';
import Band from '../components/ui/Band.jsx';
import Container from '../components/ui/Container.jsx';
import PageHero from '../components/ui/PageHero.jsx';
import Notice from '../components/ui/Notice.jsx';
import Button from '../components/ui/Button.jsx';
import CtaBand from '../components/marketing/CtaBand.jsx';
import ShopToolbar from '../components/products/ShopToolbar.jsx';
import ProductGrid from '../components/products/ProductGrid.jsx';
import DeliveryNotice from '../components/products/DeliveryNotice.jsx';
import ToastStack from '../components/products/ToastStack.jsx';

/**
 * /products — the shop.
 *
 * Restructured for v2. What changed and why:
 *
 *  · The page opens with a <PageHero> like every other inner page,
 *    instead of dropping the customer straight onto a search box.
 *  · Filtering is real now — category chips and a sort control, both
 *    driven off the catalogue that actually loaded rather than a
 *    hardcoded list.
 *  · The floating cart button is gone. There's one cart, reachable from
 *    the header on every route; a second entry point on this page only
 *    made sense back when the shop had its own drawer.
 *  · The flat-fee delivery rule sits under the grid on all three shop
 *    pages. It's the rule customers most often get wrong.
 */
export default function Products() {
  const { add, deliveryFee } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('popular');

  const [toasts, setToasts] = useState([]);

  // ---- toasts ----
  const notify = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  };
  const dismiss = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  // ---- data ----
  // `reload` is a counter rather than a callable fetch so the effect stays
  // the only thing that talks to the API. Retry bumps it; the effect does
  // the rest. Nothing sets state synchronously inside the effect body.
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await getProducts();
        if (!active) return;
        setProducts(data);
        setError('');
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [reload]);

  const retry = () => {
    setLoading(true);
    setError('');
    setReload((n) => n + 1);
  };

  // Chips come from the data, so the filter can never offer an empty category.
  const categories = useMemo(() => {
    const found = [...new Set(products.map((p) => p.category).filter(Boolean))].sort();
    return ['All', ...found];
  }, [products]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = products.filter((p) => {
      if (category !== 'All' && p.category !== category) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      );
    });

    list = [...list];
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'newest')
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    else list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    return list;
  }, [products, search, category, sort]);

  const filtered = search.trim() !== '' || category !== 'All';

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
  };

  const handleAdd = (product) => {
    add(product);
    notify(`${product.name} added to cart`);
  };

  return (
    <main>
      <PageHero
        title="The shop"
        sub="The same products our teams use. Delivered with your next booking, or on their own for a flat fee."
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Shop' }]}
      />

      <Band tone="white" question="What can I buy?">
        <Container>
          <ShopToolbar
            search={search}
            onSearch={setSearch}
            categories={categories}
            category={category}
            onCategory={setCategory}
            sort={sort}
            onSort={setSort}
          />

          {error ? (
            <Notice tone="warn" className="items-center">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={retry}>
                  Try again
                </Button>
              </div>
            </Notice>
          ) : (
            <>
              {!loading && visible.length > 0 && (
                <p className="bc-meta mb-5 text-muted">
                  Showing{' '}
                  <span className="font-bold text-navy-900">{visible.length}</span>{' '}
                  {visible.length === 1 ? 'product' : 'products'}
                  {category !== 'All' && ` in ${category}`}
                </p>
              )}

              <ProductGrid
                products={visible}
                loading={loading}
                onAdd={handleAdd}
                onClearFilters={filtered ? clearFilters : undefined}
              />

              <DeliveryNotice fee={deliveryFee} className="mt-8" />
            </>
          )}
        </Container>
      </Band>

      <CtaBand
        tone="sand"
        title="Want us to do the washing instead?"
        sub="Free pickup and delivery on every laundry booking."
      />

      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </main>
  );
}
