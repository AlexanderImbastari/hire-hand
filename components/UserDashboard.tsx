'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  acceptQuote,
  cancelJob,
  completeJob,
  createJob,
  deleteJob,
  listJobsForUser,
  publishJob,
  updateJob,
} from '@/shared/data';
import { formatDate, JOB_TYPE_LABELS, TIMEFRAME_LABELS } from '@/shared/format';
import type { JobInput, JobOwnerView } from '@/shared/types';
import { JobForm } from './JobForm';
import { OwnerJobDetail } from './OwnerJobDetail';
import { useRequiredSession } from './SessionProvider';
import { JobStatusBadge } from './StatusBadge';

type View =
  | { name: 'list' }
  | { name: 'create' }
  | { name: 'edit'; jobId: string }
  | { name: 'detail'; jobId: string };

export function UserDashboard() {
  const { session, revision, refresh } = useRequiredSession();
  const [jobs, setJobs] = useState<JobOwnerView[]>([]);
  const [view, setView] = useState<View>({ name: 'list' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    listJobsForUser(session).then(setJobs).catch((e) => setError(e.message));
  }, [session, revision]);

  /** Wrap a write so failures surface as a message instead of a blank screen. */
  const run = useCallback(
    async (fn: () => Promise<unknown>, after?: () => void) => {
      setBusy(true);
      setError('');
      try {
        await fn();
        after?.();
        refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setBusy(false);
      }
    },
    [refresh],
  );

  const selected =
    view.name === 'detail' || view.name === 'edit'
      ? jobs.find((j) => j.id === view.jobId)
      : undefined;

  if (view.name === 'create') {
    return (
      <>
        {error && <Banner message={error} />}
        <JobForm
          busy={busy}
          onCancel={() => setView({ name: 'list' })}
          onSubmit={(input: JobInput, publish) =>
            run(
              () => createJob(session, input, { publish }),
              () => setView({ name: 'list' }),
            )
          }
        />
      </>
    );
  }

  if (view.name === 'edit' && selected) {
    return (
      <>
        {error && <Banner message={error} />}
        <JobForm
          initial={selected}
          busy={busy}
          onCancel={() => setView({ name: 'detail', jobId: selected.id })}
          onSubmit={(input) =>
            run(
              () => updateJob(session, selected.id, input),
              () => setView({ name: 'detail', jobId: selected.id }),
            )
          }
        />
      </>
    );
  }

  if (view.name === 'detail' && selected) {
    return (
      <>
        {error && <Banner message={error} />}
        <OwnerJobDetail
          job={selected}
          busy={busy}
          onBack={() => setView({ name: 'list' })}
          onEdit={() => setView({ name: 'edit', jobId: selected.id })}
          onPublish={() => run(() => publishJob(session, selected.id))}
          onCancelJob={() => run(() => cancelJob(session, selected.id))}
          onComplete={() => run(() => completeJob(session, selected.id))}
          onDelete={() =>
            run(
              () => deleteJob(session, selected.id),
              () => setView({ name: 'list' }),
            )
          }
          onAccept={(quoteId) =>
            run(() => acceptQuote(session, selected.id, quoteId))
          }
        />
      </>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your jobs</h1>
          <p className="meta mt-1">
            Post what you need done and pick the quote you like.
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setView({ name: 'create' })}
        >
          + Post a job
        </button>
      </div>

      {error && <Banner message={error} />}

      {jobs.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-medium">No jobs yet</p>
          <p className="meta mx-auto mt-2 max-w-sm">
            Post your first job and contractors working in your area will be
            able to quote on it.
          </p>
          <button
            className="btn-primary mt-5"
            onClick={() => setView({ name: 'create' })}
          >
            Post a job
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {jobs.map((job) => {
            const pending = job.quotes.filter(
              (q) => q.status === 'pending',
            ).length;
            return (
              <button
                key={job.id}
                onClick={() => setView({ name: 'detail', jobId: job.id })}
                className="card p-5 text-left transition-colors hover:border-brand"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="meta text-xs uppercase tracking-wide">
                      {JOB_TYPE_LABELS[job.type]} · {job.city}, {job.zip}
                    </p>
                    <p className="mt-1 font-medium">{job.title}</p>
                  </div>
                  <JobStatusBadge status={job.status} />
                </div>
                <div className="meta mt-3 flex flex-wrap gap-x-4 text-xs">
                  <span>{TIMEFRAME_LABELS[job.timeframe]}</span>
                  <span>Posted {formatDate(job.createdAt)}</span>
                  <span>
                    {job.status === 'draft'
                      ? 'Not visible to contractors'
                      : `${job.quotes.length} quote${
                          job.quotes.length === 1 ? '' : 's'
                        }${pending ? ` · ${pending} awaiting you` : ''}`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Banner({ message }: { message: string }) {
  return (
    <p className="mb-4 rounded-md bg-clay-soft px-4 py-3 text-sm text-clay">
      {message}
    </p>
  );
}
