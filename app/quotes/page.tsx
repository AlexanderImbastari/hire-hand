'use client';

import { RequireContractor } from '@/components/App';
import { SiteNav } from '@/components/AppHeader';
import { ContractorQuotes } from '@/components/ContractorQuotes';

export default function QuotesPage() {
  return (
    <RequireContractor>
      {() => (
        <>
          <SiteNav />
          <ContractorQuotes />
        </>
      )}
    </RequireContractor>
  );
}
