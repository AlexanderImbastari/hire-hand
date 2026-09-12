'use client';

import Link from 'next/link';
import type { Role } from '@/shared/types';
import { SiteNav } from './AppHeader';
import { useSession } from './SessionProvider';

/**
 * The guard behind each role's route group layout.
 *
 * An account has exactly one role, fixed at signup, so a mismatch is never a
 * permissions question to negotiate — it is simply the wrong door. Gating here
 * rather than per-page means a new route inside a group is protected the moment
 * it exists, without anyone remembering to wrap it.
 */
export function RoleLayout({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const { account, ready } = useSession();

  // localStorage only exists in the browser; rendering nothing for one frame
  // beats flashing a signed-out state at someone who is in fact signed in.
  if (!ready) return null;

  if (!account) {
    return (
      <Gate
        title="Sign in to continue"
        body="You need an account to get any further. Signing up takes a moment and is free for homeowners."
        actions={[
          { href: '/login', label: 'Log in', primary: true },
          { href: '/signup', label: 'Create an account' },
        ]}
      />
    );
  }

  if (account.role !== role) {
    return account.role === 'contractor' ? (
      <Gate
        title="That page is for homeowners"
        body="You are signed in as a contractor. Open jobs and the quotes you have sent live on your side of the app."
        actions={[{ href: '/browse', label: 'Browse open jobs', primary: true }]}
      />
    ) : (
      <Gate
        title="That page is for contractors"
        body="You are signed in as a homeowner. Your posted jobs and the quotes on them live on your side of the app."
        actions={[{ href: '/jobs', label: 'Go to your jobs', primary: true }]}
      />
    );
  }

  // Approval is a precondition for everything a contractor does — browsing
  // included — so it is enforced at the group, not on individual pages.
  if (account.role === 'contractor' && !account.approved) {
    return (
      <Gate
        title="Your account is awaiting approval"
        body="Browsing jobs and sending quotes both unlock once HireHand approves your contractor account. Nothing else is available until then."
        actions={[{ href: '/pricing', label: 'See what you get', primary: true }]}
      />
    );
  }

  return (
    <>
      <SiteNav />
      {children}
    </>
  );
}

function Gate({
  title,
  body,
  actions,
}: {
  title: string;
  body: string;
  actions: { href: string; label: string; primary?: boolean }[];
}) {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="text-[26px] font-extrabold tracking-[-0.02em]">{title}</h1>
        <p className="mx-auto mt-3 text-[15px] leading-[1.6] text-ink-500">
          {body}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {actions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={a.primary ? 'btn-primary' : 'btn-secondary'}
            >
              {a.label}
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
