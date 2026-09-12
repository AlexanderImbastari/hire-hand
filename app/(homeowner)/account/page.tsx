'use client';

import { useSession } from '@/components/SessionProvider';

/**
 * Homeowner account. No billing surface of any kind lives here — homeowners
 * never pay, and showing them a plan would imply otherwise.
 */
export default function AccountPage() {
  const { account, signOut } = useSession();
  if (account?.role !== 'user') return null;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="text-[28px] font-extrabold tracking-[-0.02em]">Account</h1>
      <p className="mt-1 text-[13.5px] text-ink-500">
        Posting is free, and always will be — no posting fee, no booking fee, no
        commission.
      </p>

      <div className="mt-8 rounded-lg border border-line">
        <Row label="Name" value={account.name} />
        <Row label="Email" value={account.email} />
        <Row label="Phone" value={account.phone} />
        <Row label="Account type" value="Homeowner" />
      </div>

      <p className="mt-4 text-[12.5px] leading-[1.55] text-ink-500">
        Your phone and email go to a contractor only when you accept their
        quote. Until then, a job shows its city and ZIP and nothing else.
      </p>

      <div className="mt-8 rounded-lg border border-line bg-surface-alt p-5">
        <p className="text-[13px] font-bold">Editing lands in phase 2</p>
        <p className="mt-1.5 text-[12.5px] leading-[1.55] text-ink-500">
          Details are read-only while accounts live in the browser. They become
          editable once accounts move to the database.
        </p>
      </div>

      <button onClick={signOut} className="btn-secondary mt-8">
        Sign out
      </button>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line px-5 py-4 last:border-b-0">
      <span className="label mb-0">{label}</span>
      <span className="text-[15px] font-semibold">{value || '—'}</span>
    </div>
  );
}
