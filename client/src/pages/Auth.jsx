import { Link, useLocation, useNavigate } from 'react-router-dom';
import PageHero from '../components/ui/PageHero.jsx';
import Band from '../components/ui/Band.jsx';
import Container from '../components/ui/Container.jsx';
import Card from '../components/ui/Card.jsx';
import AuthTabs from '../components/auth/AuthTabs.jsx';
import LoginForm from '../components/auth/LoginForm.jsx';
import RegisterForm from '../components/auth/RegisterForm.jsx';
import AuthBenefits from '../components/auth/AuthBenefits.jsx';
import loginBg from '../assets/login-section-bg-img.jpg';

/**
 * /login and /register — one screen, two tabs.
 *
 * They were separate pages with near-identical markup, and the only way
 * between them was a link under the button. Merging them means a
 * customer bounced here from a booking redirect can switch without
 * losing where they were going.
 *
 * The tab still changes the URL rather than being local state: /register
 * has to stay linkable from the nav and the footer, and someone who
 * refreshes mid-signup should land back on the sign-up form. `mode` is
 * passed by the route, so the URL is the single source of truth.
 */
export default function Auth({ mode = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Preserve pathname + query (e.g. /book/laundry?step=4) for a clean return trip.
  const from = location.state?.from
    ? `${location.state.from.pathname || '/'}${location.state.from.search || ''}`
    : '/';

  const done = () => navigate(from, { replace: true });
  const registering = mode === 'register';

  return (
    <main>
      <PageHero
        title={registering ? 'Create your account' : 'Welcome back'}
        sub={
          registering
            ? 'Save your address once and book in two taps from then on.'
            : 'Sign in to track an order, pay a balance or book again.'
        }
        crumbs={[{ label: 'Home', to: '/' }, { label: registering ? 'Create account' : 'Log in' }]}
        image={loginBg}
      />

      <Band tone="white">
        <Container className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">
          <div className="min-w-0 lg:w-[460px] lg:flex-none">
            <Card>
              {/* `state` rides along so signing up mid-booking still returns
                  the customer to the step they left. */}
              <AuthTabs mode={mode} state={location.state} />

              {registering ? <RegisterForm onDone={done} /> : <LoginForm onDone={done} />}

              <p className="bc-meta mt-[22px] text-center text-muted">
                In a hurry?{' '}
                <Link
                  to="/book"
                  state={location.state}
                  className="font-bold text-navy-500 underline decoration-2 underline-offset-4 hover:text-navy-900"
                >
                  Book as a guest
                </Link>
              </p>
            </Card>
          </div>

          <div className="min-w-0 flex-1">
            <AuthBenefits />
          </div>
        </Container>
      </Band>
    </main>
  );
}
