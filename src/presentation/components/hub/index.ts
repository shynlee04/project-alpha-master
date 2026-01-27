/**
 * Hub Components Barrel Export
 *
 * Exports all hub-based navigation components.
 *
 * @file index.ts
 * @created 2025-12-26T12:50:00Z
 * @updated 2026-01-02T20:10:00+07:00 - Added BootSequence, HubHero, RecentProjectsSection
 * @updated 2026-01-02T21:30:00+07:00 - Added DeleteProjectDialog
 * @updated 2026-01-02T23:00:00+07:00 - Refactored WorkspaceBindingDialog subcomponents
 * @updated 2026-01-06T00:00:00+07:00 - Added WorkspaceBindingToggle (Phase 1A)
 */

// Main hub components
export { HubHomePage } from './HubHomePage';
export { HubHero } from './HubHero';
export { RecentProjectsSection } from './RecentProjectsSection';
export type { RecentProjectsSectionProps } from './RecentProjectsSection';

// Workspace management
export { WorkspaceBindingDialog } from './WorkspaceBindingDialog';
export { WorkspaceBindingToggle, WorkspaceBindingList } from './WorkspaceBindingToggle';
export { WorkspaceBadge } from './WorkspaceBadge';
export { ProjectCard } from './ProjectCard';
export { ProjectActionsMenu } from './ProjectActionsMenu';
export { ProjectMetadataDialog } from './ProjectMetadataDialog';
export { DeleteProjectDialog } from './DeleteProjectDialog';

// WorkspaceBindingDialog subcomponents (refactored January 2026)
export { WorkspaceBindingHeader } from './WorkspaceBindingHeader';
export { WorkspaceCheckboxList } from './WorkspaceCheckboxList';
export { WorkspaceCheckboxItem } from './WorkspaceCheckboxItem';
export { InitialWorkspaceSelector } from './InitialWorkspaceSelector';
export { WorkspaceBindingFooter } from './WorkspaceBindingFooter';
export { useWorkspaceBindingState } from './useWorkspaceBindingState';

// Project search (refactored January 2026)
export { ProjectSearchBar } from './ProjectSearchBar';
export { useProjectSearch } from './useProjectSearch';

// Workspace filter hooks (refactored January 2026)
export { useWorkspaceFilters } from './useWorkspaceFilters';

// Dashboard metrics (refactored January 2026)
export { SummaryCardsGrid } from './SummaryCardsGrid';
export { ProjectCountCard } from './ProjectCountCard';
export { StorageUsageCard } from './StorageUsageCard';
export { ActivityCard } from './ActivityCard';
export { useDashboardMetrics } from './useDashboardMetrics';

// Dashboard charts (refactored January 2026)
export { ChartsGrid } from './ChartsGrid';
export { WorkspacePieChart } from './WorkspacePieChart';
export { useMetricsCollection } from './useMetricsCollection';

// Type exports
export type { WorkspaceBindingDialogProps, WorkspaceId, WorkspaceConfig } from './WorkspaceBindingDialog.types';
export type { WorkspaceBindingToggleProps, WorkspaceBindingListProps, WorkspaceId as ToggleWorkspaceId } from './WorkspaceBindingToggle';
export type { WorkspaceBadgeProps } from './WorkspaceBadge';
export type { ProjectCardProps } from './ProjectCard';
export type { ProjectActionsMenuProps } from './ProjectActionsMenu';
export type { ProjectMetadataDialogProps, ProjectMetadata } from './ProjectMetadataDialog';
export type { DeleteProjectDialogProps } from './DeleteProjectDialog';
export type { WorkspaceBindingHeaderProps } from './WorkspaceBindingHeader';
export type { WorkspaceCheckboxListProps } from './WorkspaceCheckboxList';
export type { InitialWorkspaceSelectorProps } from './InitialWorkspaceSelector';
export type { WorkspaceBindingFooterProps } from './WorkspaceBindingFooter';
export type { UseWorkspaceBindingStateResult } from './useWorkspaceBindingState';
export type { ProjectSearchBarProps } from './ProjectSearchBar';
export type { UseProjectSearchResult } from './useProjectSearch';

export type { UseWorkspaceFiltersResult, WorkspaceFilters, WorkspaceFilterType } from './useWorkspaceFilters';
export type { SummaryCardsGridProps } from './SummaryCardsGrid';
export type { ProjectCountCardProps } from './ProjectCountCard';
export type { StorageUsageCardProps } from './StorageUsageCard';
export type { ActivityCardProps } from './ActivityCard';
export type { DashboardMetrics, UseDashboardMetricsOptions } from './useDashboardMetrics';
export type { ChartsGridProps } from './ChartsGrid';

export type { WorkspacePieChartProps } from './WorkspacePieChart';
export type { UseMetricsCollectionOptions } from './useMetricsCollection';

// Re-export WorkspaceId from canonical location (deprecated: use WorkspaceBindingDialog.types.ts)
export type { WorkspaceId as WorkspaceIdLegacy } from '@/lib/workspace';

