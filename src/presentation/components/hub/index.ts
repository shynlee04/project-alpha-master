/**
 * Hub Components Barrel Export
 *
 * Exports all hub-based navigation components.
 *
 * @file index.ts
 * @created 2025-12-26T12:50:00Z
 * @updated 2026-01-02T20:10:00+07:00 - Added BootSequence, HubHero, RecentProjectsSection
 */

// Main hub components
export { HubHomePage } from './HubHomePage';
export { BootSequence } from './BootSequence';
export { HubHero } from './HubHero';
export { RecentProjectsSection } from './RecentProjectsSection';
export type { RecentProjectsSectionProps } from './RecentProjectsSection';
export type { BootSequenceProps } from './BootSequence';

// Feature showcase components
export { TopicCard } from './TopicCard';
export { TopicPortalCard } from './TopicPortalCard';

// Navigation components
export { NavigationBreadcrumbs } from './NavigationBreadcrumbs';

// Workspace management
export { WorkspaceBindingDialog } from './WorkspaceBindingDialog';
export { WorkspaceBadge } from './WorkspaceBadge';
export { ProjectCard } from './ProjectCard';
export type { WorkspaceBindingDialogProps } from './WorkspaceBindingDialog';
export type { WorkspaceBadgeProps } from './WorkspaceBadge';
export type { ProjectCardProps } from './ProjectCard';

// Re-export WorkspaceId from canonical location
export type { WorkspaceId } from '@/lib/workspace';

