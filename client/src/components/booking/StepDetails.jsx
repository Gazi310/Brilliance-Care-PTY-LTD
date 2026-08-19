import { Card, Field } from '../ui';

const AU_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

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
      <Card as="section">
        <p className="bc-eyebrow">Service address</p>
        <div className="mt-4 space-y-4">
          <Field
            id="bk-line1"
            label="Street address"
            type="text"
            autoComplete="street-address"
            placeholder="e.g. 14 Marsden St"
            value={details.line1}
            onChange={(e) => setDetails({ line1: e.target.value })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="bk-suburb"
              label="Suburb"
              type="text"
              autoComplete="address-level2"
              placeholder="e.g. Box Hill"
              value={details.suburb}
              onChange={(e) => setDetails({ suburb: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Field
                id="bk-state"
                label="State"
                as="select"
                value={details.state}
                onChange={(e) => setDetails({ state: e.target.value })}
              >
                {AU_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Field>
              <Field
                id="bk-postcode"
                label="Postcode"
                type="text"
                inputMode="numeric"
                maxLength={4}
                autoComplete="postal-code"
                placeholder="3128"
                value={details.postcode}
                onChange={(e) => setDetails({ postcode: e.target.value.replace(/[^\d]/g, '') })}
                error={postcodeBad ? 'Postcode should be 4 digits.' : ''}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* ---- Contact ---- */}
      <Card as="section">
        <p className="bc-eyebrow">Contact</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            id="bk-name"
            label="Contact name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={details.name}
            onChange={(e) => setDetails({ name: e.target.value })}
          />
          <Field
            id="bk-phone"
            label="Phone"
            type="tel"
            autoComplete="tel"
            placeholder="+61 4•• ••• •••"
            value={details.phone}
            onChange={(e) => setDetails({ phone: e.target.value })}
            error={phoneBad ? 'That phone number looks too short.' : ''}
          />
        </div>
        <p className="mt-3 text-[13px] text-muted">
          We'll SMS you pickup reminders and your invoice link.
        </p>
      </Card>

      {/* ---- Notes ---- */}
      <Card as="section">
        <p className="bc-eyebrow">Notes (optional)</p>
        <div className="mt-4 space-y-4">
          <Field
            id="bk-access"
            label="Access notes"
            type="text"
            placeholder="e.g. Leave at door, gate code 1234…"
            value={details.accessNotes}
            onChange={(e) => setDetails({ accessNotes: e.target.value })}
          />
          <Field
            id="bk-special"
            label="Special instructions"
            as="textarea"
            rows={2}
            placeholder="Anything we should know — delicates, stains, pets at home…"
            value={details.specialInstructions}
            onChange={(e) => setDetails({ specialInstructions: e.target.value })}
          />
        </div>
      </Card>
    </div>
  );
}
