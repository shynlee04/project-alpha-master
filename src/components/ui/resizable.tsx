import * as React from "react"

import {
  Group,
  Panel,
  // @ts-ignore - Separator is expected in v4.1.0, ignore potential type mismatch for now
  Separator,
} from "react-resizable-panels"

import { cn } from "@/lib/utils"

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof Group>) {
  return (
    <Group
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
}

function ResizablePanel({
  ...props
}: React.ComponentProps<typeof Panel>) {
  return <Panel data-slot="resizable-panel" {...props} />
}

type ResizableHandleProps = React.ComponentProps<typeof Separator> & {
  withHandle?: boolean
  orientation?: 'horizontal' | 'vertical'
}

import { GripVertical } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/lib/utils'

// --- Custom Resizable Implementation Types ---

export type ImperativePanelGroupHandle = {
  getLayout: () => number[]
  setLayout: (layout: number[]) => void
  collapse: (panelId: string) => void
  expand: (panelId: string) => void
}

type Direction = 'horizontal' | 'vertical'

type ResizablePanelGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  direction: Direction
  onLayout?: (layout: number[]) => void
  autoSaveId?: string
}

type ResizablePanelProps = React.HTMLAttributes<HTMLDivElement> & {
  defaultSize?: number
  minSize?: number
  maxSize?: number
  order?: number
  id?: string
}

type ResizableHandleProps = React.HTMLAttributes<HTMLDivElement> & {
  withHandle?: boolean
  orientation?: 'horizontal' | 'vertical'
}

// --- Context ---

type ResizableContextType = {
  direction: Direction
  updateLayout: (delta: number, handleIndex: number) => void
}

const ResizableContext = React.createContext<ResizableContextType | null>(null)

// --- Components ---

const ResizablePanelGroup = React.forwardRef<ImperativePanelGroupHandle, ResizablePanelGroupProps>(
  ({ className, direction, onLayout, children, ...props }, ref) => {
    const [layout, setLayout] = React.useState<number[]>([])
    const containerRef = React.useRef<HTMLDivElement>(null)

    // Initialize layout
    React.useLayoutEffect(() => {
        let panelCount = 0
        React.Children.forEach(children, (child) => {
             if (React.isValidElement(child) && child.type === ResizablePanel) {
                 panelCount++
             }
        })
        
        if (panelCount === 0) return

        if (layout.length !== panelCount) {
             const newLayout = new Array(panelCount).fill(100 / panelCount)
             setLayout(newLayout)
        }
    }, [children, layout.length])

    React.useImperativeHandle(ref, () => ({
      getLayout: () => layout,
      setLayout: (newLayout: number[]) => {
          if (newLayout.length === layout.length) setLayout(newLayout)
      },
      collapse: (id) => {},
      expand: (id) => {}
    }))

    const updateLayout = React.useCallback((deltaPx: number, handleIndex: number) => {
        if (!containerRef.current) return
        
        const containerSize = direction === 'horizontal' 
             ? containerRef.current.clientWidth 
             : containerRef.current.clientHeight
        
        if (containerSize === 0) return

        const deltaPercent = (deltaPx / containerSize) * 100
        
        setLayout(prev => {
            const next = [...prev]
            const leftIndex = handleIndex
            const rightIndex = handleIndex + 1
            
            if (leftIndex < 0 || rightIndex >= next.length) return prev

            const newLeft = next[leftIndex] + deltaPercent
            const newRight = next[rightIndex] - deltaPercent
            
            const MIN_SIZE = 2 // % hard min

            if (newLeft < MIN_SIZE || newRight < MIN_SIZE) return prev;

            next[leftIndex] = newLeft
            next[rightIndex] = newRight
            
            if (onLayout) onLayout(next)
            
            return next
        })
    }, [direction, onLayout])

    return (
      <ResizableContext.Provider value={{ direction, updateLayout }}>
        <div
          ref={containerRef}
          data-slot="resizable-panel-group"
          className={cn(
            "flex h-full w-full",
            direction === 'vertical' ? 'flex-col' : 'flex-row',
            className
          )}
          {...props}
        >
          {(() => {
             let panelIndex = 0;
             let handleIndex = 0;
             return React.Children.map(children, (child) => {
                 if (!React.isValidElement(child)) return child;
                 
                 if (child.type === ResizablePanel) {
                     const safeSize = layout[panelIndex];
                     const size = safeSize !== undefined ? safeSize : (100 / Math.max(1, layout.length));
                     const pIndex = panelIndex++;
                     return React.cloneElement(child as React.ReactElement<any>, { 
                         _size: size, 
                         _index: pIndex 
                     })
                 }
                 
                 if (child.type === ResizableHandle) {
                     const hIndex = handleIndex++;
                     return React.cloneElement(child as React.ReactElement<any>, {
                         _index: hIndex
                     })
                 }
                 
                 return child
             })
          })()}
        </div>
      </ResizableContext.Provider>
    )
  }
)
ResizablePanelGroup.displayName = "ResizablePanelGroup"

function ResizablePanel({
  className,
  defaultSize,
  minSize,
  maxSize,
  id,
  children,
  _size,
  ...props
}: ResizablePanelProps & { _size?: number, _index?: number }) {
  return (
    <div
      data-slot="resizable-panel"
      className={cn("relative overflow-hidden", className)}
      style={{ 
          flexBasis: `${_size}%`,
          flexGrow: 0,
          flexShrink: 0,
      }}
      id={id}
      {...props}
    >
      {children}
    </div>
  )
}

function ResizableHandle({
  withHandle,
  className,
  _index,
  ...props
}: ResizableHandleProps & { _index?: number }) {
  const context = React.useContext(ResizableContext)
  
  const handleMouseDown = (e: React.MouseEvent) => {
      if (!context || _index === undefined) return
      e.preventDefault()
      e.stopPropagation()
      
      const startX = e.clientX
      const startY = e.clientY
      
      const moveHandler = (moveEvent: MouseEvent) => {
          moveEvent.preventDefault()
          moveEvent.stopPropagation()
          const deltaX = moveEvent.clientX - startX
          const deltaY = moveEvent.clientY - startY
          
          context.updateLayout(
              context.direction === 'horizontal' ? deltaX : deltaY, 
              _index
          )
      }
      
      const upHandler = () => {
          document.removeEventListener('mousemove', moveHandler)
          document.removeEventListener('mouseup', upHandler)
      }
      
      document.addEventListener('mousemove', moveHandler)
      document.addEventListener('mouseup', upHandler)
  }

  return (
    <div
      data-slot="resizable-handle"
      role="separator"
      className={cn(
        "bg-border relative flex items-center justify-center transition-colors z-50 hover:bg-primary/50",
        context?.direction === 'vertical' 
            ? "h-px w-full after:h-4 after:w-full cursor-row-resize" 
            : "w-px h-full after:w-4 after:h-full cursor-col-resize",
        context?.direction === 'vertical' ? "after:left-0 after:-top-2" : "after:top-0 after:-left-2",
        "after:absolute",
        className
      )}
      onMouseDown={handleMouseDown}
      {...props}
    >
      {withHandle && (
        <div className="bg-border z-30 flex h-4 w-3 items-center justify-center rounded-xs border shadow-sm pointer-events-none">
          <GripVertical className={cn("size-2.5", context?.direction === 'vertical' && "rotate-90")} />
        </div>
      )}
    </div>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
