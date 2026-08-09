import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button.jsx';
import Tag from '../ui/Tag.jsx';
import ImagePlaceholder from '../ui/ImagePlaceholder.jsx';
import { CheckIcon } from './icons.jsx';

/**
 * ProductCard — the kit's `.pcard`.
 *
 * v1 gave every category its own gradient (violet, fuchsia, lime…),
 * which is how a five-category shop ended up with five colour schemes
 * none of which were the brand's. v2 has one card: white, hairline
 * border, square photo flush to the top edge, category as quiet meta
 * text, price and a small gold Add button on the footer rule.
 *
 * The whole card is a link. The Add button sits inside it, so it stops
 * propagation — v1 solved this with a div + role="button" + a keydown
 * handler, which is a real anchor's job.
 */

// A product "image" is either an uploaded photo / URL, or a plain emoji.
const isPhoto = (img) =>
  typeof img === 'string' &&
  (/^https?:\/\//.test(img) ||
    img.startsWith('data:') ||
    img.startsWith('/') ||
    /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(img));

export default function ProductCard({ product, onAdd, canBuy = true, className = '' }) {
  const [added, setAdded] = useState(false);

  const stock = product.stock ?? 0;
  const outOfStock = !product.available || stock <= 0;
  const low = !outOfStock && stock <= 5;
  const price = Number(product.price || 0).toFixed(2);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    onAdd?.(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-card border border-line bg-white shadow-card transition-shadow duration-200 hover:shadow-lift ${className}`}
    >
      {/* Photo — square, flush to the card edges, dashed until a real one exists. */}
      <div className="relative">
        <ImagePlaceholder
          flush
          ratio="1"
          src={isPhoto(product.image) ? product.image : undefined}
          alt={product.name}
          subject={`${product.name} on white · 1:1`}
        />

        {/* Emoji products get their glyph centred over the placeholder rather
            than a "photo missing" box — it's still the seller's chosen art. */}
        {!isPhoto(product.image) && product.image && (
          <span
            className="pointer-events-none absolute inset-0 grid place-items-center text-6xl"
            aria-hidden="true"
          >
            {product.image}
          </span>
        )}

        {(outOfStock || low) && (
          <Tag tone={outOfStock ? 'bad' : 'warn'} className="absolute right-3 top-3 shadow-card">
            {outOfStock ? 'Out of stock' : `Only ${stock} left`}
          </Tag>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        {product.category && <p className="bc-meta text-muted">{product.category}</p>}

        <h3 className="bc-h4">
          <Link
            to={`/products/${product._id}`}
            className="no-underline after:absolute after:inset-0 after:content-['']"
          >
            {product.name}
          </Link>
        </h3>

        {product.description && (
          <p className="line-clamp-2 text-[15px] leading-[1.5] text-muted">
            {product.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2.5 pt-3.5">
          <div className="font-display text-[22px] font-bold leading-tight text-navy-900">
            ${price}
          </div>

          {canBuy && (
            <Button
              variant="gold"
              size="sm"
              onClick={handleAdd}
              disabled={outOfStock}
              // Sits above the card-wide link overlay so it stays clickable.
              className="relative z-10"
              aria-label={`Add ${product.name} to cart`}
            >
              {added ? (
                <>
                  <CheckIcon width={16} height={16} /> Added
                </>
              ) : outOfStock ? (
                'Sold out'
              ) : (
                'Add'
              )}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
