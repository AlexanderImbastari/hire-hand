'use client';

import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    listAccounts().then(setAccounts);
  }, []);

  function choose(account: Account) {
    signIn(account);
    router.push(account.role === 'contractor' ? '/jobs' : '/dashboard');
  }

  const homeowners = accounts.filter((a) => a.role === 'user');
  const contractors = accounts.filter((a) => a.role === 'contractor');

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <header className="mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
          Phase 1 demo
        </p>
        <h1 className="mt-2.5 text-[34px] font-extrabold tracking-[-0.025em]">
          Who are you signing in as?
        </h1>
        <p className="mt-2.5 max-w-xl text-[15px] leading-[1.6] text-ink-500">
          There are no real accounts yet. Pick a test identity — homeowners post
          jobs, contractors quote on them. You can switch at any time.
        </p>
      </header>

      <section className="mb-9">
        <p className="label">Homeowners</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {homeowners.map((account) => (
            <button
              key={account.id}
              onClick={() => choose(account)}
              className="cursor-pointer rounded-lg border border-line bg-canvas p-5 text-left transition-colors duration-150 hover:border-ink-900"
            >
              <p className="text-[15px] font-bold">{account.name}</p>
              <p className="mt-1 text-[13px] text-ink-500">{account.email}</p>
              <p className="mt-3 font-mono text-[11px] text-ink-400">
                {account.id}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className="label">Contractors</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {contractors.map((account) => {
            if (account.role !== 'contractor') return null;
            return (
              <button
                key={account.id}
                onClick={() => choose(account)}
                className="cursor-pointer rounded-lg border border-line bg-canvas p-5 text-left transition-colors duration-150 hover:border-ink-900"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[15px] font-bold">{account.company}</p>
                    <p className="mt-0.5 text-[13px] text-ink-500">
                      {account.name}
                    </p>
                  </div>
                  {!account.approved && (
                    <span className="rounded-full bg-surface px-3 py-[5px] text-[11.5px] font-bold text-ink-400">
                      Unapproved
                    </span>
                  )}
                </div>
                <p className="mt-3 text-[12.5px] font-semibold text-ink-700">
                  {account.jobTypes.map((t) => JOB_TYPE_LABELS[t]).join(' · ')}
                </p>
                <p className="text-[12.5px] text-ink-500">
                  Serves {account.serviceZips.join(', ')}
                </p>
                <p className="mt-3 font-mono text-[11px] text-ink-400">
                  {account.id}
                </p>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
