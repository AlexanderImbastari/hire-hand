'use client';

import { formatPrice, formatRelative } from '@/shared/format';
import type { QuoteView } from '@/shared/types';
import { QuoteStatusBadge } from './StatusBadge';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * A quote as the homeowner sees it.
 *
 * The design puts a star rating under the price; there is no rating in the
 * domain, so the slot carries the quote's age instead rather than inventing a
 * number. Add it here when contractor reviews land.
 */
export function QuoteRow({
  quote,
  acceptable,
  busy,
  onAccept,
}: {
  quote: QuoteView;
  acceptable: boolean;
  busy: boolean;
  onAccept: (quoteId: string) => void;
}) {
  const name = quote.contractorCompany || quote.contractorName;

  return (
    <div className="flex flex-wrap items-center gap-4 border-t border-rule py-4">
      <span
        aria-hidden
        className="flex size-[42px] flex-none items-center justify-center rounded-full bg-rule text-sm font-extrabold text-ink-700"
      >
        {initials(name)}
      </span>

      <div className="min-w-[180px] flex-1">
        <p className="text-[15px] font-bold">{name}</p>
        {quote.message && (
          <p className="mt-0.5 text-[13px] leading-[1.5] text-ink-500">
            {quote.message}
          </p>
        )}
      </div>

      <div className="text-right">
        <p className="text-[19px] font-extrabold">
          {formatPrice(quote.priceCents)}
        </p>
        <p className="text-[11.5px] text-ink-400">
          {formatRelative(quote.createdAt)}
        </p>
      </div>

      {acceptable && quote.status === 'pending' ? (
        <button
          onClick={() => onAccept(quote.id)}
          disabled={busy}
          className="cursor-pointer rounded-sm bg-orange-500 px-[18px] py-2.5 text-[13px] font-bold text-white transition-colors duration-150 hover:bg-orange-600 disabled:pointer-events-none disabled:bg-disabled disabled:text-ink-400"
        >
          Accept
        </button>
      ) : (
        <QuoteStatusBadge status={quote.status} />
      )}
    </div>
  );
}
