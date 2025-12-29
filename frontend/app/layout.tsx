import './globals.css';

import { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import { AppShell } from '@/components/app-shell';
import { Providers } from '@/components/providers';

const manrope = Manrope({ subsets: ['latin', 'cyrillic'], weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'Credit Risk MVP',
  description: 'Система оценки и оптимизации кредитного риска.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={manrope.className}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
