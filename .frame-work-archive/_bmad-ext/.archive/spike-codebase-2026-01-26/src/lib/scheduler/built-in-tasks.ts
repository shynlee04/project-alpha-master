/**
 * Built-in Task Definitions
 *
 * Pre-defined task templates for common operations.
 */

import { CronPresets } from './cron-parser'

export interface TaskDefinition {
  id: string
  name: string
  description: string
  category: 'maintenance' | 'backup' | 'sync' | 'automation'
  defaultSchedule: string
  defaultEnabled: boolean
  handler: () => Promise<void>
}

/**
 * Auto-save task: Saves project state periodically
 */
async function autoSaveHandler(): Promise<void> {
  // Trigger auto-save through app store or event bus
  console.log('[Scheduler] Running auto-save...')

  // Emit event to trigger save
  window.dispatchEvent(new CustomEvent('scheduler:task-execute', {
    detail: { taskId: 'auto-save' }
  }))
}

/**
 * Backup task: Exports settings and data
 */
async function backupHandler(): Promise<void> {
  console.log('[Scheduler] Running backup...')

  window.dispatchEvent(new CustomEvent('scheduler:task-execute', {
    detail: { taskId: 'backup' }
  }))
}

/**
 * Clean cache task: Removes old cache entries
 */
async function cleanCacheHandler(): Promise<void> {
  console.log('[Scheduler] Running cache clean...')

  window.dispatchEvent(new CustomEvent('scheduler:task-execute', {
    detail: { taskId: 'clean-cache' }
  }))
}

/**
 * Index update task: Rebuilds search index
 */
async function indexUpdateHandler(): Promise<void> {
  console.log('[Scheduler] Running index update...')

  window.dispatchEvent(new CustomEvent('scheduler:task-execute', {
    detail: { taskId: 'index-update' }
  }))
}

/**
 * Export built-in task definitions
 */
export const BuiltInTasks: TaskDefinition[] = [
  {
    id: 'auto-save',
    name: 'Auto-Save Projects',
    description: 'Automatically save project state and work',
    category: 'automation',
    defaultSchedule: CronPresets.every5Minutes,
    defaultEnabled: true,
    handler: autoSaveHandler,
  },
  {
    id: 'backup',
    name: 'Backup Database',
    description: 'Export settings and data to JSON file',
    category: 'backup',
    defaultSchedule: CronPresets.dailyAtMidnight,
    defaultEnabled: true,
    handler: backupHandler,
  },
  {
    id: 'clean-cache',
    name: 'Clean Cache',
    description: 'Remove old cache entries and temporary files',
    category: 'maintenance',
    defaultSchedule: CronPresets.weekly,
    defaultEnabled: false,
    handler: cleanCacheHandler,
  },
  {
    id: 'index-update',
    name: 'Update Search Index',
    description: 'Rebuild search index for faster queries',
    category: 'maintenance',
    defaultSchedule: CronPresets.every6Hours,
    defaultEnabled: false,
    handler: indexUpdateHandler,
  },
]

/**
 * Get task definition by ID
 */
export function getTaskDefinition(taskId: string): TaskDefinition | undefined {
  return BuiltInTasks.find(task => task.id === taskId)
}

/**
 * Get tasks by category
 */
export function getTasksByCategory(category: TaskDefinition['category']): TaskDefinition[] {
  return BuiltInTasks.filter(task => task.category === category)
}
