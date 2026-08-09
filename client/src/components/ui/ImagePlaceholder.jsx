/**
 * ImagePlaceholder — a labelled slot where a real photograph goes.
 *
 * The wireframes have 30+ of these and photography is still an open
 * item on the project. Deliberately dashed and obviously unfinished:
 * a grey box reads as a bug, a labelled dashed box reads as a to-do.
 * `subject` should describe the shot you actually want, so whoever
 * commissions the photos has a brief.
 *
 * Pass `src` once the real image exists and it renders that instead,
 * so swapping a placeholder for a photo is a one-prop change.
 *
 * `flush` is for images that sit at the top of a card and run to its
 * edges: square corners, and the dashed frame reduced to a single
 * bottom rule so it doesn't double up with the card's own border.
 */
export default function ImagePlaceholder({
  subject,
  ratio = '17/10',
  src,
  alt,
  flush = false,
  className = '',
  style,
  ...rest
}) {
  const box = { aspectRatio: ratio, ...style };
  const radius = flush ? 'rounded-none' : 'rounded-img';

  if (src) {
    return (
      <img
        src={src}
        alt={alt ?? subject ?? ''}
        className={`w-full object-cover ${radius} ${className}`}
        style={box}
        {...rest}
      />
    );
  }

  return (
    <div
      className={`grid place-items-center border-dashed border-[#b9cbdd] bg-sky-50 p-[22px] text-center ${radius} ${
        flush ? 'border-x-0 border-b-[1.5px] border-t-0' : 'border-[1.5px]'
      } ${className}`}
      style={box}
      {...rest}
    >
      <span className="max-w-[280px] text-[13px] font-medium leading-[1.5] text-muted">
        <b className="mb-2 block text-[10.5px] font-extrabold uppercase leading-none tracking-[0.12em] text-navy-500">
          Photo
        </b>
        {subject}
      </span>
    </div>
  );
}
