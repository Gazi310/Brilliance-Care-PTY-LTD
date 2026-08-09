import { useState } from 'react';
import Tag from '../../ui/Tag.jsx';
import Button from '../../ui/Button.jsx';

/**
 * One enquiry in the admin inbox.
 *
 * Collapsed it shows who, what about and when; expanded it shows the
 * message and the two ways to reply. Most enquiries are triaged from the
 * summary alone, so the full text staying folded keeps a busy inbox
 * scannable.
 *
 * "Reply" is a plain mailto rather than an in-app composer — the
 * business already answers from its own mailbox, and a half-built
 * composer here would just be a worse email client.
 */

const TONES = { new: 'warn', read: 'info', closed: 'ok' };

const when = (iso) =>
  new Date(iso).toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });

export default function MessageRow({ message: m, onStatus }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const move = async (status) => {
    setBusy(true);
    try {
      await onStatus(m.id, status);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="rounded-card border border-line bg-white p-4 shadow-card sm:p-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-start justify-between gap-3 border-0 bg-transparent p-0 text-left"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="bc-h4 truncate">{m.name}</p>
            <Tag tone={TONES[m.status] ?? 'info'}>{m.status}</Tag>
          </div>
          <p className="bc-meta mt-1 text-muted">
            {m.topic} · {when(m.createdAt)}
          </p>
          {!open && <p className="bc-meta mt-1.5 line-clamp-1 text-muted">{m.message}</p>}
        </div>

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`mt-1 h-5 w-5 flex-none text-navy-500 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="mt-4 border-t border-line pt-4">
          <p className="bc-body whitespace-pre-line text-ink">{m.message}</p>

          <dl className="bc-meta mt-4 grid gap-1 text-muted">
            <div className="flex gap-2">
              <dt className="font-semibold">Email</dt>
              <dd>
                <a href={`mailto:${m.email}`} className="underline underline-offset-2">
                  {m.email}
                </a>
              </dd>
            </div>
            {m.phone && (
              <div className="flex gap-2">
                <dt className="font-semibold">Phone</dt>
                <dd>
                  <a href={`tel:${m.phone.replace(/\s+/g, '')}`} className="underline underline-offset-2">
                    {m.phone}
                  </a>
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <Button
              href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.topic}`)}`}
              variant="navy"
              size="sm"
            >
              Reply by email
            </Button>

            {m.status !== 'read' && (
              <Button variant="outline" size="sm" disabled={busy} onClick={() => move('read')}>
                Mark as read
              </Button>
            )}
            {m.status !== 'closed' && (
              <Button variant="outline" size="sm" disabled={busy} onClick={() => move('closed')}>
                Close
              </Button>
            )}
            {m.status !== 'new' && (
              <Button variant="ghost" disabled={busy} onClick={() => move('new')}>
                Reopen
              </Button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
