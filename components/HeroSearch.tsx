'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { JOB_TYPE_LABELS } from '@/shared/format';
import { JOB_TYPES, type JobType } from '@/shared/types';

/**
 * The hero entry point for homeowners: pick a trade, say what is wrong, give a
 * ZIP. It hands straight off to the post-a-job form with those fields prefilled.
 *
 * The suggestion list exists because most people describe a task, not a trade —
 * picking one fills the description *and* sets the trade, so nobody has to know
 * that a blocked drain is "plumbing".
 */

/** Our product icon language: geometric glyphs, one weight, one colour. */
const TYPE_GLYPH: Record<JobType, string> = {
  plumbing: '◍',
  electrical: '◈',
  landscaping: '✿',
};

/**
 * Plain-language tasks mapped to the trade that covers them. Kept local: the
 * post-a-job form asks for a trade directly, so there is no second consumer yet.
 */
const SUGGESTIONS: { label: string; type: JobType }[] = [
  { label: 'Fix a leaking faucet or tap', type: 'plumbing' },
  { label: 'Replace a water heater', type: 'plumbing' },
  { label: 'Clear a blocked drain', type: 'plumbing' },
  { label: 'Install or replace a toilet', type: 'plumbing' },
  { label: 'Repair a burst or frozen pipe', type: 'plumbing' },
  { label: 'Install a ceiling fan or light fixture', type: 'electrical' },
  { label: 'Replace a faulty outlet or switch', type: 'electrical' },
  { label: 'Upgrade or repair a breaker panel', type: 'electrical' },
  { label: 'Add an outdoor outlet or new circuit', type: 'electrical' },
  { label: 'Track down flickering lights', type: 'electrical' },
  { label: 'Mow grass and maintain landscaping', type: 'landscaping' },
  { label: 'Lay new sod or re-turf a lawn', type: 'landscaping' },
  { label: 'Trim or remove a tree', type: 'landscaping' },
  { label: 'Clear and haul away yard waste', type: 'landscaping' },
  { label: 'Install or repair irrigation', type: 'landscaping' },
];

/** Shown before anyone types — one per trade, so the range is obvious. */
const POPULAR = [
  'Replace a water heater',
  'Clear a blocked drain',
  'Install a ceiling fan or light fixture',
  'Replace a faulty outlet or switch',
  'Mow grass and maintain landscaping',
];

const MAX_VISIBLE = 6;

export function HeroSearch() {
  const router = useRouter();
  const [type, setType] = useState<JobType>('plumbing');
  const [title, setTitle] = useState('');
  const [zip, setZip] = useState('');

  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const rootRef = useRef<HTMLFormElement>(null);

  const matches = useMemo(() => {
    const q = title.trim().toLowerCase();
    if (!q) {
      return SUGGESTIONS.filter((s) => POPULAR.includes(s.label));
    }
    return SUGGESTIONS.filter((s) => s.label.toLowerCase().includes(q)).slice(
      0,
      MAX_VISIBLE,
    );
  }, [title]);

  // Close when focus or a click lands outside. The listener sets state, which
  // is fine — what the compiler rule forbids is setting it in the effect body.
  useEffect(() => {
    if (!open) return;
    const away = (e: Event) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', away);
    document.addEventListener('focusin', away);
    return () => {
      document.removeEventListener('pointerdown', away);
      document.removeEventListener('focusin', away);
    };
  }, [open]);

  function choose(s: { label: string; type: JobType }) {
    setTitle(s.label);
    setType(s.type);
    setOpen(false);
    setHighlighted(-1);
  }

  function go(nextTitle: string, nextType: JobType) {
    const params = new URLSearchParams({ type: nextType });
    if (nextTitle.trim()) params.set('title', nextTitle.trim());
    if (zip.trim()) params.set('zip', zip.trim());
    router.push(`/jobs/new?${params}`);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    go(title, type);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setOpen(false);
      setHighlighted(-1);
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setHighlighted(0);
        return;
      }
      const delta = e.key === 'ArrowDown' ? 1 : -1;
      setHighlighted((i) => {
        if (matches.length === 0) return -1;
        const next = i + delta;
        if (next < 0) return matches.length - 1;
        if (next >= matches.length) return 0;
        return next;
      });
      return;
    }
    if (e.key === 'Enter' && open && highlighted >= 0 && matches[highlighted]) {
      // Take the suggestion rather than submitting a half-typed description.
      e.preventDefault();
      const picked = matches[highlighted];
      choose(picked);
      go(picked.label, picked.type);
    }
  }

  const listboxId = 'hero-search-suggestions';
  const showList = open && matches.length > 0;

  return (
    <form
      ref={rootRef}
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
          <span aria-hidden className="size-2 flex-none rounded-full bg-orange-500" />
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setOpen(true);
              setHighlighted(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={showList}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              highlighted >= 0 ? `${listboxId}-${highlighted}` : undefined
            }
            autoComplete="off"
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

      {showList && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Job suggestions"
          className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-lg border border-line bg-canvas py-2 shadow-float"
        >
          {!title.trim() && (
            <li className="label mb-0 px-[18px] pb-1.5 pt-1">Popular right now</li>
          )}
          {matches.map((s, i) => (
            <li key={s.label}>
              <button
                id={`${listboxId}-${i}`}
                type="button"
                role="option"
                aria-selected={i === highlighted}
                // pointerdown fires before the input's blur, so the click is
                // not swallowed by the close-on-outside handler.
                onPointerDown={(e) => {
                  e.preventDefault();
                  choose(s);
                  go(s.label, s.type);
                }}
                onMouseEnter={() => setHighlighted(i)}
                className={`flex w-full cursor-pointer items-center gap-3 px-[18px] py-2.5 text-left text-sm transition-colors duration-150 ${
                  i === highlighted ? 'bg-surface' : ''
                }`}
              >
                <span aria-hidden className="w-4 flex-none text-ink-400">
                  {TYPE_GLYPH[s.type]}
                </span>
                <span className="flex-1 text-ink-900">{s.label}</span>
                <span className="text-[12.5px] font-semibold text-ink-400">
                  {JOB_TYPE_LABELS[s.type]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
