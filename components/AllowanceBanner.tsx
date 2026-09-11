'use client';

import { allowanceMessage } from '@/shared/data';
import type { QuoteAllowance } from '@/shared/types';

/**
 * The one place the subscription shows up in the product. Browsing is never
 * gated — only the number of quotes.
 */
export function AllowanceBanner({ allowance }: { allowance: QuoteAllowance }) {
  if (allowance.limit === null && allowance.canQuote) {
    return (
      <p className="badge w-fit bg-brand-soft text-brand-ink">
        Contractor Pro · unlimited quotes
      </p>
    );
  }

  if (!allowance.canQuote) {
    return (
      <div className="rounded-md bg-clay-soft px-4 py-3 text-sm text-clay">
        <p className="font-medium">
          {allowance.reason === 'past_due'
            ? 'Quoting paused'
            : allowance.reason === 'not_approved'
              ? 'Awaiting approval'
              : 'Free quotes used up'}
        </p>
        <p className="mt-1">{allowanceMessage(allowance)}</p>
      </div>
    );
  }

  return (
    <p className="badge w-fit bg-gold-soft text-gold">
      {allowance.remaining} of {allowance.limit} free quotes left
    </p>
  );
}
