import { money, dateLabel } from '../orders/orderStatusMeta.js';

const initial = (name) => (name || '?').trim().charAt(0).toUpperCase() || '?';

/** Identity + headline numbers for one customer (account or guest). */
export default function CustomerProfileCard({ customer: c }) {
  const STATS = [
    { label: 'Orders', value: c.ordersCount },
    { label: 'Total spent', value: money(c.totalSpent) },
    {
      label: 'Outstanding',
      value: money(c.outstanding),
      cls: c.outstanding > 0 ? 'text-amber-600' : 'text-ink',
    },
  ];

  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-soft">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy to-aqua text-xl font-extrabold text-white">
          {initial(c.name)}
        </span>
        <div className="min-w-0">
          <h2 className="flex flex-wrap items-center gap-2 text-lg font-extrabold text-ink">
            {c.name}
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                c.type === 'guest' ? 'bg-line text-faint' : 'bg-aqua/15 text-aqua-d'
              }`}
            >
              {c.type === 'guest' ? 'Guest' : 'Account'}
            </span>
            {c.isAdmin && (
              <span className="rounded-full bg-navy/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy">
                Admin
              </span>
            )}
          </h2>
          <p className="mt-1 text-xs text-muted">
            {c.memberSince
              ? `Customer since ${dateLabel(c.memberSince)}`
              : 'Books as a guest — invite them to create an account to track orders'}
          </p>
        </div>
      </div>

      {/* Contact */}
      <div className="mt-4 flex flex-wrap gap-2">
        {c.phone && (
          <a
            href={`tel:${c.phone.replace(/\s+/g, '')}`}
            className="rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-bold text-navy shadow-soft transition hover:-translate-y-0.5"
          >
            📞 {c.phone}
          </a>
        )}
        {c.email && (
          <a
            href={`mailto:${c.email}`}
            className="rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-bold text-navy shadow-soft transition hover:-translate-y-0.5"
          >
            ✉️ {c.email}
          </a>
        )}
        {!c.phone && !c.email && (
          <p className="text-xs text-faint">No contact details on file yet.</p>
        )}
      </div>

      {/* Numbers */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-xl bg-surface px-3 py-2.5 text-center">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-faint">
              {s.label}
            </p>
            <p className={`mt-0.5 text-base font-extrabold ${s.cls || 'text-ink'}`}>{s.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
