/**
 * @fileoverview Temporary Tooltip Component (React 19 Compatible)
 * @module components/ui/tooltip-react19-compatible
 * @created 2026-01-08
 * 
 * TEMPORARY FIX: This replaces Radix UI Tooltip component
 * to prevent infinite loops with React 19's ref handling.
 * 
 * The issue is in Radix UI's compose-refs utility which creates
 * infinite loops with React 19's new ref handling.
 * 
 * TODO: Remove this once Radix UI releases React 19 compatible version
 */

import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  className?: string
}

export function Tooltip({ children, content, side = "top", align = "center", className }: TooltipProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const timeoutRef = React.useRef<NodeJS.Timeout>()
  const triggerRef = React.useRef<HTMLDivElement>(null)

  const handleMouseEnter = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsOpen(true)
  }, [])

  const handleMouseLeave = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 100)
  }, [])

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const positions = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  }

  const alignments = {
    start: side === "top" || side === "bottom" ? "left-0" : side === "left" ? "top-0" : "bottom-0",
    center: "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
    end: side === "top" || side === "bottom" ? "right-0" : side === "left" ? "bottom-0" : "top-0",
  }

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg pointer-events-none",
            positions[side],
            alignments[align],
            className
          )}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  )
}

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function TooltipTrigger({ children, asChild, ...props }: { 
  children: React.ReactNode
  asChild?: boolean
  [key: string]: any 
}) {
  if (asChild) {
    return React.cloneElement(children as React.ReactElement, props)
  }
  
  return <div {...props}>{children}</div>
}

export function TooltipContent({ children, ...props }: { 
  children: React.ReactNode
  [key: string]: any 
}) {
  return <div {...props}>{children}</div>
}
