'use client';

import { useState } from 'react';
import { JOB_TYPE_LABELS, TIMEFRAME_LABELS } from '@/shared/format';
import {
  JOB_TYPES,
  TIMEFRAMES,
  type JobInput,
  type JobOwnerView,
} from '@/shared/types';

interface Props {
  initial?: JobOwnerView;
  busy?: boolean;
  onCancel: () => void;
  onSubmit: (input: JobInput, publish: boolean) => void;
}

function toInput(job?: JobOwnerView): JobInput {
  return {
    type: job?.type ?? 'plumbing',
    title: job?.title ?? '',
    description: job?.description ?? '',
    street: job?.street ?? '',
    city: job?.city ?? '',
    zip: job?.zip ?? '',
    timeframe: job?.timeframe ?? 'within_week',
    photos: job?.photos ?? [],
  };
}

export function JobForm({ initial, busy, onCancel, onSubmit }: Props) {
  const [form, setForm] = useState<JobInput>(() => toInput(initial));
  const [error, setError] = useState('');
  const isEdit = Boolean(initial);

  function set<K extends keyof JobInput>(key: K, value: JobInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(publish: boolean) {
    if (!form.title.trim()) return setError('Give the job a title.');
    if (!form.description.trim()) return setError('Describe what you need done.');
    if (!/^\d{5}$/.test(form.zip)) return setError('Enter a 5-digit zip code.');
    if (!form.city.trim()) return setError('Enter a city.');
    setError('');
    onSubmit(form, publish);
  }

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold tracking-tight">
        {isEdit ? 'Edit job' : 'Post a job'}
      </h2>
      <p className="meta mt-1">
        Contractors see the description, photos, and your city and zip. Your
        street address and contact details stay private until you accept a quote.
      </p>

      <div className="mt-6 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="type">
              Job type
            </label>
            <select
              id="type"
              className="field"
              value={form.type}
              onChange={(e) => set('type', e.target.value as JobInput['type'])}
            >
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {JOB_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="timeframe">
              Timeframe
            </label>
            <select
              id="timeframe"
              className="field"
              value={form.timeframe}
              onChange={(e) =>
                set('timeframe', e.target.value as JobInput['timeframe'])
              }
            >
              {TIMEFRAMES.map((t) => (
                <option key={t} value={t}>
                  {TIMEFRAME_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            className="field"
            value={form.title}
            placeholder="Kitchen sink leaking under the basin"
            onChange={(e) => set('title', e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="description">
            What needs doing
          </label>
          <textarea
            id="description"
            className="field min-h-28"
            value={form.description}
            placeholder="Describe the problem, the access, and anything a contractor should know before quoting."
            onChange={(e) => set('description', e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
          <div>
            <label className="label" htmlFor="street">
              Street address <span className="normal-case">(private)</span>
            </label>
            <input
              id="street"
              className="field"
              value={form.street}
              onChange={(e) => set('street', e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="city">
              City
            </label>
            <input
              id="city"
              className="field"
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="zip">
              Zip
            </label>
            <input
              id="zip"
              className="field"
              inputMode="numeric"
              maxLength={5}
              value={form.zip}
              onChange={(e) => set('zip', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="photos">
            Photo URLs <span className="normal-case">(one per line)</span>
          </label>
          <textarea
            id="photos"
            className="field min-h-16"
            value={form.photos.join('\n')}
            placeholder="https://…"
            onChange={(e) =>
              set(
                'photos',
                e.target.value.split('\n').map((p) => p.trim()).filter(Boolean),
              )
            }
          />
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-clay">{error}</p>}

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          className="btn-primary"
          disabled={busy}
          onClick={() => submit(true)}
        >
          {isEdit ? 'Save changes' : 'Post job'}
        </button>
        {!isEdit && (
          <button
            className="btn-secondary"
            disabled={busy}
            onClick={() => submit(false)}
          >
            Save as draft
          </button>
        )}
        <button className="btn-ghost" disabled={busy} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
