/**
 * Task Editor Dialog
 *
 * Create or edit scheduled tasks with schedule builder UI.
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
import { CronPresets, describeCronExpression, validateCronExpression } from '@/lib/scheduler/cron-parser'
import { BuiltInTasks } from '@/lib/scheduler/built-in-tasks'
import type { ScheduledTask } from '@/lib/scheduler/task-scheduler'
import { Label } from '@/presentation/components/ui/label'
import { textareaClasses } from '@/presentation/components/ui/textarea'

interface TaskEditorProps {
  open: boolean
  task: ScheduledTask | null
  onClose: () => void
}

export function TaskEditor({ open, task, onClose }: TaskEditorProps) {
  const { t } = useTranslation()
  const { addTask, updateTask } = useTaskScheduler()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [cronExpression, setCronExpression] = useState('')
  const [category, setCategory] = useState<ScheduledTask['category']>('automation')
  const [enabled, setEnabled] = useState(true)
  const [usePreset, setUsePreset] = useState<string>('custom')
  const [validationError, setValidationError] = useState<string | null>(null)

  const isEditing = !!task

  useEffect(() => {
    if (task) {
      setName(task.name)
      setDescription(task.description)
      setCronExpression(task.cronExpression)
      setCategory(task.category)
      setEnabled(task.enabled)

      // Check if it matches a preset
      const presetKey = Object.entries(CronPresets).find(([_, expr]) => expr === task.cronExpression)?.[0]
      setUsePreset(presetKey || 'custom')
    } else {
      // Default values for new task
      setName('')
      setDescription('')
      setCronExpression(CronPresets.everyHour)
      setCategory('automation')
      setEnabled(true)
      setUsePreset('everyHour')
    }
    setValidationError(null)
  }, [task, open])

  useEffect(() => {
    const validation = validateCronExpression(cronExpression)
    if (!validation.valid) {
      setValidationError(validation.error || null)
    } else {
      setValidationError(null)
    }
  }, [cronExpression])

  const handlePresetChange = (presetKey: string) => {
    setUsePreset(presetKey)

    if (presetKey !== 'custom' && CronPresets[presetKey as keyof typeof CronPresets]) {
      setCronExpression(CronPresets[presetKey as keyof typeof CronPresets])
    }
  }

  const handleBuiltInTaskSelect = (taskId: string) => {
    const definition = BuiltInTasks.find(t => t.id === taskId)
    if (definition) {
      setName(definition.name)
      setDescription(definition.description)
      setCronExpression(definition.defaultSchedule)
      setCategory(definition.category)
      setEnabled(definition.defaultEnabled)

      const presetKey = Object.entries(CronPresets).find(([_, expr]) => expr === definition.defaultSchedule)?.[0]
      setUsePreset(presetKey || 'custom')
    }
  }

  const handleSave = async () => {
    if (validationError) {
      return
    }

    if (!name.trim()) {
      setValidationError(t('scheduler.error.nameRequired', { defaultValue: 'Name is required' }))
      return
    }

    try {
      const taskData = {
        name: name.trim(),
        description: description.trim(),
        cronExpression,
        category,
        enabled,
      }

      if (isEditing && task) {
        await updateTask(task.id, taskData)
      } else {
        await addTask({
          ...taskData,
          id: `custom-${Date.now()}`,
        })
      }

      onClose()
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Unknown error')
    }
  }

  const scheduleDescription = describeCronExpression(cronExpression)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="lg" className="max-h-[calc(100dvh-4rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t('scheduler.editTask', { defaultValue: 'Edit Task' })
              : t('scheduler.createTask', { defaultValue: 'Create Task' })
            }
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? t('scheduler.editTaskDescription', { defaultValue: 'Modify the scheduled task settings' })
              : t('scheduler.createTaskDescription', { defaultValue: 'Create a new scheduled task' })
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isEditing && (
            <div>
              <Label htmlFor="built-in-task">
                {t('scheduler.useBuiltIn', { defaultValue: 'Use Built-in Task' })}
              </Label>
              <select
                id="built-in-task"
                className="mt-1 w-full px-3 py-2 border border-[var(--border)] rounded-[4px] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                value=""
                onChange={(e) => e.target.value && handleBuiltInTaskSelect(e.target.value)}
              >
                <option value="">{t('scheduler.selectBuiltIn', { defaultValue: 'Select a built-in task...' })}</option>
                {BuiltInTasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.name} - {task.description}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <Label htmlFor="task-name">
              {t('scheduler.taskName', { defaultValue: 'Task Name' })} *
            </Label>
            <input
              id="task-name"
              type="text"
              className="mt-1 w-full px-3 py-2 border border-[var(--border)] rounded-[4px] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('scheduler.taskNamePlaceholder', { defaultValue: 'My Task' })}
            />
          </div>

          <div>
            <Label htmlFor="task-description">
              {t('scheduler.taskDescription', { defaultValue: 'Description' })}
            </Label>
            <textarea
              id="task-description"
              className={textareaClasses}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('scheduler.taskDescriptionPlaceholder', { defaultValue: 'What does this task do?' })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="task-category">
              {t('scheduler.category', { defaultValue: 'Category' })}
            </Label>
            <select
              id="task-category"
              className="mt-1 w-full px-3 py-2 border border-[var(--border)] rounded-[4px] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              value={category}
              onChange={(e) => setCategory(e.target.value as ScheduledTask['category'])}
            >
              <option value="automation">{t('scheduler.category.automation', { defaultValue: 'Automation' })}</option>
              <option value="maintenance">{t('scheduler.category.maintenance', { defaultValue: 'Maintenance' })}</option>
              <option value="backup">{t('scheduler.category.backup', { defaultValue: 'Backup' })}</option>
              <option value="sync">{t('scheduler.category.sync', { defaultValue: 'Sync' })}</option>
              <option value="custom">{t('scheduler.category.custom', { defaultValue: 'Custom' })}</option>
            </select>
          </div>

          <div>
            <Label htmlFor="schedule-preset">
              {t('scheduler.schedulePreset', { defaultValue: 'Schedule Preset' })}
            </Label>
            <select
              id="schedule-preset"
              className="mt-1 w-full px-3 py-2 border border-[var(--border)] rounded-[4px] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              value={usePreset}
              onChange={(e) => handlePresetChange(e.target.value)}
            >
              <option value="custom">{t('scheduler.custom', { defaultValue: 'Custom' })}</option>
              <option value="everyMinute">{t('scheduler.preset.everyMinute', { defaultValue: 'Every minute' })}</option>
              <option value="every5Minutes">{t('scheduler.preset.every5Minutes', { defaultValue: 'Every 5 minutes' })}</option>
              <option value="every15Minutes">{t('scheduler.preset.every15Minutes', { defaultValue: 'Every 15 minutes' })}</option>
              <option value="every30Minutes">{t('scheduler.preset.every30Minutes', { defaultValue: 'Every 30 minutes' })}</option>
              <option value="everyHour">{t('scheduler.preset.everyHour', { defaultValue: 'Every hour' })}</option>
              <option value="every2Hours">{t('scheduler.preset.every2Hours', { defaultValue: 'Every 2 hours' })}</option>
              <option value="every6Hours">{t('scheduler.preset.every6Hours', { defaultValue: 'Every 6 hours' })}</option>
              <option value="every12Hours">{t('scheduler.preset.every12Hours', { defaultValue: 'Every 12 hours' })}</option>
              <option value="dailyAtMidnight">{t('scheduler.preset.dailyAtMidnight', { defaultValue: 'Daily at midnight' })}</option>
              <option value="dailyAt9am">{t('scheduler.preset.dailyAt9am', { defaultValue: 'Daily at 9 AM' })}</option>
              <option value="weekdaysAt9am">{t('scheduler.preset.weekdaysAt9am', { defaultValue: 'Weekdays at 9 AM' })}</option>
              <option value="weekly">{t('scheduler.preset.weekly', { defaultValue: 'Weekly' })}</option>
              <option value="monthly">{t('scheduler.preset.monthly', { defaultValue: 'Monthly' })}</option>
              <option value="yearly">{t('scheduler.preset.yearly', { defaultValue: 'Yearly' })}</option>
            </select>
          </div>

          <div>
            <Label htmlFor="cron-expression">
              {t('scheduler.cronExpression', { defaultValue: 'Cron Expression' })} *
            </Label>
            <input
              id="cron-expression"
              type="text"
              className={`mt-1 w-full px-3 py-2 border rounded-[4px] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${
                validationError ? 'border-red-500' : 'border-[var(--border)]'
              }`}
              value={cronExpression}
              onChange={(e) => {
                setCronExpression(e.target.value)
                setUsePreset('custom')
              }}
              placeholder="0 * * * *"
            />
            <div className="mt-1 text-sm text-[var(--muted-foreground)]">
              {scheduleDescription}
            </div>
            {validationError && (
              <div className="mt-1 text-sm text-red-500">
                {validationError}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="task-enabled">
              {t('scheduler.enabled', { defaultValue: 'Enabled' })}
            </Label>
            <div className="mt-1 flex items-center gap-2">
              <input
                id="task-enabled"
                type="checkbox"
                className="w-4 h-4 border border-[var(--border)] rounded-[4px] bg-[var(--background)] text-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)]"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              <span className="text-sm text-[var(--muted-foreground)]">
                {enabled
                  ? t('scheduler.enabledDescription', { defaultValue: 'Task will run according to schedule' })
                  : t('scheduler.disabledDescription', { defaultValue: 'Task is paused and will not run' })
                }
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!!validationError || !name.trim()}
          >
            {isEditing
              ? t('common.save', { defaultValue: 'Save' })
              : t('common.create', { defaultValue: 'Create' })
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
