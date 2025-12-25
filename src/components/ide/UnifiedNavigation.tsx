/**
 * Unified Navigation Component
 * @module components/ide
 * 
 * Standardized navigation patterns across IDE components.
 * Provides consistent keyboard navigation, focus management, and visual feedback.
 * Uses 8-bit design system tokens and CVA patterns.
 * 
 * EPIC_ID: Epic 23
 * STORY_ID: P1.5
 * CREATED_AT: 2025-12-25T22:00:00Z
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useNavigationStore } from '@/lib/state/navigation-store';
import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Navigation item interface
 */
export interface NavigationItem {
  /** Unique identifier for the item */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon component */
  icon?: React.ReactNode;
  /** Optional badge count */
  badge?: number;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Optional tooltip text */
  tooltip?: string;
  /** Component ID for state tracking */
  componentId?: string;
}

/**
 * Unified navigation component interface
 */
export interface UnifiedNavigationProps {
  /** Unique identifier for navigation component */
  id: string;
  /** Navigation items to display */
  items: NavigationItem[];
  /** Currently selected item ID */
  selectedItemId?: string;
  /** Callback when item is selected */
  onSelect?: (item: NavigationItem) => void;
  /** Navigation variant (list, tree, tabs) */
  variant?: 'list' | 'tree' | 'tabs';
  /** Orientation (horizontal, vertical) */
  orientation?: 'horizontal' | 'vertical';
  /** Enable keyboard navigation */
  keyboardEnabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Navigation item variants using CVA
 */
const navigationItemVariants = cva(
  // Base styles
  [
    'relative flex items-center gap-2 px-3 py-2 text-sm',
    'transition-all duration-150 ease-out',
    'focus:outline-none focus-visible:ring-2',
    'cursor-pointer select-none',
    'border-2 border-transparent',
  ],
  {
    variants: {
      variant: {
        list: 'w-full justify-start',
        tree: 'w-full justify-start pl-4',
        tabs: 'flex-shrink-0 justify-center whitespace-nowrap',
      },
      orientation: {
        horizontal: '',
        vertical: '',
      },
      selected: {
        true: [
          'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]',
          'border-[hsl(var(--primary))]',
          'shadow-pixel-primary',
        ],
        false: [
          'text-[hsl(var(--muted-foreground))]',
          'hover:bg-[hsl(var(--accent))]',
          'hover:text-[hsl(var(--accent-foreground))]',
        ],
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed pointer-events-none',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'list',
      orientation: 'vertical',
      selected: false,
      disabled: false,
    },
  }
);

/**
 * Navigation container variants
 */
const navigationContainerVariants = cva(
  // Base styles
  [
    'flex gap-1 p-1',
    'bg-[hsl(var(--card))]',
    'border-2 border-[hsl(var(--border))]',
    'shadow-pixel-sm',
  ],
  {
    variants: {
      orientation: {
        horizontal: 'flex-row overflow-x-auto',
        vertical: 'flex-col overflow-y-auto',
      },
    },
    defaultVariants: {
      orientation: 'vertical',
    },
  }
);

/**
 * UnifiedNavigation Component
 * 
 * Provides standardized navigation with:
 * - Consistent keyboard navigation (Arrow keys, Tab, Enter, Escape)
 * - Visual focus indicators with 8-bit styling
 * - Focus trap for accessibility
 * - State persistence via navigation store
 * 
 * @example
 * ```tsx
 * <UnifiedNavigation
 *   id="file-tree-nav"
 *   items={fileTreeItems}
 *   selectedItemId={selectedFileId}
 *   onSelect={handleFileSelect}
 *   variant="tree"
 *   orientation="vertical"
 * />
 * ```
 */
export function UnifiedNavigation({
  id,
  items,
  selectedItemId,
  onSelect,
  variant = 'list',
  orientation = 'vertical',
  keyboardEnabled = true,
  className,
}: UnifiedNavigationProps) {
  const { t } = useTranslation();
  const { 
    setActivePanel, 
    setFocusedElement,
    setSelectedItem,
    clearSelectedItems,
    keyboardNavigationEnabled,
    updateLastActiveAt,
  } = useNavigationStore();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  
  // Get actual keyboard enabled state
  const isKeyboardEnabled = keyboardEnabled && keyboardNavigationEnabled;
  
  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isKeyboardEnabled) return;
    
    const currentIndex = focusedIndex;
    const itemCount = items.length;
    
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        if (orientation === 'vertical' || event.key === 'ArrowRight') {
          const nextIndex = currentIndex < itemCount - 1 ? currentIndex + 1 : 0;
          setFocusedIndex(nextIndex);
          itemRefs.current.get(items[nextIndex]?.id)?.focus();
        }
        break;
        
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        if (orientation === 'vertical' || event.key === 'ArrowLeft') {
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : itemCount - 1;
          setFocusedIndex(prevIndex);
          itemRefs.current.get(items[prevIndex]?.id)?.focus();
        }
        break;
        
      case 'Tab':
        // Allow default Tab behavior
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (currentIndex >= 0 && items[currentIndex]) {
          const item = items[currentIndex];
          if (!item.disabled) {
            handleSelect(item);
          }
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        // Clear focus and selection
        setFocusedIndex(-1);
        clearSelectedItems(id);
        containerRef.current?.blur();
        break;
        
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        itemRefs.current.get(items[0]?.id)?.focus();
        break;
        
      case 'End':
        event.preventDefault();
        setFocusedIndex(itemCount - 1);
        itemRefs.current.get(items[itemCount - 1]?.id)?.focus();
        break;
    }
  }, [isKeyboardEnabled, orientation, focusedIndex, items, id, clearSelectedItems]);
  
  /**
   * Handle item selection
   */
  const handleSelect = useCallback((item: NavigationItem) => {
    if (item.disabled) return;
    
    // Update navigation store
    setSelectedItem(id, item.id);
    setActivePanel(id);
    setFocusedElement(`${id}-${item.id}`);
    updateLastActiveAt();
    
    // Call parent callback
    onSelect?.(item);
  }, [id, setSelectedItem, setActivePanel, setFocusedElement, updateLastActiveAt, onSelect]);
  
  /**
   * Handle item focus
   */
  const handleFocus = useCallback((index: number) => {
    setFocusedIndex(index);
    setFocusedElement(`${id}-${items[index]?.id}`);
    updateLastActiveAt();
  }, [id, items, setFocusedElement, updateLastActiveAt]);
  
  /**
   * Handle item blur
   */
  const handleBlur = useCallback(() => {
    setFocusedElement(null);
  }, [setFocusedElement]);
  
  /**
   * Focus trap for accessibility
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleFocusIn = (event: FocusEvent) => {
      if (!container.contains(event.target as Node)) {
        // Focus moved outside, reset focused index
        setFocusedIndex(-1);
      }
    };
    
    container.addEventListener('focusin', handleFocusIn);
    return () => container.removeEventListener('focusin', handleFocusIn);
  }, []);
  
  /**
   * Update selected item when prop changes
   */
  useEffect(() => {
    if (selectedItemId) {
      const index = items.findIndex(item => item.id === selectedItemId);
      if (index >= 0) {
        setFocusedIndex(index);
      }
    }
  }, [selectedItemId, items]);
  
  return (
    <div
      ref={containerRef}
      id={id}
      role="navigation"
      aria-label={t('navigation.label', 'Navigation')}
      className={cn(
        navigationContainerVariants({ orientation }),
        className
      )}
      onKeyDown={handleKeyDown}
      tabIndex={isKeyboardEnabled ? 0 : -1}
    >
      {items.map((item, index) => (
        <button
          key={item.id}
          ref={(el) => {
            if (el) {
              itemRefs.current.set(item.id, el);
            }
          }}
          type="button"
          aria-label={item.tooltip || item.label}
          aria-current={selectedItemId === item.id ? 'true' : undefined}
          title={item.tooltip}
          disabled={item.disabled}
          className={cn(
            navigationItemVariants({
              variant,
              orientation,
              selected: selectedItemId === item.id,
              disabled: item.disabled,
            }),
            'focus-visible:ring-[hsl(var(--ring))]'
          )}
          onClick={() => handleSelect(item)}
          onFocus={() => handleFocus(index)}
          onBlur={handleBlur}
          tabIndex={focusedIndex === index ? 0 : -1}
        >
          {item.icon && (
            <span className="flex-shrink-0" aria-hidden="true">
              {item.icon}
            </span>
          )}
          <span className="truncate">{item.label}</span>
          {item.badge !== undefined && item.badge > 0 && (
            <span 
              className="ml-auto flex-shrink-0 px-1.5 py-0.5 text-xs font-bold"
              style={{
                backgroundColor: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
              }}
            >
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/**
 * NavigationItem type export for external use
 */
export type { VariantProps };
