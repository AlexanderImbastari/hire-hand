'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { SiteNav } from '@/components/AppHeader';
import { useSession } from '@/components/SessionProvider';
import { ErrorText, Input, Label } from '@/components/ui/Field';
import { createAccount } from '@/shared/data';
import { JOB_TYPE_LABELS } from '@/shared/format';
import { JOB_TYPES, type JobType, type Role } from '@/shared/types';

/**
 * Signup — the one place a role is ever chosen.
 *
 * An account is a homeowner or a contractor for its whole life. Someone who is
 * both makes two accounts; that keeps every downstream question ("can this
 * person quote?", "whose address is this?") answerable from the account alone.
 */
export default function SignupPage() {
  return (
    <>
      <SiteNav />
      <Suspense fallback={null}>
        <SignupForm />
      </Suspense>
    </>
  );
}

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { signIn } = useSession();

  const preset = params.get('role');
  const [role, setRole] = useState<Role | null>(
    preset === 'contractor' ? 'contractor' : preset === 'user' ? 'user' : null,
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [zips, setZips] = useState('');
  const [trades, setTrades] = useState<JobType[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Step 1 — choose a side. Nothing else is asked until this is answered.
  if (role === null) {
    return (
      <main className="mx-auto w-full max-w-2xl px-6 py-16">
        <h1 className="text-[34px] font-extrabold tracking-[-0.025em]">
          Create your account
        </h1>
        <p className="mt-2.5 text-[15px] leading-[1.6] text-ink-500">
          Which side are you on? This is fixed once the account exists — if you
          need both, make two accounts.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <RoleCard
            onClick={() => setRole('user')}
            title="I need work done"
            sub="Homeowner"
            body="Post a job, collect quotes from approved local contractors, pick the one you want. Always free."
          />
          <RoleCard
            onClick={() => setRole('contractor')}
            title="I work in the trades"
            sub="Contractor"
            body="Browse every open job in your area in full detail, free. Three free quotes, then $20/month for unlimited."
          />
        </div>

        <p className="mt-8 text-[13.5px] text-ink-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-orange-500 hover:text-orange-600">
            Log in
          </Link>
        </p>
      </main>
    );
  }

  const isContractor = role === 'contractor';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Name and email are both needed.');
      return;
    }
    if (isContractor && (!company.trim() || trades.length === 0 || !zips.trim())) {
      setError('Company, at least one trade and at least one ZIP are needed.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const account = await createAccount(
        isContractor
          ? {
              role: 'contractor',
              name: name.trim(),
              email: email.trim(),
              phone: phone.trim(),
              company: company.trim(),
              serviceZips: zips
                .split(/[,\s]+/)
                .map((z) => z.trim())
                .filter(Boolean),
              jobTypes: trades,
            }
          : {
              role: 'user',
              name: name.trim(),
              email: email.trim(),
              phone: phone.trim(),
            },
      );
      signIn(account);
      router.push(isContractor ? '/browse' : '/jobs');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-xl px-6 py-16">
      <button
        onClick={() => setRole(null)}
        className="cursor-pointer text-[13px] font-semibold text-ink-500 transition-colors duration-150 hover:text-ink-900"
      >
        ← Choose a different account type
      </button>

      <h1 className="mt-4 text-[34px] font-extrabold tracking-[-0.025em]">
        {isContractor ? 'Contractor account' : 'Homeowner account'}
      </h1>
      <p className="mt-2 text-[15px] leading-[1.6] text-ink-500">
        {isContractor
          ? 'Tell us what you do and where, so we only show you jobs worth your time.'
          : 'Just enough to let contractors reach you once you accept a quote.'}
      </p>

      <form onSubmit={submit} className="mt-8">
        <div className="mb-5">
          <Label htmlFor="su-name">Your name</Label>
          <Input
            id="su-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dana Whitfield"
          />
        </div>

        {isContractor && (
          <div className="mb-5">
            <Label htmlFor="su-company">Company</Label>
            <Input
              id="su-company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Okonkwo Plumbing & Electric"
            />
          </div>
        )}

        <div className="mb-5">
          <Label htmlFor="su-email">Email</Label>
          <Input
            id="su-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="mb-5">
          <Label htmlFor="su-phone">Phone</Label>
          <Input
            id="su-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(415) 555-0118"
          />
          <p className="mt-2 text-[12.5px] text-ink-500">
            {isContractor
              ? 'Shown to a homeowner once they accept your quote.'
              : 'Shared only with the contractor whose quote you accept.'}
          </p>
        </div>

        {isContractor && (
          <>
            <div className="mb-5">
              <Label>Trades you work in</Label>
              <div className="flex flex-wrap gap-2">
                {JOB_TYPES.map((t) => {
                  const on = trades.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() =>
                        setTrades((prev) =>
                          prev.includes(t)
                            ? prev.filter((x) => x !== t)
                            : [...prev, t],
                        )
                      }
                      aria-pressed={on}
                      className={`cursor-pointer rounded-full px-4 py-2 text-[13px] font-semibold transition-colors duration-150 ${
                        on
                          ? 'bg-ink-900 text-white'
                          : 'border border-line text-ink-700 hover:border-ink-900'
                      }`}
                    >
                      {JOB_TYPE_LABELS[t]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-5">
              <Label htmlFor="su-zips">Service area</Label>
              <Input
                id="su-zips"
                value={zips}
                onChange={(e) => setZips(e.target.value)}
                placeholder="94110, 94103"
              />
              <p className="mt-2 text-[12.5px] text-ink-500">
                ZIP codes you will travel to, separated by commas.
              </p>
            </div>
          </>
        )}

        {error && <ErrorText>{error}</ErrorText>}

        <button type="submit" disabled={busy} className="btn-primary mt-2 w-full">
          {busy ? 'Creating…' : 'Create account'}
        </button>

        <p className="mt-4 text-center text-[12.5px] text-ink-400">
          Phase 1 has no passwords — the account is created and signed in
          straight away.
        </p>
      </form>
    </main>
  );
}

function RoleCard({
  onClick,
  title,
  sub,
  body,
}: {
  onClick: () => void;
  title: string;
  sub: string;
  body: string;
}) {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-line bg-canvas p-6 text-left transition-colors duration-150 hover:border-ink-900"
    >
      <p className="label mb-0">{sub}</p>
      <p className="mt-2 text-[19px] font-extrabold tracking-[-0.02em]">
        {title}
      </p>
      <p className="mt-2 text-sm leading-[1.55] text-ink-500">{body}</p>
      <p className="mt-4 text-[13px] font-bold text-orange-500">Continue →</p>
    </button>
  );
}
