'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { JOB_TYPE_LABELS } from '@/shared/format';
import { JOB_TYPES, type JobType } from '@/shared/types';

/**
 * The hero entry point for homeowners: pick a trade, say what is wrong, give a
 * ZIP. It hands straight off to the post-a-job form with those fields prefilled.
 */
export function HeroSearch() {
  const router = useRouter();
  const [type, setType] = useState<JobType>('plumbing');
  const [title, setTitle] = useState('');
  const [zip, setZip] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({ type });
    if (title.trim()) params.set('title', title.trim());
    if (zip.trim()) params.set('zip', zip.trim());
    router.push(`/jobs/new?${params}`);
  }

  return (
    <form
      onSubmit={submit}
      className="relative z-[2] mx-auto -mt-11 w-full max-w-[1040px] rounded-lg border border-line bg-canvas p-2.5 shadow-float"
    >
      <div className="flex flex-wrap gap-1.5 px-1.5 pb-2.5 pt-1">
        {JOB_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            aria-pressed={type === t}
            className={`cursor-pointer rounded-full px-4 py-[7px] text-[13px] transition-colors duration-150 ${
              type === t
                ? 'bg-ink-900 font-bold text-white'
                : 'bg-surface font-semibold text-ink-700 hover:text-ink-900'
            }`}
          >
            {JOB_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2.5 rounded-md bg-surface px-[18px] py-3.5">
          <span
            aria-hidden
            className="size-2 flex-none rounded-full bg-orange-500"
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Describe the job"
            placeholder="Describe the job — “water heater leaking in basement”"
            className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
          />
        </div>
        <input
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          aria-label="ZIP code"
          placeholder="ZIP code"
          inputMode="numeric"
          className="rounded-md bg-surface px-[18px] py-3.5 text-sm text-ink-900 outline-none placeholder:text-ink-400 sm:w-[150px]"
        />
        <button
          type="submit"
          className="cursor-pointer rounded-md bg-orange-500 px-[26px] py-3.5 text-sm font-bold text-white transition-colors duration-150 hover:bg-orange-600"
        >
          Get quotes
        </button>
      </div>
    </form>
  );
}
