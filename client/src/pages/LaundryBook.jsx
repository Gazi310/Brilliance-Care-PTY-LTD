import { Navigate } from 'react-router-dom';

/**
 * /laundry/book — the old standalone estimate builder. Building an order is
 * now step 1 of the guided /book/laundry flow (Phase 1), so this route just
 * forwards there to keep old links working.
 */
export default function LaundryBook() {
  return <Navigate to="/book/laundry" replace />;
}
