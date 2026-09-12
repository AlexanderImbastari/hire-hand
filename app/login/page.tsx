'use client';

import { SiteNav } from '@/components/AppHeader';
import { IdentityPicker } from '@/components/IdentityPicker';

export default function LoginPage() {
  return (
    <>
      <SiteNav />
      <IdentityPicker />
    </>
  );
}
