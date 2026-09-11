'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import { getAccount } from '@/shared/data';
import {
  getServerSessionSnapshot,
  getSessionSnapshot,
  sessionFor,
  setSession,
  subscribeSession,
} from '@/shared/session';
import type { Account, Session } from '@/shared/types';

interface SessionContextValue {
  session: Session | null;
  account: Account | null;
  /** Bumped after any write, to re-run data reads. */
  revision: number;
  signIn: (account: Account) => void;
  signOut: () => void;
  refresh: () => void;
  ready: boolean;
}

const SessionContext = createContext<SessionContextValue | null>(null);

const noopSubscribe = () => () => {};

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const session = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );

  // `localStorage` only exists in the browser, so the first paint is
  // deliberately blank rather than flashing a signed-out state at someone who
  // is in fact signed in.
  const ready = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  const [revision, setRevision] = useState(0);
  const [loaded, setLoaded] = useState<{
    actorId: string;
    account: Account;
  } | null>(null);

  useEffect(() => {
    if (!session) return;
    let live = true;
    getAccount(session)
      .then((account) => {
        if (live) setLoaded({ actorId: session.actorId, account });
      })
      .catch(() => {
        if (live) setLoaded(null);
      });
    return () => {
      live = false;
    };
  }, [session, revision]);

  // Derived rather than stored, so signing out or switching identity takes
  // effect on the same render instead of one behind.
  const account =
    session && loaded?.actorId === session.actorId ? loaded.account : null;

  const signIn = useCallback((next: Account) => {
    setSession(sessionFor(next));
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
  }, []);

  const refresh = useCallback(() => setRevision((r) => r + 1), []);

  const value = useMemo(
    () => ({ session, account, revision, signIn, signOut, refresh, ready }),
    [session, account, revision, signIn, signOut, refresh, ready],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside a SessionProvider');
  return ctx;
}

/** For screens that only render when signed in. */
export function useRequiredSession(): SessionContextValue & {
  session: Session;
} {
  const ctx = useSession();
  if (!ctx.session) throw new Error('No active session');
  return ctx as SessionContextValue & { session: Session };
}
