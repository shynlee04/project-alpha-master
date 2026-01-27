/**
 * @fileoverview SidebarSection - Collapsible section component
 * @module presentation/components/sidebar/SidebarSection
 *
 * **ARCH-03-01**: Create ProjectSidebar Component
 *
 * Reusable collapsible section for sidebar.
 * Shows header with title and toggle button,
 * expands/collapses children on click.
 *
 * @epic EPIC-ARCH-03
 * @story ARCH-03-01
 * @team Team A
 * @created 2026-01-22
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ============================================================================
// Props
// ============================================================================

export interface SidebarSectionProps {
  /** Section title */
  title: string;

  /** Icon to display in header */
  icon?: LucideIcon;

  /** Initially expanded (default: true) */
  defaultExpanded?: boolean;

  /** Section content */
  children: React.ReactNode;

  /** Custom className for section wrapper */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * SidebarSection Component
 *
 * Collapsible section with header and content.
 * 8-bit design: sharp corners, pixel shadows.
 */
export function SidebarSection({
  title,
  icon: Icon,
  defaultExpanded = true,
  children,
  className = '',
}: SidebarSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`sidebar-section ${className}`}>
      {/* Header */}
      <button
        type="button"
        onClick={toggleExpanded}
        className="sidebar-section-header w-full flex items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted hover:bg-accent border-b border-border cursor-pointer transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-foreground" />}
          <span className="text-foreground">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronDown size={16} className="text-muted-foreground" />
        ) : (
          <ChevronRight size={16} className="text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="sidebar-section-content">
          {children}
        </div>
      )}
    </div>
  );
}
