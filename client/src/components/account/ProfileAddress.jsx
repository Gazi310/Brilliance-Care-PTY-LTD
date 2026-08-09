import { useState } from 'react';
import Field from '../ui/Field.jsx';
import ProfileCard from './ProfileCard.jsx';
import { useAuth } from '../../hooks/useAuth';

/**
 * The default pickup and delivery address.
 *
 * This is the card that earns the account. Everything else here is
 * housekeeping; this is what turns the booking flow from a form into two
 * taps next time.
 *
 * Access notes matter more than they look: "lockbox code 4417, friendly
 * dog in the yard" is the difference between a completed pickup and a
 * driver standing at a gate. Worth the extra field.
 */
export default function ProfileAddress() {
  const { user, updateProfile } = useAuth();
  const saved = user?.address || {};

  const [street, setStreet] = useState(saved.street || '');
  const [suburb, setSuburb] = useState(saved.suburb || '');
  const [postcode, setPostcode] = useState(saved.postcode || '');
  const [notes, setNotes] = useState(saved.notes || '');

  const dirty =
    street !== (saved.street || '') ||
    suburb !== (saved.suburb || '') ||
    postcode !== (saved.postcode || '') ||
    notes !== (saved.notes || '');

  return (
    <ProfileCard
      title="Service address"
      subtitle="Where we pick up from and deliver to by default."
      saveLabel="Save address"
      onSave={() => updateProfile({ address: { street, suburb, postcode, notes } })}
      dirty={dirty}
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <Field
          id="p-street"
          label="Street address"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          placeholder="12 Station Street"
          autoComplete="street-address"
          wrapperClassName="lg:col-span-2"
        />
        <Field
          id="p-suburb"
          label="Suburb"
          value={suburb}
          onChange={(e) => setSuburb(e.target.value)}
          placeholder="Box Hill"
          autoComplete="address-level2"
        />
        <Field
          id="p-postcode"
          label="Postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="3128"
          inputMode="numeric"
          autoComplete="postal-code"
        />
        <Field
          id="p-notes"
          as="textarea"
          label="Access notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Lockbox on the gate, code 4417. Small dog in the yard — friendly."
          hint="Anything the driver or cleaner needs to know to get in."
          wrapperClassName="lg:col-span-2"
        />
      </div>
    </ProfileCard>
  );
}
