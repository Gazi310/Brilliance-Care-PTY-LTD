import { useState } from 'react';
import Card from '../ui/Card.jsx';
import { useAuth } from '../../hooks/useAuth';

/**
 * What we're allowed to send.
 *
 * These save on toggle rather than behind a button — a switch that
 * doesn't take effect until you find a Save button reads as broken, and
 * unlike the other cards there's nothing here to validate.
 *
 * The three transactional messages default on and the marketing one
 * defaults off. That's opt-in, which is both the right default and what
 * the Spam Act expects of an Australian business.
 *
 * A failed save flips the switch back, so what's on screen is always
 * what the server actually has.
 */

const OPTIONS = [
  { key: 'driverSms', label: 'Text me when the driver is on the way' },
  { key: 'invoiceEmail', label: 'Email me the final invoice' },
  { key: 'reminder', label: 'Remind me the night before a booking' },
  { key: 'offers', label: 'Occasional offers and seasonal reminders' },
];

export default function ProfileNotifications() {
  const { user, updateProfile } = useAuth();
  const saved = user?.notifications || {};
  const [pending, setPending] = useState('');
  const [error, setError] = useState('');

  const toggle = async (key, next) => {
    setPending(key);
    setError('');
    try {
      await updateProfile({ notifications: { [key]: next } });
    } catch (err) {
      setError(err.message);
    } finally {
      setPending('');
    }
  };

  return (
    <Card>
      <h2 className="bc-h3 mb-5">Notifications</h2>

      <div className="flex flex-col gap-3.5">
        {OPTIONS.map(({ key, label }) => (
          <label key={key} className="flex cursor-pointer items-center gap-3 text-base text-ink">
            <input
              type="checkbox"
              checked={saved[key] === true}
              disabled={pending === key}
              onChange={(e) => toggle(key, e.target.checked)}
              className="h-[18px] w-[18px] flex-none accent-navy-900"
            />
            {label}
          </label>
        ))}
      </div>

      {error && (
        <p className="bc-meta mt-4 font-semibold text-bad" role="alert">
          {error}
        </p>
      )}
    </Card>
  );
}
