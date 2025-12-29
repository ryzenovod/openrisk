import { cn } from '@/lib/utils';

export function Toast({ message, className }: { message: string; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card px-4 py-3 text-sm shadow-[0_8px_20px_rgba(15,23,42,0.12)] dark:shadow-[0_10px_28px_rgba(0,0,0,0.4)]',
        className
      )}
    >
      {message}
    </div>
  );
}
