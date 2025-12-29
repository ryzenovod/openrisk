'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';

import { Sidebar } from '@/components/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm md:hidden"
          aria-label="Закрыть меню"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-9 w-9 p-0" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
            <div className="leading-tight">
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">Credit risk</p>
              <p className="text-sm font-semibold">Панель решений</p>
            </div>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 px-4 py-6 md:p-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
