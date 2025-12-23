import * as React from 'react';

import { cn } from '@/lib/utils';

export function Dialog({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className={cn('w-full max-w-lg rounded-lg bg-card p-6 shadow-lg')} onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
