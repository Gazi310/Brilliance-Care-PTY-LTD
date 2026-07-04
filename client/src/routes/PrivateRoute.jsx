import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Route guard. Wrap protected elements:
 *   <PrivateRoute><Orders /></PrivateRoute>                    // any signed-in user
 *   <PrivateRoute requireAdmin><AdminThing /></PrivateRoute>   // admins only
 *
 * Waits for the session to resolve before deciding, so a refresh on a
 * protected page doesn't flash a redirect to /login.
 */
export default function PrivateRoute({ children, requireAdmin = false }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-sm font-semibold text-muted">Loading…</p>
      </main>
    );
  }

  // Not signed in → send to login, remembering where they were headed.
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Signed in but not an admin on an admin-only route → home.
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
