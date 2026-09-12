import type { Metadata } from 'next';
import { JetBrains_Mono, Manrope } from 'next/font/google';
import { SessionProvider } from '@/components/SessionProvider';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'HireHand — post a job, get quotes',
  description:
    'Homeowners post jobs, approved contractors quote on them. Phase 1 demo.',
  icons: { icon: '/brand/hirehand-mark-orange.svg' },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen">
        {/* Session lives above the router so every route shares one identity. */}
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
