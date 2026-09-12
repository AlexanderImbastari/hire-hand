'use client';

import Link from 'next/link';
import { use, useCallback, useEffect, useState } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { JobPhoto } from '@/components/JobPhoto';
import { QuoteRow } from '@/components/QuoteRow';
import { useRequiredSession } from '@/components/SessionProvider';
import { JobTypeTag, StatusTag } from '@/components/StatusBadge';
import {
  acceptQuote,
  cancelJob,
  completeJob,
  deleteJob,
  getJobForOwner,
  publishJob,
} from '@/shared/data';
import {
  formatRelative,
  TIMEFRAME_LABELS,
} from '@/shared/format';
import type { JobOwnerView } from '@/shared/types';

type Pending =
  | { kind: 'accept'; quoteId: string }
  | { kind: 'delete' }
  | { kind: 'cancel' }
  | null;

/**
 * A homeowner's own job: everything about it, plus every quote received.
 *
 * The owner is the one viewer who sees the exact address on their own job, so
 * this renders it plainly — there is nothing to redact from yourself.
 */
export default function OwnerJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { session, revision, refresh } = useRequiredSession();
  const [job, setJob] = useState<JobOwnerView | null>(null);
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState<Pending>(null);

  useEffect(() => {
    let live = true;
    getJobForOwner(session, id)
      .then((j) => live && setJob(j))
      .catch(() => live && setMissing(true));
    return () => {
      live = false;
    };
  }, [session, revision, id]);

  const run = useCallback(
    async (fn: () => Promise<unknown>) => {
      setBusy(true);
      setError('');
      try {
        await fn();
        refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setBusy(false);
        setPending(null);
      }
    },
    [refresh],
  );

  if (missing) {
    return (
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="text-[26px] font-extrabold tracking-[-0.02em]">
          That job isn&rsquo;t here
        </h1>
        <p className="mt-3 text-[15px] leading-[1.6] text-ink-500">
          It may have been deleted, or it belongs to someone else.
        </p>
        <Link href="/jobs" className="btn-primary mt-7">
          Back to your jobs
        </Link>
      </main>
    );
  }

  if (!job) {
    return (
      <div className="px-6 pb-16 pt-7 sm:px-12">
        <div className="h-4 w-40 animate-pulse rounded bg-rule" />
        <div className="mt-6 h-9 w-2/3 animate-pulse rounded bg-rule" />
        <div className="mt-5 h-[300px] animate-pulse rounded-[14px] bg-rule" />
      </div>
    );
  }

  const [lead, ...rest] = job.photos;

  return (
    <div className="px-6 pb-16 pt-7 sm:px-12">
      <Link
        href="/jobs"
        className="text-[13px] font-semibold text-ink-500 transition-colors duration-150 hover:text-ink-900"
      >
        ← Back to your jobs
      </Link>

      <div className="mt-[18px] grid gap-8 lg:grid-cols-[1fr_340px]">
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
            <Stat label="Address" value={job.street} />
            <Stat
              label="Quotes received"
              value={`${job.quotes.length}`}
            />
          </div>

          <h2 className="mt-[30px] text-lg font-bold">Job description</h2>
          <p className="mt-2.5 max-w-[680px] text-[15px] leading-[1.65] text-ink-700">
            {job.description}
          </p>

          <div className="mt-[22px] rounded-[13px] border border-line bg-surface-alt p-[18px]">
            <p className="label mb-2">Who can see what</p>
            <p className="text-[13.5px] leading-[1.5] text-ink-500">
              Contractors browsing see {job.city} {job.zip} and nothing more.
              Your street address and contact details go to the one contractor
              whose quote you accept, at the moment you accept it.
            </p>
          </div>
        </div>

        {/* Quotes */}
        <div>
          <div className="rounded-lg border border-line bg-canvas p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-extrabold tracking-[-0.01em]">
              Quotes received
            </h2>
            <p className="mt-1 text-[13px] text-ink-500">
              {job.quotes.length === 0
                ? 'None yet. Contractors in your area will see this job.'
                : job.editable
                  ? 'Accepting one closes the job to the others.'
                  : 'This job is matched and can no longer be edited.'}
            </p>

            {job.quotes.length > 0 && (
              <div className="mt-2">
                {job.quotes.map((quote) => (
                  <QuoteRow
                    key={quote.id}
                    quote={quote}
                    acceptable={job.editable}
                    busy={busy}
                    onAccept={(quoteId) => setPending({ kind: 'accept', quoteId })}
                  />
                ))}
              </div>
            )}

            {error && (
              <p className="mt-4 rounded-md border border-accent-edge bg-orange-50 px-4 py-3 text-[13px] font-semibold text-danger-text">
                {error}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-5">
              {job.editable ? (
                <>
                  {job.status === 'draft' && (
                    <button
                      onClick={() => run(() => publishJob(session, job.id))}
                      disabled={busy}
                      className="btn-small"
                    >
                      Publish
                    </button>
                  )}
                  <Link href={`/jobs/new?edit=${job.id}`} className="btn-small">
                    Edit
                  </Link>
                  <button
                    onClick={() => setPending({ kind: 'cancel' })}
                    disabled={busy}
                    className="btn-small"
                  >
                    Cancel job
                  </button>
                  <button
                    onClick={() => setPending({ kind: 'delete' })}
                    disabled={busy}
                    className="btn-small"
                  >
                    Delete
                  </button>
                </>
              ) : job.status === 'accepted' ? (
                <button
                  onClick={() => run(() => completeJob(session, job.id))}
                  disabled={busy}
                  className="btn-primary w-full"
                >
                  Mark as completed
                </button>
              ) : (
                <span className="rounded-sm border border-line-strong px-4 py-2.5 text-[13px] font-semibold text-ink-400">
                  Locked — view only
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={pending?.kind === 'accept'}
        title="Accept this quote?"
        body="This locks in that contractor and shares your exact address and contact details with them. The job closes to other quotes and can no longer be edited."
        confirmLabel="Accept quote"
        busy={busy}
        onCancel={() => setPending(null)}
        onConfirm={() =>
          pending?.kind === 'accept' &&
          run(() => acceptQuote(session, job.id, pending.quoteId))
        }
      />

      <ConfirmDialog
        open={pending?.kind === 'cancel'}
        title="Cancel this job?"
        body="It stops being visible to contractors. Quotes already sent stay on the record, but the job cannot be reopened."
        confirmLabel="Cancel job"
        busy={busy}
        onCancel={() => setPending(null)}
        onConfirm={() => run(() => cancelJob(session, job.id))}
      />

      <ConfirmDialog
        open={pending?.kind === 'delete'}
        title="Delete this job?"
        body="The job and any quotes on it are removed. This cannot be undone."
        confirmLabel="Delete job"
        busy={busy}
        onCancel={() => setPending(null)}
        onConfirm={() => run(() => deleteJob(session, job.id))}
      />
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
