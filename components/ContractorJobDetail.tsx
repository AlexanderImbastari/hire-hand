'use client';

import {
  formatDate,
  formatPrice,
  JOB_TYPE_LABELS,
  TIMEFRAME_LABELS,
} from '@/shared/format';
import type { JobPublicView, QuoteAllowance } from '@/shared/types';
import { AllowanceBanner } from './AllowanceBanner';
import { QuoteForm } from './QuoteForm';
import { JobStatusBadge, QuoteStatusBadge } from './StatusBadge';

interface Props {
  job: JobPublicView;
  allowance: QuoteAllowance;
  busy: boolean;
  onBack: () => void;
  onQuote: (priceCents: number, message: string) => void;
  onWithdraw: (quoteId: string) => void;
}

export function ContractorJobDetail({
  job,
  allowance,
  busy,
  onBack,
  onQuote,
  onWithdraw,
}: Props) {
  const canStillQuote = job.status === 'open' && !job.myQuote;

  return (
    <div className="grid gap-6">
      <button className="btn-ghost w-fit px-0 text-sm" onClick={onBack}>
        ← Back
      </button>

      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="meta text-xs uppercase tracking-wide">
              {JOB_TYPE_LABELS[job.type]}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {job.title}
            </h1>
          </div>
          <JobStatusBadge status={job.status} />
        </div>

        <p className="mt-4 whitespace-pre-line">{job.description}</p>

        <dl className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-3">
          <div>
            <dt className="label">Timeframe</dt>
            <dd className="text-sm">{TIMEFRAME_LABELS[job.timeframe]}</dd>
          </div>
          <div>
            <dt className="label">Location</dt>
            <dd className="text-sm">
              {job.city}, {job.zip}
              {!job.exactLocation && (
                <span className="meta block text-xs">
                  Exact address shared once your quote is accepted
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="label">Posted</dt>
            <dd className="text-sm">{formatDate(job.createdAt)}</dd>
          </div>
        </dl>

        {job.photos.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-3">
            {job.photos.map((src, i) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={i}
                src={src}
                alt={`Job photo ${i + 1}`}
                className="h-28 w-40 rounded-md border border-line object-cover"
              />
            ))}
          </div>
        )}
      </div>

      {/* Only present when this contractor won the job — the data layer omits
          the field entirely otherwise. */}
      {job.exactLocation && (
        <div className="card border-brand p-6">
          <h2 className="font-semibold">You won this job</h2>
          <p className="meta mt-1">
            The homeowner accepted your quote, so their address and contact
            details are unlocked.
          </p>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="label">Address</dt>
              <dd className="text-sm">
                {job.exactLocation.street}
                <br />
                {job.exactLocation.city}, {job.exactLocation.zip}
              </dd>
            </div>
            <div>
              <dt className="label">Contact</dt>
              <dd className="text-sm">
                {job.exactLocation.contactName}
                <br />
                {job.exactLocation.contactPhone}
                <br />
                {job.exactLocation.contactEmail}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {job.myQuote && (
        <div className="card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">Your quote</h2>
              <p className="meta mt-0.5">
                Sent {formatDate(job.myQuote.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">
                {formatPrice(job.myQuote.priceCents)}
              </p>
              <QuoteStatusBadge status={job.myQuote.status} />
            </div>
          </div>
          <p className="mt-3 whitespace-pre-line text-sm">
            {job.myQuote.message}
          </p>
          {job.status === 'open' && job.myQuote.status === 'pending' && (
            <button
              className="btn-danger mt-4"
              disabled={busy}
              onClick={() => onWithdraw(job.myQuote!.id)}
            >
              Withdraw quote
            </button>
          )}
          <p className="meta mt-3 text-xs">
            Other contractors&rsquo; prices on this job are never shown to you.
          </p>
        </div>
      )}

      {canStillQuote && (
        <div className="grid gap-3">
          <AllowanceBanner allowance={allowance} />
          {allowance.canQuote && <QuoteForm busy={busy} onSubmit={onQuote} />}
        </div>
      )}

      {job.status !== 'open' && !job.exactLocation && (
        <p className="card p-5 meta">
          This job is no longer open for quotes.
        </p>
      )}
    </div>
  );
}
