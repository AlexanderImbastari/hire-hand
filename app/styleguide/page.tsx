'use client';

import Image from 'next/image';
import { SiteNav } from '@/components/AppHeader';
import { DevPanel } from '@/components/DevPanel';
import { JobCard } from '@/components/JobCard';
import { useSession } from '@/components/SessionProvider';
import { JobTypeTag, StatusTag } from '@/components/StatusBadge';
import { Illustration, Input, Label, PriceInput, Textarea } from '@/components/ui/Field';
import { Logo, LogoMark } from '@/components/ui/Logo';
import { JOB_TYPES, type JobStatus } from '@/shared/types';

/**
 * Internal reference, not a product route. Everything here reads from the same
 * tokens and components the product uses, so it cannot drift from the app.
 */

const COLORS: { token: string; hex: string; use: string }[] = [
  { token: 'orange-500', hex: '#FF5A36', use: 'Primary action, links, quote counts' },
  { token: 'orange-600', hex: '#E44A28', use: 'Primary hover / pressed' },
  { token: 'orange-50', hex: '#FFF1EC', use: 'Accent surface, Open status' },
  { token: 'ink-900', hex: '#141210', use: 'Body text, dark buttons and panels' },
  { token: 'ink-800', hex: '#1F1B17', use: 'Card on a dark panel' },
  { token: 'ink-700', hex: '#3C3833', use: 'Secondary body text' },
  { token: 'ink-500', hex: '#6B665F', use: 'Muted / supporting text' },
  { token: 'ink-400', hex: '#8A8278', use: 'Meta, placeholders, mono labels' },
  { token: 'line', hex: '#E6E3DE', use: 'All 1px borders' },
  { token: 'line-strong', hex: '#CFCAC2', use: 'Secondary button border, dashed uploads' },
  { token: 'surface', hex: '#F5F3F0', use: 'Filled chips, tinted cards' },
  { token: 'surface-alt', hex: '#FAF9F7', use: 'Sidebars, footers, page bands' },
  { token: 'canvas', hex: '#FFFFFF', use: 'Page background' },
  { token: 'dark-line', hex: '#332D26', use: 'Dividers inside dark panels' },
  { token: 'success-700', hex: '#2F6B45', use: 'Accepted status' },
  { token: 'info-700', hex: '#3C4A5E', use: 'Completed status' },
  { token: 'danger-text', hex: '#C4451F', use: 'Error text, Open tag text' },
];

const TYPE_RAMP = [
  { name: 'Display', cls: 'text-[62px] font-extrabold tracking-[-0.03em] leading-[1.02]', sample: 'Find the right pro' },
  { name: 'H1', cls: 'text-[34px] font-extrabold tracking-[-0.025em]', sample: 'Page title' },
  { name: 'H2', cls: 'text-[30px] font-extrabold tracking-[-0.02em]', sample: 'Section title' },
  { name: 'H3', cls: 'text-lg font-bold', sample: 'Card / panel title' },
  { name: 'Body-lg', cls: 'text-base leading-[1.6]', sample: 'Descriptions and longer copy.' },
  { name: 'Body', cls: 'text-sm leading-[1.55]', sample: 'Card copy sits here.' },
  { name: 'Meta', cls: 'text-[12.5px] font-semibold', sample: 'Row metadata' },
  { name: 'Label', cls: 'text-[11.5px] font-bold uppercase tracking-[0.08em]', sample: 'Field label' },
  { name: 'Mono', cls: 'font-mono text-[11px]', sample: 'JOB-2041 · 840×420' },
];

const STATUSES: JobStatus[] = ['draft', 'open', 'accepted', 'completed', 'cancelled'];

/* Fixed rather than derived from the clock: the page prerenders, so a relative
   timestamp computed at render would differ between server and client. */
const SAMPLE_RECENT = '2026-09-10T07:40:00.000Z';
const SAMPLE_OLDER = '2026-09-09T08:15:00.000Z';

