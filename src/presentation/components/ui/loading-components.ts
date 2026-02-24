/**
 * Loading Components Barrel Export
 * @module components/ui/loading-components
 *
 * Centralized exports for all loading state components.
 *
 * @epic S-020 - Loading States and Progress Indicators
 */

// Main loading components
export { LoadingSpinner, LoadingSpinnerInline } from './LoadingSpinner'
export type {
  LoadingSpinnerProps,
  LoadingSpinnerInlineProps,
  LoadingSpinnerVariants,
  SpinnerSize,
} from './LoadingSpinner'

// Progress components
export { ProgressBar, ProgressBarInline } from './ProgressBar'
export type {
  ProgressBarProps,
  ProgressBarInlineProps,
  ProgressBarVariants,
  ProgressSize,
} from './ProgressBar'

// Skeleton components
export {
  SkeletonScreen,
  SkeletonCard,
  SkeletonList,
  SkeletonChat,
} from './SkeletonScreen'
export type {
  SkeletonScreenProps,
  SkeletonCardProps,
  SkeletonListProps,
  SkeletonChatProps,
  SkeletonVariant,
} from './SkeletonScreen'

// Streaming components
export {
  StreamingIndicator,
  StreamingIndicatorInline,
  TokenCounter,
} from './StreamingIndicator'
export type {
  StreamingIndicatorProps,
  StreamingIndicatorInlineProps,
  TokenCounterProps,
  StreamingSize,
} from './StreamingIndicator'

// Legacy loading components (re-exported for backwards compatibility)
export { LoadingState } from './LoadingState'
export type { LoadingStateProps, LoadingVariant } from './LoadingState'

export { SkeletonLoader } from './SkeletonLoader'
export type { SkeletonLoaderProps } from './SkeletonLoader'

export { ModelLoadingSpinner, ModelLoadingSpinnerInline } from './ModelLoadingSpinner'
export type { ModelLoadingSpinnerProps, ModelLoadingSpinnerInlineProps } from './ModelLoadingSpinner'
