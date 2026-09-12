'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listMatchedJobsForContractor } from '@/shared/data';
import { formatPrice, formatRelative } from '@/shared/format';
import type { JobPublicView } from '@/shared/types';
import { JobPhoto } from './JobPhoto';
import { useRequiredSession } from './SessionProvider';
import { JobTypeTag, QuoteStatusBadge, StatusTag } from './StatusBadge';
import { Illustration } from './ui/Field';

/**
 * Every job this contractor has bid on, whatever became of it — including the
 * ones they won, which carry the unlocked address.
 */
export function ContractorQuotes() {
  const { session, revision } = useRequiredSession();
  const [jobs, setJobs] = useState<JobPublicView[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    listMatchedJobsForContractor(session)
      .then((list) => live && setJobs(list))
      .catch((e) => live && setError(e.message));
    return () => {
      live = false;
    };
  }, [session, revision]);

  const won = jobs?.filter((j) => j.myQuote?.status === 'accepted').length ?? 0;

  return (
    <div className="px-6 pb-16 pt-8 sm:px-12">
      <h1 className="text-[28px] font-extrabold tracking-[-0.02em]">
        Your quotes
      </h1>
      <p className="mt-1 text-[13.5px] text-ink-500">
        {jobs === null
          ? 'Loading…'
          : `${jobs.length} sent · ${won} won`}
      </p>

      {error && (
        <p className="mt-5 rounded-md border border-accent-edge bg-orange-50 px-4 py-3 text-[13px] font-semibold text-danger-text">
          {error}
        </p>
      )}

      {jobs === null ? (
        <div className="mt-6 h-28 animate-pulse rounded-lg bg-rule" />
      ) : jobs.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-lg border border-line bg-canvas px-6 py-16 text-center">
          <Illustration src="/illustrations/step-quotes.png" size={140} />
          <p className="mt-4 text-[15px] text-ink-500">
            You haven&rsquo;t sent a quote yet. Browsing is free — the first
            three quotes are too.
          </p>
          <Link href="/browse" className="btn-primary mt-5">
            Browse open jobs
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/browse/${job.id}`}
              className="flex flex-wrap items-center gap-5 rounded-lg border border-line bg-canvas px-6 py-[22px] transition-colors duration-150 hover:border-ink-900"
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
                  <h2 className="text-[17px] font-bold">{job.title}</h2>
                  <StatusTag status={job.status} />
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-ink-500">
                  <JobTypeTag type={job.type} />
                  <span>
                    {job.city} {job.zip} · sent{' '}
                    {job.myQuote && formatRelative(job.myQuote.createdAt)}
                  </span>
                </p>
                {job.exactLocation && (
                  <p className="mt-1.5 text-[12.5px] font-semibold text-success-700">
                    Address unlocked — {job.exactLocation.street}
                  </p>
                )}
              </div>

              {job.myQuote && (
                <div className="text-right">
                  <p className="text-[19px] font-extrabold">
                    {formatPrice(job.myQuote.priceCents)}
                  </p>
                  <div className="mt-1">
                    <QuoteStatusBadge status={job.myQuote.status} />
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
