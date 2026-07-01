import { Link } from 'react-router-dom';
import { ArrowRight } from './icons';

/**
 * Service tile used on the homepage service grid.
 * `wide` cards span both columns on mobile (e.g. Shop).
 */
export default function TabCard({
  to,
  emoji,
  name,
  sub,
  gradient, // e.g. 'from-teal to-teal-d'
  wide = false,
  index = 0,
  mounted = true,
}) {
  return (
    <Link
      to={to}
      style={{ transitionDelay: `${index * 100}ms` }}
      className={`group flex min-h-[112px] rounded-2xl bg-gradient-to-br ${gradient} p-4 text-white shadow-soft
        transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-lg
        ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
        ${
          wide
            ? 'col-span-2 flex-row items-center gap-3 lg:col-span-1 lg:flex-col lg:items-stretch'
            : 'flex-col justify-between'
        }`}
    >
      <div className={`text-2xl ${wide ? 'sm:text-3xl' : ''}`}>{emoji}</div>
      <div className="flex-1">
        <div className="text-sm font-extrabold">{name}</div>
        <div className="mt-0.5 text-[11px] text-white/90">{sub}</div>
      </div>
      <ArrowRight
        width={18}
        height={18}
        className="self-end opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
      />
    </Link>
  );
}
