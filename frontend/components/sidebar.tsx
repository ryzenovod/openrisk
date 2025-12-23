'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, ClipboardCheck, Database, LayoutDashboard, Settings } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/score', label: 'Score application', icon: ClipboardCheck },
  { href: '/optimize', label: 'Portfolio optimize', icon: Database },
  { href: '/jobs', label: 'Jobs', icon: Activity }
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-64 flex-col border-r bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-muted">Credit Risk</p>
          <h1 className="text-lg font-semibold">MVP Console</h1>
        </div>
        <ThemeToggle />
      </div>
      <nav className="mt-8 flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                active ? 'bg-primary text-white' : 'text-foreground hover:bg-muted'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="rounded-lg bg-muted p-3 text-xs">
        <p className="font-semibold">Realtime sync</p>
        <p className="text-muted">SSE + asyncio primitives</p>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-muted">
        <Settings className="h-3 w-3" />
        API key protected
      </div>
    </aside>
  );
}
