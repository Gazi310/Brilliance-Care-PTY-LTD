const AU_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

const inputCls =
  'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-faint focus:border-aqua focus:outline-none focus:ring-2 focus:ring-aqua/30';
const labelCls = 'mb-1.5 block text-xs font-bold text-muted';

/**
 * Booking step 3 — where & how: AU address, contact, access notes.
 * All values live in the booking draft so they survive a login round-trip.
 */
export default function StepDetails({ details, setDetails }) {
  const postcodeBad = details.postcode.trim() !== '' && !/^\d{4}$/.test(details.postcode.trim());
  const phoneBad =
    details.phone.trim() !== '' && details.phone.replace(/\D/g, '').length < 8;

  return (
    <div className="space-y-4">
      {/* ---- Address ---- */}
      <section className="rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-5">
        <p className="text-[11px] font-extrabold uppercase tracking-wide text-faint">Service address</p>
        <div className="mt-3 space-y-3">
          <div>
            <label htmlFor="bk-line1" className={labelCls}>Street address</label>
            <input
              id="bk-line1"
              type="text"
              autoComplete="street-address"
              placeholder="e.g. 14 Marsden St"
              value={details.line1}
              onChange={(e) => setDetails({ line1: e.target.value })}
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="bk-suburb" className={labelCls}>Suburb</label>
              <input
                id="bk-suburb"
                type="text"
                autoComplete="address-level2"
                placeholder="e.g. Box Hill"
                value={details.suburb}
                onChange={(e) => setDetails({ suburb: e.target.value })}
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="bk-state" className={labelCls}>State</label>
                <select
                  id="bk-state"
                  value={details.state}
                  onChange={(e) => setDetails({ state: e.target.value })}
                  className={inputCls}
                >
                  {AU_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="bk-postcode" className={labelCls}>Postcode</label>
                <input
                  id="bk-postcode"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  autoComplete="postal-code"
                  placeholder="2150"
                  value={details.postcode}
                  onChange={(e) => setDetails({ postcode: e.target.value.replace(/[^\d]/g, '') })}
                  className={`${inputCls} ${postcodeBad ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''}`}
                />
              </div>
            </div>
          </div>
          {postcodeBad && (
            <p className="text-xs font-semibold text-red-600">Postcode should be 4 digits.</p>
          )}
        </div>
      </section>

      {/* ---- Contact ---- */}
      <section className="rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-5">
        <p className="text-[11px] font-extrabold uppercase tracking-wide text-faint">Contact</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="bk-name" className={labelCls}>Contact name</label>
            <input
              id="bk-name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              value={details.name}
              onChange={(e) => setDetails({ name: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="bk-phone" className={labelCls}>Phone</label>
            <input
              id="bk-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+61 4•• ••• •••"
              value={details.phone}
              onChange={(e) => setDetails({ phone: e.target.value })}
              className={`${inputCls} ${phoneBad ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''}`}
            />
            {phoneBad && <p className="mt-1 text-xs font-semibold text-red-600">That phone number looks too short.</p>}
          </div>
        </div>
        <p className="mt-2 text-[11px] text-faint">We'll SMS you pickup reminders and your invoice link.</p>
      </section>

      {/* ---- Notes ---- */}
      <section className="rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-5">
        <p className="text-[11px] font-extrabold uppercase tracking-wide text-faint">Notes (optional)</p>
        <div className="mt-3 space-y-3">
          <div>
            <label htmlFor="bk-access" className={labelCls}>Access notes</label>
            <input
              id="bk-access"
              type="text"
              placeholder="e.g. Leave at door, gate code 1234…"
              value={details.accessNotes}
              onChange={(e) => setDetails({ accessNotes: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="bk-special" className={labelCls}>Special instructions</label>
            <textarea
              id="bk-special"
              rows={2}
              placeholder="Anything we should know — delicates, stains, pets at home…"
              value={details.specialInstructions}
              onChange={(e) => setDetails({ specialInstructions: e.target.value })}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
