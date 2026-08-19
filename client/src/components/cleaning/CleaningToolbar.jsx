import { SearchIcon } from '../products/icons.jsx';

/**
 * CleaningToolbar — search and the result count for /cleaning.
 *
 * Deliberately the same control as `products/ShopToolbar` minus the
 * category chips and sort, which cleaning doesn't have: a customer who
 * has used the shop should not have to learn a second search box.
 *
 * v1 put a gradient "Book a clean" button in this row. The page's gold
 * button now lives in the closing CTA, so this row is search only —
 * every card already carries its own Book.
 */
export default function CleaningToolbar({ search, onSearch, count, loading }) {
  return (
    <div className="mb-8 flex flex-col gap-4 lg:mb-10">
      <div className="relative">
        <SearchIcon
          className="pointer-events-none absolute left-[18px] top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search cleaning services…"
          aria-label="Search cleaning services"
          className="h-[50px] w-full rounded-btn border border-line bg-white pl-[50px] pr-4 text-[15px] text-ink placeholder:text-[#93a4b3]"
        />
      </div>

      {!loading && (
        <p className="bc-meta text-muted" aria-live="polite">
          Showing <span className="font-bold text-ink">{count}</span>{' '}
          {count === 1 ? 'service' : 'services'}
        </p>
      )}
    </div>
  );
}
