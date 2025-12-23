import './globals.css';

import { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';

import { Sidebar } from '@/components/sidebar';

export const metadata: Metadata = {
  title: 'Credit Risk MVP',
  description: 'AI-powered credit risk assessment and optimization.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 bg-background p-6">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
