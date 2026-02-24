/**
 * @fileoverview Route-Conditional Preset Selector Component
 * @module presentation/components/layout/PresetSelector
 *
 * **LC-07**: Workflow preset selector that ONLY appears in project routes.
 *
 * Features:
 * - Dropdown for switching between layout presets (Default, Focus, Code, Full Editor)
 * - Route-conditional: only visible when projectId is present
 * - 8-bit design compliant (sharp corners, pixel shadows)
 * - Accessible with keyboard navigation
 *
 * Route Behavior:
 * - /$projectId → VISIBLE
 * - /hub, /settings, /agents → NOT visible
 *
 * @epic EPIC-LAYOUT-CONSOLIDATION
 * @story LC-07
 * @team Team A
 * @created 2026-01-29
 */

import { useCallback, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from '@tanstack/react-router';
import { ChevronDown, Layout } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

import { cn } from '@/lib/utils';
import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';
import {
  type WorkflowPreset,
  getAllPresets,
  getPresetConfig,
} from '@/presentation/layouts/workflow-presets';

// ============================================================================
// Constants
// ============================================================================

/**
 * Preset icons mapping (could be extended in the future)
 */
const PRESET_ICONS: Record<WorkflowPreset, string> = {
  default: '📋',
  focus: '🎯',
  code: '💻',
  'full-editor': '📝',
};

// ============================================================================
// Component
// ============================================================================

/**
 * PresetSelector - Route-Conditional Workflow Preset Dropdown
 *
 * @remarks
 * - Uses useParams({ strict: false }) to detect project routes
 * - Returns null when not in a project route
 * - Syncs with PluginLayoutStore.currentPreset
 *
 * 8-Bit Design:
 * - Sharp corners (rounded-none)
 * - Solid borders (border-2)
 * - No transparency
 */
export function PresetSelector() {
  const { t } = useTranslation();
  
  // Route detection: only render in project routes
  const params = useParams({ strict: false });
  const projectId = (params as { projectId?: string }).projectId;
  
  // Store state with useShallow (Zustand v5 pattern)
  const { currentPreset, setPreset } = usePluginLayoutStore(
    useShallow((state) => ({
      currentPreset: state.currentPreset,
      setPreset: state.setPreset,
    }))
  );
  
  // Dropdown state
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Get all presets for dropdown
  const allPresets = getAllPresets();
  const activePreset = getPresetConfig(currentPreset);
  
  // ========================================================================
  // Event Handlers
  // ========================================================================
  
  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);
  
  const handleSelect = useCallback(
    (presetId: WorkflowPreset) => {
      setPreset(presetId);
      setIsOpen(false);
      buttonRef.current?.focus();
    },
    [setPreset]
  );
  
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      } else if (event.key === 'ArrowDown' && !isOpen) {
        event.preventDefault();
        setIsOpen(true);
      }
    },
    [isOpen]
  );
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // ========================================================================
  // Route-Conditional Render
  // ========================================================================
  
  // Only render in project routes (when projectId is present)
  if (!projectId) {
    return null;
  }
  
  // ========================================================================
  // Render
  // ========================================================================
  
  return (
    <div
      ref={dropdownRef}
      className="preset-selector relative"
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={cn(
          // Layout
          'flex items-center gap-2 px-3 py-1.5',
          // 8-bit: Sharp corners, solid border
          'rounded-none border-2 border-border',
          // Colors
          'bg-background text-foreground',
          // Hover/Focus
          'hover:bg-muted hover:border-muted-foreground',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          // Typography
          'text-sm font-mono',
          // Transition
          'transition-colors duration-150'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('layout.presetSelector.ariaLabel', 'Select layout preset')}
      >
        <Layout size={16} aria-hidden="true" />
        <span className="hidden sm:inline">
          {t(activePreset.labelKey, activePreset.label)}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            'transition-transform duration-150',
            isOpen && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label={t('layout.presetSelector.menuLabel', 'Layout presets')}
          className={cn(
            // Position
            'absolute top-full left-0 mt-1 z-50',
            // Size
            'min-w-[180px]',
            // 8-bit: Sharp corners, solid border, pixel shadow
            'rounded-none border-2 border-border',
            'shadow-[4px_4px_0_0_rgba(0,0,0,0.3)]',
            // Colors
            'bg-card'
          )}
        >
          {allPresets.map((preset) => {
            const isActive = preset.id === currentPreset;
            
            return (
              <button
                key={preset.id}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => handleSelect(preset.id)}
                className={cn(
                  // Layout
                  'flex items-center gap-2 w-full px-3 py-2',
                  // Typography
                  'text-sm font-mono text-left',
                  // 8-bit: No rounding
                  'rounded-none',
                  // Colors
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-transparent text-foreground hover:bg-muted',
                  // Focus
                  'focus:outline-none focus-visible:bg-muted',
                  // Transition
                  'transition-colors duration-100'
                )}
              >
                <span aria-hidden="true">{PRESET_ICONS[preset.id]}</span>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {t(preset.labelKey, preset.label)}
                  </span>
                  <span
                    className={cn(
                      'text-xs',
                      isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    )}
                  >
                    {t(preset.descriptionKey, preset.description)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Display Name & Default Export
// ============================================================================

PresetSelector.displayName = 'PresetSelector';

export default PresetSelector;
