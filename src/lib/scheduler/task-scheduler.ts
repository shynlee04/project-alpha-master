/**
 * Task Scheduler Engine
 *
 * Manages scheduled task execution with cron expressions.
 * Features:
 * - Cron-based scheduling
 * - Background execution via Web Workers
 * - IndexedDB persistence
 * - Battery awareness
 * - Idle detection
 * - Execution history
 * - Error handling with retry logic
 */

import { getNextRun, validateCronExpression } from './cron-parser'
import { BuiltInTasks, getTaskDefinition } from './built-in-tasks'

export interface ScheduledTask {
  id: string
  name: string
  description: string
  cronExpression: string
  enabled: boolean
  lastRun?: Date
  nextRun?: Date
  runCount: number
  failureCount: number
  lastError?: string
  category: 'maintenance' | 'backup' | 'sync' | 'automation' | 'custom'
  createdAt: Date
  updatedAt: Date
}

export interface TaskExecutionLog {
  id: string
  taskId: string
  timestamp: Date
  status: 'success' | 'failure' | 'running'
  duration?: number
  error?: string
}

export interface SchedulerConfig {
  checkInterval: number // milliseconds
  maxRetries: number
  retryDelay: number // milliseconds
  batteryAware: boolean
  idleDetection: boolean
  idleThreshold: number // seconds of inactivity
}

const DEFAULT_CONFIG: SchedulerConfig = {
  checkInterval: 60000, // Check every minute
  maxRetries: 3,
  retryDelay: 300000, // 5 minutes
  batteryAware: true,
  idleDetection: true,
  idleThreshold: 300, // 5 minutes
}

class TaskScheduler {
  private tasks: Map<string, ScheduledTask> = new Map()
  private executionLogs: TaskExecutionLog[] = []
  private config: SchedulerConfig
  private intervalId: number | null = null
  private worker: Worker | null = null
  private batteryLevel: number = 100
  private isIdle: boolean = false
  private lastActivityTime: number = Date.now()
  private db: IDBDatabase | null = null

  constructor(config: Partial<SchedulerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.init()
  }

  private async init(): Promise<void> {
    await this.initDatabase()
    await this.loadTasks()
    this.setupEventListeners()
    this.initWorker()
  }

  /**
   * Initialize IndexedDB for persistence
   */
  private async initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('TaskSchedulerDB', 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Tasks store
        if (!db.objectStoreNames.contains('tasks')) {
          const tasksStore = db.createObjectStore('tasks', { keyPath: 'id' })
          tasksStore.createIndex('enabled', 'enabled', { unique: false })
          tasksStore.createIndex('category', 'category', { unique: false })
        }

        // Execution logs store
        if (!db.objectStoreNames.contains('logs')) {
          const logsStore = db.createObjectStore('logs', { keyPath: 'id' })
          logsStore.createIndex('taskId', 'taskId', { unique: false })
          logsStore.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  /**
   * Load tasks from IndexedDB
   */
  private async loadTasks(): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasks'], 'readonly')
      const store = transaction.objectStore('tasks')
      const request = store.getAll()

      request.onsuccess = () => {
        const tasks = request.result as ScheduledTask[]
        tasks.forEach(task => {
          this.tasks.set(task.id, {
            ...task,
            lastRun: task.lastRun ? new Date(task.lastRun) : undefined,
            nextRun: task.nextRun ? new Date(task.nextRun) : undefined,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
          })
        })
        resolve()
      }

      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Save task to IndexedDB
   */
  private async saveTask(task: ScheduledTask): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasks'], 'readwrite')
      const store = transaction.objectStore('tasks')
      const request = store.put(task)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Setup event listeners for battery and idle detection
   */
  private setupEventListeners(): void {
    // Battery API
    if (this.config.batteryAware && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        this.batteryLevel = battery.level * 100

        battery.addEventListener('levelchange', () => {
          this.batteryLevel = battery.level * 100
        })
      })
    }

    // Idle detection
    if (this.config.idleDetection) {
      const events = ['mousedown', 'keydown', 'scroll', 'touchstart']

      const resetIdleTimer = () => {
        this.lastActivityTime = Date.now()
        this.isIdle = false
      }

      events.forEach(event => {
        window.addEventListener(event, resetIdleTimer)
      })

      // Check idle state every minute
      setInterval(() => {
        const inactiveTime = (Date.now() - this.lastActivityTime) / 1000
        this.isIdle = inactiveTime >= this.idleThreshold
      }, 60000)
    }
  }

