/**
 * SummaryCard — the tinted order-summary panel beside a cart or form.
 *
 * Sticky on desktop so the total stays in view while the customer
 * works down a long form. Static on mobile, because position:sticky
 * on a phone just eats the viewport.
 */
export default function SummaryCard({ title, sticky = true, className = '', children }) {
  return (
    <aside
      className={`rounded-card border border-line bg-sky-50 p-6 lg:p-7 ${
        sticky ? 'lg:sticky lg:top-5' : ''
      } ${className}`}
    >
      {title && <h2 className="bc-h3 mb-4">{title}</h2>}
      {children}
    </aside>
  );
}
