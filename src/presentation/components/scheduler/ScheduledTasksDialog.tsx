/**
 * Scheduled Tasks Dialog
 *
 * Full-screen task management UI for mobile and desktop.
 * Displays all scheduled tasks with controls to enable/disable, edit, delete, and run manually.
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Play, Pause, Plus, Trash2, Edit, Clock, CheckCircle, XCircle, History } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/presentation/components/ui/dialog'
import { Button } from '@/presentation/components/ui/button'
import { useTaskScheduler } from '@/hooks/useTaskScheduler'
import type { ScheduledTask } from '@/lib/scheduler/task-scheduler'
import { TaskEditor } from './TaskEditor'
import { TaskExecutionHistory } from './TaskExecutionHistory'

interface ScheduledTasksDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ScheduledTasksDialog({ open, onOpenChange }: ScheduledTasksDialogProps) {
  const { t } = useTranslation()
  const { tasks, isLoading, executeTask, toggleTask, deleteTask } = useTaskScheduler()

  const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [selectedTaskForHistory, setSelectedTaskForHistory] = useState<string | null>(null)

  const handleEditTask = (task: ScheduledTask) => {
    setEditingTask(task)
    setShowEditor(true)
  }

  const handleCreateTask = () => {
    setEditingTask(null)
    setShowEditor(true)
  }

  const handleCloseEditor = () => {
    setShowEditor(false)
    setEditingTask(null)
  }

  const handleRunNow = async (taskId: string) => {
    await executeTask(taskId)
  }

  const handleToggleTask = async (taskId: string) => {
    await toggleTask(taskId)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (confirm(t('scheduler.confirmDelete', { defaultValue: 'Are you sure you want to delete this task?' }))) {
      await deleteTask(taskId)
    }
  }

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getCategoryColor = (category: ScheduledTask['category']) => {
    switch (category) {
      case 'maintenance':
        return 'text-blue-500'
      case 'backup':
        return 'text-green-500'
      case 'sync':
        return 'text-purple-500'
      case 'automation':
        return 'text-orange-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <>
      <Dialog open={open && !showEditor && !selectedTaskForHistory} onOpenChange={onOpenChange}>
        <DialogContent size="full" className="h-[calc(100dvh-2rem)] max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {t('scheduler.title', { defaultValue: 'Scheduled Tasks' })}
            </DialogTitle>
            <DialogDescription>
              {t('scheduler.description', { defaultValue: 'Manage automated tasks and schedules' })}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-[var(--muted-foreground)]">
                  {t('scheduler.loading', { defaultValue: 'Loading tasks...' })}
                </div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Clock className="w-16 h-16 text-[var(--muted-foreground)]" />
                <div className="text-[var(--muted-foreground)]">
                  {t('scheduler.noTasks', { defaultValue: 'No scheduled tasks yet' })}
                </div>
                <Button onClick={handleCreateTask} variant="primary">
                  <Plus className="w-4 h-4" />
                  {t('scheduler.createTask', { defaultValue: 'Create Task' })}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-[var(--border)] rounded-[4px] p-4 bg-[var(--card)] hover:border-[var(--primary)] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[var(--foreground)] truncate">
                            {task.name}
                          </h3>
                          <span className={`text-xs font-medium ${getCategoryColor(task.category)}`}>
                            {t(`scheduler.category.${task.category}`, { defaultValue: task.category })}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)] mb-2 line-clamp-2">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <code className="text-xs">{task.cronExpression}</code>
                          </div>
                          {task.lastRun && (
                            <div className="flex items-center gap-1">
                              {task.lastError ? (
                                <XCircle className="w-3 h-3 text-red-500" />
                              ) : (
                                <CheckCircle className="w-3 h-3 text-green-500" />
                              )}
                              <span>
                                {t('scheduler.lastRun', { defaultValue: 'Last run' })}: {formatDateTime(task.lastRun)}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <span>
                              {t('scheduler.runCount', { defaultValue: 'Runs' })}: {task.runCount}
                            </span>
                            {task.failureCount > 0 && (
                              <span className="text-red-500">
                                ({t('scheduler.failures', { defaultValue: 'failures' })}: {task.failureCount})
                              </span>
                            )}
                          </div>
                        </div>
                        {task.lastError && (
                          <div className="mt-2 text-xs text-red-500 bg-red-500/10 p-2 rounded">
                            {task.lastError}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          iconOnly
                          onClick={() => handleRunNow(task.id)}
                          disabled={!task.enabled}
                          aria-label={t('scheduler.runNow', { defaultValue: 'Run now' })}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={task.enabled ? 'secondary' : 'primary'}
                          onClick={() => handleToggleTask(task.id)}
                          aria-label={task.enabled ? t('scheduler.pause', { defaultValue: 'Pause' }) : t('scheduler.resume', { defaultValue: 'Resume' })}
                        >
                          {task.enabled ? (
                            <>
                              <Pause className="w-4 h-4" />
                              <span className="hidden sm:inline">
                                {t('scheduler.pause', { defaultValue: 'Pause' })}
                              </span>
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              <span className="hidden sm:inline">
                                {t('scheduler.resume', { defaultValue: 'Resume' })}
                              </span>
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          iconOnly
                          onClick={() => setSelectedTaskForHistory(task.id)}
                          aria-label={t('scheduler.history', { defaultValue: 'History' })}
                        >
                          <History className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          iconOnly
                          onClick={() => handleEditTask(task)}
                          aria-label={t('common.edit', { defaultValue: 'Edit' })}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          iconOnly
                          onClick={() => handleDeleteTask(task.id)}
                          aria-label={t('common.delete', { defaultValue: 'Delete' })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {task.nextRun && (
                      <div className="mt-2 text-xs text-[var(--muted-foreground)]">
                        {t('scheduler.nextRun', { defaultValue: 'Next run' })}: {formatDateTime(task.nextRun)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              {t('common.close', { defaultValue: 'Close' })}
            </Button>
            <Button variant="primary" onClick={handleCreateTask}>
              <Plus className="w-4 h-4" />
              {t('scheduler.createTask', { defaultValue: 'Create Task' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showEditor && (
        <TaskEditor
          open={showEditor}
          task={editingTask}
          onClose={handleCloseEditor}
        />
      )}

      {selectedTaskForHistory && (
        <TaskExecutionHistory
          open={!!selectedTaskForHistory}
          taskId={selectedTaskForHistory}
          onClose={() => setSelectedTaskForHistory(null)}
        />
      )}
    </>
  )
}
