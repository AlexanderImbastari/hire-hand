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

/** Relative age, as the cards and detail headers show it: 2h ago / yesterday. */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const mins = Math.floor((now.getTime() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

export const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  asap: 'As soon as possible',
  within_week: 'Within a week',
  within_month: 'Within a month',
  flexible: 'Flexible',
};

/** Compact forms for cards, chips and segmented controls. */
export const TIMEFRAME_SHORT: Record<Timeframe, string> = {
  asap: 'ASAP',
  within_week: 'This week',
  within_month: 'This month',
  flexible: 'Flexible',
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  draft: 'Draft',
  open: 'Open',
  accepted: 'Accepted',
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
