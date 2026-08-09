/**
 * Card — the default surface for a discrete piece of content.
 *
 * Two weights only:
 *   default  white, hairline border, soft lift shadow, 32px padding
 *   flat     same but no shadow and tighter padding — for cards
 *            sitting inside another card, or in dense lists where
 *            twelve shadows would read as noise
 *
 * If you find yourself wanting a third weight, the answer is usually
 * that the thing isn't a card.
 */
export default function Card({
  flat = false,
  as: Tag = 'div',
  className = '',
  children,
  ...rest
}) {
  return (
    <Tag
      className={`rounded-card border border-line bg-white ${
        flat ? 'p-[26px]' : 'p-6 shadow-card lg:p-8'
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
