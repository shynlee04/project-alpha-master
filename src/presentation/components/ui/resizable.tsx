import * as React from 'react'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

// --- Custom Resizable Implementation ---
// Fixes delta accumulation bug that caused panels to become tiny and unresizable
// Handles conditional rendering (fragments) properly

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
  collapsedSize?: number
  order?: number
  id?: string
  collapsible?: boolean
  onCollapse?: (collapsed: boolean) => void
}

type ResizableHandleProps = React.HTMLAttributes<HTMLDivElement> & {
  withHandle?: boolean
  orientation?: 'horizontal' | 'vertical'
  collapsedSize?: number
  onCollapse?: (collapsed: boolean) => void
}

// --- Context ---

type ResizableContextType = {
  direction: Direction
  registerPanel: (index: number, config: PanelConfig) => void
  startResize: (handleIndex: number, startPos: number) => void
  updateResize: (currentPos: number) => void
  endResize: () => void
  toggleCollapse: (handleIndex: number) => void
  isPanelCollapsed: (panelIndex: number) => boolean
}

type PanelConfig = {
  defaultSize?: number
  minSize: number
  maxSize: number
  collapsedSize?: number
  collapsible?: boolean
  onCollapse?: (collapsed: boolean) => void
}

const ResizableContext = React.createContext<ResizableContextType | null>(null)

// --- Helper to flatten children (handles Fragments) ---
function flattenChildren(children: React.ReactNode): React.ReactNode[] {
  const result: React.ReactNode[] = []

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) {
      if (child !== null && child !== undefined && child !== false) {
        result.push(child)
      }
      return
    }

    // Handle Fragment - flatten its children
    if (child.type === React.Fragment) {
      result.push(...flattenChildren((child.props as { children?: React.ReactNode }).children))
    } else {
      result.push(child)
    }
  })

  return result
}

// --- Helper to check component type ---
function isResizablePanel(child: React.ReactElement): boolean {
  const type = child.type as any
  return type?.displayName === 'ResizablePanel' || type === ResizablePanel
}

