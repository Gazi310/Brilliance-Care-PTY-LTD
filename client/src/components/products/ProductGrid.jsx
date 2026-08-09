import ProductCard from './ProductCard.jsx';
import Button from '../ui/Button.jsx';
import { SearchIcon } from './icons.jsx';

/**
 * ProductGrid — the 4-up `.pgrid`, plus the two states it can be in
 * before it has cards to show.
 *
 * Loading renders skeleton cards at the same aspect ratio as the real
 * ones so the page doesn't jump when data lands. Empty is a real empty
 * state with a way out of it, not a shrug.
 */

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-white shadow-card">
      <div className="bc-skeleton aspect-square w-full" />
      <div className="space-y-3 p-5">
        <div className="bc-skeleton h-3 w-1/4 rounded" />
        <div className="bc-skeleton h-4 w-3/4 rounded" />
        <div className="bc-skeleton h-3 w-full rounded" />
        <div className="bc-skeleton h-8 w-1/3 rounded" />
      </div>
    </div>
  );
}

const GRID = 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

export default function ProductGrid({
  products = [],
  loading = false,
  onAdd,
  canBuy = true,
  onClearFilters,
  emptyTitle = 'No products match that',
  emptySub = 'Try a different search, or clear the filters to see everything.',
}) {
  if (loading) {
    return (
      <div className={GRID}>
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-card border border-line bg-sky-50 px-6 py-16 text-center lg:py-20">
        <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-gold-100 text-navy-500">
          <SearchIcon width={24} height={24} />
        </span>
        <h3 className="bc-h3">{emptyTitle}</h3>
        <p className="bc-body mx-auto mt-2 max-w-[420px] text-muted">{emptySub}</p>
        {onClearFilters && (
          <div className="mt-6">
            <Button variant="outline" onClick={onClearFilters}>
              Clear filters
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={GRID}>
      {products.map((p) => (
        <ProductCard key={p._id} product={p} onAdd={onAdd} canBuy={canBuy} />
      ))}
    </div>
  );
}
