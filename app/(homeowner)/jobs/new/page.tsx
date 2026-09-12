'use client';

import { Suspense } from 'react';
import { JobForm } from '@/components/JobForm';

export default function NewJobPage() {
  return (
    // useSearchParams needs a boundary for prerendering.
    <Suspense
      fallback={
        <div className="px-6 py-8 sm:px-12">
          <div className="h-8 w-48 animate-pulse rounded bg-rule" />
        </div>
      }
    >
      <JobForm />
    </Suspense>
  );
}