export default function StyleguidePage() {
  const { account } = useSession();

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-[1100px] px-6 pb-24 pt-10 sm:px-12">
        <h1 className="text-[34px] font-extrabold tracking-[-0.025em]">
          Design system
        </h1>
        <p className="mt-2.5 max-w-2xl text-[15px] leading-[1.6] text-ink-500">
          Internal reference. Warm-neutral surfaces, near-black ink, one orange
          accent. Every swatch and component below is the same token or component
          the product renders, so this page cannot drift from the app.
        </p>

        <Section title="Logo">
          <div className="flex flex-wrap items-center gap-10">
            <div>
              <Logo size={32} />
              <p className="mt-3 font-mono text-[11px] text-ink-400">
                ink + accent — default
              </p>
            </div>
            <div className="rounded-lg bg-ink-900 p-6">
              <Logo variant="white" size={32} />
              <p className="mt-3 font-mono text-[11px] text-on-dark-muted">
                white — on ink or photo
              </p>
            </div>
            <div>
              <LogoMark variant="orange" size={32} />
              <p className="mt-3 font-mono text-[11px] text-ink-400">
                orange — favicon, app icon
              </p>
            </div>
          </div>
          <p className="mt-5 text-[13.5px] text-ink-500">
            Minimum 20px standalone, 28px with the wordmark. Clearspace is half
            the mark&rsquo;s height. Never recolour the crossbar; never put the
            ink variant on a dark ground.
          </p>
        </Section>

        <Section title="Colour">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {COLORS.map((c) => (
              <div
                key={c.token}
                className="flex items-center gap-3 rounded-md border border-line p-3"
              >
                <span
                  className="size-10 flex-none rounded-sm border border-line"
                  style={{ background: c.hex }}
                />
                <div className="min-w-0">
                  <p className="font-mono text-[11px]">{c.token}</p>
                  <p className="font-mono text-[11px] text-ink-400">{c.hex}</p>
                  <p className="mt-0.5 truncate text-[12px] text-ink-500">
                    {c.use}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[13.5px] text-ink-500">
            Orange marks exactly one primary action per view. Dark panels are
            contractor-facing or commercial moments — at most two per page.
          </p>
        </Section>

        <Section title="Type ramp">
          <div className="flex flex-col gap-5">
            {TYPE_RAMP.map((t) => (
              <div key={t.name} className="flex flex-wrap items-baseline gap-5">
                <span className="w-20 flex-none font-mono text-[11px] text-ink-400">
                  {t.name}
                </span>
                <span className={t.cls}>{t.sample}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <button className="btn-primary">Primary</button>
            <button className="btn-dark">Dark</button>
            <button className="btn-secondary">Secondary</button>
            <button className="btn-small">Small</button>
            <button className="btn-primary" disabled>
              Disabled
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button className="btn-pill-primary">Pill primary</button>
            <button className="btn-pill-dark">Pill dark</button>
            <span className="rounded-lg bg-ink-900 p-2">
              <button className="btn-pill-ghost">Pill ghost</button>
            </span>
          </div>
          <p className="mt-5 text-[13.5px] text-ink-500">
            Pills are marketing and nav only. Transitions are 120–160ms ease-out
            on colour and border, never layout.
          </p>
        </Section>

        <Section title="Tags">
          <p className="label">Job status</p>
          <div className="flex flex-wrap gap-2.5">
            {STATUSES.map((s) => (
              <StatusTag key={s} status={s} />
            ))}
          </div>
          <p className="label mt-6">Job type — always dark, never by trade</p>
          <div className="flex flex-wrap gap-2.5">
            {JOB_TYPES.map((t) => (
              <JobTypeTag key={t} type={t} />
            ))}
          </div>
        </Section>

        <Section title="Inputs">
          <div className="grid max-w-xl gap-5">
            <div>
              <Label htmlFor="sg-a">Default</Label>
              <Input id="sg-a" placeholder="Water heater leaking in basement" />
            </div>
            <div>
              <Label htmlFor="sg-b">Error</Label>
              <Input id="sg-b" invalid defaultValue="Not a ZIP" />
              <p className="mt-2 text-[12.5px] font-semibold text-danger-text">
                Enter a 5-digit ZIP code.
              </p>
            </div>
            <div>
              <Label htmlFor="sg-c">Price</Label>
              <PriceInput id="sg-c" placeholder="1,450" />
            </div>
            <div>
              <Label htmlFor="sg-d">Message</Label>
              <Textarea id="sg-d" rows={3} placeholder="What the price covers…" />
            </div>
            <div>
              <Label>Upload</Label>
              <div className="flex h-[110px] w-[110px] flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-line-strong text-[12.5px] font-semibold text-ink-400">
                <span aria-hidden className="text-lg">
                  +
                </span>
                Add photo
              </div>
            </div>
          </div>
        </Section>

        <Section title="Radius, border, elevation">
          <div className="flex flex-wrap gap-5">
            {[
              { name: 'radius-sm 9px', cls: 'rounded-sm' },
              { name: 'radius-md 12px', cls: 'rounded-md' },
              { name: 'radius-lg 18px', cls: 'rounded-lg' },
              { name: 'radius-pill', cls: 'rounded-full' },
            ].map((r) => (
              <div key={r.name}>
                <div className={`size-24 border border-line bg-surface ${r.cls}`} />
                <p className="mt-2 font-mono text-[11px] text-ink-400">{r.name}</p>
              </div>
            ))}
            <div>
              <div className="size-24 rounded-lg bg-canvas shadow-card" />
              <p className="mt-2 font-mono text-[11px] text-ink-400">shadow-card</p>
            </div>
            <div>
              <div className="size-24 rounded-lg bg-canvas shadow-float" />
              <p className="mt-2 font-mono text-[11px] text-ink-400">shadow-float</p>
            </div>
          </div>
          <p className="mt-5 text-[13.5px] text-ink-500">
            Shadows are for floating elements only — the sticky quote panel and
            the hero search bar. Everything else uses a border.
          </p>
        </Section>

        <Section title="Illustration">
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              ['/illustrations/plumbing.png', 'Plumbing'],
              ['/illustrations/electrical.png', 'Electrical'],
              ['/illustrations/landscaping.png', 'Landscaping'],
              ['/illustrations/step-post.png', '01 Post the job'],
              ['/illustrations/step-quotes.png', '02 Collect quotes'],
              ['/illustrations/step-pick.png', '03 Pick your pro'],
            ].map(([src, label]) => (
              <div
                key={src}
                className="flex flex-col items-center rounded-lg border border-line p-5"
              >
                <Illustration src={src} size={140} />
                <p className="mt-3 font-mono text-[11px] text-ink-400">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="rounded-lg border border-line bg-surface p-5">
              <p className="label">Do — on a tinted card</p>
              <div className="flex justify-center">
                <Illustration src="/illustrations/plumbing.png" size={140} />
              </div>
              <p className="mt-3 text-[13px] text-ink-500">
                The ground-removal filter cancels the render&rsquo;s near-white
                backdrop against whatever sits behind it.
              </p>
            </div>
            <div className="rounded-lg border border-line bg-surface p-5">
              <p className="label">Don&rsquo;t — filter dropped</p>
              <div className="flex justify-center">
                <Image
                  src="/illustrations/plumbing.png"
                  alt=""
                  width={140}
                  height={140}
                  style={{ width: 140, height: 140, objectFit: 'contain' }}
                />
              </div>
              <p className="mt-3 text-[13px] text-ink-500">
                Without it the residual backdrop reads as a hard grey box. Always
                check a new asset on a white <em>and</em> a tinted card.
              </p>
            </div>
          </div>
        </Section>

        <Section title="Job card">
          <div className="grid gap-4 sm:grid-cols-2">
            <JobCard
              job={{
                id: 'sample',
                type: 'plumbing',
                title: 'Water heater leaking in basement',
                description:
                  '40-gal gas unit, about nine years old, pooling water under the tank.',
                city: 'San Francisco',
                zip: '94110',
                timeframe: 'asap',
                photos: ['/photos/water-heater.jpg'],
                status: 'open',
                createdAt: SAMPLE_RECENT,
                quoteCount: 3,
              }}
            />
            <JobCard
              job={{
                id: 'sample-2',
                type: 'electrical',
                title: 'Replace failing hallway light switch',
                description:
                  'Switch buzzes and the light flickers. Single-gang box, 1920s building.',
                city: 'San Francisco',
                zip: '94103',
                timeframe: 'within_week',
                photos: [],
                status: 'open',
                createdAt: SAMPLE_OLDER,
                quoteCount: 0,
              }}
            />
          </div>
          <p className="mt-5 text-[13.5px] text-ink-500">
            The second card shows the missing-photo placeholder — the design has
            to survive a homeowner posting no photos at all.
          </p>
        </Section>

        {account?.role === 'contractor' && (
          <Section title="Demo controls">
            <DevPanel contractor={account} />
            <p className="mt-4 text-[13.5px] text-ink-500">
              Phase-1 test harness, not product surface. Approval and billing
              state come from a workflow and from Stripe in phase 2; until then
              these flip them by hand so the gates can be exercised.
            </p>
          </Section>
        )}
      </main>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-11 border-t border-line pt-9">
      <h2 className="mb-5 text-[26px] font-extrabold tracking-[-0.02em]">
        {title}
      </h2>
      {children}
    </section>
  );
}
