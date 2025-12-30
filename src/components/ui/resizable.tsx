import * as React from 'react'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

// --- Custom Resizable Implementation ---
// Fixes delta accumulation bug that caused panels to become tiny and unresizable

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
  registerPanel: (index: number, config: PanelConfig) => void
  startResize: (handleIndex: number, startPos: number) => void
  updateResize: (currentPos: number) => void
  endResize: () => void
}

type PanelConfig = {
  defaultSize?: number
  minSize: number
  maxSize: number
}

const ResizableContext = React.createContext<ResizableContextType | null>(null)

// --- Components ---

const ResizablePanelGroup = React.forwardRef<ImperativePanelGroupHandle, ResizablePanelGroupProps>(
  ({ className, direction, onLayout, children, ...props }, ref) => {
    const [layout, setLayout] = React.useState<number[]>([])
    const containerRef = React.useRef<HTMLDivElement>(null)
    const panelConfigsRef = React.useRef<Map<number, PanelConfig>>(new Map())
    const resizeStateRef = React.useRef<{
      handleIndex: number
      startPos: number
      startLayout: number[]
    } | null>(null)

    // Count panels and initialize layout
    React.useLayoutEffect(() => {
      let panelCount = 0
      const defaultSizes: number[] = []

      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && (child.type as any)?.displayName === 'ResizablePanel') {
          const props = child.props as ResizablePanelProps
          defaultSizes.push(props.defaultSize ?? 0)
          panelCount++
        }
      })

      if (panelCount === 0) return

      if (layout.length !== panelCount) {
        // Check if we have default sizes that sum to 100
        const totalDefault = defaultSizes.reduce((a, b) => a + b, 0)
        if (totalDefault > 0 && Math.abs(totalDefault - 100) < 1) {
          setLayout(defaultSizes)
        } else {
          // Distribute evenly
          setLayout(new Array(panelCount).fill(100 / panelCount))
        }
      }
    }, [children, layout.length])

    React.useImperativeHandle(ref, () => ({
      getLayout: () => layout,
      setLayout: (newLayout: number[]) => {
        if (newLayout.length === layout.length) {
          setLayout(newLayout)
          onLayout?.(newLayout)
        }
      },
      collapse: (_id) => { /* TODO: implement collapse */ },
      expand: (_id) => { /* TODO: implement expand */ }
    }))

    const registerPanel = React.useCallback((index: number, config: PanelConfig) => {
      panelConfigsRef.current.set(index, config)
    }, [])

    const startResize = React.useCallback((handleIndex: number, startPos: number) => {
      resizeStateRef.current = {
        handleIndex,
        startPos,
        startLayout: [...layout]
      }
    }, [layout])

    const updateResize = React.useCallback((currentPos: number) => {
      const state = resizeStateRef.current
      if (!state || !containerRef.current) return

      const containerSize = direction === 'horizontal'
        ? containerRef.current.clientWidth
        : containerRef.current.clientHeight

      if (containerSize === 0) return

      // Calculate delta from START position (not previous frame)
      const deltaPx = currentPos - state.startPos
      const deltaPercent = (deltaPx / containerSize) * 100

      const { handleIndex, startLayout } = state
      const leftIndex = handleIndex
      const rightIndex = handleIndex + 1

      if (leftIndex < 0 || rightIndex >= startLayout.length) return

      // Apply delta to the START layout values
      let newLeft = startLayout[leftIndex] + deltaPercent
      let newRight = startLayout[rightIndex] - deltaPercent

      // Get min/max constraints
      const leftConfig = panelConfigsRef.current.get(leftIndex)
      const rightConfig = panelConfigsRef.current.get(rightIndex)

      const leftMin = leftConfig?.minSize ?? 5
      const leftMax = leftConfig?.maxSize ?? 100
      const rightMin = rightConfig?.minSize ?? 5
      const rightMax = rightConfig?.maxSize ?? 100

      // Clamp to constraints
      if (newLeft < leftMin) {
        const diff = leftMin - newLeft
        newLeft = leftMin
        newRight = newRight + diff
      }
      if (newRight < rightMin) {
        const diff = rightMin - newRight
        newRight = rightMin
        newLeft = newLeft - diff
      }
      if (newLeft > leftMax) {
        const diff = newLeft - leftMax
        newLeft = leftMax
        newRight = newRight + diff
      }
      if (newRight > rightMax) {
        const diff = newRight - rightMax
        newRight = rightMax
        newLeft = newLeft - diff
      }

      // Final bounds check
      if (newLeft < leftMin || newRight < rightMin) return

      // Update layout
      const newLayout = [...startLayout]
      newLayout[leftIndex] = newLeft
      newLayout[rightIndex] = newRight

      setLayout(newLayout)
      onLayout?.(newLayout)
    }, [direction, onLayout])

    const endResize = React.useCallback(() => {
      resizeStateRef.current = null
    }, [])

    return (
      <ResizableContext.Provider value={{ direction, registerPanel, startResize, updateResize, endResize }}>
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
            let panelIndex = 0
            let handleIndex = 0
            return React.Children.map(children, (child) => {
              if (!React.isValidElement(child)) return child

              const childType = child.type as any

              if (childType?.displayName === 'ResizablePanel') {
                const size = layout[panelIndex] ?? (100 / Math.max(1, layout.length))
                const pIndex = panelIndex++
                return React.cloneElement(child as React.ReactElement<any>, {
                  _size: size,
                  _index: pIndex
                })
              }

              if (childType?.displayName === 'ResizableHandle') {
                const hIndex = handleIndex++
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
  minSize = 5,
  maxSize = 100,
  id,
  children,
  _size,
  _index,
  ...props
}: ResizablePanelProps & { _size?: number; _index?: number }) {
  const context = React.useContext(ResizableContext)

  // Register panel config
  React.useEffect(() => {
    if (context && _index !== undefined) {
      context.registerPanel(_index, { defaultSize, minSize, maxSize })
    }
  }, [context, _index, defaultSize, minSize, maxSize])

  return (
    <div
      data-slot="resizable-panel"
      className={cn("relative overflow-hidden", className)}
      style={{
        flexBasis: `${_size}%`,
        flexGrow: 0,
        flexShrink: 0,
        minWidth: context?.direction === 'horizontal' ? `${minSize}%` : undefined,
        minHeight: context?.direction === 'vertical' ? `${minSize}%` : undefined,
      }}
      id={id}
      {...props}
    >
      {children}
    </div>
  )
}
ResizablePanel.displayName = "ResizablePanel"

function ResizableHandle({
  withHandle,
  className,
  _index,
  ...props
}: ResizableHandleProps & { _index?: number }) {
  const context = React.useContext(ResizableContext)
  const [isDragging, setIsDragging] = React.useState(false)

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    if (!context || _index === undefined) return
    e.preventDefault()
    e.stopPropagation()

    const startPos = context.direction === 'horizontal' ? e.clientX : e.clientY
    context.startResize(_index, startPos)
    setIsDragging(true)

    const moveHandler = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault()
      moveEvent.stopPropagation()
      const currentPos = context.direction === 'horizontal' ? moveEvent.clientX : moveEvent.clientY
      context.updateResize(currentPos)
    }

    const upHandler = () => {
      context.endResize()
      setIsDragging(false)
      document.removeEventListener('mousemove', moveHandler)
      document.removeEventListener('mouseup', upHandler)
    }

    document.addEventListener('mousemove', moveHandler)
    document.addEventListener('mouseup', upHandler)
  }, [context, _index])

  // Touch support for mobile/tablet
  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    if (!context || _index === undefined) return
    e.preventDefault()
    e.stopPropagation()

    const touch = e.touches[0]
    const startPos = context.direction === 'horizontal' ? touch.clientX : touch.clientY
    context.startResize(_index, startPos)
    setIsDragging(true)

    const moveHandler = (moveEvent: TouchEvent) => {
      moveEvent.preventDefault()
      moveEvent.stopPropagation()
      const currentTouch = moveEvent.touches[0]
      const currentPos = context.direction === 'horizontal' ? currentTouch.clientX : currentTouch.clientY
      context.updateResize(currentPos)
    }

    const endHandler = () => {
      context.endResize()
      setIsDragging(false)
      document.removeEventListener('touchmove', moveHandler)
      document.removeEventListener('touchend', endHandler)
      document.removeEventListener('touchcancel', endHandler)
    }

    document.addEventListener('touchmove', moveHandler, { passive: false })
    document.addEventListener('touchend', endHandler)
    document.addEventListener('touchcancel', endHandler)
  }, [context, _index])

  return (
    <div
      data-slot="resizable-handle"
      role="separator"
      aria-orientation={context?.direction === 'vertical' ? 'horizontal' : 'vertical'}
      tabIndex={0}
      className={cn(
        "bg-border relative flex items-center justify-center transition-colors z-50",
        isDragging ? "bg-primary/60" : "hover:bg-primary/30",
        context?.direction === 'vertical'
          ? "h-1 w-full cursor-row-resize"
          : "w-1 h-full cursor-col-resize",
        // Increase touch target
        context?.direction === 'vertical'
          ? "after:absolute after:h-4 after:w-full after:top-1/2 after:-translate-y-1/2"
          : "after:absolute after:w-4 after:h-full after:left-1/2 after:-translate-x-1/2",
        className
      )}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      {...props}
    >
      {withHandle && (
        <div className={cn(
          "bg-border z-30 flex items-center justify-center rounded-sm border shadow-sm pointer-events-none",
          context?.direction === 'vertical' ? "h-3 w-6" : "h-6 w-3"
        )}>
          <GripVertical className={cn(
            "size-2.5 text-muted-foreground",
            context?.direction === 'vertical' && "rotate-90"
          )} />
        </div>
      )}
    </div>
  )
}
ResizableHandle.displayName = "ResizableHandle"

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
