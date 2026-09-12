import { JOB_STATUS_LABELS, JOB_TYPE_LABELS, QUOTE_STATUS_LABELS } from '@/shared/format';
import type { JobStatus, JobType, QuoteStatus } from '@/shared/types';

/* Status tag — pill, 12/5 padding, 11.5px/700. `expired` is not in the design
   table; it reads as a dead state, so it borrows the cancelled treatment. */
const JOB_STYLES: Record<JobStatus, string> = {
  draft: 'bg-surface text-ink-500',
  open: 'bg-orange-50 text-danger-text',
  accepted: 'bg-success-50 text-success-700',
  completed: 'bg-info-50 text-info-700',
  cancelled: 'bg-surface text-ink-400',
  expired: 'bg-surface text-ink-400',
};

const QUOTE_STYLES: Record<QuoteStatus, string> = {
  pending: 'bg-surface text-ink-500',
  accepted: 'bg-success-50 text-success-700',
  rejected: 'bg-surface text-ink-400',
  withdrawn: 'bg-surface text-ink-400',
};

const PILL =
  'inline-flex items-center rounded-full px-3 py-[5px] text-[11.5px] font-bold';

export function StatusTag({ status }: { status: JobStatus }) {
  return (
    <span className={`${PILL} ${JOB_STYLES[status]}`}>
      {JOB_STATUS_LABELS[status]}
    </span>
  );
}

/** Always dark — never coloured by trade. */
export function JobTypeTag({
  type,
  className = '',
}: {
  type: JobType;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-ink-900 px-3 py-[5px] text-[11px] font-bold text-white ${className}`.trim()}
    >
      {JOB_TYPE_LABELS[type]}
    </span>
  );
}

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  return (
    <span className={`${PILL} ${QUOTE_STYLES[status]}`}>
      {QUOTE_STATUS_LABELS[status]}
    </span>
  );
}

/** Kept for callers that read job status; same treatment as StatusTag. */
export const JobStatusBadge = StatusTag;
