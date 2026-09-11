import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HireHand — post a job, get quotes',
  description:
    'Homeowners post jobs, approved contractors quote on them. Phase 1 demo.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
