'use client';

import Link from 'next/link';
import { formatRelative, TIMEFRAME_LABELS } from '@/shared/format';
import type { JobPublicView, QuoteAllowance } from '@/shared/types';
import { JobPhoto } from './JobPhoto';
import { QuoteForm } from './QuoteForm';
import { JobTypeTag, StatusTag } from './StatusBadge';

/**
 * Contractor-facing job detail.
 *
 * Browsing is never gated: full detail and every photo, no blur and no overlay.
 * The exact address and contact details are absent from `JobPublicView`
 * entirely until this contractor wins the job — they are not rendered and
 * hidden, there is nothing to render.
 */
export function ContractorJobDetail({
  job,
  allowance,
  busy,
  onQuote,
  onWithdraw,
}: {
  job: JobPublicView;
  allowance: QuoteAllowance;
  busy: boolean;
  onQuote: (priceCents: number, message: string) => void;
  onWithdraw: (quoteId: string) => void;
}) {
  const [lead, ...rest] = job.photos;

  return (
    <div className="px-6 pb-16 pt-7 sm:px-12">
      <Link
        href="/jobs"
        className="text-[13px] font-semibold text-ink-500 transition-colors duration-150 hover:text-ink-900"
      >
        ← Back to open jobs
      </Link>

      <div className="mt-[18px] grid gap-8 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_400px]">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <JobTypeTag type={job.type} />
            <StatusTag status={job.status} />
            <span className="text-[12.5px] text-ink-400">
              Posted {formatRelative(job.createdAt)}
            </span>
          </div>

          <h1 className="mt-3.5 text-[28px] font-extrabold tracking-[-0.025em] sm:text-[34px]">
            {job.title}
          </h1>

          {/* One large photo, the rest stacked beside it. */}
          <div
            className={`mt-5 grid h-[300px] grid-cols-1 gap-2.5 ${
              rest.length > 0 ? 'sm:grid-cols-[2fr_1fr]' : ''
            }`}
          >
            <JobPhoto
              src={lead}
              alt={job.title}
              sizes="(max-width: 640px) 100vw, 600px"
              caption="No photo provided"
              priority
              className="h-full w-full rounded-[14px]"
            />
            {rest.length > 0 && (
              <div
                className={`hidden gap-2.5 sm:grid ${
                  rest.length === 1 ? 'grid-rows-1' : 'grid-rows-2'
                }`}
              >
                {rest.slice(0, 2).map((src, i) => (
                  <JobPhoto
                    key={src}
                    src={src}
                    alt={`${job.title} — photo ${i + 2}`}
                    sizes="300px"
                    className="h-full w-full rounded-[14px]"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Stat label="Timeframe" value={TIMEFRAME_LABELS[job.timeframe]} />
            <Stat label="Location" value={`${job.city} ${job.zip}`} />
            <Stat
              label="Quotes so far"
              value={`${job.quoteCount} submitted`}
            />
          </div>

          <h2 className="mt-[30px] text-lg font-bold">Job description</h2>
          <p className="mt-2.5 max-w-[680px] text-[15px] leading-[1.65] text-ink-700">
            {job.description}
          </p>

          {job.exactLocation ? (
            <div className="mt-[22px] rounded-[13px] border border-line bg-surface-alt p-[18px]">
              <p className="label mb-3">Address and contact — unlocked for you</p>
              <p className="text-[15px] font-bold">{job.exactLocation.street}</p>
              <p className="text-[13.5px] text-ink-500">
                {job.exactLocation.city} {job.exactLocation.zip}
              </p>
              <p className="mt-3 text-[13.5px] text-ink-700">
                {job.exactLocation.contactName} ·{' '}
                <a
                  href={`tel:${job.exactLocation.contactPhone}`}
                  className="font-semibold text-orange-500 hover:text-orange-600"
                >
                  {job.exactLocation.contactPhone}
                </a>{' '}
                ·{' '}
                <a
                  href={`mailto:${job.exactLocation.contactEmail}`}
                  className="font-semibold text-orange-500 hover:text-orange-600"
                >
                  {job.exactLocation.contactEmail}
                </a>
              </p>
            </div>
          ) : (
            <div className="mt-[22px] flex items-center gap-3 rounded-[13px] border border-dashed border-line-strong bg-surface-alt px-[18px] py-4">
              <span aria-hidden className="text-base">
                🔒
              </span>
              <p className="text-[13.5px] leading-[1.5] text-ink-500">
                Exact address and contact details unlock for you the moment this
                homeowner accepts your quote. Free and Pro contractors alike.
              </p>
            </div>
          )}
        </div>

        <div>
          <QuoteForm
            allowance={allowance}
            myQuote={job.myQuote}
            jobOpen={job.status === 'open'}
            busy={busy}
            onSubmit={onQuote}
            onWithdraw={onWithdraw}
          />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[13px] border border-line p-4">
      <p className="label mb-0">{label}</p>
      <p className="mt-1.5 text-[15px] font-bold">{value}</p>
    </div>
  );
}
