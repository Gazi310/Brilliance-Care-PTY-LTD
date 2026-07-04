/* Shared heading for admin manager pages, so each page stays thin. */
export default function AdminSectionHeader({ eyebrow = 'Manage', title, subtitle, action }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-faint">{eyebrow}</p>
        <h1 className="mt-1 text-xl font-extrabold tracking-tight text-ink sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
