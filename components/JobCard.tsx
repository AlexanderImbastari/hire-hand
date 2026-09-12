import Link from 'next/link';
import { formatRelative, TIMEFRAME_SHORT } from '@/shared/format';
import type { JobPublicView } from '@/shared/types';
import { JobPhoto } from './JobPhoto';
import { JobTypeTag } from './StatusBadge';

/**
 * The contractor-facing job card. The whole card is the link; hover raises the
 * border to ink-900 — no transform, no shadow.
 */
export function JobCard({ job }: { job: JobPublicView }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group block overflow-hidden rounded-[16px] border border-line bg-canvas transition-colors duration-150 ease-out hover:border-ink-900"
    >
      <div className="relative h-[150px]">
        <JobPhoto
          src={job.photos[0]}
          alt={job.title}
          sizes="(max-width: 768px) 100vw, 470px"
          className="h-full w-full"
        />
        <JobTypeTag type={job.type} className="absolute right-3 top-3" />
      </div>

      <div className="p-[18px]">
        <div className="flex justify-between gap-3">
          <h3 className="text-base font-bold tracking-[-0.01em]">{job.title}</h3>
          <span className="whitespace-nowrap text-xs text-ink-400">
            {formatRelative(job.createdAt)}
          </span>
        </div>

        <p className="mt-[7px] line-clamp-1 text-[13.5px] leading-[1.5] text-ink-500">
          {job.description}
        </p>

        <div className="mt-3.5 flex items-center gap-3.5 border-t border-rule pt-3.5 text-[12.5px] font-semibold text-ink-700">
          <span>
            <span aria-hidden>◷ </span>
            {TIMEFRAME_SHORT[job.timeframe]}
          </span>
          <span>
            <span aria-hidden>⌖ </span>
            {job.zip}
          </span>
          <span className="flex-1" />
          <span className="text-orange-500">
            {job.quoteCount} {job.quoteCount === 1 ? 'quote' : 'quotes'}
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Skeleton at the card's real dimensions — no spinners in content areas. */
export function JobCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[16px] border border-line bg-canvas">
      <div className="h-[150px] animate-pulse bg-rule" />
      <div className="p-[18px]">
        <div className="h-4 w-3/4 animate-pulse rounded bg-rule" />
        <div className="mt-[10px] h-3 w-full animate-pulse rounded bg-rule" />
        <div className="mt-3.5 border-t border-rule pt-3.5">
          <div className="h-3 w-1/2 animate-pulse rounded bg-rule" />
        </div>
      </div>
    </div>
  );
}
