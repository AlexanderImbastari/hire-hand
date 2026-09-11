'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getQuoteAllowance,
  getSubscription,
  listMatchedJobsForContractor,
  listOpenJobsForContractor,
  submitQuote,
  withdrawQuote,
} from '@/shared/data';
import { formatDate, formatPrice, JOB_TYPE_LABELS } from '@/shared/format';
import type {
  Contractor,
  JobPublicView,
  QuoteAllowance,
  Subscription,
} from '@/shared/types';
import { AllowanceBanner } from './AllowanceBanner';
import { ContractorJobDetail } from './ContractorJobDetail';
import { useRequiredSession } from './SessionProvider';
import { JobStatusBadge, QuoteStatusBadge } from './StatusBadge';

type Tab = 'open' | 'mine';

export function ContractorDashboard({ contractor }: { contractor: Contractor }) {
  const { session, revision, refresh } = useRequiredSession();
  const [tab, setTab] = useState<Tab>('open');
  const [openJobs, setOpenJobs] = useState<JobPublicView[]>([]);
  const [myJobs, setMyJobs] = useState<JobPublicView[]>([]);
  const [allowance, setAllowance] = useState<QuoteAllowance | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // An unapproved contractor gets the gate screen below and never reads
    // these lists, so there is nothing to fetch or clear.
    if (!contractor.approved) return;
    Promise.all([
      listOpenJobsForContractor(session),
      listMatchedJobsForContractor(session),
      getQuoteAllowance(session),
      getSubscription(session),
    ])
      .then(([open, mine, quota, sub]) => {
        setError('');
        setOpenJobs(open);
        setMyJobs(mine);
        setAllowance(quota);
        setSubscription(sub);
      })
      .catch((e) => setError(e.message));
  }, [session, revision, contractor.approved]);

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

  // Approval is a precondition for everything, not a visibility tier.
  if (!contractor.approved) {
    return (
      <div className="card p-10 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Your account is awaiting approval
        </h1>
        <p className="meta mx-auto mt-2 max-w-md">
          Browsing jobs and sending quotes unlock once HireHand approves your
          contractor account. Nothing else is available until then.
        </p>
      </div>
    );
  }

  const selected =
    selectedId !== null
      ? [...openJobs, ...myJobs].find((j) => j.id === selectedId)
      : undefined;

  if (selected && allowance) {
    return (
      <>
        {error && <Banner message={error} />}
        <ContractorJobDetail
          job={selected}
          allowance={allowance}
          busy={busy}
          onBack={() => setSelectedId(null)}
          onQuote={(priceCents, message) =>
            run(() => submitQuote(session, selected.id, { priceCents, message }))
          }
          onWithdraw={(quoteId) => run(() => withdrawQuote(session, quoteId))}
        />
      </>
    );
  }

  const jobs = tab === 'open' ? openJobs : myJobs;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {contractor.company}
          </h1>
          <p className="meta mt-1">
            {contractor.jobTypes.map((t) => JOB_TYPE_LABELS[t]).join(' · ')} ·
            serving {contractor.serviceZips.join(', ')}
          </p>
        </div>
        {allowance && <AllowanceBanner allowance={allowance} />}
      </div>

      {subscription?.status === 'cancelled' && (
        <p className="mb-4 rounded-md bg-gold-soft px-4 py-3 text-sm text-gold">
          Contractor Pro is cancelled. You keep unlimited quotes until{' '}
          {formatDate(subscription.currentPeriodEnd)}.
        </p>
      )}

      {error && <Banner message={error} />}

      <div className="mb-4 flex gap-1 border-b border-line">
        <TabButton
          active={tab === 'open'}
          onClick={() => setTab('open')}
          label={`Open jobs (${openJobs.length})`}
        />
        <TabButton
          active={tab === 'mine'}
          onClick={() => setTab('mine')}
          label={`My jobs (${myJobs.length})`}
        />
      </div>

      {jobs.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="font-medium">
            {tab === 'open' ? 'No open jobs right now' : 'No quotes sent yet'}
          </p>
          <p className="meta mx-auto mt-2 max-w-sm">
            {tab === 'open'
              ? `You see jobs posted in ${contractor.serviceZips.join(
                  ' and ',
                )} for ${contractor.jobTypes
                  .map((t) => JOB_TYPE_LABELS[t].toLowerCase())
                  .join(' and ')} work.`
              : 'Jobs you quote on show up here, win or lose.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => setSelectedId(job.id)}
              className="card p-5 text-left transition-colors hover:border-brand"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="meta text-xs uppercase tracking-wide">
                    {JOB_TYPE_LABELS[job.type]} · {job.city}, {job.zip}
                  </p>
                  <p className="mt-1 font-medium">{job.title}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <JobStatusBadge status={job.status} />
                  {job.myQuote && (
                    <QuoteStatusBadge status={job.myQuote.status} />
                  )}
                </div>
              </div>
              <p className="meta mt-2 line-clamp-2 text-sm">{job.description}</p>
              <div className="meta mt-3 flex flex-wrap gap-x-4 text-xs">
                <span>Posted {formatDate(job.createdAt)}</span>
                {job.myQuote && (
                  <span>You quoted {formatPrice(job.myQuote.priceCents)}</span>
                )}
                {job.exactLocation && <span>Address unlocked</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'border-brand text-brand'
          : 'border-transparent text-ink-soft hover:text-ink'
      }`}
    >
      {label}
    </button>
  );
}

function Banner({ message }: { message: string }) {
  return (
    <p className="mb-4 rounded-md bg-clay-soft px-4 py-3 text-sm text-clay">
      {message}
    </p>
  );
}
