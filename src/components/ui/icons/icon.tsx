import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const iconVariants = cva(
  'inline-flex items-center justify-center shrink-0',
  {
    variants: {
      size: {
        xs: 'h-3 w-3',
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
        xl: 'h-8 w-8',
        '2xl': 'h-10 w-10',
      },
      variant: {
        default: 'text-foreground',
        primary: 'text-primary',
        secondary: 'text-muted-foreground',
        destructive: 'text-destructive',
        success: 'text-success',
        warning: 'text-warning',
        info: 'text-info',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

export interface IconProps extends React.SVGProps<SVGSVGElement>, VariantProps<typeof iconVariants> {
  className?: string;
  children?: React.ReactNode;
}

const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ className, size, variant, children, ...props }, ref) => {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
        className={cn(iconVariants({ size, variant }), className)}
        {...props}
      >
        {children}
      </svg>
    );
  }
);
Icon.displayName = 'Icon';

export { Icon, iconVariants };