'use client';

import Link from 'next/link';
import type { Contractor, User } from '@/shared/types';
import { SiteNav } from './AppHeader';
import { useSession } from './SessionProvider';

/**
 * Route guards for the signed-in screens.
 *
 * Approval is a precondition, not a visibility tier: an unapproved contractor
 * is stopped here, at the route, rather than shown a hollowed-out page.
 */

export function RequireUser({
  children,
}: {
  children: (user: User) => React.ReactNode;
}) {
  const { account, ready } = useSession();
  if (!ready) return null;
  if (!account) return <SignedOutGate />;
  if (account.role !== 'user') {
    return (
      <Gate
        title="That page is for homeowners"
        body="You are signed in as a contractor. Open jobs and your quotes live on the browse screen."
        action={{ href: '/jobs', label: 'Browse open jobs' }}
      />
    );
  }
  return <>{children(account)}</>;
}

export function RequireContractor({
  children,
}: {
  children: (contractor: Contractor) => React.ReactNode;
}) {
  const { account, ready } = useSession();
  if (!ready) return null;
  if (!account) return <SignedOutGate />;
  if (account.role !== 'contractor') {
    return (
      <Gate
        title="That page is for contractors"
        body="You are signed in as a homeowner. Your posted jobs and the quotes on them live on your dashboard."
        action={{ href: '/dashboard', label: 'Go to your jobs' }}
      />
    );
  }
  if (!account.approved) {
    return (
      <Gate
        title="Your account is awaiting approval"
        body="Browsing jobs and sending quotes both unlock once HireHand approves your contractor account. Nothing else is available until then."
        action={{ href: '/pricing', label: 'See what you get' }}
      />
    );
  }
  return <>{children(account)}</>;
}

function SignedOutGate() {
  return (
    <Gate
      title="Sign in to continue"
      body="Phase 1 has no real accounts — pick one of the four fixture identities to carry on."
      action={{ href: '/login', label: 'Choose an identity' }}
    />
  );
}

function Gate({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action: { href: string; label: string };
}) {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="text-[26px] font-extrabold tracking-[-0.02em]">{title}</h1>
        <p className="mx-auto mt-3 text-[15px] leading-[1.6] text-ink-500">
          {body}
        </p>
        <Link href={action.href} className="btn-primary mt-7">
          {action.label}
        </Link>
      </main>
    </>
  );
}
