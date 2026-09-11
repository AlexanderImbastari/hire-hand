'use client';

import { formatDate, formatPrice, JOB_TYPE_LABELS, TIMEFRAME_LABELS } from '@/shared/format';
import type { JobOwnerView } from '@/shared/types';
import { JobStatusBadge, QuoteStatusBadge } from './StatusBadge';

interface Props {
  job: JobOwnerView;
  busy: boolean;
  onBack: () => void;
  onEdit: () => void;
  onPublish: () => void;
  onCancelJob: () => void;
  onComplete: () => void;
  onDelete: () => void;
  onAccept: (quoteId: string) => void;
}

export function OwnerJobDetail({
  job,
  busy,
  onBack,
  onEdit,
  onPublish,
  onCancelJob,
  onComplete,
  onDelete,
  onAccept,
}: Props) {
  const winner = job.quotes.find((q) => q.id === job.acceptedQuoteId);

  return (
    <div className="grid gap-6">
      <button className="btn-ghost w-fit px-0 text-sm" onClick={onBack}>
        ← All jobs
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
            <dt className="label">Address</dt>
            <dd className="text-sm">
              {job.street}
              <br />
              {job.city}, {job.zip}
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

        <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-5">
          {job.editable ? (
            <>
              <button className="btn-secondary" disabled={busy} onClick={onEdit}>
                Edit
              </button>
              {job.status === 'draft' && (
                <button
                  className="btn-primary"
                  disabled={busy}
                  onClick={onPublish}
                >
                  Publish to contractors
                </button>
              )}
              {job.status === 'open' && (
                <button
                  className="btn-secondary"
                  disabled={busy}
                  onClick={onCancelJob}
                >
                  Cancel job
                </button>
              )}
              <button className="btn-danger" disabled={busy} onClick={onDelete}>
                Delete
              </button>
            </>
          ) : (
            <p className="meta">
              {job.status === 'accepted'
                ? 'This job is matched, so it is locked — no more edits to the job or its quotes.'
                : 'This job is closed and can no longer be edited.'}
            </p>
          )}
          {job.status === 'accepted' && (
            <button className="btn-primary" disabled={busy} onClick={onComplete}>
              Mark complete
            </button>
          )}
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            Quotes ({job.quotes.length})
          </h2>
          {job.status === 'open' && job.quotes.length > 0 && (
            <p className="meta text-xs">Lowest first</p>
          )}
        </div>

        {job.status === 'draft' && (
          <p className="card p-5 meta">
            This job is a draft — no contractor can see it yet. Publish it to
            start receiving quotes.
          </p>
        )}

        {job.status !== 'draft' && job.quotes.length === 0 && (
          <p className="card p-5 meta">
            No quotes yet. Contractors working in {job.zip} will see this job.
          </p>
        )}

        <div className="grid gap-3">
          {job.quotes.map((quote) => {
            const isWinner = quote.id === job.acceptedQuoteId;
            return (
              <article
                key={quote.id}
                className={`card p-5 ${isWinner ? 'border-brand' : ''}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{quote.contractorCompany}</p>
                    <p className="meta">{quote.contractorName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      {formatPrice(quote.priceCents)}
                    </p>
                    <QuoteStatusBadge status={quote.status} />
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm">
                  {quote.message}
                </p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="meta text-xs">
                    Quoted {formatDate(quote.createdAt)}
                  </p>
                  {job.status === 'open' && quote.status === 'pending' && (
                    <button
                      className="btn-primary"
                      disabled={busy}
                      onClick={() => onAccept(quote.id)}
                    >
                      Accept this quote
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {winner && (
          <p className="mt-4 rounded-md bg-brand-soft p-4 text-sm text-brand-ink">
            {winner.contractorName} at {winner.contractorCompany} now has your
            address and contact details, and will be in touch. The job is locked
            for both of you.
          </p>
        )}
      </section>
    </div>
  );
}
