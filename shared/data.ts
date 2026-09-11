/**
 * The only module the UI is allowed to talk to.
 *
 * Every function takes the caller's `Session`, runs the rules in `policy.ts`,
 * and returns a view redacted for that caller. Nothing above this layer ever
 * sees a raw `Job` row, so a component cannot render a street address it was
 * never handed.
 *
 * The functions are async even though phase 1 answers synchronously from
 * `localStorage`. That is deliberate: phase 2 swaps the bodies for Postgres
 * queries with RLS doing the enforcement, and the signatures — and therefore
 * every caller — stay exactly as they are.
 */

import {
  canMutateJob,
  canSeeExactLocation,
  canViewJob,
  hasQuotedOn,
  isJobFrozen,
  matchesContractor,
  PolicyError,
  quoteAllowance,
  visibleQuotes,
} from './policy';
import { getState, mutate, resetDemoData } from './storage';
import type {
  Account,
  Contractor,
  ExactLocation,
  Job,
  JobInput,
  JobOwnerView,
  JobPublicView,
  Quote,
  QuoteAllowance,
  QuoteInput,
  QuoteView,
  Session,
  Subscription,
  User,
} from './types';

export { PolicyError } from './policy';
export { resetDemoData } from './storage';

/* -------------------------------------------------------------------------
 * Internals
 * ---------------------------------------------------------------------- */

