'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createJob, getJobForOwner, publishJob, updateJob } from '@/shared/data';
import { JOB_TYPE_LABELS, TIMEFRAME_SHORT } from '@/shared/format';
import {
  JOB_TYPES,
  TIMEFRAMES,
  type JobType,
  type Timeframe,
} from '@/shared/types';
import { useRequiredSession } from './SessionProvider';
import { ErrorText, Input, Label, Textarea } from './ui/Field';

const TYPE_GLYPH: Record<JobType, string> = {
  plumbing: '◍',
  electrical: '◈',
  landscaping: '✿',
};

/** Downscale in the browser so a phone photo fits phase 1's localStorage. */
async function toStoredPhoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 900 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.72);
}

export function JobForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { session, refresh } = useRequiredSession();
  const fileRef = useRef<HTMLInputElement>(null);

  const editId = params.get('edit');

  const [type, setType] = useState<JobType>(
    (params.get('type') as JobType) ?? 'plumbing',
  );
  const [title, setTitle] = useState(params.get('title') ?? '');
  const [description, setDescription] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState(params.get('zip') ?? '');
  const [timeframe, setTimeframe] = useState<Timeframe>('asap');
  const [photos, setPhotos] = useState<string[]>([]);

  const [loaded, setLoaded] = useState(!editId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editId) return;
    let live = true;
    getJobForOwner(session, editId)
      .then((job) => {
        if (!live) return;
        setType(job.type);
        setTitle(job.title);
        setDescription(job.description);
        setStreet(job.street);
        setCity(job.city);
        setZip(job.zip);
        setTimeframe(job.timeframe);
        setPhotos(job.photos);
        setLoaded(true);
      })
      .catch((e) => live && setError(e.message));
    return () => {
      live = false;
    };
  }, [session, editId]);

  // Honest progress: how much of what a contractor needs is actually filled in.
  const steps = [
    Boolean(title.trim()),
    Boolean(description.trim()),
    Boolean(street.trim() && city.trim() && zip.trim()),
  ];
  const done = steps.filter(Boolean).length;

  async function save(publish: boolean) {
    if (!title.trim() || !description.trim() || !zip.trim() || !city.trim() || !street.trim()) {
      setError('Fill in the title, description and full address first.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const input = {
        type,
        title: title.trim(),
        description: description.trim(),
        street: street.trim(),
        city: city.trim(),
        zip: zip.trim(),
        timeframe,
        photos,
      };
      if (editId) {
        await updateJob(session, editId, input);
        if (publish) await publishJob(session, editId);
      } else {
        await createJob(session, input, { publish });
      }
      refresh();
      router.push('/jobs');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  }

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    try {
      const added = await Promise.all(Array.from(files).slice(0, 4).map(toStoredPhoto));
      setPhotos((prev) => [...prev, ...added].slice(0, 8));
    } catch {
      setError('That image could not be read.');
    }
  }

  if (!loaded) {
    return (
      <div className="px-6 py-8 sm:px-12">
        <div className="h-8 w-48 animate-pulse rounded bg-rule" />
      </div>
    );
  }

  return (
    <div className="grid gap-9 px-6 pb-[72px] pt-8 sm:px-12 lg:grid-cols-[1fr_340px]">
      <div>
        <h1 className="text-[28px] font-extrabold tracking-[-0.02em]">
          {editId ? 'Edit job' : 'Post a job'}
        </h1>
        <p className="mt-1 text-[13.5px] text-ink-500">
          {editId
            ? 'Changes are live for contractors as soon as you save.'
            : 'Save it as a draft and publish when you are ready.'}
        </p>

        <div className="mt-[18px] flex gap-1.5" aria-hidden>
          {steps.map((filled, i) => (
            <div
              key={i}
              className={`h-[5px] flex-1 rounded-full ${
                filled ? 'bg-orange-500' : 'bg-disabled'
              }`}
            />
          ))}
        </div>
        <p className="sr-only">{done} of 3 sections complete</p>

        <p className="mt-[30px] text-[13px] font-bold">
          What kind of work is it?
        </p>
        <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {JOB_TYPES.map((t) => {
            const on = type === t;
            return (
              <button
                key={t}
                onClick={() => setType(t)}
                aria-pressed={on}
                className={`cursor-pointer rounded-[13px] p-[18px] text-left transition-colors duration-150 ${
                  on
                    ? 'border-2 border-orange-500 bg-accent-wash'
                    : 'border border-line hover:border-ink-900'
                }`}
              >
                <span aria-hidden className="text-lg">
                  {TYPE_GLYPH[t]}
                </span>
                <span className="mt-2 block text-[15px] font-bold">
                  {JOB_TYPE_LABELS[t]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-[26px]">
          <Label htmlFor="job-title">Title</Label>
          <Input
            id="job-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Water heater leaking in basement"
          />
        </div>

        <div className="mt-[22px]">
          <Label htmlFor="job-description">Describe the problem</Label>
          <Textarea
            id="job-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="h-[120px] leading-[1.55]"
            placeholder="What's happening, how long it's been going on, anything a contractor should know before quoting…"
          />
        </div>

        <div className="mt-[22px]">
          <Label htmlFor="job-street">Street address</Label>
          <Input
            id="job-street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="1841 Harrison St, Apt 3"
          />
          <p className="mt-2 text-[12.5px] text-ink-500">
            Private. Shared only with the contractor whose quote you accept.
          </p>
        </div>

        <div className="mt-[22px] grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="job-city">City</Label>
            <Input
              id="job-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="San Francisco"
            />
          </div>
          <div>
            <Label htmlFor="job-zip">ZIP code</Label>
            <Input
              id="job-zip"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              inputMode="numeric"
              placeholder="94110"
            />
          </div>
        </div>

        <div className="mt-[22px]">
          <Label>Timeframe</Label>
          <div className="flex flex-wrap gap-2">
            {TIMEFRAMES.map((tf) => {
              const on = timeframe === tf;
              return (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  aria-pressed={on}
                  className={`flex-1 cursor-pointer rounded-[11px] px-2 py-3.5 text-center text-[13.5px] transition-colors duration-150 ${
                    on
                      ? 'bg-ink-900 font-bold text-white'
                      : 'border border-line font-semibold hover:border-ink-900'
                  }`}
                >
                  {TIMEFRAME_SHORT[tf]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-[22px]">
          <Label>Photos</Label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photos.map((src, i) => (
              <div
                key={`${src.slice(0, 24)}-${i}`}
                className="relative h-[110px] overflow-hidden rounded-md bg-photo-tint"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Job photo ${i + 1}`}
                  className="absolute inset-0 size-full object-cover"
                />
                <button
                  onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                  aria-label={`Remove photo ${i + 1}`}
                  className="absolute right-1.5 top-1.5 cursor-pointer rounded-full bg-ink-900/70 px-2 py-0.5 text-xs font-bold text-white"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() => fileRef.current?.click()}
              className="flex h-[110px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-line-strong text-[12.5px] font-semibold text-ink-400 transition-colors duration-150 hover:border-ink-900 hover:text-ink-700"
            >
              <span aria-hidden className="text-lg">
                +
              </span>
              Add photo
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              void addPhotos(e.target.files);
              e.target.value = '';
            }}
          />
        </div>

        {error && <ErrorText>{error}</ErrorText>}

        <div className="mt-[30px] flex flex-wrap gap-3">
          <button
            onClick={() => save(true)}
            disabled={busy}
            className="btn-primary"
          >
            {busy ? 'Saving…' : editId ? 'Save and publish' : 'Post the job'}
          </button>
          <button
            onClick={() => save(false)}
            disabled={busy}
            className="btn-secondary"
          >
            Save draft
          </button>
        </div>
      </div>

      {/* Preview rail */}
      <aside>
        <div className="lg:sticky lg:top-24">
          <div className="rounded-[16px] border border-line bg-surface-alt p-[22px]">
            <p className="label mb-0">How contractors see it</p>
            <div className="mt-3.5 overflow-hidden rounded-[13px] border border-line bg-canvas">
              <div className="relative h-[100px] bg-photo-tint">
                {photos[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photos[0]}
                    alt=""
                    className="absolute inset-0 size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-[repeating-linear-gradient(135deg,var(--color-photo-stripe)_0_9px,var(--color-photo-tint)_9px_18px)]">
                    <span className="font-mono text-[11px] text-ink-400">
                      No photo
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3.5">
                <p className="text-[14.5px] font-bold">
                  {title.trim() || 'Your job title'}
                </p>
                <p className="mt-1.5 text-[12.5px] text-ink-500">
                  {JOB_TYPE_LABELS[type]} · {TIMEFRAME_SHORT[timeframe]} ·{' '}
                  {city.trim() || 'City'} {zip.trim()}
                </p>
              </div>
            </div>
            <p className="mt-3.5 text-[12.5px] leading-[1.55] text-ink-500">
              Only your city and ZIP are public. Street address and phone stay
              hidden until you accept a quote.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
