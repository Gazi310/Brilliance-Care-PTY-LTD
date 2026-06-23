export default function FloatingInput({ type, label }) {
  return (
    <div className="relative">
      <input
        type={type}
        placeholder=" "
        className="peer w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
      />
      <label className="pointer-events-none absolute left-4 top-3 text-gray-400 transition-all duration-200 peer-focus:-top-2.5 peer-focus:left-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-xs peer-focus:text-blue-600 peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:text-xs">
        {label}
      </label>
    </div>
  );
}
