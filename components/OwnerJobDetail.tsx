'use client';

import Link from 'next/link';
import {
  formatPrice,
  formatRelative,
  JOB_TYPE_LABELS,
  TIMEFRAME_SHORT,
} from '@/shared/format';
import type { JobOwnerView } from '@/shared/types';
import { JobPhoto } from './JobPhoto';
import { QuoteRow } from './QuoteRow';
import { StatusTag } from './StatusBadge';

/**
 * One of the homeowner's jobs: header row, then the quotes it has collected.
 *
 * Accepting is irreversible, so Edit and Delete disappear the moment a job is
 * matched and a `Locked — view only` control takes their place.
 */
export function OwnerJobDetail({
  job,
  busy,
  onAccept,
  onDelete,
  onPublish,
}: {
  job: JobOwnerView;
  busy: boolean;
  onAccept: (jobId: string, quoteId: string) => void;
  onDelete: (jobId: string) => void;
  onPublish: (jobId: string) => void;
}) {
  const accepted = job.quotes.find((q) => q.id === job.acceptedQuoteId);
  const winner = accepted?.contractorCompany || accepted?.contractorName;

  const meta = [
    JOB_TYPE_LABELS[job.type],
    TIMEFRAME_SHORT[job.timeframe],
    `posted ${formatRelative(job.createdAt)}`,
    accepted
      ? `${winner} · ${formatPrice(accepted.priceCents)} · address shared with contractor`
      : `${job.quotes.length} ${job.quotes.length === 1 ? 'quote' : 'quotes'}`,
  ].join(' · ');

  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <div
        className={`flex flex-wrap items-center gap-5 px-6 py-[22px] ${
          job.quotes.length > 0 && job.editable ? 'bg-surface-alt' : ''
        }`}
      >
        <JobPhoto
          src={job.photos[0]}
          alt={job.title}
          sizes="84px"
          caption="No photo"
          className="h-16 w-[84px] flex-none rounded-[11px]"
        />

        <div className="min-w-[200px] flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={`/jobs/${job.id}`}
              className="text-[17px] font-bold transition-colors duration-150 hover:text-orange-500"
            >
              {job.title}
            </Link>
            <StatusTag status={job.status} />
          </div>
          <p className="mt-1 text-[13px] text-ink-500">{meta}</p>
        </div>

        {job.editable ? (
          <div className="flex flex-wrap gap-2">
            {job.status === 'draft' && (
              <button
                onClick={() => onPublish(job.id)}
                disabled={busy}
                className="btn-small"
              >
                Publish
              </button>
            )}
            <Link href={`/jobs/${job.id}`} className="btn-small">
              Open
            </Link>
            <Link href={`/jobs/new?edit=${job.id}`} className="btn-small">
              Edit
            </Link>
            <button
              onClick={() => onDelete(job.id)}
              disabled={busy}
              className="btn-small"
            >
              Delete
            </button>
          </div>
        ) : (
          <span className="rounded-sm border border-line-strong px-4 py-2.5 text-[13px] font-semibold text-ink-400">
            Locked — view only
          </span>
        )}
      </div>

      {job.quotes.length > 0 && (
        <div className="px-6 pb-[22px] pt-2">
          <p className="label pb-1 pt-3.5">Quotes received</p>
          {job.quotes.map((quote) => (
            <QuoteRow
              key={quote.id}
              quote={quote}
              acceptable={job.editable}
              busy={busy}
              onAccept={(quoteId) => onAccept(job.id, quoteId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
