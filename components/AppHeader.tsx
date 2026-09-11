'use client';

import { useState } from 'react';
import { devResetData } from '@/shared/data';
import type { Account } from '@/shared/types';
import { DevPanel } from './DevPanel';
import { useSession } from './SessionProvider';

export function AppHeader({ account }: { account: Account }) {
  const { signOut, refresh } = useSession();
  const [devOpen, setDevOpen] = useState(false);

  function resetData() {
    devResetData();
    signOut();
    refresh();
  }

  return (
    <>
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-3 px-5 py-3">
          <div className="mr-auto">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              HireHand
            </p>
            <p className="text-sm font-medium">
              {account.name}
              <span className="meta">
                {' '}
                ·{' '}
                {account.role === 'user'
                  ? 'Homeowner'
                  : account.company}
              </span>
            </p>
          </div>
          {account.role === 'contractor' && (
            <button
              className="btn-ghost text-xs"
              onClick={() => setDevOpen((v) => !v)}
            >
              {devOpen ? 'Hide' : 'Demo'} controls
            </button>
          )}
          <button className="btn-ghost text-xs" onClick={resetData}>
            Reset demo data
          </button>
          <button className="btn-secondary text-xs" onClick={signOut}>
            Switch identity
          </button>
        </div>
      </header>
      {devOpen && account.role === 'contractor' && (
        <DevPanel contractor={account} />
      )}
    </>
  );
}
