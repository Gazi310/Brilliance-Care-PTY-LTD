/**
 * Notice — an inline explanatory block.
 *
 * This one earns its place on the invoice page. The deposit model
 * (estimate → 50% deposit → assessed → balance) either reads as
 * generous or as a bait-and-switch, and the difference is entirely
 * whether the explanation comes before the numbers. Lead with the
 * Notice, then show the table.
 *
 * Not a toast and not a form error — those are transient. A Notice
 * is part of the page.
 */

const TONES = {
  info: { box: 'bg-sky-100 text-navy-900', icon: 'i' },
  ok: { box: 'bg-ok-bg text-[#0b6b50]', icon: 'check' },
  warn: { box: 'bg-warn-bg text-warn', icon: '!' },
};

const ICONS = {
  i: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.6v.6" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.3l2.4 2.4 4.6-5" />
    </>
  ),
  '!': (
    <>
      <path d="M12 3.5l9 16H3l9-16z" />
      <path d="M12 10v4M12 17.2v.4" />
    </>
  ),
};

export default function Notice({ tone = 'info', icon, className = '', children }) {
  const t = TONES[tone] ?? TONES.info;

  return (
    <div
      className={`flex gap-3.5 rounded-card px-5 py-[18px] text-[15.5px] leading-[1.55] ${t.box} ${className}`}
    >
      {icon ?? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-0.5 h-5 w-5 flex-none"
          aria-hidden="true"
        >
          {ICONS[t.icon]}
        </svg>
      )}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
