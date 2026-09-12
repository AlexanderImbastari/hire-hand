'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Logo } from './ui/Logo';
import { useSession } from './SessionProvider';

/**
 * Sticky top nav: logo lockup left, identity and the post-a-job CTA right.
 * Under 768px it collapses to logo + hamburger, per the responsive spec.
 *
 * The prototype's tab strip was a prototype affordance and is deliberately not
 * reproduced — navigation is real routing.
 */
export function SiteNav() {
  const { account, signOut } = useSession();
  const pathname = usePathname();
  // Remember which route the menu was opened on rather than closing it from an
  // effect: navigating changes `pathname`, so the menu closes during render.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;
  const setOpen = (next: boolean) => setOpenedOn(next ? pathname : null);

  const isContractor = account?.role === 'contractor';

  const links = isContractor
    ? [
        { href: '/jobs', label: 'Open jobs' },
        { href: '/quotes', label: 'Your quotes' },
        { href: '/pricing', label: 'Pricing' },
      ]
    : [
        ...(account ? [{ href: '/dashboard', label: 'Your jobs' }] : []),
        { href: '/pricing', label: 'For contractors' },
      ];

  const cta = isContractor
    ? { href: '/jobs', label: 'Browse jobs ↗' }
    : { href: '/jobs/new', label: 'Post a job ↗' };

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas">
      <div className="flex items-center gap-5 px-6 py-3.5">
        <Link href="/" aria-label="HireHand home">
          <Logo size={32} />
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.href} href={l.href} active={pathname === l.href}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="hidden items-center gap-3 md:flex">
          {account ? (
            <>
              <span className="hidden whitespace-nowrap text-[13px] font-semibold text-ink-500 lg:inline">
                {isContractor ? account.company : account.name}
              </span>
              <button
                onClick={signOut}
                className="cursor-pointer whitespace-nowrap text-[13px] font-semibold text-ink-500 transition-colors duration-150 hover:text-ink-900"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="whitespace-nowrap text-[13px] font-semibold text-ink-500 transition-colors duration-150 hover:text-ink-900"
            >
              Login / Register
            </Link>
          )}
          <Link href={cta.href} className="btn-pill-dark">
            {cta.label}
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="flex size-11 cursor-pointer items-center justify-center rounded-md text-ink-900 transition-colors duration-150 hover:bg-surface md:hidden"
        >
          <span aria-hidden className="text-lg">
            {open ? '✕' : '☰'}
          </span>
        </button>
      </div>

      {open && (
        <div className="border-t border-line px-6 py-4 md:hidden">
          <nav className="flex flex-col">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`flex min-h-11 items-center text-[15px] font-semibold ${
                  pathname === l.href ? 'text-ink-900' : 'text-ink-500'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <Link href={cta.href} className="btn-pill-dark mt-3 w-full">
            {cta.label}
          </Link>

          <div className="mt-4 flex min-h-11 items-center justify-between border-t border-line pt-3">
            {account ? (
              <>
                <span className="text-[13px] font-semibold text-ink-500">
                  {isContractor ? account.company : account.name}
                </span>
                <button
                  onClick={signOut}
                  className="cursor-pointer text-[13px] font-semibold text-ink-500"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-[13px] font-semibold text-ink-500"
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold transition-colors duration-150 ${
        active ? 'bg-surface text-ink-900' : 'text-ink-500 hover:text-ink-900'
      }`}
    >
      {children}
    </Link>
  );
}