function newId(prefix: string): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${rand}`;
}

function now(): string {
  return new Date().toISOString();
}

function findAccount(id: string): Account | null {
  return getState().accounts.find((a) => a.id === id) ?? null;
}

function requireContractor(session: Session): Contractor {
  const account = findAccount(session.actorId);
  if (!account || account.role !== 'contractor') {
    throw new PolicyError('Not signed in as a contractor.');
  }
  if (!account.approved) {
    throw new PolicyError(
      'Your contractor account is awaiting approval. Browsing and quoting ' +
        'unlock once it is approved.',
    );
  }
  return account;
}

function requireUser(session: Session): User {
  const account = findAccount(session.actorId);
  if (!account || account.role !== 'user') {
    throw new PolicyError('Not signed in as a homeowner.');
  }
  return account;
}

function subscriptionFor(contractorId: string): Subscription | null {
  return (
    getState().subscriptions.find((s) => s.contractorId === contractorId) ?? null
  );
}

function toQuoteView(quote: Quote): QuoteView {
  const contractor = findAccount(quote.contractorId);
  const isContractor = contractor?.role === 'contractor';
  return {
    id: quote.id,
    jobId: quote.jobId,
    contractorId: quote.contractorId,
    contractorName: contractor?.name ?? 'Unknown contractor',
    contractorCompany: isContractor ? contractor.company : '',
    priceCents: quote.priceCents,
    message: quote.message,
    status: quote.status,
    createdAt: quote.createdAt,
  };
}

function exactLocationOf(job: Job): ExactLocation {
  const owner = findAccount(job.ownerId);
  return {
    street: job.street,
    city: job.city,
    zip: job.zip,
    contactName: owner?.name ?? 'Homeowner',
    contactEmail: owner?.email ?? '',
    contactPhone: owner?.phone ?? '',
  };
}

function toOwnerView(job: Job, quotes: Quote[]): JobOwnerView {
  return {
    id: job.id,
    ownerId: job.ownerId,
    type: job.type,
    title: job.title,
    description: job.description,
    street: job.street,
    city: job.city,
    zip: job.zip,
    timeframe: job.timeframe,
    photos: job.photos,
    status: job.status,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    acceptedQuoteId: job.acceptedQuoteId,
    quotes: quotes
      .filter((q) => q.jobId === job.id)
      .map(toQuoteView)
      .sort((a, b) => a.priceCents - b.priceCents),
    editable: !isJobFrozen(job),
  };
}

/** Contractor-facing view: city and zip only, unless this contractor won. */
function toPublicView(
  session: Session,
  job: Job,
  quotes: Quote[],
): JobPublicView {
  const mine = quotes.find(
    (q) => q.jobId === job.id && q.contractorId === session.actorId,
  );
  const view: JobPublicView = {
    id: job.id,
    type: job.type,
    title: job.title,
    description: job.description,
    city: job.city,
    zip: job.zip,
    timeframe: job.timeframe,
    photos: job.photos,
    status: job.status,
    createdAt: job.createdAt,
    myQuote: mine ? toQuoteView(mine) : undefined,
  };
  if (canSeeExactLocation(session, job, quotes)) {
    view.exactLocation = exactLocationOf(job);
  }
  return view;
}

function requireOwnedJob(session: Session, jobId: string): Job {
  const job = getState().jobs.find((j) => j.id === jobId);
  if (!job || job.ownerId !== session.actorId || session.role !== 'user') {
    // Same response whether it is missing or someone else's — matching what
    // RLS does, which is to simply not return the row.
    throw new PolicyError('Job not found.');
  }
  return job;
}

/* -------------------------------------------------------------------------
 * Accounts
 * ---------------------------------------------------------------------- */

/** The phase-1 identity picker. Replaced by real auth in phase 2. */
export async function listAccounts(): Promise<Account[]> {
  return structuredClone(getState().accounts);
}

export async function getAccount(session: Session): Promise<Account> {
  const account = findAccount(session.actorId);
  if (!account) throw new PolicyError('Account not found.');
  return structuredClone(account);
}

/* -------------------------------------------------------------------------
 * Homeowner side
 * ---------------------------------------------------------------------- */

export async function listJobsForUser(session: Session): Promise<JobOwnerView[]> {
  requireUser(session);
  const { jobs, quotes } = getState();
  return jobs
    .filter((j) => j.ownerId === session.actorId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((j) => toOwnerView(j, quotes));
}

export async function getJobForOwner(
  session: Session,
  jobId: string,
): Promise<JobOwnerView> {
  const job = requireOwnedJob(session, jobId);
  return toOwnerView(job, getState().quotes);
}

export async function createJob(
  session: Session,
  input: JobInput,
  options: { publish?: boolean } = {},
): Promise<JobOwnerView> {
  requireUser(session);
  const timestamp = now();
  const job: Job = {
    id: newId('job'),
    ownerId: session.actorId,
    ...input,
    status: options.publish ? 'open' : 'draft',
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  return mutate((state) => {
    state.jobs.push(job);
    return toOwnerView(job, state.quotes);
  });
}

export async function updateJob(
  session: Session,
  jobId: string,
  patch: Partial<JobInput>,
): Promise<JobOwnerView> {
  const job = requireOwnedJob(session, jobId);
  if (!canMutateJob(session, job)) {
    throw new PolicyError(
      'This job has been matched with a contractor and can no longer be edited.',
    );
  }
  return mutate((state) => {
    const row = state.jobs.find((j) => j.id === jobId)!;
    Object.assign(row, patch, { updatedAt: now() });
    return toOwnerView(row, state.quotes);
  });
}

export async function deleteJob(session: Session, jobId: string): Promise<void> {
  const job = requireOwnedJob(session, jobId);
  if (!canMutateJob(session, job)) {
    throw new PolicyError(
      'This job has been matched with a contractor and can no longer be deleted.',
    );
  }
  mutate((state) => {
    state.jobs = state.jobs.filter((j) => j.id !== jobId);
    state.quotes = state.quotes.filter((q) => q.jobId !== jobId);
  });
}

/** draft → open. The job becomes visible to matching contractors. */
export async function publishJob(
  session: Session,
  jobId: string,
): Promise<JobOwnerView> {
  const job = requireOwnedJob(session, jobId);
  if (job.status !== 'draft') {
    throw new PolicyError('Only a draft can be published.');
  }
  return mutate((state) => {
    const row = state.jobs.find((j) => j.id === jobId)!;
    row.status = 'open';
    row.updatedAt = now();
    return toOwnerView(row, state.quotes);
  });
}

export async function cancelJob(
  session: Session,
  jobId: string,
): Promise<JobOwnerView> {
  const job = requireOwnedJob(session, jobId);
  if (isJobFrozen(job)) {
    throw new PolicyError('This job is already closed.');
  }
  return mutate((state) => {
    const row = state.jobs.find((j) => j.id === jobId)!;
    row.status = 'cancelled';
    row.updatedAt = now();
    state.quotes
      .filter((q) => q.jobId === jobId && q.status === 'pending')
      .forEach((q) => {
        q.status = 'rejected';
      });
    return toOwnerView(row, state.quotes);
  });
}

/** accepted → completed. The work is done. */
export async function completeJob(
  session: Session,
  jobId: string,
): Promise<JobOwnerView> {
  const job = requireOwnedJob(session, jobId);
  if (job.status !== 'accepted') {
    throw new PolicyError('Only an accepted job can be marked complete.');
  }
  return mutate((state) => {
    const row = state.jobs.find((j) => j.id === jobId)!;
    row.status = 'completed';
    row.updatedAt = now();
    return toOwnerView(row, state.quotes);
  });
}

export async function listQuotesForJob(
  session: Session,
  jobId: string,
): Promise<QuoteView[]> {
  const { jobs, quotes, accounts } = getState();
  const job = jobs.find((j) => j.id === jobId);
  if (!job) throw new PolicyError('Job not found.');
  const contractor =
    session.role === 'contractor'
      ? ((accounts.find((a) => a.id === session.actorId) ?? null) as
          | Contractor
          | null)
      : null;
  if (!canViewJob(session, job, contractor, quotes)) {
    throw new PolicyError('Job not found.');
  }
  return visibleQuotes(session, job, quotes).map(toQuoteView);
}

/**
 * The match. The chosen quote wins, the rest are rejected, the job freezes,
 * and the winning contractor — free or paid, no difference — gets the exact
 * address and the homeowner's contact details.
 */
export async function acceptQuote(
  session: Session,
  jobId: string,
  quoteId: string,
): Promise<JobOwnerView> {
  const job = requireOwnedJob(session, jobId);
  if (isJobFrozen(job)) {
    throw new PolicyError('This job has already been matched.');
  }
  if (job.status !== 'open') {
    throw new PolicyError('Publish the job before accepting a quote.');
  }
  return mutate((state) => {
    const winner = state.quotes.find(
      (q) => q.id === quoteId && q.jobId === jobId,
    );
    if (!winner) throw new PolicyError('Quote not found.');
    if (winner.status === 'withdrawn') {
      throw new PolicyError('That quote has been withdrawn.');
    }
    const row = state.jobs.find((j) => j.id === jobId)!;
    row.status = 'accepted';
    row.acceptedQuoteId = winner.id;
    row.updatedAt = now();
    state.quotes
      .filter((q) => q.jobId === jobId)
      .forEach((q) => {
        q.status = q.id === winner.id ? 'accepted' : 'rejected';
      });
    return toOwnerView(row, state.quotes);
  });
}

/* -------------------------------------------------------------------------
 * Contractor side
 * ---------------------------------------------------------------------- */

/** The matching engine: open jobs in this contractor's area and trades. */
export async function listOpenJobsForContractor(
  session: Session,
): Promise<JobPublicView[]> {
  const contractor = requireContractor(session);
  const { jobs, quotes } = getState();
  return jobs
    .filter((j) => j.status === 'open' && matchesContractor(contractor, j))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((j) => toPublicView(session, j, quotes));
}

/**
 * Jobs this contractor has bid on, whatever their status now — including the
 * ones they won, which carry the unlocked address.
 */
export async function listMatchedJobsForContractor(
  session: Session,
): Promise<JobPublicView[]> {
  const contractor = requireContractor(session);
  const { jobs, quotes } = getState();
  return jobs
    .filter((j) => hasQuotedOn(contractor.id, j.id, quotes))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((j) => toPublicView(session, j, quotes));
}

export async function getJobForContractor(
  session: Session,
  jobId: string,
): Promise<JobPublicView> {
  const contractor = requireContractor(session);
  const { jobs, quotes } = getState();
  const job = jobs.find((j) => j.id === jobId);
  if (!job || !canViewJob(session, job, contractor, quotes)) {
    throw new PolicyError('Job not found.');
  }
  return toPublicView(session, job, quotes);
}

export async function getQuoteAllowance(
  session: Session,
): Promise<QuoteAllowance> {
  const account = findAccount(session.actorId);
  if (!account || account.role !== 'contractor') {
    throw new PolicyError('Not signed in as a contractor.');
  }
  return quoteAllowance(account, subscriptionFor(account.id));
}

export async function submitQuote(
  session: Session,
  jobId: string,
  input: QuoteInput,
): Promise<QuoteView> {
  const contractor = requireContractor(session);
  const { jobs, quotes } = getState();
  const job = jobs.find((j) => j.id === jobId);
  if (!job || !canViewJob(session, job, contractor, quotes)) {
    throw new PolicyError('Job not found.');
  }
  if (job.status !== 'open') {
    throw new PolicyError('This job is no longer accepting quotes.');
  }
  if (hasQuotedOn(contractor.id, jobId, quotes)) {
    throw new PolicyError('You have already quoted on this job.');
  }

  const allowance = quoteAllowance(contractor, subscriptionFor(contractor.id));
  if (!allowance.canQuote) {
    throw new PolicyError(allowanceMessage(allowance));
  }
  if (input.priceCents <= 0) {
    throw new PolicyError('Enter a price above zero.');
  }

  const quote: Quote = {
    id: newId('quote'),
    jobId,
    contractorId: contractor.id,
    priceCents: input.priceCents,
    message: input.message,
    status: 'pending',
    createdAt: now(),
  };

  return mutate((state) => {
    state.quotes.push(quote);
    // The lifetime counter only moves while the contractor is on the free
    // allowance. Under Pro it stays where it is — it is not a usage meter.
    if (allowance.limit !== null) {
      const row = state.accounts.find(
        (a) => a.id === contractor.id,
      ) as Contractor;
      row.freeQuotesUsed += 1;
    }
    return toQuoteView(quote);
  });
}

export async function updateQuote(
  session: Session,
  quoteId: string,
  patch: Partial<QuoteInput>,
): Promise<QuoteView> {
  const contractor = requireContractor(session);
  const { jobs, quotes } = getState();
  const quote = quotes.find((q) => q.id === quoteId);
  if (!quote || quote.contractorId !== contractor.id) {
    throw new PolicyError('Quote not found.');
  }
  const job = jobs.find((j) => j.id === quote.jobId);
  if (job && isJobFrozen(job)) {
    throw new PolicyError('This job has been matched. Quotes are final.');
  }
  return mutate((state) => {
    const row = state.quotes.find((q) => q.id === quoteId)!;
    Object.assign(row, patch);
    return toQuoteView(row);
  });
}

/**
 * Withdrawing does not refund a free quote — the allowance is lifetime, and
 * refunding it would turn it into a renewable resource.
 */
export async function withdrawQuote(
  session: Session,
  quoteId: string,
): Promise<void> {
  const contractor = requireContractor(session);
  const { jobs, quotes } = getState();
  const quote = quotes.find((q) => q.id === quoteId);
  if (!quote || quote.contractorId !== contractor.id) {
    throw new PolicyError('Quote not found.');
  }
  const job = jobs.find((j) => j.id === quote.jobId);
  if (job && isJobFrozen(job)) {
    throw new PolicyError('This job has been matched. Quotes are final.');
  }
  mutate((state) => {
    const row = state.quotes.find((q) => q.id === quoteId)!;
    row.status = 'withdrawn';
  });
}

/** Own subscription only — billing state is never readable by anyone else. */
export async function getSubscription(
  session: Session,
): Promise<Subscription | null> {
  if (session.role !== 'contractor') {
    throw new PolicyError('Subscriptions belong to contractors.');
  }
  const subscription = subscriptionFor(session.actorId);
  return subscription ? structuredClone(subscription) : null;
}

export function allowanceMessage(allowance: QuoteAllowance): string {
  switch (allowance.reason) {
    case 'not_approved':
      return 'Your contractor account is awaiting approval.';
    case 'past_due':
      return (
        'Your Contractor Pro payment is past due, so new quotes are paused. ' +
        'Quotes you have already sent are still live.'
      );
    case 'free_quotes_exhausted':
      return (
        'You have used all 3 of your free lifetime quotes. Upgrade to ' +
        'Contractor Pro for unlimited quotes.'
      );
    default:
      return '';
  }
}

/* -------------------------------------------------------------------------
 * Phase-1 demo controls
 *
 * Not product surface. These exist so the approval and billing gates can be
 * exercised without a Stripe account or an approval workflow, both of which
 * are phase 2. Nothing in the product calls them.
 * ---------------------------------------------------------------------- */

export async function devSetApproved(
  contractorId: string,
  approved: boolean,
): Promise<void> {
  mutate((state) => {
    const row = state.accounts.find((a) => a.id === contractorId);
    if (row?.role === 'contractor') row.approved = approved;
  });
}

export async function devSetSubscription(
  contractorId: string,
  status: Subscription['status'] | 'none',
): Promise<void> {
  mutate((state) => {
    state.subscriptions = state.subscriptions.filter(
      (s) => s.contractorId !== contractorId,
    );
    if (status === 'none') return;
    state.subscriptions.push({
      contractorId,
      plan: 'contractor_pro',
      priceCents: 2000,
      status,
      currentPeriodEnd: new Date(
        Date.now() + 21 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    });
  });
}

export { resetDemoData as devResetData };
