/**
 * @fileoverview Template Customization Component
 * @module presentation/components/templates/TemplateCustomization
 * @governance S-042
 * @created 2026-01-06T15:30:00+07:00
 *
 * Template configuration UI for package manager, TypeScript,
 * styling framework, state management, and testing framework selection.
 */

import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Info, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProjectTemplate, PackageManager } from '@/lib/templates/template-types';

// ============================================================================
// Types
// ============================================================================

export interface TemplateCustomizationProps {
  /** Selected template */
  template: ProjectTemplate;
  /** Current customization values */
  customizations: Record<string, any>;
  /** Update customization values */
  onCustomizationChange: (customizations: Record<string, any>) => void;
  /** Package manager selection */
  packageManager: PackageManager;
  /** Update package manager */
  onPackageManagerChange: (packageManager: PackageManager) => void;
  /** Validation errors */
  errors?: Record<string, string>;
}

// ============================================================================
// Package Manager Options
// ============================================================================>

const PACKAGE_MANAGERS: Array<{
  value: PackageManager;
  label: string;
  description: string;
  recommended?: boolean;
}> = [
  {
    value: 'npm',
    label: 'npm',
    description: 'Node Package Manager (default)',
  },
  {
    value: 'yarn',
    label: 'Yarn',
    description: 'Fast, reliable, and secure dependency management',
  },
  {
    value: 'pnpm',
    label: 'pnpm',
    description: 'Fast, disk space efficient package manager',
    recommended: true,
  },
  {
    value: 'bun',
    label: 'Bun',
    description: 'All-in-one toolkit for JavaScript/TypeScript',
  },
];

// ============================================================================
// Option Category Component
// ============================================================================

interface OptionCategoryProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const OptionCategory: React.FC<OptionCategoryProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="space-y-3 pb-6 border-b-2 border-border last:border-0 last:pb-0">
      <div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
};

// ============================================================================
// Option Item Component
// ============================================================================

interface OptionItemProps {
  label: string;
  description?: string;
  error?: string;
  children: React.ReactNode;
}

const OptionItem: React.FC<OptionItemProps> = ({
  label,
  description,
  error,
  children,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {error && (
          <span className="text-xs text-destructive flex items-center gap-1">
            <Info className="w-3 h-3" />
            {error}
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {children}
    </div>
  );
};

// ============================================================================
// Boolean Option Component
// ============================================================================

interface BooleanOptionProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  description?: string;
}

const BooleanOption: React.FC<BooleanOptionProps> = ({
  id: _id,
  label,
  checked,
  onChange,
  disabled = false,
  description,
}) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={cn(
        "w-full flex items-center justify-between p-3 border-2 rounded-[4px]",
        "transition-colors duration-150 text-left",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
        checked
          ? "bg-primary/10 border-primary"
          : "bg-background border-border hover:border-border hover:bg-muted",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      aria-pressed={checked}
    >
      <div className="flex-1">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && (
          <div className="text-xs text-muted-foreground mt-0.5">
            {description}
          </div>
        )}
      </div>
      <div
        className={cn(
          "w-5 h-5 min-w-[20px] min-h-[20px]",
          "border-2 rounded flex items-center justify-center",
          checked
            ? "bg-primary border-primary"
            : "bg-background border-border"
        )}
      >
        {checked && <Check className="w-3 h-3 text-primary-foreground" />}
      </div>
    </button>
  );
};

// ============================================================================
// Select Option Component
// ============================================================================>

interface SelectOptionProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  choices: Array<{ value: string; label: string; description?: string }>;
  disabled?: boolean;
}

