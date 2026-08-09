/**
 * Container — centres content inside a Band and caps its width.
 *
 * "default" (1280px) is the page grid. "narrow" (900px) is for
 * anything read as prose: FAQ answers, policy copy, the worked
 * pricing example. Long lines are the fastest way to make a
 * generous layout feel cheap.
 */

const WIDTHS = {
  default: 'max-w-[1280px]',
  narrow: 'max-w-[900px]',
  prose: 'max-w-[740px]',
};

export default function Container({
  width = 'default',
  as: Tag = 'div',
  className = '',
  children,
  ...rest
}) {
  return (
    <Tag
      className={`mx-auto w-full ${WIDTHS[width] ?? WIDTHS.default} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
