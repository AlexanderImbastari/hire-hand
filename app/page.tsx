'use client';

import { App } from '@/components/App';
import { SessionProvider } from '@/components/SessionProvider';

/**
 * The whole product is one client-rendered page: phase 1 keeps its data in
 * `localStorage`, so there is nothing meaningful to render on the server.
 */
export default function Page() {
  return (
    <SessionProvider>
      <App />
    </SessionProvider>
  );
}
