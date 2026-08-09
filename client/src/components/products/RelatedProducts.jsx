import { useEffect, useState } from 'react';
import Band from '../ui/Band.jsx';
import Container from '../ui/Container.jsx';
import SectionHead from '../ui/SectionHead.jsx';
import ProductGrid from './ProductGrid.jsx';
import { getProducts } from '../../services/productService.js';

/**
 * RelatedProducts — "Often bought together" / "Add to your order".
 *
 * Same-category first, topped up with anything else in stock so the row
 * is never half empty (a two-card row under a four-column heading looks
 * like a failed request). Renders nothing at all if there's genuinely
 * nothing to show.
 *
 * Fetches its own data rather than taking it as a prop: both callers —
 * the detail page and the cart — would otherwise have to load the full
 * catalogue for a row of four cards.
 *
 * Skeletons show on first mount only. When the query changes in place
 * (adding a cart item drops it out of the suggestions) the old row stays
 * up until the new one arrives — flashing skeletons for a row nobody is
 * looking at is worse than a beat of stale content. Pass a `key` if you
 * do want the reset; the detail page does exactly that.
 */
export default function RelatedProducts({
  excludeIds = [],
  category,
  onAdd,
  title = 'Often bought together',
  tone = 'white',
  limit = 4,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Joined so the effect doesn't re-run on every render from a new array identity.
  const excludeKey = excludeIds.join(',');

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const all = await getProducts();
        if (!active) return;

        const skip = new Set(excludeKey ? excludeKey.split(',') : []);
        const pool = all.filter(
          (p) => !skip.has(p._id) && p.available && (p.stock ?? 0) > 0
        );

        const sameCategory = category ? pool.filter((p) => p.category === category) : [];
        const rest = pool.filter((p) => !sameCategory.includes(p));

        setItems([...sameCategory, ...rest].slice(0, limit));
      } catch {
        // A failed suggestions row is not worth an error state — just hide it.
        if (active) setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [excludeKey, category, limit]);

  if (!loading && items.length === 0) return null;

  return (
    <Band tone={tone} size="sm">
      <Container>
        <SectionHead title={title} align="left" className="mb-8" />
        <ProductGrid products={items} loading={loading} onAdd={onAdd} />
      </Container>
    </Band>
  );
}
