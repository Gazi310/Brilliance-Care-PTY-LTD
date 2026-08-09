import PageHero from '../components/ui/PageHero.jsx';
import Band from '../components/ui/Band.jsx';
import Container from '../components/ui/Container.jsx';
import AccountNav from '../components/account/AccountNav.jsx';
import ProfileDetails from '../components/account/ProfileDetails.jsx';
import ProfileAddress from '../components/account/ProfileAddress.jsx';
import ProfilePreferences from '../components/account/ProfilePreferences.jsx';
import ProfileNotifications from '../components/account/ProfileNotifications.jsx';

/**
 * /account/profile — the customer's saved details.
 *
 * Four cards, each saving on its own, because a single page-wide Save
 * means one bad postcode blocks a notification preference. Route is
 * already behind PrivateRoute, so `user` is present by the time this
 * renders and the cards can seed their state from it directly.
 */
export default function Profile() {
  return (
    <main>
      <PageHero
        title="Your details"
        sub="Saved so booking takes two taps next time."
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Account', to: '/account/orders' },
          { label: 'Profile' },
        ]}
      />

      <Band tone="white">
        <Container className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          <AccountNav />

          <div className="min-w-0 flex-1">
            <ProfileDetails />
            <ProfileAddress />
            <ProfilePreferences />
            <ProfileNotifications />
          </div>
        </Container>
      </Band>
    </main>
  );
}
