/**
 * The `.amain` wrapper — container width and page padding for every
 * admin screen, in one place.
 *
 * v1 had each admin page pick its own `max-w-2xl`/`max-w-3xl`, so the
 * content column jumped width as staff moved between sections and the
 * six-column work-queue table was squeezed into 768px on a 1440px
 * monitor. Admin is an internal tool used on desktop all day: it gets
 * the room. `wide` is the default; pass `narrow` for the settings-style
 * pages that are a single column of form fields, where a full-width
 * text input is just harder to read.
 */
export default function AdminPage({ width = 'wide', className = '', children }) {
  const max = width === 'narrow' ? 'max-w-3xl' : 'max-w-6xl';

  return (
    <div className={`mx-auto ${max} px-4 py-7 sm:px-6 lg:px-9 ${className}`}>{children}</div>
  );
}
