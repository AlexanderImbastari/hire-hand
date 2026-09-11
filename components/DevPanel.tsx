'use client';

import { useEffect, useState } from 'react';
import {
  devSetApproved,
  devSetSubscription,
  getSubscription,
} from '@/shared/data';
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
    getSubscription(session).then(setSubscription).catch(() => setSubscription(null));
  }, [session, revision]);

  async function setBilling(status: Subscription['status'] | 'none') {
    await devSetSubscription(contractor.id, status);
    refresh();
  }

  const current = subscription?.status ?? 'none';

  return (
    <div className="border-b border-line bg-sunken">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3 text-xs">
        <span className="font-semibold uppercase tracking-wide text-ink-soft">
          Demo controls
        </span>

        <label className="flex items-center gap-2">
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

        <div className="flex items-center gap-2">
          <span className="text-ink-soft">Contractor Pro:</span>
          {(['none', 'active', 'past_due', 'cancelled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setBilling(s)}
              className={`rounded px-2 py-1 ${
                current === s
                  ? 'bg-brand text-white'
                  : 'border border-line bg-surface hover:bg-sunken'
              }`}
            >
              {s === 'none' ? 'No sub' : s.replace('_', ' ')}
            </button>
          ))}
        </div>

        <span className="text-ink-soft">
          Lifetime free quotes used: {contractor.freeQuotesUsed}
        </span>
      </div>
    </div>
  );
}
