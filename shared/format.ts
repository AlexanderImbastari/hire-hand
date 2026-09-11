/** Display helpers. Pure and platform-agnostic, so a mobile build reuses them. */

import type { JobStatus, JobType, QuoteStatus, Timeframe } from './types';

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso));
}

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  landscaping: 'Landscaping',
};

export const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  asap: 'As soon as possible',
  within_week: 'Within a week',
  within_month: 'Within a month',
  flexible: 'Flexible',
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  draft: 'Draft',
  open: 'Open for quotes',
  accepted: 'Matched',
  completed: 'Completed',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Not selected',
  withdrawn: 'Withdrawn',
};
