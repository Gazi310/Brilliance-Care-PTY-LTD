import CatalogueThumb from './CatalogueThumb.jsx';
import { CloseIcon } from '../icons.jsx';
import { Button } from '../../ui';

/**
 * One editable catalogue item — the shell shared by the laundry,
 * cleaning and shop managers.
 *
 * All three had their own copy of this row, on three different palettes
 * (sky, emerald, and raw gray), so the same job looked like three
 * different products depending on which tab you were on. The row owns
 * the frame, thumbnail, title, delete and save button; each manager
 * passes its own fields as children, because those genuinely differ —
 * laundry has turnaround, cleaning has a pricing model, shop has stock.
 *
 * The save button is navy, not gold: these lists show one save control
 * per item, and a screen with nine gold buttons has no primary action.
 */
export default function CatalogueRow({
  title,
  subtitle,
  image,
  fallback,
  onPickImage,
  onDelete,
  onSave,
  dirty,
  saving,
  children,
  footer,
}) {
  return (
    <li className="rounded-card border border-line bg-white p-5">
      <div className="flex items-center gap-4">
        <CatalogueThumb image={image} fallback={fallback} onPick={onPickImage} />

        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-navy-900">{title}</p>
          <p className="mt-0.5 line-clamp-1 bc-meta text-muted">{subtitle || '—'}</p>
        </div>

        <button
          type="button"
          onClick={onDelete}
          title={`Delete ${title}`}
          aria-label={`Delete ${title}`}
          className="grid h-9 w-9 place-items-center rounded-btn text-muted transition-colors hover:bg-bad-bg hover:text-bad"
        >
          <CloseIcon width={17} height={17} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        {children}

        <Button
          variant="navy"
          size="sm"
          onClick={onSave}
          disabled={!dirty || saving}
          className="ml-auto"
        >
          {saving ? 'Saving…' : dirty ? 'Save' : 'Saved'}
        </Button>
      </div>

      {footer}
    </li>
  );
}

/**
 * A compact labelled control for use inside a CatalogueRow.
 *
 * Not <Field>: that one is a full-width stacked form control at 44px
 * minimum, and these rows put five of them side by side. Same visual
 * language, sized for a row.
 */
export function RowField({ label, width = 'w-28', prefix, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
        {label}
      </label>
      {prefix ? (
        <div className={`inline-flex h-10 items-center rounded-btn border border-line bg-white px-3 ${width}`}>
          <span className="text-[15px] text-muted">{prefix}</span>
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

/** The shared input styling for a row control. */
export const rowInput =
  'h-10 rounded-btn border border-line bg-white px-3 text-[15px] text-ink placeholder:text-muted';

/** A borderless input for use inside a RowField that has a `prefix`. */
export const rowInputBare = 'w-full min-w-0 border-0 bg-transparent text-[15px] text-ink outline-none';

/** The live/off switch every catalogue row carries. */
export function LiveToggle({ on, onToggle, label = 'Toggle availability' }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
        Live
      </label>
      <button
        type="button"
        onClick={onToggle}
        role="switch"
        aria-checked={on}
        aria-label={label}
        className={`relative h-10 w-[52px] rounded-full transition-colors ${
          on ? 'bg-gold-500' : 'bg-line'
        }`}
      >
        <span
          className={`absolute top-1 h-8 w-8 rounded-full bg-white shadow transition-all ${
            on ? 'left-[18px]' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
}
