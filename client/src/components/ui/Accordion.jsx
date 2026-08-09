import { useState } from 'react';

/**
 * Accordion / AccordionItem — the FAQ pattern.
 *
 * Built on <details>/<summary> so it works without JavaScript, is
 * keyboard-operable for free, and — importantly for a business that
 * wants to be found — the answers stay in the DOM for search engines
 * even while collapsed.
 *
 * Local `open` state exists only to rotate the chevron; the element
 * itself still drives the actual open/closed behaviour.
 */

export function AccordionItem({ q, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details
      open={defaultOpen}
      onToggle={(e) => setOpen(e.currentTarget.open)}
      className="border-b border-line"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 font-display text-lg font-semibold text-navy-900 [&::-webkit-details-marker]:hidden lg:py-6 lg:text-[22px]">
        {q}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-6 w-6 flex-none text-navy-500 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </summary>
      <div className="max-w-[760px] pb-[26px] text-muted">{children}</div>
    </details>
  );
}

export default function Accordion({ className = '', children }) {
  return <div className={className}>{children}</div>;
}
