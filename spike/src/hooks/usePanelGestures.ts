/**
 * usePanelGestures Hook
 * 
 * Manages drag gestures for resizable panels.
 * Provides snap-to-point functionality for mobile bottom sheets.
 */

import { useState, useCallback, useRef, useEffect } from 'react'

export interface UsePanelGesturesOptions {
  /** Minimum height in pixels (default: 48) */
  minHeight?: number
  /** Maximum height in pixels (default: 400) */
  maxHeight?: number
  /** Default height when panel is partially expanded */
  defaultHeight?: number
  /** Snap points in pixels */
  snapPoints?: number[]
}

export interface UsePanelGesturesReturn {
  /** Current panel height in pixels */
  height: number
  /** Whether the user is currently dragging */
  isDragging: boolean
  /** Whether the panel is in collapsed state */
  isCollapsed: boolean
  /** Whether the panel is in expanded state */
  isExpanded: boolean
  /** Set height manually */
  setHeight: (height: number) => void
  /** Collapse the panel to minimum height */
  collapse: () => void
  /** Expand the panel to maximum height */
  expand: () => void
  /** Toggle between collapsed and expanded */
  toggle: () => void
  /** Event handlers for drag gestures */
  dragHandlers: {
    onMouseDown: (e: React.MouseEvent) => void
    onTouchStart: (e: React.TouchEvent) => void
  }
}

/**
 * Hook for managing panel gestures with drag-to-resize and snap points
 */
export function usePanelGestures(options: UsePanelGesturesOptions = {}): UsePanelGesturesReturn {
  const {
    minHeight = 48,
    maxHeight = 400,
    defaultHeight = 192,
  } = options

  const [height, setHeightState] = useState(defaultHeight)
  const [isDragging, setIsDragging] = useState(false)
  const startY = useRef<number>(0)
  const startHeight = useRef<number>(0)

  // Validate and set height
  const setHeight = useCallback((newHeight: number) => {
    const clampedHeight = Math.min(maxHeight, Math.max(minHeight, newHeight))
    setHeightState(clampedHeight)
  }, [minHeight, maxHeight])

  // Collapse to minimum
  const collapse = useCallback(() => {
    setHeight(minHeight)
  }, [setHeight, minHeight])

  // Expand to maximum
  const expand = useCallback(() => {
    setHeight(maxHeight)
  }, [setHeight, maxHeight])

  // Toggle between collapsed and expanded
  const toggle = useCallback(() => {
    if (height >= (minHeight + maxHeight) / 2) {
      collapse()
    } else {
      expand()
    }
  }, [height, minHeight, maxHeight, collapse, expand])

  // Check states
  const isCollapsed = height === minHeight
  const isExpanded = height === maxHeight

  // Drag handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    startY.current = e.clientY
    startHeight.current = height
    e.preventDefault()
  }, [height])

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true)
    startY.current = e.touches[0].clientY
    startHeight.current = height
  }, [height])

  // Global move and up handlers for drag
  useEffect(() => {
    if (!isDragging) return

    const onMouseMove = (e: MouseEvent) => {
      const delta = startY.current - e.clientY
      const newHeight = startHeight.current + delta
      setHeight(newHeight)
    }

    const onTouchMove = (e: TouchEvent) => {
      const delta = startY.current - e.touches[0].clientY
      const newHeight = startHeight.current + delta
      setHeight(newHeight)
    }

    const onEnd = () => {
      setIsDragging(false)
      // Snap to nearest snap point
      const snapPoints = [minHeight, (minHeight + maxHeight) / 2, maxHeight]
      const nearestSnap = snapPoints.reduce((prev, curr) => {
        return Math.abs(curr - height) < Math.abs(prev - height) ? curr : prev
      })
      setHeight(nearestSnap)
    }

    // Add event listeners
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onEnd)
    document.addEventListener('touchmove', onTouchMove)
    document.addEventListener('touchend', onEnd)

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onEnd)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onEnd)
    }
  }, [isDragging, height, setHeight, minHeight, maxHeight, startY, startHeight])

  return {
    height,
    isDragging,
    isCollapsed,
    isExpanded,
    setHeight,
    collapse,
    expand,
    toggle,
    dragHandlers: {
      onMouseDown,
      onTouchStart,
    },
  }
}

/**
 * Hook for managing mobile panel state with predefined modes
 */
export function useMobilePanelState(initialMode: 'collapsed' | 'partial' | 'expanded' = 'partial') {
  const heights = {
    collapsed: 48,
    partial: 192,
    expanded: 400,
  }

  const [mode, setModeState] = useState<'collapsed' | 'partial' | 'expanded'>(initialMode)

  const { height, setHeight, collapse, expand, isDragging, isCollapsed, isExpanded, dragHandlers, toggle } = usePanelGestures({
    minHeight: heights.collapsed,
    maxHeight: heights.expanded,
    defaultHeight: heights[initialMode],
  })

  // Update mode when height changes
  useEffect(() => {
    if (height === heights.collapsed) {
      setModeState('collapsed')
    } else if (height === heights.expanded) {
      setModeState('expanded')
    } else {
      setModeState('partial')
    }
  }, [height, heights])

  const setCollapsed = useCallback(() => {
    setModeState('collapsed')
    collapse()
  }, [collapse])

  const setPartial = useCallback(() => {
    setModeState('partial')
    setHeight(heights.partial)
  }, [setHeight])

  const setExpanded = useCallback(() => {
    setModeState('expanded')
    expand()
  }, [expand])

  return {
    mode,
    height,
    setHeight,
    setCollapsed,
    setPartial,
    setExpanded,
    toggle,
    heights,
    isDragging,
    isCollapsed,
    isExpanded,
    dragHandlers,
  }
}
