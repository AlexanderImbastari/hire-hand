/**
 * Domain types for HireHand.
 *
 * Phase 1 keeps these in memory (see `storage.ts`); phase 2 swaps the storage
 * internals for Postgres. These shapes are the contract between the two, so
 * they deliberately look like table rows.
 */

export type JobType = 'plumbing' | 'electrical' | 'landscaping';

export const JOB_TYPES: JobType[] = ['plumbing', 'electrical', 'landscaping'];

export type JobStatus =
  | 'draft'
  | 'open'
  | 'accepted'
  | 'completed'
  | 'cancelled'
  | 'expired';

/** Statuses a job can no longer be edited or deleted in. */
export const FROZEN_STATUSES: JobStatus[] = [
  'accepted',
  'completed',
  'cancelled',
  'expired',
];

export type Timeframe = 'asap' | 'within_week' | 'within_month' | 'flexible';

export const TIMEFRAMES: Timeframe[] = [
  'asap',
  'within_week',
  'within_month',
  'flexible',
];

export type Role = 'user' | 'contractor';

export type QuoteStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled';

/** Lifetime — never resets, not on past_due, not on cancellation. */
export const FREE_QUOTE_LIMIT = 3;

export interface User {
  id: string;
  role: 'user';
  name: string;
  email: string;
  phone: string;
}

export interface Contractor {
  id: string;
  role: 'contractor';
  name: string;
  company: string;
  email: string;
  phone: string;
  /** Precondition for everything: browsing and quoting alike. */
  approved: boolean;
  serviceZips: string[];
  jobTypes: JobType[];
  /** Lifetime count. Never decremented, never reset. */
  freeQuotesUsed: number;
}

export type Account = User | Contractor;

export interface Subscription {
  contractorId: string;
  plan: 'contractor_pro';
  priceCents: number;
  status: SubscriptionStatus;
  /** Cancelled subscriptions keep access until this date. */
  currentPeriodEnd: string;
}

export interface Job {
  id: string;
  ownerId: string;
  type: JobType;
  title: string;
  description: string;
  /** Exact address — owner-only until a quote is accepted. */
  street: string;
  city: string;
  zip: string;
  timeframe: Timeframe;
  photos: string[];
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  acceptedQuoteId?: string;
}

export interface Quote {
  id: string;
  jobId: string;
  contractorId: string;
  priceCents: number;
  message: string;
  status: QuoteStatus;
  createdAt: string;
}

/** Who is making the call. Phase 2: derived from the auth token, fed to RLS. */
export interface Session {
  actorId: string;
  role: Role;
}

/* ---------------------------------------------------------------------------
 * Viewer-scoped views
 *
 * The data layer never hands a raw `Job` to the UI. It returns one of these,
 * so a field the caller isn't allowed to see is absent from the *type* — a
 * leak becomes a compile error rather than something to catch in review.
 * ------------------------------------------------------------------------ */

/** What any permitted contractor sees: approximate location only. */
export interface JobPublicView {
  id: string;
  type: JobType;
  title: string;
  description: string;
  city: string;
  zip: string;
  timeframe: Timeframe;
  photos: string[];
  status: JobStatus;
  createdAt: string;
  /**
   * How many live quotes the job has. Competitive signal, not a rival's price —
   * the amounts stay invisible.
   */
  quoteCount: number;
  /** Present only once this contractor has won the job. */
  exactLocation?: ExactLocation;
  /** This contractor's own quote on the job, if any. Never anyone else's. */
  myQuote?: QuoteView;
}

/** Unlocked for the owner always, and for the winning contractor on accept. */
export interface ExactLocation {
  street: string;
  city: string;
  zip: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

/** What the job's owner sees: everything, including every quote. */
export interface JobOwnerView {
  id: string;
  ownerId: string;
  type: JobType;
  title: string;
  description: string;
  street: string;
  city: string;
  zip: string;
  timeframe: Timeframe;
  photos: string[];
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  acceptedQuoteId?: string;
  quotes: QuoteView[];
  /** False once the job is accepted or terminal. */
  editable: boolean;
}

export interface QuoteView {
  id: string;
  jobId: string;
  contractorId: string;
  contractorName: string;
  contractorCompany: string;
  priceCents: number;
  message: string;
  status: QuoteStatus;
  createdAt: string;
}

/** Quote allowance for the signed-in contractor. Own subscription only. */
export interface QuoteAllowance {
  canQuote: boolean;
  /** null = unlimited (active Contractor Pro). */
  limit: number | null;
  used: number;
  remaining: number | null;
  /** Machine-readable reason quoting is blocked, for the UI to explain. */
  reason:
    | 'ok'
    | 'not_approved'
    | 'past_due'
    | 'free_quotes_exhausted';
}

/**
 * What signup collects. Role is chosen there and is fixed for the life of the
 * account: an account is a homeowner or a contractor, never both. Someone who
 * needs both makes a second account.
 */
export type SignupInput =
  | {
      role: 'user';
      name: string;
      email: string;
      phone: string;
    }
  | {
      role: 'contractor';
      name: string;
      email: string;
      phone: string;
      company: string;
      serviceZips: string[];
      jobTypes: JobType[];
    };

export interface JobInput {
  type: JobType;
  title: string;
  description: string;
  street: string;
  city: string;
  zip: string;
  timeframe: Timeframe;
  photos: string[];
}

export interface QuoteInput {
  priceCents: number;
  message: string;
}
