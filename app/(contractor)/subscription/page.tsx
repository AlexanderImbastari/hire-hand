'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { QuoteMeter } from '@/components/AllowanceBanner';
import { useRequiredSession } from '@/components/SessionProvider';
import { getQuoteAllowance, getSubscription } from '@/shared/data';
import { formatDate } from '@/shared/format';
import { FREE_QUOTE_LIMIT, type QuoteAllowance, type Subscription } from '@/shared/types';

/** A contractor's own plan and quote allowance. Readable only by its owner. */
export default function SubscriptionPage() {
  const { session, revision, account } = useRequiredSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [allowance, setAllowance] = useState<QuoteAllowance | null>(null);

  useEffect(() => {
    let live = true;
    Promise.all([
      getSubscription(session).catch(() => null),
      getQuoteAllowance(session),
    ]).then(([s, a]) => {
      if (!live) return;
      setSubscription(s);
      setAllowance(a);
    });
    return () => {
      live = false;
    };
  }, [session, revision]);

  if (account?.role !== 'contractor') return null;

  const status = subscription?.status ?? 'none';
  const onPro = status === 'active' || status === 'cancelled';

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="text-[28px] font-extrabold tracking-[-0.02em]">
        Subscription
      </h1>
      <p className="mt-1 text-[13.5px] text-ink-500">
        Browsing is free forever. The subscription only lifts the cap on how
        many quotes you can send.
      </p>

      <div className="mt-8 rounded-lg border border-line p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="text-lg font-extrabold">
            {onPro ? 'Contractor Pro' : 'Free'}
          </p>
          <p className="text-[26px] font-extrabold">
            {onPro ? '$20' : '$0'}
            <span className="text-[13px] font-semibold text-ink-400">
              {onPro ? '/mo' : ''}
            </span>
          </p>
        </div>

        {status === 'past_due' && (
          <p className="mt-4 rounded-md border border-accent-edge bg-orange-50 px-4 py-3 text-[13px] font-semibold text-accent-ink">
            Payment past due — quoting is paused. Your profile and the quotes
            already out are unchanged.
          </p>
        )}
        {status === 'cancelled' && subscription && (
          <p className="mt-4 rounded-md border border-line bg-surface-alt px-4 py-3 text-[13px] font-semibold text-ink-500">
            Cancelled — unlimited quoting runs to{' '}
            {formatDate(subscription.currentPeriodEnd)}.
          </p>
        )}

        <div className="mt-6 border-t border-line pt-5">
          <p className="label">Quote allowance</p>
          {allowance ? (
            <QuoteMeter allowance={allowance} />
          ) : (
            <div className="h-6 animate-pulse rounded bg-rule" />
          )}
          <p className="mt-3 text-[12.5px] leading-[1.55] text-ink-500">
            The {FREE_QUOTE_LIMIT} free quotes are for the lifetime of the
            account. They never reset — not on cancellation, not if a payment
            lapses. Going Pro makes the count moot rather than clearing it.
          </p>
        </div>

        {!onPro && (
          <Link href="/pricing" className="btn-primary mt-6 w-full">
            Go unlimited — $20/mo
          </Link>
        )}
      </div>

      <p className="mt-4 text-center text-[12.5px] text-ink-400">
        Billing arrives with Stripe in phase 2.
      </p>
    </main>
  );
}
