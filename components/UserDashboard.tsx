'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  acceptQuote,
  deleteJob,
  listJobsForUser,
  publishJob,
} from '@/shared/data';
import type { JobOwnerView } from '@/shared/types';
import { ConfirmDialog } from './ConfirmDialog';
import { OwnerJobDetail } from './OwnerJobDetail';
import { useRequiredSession } from './SessionProvider';
import { Illustration } from './ui/Field';

type Pending =
  | { kind: 'accept'; jobId: string; quoteId: string }
  | { kind: 'delete'; jobId: string }
  | null;

/** The homeowner's jobs. No pricing, upsell or billing UI ever appears here. */
export function UserDashboard() {
  const { session, revision, refresh } = useRequiredSession();
  const [jobs, setJobs] = useState<JobOwnerView[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState<Pending>(null);

  useEffect(() => {
    let live = true;
    listJobsForUser(session)
      .then((list) => live && setJobs(list))
      .catch((e) => live && setError(e.message));
    return () => {
      live = false;
    };
  }, [session, revision]);

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

  const counts = {
    open: jobs?.filter((j) => j.status === 'open').length ?? 0,
    accepted: jobs?.filter((j) => j.status === 'accepted').length ?? 0,
    draft: jobs?.filter((j) => j.status === 'draft').length ?? 0,
  };

  const summary = [
    `${counts.open} open`,
    counts.draft > 0 ? `${counts.draft} draft` : null,
    `${counts.accepted} accepted`,
    'posting is always free',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="px-6 pb-16 pt-8 sm:px-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-[-0.02em]">
            Your jobs
          </h1>
          <p className="mt-1 text-[13.5px] text-ink-500">
            {jobs === null ? 'Loading…' : summary}
          </p>
        </div>
        <Link href="/jobs/new" className="btn-pill-dark">
          + Post a new job
        </Link>
      </div>

      {error && (
        <p className="mt-5 rounded-md border border-accent-edge bg-orange-50 px-4 py-3 text-[13px] font-semibold text-danger-text">
          {error}
        </p>
      )}

      {jobs === null ? (
        <div className="mt-6 h-32 animate-pulse rounded-lg bg-rule" />
      ) : jobs.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-lg border border-line bg-canvas px-6 py-16 text-center">
          <Illustration src="/illustrations/step-post.png" size={140} />
          <p className="mt-4 text-[15px] text-ink-500">
            No jobs yet. Posting one takes about two minutes.
          </p>
          <Link href="/jobs/new" className="btn-primary mt-5">
            Post a job
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {jobs.map((job) => (
            <OwnerJobDetail
              key={job.id}
              job={job}
              busy={busy}
              onAccept={(jobId, quoteId) =>
                setPending({ kind: 'accept', jobId, quoteId })
              }
              onDelete={(jobId) => setPending({ kind: 'delete', jobId })}
              onPublish={(jobId) => run(() => publishJob(session, jobId))}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={pending?.kind === 'accept'}
        title="Accept this quote?"
        body="This locks in that contractor and shares your exact address and contact details with them. The job closes to other quotes and can no longer be edited."
        confirmLabel="Accept quote"
        busy={busy}
        onCancel={() => setPending(null)}
        onConfirm={() =>
          pending?.kind === 'accept' &&
          run(() => acceptQuote(session, pending.jobId, pending.quoteId))
        }
      />

      <ConfirmDialog
        open={pending?.kind === 'delete'}
        title="Delete this job?"
        body="The job and any quotes on it are removed. This cannot be undone."
        confirmLabel="Delete job"
        busy={busy}
        onCancel={() => setPending(null)}
        onConfirm={() =>
          pending?.kind === 'delete' &&
          run(() => deleteJob(session, pending.jobId))
        }
      />
    </div>
  );
}
