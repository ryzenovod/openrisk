import * as React from 'react';

import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning';
}

const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
      variant === 'default' && 'bg-muted text-foreground',
      variant === 'success' && 'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-200',
      variant === 'warning' && 'bg-amber-500/15 text-amber-600 dark:bg-amber-400/20 dark:text-amber-200',
      className
    )}
    {...props}
  />
);

export { Badge };