  /**
   * Initialize Web Worker for background execution
   */
  private initWorker(): void {
    if (typeof Worker !== 'undefined') {
      const workerCode = `
        self.onmessage = (event) => {
          const { taskId, handlerCode } = event.data

          try {
            // Execute handler in worker context
            const handler = new Function(handlerCode)
            handler()
            self.postMessage({ taskId, status: 'success' })
          } catch (error) {
            self.postMessage({ taskId, status: 'error', error: error.message })
          }
        }
      `

      const blob = new Blob([workerCode], { type: 'application/javascript' })
      const url = URL.createObjectURL(blob)

      this.worker = new Worker(url)

      this.worker.onmessage = (event) => {
        const { taskId, status, error } = event.data
        this.handleTaskComplete(taskId, status === 'success' ? undefined : error)
      }

      this.worker.onerror = (error) => {
        console.error('[Scheduler] Worker error:', error)
      }
    }
  }

  /**
   * Start the scheduler
   */
  public start(): void {
    if (this.intervalId !== null) return

    this.intervalId = window.setInterval(() => {
      this.checkAndExecuteTasks()
    }, this.config.checkInterval)

    console.log('[Scheduler] Started')
  }

  /**
   * Stop the scheduler
   */
  public stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }

    console.log('[Scheduler] Stopped')
  }

  /**
   * Check and execute due tasks
   */
  private async checkAndExecuteTasks(): Promise<void> {
    const now = new Date()

    for (const [id, task] of this.tasks.entries()) {
      if (!task.enabled) continue

      // Check battery level
      if (this.config.batteryAware && this.batteryLevel < 20) {
        console.log('[Scheduler] Low battery, skipping task:', id)
        continue
      }

      // Check if task is due
      if (task.nextRun && task.nextRun <= now) {
        await this.executeTask(id)
      }
    }
  }

  /**
   * Execute a task
   */
  public async executeTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId)
    if (!task) {
      console.error('[Scheduler] Task not found:', taskId)
      return
    }

    console.log('[Scheduler] Executing task:', taskId)

    // Log execution start
    const log: TaskExecutionLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      taskId,
      timestamp: new Date(),
      status: 'running',
    }

    this.executionLogs.push(log)
    await this.saveLog(log)

    // Emit event for UI
    window.dispatchEvent(new CustomEvent('scheduler:task-started', {
      detail: { taskId, timestamp: log.timestamp }
    }))

    const startTime = Date.now()

    try {
      // Get task handler
      const definition = getTaskDefinition(taskId)

      if (definition?.handler) {
        await definition.handler()
      } else {
        // Custom task - emit event for app to handle
        window.dispatchEvent(new CustomEvent('scheduler:task-execute', {
          detail: { taskId }
        }))
      }

      const duration = Date.now() - startTime

      // Update task
      task.lastRun = new Date()
      task.runCount++
      task.nextRun = getNextRun(task.cronExpression, task.lastRun)
      task.updatedAt = new Date()

      await this.saveTask(task)

      // Log success
      log.status = 'success'
      log.duration = duration
      await this.saveLog(log)

      // Emit success event
      window.dispatchEvent(new CustomEvent('scheduler:task-completed', {
        detail: { taskId, duration, timestamp: log.timestamp }
      }))
    } catch (error) {
      const duration = Date.now() - startTime

      // Update task
      task.failureCount++
      task.lastError = error instanceof Error ? error.message : 'Unknown error'
      task.updatedAt = new Date()

      await this.saveTask(task)

      // Log failure
      log.status = 'failure'
      log.duration = duration
      log.error = task.lastError
      await this.saveLog(log)

      // Emit failure event
      window.dispatchEvent(new CustomEvent('scheduler:task-failed', {
        detail: { taskId, error: task.lastError, timestamp: log.timestamp }
      }))

      // Retry logic
      if (task.failureCount <= this.config.maxRetries) {
        setTimeout(() => {
          this.executeTask(taskId)
        }, this.config.retryDelay)
      }
    }
  }

  /**
   * Handle task completion from worker
   */
  private handleTaskComplete(taskId: string, error?: string): void {
    console.log('[Scheduler] Task completed:', taskId, error ? 'FAILED' : 'SUCCESS')
  }

  /**
   * Save execution log
   */
  private async saveLog(log: TaskExecutionLog): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['logs'], 'readwrite')
      const store = transaction.objectStore('logs')
      const request = store.add(log)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Add a new task
   */
  public async addTask(task: Omit<ScheduledTask, 'runCount' | 'failureCount' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const validation = validateCronExpression(task.cronExpression)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    const newTask: ScheduledTask = {
      ...task,
      runCount: 0,
      failureCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      nextRun: validation.nextRun,
    }

    this.tasks.set(newTask.id, newTask)
    await this.saveTask(newTask)

    window.dispatchEvent(new CustomEvent('scheduler:task-added', {
      detail: { taskId: newTask.id }
    }))
  }

  /**
   * Update an existing task
   */
  public async updateTask(taskId: string, updates: Partial<ScheduledTask>): Promise<void> {
    const task = this.tasks.get(taskId)
    if (!task) {
      throw new Error('Task not found')
    }

    if (updates.cronExpression) {
      const validation = validateCronExpression(updates.cronExpression)
      if (!validation.valid) {
        throw new Error(validation.error)
      }
      updates.nextRun = validation.nextRun
    }

    const updatedTask: ScheduledTask = {
      ...task,
      ...updates,
      updatedAt: new Date(),
    }

    this.tasks.set(taskId, updatedTask)
    await this.saveTask(updatedTask)

    window.dispatchEvent(new CustomEvent('scheduler:task-updated', {
      detail: { taskId }
    }))
  }

  /**
   * Delete a task
   */
  public async deleteTask(taskId: string): Promise<void> {
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tasks'], 'readwrite')
      const store = transaction.objectStore('tasks')
      const request = store.delete(taskId)

      request.onsuccess = () => {
        this.tasks.delete(taskId)

        window.dispatchEvent(new CustomEvent('scheduler:task-deleted', {
          detail: { taskId }
        }))

        resolve()
      }
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Get all tasks
   */
  public getTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values())
  }

  /**
   * Get a single task
   */
  public getTask(taskId: string): ScheduledTask | undefined {
    return this.tasks.get(taskId)
  }

  /**
   * Enable/disable a task
   */
  public async setTaskEnabled(taskId: string, enabled: boolean): Promise<void> {
    await this.updateTask(taskId, { enabled })
  }

  /**
   * Get execution logs for a task
   */
  public async getExecutionLogs(taskId: string, limit: number = 50): Promise<TaskExecutionLog[]> {
    if (!this.db) return []

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['logs'], 'readonly')
      const store = transaction.objectStore('logs')
      const index = store.index('taskId')
      const request = index.getAll(IDBKeyRange.only(taskId))

      request.onsuccess = () => {
        const logs = request.result as TaskExecutionLog[]
        logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        resolve(logs.slice(0, limit))
      }
      request.onerror = () => reject(request.error)
    })
  }

  /**
   * Initialize built-in tasks
   */
  public async initBuiltInTasks(): Promise<void> {
    for (const definition of BuiltInTasks) {
      const existing = this.tasks.get(definition.id)

      if (!existing) {
        await this.addTask({
          id: definition.id,
          name: definition.name,
          description: definition.description,
          cronExpression: definition.defaultSchedule,
          enabled: definition.defaultEnabled,
          category: definition.category,
        })
      }
    }
  }

  /**
   * Cleanup old logs
   */
  public async cleanupOldLogs(olderThanDays: number = 30): Promise<void> {
    if (!this.db) return

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['logs'], 'readwrite')
      const store = transaction.objectStore('logs')
      const index = store.index('timestamp')
      const request = index.openCursor(IDBKeyRange.upperBound(cutoffDate))

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        } else {
          resolve()
        }
      }

      request.onerror = () => reject(request.error)
    })
  }
}

// Singleton instance
let schedulerInstance: TaskScheduler | null = null

/**
 * Get the scheduler instance
 */
export function getTaskScheduler(config?: Partial<SchedulerConfig>): TaskScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new TaskScheduler(config)
  }

  return schedulerInstance
}

export type { TaskScheduler }
