/**
 * Panel — the admin surface.
 *
 * Every one of the six admin wireframes is built from this: a white
 * card with a ruled title row and a body that sits flush to the edges
 * so a <DataTable> can run the full width without a double border.
 *
 * It is deliberately NOT <Card>. Card is a marketing surface — 32px of
 * padding and a lift shadow, which is right for three cards in a grid
 * and wrong for eight stacked tables in a work queue. Admin trades
 * generosity for density: flat, ruled, scannable.
 *
 *   title   the ruled header row; omit it and you get a bare panel
 *   action  right-aligned slot in that row (a Tag count, a "+ Add"
 *           button, a "Full schedule →" link)
 *   padded  wrap the body in the standard 20/24 inset. Leave it off
 *           when the child is a table or a row list that should bleed.
 *
 * Header is <h3> by default; pass `as="h2"` where the panel title is
 * the real heading for the region rather than a label inside one.
 */
export default function Panel({
  title,
  action,
  padded = false,
  as: Heading = 'h3',
  className = '',
  bodyClassName = '',
  children,
  ...rest
}) {
  return (
    <section
      className={`overflow-hidden rounded-card border border-line bg-white ${className}`}
      {...rest}
    >
      {title && (
        <Heading className="m-0 flex items-center justify-between gap-3.5 border-b border-line px-6 py-5 font-display text-[18px] font-semibold text-navy-900">
          <span className="flex min-w-0 items-center gap-2.5">{title}</span>
          {action}
        </Heading>
      )}

      <div className={`${padded ? 'px-6 py-5' : ''} ${bodyClassName}`}>{children}</div>
    </section>
  );
}
