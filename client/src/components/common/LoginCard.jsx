import FloatingInput from './FloatingInput';

export default function LoginCard({ mounted }) {
  return (
    <div
      className={`relative z-10 w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-lg
        transition duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl
        ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
    >
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl">
          🧺
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
          Welcome Back
        </h2>
        <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
      </div>

      <form className="space-y-5">

        <FloatingInput type="email" label="Email" />

        <FloatingInput type="password" label="Password" />

        <FloatingInput type="text" label="Suburb" />

        <div className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-gray-500">
            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400" />
            Remember me
          </label>
          <a href="#" className="font-medium text-blue-600 transition-colors hover:text-blue-700">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400/40 active:translate-y-0 active:bg-blue-800"
        >
          Sign In
        </button>

      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <a href="#" className="font-semibold text-blue-600 transition-colors hover:text-blue-700">
          Sign up
        </a>
      </p>
    </div>
  );
}
