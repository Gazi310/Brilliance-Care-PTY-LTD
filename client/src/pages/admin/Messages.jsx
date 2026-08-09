import { useEffect, useState } from 'react';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader.jsx';
import MessageRow from '../../components/admin/messages/MessageRow.jsx';
import Chip from '../../components/ui/Chip.jsx';
import { adminListMessages, adminSetMessageStatus } from '../../services/contactService.js';

/**
 * /admin/messages — the contact-form inbox.
 *
 * New in Phase 3 alongside the public /contact page. Without it every
 * enquiry would sit in the database unread: the notifier is still a mock
 * that logs to the server console, so this list is the only place a
 * message is actually seen.
 *
 * Defaults to the `new` filter, because the only question worth asking
 * on arrival is "what haven't we answered yet".
 */

const FILTERS = [
  { key: 'new', label: 'New' },
  { key: 'read', label: 'Read' },
  { key: 'closed', label: 'Closed' },
  { key: '', label: 'All' },
];

/**
 * One state object rather than four, and `loadedFor` instead of a
 * `loading` flag: the effect then never calls setState synchronously in
 * its own body, which is what `react-hooks/set-state-in-effect` is
 * warning about. Loading is derived — if what we've loaded isn't for the
 * filter being shown, we're loading.
 */
const EMPTY = { messages: [], newCount: 0, error: '', loadedFor: null };

export default function AdminMessages() {
  const [filter, setFilter] = useState('new');
  const [attempt, setAttempt] = useState(0); // bump to retry
  const [data, setData] = useState(EMPTY);

  const loading = data.loadedFor !== filter;

  useEffect(() => {
    let on = true;
    adminListMessages(filter)
      .then(
        (d) =>
          on &&
          setData({
            messages: d.messages,
            newCount: d.newCount,
            error: '',
            loadedFor: filter,
          })
      )
      .catch(
        (err) =>
          on && setData({ ...EMPTY, error: err.message, loadedFor: filter })
      );
    return () => {
      on = false;
    };
  }, [filter, attempt]);

  const setStatus = async (id, status) => {
    const { message } = await adminSetMessageStatus(id, status);

    setData((d) => {
      const was = d.messages.find((m) => m.id === id)?.status === 'new';
      const is = message.status === 'new';
      return {
        ...d,
        // Drop it from the list if it no longer matches the active filter,
        // otherwise swap it in place — either way, no full refetch.
        messages:
          filter && message.status !== filter
            ? d.messages.filter((m) => m.id !== id)
            : d.messages.map((m) => (m.id === id ? message : m)),
        newCount: Math.max(0, d.newCount + (is ? 1 : 0) - (was ? 1 : 0)),
      };
    });
  };

  const { messages, newCount, error } = data;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminSectionHeader
        eyebrow="Admin"
        title="Messages"
        subtitle={
          newCount > 0
            ? `${newCount} enquir${newCount === 1 ? 'y' : 'ies'} waiting on a reply.`
            : 'Everything from the contact form. Nothing waiting on a reply.'
        }
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Chip key={f.key || 'all'} active={filter === f.key} onClick={() => setFilter(f.key)}>
            {f.label}
            {f.key === 'new' && newCount > 0 ? ` · ${newCount}` : ''}
          </Chip>
        ))}
      </div>

      <div className="mt-4 space-y-2.5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bc-skeleton h-[86px] rounded-card" />
          ))
        ) : error ? (
          <div className="rounded-card bg-bad-bg px-5 py-4 text-sm font-medium text-bad">
            {error}
            <button
              type="button"
              onClick={() => setAttempt((a) => a + 1)}
              className="ml-3 cursor-pointer rounded-btn border-0 bg-white px-3 py-1 text-xs font-bold text-bad"
            >
              Retry
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="rounded-card border border-dashed border-line bg-white px-5 py-10 text-center">
            <p className="bc-h4">Nothing here</p>
            <p className="bc-meta mt-1.5 text-muted">
              {filter === 'new'
                ? 'No unanswered enquiries — the inbox is clear.'
                : 'No messages with this status yet.'}
            </p>
          </div>
        ) : (
          messages.map((m) => <MessageRow key={m.id} message={m} onStatus={setStatus} />)
        )}
      </div>
    </div>
  );
}
