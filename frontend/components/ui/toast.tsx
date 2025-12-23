import { cn } from '@/lib/utils';

export function Toast({ message, className }: { message: string; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-border bg-card px-4 py-3 text-sm shadow', className)}>
      {message}
    </div>
  );
}