const SelectOption: React.FC<SelectOptionProps> = ({
  id,
  // _label,
  value,
  onChange,
  choices,
  disabled = false,
}) => {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "w-full px-3 py-2.5 min-h-[44px]",
          "border-2 border-border bg-background text-foreground",
          "rounded-[4px] appearance-none",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "cursor-pointer"
        )}
      >
        {choices.map((choice) => (
          <option key={choice.value} value={choice.value}>
            {choice.label}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
        ▼
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

/**
 * TemplateCustomization - Configure template options
 *
 * Features:
 * - Package manager selection (npm, yarn, pnpm, bun)
 * - TypeScript toggle (if template supports it)
 * - Styling framework selection (CSS, SCSS, Tailwind, etc.)
 * - State management selection (Zustand, Redux, etc.)
 * - Testing framework selection (Vitest, Jest, Cypress, etc.)
 * - Organized by category (Core, Tooling, Styling, Testing)
 * - Mobile-optimized with touch targets ≥44px
 * - Live validation with error messages
 * - 8-bit gaming style (no glassmorphism)
 *
 * @example
 * ```tsx
 * <TemplateCustomization
 *   template={selectedTemplate}
 *   customizations={customizations}
 *   onCustomizationChange={setCustomizations}
 *   packageManager={packageManager}
 *   onPackageManagerChange={setPackageManager}
 * />
 * ```
 */
export const TemplateCustomization: React.FC<TemplateCustomizationProps> = ({
  template,
  customizations,
  onCustomizationChange,
  packageManager,
  onPackageManagerChange,
  errors = {},
}) => {
  const { t } = useTranslation();

  // Group customization options by category
  const coreOptions = template.customization.filter(
    (opt) => opt.category === 'core'
  );
  const toolingOptions = template.customization.filter(
    (opt) => opt.category === 'tooling'
  );
  const stylingOptions = template.customization.filter(
    (opt) => opt.category === 'styling'
  );
  const testingOptions = template.customization.filter(
    (opt) => opt.category === 'testing'
  );

  // Handle customization change
  const handleCustomizationChange = useCallback(
    (optionId: string, value: any) => {
      const updated = { ...customizations, [optionId]: value };
      onCustomizationChange(updated);
    },
    [customizations, onCustomizationChange]
  );

  // Render customization option
  const renderOption = (option: any) => {
    const error = errors[option.id];

    if (option.type === 'boolean') {
      return (
        <OptionItem
          key={option.id}
          label={option.label}
          description={option.description}
          error={error}
        >
          <BooleanOption
            id={option.id}
            label={option.label}
            checked={customizations[option.id] ?? option.default}
            onChange={(checked) => handleCustomizationChange(option.id, checked)}
            description={option.description}
          />
        </OptionItem>
      );
    }

    if (option.type === 'select') {
      return (
        <OptionItem
          key={option.id}
          label={option.label}
          description={option.description}
          error={error}
        >
          <SelectOption
            id={option.id}
            label={option.label}
            value={customizations[option.id] ?? option.default}
            onChange={(value) => handleCustomizationChange(option.id, value)}
            choices={option.choices || []}
          />
        </OptionItem>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">
          {t('templates.customization.title')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('templates.customization.description')}
        </p>
      </div>

      {/* Package Manager Selection */}
      <OptionCategory
        title={t('templates.customization.packageManager.title')}
        description={t('templates.customization.packageManager.description')}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PACKAGE_MANAGERS.map((pm) => (
            <button
              key={pm.value}
              type="button"
              onClick={() => onPackageManagerChange(pm.value)}
              className={cn(
                "flex items-start gap-3 p-3 border-2 rounded-[4px] text-left",
                "transition-colors duration-150",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
                packageManager === pm.value
                  ? "bg-primary/10 border-primary"
                  : "bg-background border-border hover:border-border hover:bg-muted"
              )}
              aria-pressed={packageManager === pm.value}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground text-sm">
                    {pm.label}
                  </span>
                  {pm.recommended && (
                    <span className="px-1.5 py-0.5 text-xs bg-primary/20 text-primary border border-primary rounded">
                      {t('templates.customization.recommended')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {pm.description}
                </p>
              </div>
              {packageManager === pm.value && (
                <div className="w-5 h-5 min-w-[20px] min-h-[20px] border-2 bg-primary border-primary rounded flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>
      </OptionCategory>

      {/* Core Options */}
      {coreOptions.length > 0 && (
        <OptionCategory
          title={t('templates.customization.core.title')}
          description={t('templates.customization.core.description')}
        >
          <div className="space-y-3">{coreOptions.map(renderOption)}</div>
        </OptionCategory>
      )}

      {/* Tooling Options */}
      {toolingOptions.length > 0 && (
        <OptionCategory
          title={t('templates.customization.tooling.title')}
          description={t('templates.customization.tooling.description')}
        >
          <div className="space-y-3">{toolingOptions.map(renderOption)}</div>
        </OptionCategory>
      )}

      {/* Styling Options */}
      {stylingOptions.length > 0 && (
        <OptionCategory
          title={t('templates.customization.styling.title')}
          description={t('templates.customization.styling.description')}
        >
          <div className="space-y-3">{stylingOptions.map(renderOption)}</div>
        </OptionCategory>
      )}

      {/* Testing Options */}
      {testingOptions.length > 0 && (
        <OptionCategory
          title={t('templates.customization.testing.title')}
          description={t('templates.customization.testing.description')}
        >
          <div className="space-y-3">{testingOptions.map(renderOption)}</div>
        </OptionCategory>
      )}

      {/* Summary */}
      <div className="border-2 border-border rounded-[4px] p-4 bg-muted/30">
        <h3 className="text-sm font-semibold text-foreground mb-2">
          {t('templates.customization.summary.title')}
        </h3>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">
              {t('templates.customization.summary.template')}:
            </span>{' '}
            {template.name}
          </div>
          <div>
            <span className="font-medium text-foreground">
              {t('templates.customization.summary.packageManager')}:
            </span>{' '}
            {packageManager}
          </div>
          {Object.keys(customizations).length > 0 && (
            <div>
              <span className="font-medium text-foreground">
                {t('templates.customization.summary.options')}:
              </span>{' '}
              {Object.entries(customizations)
                .filter(([_, value]) => value !== undefined && value !== 'none')
                .map(([key, value]) => `${key}=${value}`)
                .join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
