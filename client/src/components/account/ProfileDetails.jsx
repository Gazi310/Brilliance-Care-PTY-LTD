import { useState } from 'react';
import Field from '../ui/Field.jsx';
import ProfileCard from './ProfileCard.jsx';
import { useAuth } from '../../hooks/useAuth';

/**
 * Name and mobile.
 *
 * Email is shown but not editable: it's the login identity, so changing
 * it is an account-security operation (re-authenticate, verify the new
 * address) rather than a profile edit. Showing it read-only answers
 * "which email is this account under?" without pretending it's a field.
 *
 * The mobile number is the one worth having — it's what the driver texts
 * on the way, and guests who booked without an account can't be reached
 * any other way.
 */
export default function ProfileDetails() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const dirty = name !== (user?.name || '') || phone !== (user?.phone || '');

  return (
    <ProfileCard
      title="Personal details"
      onSave={() => updateProfile({ name, phone })}
      dirty={dirty}
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <Field
          id="p-name"
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          wrapperClassName="lg:col-span-2"
        />
        <Field
          id="p-email"
          label="Email"
          value={user?.email || ''}
          readOnly
          disabled
          hint="Your email is your sign-in — contact us to change it."
          // `disabled:` variants rather than plain `bg-sky-50`: Field's base
          // already sets `bg-white`, and two utilities for the same property
          // resolve by stylesheet order, not by which is written last.
          className="disabled:cursor-not-allowed disabled:bg-sky-50 disabled:text-muted"
        />
        <Field
          id="p-phone"
          label="Mobile"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0412 345 678"
          autoComplete="tel"
          hint="We text this when the driver is on the way."
        />
      </div>
    </ProfileCard>
  );
}
