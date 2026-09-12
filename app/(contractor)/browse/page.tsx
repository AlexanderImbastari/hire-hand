'use client';

import { ContractorDashboard } from '@/components/ContractorDashboard';
import { useSession } from '@/components/SessionProvider';

/** Contractor home: open jobs in their trades and area. Guarded by the layout. */
export default function BrowsePage() {
  const { account } = useSession();
  // The group layout has already established this; the check narrows the type.
  if (account?.role !== 'contractor') return null;
  return <ContractorDashboard contractor={account} />;
}