function isResizableHandle(child: React.ReactElement): boolean {
  const type = child.type as any
  return type?.displayName === 'ResizableHandle' || type === ResizableHandle
}

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

    // Collapse/expand state tracking
    const [collapsedPanels, setCollapsedPanels] = React.useState<Set<string>>(new Set())
    const previousSizesRef = React.useRef<Map<string, number>>(new Map())
    const panelIdToIndexRef = React.useRef<Map<string, number>>(new Map())

    // Flatten children to handle Fragments
    const flatChildren = React.useMemo(() => flattenChildren(children), [children])

    // Count panels and collect default sizes + IDs
    const { panelCount, defaultSizes, panelIds } = React.useMemo(() => {
      let count = 0
      const sizes: number[] = []
      const ids: (string | undefined)[] = []

      flatChildren.forEach((child) => {
        if (React.isValidElement(child) && isResizablePanel(child)) {
          const props = child.props as ResizablePanelProps
          sizes.push(props.defaultSize ?? 0)
          ids.push(props.id)
          count++
        }
      })

      return { panelCount: count, defaultSizes: sizes, panelIds: ids }
    }, [flatChildren])

    // Build panel ID to index mapping
    React.useEffect(() => {
      panelIdToIndexRef.current.clear()
      panelIds.forEach((id, index) => {
        if (id) {
          panelIdToIndexRef.current.set(id, index)
        }
      })
    }, [panelIds])

    // Initialize/update layout when panel count changes
    React.useLayoutEffect(() => {
      if (panelCount === 0) return

      if (layout.length !== panelCount) {
        // Calculate layout with proper handling for missing default sizes
        const totalExplicitDefault = defaultSizes.reduce((a, b) => a + b, 0)
        const panelsWithoutDefault = defaultSizes.filter(s => s === 0).length
        const panelsWithDefault = panelCount - panelsWithoutDefault

        let newLayout: number[]

        if (totalExplicitDefault > 0 && Math.abs(totalExplicitDefault - 100) < 5) {
          // All defaults sum to ~100, use them directly
          // But if some are 0, give them equal share of remaining
          if (panelsWithoutDefault > 0) {
            const remaining = 100 - totalExplicitDefault
            const perPanel = remaining > 0 ? remaining / panelsWithoutDefault : (100 / panelCount)
            newLayout = defaultSizes.map(s => s === 0 ? perPanel : s)
          } else {
            newLayout = defaultSizes
          }
        } else if (panelsWithDefault > 0 && panelsWithoutDefault > 0) {
          // Some panels have defaults, some don't
          // Give explicit defaults their share, distribute rest to others
          const usedSpace = Math.min(totalExplicitDefault, 80) // Cap at 80% for explicit defaults
          const remaining = 100 - usedSpace
          const perUnassigned = remaining / panelsWithoutDefault

          newLayout = defaultSizes.map(s => {
            if (s === 0) return perUnassigned
            // Scale down if total exceeds 80%
            return totalExplicitDefault > 80 ? (s / totalExplicitDefault) * usedSpace : s
          })
        } else if (totalExplicitDefault > 0) {
          // All panels have explicit defaults but don't sum to 100 - normalize
          newLayout = defaultSizes.map(s => (s / totalExplicitDefault) * 100)
        } else {
          // No defaults at all - distribute evenly
          newLayout = new Array(panelCount).fill(100 / panelCount)
        }

        setLayout(newLayout)
      }
    }, [panelCount, defaultSizes, layout.length])

    React.useImperativeHandle(ref, () => ({
      getLayout: () => layout,
      setLayout: (newLayout: number[]) => {
        if (newLayout.length === layout.length) {
          setLayout(newLayout)
          onLayout?.(newLayout)
        }
      },
      collapse: (panelId: string) => {
        const panelIndex = panelIdToIndexRef.current.get(panelId)
        if (panelIndex === undefined || layout.length === 0) return

        // Already collapsed?
        if (collapsedPanels.has(panelId)) return

        // Save current size before collapsing
        previousSizesRef.current.set(panelId, layout[panelIndex])

        // Get min size for this panel (default to 0 for collapse)
        const panelConfig = panelConfigsRef.current.get(panelIndex)
        const collapsedSize = panelConfig?.minSize ?? 0

        // Calculate space to redistribute
        const spaceToRedistribute = layout[panelIndex] - collapsedSize

        // Find non-collapsed panels to expand
        const expandablePanels = layout
          .map((size, idx) => ({ size, idx }))
          .filter(p => p.idx !== panelIndex && !Array.from(collapsedPanels).some(
            id => panelIdToIndexRef.current.get(id) === p.idx
          ))

        if (expandablePanels.length === 0) return

        // Distribute space proportionally to other panels
        const totalExpandableSize = expandablePanels.reduce((sum, p) => sum + p.size, 0)
        const newLayout = [...layout]
        newLayout[panelIndex] = collapsedSize

        expandablePanels.forEach(p => {
          const proportion = totalExpandableSize > 0 ? p.size / totalExpandableSize : 1 / expandablePanels.length
          newLayout[p.idx] = p.size + (spaceToRedistribute * proportion)
        })

        setCollapsedPanels(prev => new Set(prev).add(panelId))
        setLayout(newLayout)
        onLayout?.(newLayout)
      },
      expand: (panelId: string) => {
        const panelIndex = panelIdToIndexRef.current.get(panelId)
        if (panelIndex === undefined || layout.length === 0) return

        // Not collapsed?
        if (!collapsedPanels.has(panelId)) return

        // Get the size to restore (or default to equal share)
        const previousSize = previousSizesRef.current.get(panelId) ?? (100 / layout.length)

        // Current collapsed size
        const currentSize = layout[panelIndex]
        const spaceNeeded = previousSize - currentSize

        // Find non-collapsed panels to shrink
        const shrinkablePanels = layout
          .map((size, idx) => ({ size, idx }))
          .filter(p => {
            if (p.idx === panelIndex) return false
            const config = panelConfigsRef.current.get(p.idx)
            const minSize = config?.minSize ?? 5
            return p.size > minSize
          })

        if (shrinkablePanels.length === 0) return

        // Shrink other panels proportionally
        const totalShrinkableSize = shrinkablePanels.reduce((sum, p) => {
          const config = panelConfigsRef.current.get(p.idx)
          const minSize = config?.minSize ?? 5
          return sum + (p.size - minSize)
        }, 0)

        const newLayout = [...layout]
        newLayout[panelIndex] = previousSize

        shrinkablePanels.forEach(p => {
          const config = panelConfigsRef.current.get(p.idx)
          const minSize = config?.minSize ?? 5
          const shrinkableAmount = p.size - minSize
          const proportion = totalShrinkableSize > 0 ? shrinkableAmount / totalShrinkableSize : 1 / shrinkablePanels.length
          const shrinkAmount = Math.min(spaceNeeded * proportion, shrinkableAmount)
          newLayout[p.idx] = p.size - shrinkAmount
        })

        setCollapsedPanels(prev => {
          const next = new Set(prev)
          next.delete(panelId)
          return next
        })
        previousSizesRef.current.delete(panelId)
        setLayout(newLayout)
        onLayout?.(newLayout)
      }
    }), [layout, onLayout, collapsedPanels])

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

    const toggleCollapse = React.useCallback((handleIndex: number) => {
      // Collapse the panel to the LEFT of the handle (for horizontal)
      // or ABOVE the handle (for vertical)
      const panelIndex = handleIndex
      if (panelIndex < 0 || panelIndex >= panelIds.length) return

      const panelId = panelIds[panelIndex]
      if (!panelId) return

      const isCurrentlyCollapsed = collapsedPanels.has(panelId)

      if (isCurrentlyCollapsed) {
        // Expand
        const config = panelConfigsRef.current.get(panelIndex)
        config?.onCollapse?.(false)

        // Get the size to restore
        const previousSize = previousSizesRef.current.get(panelId) ?? (100 / layout.length)
        const currentSize = layout[panelIndex]
        const spaceNeeded = previousSize - currentSize

        // Find non-collapsed panels to shrink
        const shrinkablePanels = layout
          .map((size, idx) => ({ size, idx }))
          .filter(p => {
            if (p.idx === panelIndex) return false
            const config = panelConfigsRef.current.get(p.idx)
            const minSize = config?.minSize ?? 5
            return p.size > minSize
          })

        if (shrinkablePanels.length === 0) return

        // Shrink other panels proportionally
        const totalShrinkableSize = shrinkablePanels.reduce((sum, p) => {
          const config = panelConfigsRef.current.get(p.idx)
          const minSize = config?.minSize ?? 5
          return sum + (p.size - minSize)
        }, 0)

        const newLayout = [...layout]
        newLayout[panelIndex] = previousSize

        shrinkablePanels.forEach(p => {
          const config = panelConfigsRef.current.get(p.idx)
          const minSize = config?.minSize ?? 5
          const shrinkableAmount = p.size - minSize
          const proportion = totalShrinkableSize > 0 ? shrinkableAmount / totalShrinkableSize : 1 / shrinkablePanels.length
          const shrinkAmount = Math.min(spaceNeeded * proportion, shrinkableAmount)
          newLayout[p.idx] = p.size - shrinkAmount
        })

        setCollapsedPanels(prev => {
          const next = new Set(prev)
          next.delete(panelId)
          return next
        })
        previousSizesRef.current.delete(panelId)
        setLayout(newLayout)
        onLayout?.(newLayout)
      } else {
        // Collapse
        const config = panelConfigsRef.current.get(panelIndex)
        const collapsedSize = config?.collapsedSize ?? config?.minSize ?? 0

        // Save current size before collapsing
        previousSizesRef.current.set(panelId, layout[panelIndex])

        // Calculate space to redistribute
        const spaceToRedistribute = layout[panelIndex] - collapsedSize

        // Find non-collapsed panels to expand
        const expandablePanels = layout
          .map((size, idx) => ({ size, idx }))
          .filter(p => p.idx !== panelIndex && !Array.from(collapsedPanels).some(
            id => panelIdToIndexRef.current.get(id) === p.idx
          ))

        if (expandablePanels.length === 0) return

        // Distribute space proportionally to other panels
        const totalExpandableSize = expandablePanels.reduce((sum, p) => sum + p.size, 0)
        const newLayout = [...layout]
        newLayout[panelIndex] = collapsedSize

        expandablePanels.forEach(p => {
          const proportion = totalExpandableSize > 0 ? p.size / totalExpandableSize : 1 / expandablePanels.length
          newLayout[p.idx] = p.size + (spaceToRedistribute * proportion)
        })

        config?.onCollapse?.(true)
        setCollapsedPanels(prev => new Set(prev).add(panelId))
        setLayout(newLayout)
        onLayout?.(newLayout)
      }
    }, [layout, onLayout, collapsedPanels, panelIds])

    const isPanelCollapsed = React.useCallback((panelIndex: number) => {
      const panelId = panelIds[panelIndex]
      return panelId ? collapsedPanels.has(panelId) : false
    }, [collapsedPanels, panelIds])

    // Render children with proper indices
    const renderedChildren = React.useMemo(() => {
      let panelIndex = 0
      let handleIndex = 0

      return flatChildren.map((child) => {
        if (!React.isValidElement(child)) return child

        if (isResizablePanel(child)) {
          const size = layout[panelIndex] ?? (100 / Math.max(1, layout.length || 1))
          const pIndex = panelIndex++
          return React.cloneElement(child as React.ReactElement<any>, {
            key: child.key ?? `panel-${pIndex}`,
            _size: size,
            _index: pIndex
          })
        }

        if (isResizableHandle(child)) {
          const hIndex = handleIndex++
          return React.cloneElement(child as React.ReactElement<any>, {
            key: child.key ?? `handle-${hIndex}`,
            _index: hIndex
          })
        }

        return child
      })
    }, [flatChildren, layout])

    return (
      <ResizableContext.Provider value={{ direction, registerPanel, startResize, updateResize, endResize, toggleCollapse, isPanelCollapsed }}>
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
          {renderedChildren}
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
  collapsedSize,
  collapsible,
  onCollapse,
  id,
  children,
  _size,
  _index,
  ...props
}: ResizablePanelProps & { _size?: number; _index?: number }) {
  const context = React.useContext(ResizableContext)

  // Determine if panel is collapsed (size is at or near minSize)
  const isCollapsed = _size !== undefined && _size <= (minSize + 0.5)

  // Register panel config
  React.useEffect(() => {
    if (context && _index !== undefined) {
      context.registerPanel(_index, {
        defaultSize,
        minSize,
        maxSize,
        collapsedSize,
        collapsible,
        onCollapse
      })
    }
  }, [context, _index, defaultSize, minSize, maxSize, collapsedSize, collapsible, onCollapse])

  return (
    <div
      data-slot="resizable-panel"
      data-collapsed={isCollapsed ? 'true' : undefined}
      className={cn("relative overflow-hidden transition-[flex-basis] duration-200 ease-out", className)}
      style={{
        flexBasis: `${_size}%`,
        flexGrow: 0,
        flexShrink: 0,
        minWidth: context?.direction === 'horizontal' ? 0 : undefined,
        minHeight: context?.direction === 'vertical' ? 0 : undefined,
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

  // Check if the panel to the left/above of this handle is collapsible
  const canCollapse = React.useMemo(() => {
    if (_index === undefined || !context) return false
    return context.isPanelCollapsed(_index) !== undefined
  }, [_index, context])

  const isCollapsed = React.useMemo(() => {
    if (_index === undefined || !context) return false
    return context.isPanelCollapsed(_index)
  }, [_index, context])

  const handleDoubleClick = React.useCallback((e: React.MouseEvent) => {
    if (!context || _index === undefined) return
    e.preventDefault()
    e.stopPropagation()
    context.toggleCollapse(_index)
  }, [context, _index])

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
      onDoubleClick={handleDoubleClick}
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
      {/* Collapse indicator */}
      {canCollapse && (
        <div
          className={cn(
            "absolute z-30 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity",
            context?.direction === 'vertical'
              ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          )}
          title={isCollapsed ? "Double-click to expand" : "Double-click to collapse"}
        >
          <div className={cn(
            "bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm",
            context?.direction === 'vertical' ? "w-4 h-4" : "w-4 h-4"
          )}>
            {isCollapsed ? (
              <div className={cn(
                "w-full h-full flex items-center justify-center",
                context?.direction === 'vertical' ? "rotate-0" : "rotate-0"
              )}>
                <span className="text-[8px] font-bold">+</span>
              </div>
            ) : (
              <div className={cn(
                "w-full h-full flex items-center justify-center",
                context?.direction === 'vertical' ? "rotate-90" : "rotate-0"
              )}>
                <span className="text-[8px] font-bold">−</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
ResizableHandle.displayName = "ResizableHandle"

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
