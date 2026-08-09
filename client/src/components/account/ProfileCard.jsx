import { useState } from 'react';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';

/**
 * One savable section of /account/profile.
 *
 * Each card saves independently — the profile endpoint patches only the
 * keys it's sent, so a customer can fix a typo in their address without
 * re-submitting their laundry preferences. Four small saves also means a
 * validation error only ever costs the card it came from.
 *
 * The save button is disabled until something changes and reports its
 * own outcome inline. No toasts: the confirmation belongs next to the
 * thing that was saved, not floating over the corner of the page.
 *
 * `onSave` should return a promise and throw on failure.
 */
export default function ProfileCard({
  title,
  subtitle,
  onSave,
  saveLabel = 'Save changes',
  dirty = false,
  children,
}) {
  const [status, setStatus] = useState('idle'); // idle | saving | saved | error
  const [error, setError] = useState('');

  const save = async () => {
    setStatus('saving');
    setError('');
    try {
      await onSave();
      setStatus('saved');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <Card className="mb-5">
      <h2 className="bc-h3">{title}</h2>
      {subtitle && <p className="bc-meta mb-5 mt-1.5 text-muted">{subtitle}</p>}

      <div className={subtitle ? '' : 'mt-5'}>{children}</div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Button
          variant="navy"
          size="sm"
          onClick={save}
          disabled={!dirty || status === 'saving'}
        >
          {status === 'saving' ? 'Saving…' : saveLabel}
        </Button>

        {status === 'saved' && !dirty && (
          <p className="bc-meta bc-fade-in font-semibold text-ok" role="status">
            Saved
          </p>
        )}
        {status === 'error' && (
          <p className="bc-meta font-semibold text-bad" role="alert">
            {error}
          </p>
        )}
      </div>
    </Card>
  );
}
