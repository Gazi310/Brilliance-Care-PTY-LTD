import { money, dateLabel } from '../orders/orderStatusMeta.js';
import { PhoneIcon, MailIcon } from '../icons.jsx';
import { Panel, Tag, Button, KpiCard } from '../../ui';

const initial = (name) => (name || '?').trim().charAt(0).toUpperCase() || '?';

/**
 * Identity + headline numbers for one customer (account or guest).
 *
 * Phase 8 restyle: the gradient avatar goes flat navy, the emoji contact
 * buttons (📞 ✉️) become real icons, and the three stat boxes reuse
 * <KpiCard> so they match the dashboard rather than being a fourth
 * variation on "number in a box".
 */
export default function CustomerProfileCard({ customer: c }) {
  const STATS = [
    { label: 'Orders', value: c.ordersCount },
    { label: 'Total spent', value: money(c.totalSpent) },
    {
      label: 'Outstanding',
      value: money(c.outstanding),
      ...(c.outstanding > 0 ? { delta: 'Balance owing', direction: 'down' } : {}),
    },
  ];

  return (
    <Panel padded>
      <div className="flex items-center gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-navy-900 font-display text-xl font-bold text-white">
          {initial(c.name)}
        </span>

        <div className="min-w-0">
          <h2 className="flex flex-wrap items-center gap-2.5 font-display text-[22px] font-bold text-navy-900">
            {c.name}
            <Tag tone={c.type === 'guest' ? 'neutral' : 'info'}>
              {c.type === 'guest' ? 'Guest' : 'Account'}
            </Tag>
            {c.isAdmin && <Tag tone="gold">Admin</Tag>}
          </h2>
          <p className="mt-1.5 bc-meta text-muted">
            {c.memberSince
              ? `Customer since ${dateLabel(c.memberSince)}`
              : 'Books as a guest — invite them to create an account to track orders'}
          </p>
        </div>
      </div>

      {/* Contact */}
      <div className="mt-5 flex flex-wrap gap-2.5">
        {c.phone && (
          <Button variant="outline" size="sm" href={`tel:${c.phone.replace(/\s+/g, '')}`}>
            <PhoneIcon width={16} height={16} />
            {c.phone}
          </Button>
        )}
        {c.email && (
          <Button variant="outline" size="sm" href={`mailto:${c.email}`}>
            <MailIcon width={16} height={16} />
            {c.email}
          </Button>
        )}
        {!c.phone && !c.email && (
          <p className="bc-meta text-muted">No contact details on file yet.</p>
        )}
      </div>

      {/* Numbers */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {STATS.map((s) => (
          <KpiCard key={s.label} {...s} />
        ))}
      </div>
    </Panel>
  );
}
