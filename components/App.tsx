'use client';

import { ContractorDashboard } from './ContractorDashboard';
import { IdentityPicker } from './IdentityPicker';
import { AppHeader } from './AppHeader';
import { useSession } from './SessionProvider';
import { UserDashboard } from './UserDashboard';

export function App() {
  const { session, account, ready } = useSession();

  if (!ready) return null;
  if (!session || !account) return <IdentityPicker />;

  return (
    <div className="min-h-screen">
      <AppHeader account={account} />
      <main className="mx-auto w-full max-w-5xl px-5 py-8">
        {account.role === 'user' ? (
          <UserDashboard />
        ) : (
          <ContractorDashboard contractor={account} />
        )}
      </main>
    </div>
  );
}
