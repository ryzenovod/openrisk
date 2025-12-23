import { cn } from '@/lib/utils';

export function Toast({ message, className }: { message: string; className?: string }) {
  return (
    <div className={cn('rounded-md border bg-card px-4 py-2 text-sm shadow', className)}>
      {message}
    </div>
  );
}
