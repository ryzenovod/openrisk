import './globals.css';

import { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import { ThemeProvider } from 'next-themes';

import { Sidebar } from '@/components/sidebar';

const manrope = Manrope({ subsets: ['latin', 'cyrillic'], weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'Credit Risk MVP',
  description: 'Система оценки и оптимизации кредитного риска.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={manrope.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen bg-background">
            <Sidebar />
            <main className="flex-1 p-8">
              <div className="mx-auto w-full max-w-6xl">{children}</div>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
