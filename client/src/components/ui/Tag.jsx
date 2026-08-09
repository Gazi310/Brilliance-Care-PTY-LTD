/**
 * Tag — a non-interactive status pill.
 *
 * Order status, invoice state, "Most booked". Read-only by
 * definition; if it's clickable you want <Chip>.
 *
 * Tone is semantic, not decorative — pick by meaning:
 *   ok    done, paid, confirmed
 *   warn  waiting on someone, needs action
 *   bad   failed, declined, cancelled
 *   info  neutral state worth naming
 *   gold  promotional emphasis, not status
 */

const TONES = {
  ok: 'bg-ok-bg text-ok',
  warn: 'bg-warn-bg text-warn',
  bad: 'bg-bad-bg text-bad',
  info: 'bg-sky-100 text-navy-700',
  gold: 'bg-gold-100 text-navy-900',
  neutral: 'bg-line text-muted',
};

export default function Tag({ tone = 'info', className = '', children, ...rest }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold leading-none tracking-[0.02em] ${
        TONES[tone] ?? TONES.info
      } ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
