/**
 * @fileoverview Workflow Preset Selector
 * @module components/layout/PresetSelector
 *
 * Dropdown to switch between workflow layout presets with keyboard support.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Layout } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/lib/utils';
import { usePluginLayoutStore } from '@/presentation/layouts/PluginLayoutStore';
import { WORKFLOW_PRESETS, type WorkflowPreset } from '@/presentation/layouts/workflow-presets';

const listboxId = 'workflow-preset-selector';

export function PresetSelector() {
  const { t } = useTranslation();
  const { currentPreset, setPreset } = usePluginLayoutStore(
    useShallow((state) => ({
      currentPreset: state.currentPreset,
      setPreset: state.setPreset,
    }))
  );

  const presets = useMemo(() => Object.values(WORKFLOW_PRESETS), []);
  const currentIndex = useMemo(
    () => presets.findIndex((preset) => preset.id === currentPreset),
    [presets, currentPreset]
  );
  const currentConfig = presets[currentIndex] ?? presets[0];

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(currentIndex >= 0 ? currentIndex : 0);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusOption = useCallback((index: number) => {
    const option = optionRefs.current[index];
    if (option) {
      option.focus();
    }
  }, []);

  const closeMenu = useCallback((returnFocus = true) => {
    setIsOpen(false);
    if (returnFocus) {
      buttonRef.current?.focus();
    }
  }, []);

  const openMenu = useCallback(
    (index: number) => {
      const clampedIndex = Math.min(Math.max(index, 0), presets.length - 1);
      setIsOpen(true);
      setActiveIndex(clampedIndex);
      requestAnimationFrame(() => focusOption(clampedIndex));
    },
    [focusOption, presets.length]
  );

  const handleSelect = useCallback(
    (presetId: WorkflowPreset) => {
      setPreset(presetId);
      closeMenu();
    },
    [closeMenu, setPreset]
  );

  const handleToggle = useCallback(() => {
    if (isOpen) {
      closeMenu();
      return;
    }
    openMenu(currentIndex >= 0 ? currentIndex : 0);
  }, [closeMenu, currentIndex, isOpen, openMenu]);

  const handleButtonKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        openMenu(currentIndex >= 0 ? currentIndex : 0);
      }
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        closeMenu();
      }
    },
    [closeMenu, currentIndex, isOpen, openMenu]
  );

  const handleOptionKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex = (index + 1) % presets.length;
        setActiveIndex(nextIndex);
        focusOption(nextIndex);
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        const prevIndex = (index - 1 + presets.length) % presets.length;
        setActiveIndex(prevIndex);
        focusOption(prevIndex);
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        handleSelect(presets[index]?.id ?? currentPreset);
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
      }
    },
    [closeMenu, currentPreset, focusOption, handleSelect, presets]
  );

  useEffect(() => {
    if (!isOpen && currentIndex >= 0) {
      setActiveIndex(currentIndex);
    }
  }, [currentIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        closeMenu(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [closeMenu, isOpen]);

  if (!currentConfig) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        onKeyDown={handleButtonKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5',
          'border-2 border-zinc-700 bg-zinc-900',
          'hover:border-orange-500 transition-colors',
          'rounded-none font-mono text-sm text-zinc-100'
        )}
      >
        <Layout className="h-4 w-4 text-zinc-400" aria-hidden="true" />
        <span>{t(currentConfig.labelKey, { defaultValue: currentConfig.label })}</span>
        <ChevronDown className="h-4 w-4 text-zinc-400" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className={cn(
            'absolute left-0 top-full mt-1 w-52',
            'bg-zinc-900 border-2 border-zinc-700',
            'rounded-none shadow-pixel z-50',
            'py-1'
          )}
        >
          {presets.map((preset, index) => (
            <button
              key={preset.id}
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              type="button"
              role="option"
              aria-selected={preset.id === currentPreset}
              tabIndex={index === activeIndex ? 0 : -1}
              onClick={() => handleSelect(preset.id)}
              onKeyDown={(event) => handleOptionKeyDown(event, index)}
              onMouseEnter={() => setActiveIndex(index)}
              className={cn(
                'w-full px-3 py-2 text-left',
                'text-sm font-mono rounded-none',
                'hover:bg-zinc-800 focus:bg-zinc-800 focus:outline-none',
                preset.id === currentPreset
                  ? 'text-orange-500 bg-zinc-800'
                  : 'text-zinc-100'
              )}
            >
              <div>{t(preset.labelKey, { defaultValue: preset.label })}</div>
              <div
                className={cn(
                  'text-xs',
                  preset.id === currentPreset ? 'text-orange-300' : 'text-zinc-500'
                )}
              >
                {t(preset.descriptionKey, { defaultValue: preset.description })}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default PresetSelector;
