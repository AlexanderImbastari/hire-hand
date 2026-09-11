'use client';

import { useEffect, useState } from 'react';
import { listAccounts } from '@/shared/data';
import { JOB_TYPE_LABELS } from '@/shared/format';
import type { Account } from '@/shared/types';
import { useSession } from './SessionProvider';

/**
 * Phase-1 sign-in. There is no auth yet — you pick one of the four fixture
 * identities and the app treats you as that person.
 */
export function IdentityPicker() {
  const { signIn } = useSession();
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    listAccounts().then(setAccounts);
  }, []);

  const homeowners = accounts.filter((a) => a.role === 'user');
  const contractors = accounts.filter((a) => a.role === 'contractor');

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-16">
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
          HireHand
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Who are you signing in as?
        </h1>
        <p className="meta mt-2 max-w-xl">
          Phase 1 has no real accounts. Pick a test identity — homeowners post
          jobs, contractors quote on them. You can switch at any time.
        </p>
      </header>

      <section className="mb-8">
        <h2 className="label">Homeowners</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {homeowners.map((account) => (
            <button
              key={account.id}
              onClick={() => signIn(account)}
              className="card group p-4 text-left transition-colors hover:border-brand"
            >
              <p className="font-medium">{account.name}</p>
              <p className="meta mt-1">{account.email}</p>
              <p className="mt-3 text-xs font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100">
                Sign in →
              </p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="label">Contractors</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {contractors.map((account) => {
            if (account.role !== 'contractor') return null;
            return (
              <button
                key={account.id}
                onClick={() => signIn(account)}
                className="card group p-4 text-left transition-colors hover:border-brand"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="meta mt-0.5">{account.company}</p>
                  </div>
                  {!account.approved && (
                    <span className="badge bg-clay-soft text-clay">
                      Unapproved
                    </span>
                  )}
                </div>
                <p className="meta mt-3 text-xs">
                  {account.jobTypes.map((t) => JOB_TYPE_LABELS[t]).join(' · ')}
                </p>
                <p className="meta text-xs">
                  Serves {account.serviceZips.join(', ')}
                </p>
                <p className="mt-3 text-xs font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100">
                  Sign in →
                </p>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
