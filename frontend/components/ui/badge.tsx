import * as React from 'react';

import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning';
}

const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
      variant === 'default' && 'bg-muted text-foreground',
      variant === 'success' && 'bg-green-500/15 text-green-600',
      variant === 'warning' && 'bg-amber-500/15 text-amber-600',
      className
    )}
    {...props}
  />
);

export { Badge };
