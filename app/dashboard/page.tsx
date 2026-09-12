'use client';

import { RequireUser } from '@/components/App';
import { SiteNav } from '@/components/AppHeader';
import { UserDashboard } from '@/components/UserDashboard';

export default function DashboardPage() {
  return (
    <RequireUser>
      {() => (
        <>
          <SiteNav />
          <UserDashboard />
        </>
      )}
    </RequireUser>
  );
}
