import LaundryServiceCard from '../laundry/LaundryServiceCard.jsx';

/**
 * Booking step 1 (laundry) — pick services & quantities.
 * Reuses the catalogue's controlled stepper rows; state lives in the
 * booking draft (BookingContext), so it survives refresh and login.
 */
export default function StepBuildLaundry({ services, laundryQty, setLaundryQty }) {
  if (!services.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-white py-16 text-center shadow-soft">
        <span className="text-5xl">🧺</span>
        <p className="mt-4 text-base font-semibold text-muted">No laundry services yet</p>
        <p className="text-sm text-faint">Please check back soon.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-white px-4 shadow-soft sm:px-5">
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
