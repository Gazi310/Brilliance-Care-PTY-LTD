import Chip from '../ui/Chip.jsx';
import { SearchIcon } from './icons.jsx';

/**
 * ShopToolbar — search, category chips and sort, on one wrapping row.
 *
 * Categories are derived from the products that actually loaded rather
 * than hardcoded, so adding a category in the admin panel makes a chip
 * appear here with no code change. That also means the filter can never
 * offer a category with nothing behind it.
 */

const SORTS = [
  { value: 'popular', label: 'Sort: Most popular' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'newest', label: 'Newest' },
];

export default function ShopToolbar({
  search,
  onSearch,
  categories = [],
  category,
  onCategory,
  sort,
  onSort,
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 lg:mb-10">
      {/* Search + sort */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon
            className="pointer-events-none absolute left-[18px] top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search products…"
            aria-label="Search products"
            className="h-[50px] w-full rounded-btn border border-line bg-white pl-[50px] pr-4 text-[15px] text-ink placeholder:text-[#93a4b3]"
          />
        </div>

        <select
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          aria-label="Sort products"
          className="h-[50px] rounded-btn border border-line bg-white px-4 text-[15px] font-medium text-ink sm:w-auto"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Category chips */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2.5">
          {categories.map((c) => (
            <Chip key={c} active={category === c} onClick={() => onCategory(c)}>
              {c}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}
