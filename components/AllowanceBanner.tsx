'use client';

import Link from 'next/link';
import { allowanceMessage } from '@/shared/data';
import { FREE_QUOTE_LIMIT, type QuoteAllowance } from '@/shared/types';

/**
 * The only place a subscription surfaces in the product. Browsing is never
 * gated — the quote count is the only meter.
 */

/** Thin track + `n of 3 free left`, shown next to the quote action. */
export function QuoteMeter({ allowance }: { allowance: QuoteAllowance }) {
  if (allowance.limit === null) {
    return (
      <p className="text-[12.5px] font-bold text-ink-500">
        Contractor Pro — unlimited quotes
      </p>
    );
  }

  const used = Math.min(allowance.used, FREE_QUOTE_LIMIT);
  return (
    <div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-rule"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={FREE_QUOTE_LIMIT}
        aria-valuenow={used}
        aria-label="Free quotes used"
      >
        <div
          className="h-full rounded-full bg-orange-500 transition-[width] duration-150 ease-out"
          style={{ width: `${(used / FREE_QUOTE_LIMIT) * 100}%` }}
        />
      </div>
      <p className="mt-2 text-[12.5px] font-bold text-ink-700">
        {allowance.remaining} of {FREE_QUOTE_LIMIT} free left
      </p>
    </div>
  );
}

/** The sidebar upsell card. Never rendered on a homeowner screen. */
export function AllowanceCard({ allowance }: { allowance: QuoteAllowance }) {
  if (allowance.limit === null) return null;

  const exhausted = allowance.remaining === 0;
  return (
    <div className="mt-8 rounded-[14px] border border-accent-edge bg-orange-50 p-[18px]">
      <p className="text-[13px] font-extrabold">
        {exhausted
          ? 'Free quotes used up'
          : `${allowance.remaining} of ${FREE_QUOTE_LIMIT} free quotes left`}
      </p>
      <p className="mt-1.5 text-[12.5px] leading-[1.5] text-accent-ink">
        Browsing stays free. Go Pro for unlimited quoting.
      </p>
      <Link
        href="/pricing"
        className="mt-3 block cursor-pointer rounded-sm bg-orange-500 px-3.5 py-2.5 text-center text-[12.5px] font-bold text-white transition-colors duration-150 hover:bg-orange-600"
      >
        Upgrade — $20/mo
      </Link>
    </div>
  );
}

/**
 * A single inline notice when quoting is blocked for a reason other than a
 * spent allowance — never a modal, and never anything that hides the jobs.
 */
export function AllowanceBanner({ allowance }: { allowance: QuoteAllowance }) {
  if (allowance.canQuote || allowance.reason === 'free_quotes_exhausted') {
    return null;
  }

  return (
    <p className="mb-5 rounded-md border border-accent-edge bg-orange-50 px-4 py-3 text-[13px] font-semibold text-accent-ink">
      {allowance.reason === 'past_due'
        ? 'Payment past due — quoting is paused. Your live quotes and profile are unchanged.'
        : allowanceMessage(allowance)}
    </p>
  );
}
