import { useCatalogue, byName } from './useCatalogue';
import { useSettings } from './useSettings';

/**
 * The worked example: one real order, priced end to end.
 *
 * A three-bedroom, two-bathroom standard clean plus two loads of washing,
 * where the laundry comes in under weight. It's the single strongest
 * sales asset in the set, because it's the only place the deposit model
 * is shown *paying out* rather than explained.
 *
 * Computed rather than typed in, for two reasons. It has to stay
 * internally consistent — a worked example whose arithmetic doesn't add
 * up does more damage than no example at all — and it has to agree with
 * the live prices published further up the same page.
 *
 * Used by /pricing (as a line-item card) and /how-it-works (as a
 * timeline), so both tell the same story with the same numbers.
 */

const round2 = (n) => Math.round(n * 100) / 100;

// Used until the catalogue loads, and if a service has been renamed.
const FALLBACK = {
  clean: { price: 89, perBedroom: 25, perBathroom: 20, name: 'Standard Home Clean' },
  wash: { price: 24.99, name: 'Wash & Fold' },
};

const BEDROOMS = 3;
const BATHROOMS = 2;
const LOADS_BOOKED = 2;
const LOADS_ACTUAL = 1.6; // what the scales said

export function useWorkedExample() {
  const { laundry, cleaning } = useCatalogue();
  const settings = useSettings();

  const clean = byName(cleaning, FALLBACK.clean.name) || FALLBACK.clean;
  const wash = byName(laundry, FALLBACK.wash.name) || FALLBACK.wash;

  const cleanTotal = round2(
    Number(clean.price || 0) +
      Number(clean.perBedroom || 0) * (BEDROOMS - 1) +
      Number(clean.perBathroom || 0) * (BATHROOMS - 1)
  );
  const laundryEstimate = round2(Number(wash.price || 0) * LOADS_BOOKED);
  const estimate = round2(cleanTotal + laundryEstimate);

  const depositPercent = settings?.depositPercent ?? 50;
  const deposit = round2((estimate * depositPercent) / 100);

  const laundryActual = round2(Number(wash.price || 0) * LOADS_ACTUAL);
  const adjustment = round2(laundryActual - laundryEstimate); // negative — the point
  const actualTotal = round2(estimate + adjustment);
  const balance = round2(actualTotal - deposit);

  return {
    cleanName: clean.name,
    washName: wash.name,
    bedrooms: BEDROOMS,
    bathrooms: BATHROOMS,
    loadsBooked: LOADS_BOOKED,
    loadsActual: LOADS_ACTUAL,
    cleanTotal,
    laundryEstimate,
    estimate,
    depositPercent,
    deposit,
    adjustment,
    actualTotal,
    balance,
  };
}

export default useWorkedExample;
