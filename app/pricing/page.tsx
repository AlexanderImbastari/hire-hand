'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SiteNav } from '@/components/AppHeader';
import { useSession } from '@/components/SessionProvider';
import { getSubscription } from '@/shared/data';
import { formatDate } from '@/shared/format';
import type { Subscription } from '@/shared/types';

const FREE_PERKS = [
  'Browse every open job, full detail',
  'All job photos',
  'Service area filtering',
  'Public contractor profile',
  '3 lifetime quotes',
];

const PRO_PERKS = [
  'Unlimited quotes',
  'Browse every open job, full detail',
  'Service area filtering',
  'Public contractor profile',
];

/**
 * Pricing. Contractor-facing by definition — a homeowner is redirected rather
 * than shown a plan, because pricing never appears on a homeowner screen.
 */
export default function PricingPage() {
  const { session, account, ready } = useSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const isContractor = account?.role === 'contractor';

  useEffect(() => {
    if (!session || !isContractor) return;
    let live = true;
    getSubscription(session)
      .then((s) => live && setSubscription(s))
      .catch(() => live && setSubscription(null));
    return () => {
      live = false;
    };
  }, [session, isContractor]);

  const isPro = subscription?.status === 'active' || subscription?.status === 'cancelled';

  if (ready && account?.role === 'user') {
    return (
      <>
        <SiteNav />
        <main className="mx-auto max-w-lg px-6 py-24 text-center">
          <h1 className="text-[26px] font-extrabold tracking-[-0.02em]">
            HireHand is free for homeowners
          </h1>
          <p className="mt-3 text-[15px] leading-[1.6] text-ink-500">
            No posting fee, no booking fee, no commission. Contractor Pro is a
            contractor-side subscription and never affects what you pay.
          </p>
          <Link href="/jobs" className="btn-primary mt-7">
            Back to your jobs
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteNav />
      <main className="px-6 pb-20 pt-14 sm:px-12">
        <div className="text-center">
          <h1 className="text-[30px] font-extrabold tracking-[-0.03em] sm:text-[38px]">
            One plan. Only for contractors.
          </h1>
          <p className="mt-2.5 text-[15px] text-ink-500">
            Homeowners never pay — no posting fee, no booking fee, no commission.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-[900px] gap-5 md:grid-cols-2">
          {/* Free */}
          <div className="rounded-xl border border-line p-8">
            <h2 className="text-lg font-extrabold">Free</h2>
            <p className="mt-1.5 text-[13.5px] text-ink-500">
              For approved contractors getting started.
            </p>
            <p className="mt-5 text-[42px] font-extrabold tracking-[-0.03em]">
              $0
            </p>
            <div className="my-[22px] h-px bg-disabled" />
            <ul>
              {FREE_PERKS.map((perk) => (
                <li
                  key={perk}
                  className="flex items-center gap-2.5 py-[7px] text-sm text-ink-700"
                >
                  <span aria-hidden className="text-ink-900">
                    ✓
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
            <p
              className={`mt-6 rounded-[11px] border border-line-strong py-3.5 text-center text-sm font-bold ${
                isPro ? 'text-ink-400' : ''
              }`}
            >
              {isPro ? 'Free plan' : 'Current plan'}
            </p>
          </div>

          {/* Pro — the commercial moment, hence the dark panel. */}
          <div className="rounded-xl bg-ink-900 p-8 text-white">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-extrabold">Contractor Pro</h2>
              <span className="rounded-full bg-orange-500 px-3 py-[5px] text-[11px] font-bold">
                Unlimited quotes
              </span>
            </div>
            <p className="mt-1.5 text-[13.5px] text-on-dark-muted">
              When three free quotes aren&rsquo;t enough.
            </p>
            <p className="mt-5 text-[42px] font-extrabold tracking-[-0.03em]">
              $20
              <span className="text-[15px] font-semibold text-on-dark-muted">
                /month
              </span>
            </p>
            <div className="my-[22px] h-px bg-dark-line" />
            <ul>
              {PRO_PERKS.map((perk) => (
                <li
                  key={perk}
                  className="flex items-center gap-2.5 py-[7px] text-sm text-on-dark"
                >
                  <span aria-hidden className="text-orange-500">
                    ✓
                  </span>
                  {perk}
                </li>
              ))}
            </ul>

            {isPro ? (
              <p className="mt-6 rounded-[11px] border border-dark-line py-3.5 text-center text-sm font-bold text-on-dark-muted">
                {subscription?.status === 'cancelled'
                  ? `Cancelled — access to ${formatDate(subscription.currentPeriodEnd)}`
                  : 'Your current plan'}
              </p>
            ) : (
              // Stripe is phase 2. The default light disabled fill would read as
              // a bright block on ink, hence the dark-panel override.
              <button
                className="btn-primary mt-6 w-full disabled:bg-dark-line disabled:text-on-dark-muted"
                disabled
              >
                Upgrade now
              </button>
            )}

            <p className="mt-3 text-center text-xs text-ink-400">
              {isPro
                ? 'Cancel anytime — access runs to the end of the paid period.'
                : 'Billing arrives with Stripe in phase 2.'}
            </p>
          </div>
        </div>

        <p className="mx-auto mt-7 max-w-[900px] rounded-[14px] border border-dashed border-line-strong px-6 py-5 text-[13.5px] leading-[1.6] text-ink-500">
          <b className="text-ink-900">Contact details are never paywalled.</b>{' '}
          Exact address and phone unlock when a homeowner accepts your quote, on
          either plan. If a subscription goes <i>past due</i>, quoting pauses but
          your live quotes and profile stay up.
        </p>
      </main>
    </>
  );
}
