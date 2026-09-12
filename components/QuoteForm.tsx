'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatPrice } from '@/shared/format';
import type { QuoteAllowance, QuoteView } from '@/shared/types';
import { QuoteMeter } from './AllowanceBanner';
import { QuoteStatusBadge } from './StatusBadge';
import { ErrorText, Label, PriceInput, Textarea } from './ui/Field';

/**
 * The sticky quote panel.
 *
 * When the free allowance is spent the send button is replaced by the upgrade
 * CTA rather than left disabled behind an error — the meter always shows the
 * current state either way.
 */
export function QuoteForm({
  allowance,
  myQuote,
  jobOpen,
  busy,
  onSubmit,
  onWithdraw,
}: {
  allowance: QuoteAllowance;
  myQuote?: QuoteView;
  jobOpen: boolean;
  busy: boolean;
  onSubmit: (priceCents: number, message: string) => void;
  onWithdraw: (quoteId: string) => void;
}) {
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const dollars = Number(price.replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(dollars) || dollars <= 0) {
      setError('Enter a price.');
      return;
    }
    setError('');
    onSubmit(Math.round(dollars * 100), message.trim());
  }

  if (myQuote) {
    return (
      <Panel title="Your quote" sub="The homeowner sees your price, message and profile.">
        <div className="mt-5 flex items-baseline justify-between">
          <p className="text-[26px] font-extrabold">
            {formatPrice(myQuote.priceCents)}
          </p>
          <QuoteStatusBadge status={myQuote.status} />
        </div>
        {myQuote.message && (
          <p className="mt-3 text-[13.5px] leading-[1.5] text-ink-700">
            {myQuote.message}
          </p>
        )}
        {myQuote.status === 'pending' && jobOpen && (
          <button
            onClick={() => onWithdraw(myQuote.id)}
            disabled={busy}
            className="btn-secondary mt-5 w-full"
          >
            Withdraw quote
          </button>
        )}
        <div className="mt-4">
          <QuoteMeter allowance={allowance} />
        </div>
      </Panel>
    );
  }

  if (!jobOpen) {
    return (
      <Panel title="Quoting closed" sub="This job is no longer taking quotes.">
        <div className="mt-4">
          <QuoteMeter allowance={allowance} />
        </div>
      </Panel>
    );
  }

  const exhausted = allowance.reason === 'free_quotes_exhausted';

  return (
    <Panel
      title="Submit your quote"
      sub="The homeowner sees your price, message and profile."
    >
      <form onSubmit={submit}>
        <div className="mt-[22px]">
          <Label htmlFor="quote-price">Your price</Label>
          <PriceInput
            id="quote-price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="1,450"
            inputMode="decimal"
            disabled={!allowance.canQuote}
            invalid={Boolean(error)}
          />
        </div>

        <div className="mt-[18px]">
          <Label htmlFor="quote-message">Message</Label>
          <Textarea
            id="quote-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="h-[120px] leading-[1.5]"
            placeholder="What the price covers, and when you could start."
            disabled={!allowance.canQuote}
          />
        </div>

        {error && <ErrorText>{error}</ErrorText>}

        {allowance.canQuote ? (
          <button
            type="submit"
            disabled={busy}
            className="btn-primary mt-[18px] w-full"
          >
            {busy ? 'Sending…' : 'Send quote'}
          </button>
        ) : exhausted ? (
          <Link href="/pricing" className="btn-primary mt-[18px] w-full">
            Go unlimited — $20/mo
          </Link>
        ) : (
          <p className="mt-[18px] rounded-md border border-accent-edge bg-orange-50 px-4 py-3 text-[13px] font-semibold text-accent-ink">
            {allowance.reason === 'past_due'
              ? 'Payment past due — quoting is paused.'
              : 'Quoting is unavailable on this account.'}
          </p>
        )}
      </form>

      <div className="mt-3.5">
        <QuoteMeter allowance={allowance} />
      </div>

      {allowance.limit !== null && (
        <Link
          href="/pricing"
          className="mt-2.5 block text-[12.5px] font-bold text-orange-500 transition-colors duration-150 hover:text-orange-600"
        >
          Go unlimited for $20/mo ↗
        </Link>
      )}
    </Panel>
  );
}

function Panel({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-line bg-canvas p-6 shadow-card lg:sticky lg:top-24">
      <h2 className="text-lg font-extrabold tracking-[-0.01em]">{title}</h2>
      <p className="mt-1 text-[13px] text-ink-500">{sub}</p>
      {children}
    </div>
  );
}
