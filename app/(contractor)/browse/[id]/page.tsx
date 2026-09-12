'use client';

import Link from 'next/link';
import { use, useCallback, useEffect, useState } from 'react';
import { ContractorJobDetail } from '@/components/ContractorJobDetail';
import { useRequiredSession } from '@/components/SessionProvider';
import {
  getJobForContractor,
  getQuoteAllowance,
  submitQuote,
  withdrawQuote,
} from '@/shared/data';
import type { JobPublicView, QuoteAllowance } from '@/shared/types';

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <JobDetailBody jobId={id} />;
}

function JobDetailBody({ jobId }: { jobId: string }) {
  const { session, revision, refresh } = useRequiredSession();
  const [job, setJob] = useState<JobPublicView | null>(null);
  const [allowance, setAllowance] = useState<QuoteAllowance | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    Promise.all([getJobForContractor(session, jobId), getQuoteAllowance(session)])
      .then(([j, a]) => {
        if (!live) return;
        setJob(j);
        setAllowance(a);
        setNotFound(false);
      })
      .catch(() => live && setNotFound(true));
    return () => {
      live = false;
    };
  }, [session, revision, jobId]);

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
      }
    },
    [refresh],
  );

  if (notFound) {
    return (
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="text-[26px] font-extrabold tracking-[-0.02em]">
          That job isn&rsquo;t available
        </h1>
        <p className="mt-3 text-[15px] leading-[1.6] text-ink-500">
          It may have been withdrawn, matched with another contractor, or it
          falls outside your service area.
        </p>
        <Link href="/browse" className="btn-primary mt-7">
          Back to open jobs
        </Link>
      </main>
    );
  }

  if (!job || !allowance) {
    return (
      <div className="px-6 pb-16 pt-7 sm:px-12">
        <div className="h-4 w-40 animate-pulse rounded bg-rule" />
        <div className="mt-6 h-9 w-2/3 animate-pulse rounded bg-rule" />
        <div className="mt-5 h-[300px] animate-pulse rounded-[14px] bg-rule" />
      </div>
    );
  }

  return (
    <>
      {error && (
        <p className="mx-6 mt-5 rounded-md border border-accent-edge bg-orange-50 px-4 py-3 text-[13px] font-semibold text-danger-text sm:mx-12">
          {error}
        </p>
      )}
      <ContractorJobDetail
        job={job}
        allowance={allowance}
        busy={busy}
        onQuote={(priceCents, message) =>
          run(() => submitQuote(session, job.id, { priceCents, message }))
        }
        onWithdraw={(quoteId) => run(() => withdrawQuote(session, quoteId))}
      />
    </>
  );
}
