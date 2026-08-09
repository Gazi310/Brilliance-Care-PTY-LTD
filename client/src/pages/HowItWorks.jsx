import PageHero from '../components/ui/PageHero.jsx';
import HowItWorksSteps from '../components/marketing/HowItWorksSteps.jsx';
import DepositExplainer from '../components/marketing/DepositExplainer.jsx';
import ChangesFaq from '../components/marketing/ChangesFaq.jsx';
import CtaBand from '../components/marketing/CtaBand.jsx';

/**
 * /how-it-works — the long explanation of the deposit model.
 *
 * The commercial model is the one genuinely unusual thing about this
 * business, and an unexplained deposit is the most likely reason someone
 * abandons the booking flow. This page exists to answer it once,
 * properly, so every other page can just link here.
 */
export default function HowItWorks() {
  return (
    <main>
      <PageHero
        title="How it works"
        sub="Estimate, deposit, then an invoice for the job we actually did. Here’s every step, including what happens if something changes."
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'How it works' },
        ]}
      />

      <HowItWorksSteps />
      <DepositExplainer />
      <ChangesFaq />

      <CtaBand
        title="Try it — the estimate is free"
        sub="You’ll see your number before anything asks for a card."
      />
    </main>
  );
}
