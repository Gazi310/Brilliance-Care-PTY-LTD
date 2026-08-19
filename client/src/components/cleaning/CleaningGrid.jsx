import CleaningServiceCard from './CleaningServiceCard.jsx';
import Button from '../ui/Button.jsx';
import { BubblesIcon } from '../booking/icons.jsx';

/**
 * CleaningGrid — the cleaning card grid and the two states it can be in
 * before it has cards to show.
 *
 * Same shape as `products/ProductGrid`, on purpose: the two catalogues
 * should behave identically. Skeletons match the real card's height so
 * the page doesn't jump when the services land, and the empty state
 * offers a way out rather than a shrug.
 */

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-white shadow-card">
      <div className="bc-skeleton h-40 w-full" />
      <div className="space-y-3 p-5">
        <div className="bc-skeleton h-4 w-3/4 rounded" />
        <div className="bc-skeleton h-3 w-full rounded" />
        <div className="bc-skeleton h-8 w-1/3 rounded" />
      </div>
    </div>
  );
}

const GRID = 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

export default function CleaningGrid({
  services = [],
  loading = false,
  mounted = true,
  onAdd,
  canBook = true,
  onClearSearch,
  emptyTitle = 'No cleans match that',
  emptySub = 'Try a different search, or clear it to see everything we clean.',
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

  if (services.length === 0) {
    return (
      <div className="rounded-card border border-line bg-sky-50 px-6 py-16 text-center lg:py-20">
        <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-gold-100 text-navy-500">
          <BubblesIcon width={24} height={24} />
        </span>
        <h3 className="bc-h3">{emptyTitle}</h3>
        <p className="bc-body mx-auto mt-2 max-w-[420px] text-muted">{emptySub}</p>
        {onClearSearch && (
          <div className="mt-6">
            <Button variant="outline" onClick={onClearSearch}>
              Clear search
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={GRID}>
      {services.map((s, i) => (
        <CleaningServiceCard
          key={s._id}
          service={s}
          index={i}
          mounted={mounted}
          onAdd={onAdd}
          canBook={canBook}
        />
      ))}
    </div>
  );
}
