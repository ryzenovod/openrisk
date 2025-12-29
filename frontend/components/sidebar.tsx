'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, ClipboardCheck, Database, LayoutDashboard, Settings, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';

const navItems = [
  { href: '/', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/score', label: 'Скоринг заявки', icon: ClipboardCheck },
  { href: '/optimize', label: 'Оптимизация портфеля', icon: Database },
  { href: '/jobs', label: 'Задачи', icon: Activity }
];

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('apiKey');
    if (stored) {
      setApiKey(stored);
      return;
    }
    const fallback = 'local-dev-key';
    setApiKey(fallback);
    localStorage.setItem('apiKey', fallback);
  }, []);

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    localStorage.setItem('apiKey', value);
  };

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col border-r border-border bg-card p-6 transition-transform md:static md:translate-x-0 md:overflow-visible overflow-y-auto',
        isOpen && 'translate-x-0'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Кредитный риск</p>
          <h1 className="text-xl font-semibold">Платформа решений</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            className="rounded-full border border-border p-2 text-muted-foreground transition hover:text-foreground md:hidden"
            aria-label="Закрыть меню"
            onClick={() => onClose?.()}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
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
        <p className="font-semibold text-foreground">Доступ к API</p>
        <p>Введите ключ, чтобы формы работали в интерфейсе.</p>
        <input
          className="mt-3 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
          placeholder="API ключ"
          value={apiKey}
          onChange={(event) => handleApiKeyChange(event.target.value)}
        />
        <p className="mt-2 text-[11px] text-muted-foreground">По умолчанию ключ уже сохранён.</p>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Settings className="h-3 w-3" />
        Ключ хранится локально в браузере
      </div>
    </aside>
  );
}
