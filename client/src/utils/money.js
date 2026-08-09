/**
 * Money formatting. One place, because a price that renders as "$24.9"
 * on one page and "$24.99" on another reads as a bug even when it isn't.
 *
 * All prices in this app are AUD and GST-inclusive.
 */

/** `24.99` → `"$24.99"` */
export const money = (n) => `$${Number(n || 0).toFixed(2)}`;

/**
 * Drops a trailing `.00`, for public "from" prices where the cents are
 * noise: `89` → `"$89"`, `24.99` → `"$24.99"`.
 */
export const priceFrom = (n) => {
  const v = Number(n || 0);
  return Number.isInteger(v) ? `$${v}` : money(v);
};

/** `25` → `"+ $25.00"`, used for the per-room cleaning columns. */
export const plusMoney = (n) => `+ ${money(n)}`;
