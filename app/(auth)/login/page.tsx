'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SiteNav } from '@/components/AppHeader';
import { useSession } from '@/components/SessionProvider';
import { ErrorText, Input, Label } from '@/components/ui/Field';
import { findAccountByEmail, listAccounts } from '@/shared/data';
import type { Account } from '@/shared/types';

/**
 * Log in by email.
 *
 * Deliberately no "are you a homeowner or a contractor?" here: the account
 * already knows, and asking would imply one login could be either — the exact
 * assumption we do not want to make. Look up the account, read its role, route.
 */
export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useSession();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [demo, setDemo] = useState<Account[]>([]);

  useEffect(() => {
    listAccounts().then(setDemo).catch(() => setDemo([]));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const account = await findAccountByEmail(email);
    if (!account) {
      setError('No account with that email.');
      setBusy(false);
      return;
    }
    signIn(account);
    router.push(account.role === 'contractor' ? '/browse' : '/jobs');
  }

  return (
    <>
      <SiteNav />
      <main className="mx-auto w-full max-w-md px-6 py-16">
        <h1 className="text-[34px] font-extrabold tracking-[-0.025em]">
          Log in
        </h1>
        <p className="mt-2.5 text-[15px] leading-[1.6] text-ink-500">
          We&rsquo;ll take you to your side of HireHand.
        </p>

        <form onSubmit={submit} className="mt-8">
          <Label htmlFor="li-email">Email</Label>
          <Input
            id="li-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            invalid={Boolean(error)}
          />
          {error && <ErrorText>{error}</ErrorText>}

          <button type="submit" disabled={busy} className="btn-primary mt-5 w-full">
            {busy ? 'Checking…' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-[13.5px] text-ink-500">
          No account yet?{' '}
          <Link
            href="/signup"
            className="font-semibold text-orange-500 hover:text-orange-600"
          >
            Create one
          </Link>
        </p>

        {/* Phase-1 scaffolding: there are no passwords and nobody can be
            expected to memorise fixture emails. Goes away with real auth. */}
        {demo.length > 0 && (
          <div className="mt-10 rounded-lg border border-line bg-surface-alt p-5">
            <p className="label">Demo accounts</p>
            <p className="mb-3 text-[12.5px] text-ink-500">
              Phase 1 has no passwords. Pick one to fill the field.
            </p>
            <div className="flex flex-col gap-1.5">
              {demo.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    setEmail(a.email);
                    setError('');
                  }}
                  className="cursor-pointer rounded-sm px-2 py-2 text-left text-[13px] transition-colors duration-150 hover:bg-surface"
                >
                  <span className="font-semibold">
                    {a.role === 'contractor' ? a.company : a.name}
                  </span>
                  <span className="text-ink-400">
                    {' '}
                    · {a.role === 'contractor' ? 'contractor' : 'homeowner'}
                  </span>
                  <br />
                  <span className="font-mono text-[11px] text-ink-400">
                    {a.email}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
