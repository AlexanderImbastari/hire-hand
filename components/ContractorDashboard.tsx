'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  getQuoteAllowance,
  listMatchedJobsForContractor,
  listOpenJobsForContractor,
} from '@/shared/data';
import { JOB_TYPE_LABELS, TIMEFRAME_SHORT } from '@/shared/format';
import {
  JOB_TYPES,
  TIMEFRAMES,
  type Contractor,
  type JobPublicView,
  type JobType,
  type QuoteAllowance,
  type Timeframe,
} from '@/shared/types';
import { AllowanceBanner, AllowanceCard } from './AllowanceBanner';
import { JobCard, JobCardSkeleton } from './JobCard';
import { useRequiredSession } from './SessionProvider';
import { Illustration } from './ui/Field';

type Sort = 'newest' | 'oldest';

/**
 * Contractor browse: filters on the left, results on the right.
 *
 * The data layer has already narrowed to this contractor's trades and service
 * area; the sidebar narrows further, client-side, per the README's state notes.
 */
export function ContractorDashboard({ contractor }: { contractor: Contractor }) {
  const { session, revision } = useRequiredSession();
  const [openJobs, setOpenJobs] = useState<JobPublicView[] | null>(null);
  const [matchedCount, setMatchedCount] = useState(0);
  const [allowance, setAllowance] = useState<QuoteAllowance | null>(null);
  const [error, setError] = useState('');

  const [types, setTypes] = useState<JobType[]>([]);
  const [timeframes, setTimeframes] = useState<Timeframe[]>([]);
  const [sort, setSort] = useState<Sort>('newest');

  useEffect(() => {
    let live = true;
    Promise.all([
      listOpenJobsForContractor(session),
      listMatchedJobsForContractor(session),
      getQuoteAllowance(session),
    ])
      .then(([open, mine, quota]) => {
        if (!live) return;
        setError('');
        setOpenJobs(open);
        setMatchedCount(mine.length);
        setAllowance(quota);
      })
      .catch((e) => live && setError(e.message));
    return () => {
      live = false;
    };
  }, [session, revision]);

  const results = useMemo(() => {
    const list = (openJobs ?? []).filter(
      (j) =>
        (types.length === 0 || types.includes(j.type)) &&
        (timeframes.length === 0 || timeframes.includes(j.timeframe)),
    );
    return list.sort((a, b) =>
      sort === 'newest'
        ? b.createdAt.localeCompare(a.createdAt)
        : a.createdAt.localeCompare(b.createdAt),
    );
  }, [openJobs, types, timeframes, sort]);

  function toggle<T>(list: T[], value: T): T[] {
    return list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];
  }

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Filters */}
      <aside className="shrink-0 border-b border-line bg-surface-alt px-6 py-7 lg:w-[280px] lg:border-b-0 lg:border-r xl:w-[280px]">
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-ink-400">
          Filters
        </p>

        <p className="mt-5 text-[13px] font-bold">Job type</p>
        <div className="mt-2.5 flex flex-col gap-2">
          {JOB_TYPES.map((t) => {
            const on = types.includes(t);
            const offered = contractor.jobTypes.includes(t);
            return (
              <label
                key={t}
                className={`flex items-center gap-2.5 text-sm ${
                  offered
                    ? 'cursor-pointer text-ink-700'
                    : 'cursor-not-allowed text-ink-400'
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={on}
                  disabled={!offered}
                  onChange={() => setTypes((prev) => toggle(prev, t))}
                />
                <span
                  aria-hidden
                  className={`size-4 rounded-[5px] ${
                    on ? 'bg-orange-500' : 'border border-line-strong'
                  }`}
                />
                {JOB_TYPE_LABELS[t]}
                {!offered && (
                  <span className="text-[11px] text-ink-400">not your trade</span>
                )}
              </label>
            );
          })}
        </div>

        <div className="my-5 h-px bg-line" />

        <p className="text-[13px] font-bold">Service area</p>
        <p className="mt-2.5 rounded-[10px] border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink-700">
          {contractor.serviceZips.join(' · ')}
        </p>

        <div className="my-5 h-px bg-line" />

        <p className="text-[13px] font-bold">Timeframe</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {TIMEFRAMES.map((tf) => {
            const on = timeframes.includes(tf);
            return (
              <button
                key={tf}
                onClick={() => setTimeframes((prev) => toggle(prev, tf))}
                aria-pressed={on}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-[12.5px] font-semibold transition-colors duration-150 ${
                  on
                    ? 'bg-ink-900 text-white'
                    : 'border border-line bg-canvas text-ink-700 hover:border-ink-900'
                }`}
              >
                {TIMEFRAME_SHORT[tf]}
              </button>
            );
          })}
        </div>

        {allowance && <AllowanceCard allowance={allowance} />}
      </aside>

      {/* Results */}
      <section className="flex-1 px-6 py-7 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-extrabold tracking-[-0.02em]">
              Open jobs near you
            </h1>
            <p className="mt-1 text-[13.5px] text-ink-500">
              {openJobs === null
                ? 'Loading…'
                : `${results.length} ${results.length === 1 ? 'job' : 'jobs'} in ${contractor.serviceZips.join(', ')}`}
              {matchedCount > 0 && ` · you have quoted on ${matchedCount}`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSort((s) => (s === 'newest' ? 'oldest' : 'newest'))}
              className="btn-small"
            >
              {sort === 'newest' ? 'Newest' : 'Oldest'} ⌄
            </button>
          </div>
        </div>

        {allowance && <div className="mt-5"><AllowanceBanner allowance={allowance} /></div>}

        {error && (
          <p className="mt-5 rounded-md border border-accent-edge bg-orange-50 px-4 py-3 text-[13px] font-semibold text-danger-text">
            {error}
          </p>
        )}

        <div className="mt-[22px] grid gap-4 sm:grid-cols-2">
          {openJobs === null ? (
            <>
              <JobCardSkeleton />
              <JobCardSkeleton />
            </>
          ) : (
            results.map((job) => <JobCard key={job.id} job={job} />)
          )}
        </div>

        {openJobs !== null && results.length === 0 && (
          <div className="mt-[22px] flex flex-col items-center rounded-lg border border-line bg-canvas px-6 py-14 text-center">
            <Illustration src="/illustrations/step-quotes.png" size={140} />
            <p className="mt-4 text-[15px] text-ink-500">
              {openJobs.length === 0
                ? `Nothing open in ${contractor.serviceZips.join(' or ')} right now.`
                : 'No jobs match those filters.'}
            </p>
            {openJobs.length > 0 && (
              <button
                onClick={() => {
                  setTypes([]);
                  setTimeframes([]);
                }}
                className="btn-primary mt-5"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

      </section>
    </div>
  );
}
