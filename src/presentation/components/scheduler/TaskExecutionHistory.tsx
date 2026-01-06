/**
 * Task Execution History Dialog
 *
 * Displays execution history for a specific task with timestamps and status.
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog'
import { Button } from '@/presentation/components/ui/button'
import { useTaskScheduler } from '@/hooks/useTaskScheduler'
import type { TaskExecutionLog } from '@/lib/scheduler/task-scheduler'

interface TaskExecutionHistoryProps {
  open: boolean
  taskId: string
  onClose: () => void
}

export function TaskExecutionHistory({ open, taskId, onClose }: TaskExecutionHistoryProps) {
  const { t } = useTranslation()
  const { getExecutionLogs } = useTaskScheduler()

  const [logs, setLogs] = useState<TaskExecutionLog[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && taskId) {
      loadLogs()
    }
  }, [open, taskId])

  const loadLogs = async () => {
    setIsLoading(true)
    try {
      const executionLogs = await getExecutionLogs(taskId, 100)
      setLogs(executionLogs)
    } catch (error) {
      console.error('Failed to load execution logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date)
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return '-'

    if (ms < 1000) {
      return `${ms}ms`
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`
    } else {
      return `${(ms / 60000).toFixed(1)}m`
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="lg" className="max-h-[calc(100dvh-4rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t('scheduler.executionHistory', { defaultValue: 'Execution History' })}
          </DialogTitle>
          <DialogDescription>
            {t('scheduler.executionHistoryDescription', { defaultValue: 'Recent executions of this task' })}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--muted-foreground)]" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="text-[var(--muted-foreground)]">
              {t('scheduler.noExecutionHistory', { defaultValue: 'No execution history yet' })}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-[var(--muted-foreground)] px-2 py-1 border-b border-[var(--border)]">
              <div>{t('scheduler.timestamp', { defaultValue: 'Timestamp' })}</div>
              <div>{t('scheduler.status', { defaultValue: 'Status' })}</div>
              <div>{t('scheduler.duration', { defaultValue: 'Duration' })}</div>
              <div>{t('scheduler.error', { defaultValue: 'Error' })}</div>
            </div>

            {logs.map((log) => (
              <div
                key={log.id}
                className="grid grid-cols-4 gap-2 px-2 py-2 text-sm border border-[var(--border)] rounded-[4px] bg-[var(--card)] hover:bg-[var(--muted)] transition-colors"
              >
                <div className="font-mono text-xs text-[var(--muted-foreground)]">
                  {formatDateTime(log.timestamp)}
                </div>
                <div className="flex items-center gap-2">
                  {log.status === 'running' && (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      <span className="text-blue-500">
                        {t('scheduler.status.running', { defaultValue: 'Running' })}
                      </span>
                    </>
                  )}
                  {log.status === 'success' && (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-500">
                        {t('scheduler.status.success', { defaultValue: 'Success' })}
                      </span>
                    </>
                  )}
                  {log.status === 'failure' && (
                    <>
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-red-500">
                        {t('scheduler.status.failure', { defaultValue: 'Failed' })}
                      </span>
                    </>
                  )}
                </div>
                <div className="font-mono text-xs">
                  {formatDuration(log.duration)}
                </div>
                <div className="text-xs text-red-500 truncate" title={log.error}>
                  {log.error || '-'}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button variant="secondary" onClick={onClose}>
            {t('common.close', { defaultValue: 'Close' })}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
