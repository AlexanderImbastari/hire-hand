import { JOB_STATUS_LABELS, QUOTE_STATUS_LABELS } from '@/shared/format';
import type { JobStatus, QuoteStatus } from '@/shared/types';

const JOB_STYLES: Record<JobStatus, string> = {
  draft: 'bg-sunken text-ink-soft',
  open: 'bg-brand-soft text-brand-ink',
  accepted: 'bg-gold-soft text-gold',
  completed: 'bg-sunken text-ink-soft',
  cancelled: 'bg-clay-soft text-clay',
  expired: 'bg-sunken text-ink-soft',
};

const QUOTE_STYLES: Record<QuoteStatus, string> = {
  pending: 'bg-sunken text-ink-soft',
  accepted: 'bg-brand-soft text-brand-ink',
  rejected: 'bg-clay-soft text-clay',
  withdrawn: 'bg-sunken text-ink-soft',
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <span className={`badge ${JOB_STYLES[status]}`}>
      {status === 'accepted' && <span aria-hidden>🔒</span>}
      {JOB_STATUS_LABELS[status]}
    </span>
  );
}

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  return (
    <span className={`badge ${QUOTE_STYLES[status]}`}>
      {QUOTE_STATUS_LABELS[status]}
    </span>
  );
}
