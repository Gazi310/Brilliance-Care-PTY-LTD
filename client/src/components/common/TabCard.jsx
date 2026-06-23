import { Link } from 'react-router-dom';

export default function TabCard({
  to,
  icon,
  title,
  description,
  gradient,   // e.g. 'from-sky-500 to-blue-600'
  accent,     // e.g. 'text-blue-600'
  index = 0,
  mounted = true,
}) {
  return (
    <Link
      to={to}
      style={{ transitionDelay: `${index * 120}ms` }}
      className={`group relative block flex-1 min-w-[240px] max-w-sm
        transition-all duration-500 ease-out will-change-transform
        ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
    >
      {/* soft gradient glow halo (revealed on hover) */}
      <div
        className={`pointer-events-none absolute -inset-1 rounded-[28px] bg-gradient-to-br ${gradient}
          opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-60`}
      />

      {/* card body */}
      <div
        className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/85 p-8 shadow-lg backdrop-blur
          transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:shadow-2xl"
      >
        {/* animated top accent bar */}
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${gradient}
            transition-transform duration-500 ease-out group-hover:scale-x-100`}
        />

        {/* shine sweep */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />

        <div className="relative z-10">
          <div
            className={`mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient}
              text-3xl text-white shadow-md transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-6`}
          >
            {icon}
          </div>

          <h3 className="mb-2 text-xl font-bold text-gray-800">{title}</h3>
          <p className="text-sm leading-relaxed text-gray-500">{description}</p>

          <span
            className={`mt-5 inline-flex items-center gap-1 text-sm font-semibold ${accent}
              -translate-x-2 opacity-0 transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:opacity-100`}
          >
            Explore
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 transition-transform duration-500 ease-out group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
