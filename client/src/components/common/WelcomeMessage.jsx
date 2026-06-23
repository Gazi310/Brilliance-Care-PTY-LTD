export default function WelcomeMessage({ mounted }) {
  return (
    <div
      className={`relative z-10 hidden max-w-sm text-white md:block
        transition duration-500 ease-out [transition-delay:150ms]
        ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
    >
      <h3 className="text-3xl font-bold leading-tight">
        Welcome back 👋
      </h3>
      <p className="mt-4 text-base text-blue-100/90">
        Fresh, clean laundry is just a sign-in away. Manage your orders and bookings with ease.
      </p>
    </div>
  );
}
