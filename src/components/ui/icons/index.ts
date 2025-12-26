/**
 * Custom 8-bit Icon Set for Via-gent
 *
 * All icons follow the 8-bit design system:
 * - 24x24px base size
 * - 2px stroke width
 * - Squared corners (no rounded edges)
 * - Pixel-perfect alignment
 * - Dark theme colors from design tokens
 *
 * Usage:
 * ```tsx
 * import { MenuIcon, CloseIcon, FileIcon } from '@/components/ui/icons';
 *
 * <MenuIcon size={24} className="text-primary" />
 * ```
 */

export { MenuIcon } from './MenuIcon';
export { CloseIcon } from './CloseIcon';
export { FileIcon } from './FileIcon';
export { AIIcon } from './AIIcon';
export { TerminalIcon } from './TerminalIcon';
export { SettingsIcon } from './SettingsIcon';
export { ChatIcon } from './ChatIcon';
export { RefreshIcon } from './RefreshIcon';
export { PlusIcon } from './PlusIcon';

// Re-export base icon component and props
export { Icon } from './icon';
export type { IconProps } from './icon';
