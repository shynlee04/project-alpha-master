import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Progress Component
 * 
 * Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.
 * Re-implementation of Radix UI Progress without the dependency.
 * 
 * 8-bit aesthetic: rounded-none, border-2
 */
const Progress = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value?: number | null }
>(({ className, value, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            // 8-bit aesthetic: rounded-none, border-2
            "relative h-4 w-full overflow-hidden rounded-none border-2 border-border bg-secondary",
            className
        )}
        {...props}
    >
        <div
            className="h-full w-full flex-1 bg-primary transition-all"
            style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
    </div>
))
Progress.displayName = "Progress"

export { Progress }
