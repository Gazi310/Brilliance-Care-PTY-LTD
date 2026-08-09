import { useState } from 'react';
import Button from '../ui/Button.jsx';
import Tag from '../ui/Tag.jsx';
import Stars from './Stars.jsx';
import QtyControl from './QtyControl.jsx';
import DeliveryNotice from './DeliveryNotice.jsx';

/**
 * ProductBuyBox — everything to the right of the gallery.
 *
 * Order is deliberate and matches the wireframe: category, name,
 * rating, price, description, quantity + add, stock, then the delivery
 * rule. The delivery rule goes last because it's a caveat, and caveats
 * read as reassurance after the decision and as a warning before it.
 */
export default function ProductBuyBox({ product, onAdd, deliveryFee }) {
  const [qty, setQty] = useState(1);

  const stock = product.stock ?? 0;
  const outOfStock = !product.available || stock <= 0;
  const low = !outOfStock && stock <= 5;
  const maxQty = Math.max(1, stock || 1);

  const handleAdd = () => {
    if (outOfStock) return;
    onAdd?.(product, qty);
  };

  return (
    <div className="flex flex-col gap-[18px]">
      {product.category && <p className="bc-eyebrow">{product.category}</p>}

      <h1 className="bc-h1 text-[28px] lg:text-[38px]">{product.name}</h1>

      {product.rating > 0 && <Stars rating={product.rating} />}

      <div className="font-display text-[28px] font-bold leading-tight text-navy-900 lg:text-[34px]">
        ${Number(product.price || 0).toFixed(2)}
      </div>

      <p className="bc-body whitespace-pre-line text-muted">
        {product.description?.trim() || 'No description has been added for this product yet.'}
      </p>

      {outOfStock ? (
        <div className="rounded-card border border-line bg-sky-50 px-5 py-4">
          <p className="font-semibold text-navy-900">This one's sold out.</p>
          <p className="bc-meta mt-1 text-muted">
            We restock regularly — check back, or add it to your next laundry booking and
            we'll bring one with us.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3.5">
            <QtyControl value={qty} onChange={setQty} min={1} max={maxQty} />
            <Button
              variant="gold"
              onClick={handleAdd}
              className="min-w-[180px] flex-1"
            >
              Add to cart
            </Button>
          </div>

          <p className="flex flex-wrap items-center gap-2">
            <Tag tone={low ? 'warn' : 'ok'}>{low ? `Only ${stock} left` : 'In stock'}</Tag>
            <span className="bc-meta text-muted">
              {stock} available · dispatched next business day
            </span>
          </p>
        </>
      )}

      <DeliveryNotice fee={deliveryFee} variant="short" />
    </div>
  );
}
