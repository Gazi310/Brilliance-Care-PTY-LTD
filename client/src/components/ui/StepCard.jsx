/**
 * StepCard — one numbered step in a "how it works" sequence.
 *
 * Stacks vertically on desktop; on mobile it reflows so the number
 * pill and the title sit on one line with the copy underneath,
 * because four tall stacked cards on a phone is a lot of scrolling
 * for what is essentially a list.
 *
 * `bc-card-light` matters: these almost always sit on a navy band,
 * where the type scale inverts to white — and this card is white.
 * See the rule in index.css.
 *
 * `tone="tint"` is for the times they don't: on a white band a white
 * card is invisible, so those get the sky wash and a hairline border
 * instead. Passing a background through `className` wouldn't work —
 * two background utilities in one class list resolve by stylesheet
 * order, not by which you wrote last.
 */

const TONES = {
  white: 'bg-white',
  tint: 'bg-sky-50 border border-line',
};

export default function StepCard({ step, title, tone = 'white', className = '', children }) {
  return (
    <div
      className={`bc-card-light flex flex-row flex-wrap items-center gap-x-3.5 gap-y-2.5 rounded-card p-6 lg:flex-col lg:flex-nowrap lg:items-start lg:gap-3 lg:p-7 ${
        TONES[tone] ?? TONES.white
      } ${className}`}
    >
      {step != null && (
        <span className="order-1 self-start rounded-full bg-gold-100 px-[15px] py-[7px] font-body text-[11.5px] font-extrabold leading-none tracking-[0.12em] text-navy-900">
          {step}
        </span>
      )}
      {title && <h3 className="bc-h3 order-2 min-w-0 flex-1 lg:flex-none">{title}</h3>}
      <div className="bc-body order-3 basis-full text-muted">{children}</div>
    </div>
  );
}
