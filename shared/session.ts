/**
 * Phase-1 sign-in: remember which fixture identity was picked.
 *
 * Modelled as a tiny external store rather than React state, so components can
 * read it with `useSyncExternalStore` — the session genuinely lives outside
 * React, in `localStorage`, and this keeps the server and client renders
 * honest about that. Phase 2 swaps the body for a real auth token; `Session`
 * keeps its shape, so `data.ts` and every caller stay as they are.
 */

import type { Account, Session } from './types';

const SESSION_KEY = 'hirehand:session:v1';

export function sessionFor(account: Account): Session {
  return { actorId: account.id, role: account.role };
}

function readStored(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    return parsed?.actorId && parsed?.role ? parsed : null;
  } catch {
    return null;
  }
}

/** `undefined` means "not yet read from storage". */
let current: Session | null | undefined;
const listeners = new Set<() => void>();

/**
 * Must stay identity-stable between changes or `useSyncExternalStore` will
 * loop, hence the cache.
 */
export function getSessionSnapshot(): Session | null {
  if (current === undefined) current = readStored();
  return current;
}

/** During SSR and hydration nobody is signed in yet. */
export function getServerSessionSnapshot(): Session | null {
  return null;
}

export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setSession(session: Session | null): void {
  current = session;
  if (typeof window !== 'undefined') {
    try {
      if (session) {
        window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      } else {
        window.localStorage.removeItem(SESSION_KEY);
      }
    } catch {
      /* private mode — the session just won't survive a refresh */
    }
  }
  listeners.forEach((l) => l());
}
