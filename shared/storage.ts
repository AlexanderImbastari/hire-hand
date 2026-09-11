/**
 * Phase 1 persistence.
 *
 * The whole database is one JSON blob in `localStorage`, read and written
 * through a narrow `StorageAdapter`. That narrowness is the point: phase 2
 * replaces the adapter with Postgres queries, and a React Native build swaps
 * in AsyncStorage, without either touching `data.ts`'s logic or the UI.
 */

import {
  ACCOUNTS,
  JOBS,
  QUOTES,
  SUBSCRIPTIONS,
} from './fixtures';
import type { Account, Job, Quote, Subscription } from './types';

export interface DatabaseState {
  version: number;
  accounts: Account[];
  jobs: Job[];
  quotes: Quote[];
  subscriptions: Subscription[];
}

/**
 * Bump when the fixture shape changes so stale demo data in a browser is
 * reseeded instead of deserialising into a type that no longer matches.
 */
export const SCHEMA_VERSION = 1;

export const STORAGE_KEY = 'hirehand:v1';

export interface StorageAdapter {
  read(): DatabaseState | null;
  write(state: DatabaseState): void;
  clear(): void;
}

export function seedState(): DatabaseState {
  // Deep copy so mutations never write back through to the fixture module.
  return structuredClone({
    version: SCHEMA_VERSION,
    accounts: ACCOUNTS,
    jobs: JOBS,
    quotes: QUOTES,
    subscriptions: SUBSCRIPTIONS,
  }) as DatabaseState;
}

/** Backs the app in the browser. */
export const localStorageAdapter: StorageAdapter = {
  read() {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as DatabaseState;
      if (parsed?.version !== SCHEMA_VERSION) return null;
      return parsed;
    } catch {
      // Corrupt or unreadable (private mode, cleared site data) — reseed.
      return null;
    }
  },
  write(state) {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Quota or private mode: the in-memory copy stays authoritative for
      // this tab, it just won't survive the refresh.
    }
  },
  clear() {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing useful to do */
    }
  },
};

/** Used on the server during SSR, and by any future test harness. */
export function memoryAdapter(initial?: DatabaseState): StorageAdapter {
  let state: DatabaseState | null = initial ?? null;
  return {
    read: () => (state ? structuredClone(state) : null),
    write: (next) => {
      state = structuredClone(next);
    },
    clear: () => {
      state = null;
    },
  };
}

let adapter: StorageAdapter =
  typeof window === 'undefined' ? memoryAdapter() : localStorageAdapter;

/** Swap the backing store. Phase 2's entry point. */
export function setStorageAdapter(next: StorageAdapter): void {
  adapter = next;
  cache = null;
}

let cache: DatabaseState | null = null;

/** Current state, seeding on first access. */
export function getState(): DatabaseState {
  if (cache) return cache;
  const stored = adapter.read();
  cache = stored ?? seedState();
  if (!stored) adapter.write(cache);
  return cache;
}

/** Apply a mutation and persist it. */
export function mutate<T>(fn: (state: DatabaseState) => T): T {
  const state = getState();
  const result = fn(state);
  state.version = SCHEMA_VERSION;
  adapter.write(state);
  return result;
}

/** Throw away demo data and start over from the fixtures. */
export function resetDemoData(): void {
  adapter.clear();
  cache = seedState();
  adapter.write(cache);
}
