'use client';

import { useEffect, useState } from 'react';
import {
  devSetApproved,
  devSetSubscription,
  getSubscription,
} from '@/shared/data';
import { resetDemoData } from '@/shared/storage';
import type { Contractor, Subscription } from '@/shared/types';
import { useSession } from './SessionProvider';

/**
 * Phase-1 test harness, not product surface.
 *
 * Approval is a workflow we have not designed yet, and billing state really
 * comes from Stripe webhooks. Until both exist, this panel flips them by hand
 * so the gates they control can actually be exercised.
 */
export function DevPanel({ contractor }: { contractor: Contractor }) {
  const { session, revision, refresh } = useSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    if (!session) return;
    getSubscription(session)
      .then(setSubscription)
      .catch(() => setSubscription(null));
  }, [session, revision]);

  async function setBilling(status: Subscription['status'] | 'none') {
    await devSetSubscription(contractor.id, status);
    refresh();
  }

  const current = subscription?.status ?? 'none';

  return (
    <div className="rounded-lg border border-line bg-surface-alt p-5">
      <p className="label">Demo controls — {contractor.company}</p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[12.5px]">
        <label className="flex cursor-pointer items-center gap-2 font-semibold">
          <input
            type="checkbox"
            checked={contractor.approved}
            onChange={async (e) => {
              await devSetApproved(contractor.id, e.target.checked);
              refresh();
            }}
          />
          Approved
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-ink-500">Contractor Pro:</span>
          {(['none', 'active', 'past_due', 'cancelled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setBilling(s)}
              className={`cursor-pointer rounded-sm px-2.5 py-1.5 font-semibold transition-colors duration-150 ${
                current === s
                  ? 'bg-ink-900 text-white'
                  : 'border border-line bg-canvas hover:border-ink-900'
              }`}
            >
              {s === 'none' ? 'No sub' : s.replace('_', ' ')}
            </button>
          ))}
        </div>

        <span className="text-ink-500">
          Lifetime free quotes used: {contractor.freeQuotesUsed}
        </span>

        <button
          onClick={() => {
            resetDemoData();
            refresh();
          }}
          className="cursor-pointer rounded-sm border border-line bg-canvas px-2.5 py-1.5 font-semibold transition-colors duration-150 hover:border-ink-900"
        >
          Reset demo data
        </button>
      </div>
    </div>
  );
}
