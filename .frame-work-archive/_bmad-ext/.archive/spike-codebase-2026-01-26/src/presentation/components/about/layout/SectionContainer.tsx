import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

// Use a simpler type definition that works with forwardRef
type SectionContainerProps = React.HTMLAttributes<HTMLElement> & {
    children: React.ReactNode;
    fullWidth?: boolean;
} & HTMLMotionProps<'section'>;

export const SectionContainer = forwardRef<HTMLElement, SectionContainerProps>(
    ({ children, className, fullWidth = false, ...props }, ref) => {
        return (
            <motion.section
                ref={ref}
                className={cn(
                    'relative w-full py-16 md:py-24 lg:py-32 overflow-hidden',
                    className
                )}
                {...props}
            >
                <div
                    className={cn(
                        'mx-auto px-4 md:px-6 relative z-10',
                        fullWidth ? 'w-full max-w-none' : 'max-w-7xl'
                    )}
                >
                    {children}
                </div>
            </motion.section>
        );
    }
);

SectionContainer.displayName = 'SectionContainer';
