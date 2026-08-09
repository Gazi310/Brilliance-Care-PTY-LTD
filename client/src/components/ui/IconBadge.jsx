/**
 * IconBadge — a circular gold-tinted disc holding an icon.
 *
 * This exists specifically to kill the emoji. v1 used 📍 🧺 🫧 as
 * section icons and the client called it out as looking unfinished;
 * emoji also render differently on every platform and can't be
 * recoloured. Every one of them becomes an IconBadge with a real SVG.
 *
 * Pass either an element (`icon={<Truck />}`) or a component
 * (`icon={Truck}`) — both work, so it doesn't matter which shape
 * the icon set you're pulling from happens to use.
 */

const SIZES = {
  default: 'w-[54px] h-[54px] mb-4 lg:w-16 lg:h-16 lg:mb-5 [&>svg]:w-7 [&>svg]:h-7',
  sm: 'w-12 h-12 mb-3.5 [&>svg]:w-[22px] [&>svg]:h-[22px]',
};

const TONES = {
  gold: 'bg-gold-100 text-navy-500',
  navy: 'bg-navy-900 text-gold-500',
  sky: 'bg-sky-100 text-navy-700',
};

export default function IconBadge({
  icon,
  size = 'default',
  tone = 'gold',
  className = '',
  ...rest
}) {
  const Icon = typeof icon === 'function' ? icon : null;

  return (
    <span
      aria-hidden="true"
      className={`grid flex-none place-items-center rounded-full ${
        TONES[tone] ?? TONES.gold
      } ${SIZES[size] ?? SIZES.default} ${className}`}
      {...rest}
    >
      {Icon ? <Icon /> : icon}
    </span>
  );
}
