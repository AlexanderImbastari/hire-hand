import Image from 'next/image';
import Link from 'next/link';
import { SiteNav } from '@/components/AppHeader';
import { HeroSearch } from '@/components/HeroSearch';
import { Illustration } from '@/components/ui/Field';
import { Logo } from '@/components/ui/Logo';

/**
 * Marketing landing. Public — no session required, so it stays a server
 * component; only the nav and the hero search are interactive.
 */

const TRADES = [
  {
    name: 'Plumbing',
    blurb: 'Leaks, water heaters, faucets, clogged drains and burst pipes.',
    illustration: '/illustrations/plumbing.png',
    // Marketing figures. Phase 2 wires these to a public per-trade aggregate;
    // there is no un-authenticated job count in the data layer today.
    openJobs: 128,
    tinted: false,
  },
  {
    name: 'Electrical',
    blurb: 'Panels, outlets, fixtures, tripping breakers and new circuits.',
    illustration: '/illustrations/electrical.png',
    openJobs: 94,
    tinted: true,
  },
  {
    name: 'Landscaping',
    blurb: 'Sod and grading, tree trimming, cleanups and irrigation.',
    illustration: '/illustrations/landscaping.png',
    openJobs: 61,
    tinted: false,
  },
];

const STEPS = [
  {
    n: '01',
    title: 'Post the job',
    body: 'Type, timeframe, ZIP and a few photos. Takes about two minutes.',
    illustration: '/illustrations/step-post.png',
    tinted: false,
  },
  {
    n: '02',
    title: 'Collect quotes',
    body: 'Approved contractors in your area send a price and a message. No spam calls.',
    illustration: '/illustrations/step-quotes.png',
    tinted: true,
  },
  {
    n: '03',
    title: 'Pick your pro',
    body: 'Accepting locks in that contractor and shares your address with them only.',
    illustration: '/illustrations/step-pick.png',
    tinted: false,
  },
];

const PRO_PERKS = [
  'Unlimited quotes',
  'Browse every open job, full detail',
  'Service area filtering',
  'Public contractor profile',
];

export default function LandingPage() {
  return (
    <>
      <SiteNav />

      {/* Hero */}
      <section className="p-3">
        <div className="relative flex h-[420px] flex-col justify-end overflow-hidden rounded-xl bg-photo-dark p-8 sm:h-[520px] sm:p-12">
          <Image
            src="/photos/hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="rounded-xl object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,18,16,0.2)_0%,rgba(20,18,16,0.85)_100%)]"
          />
          <div className="relative">
            <p className="mb-3.5 text-xs font-bold uppercase tracking-[0.18em] text-on-dark-eyebrow">
              The best way to get it fixed
            </p>
            <h1 className="max-w-[820px] text-[40px] font-extrabold leading-[1.02] tracking-[-0.03em] text-white sm:text-[62px]">
              Find the right{' '}
              <span className="rounded-lg bg-orange-500 px-3">pro</span> for the
              job
            </h1>
            <p className="mt-4 max-w-[520px] text-base text-on-dark">
              Post it once. Approved local contractors send you quotes. You pick
              the winner — always free for homeowners.
            </p>
          </div>
        </div>
        <HeroSearch />
      </section>

      {/* Trades */}
      <section className="px-6 pb-5 pt-20 sm:px-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-[26px] font-extrabold tracking-[-0.02em] sm:text-[30px]">
              What do you need done?
            </h2>
            <p className="mt-1.5 text-sm text-ink-500">
              Three trades at launch. More as our contractor network grows.
            </p>
          </div>
          <Link
            href="#how-it-works"
            className="text-[13px] font-bold text-ink-900 transition-colors duration-150 hover:text-orange-500"
          >
            How it works ↗
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {TRADES.map((trade) => (
            <div
              key={trade.name}
              className={`flex flex-col items-center rounded-lg border border-line px-7 pb-7 pt-[34px] text-center ${
                trade.tinted ? 'bg-surface' : 'bg-canvas'
              }`}
            >
              <Illustration src={trade.illustration} size={200} />
              <h3 className="mt-5 text-[21px] font-extrabold tracking-[-0.02em]">
                {trade.name}
              </h3>
              <p className="mt-2 max-w-[260px] text-pretty text-sm leading-[1.55] text-ink-500">
                {trade.blurb}
              </p>
              <p className="mt-3.5 font-mono text-[11px] text-ink-400">
                {trade.openJobs} open jobs
              </p>
              <Link
                href="/signup?role=user"
                className={`mt-[22px] rounded-full px-[22px] py-3 text-[13.5px] font-bold transition-colors duration-150 ${
                  trade.tinted
                    ? 'bg-ink-900 text-white hover:bg-ink-800'
                    : 'border border-line-strong bg-canvas text-ink-900 hover:border-ink-900'
                }`}
              >
                Post a job ↗
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 px-6 py-20 sm:px-12">
        <div className="mb-9 text-center">
          <h2 className="text-[26px] font-extrabold tracking-[-0.02em] sm:text-[30px]">
            How HireHand works
          </h2>
          <p className="mt-1.5 text-sm text-ink-500">
            Your address stays private until you accept a quote.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.n}
              className={`rounded-[16px] border border-line px-7 pb-7 pt-[26px] ${
                step.tinted ? 'bg-surface' : 'bg-canvas'
              }`}
            >
              <p className="font-mono text-xs text-orange-500">{step.n}</p>
              <Illustration
                src={step.illustration}
                size={170}
                className="mx-auto mb-3.5 mt-1.5 block"
              />
              <h3 className="text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-pretty text-sm leading-[1.55] text-ink-500">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Contractor CTA — the commercial moment, hence the one dark panel. */}
      <section className="px-6 pb-20 sm:px-12">
        <div className="flex flex-col items-start gap-12 rounded-xl bg-ink-900 p-8 sm:p-12 lg:flex-row lg:items-center">
          <div className="flex-1">
            <Logo variant="white" size={30} className="mb-[18px]" />
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-dark-eyebrow">
              For contractors
            </p>
            <h2 className="mt-3 text-[30px] font-extrabold leading-[1.1] tracking-[-0.02em] text-white sm:text-[36px]">
              See real jobs before you pay a cent
            </h2>
            <p className="mt-3.5 max-w-[460px] text-[15px] leading-[1.6] text-on-dark-muted">
              Browsing is free forever — full job detail and photos. Your first 3
              quotes are free too. Go Pro for $20/month when you&rsquo;re ready
              for unlimited.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link href="/signup?role=contractor" className="btn-pill-ghost">
                Apply as a contractor
              </Link>
              <Link href="/pricing" className="btn-pill-ghost">
                See pricing
              </Link>
            </div>
          </div>

          <div className="w-full rounded-[16px] border border-dark-line bg-ink-800 p-6 lg:w-[380px]">
            <div className="flex items-baseline justify-between">
              <p className="text-[15px] font-bold text-white">Contractor Pro</p>
              <p className="text-[26px] font-extrabold text-white">
                $20
                <span className="text-[13px] font-semibold text-on-dark-muted">
                  /mo
                </span>
              </p>
            </div>
            <div className="my-[18px] h-px bg-dark-line" />
            <ul>
              {PRO_PERKS.map((perk) => (
                <li
                  key={perk}
                  className="flex items-center gap-2.5 py-[7px] text-[13.5px] text-on-dark"
                >
                  <span aria-hidden className="text-orange-500">
                    ✓
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
