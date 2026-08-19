import LaundryServiceCard from '../laundry/LaundryServiceCard.jsx';
import { IconBadge } from '../ui';
import { BasketIcon } from './icons.jsx';

/**
 * Booking step 1 (laundry) — pick services & quantities.
 * Reuses the catalogue's controlled stepper rows; state lives in the
 * booking draft (BookingContext), so it survives refresh and login.
 */
export default function StepBuildLaundry({ services, laundryQty, setLaundryQty }) {
  if (!services.length) {
    return (
      <div className="bc-card-light flex flex-col items-center justify-center rounded-card border border-line bg-white py-16 text-center shadow-card">
        <IconBadge icon={BasketIcon} tone="sky" />
        <p className="bc-h4">No laundry services yet</p>
        <p className="mt-1 text-sm text-muted">Please check back soon.</p>
      </div>
    );
  }

  return (
    <div className="bc-card-light rounded-card border border-line bg-white px-4 shadow-card sm:px-5">
      {services.map((s, i) => (
        <LaundryServiceCard
          key={s._id}
          service={s}
          qty={laundryQty[s._id] || 0}
          onQty={(next) => setLaundryQty(s._id, next)}
          index={i}
          mounted
        />
      ))}
    </div>
  );
}
