/**
 * React hook for task scheduler
 *
 * Provides easy access to scheduler functionality from React components.
 */

import { useState, useEffect, useCallback } from 'react'
import type {
  ScheduledTask,
  TaskExecutionLog,
  TaskScheduler as TaskSchedulerType,
} from '@/lib/scheduler/task-scheduler'
import { getTaskScheduler } from '@/lib/scheduler/task-scheduler'

export interface UseTaskSchedulerReturn {
  tasks: ScheduledTask[]
  isLoading: boolean
  isRunning: boolean
  addTask: (task: Omit<ScheduledTask, 'runCount' | 'failureCount' | 'createdAt' | 'updatedAt' | 'nextRun'>) => Promise<void>
  updateTask: (taskId: string, updates: Partial<ScheduledTask>) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  executeTask: (taskId: string) => Promise<void>
  toggleTask: (taskId: string) => Promise<void>
  getExecutionLogs: (taskId: string, limit?: number) => Promise<TaskExecutionLog[]>
  refreshTasks: () => void
}

/**
 * Hook for task scheduler
 */
export function useTaskScheduler(): UseTaskSchedulerReturn {
  const [tasks, setTasks] = useState<ScheduledTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [scheduler, setScheduler] = useState<TaskSchedulerType | null>(null)

  // Initialize scheduler
  useEffect(() => {
    const instance = getTaskScheduler()
    setScheduler(instance)
    setIsRunning(true)

    // Initialize built-in tasks
    instance.initBuiltInTasks().then(() => {
      setTasks(instance.getTasks())
      setIsLoading(false)
    })

    // Start scheduler
    instance.start()

    // Cleanup
    return () => {
      instance.stop()
    }
  }, [])

  // Listen to scheduler events
  useEffect(() => {
    if (!scheduler) return

    const handleTaskAdded = (event: Event) => {
      const customEvent = event as CustomEvent<{ taskId: string }>
      const taskId = customEvent.detail.taskId
      const task = scheduler.getTask(taskId)

      if (task) {
        setTasks(prev => [...prev, task])
      }
    }

    const handleTaskUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ taskId: string }>
      const taskId = customEvent.detail.taskId
      const task = scheduler.getTask(taskId)

      if (task) {
        setTasks(prev => prev.map(t => t.id === taskId ? task : t))
      }
    }

    const handleTaskDeleted = (event: Event) => {
      const customEvent = event as CustomEvent<{ taskId: string }>
      const taskId = customEvent.detail.taskId

      setTasks(prev => prev.filter(t => t.id !== taskId))
    }

    const handleTaskStarted = (event: Event) => {
      const customEvent = event as CustomEvent<{ taskId: string; timestamp: Date }>
      const taskId = customEvent.detail.taskId

      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return { ...t, lastRun: customEvent.detail.timestamp }
        }
        return t
      }))
    }

    const handleTaskCompleted = (event: Event) => {
      const customEvent = event as CustomEvent<{ taskId: string; duration: number; timestamp: Date }>
      const taskId = customEvent.detail.taskId

      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            lastRun: customEvent.detail.timestamp,
            runCount: t.runCount + 1,
            lastError: undefined,
          }
        }
        return t
      }))
    }

    const handleTaskFailed = (event: Event) => {
      const customEvent = event as CustomEvent<{ taskId: string; error: string; timestamp: Date }>
      const taskId = customEvent.detail.taskId

      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            lastRun: customEvent.detail.timestamp,
            failureCount: t.failureCount + 1,
            lastError: customEvent.detail.error,
          }
        }
        return t
      }))
    }

    window.addEventListener('scheduler:task-added', handleTaskAdded)
    window.addEventListener('scheduler:task-updated', handleTaskUpdated)
    window.addEventListener('scheduler:task-deleted', handleTaskDeleted)
    window.addEventListener('scheduler:task-started', handleTaskStarted)
    window.addEventListener('scheduler:task-completed', handleTaskCompleted)
    window.addEventListener('scheduler:task-failed', handleTaskFailed)

    return () => {
      window.removeEventListener('scheduler:task-added', handleTaskAdded)
      window.removeEventListener('scheduler:task-updated', handleTaskUpdated)
      window.removeEventListener('scheduler:task-deleted', handleTaskDeleted)
      window.removeEventListener('scheduler:task-started', handleTaskStarted)
      window.removeEventListener('scheduler:task-completed', handleTaskCompleted)
      window.removeEventListener('scheduler:task-failed', handleTaskFailed)
    }
  }, [scheduler])

  const addTask = useCallback(async (task: Omit<ScheduledTask, 'runCount' | 'failureCount' | 'createdAt' | 'updatedAt' | 'nextRun'>) => {
    if (!scheduler) throw new Error('Scheduler not initialized')

    await scheduler.addTask(task)
    setTasks(scheduler.getTasks())
  }, [scheduler])

  const updateTask = useCallback(async (taskId: string, updates: Partial<ScheduledTask>) => {
    if (!scheduler) throw new Error('Scheduler not initialized')

    await scheduler.updateTask(taskId, updates)
    setTasks(scheduler.getTasks())
  }, [scheduler])

  const deleteTask = useCallback(async (taskId: string) => {
    if (!scheduler) throw new Error('Scheduler not initialized')

    await scheduler.deleteTask(taskId)
    setTasks(scheduler.getTasks())
  }, [scheduler])

  const executeTask = useCallback(async (taskId: string) => {
    if (!scheduler) throw new Error('Scheduler not initialized')

    await scheduler.executeTask(taskId)
    setTasks(scheduler.getTasks())
  }, [scheduler])

  const toggleTask = useCallback(async (taskId: string) => {
    if (!scheduler) throw new Error('Scheduler not initialized')

    const task = scheduler.getTask(taskId)
    if (!task) throw new Error('Task not found')

    await scheduler.setTaskEnabled(taskId, !task.enabled)
    setTasks(scheduler.getTasks())
  }, [scheduler])

  const getExecutionLogs = useCallback(async (taskId: string, limit?: number) => {
    if (!scheduler) throw new Error('Scheduler not initialized')

    return await scheduler.getExecutionLogs(taskId, limit)
  }, [scheduler])

  const refreshTasks = useCallback(() => {
    if (!scheduler) return

    setTasks(scheduler.getTasks())
  }, [scheduler])

  return {
    tasks,
    isLoading,
    isRunning,
    addTask,
    updateTask,
    deleteTask,
    executeTask,
    toggleTask,
    getExecutionLogs,
    refreshTasks,
  }
}
