/**
 * Every access and billing rule in the domain, as pure functions.
 *
 * Nothing here touches storage, React, or the network, which keeps the rules
 * readable on their own and portable: in phase 2 each predicate becomes a
 * Postgres RLS policy on the matching table. Until then `data.ts` is the only
 * caller, and it applies them on every read and write so the UI physically
 * cannot fetch something it isn't entitled to.
 */

import {
  FREE_QUOTE_LIMIT,
  FROZEN_STATUSES,
  type Contractor,
  type Job,
  type Quote,
  type QuoteAllowance,
  type Session,
  type Subscription,
} from './types';

/** Raised where RLS would simply return no row. */
export class PolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PolicyError';
  }
}

/* -------------------------------------------------------------------------
 * Matching
 * ---------------------------------------------------------------------- */

/** A job is in a contractor's book of work if both area and trade line up. */
export function matchesContractor(contractor: Contractor, job: Job): boolean {
  return (
    contractor.serviceZips.includes(job.zip) &&
    contractor.jobTypes.includes(job.type)
  );
}

export function hasQuotedOn(
  contractorId: string,
  jobId: string,
  quotes: Quote[],
): boolean {
  return quotes.some(
    (q) => q.jobId === jobId && q.contractorId === contractorId,
  );
}

/* -------------------------------------------------------------------------
 * Job visibility
 * ---------------------------------------------------------------------- */

/**
 * Owners see their own jobs, always. Contractors see open jobs in their area
 * and trade, plus any job they have personally quoted on — that one stays
 * visible whatever the job's status later becomes, so a contractor can always
 * look back at work they bid on.
 *
 * Approval is a precondition, not a tier: an unapproved contractor sees
 * nothing at all.
 */
export function canViewJob(
  session: Session,
  job: Job,
  contractor: Contractor | null,
  quotes: Quote[],
): boolean {
  if (session.role === 'user') return job.ownerId === session.actorId;
  if (!contractor?.approved) return false;
  if (hasQuotedOn(contractor.id, job.id, quotes)) return true;
  return job.status === 'open' && matchesContractor(contractor, job);
}

/**
 * The exact street address and the homeowner's phone and email.
 *
 * Unlocked for the owner always, and for the winning contractor once the job
 * is accepted — a workflow step, not a paywall. Free and paid contractors get
 * it on identical terms. Showing only city + zip before that is a homeowner
 * safety rule; do not relax it into a subscription perk.
 */
export function canSeeExactLocation(
  session: Session,
  job: Job,
  quotes: Quote[],
): boolean {
  if (session.role === 'user') return job.ownerId === session.actorId;
  if (job.status !== 'accepted' && job.status !== 'completed') return false;
  const winning = quotes.find((q) => q.id === job.acceptedQuoteId);
  return winning?.contractorId === session.actorId;
}

/** Create, edit and delete are the owner's, and only before a match. */
export function canMutateJob(session: Session, job: Job): boolean {
  if (session.role !== 'user' || job.ownerId !== session.actorId) return false;
  return !FROZEN_STATUSES.includes(job.status);
}

/** A job stops accepting new or amended quotes at the same moment. */
export function isJobFrozen(job: Job): boolean {
  return FROZEN_STATUSES.includes(job.status);
}

/* -------------------------------------------------------------------------
 * Quote visibility
 * ---------------------------------------------------------------------- */

/**
 * The owner sees every bid on their own job. A contractor sees only their
 * own — never a rival's price on the same job.
 */
export function visibleQuotes(
  session: Session,
  job: Job,
  quotes: Quote[],
): Quote[] {
  const onJob = quotes.filter((q) => q.jobId === job.id);
  if (session.role === 'user') {
    return job.ownerId === session.actorId ? onJob : [];
  }
  return onJob.filter((q) => q.contractorId === session.actorId);
}

/* -------------------------------------------------------------------------
 * Billing
 * ---------------------------------------------------------------------- */

/**
 * Whether a subscription currently lifts the quote cap.
 *
 * `active` does. A cancelled one keeps working to the end of the period the
 * contractor already paid for. `past_due` does not — and separately blocks
 * quoting outright, see `quoteAllowance`.
 */
export function subscriptionLiftsCap(
  subscription: Subscription | null,
  now: Date = new Date(),
): boolean {
  if (!subscription) return false;
  if (subscription.status === 'active') return true;
  if (subscription.status === 'cancelled') {
    return now < new Date(subscription.currentPeriodEnd);
  }
  return false;
}

/**
 * The single source of truth for "can this contractor send a quote".
 *
 * The free allowance is three quotes for the lifetime of the account. It never
 * resets — not when a subscription goes past due, not when one is cancelled.
 * An active subscription makes the count moot rather than clearing it.
 */
export function quoteAllowance(
  contractor: Contractor,
  subscription: Subscription | null,
  now: Date = new Date(),
): QuoteAllowance {
  const used = contractor.freeQuotesUsed;

  if (!contractor.approved) {
    return {
      canQuote: false,
      limit: FREE_QUOTE_LIMIT,
      used,
      remaining: Math.max(0, FREE_QUOTE_LIMIT - used),
      reason: 'not_approved',
    };
  }

  // Past due pauses new quotes. Quotes already sent stay live, and the
  // contractor's profile stays visible — this is a nudge, not a shutdown.
  if (subscription?.status === 'past_due') {
    return {
      canQuote: false,
      limit: null,
      used,
      remaining: null,
      reason: 'past_due',
    };
  }

  if (subscriptionLiftsCap(subscription, now)) {
    return {
      canQuote: true,
      limit: null,
      used,
      remaining: null,
      reason: 'ok',
    };
  }

  const remaining = Math.max(0, FREE_QUOTE_LIMIT - used);
  return {
    canQuote: remaining > 0,
    limit: FREE_QUOTE_LIMIT,
    used,
    remaining,
    reason: remaining > 0 ? 'ok' : 'free_quotes_exhausted',
  };
}

/** Browsing is free, but approval gates it. */
export function canBrowseJobs(contractor: Contractor | null): boolean {
  return Boolean(contractor?.approved);
}

/** Only an approved contractor can start a subscription. */
export function canSubscribe(contractor: Contractor): boolean {
  return contractor.approved;
}

/** Billing state is readable only by the contractor who owns it. */
export function canViewSubscription(
  session: Session,
  subscription: Subscription,
): boolean {
  return (
    session.role === 'contractor' && subscription.contractorId === session.actorId
  );
}
