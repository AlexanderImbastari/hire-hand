'use client';

import { SiteNav } from '@/components/AppHeader';
import { RequireContractor } from '@/components/App';
import { ContractorDashboard } from '@/components/ContractorDashboard';

export default function BrowseJobsPage() {
  return (
    <RequireContractor>
      {(contractor) => (
        <>
          <SiteNav />
          <ContractorDashboard contractor={contractor} />
        </>
      )}
    </RequireContractor>
  );
}
