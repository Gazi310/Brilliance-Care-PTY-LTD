import CatalogueThumb from './CatalogueThumb.jsx';
import { PlusIcon, CloseIcon } from '../icons.jsx';
import { Button, Panel } from '../../ui';

/**
 * The collapsible "add an item" form, shared by all three catalogue
 * managers. Owns the toggle, the frame, the photo picker and the submit
 * button; each manager supplies its own fields as children.
 */
export default function AddCatalogueItem({
  label,
  open,
  onToggle,
  onSubmit,
  creating,
  image,
  onPickImage,
  onImageUrl,
  children,
}) {
  return (
    <div>
      <Button variant="outline" block onClick={onToggle} className="border-dashed">
        {open ? <CloseIcon width={17} height={17} /> : <PlusIcon width={17} height={17} />}
        {open ? 'Close' : label}
      </Button>

      {open && (
        <Panel className="bc-fade-up mt-3">
          <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4 px-6 py-6">
            {children}

            {/* Photo */}
            <div className="col-span-2">
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-muted">
                Photo
              </label>
              <div className="flex items-center gap-4">
                <CatalogueThumb size="lg" image={image} fallback="—" onPick={onPickImage} />
                <input
                  placeholder="or paste an image URL"
                  value={image?.startsWith('data:') ? '' : image || ''}
                  onChange={(e) => onImageUrl(e.target.value)}
                  className="h-11 min-w-0 flex-1 rounded-btn border border-line bg-white px-3.5 text-[15px] text-ink placeholder:text-muted"
                />
              </div>
            </div>

            <Button variant="gold" type="submit" block disabled={creating} className="col-span-2">
              {creating ? 'Adding…' : 'Add'}
            </Button>
          </form>
        </Panel>
      )}
    </div>
  );
}

/** The shared input styling for the add form. */
export const addInput =
  'h-11 w-full rounded-btn border border-line bg-white px-3.5 text-[15px] text-ink placeholder:text-muted';
