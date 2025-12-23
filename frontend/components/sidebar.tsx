'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, ClipboardCheck, Database, LayoutDashboard, Settings } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';

const navItems = [
  { href: '/', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/score', label: 'Скоринг заявки', icon: ClipboardCheck },
  { href: '/optimize', label: 'Оптимизация портфеля', icon: Database },
  { href: '/jobs', label: 'Задачи', icon: Activity }
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-72 flex-col border-r border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Кредитный риск</p>
          <h1 className="text-xl font-semibold">MVP консоль</h1>
        </div>
        <ThemeToggle />
      </div>
      <nav className="mt-10 flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition',
                active
                  ? 'bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(255,59,48,0.35)]'
                  : 'text-foreground hover:bg-muted'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="rounded-2xl bg-muted p-4 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">Realtime синхронизация</p>
        <p>События SSE + asyncio-примитивы</p>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Settings className="h-3 w-3" />
        API‑ключ обязателен
      </div>
    </aside>
  );
}
