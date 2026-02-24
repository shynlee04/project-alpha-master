/**
 * @fileoverview Alert Component
 * @module presentation/components/ui/alert
 *
 * Simple alert component for displaying messages with optional severity.
 */

import { cn } from '@/lib/utils';
import { type VariantProps, cva } from 'class-variance-authority';

const alertVariants = cva(
  // 8-bit aesthetic: rounded-none, border-2, pixel shadow
  'relative w-full rounded-none border-2 p-4 shadow-[var(--shadow-pixel-sm)]',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground border-border',
        destructive: 'border-destructive/50 text-destructive dark:border-destructive bg-destructive/5',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

export function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <div className={cn(alertVariants({ variant }), className)} {...props} />
  );
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5 className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props} />
  );
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
  );
}
