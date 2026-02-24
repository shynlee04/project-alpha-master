import { cn } from "@/lib/utils"

/**
 * Skeleton Component
 * 
 * 8-bit styled loading placeholder with step-based animation.
 * Uses rounded-none for sharp corners and pixel-pulse for authentic 8-bit feel.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        // 8-bit aesthetic: rounded-none, pixel-pulse animation
        "bg-accent rounded-none animate-pixel-pulse",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
