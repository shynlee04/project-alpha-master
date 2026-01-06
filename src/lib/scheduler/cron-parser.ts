/**
 * Cron Expression Parser
 *
 * Parses and validates cron expressions with the following format:
 * minute hour day-of-month month day-of-week
 *
 * Special characters:
 * - Asterisk (*): Any value
 * - Comma (,): Value list separator (e.g., 1,3,5)
 * - Hyphen (-): Range (e.g., 1-5)
 * - Slash (/): Step (e.g., slash-5 = every 5)
 *
 * Example schedules:
 * - "0 * * * *" - Every hour
 * - "slash-30 * * * *" - Every 30 minutes
 * - "0 0 * * *" - Daily at midnight
 * - "0 9 * * 1-5" - Weekdays at 9 AM
 * - "0 0 1 * *" - First day of month
 * - "slash-15 9-17 * * 1-5" - Every 15 min, 9 AM-5 PM, weekdays
 */

export interface ParsedCronExpression {
  minute: CronField
  hour: CronField
  dayOfMonth: CronField
  month: CronField
  dayOfWeek: CronField
}

export interface CronField {
  type: 'any' | 'exact' | 'range' | 'step' | 'list'
  values?: number[]
  min?: number
  max?: number
  step?: number
}

export interface CronValidationResult {
  valid: boolean
  error?: string
  nextRun?: Date
}

/**
 * Parse a single cron field
 */
function parseField(field: string, min: number, max: number): CronField {
  field = field.trim()

  // Any value (*)
  if (field === '*') {
    return { type: 'any' }
  }

  // Step values (*/5 or 1-10/2)
  if (field.includes('/')) {
    const [base, stepStr] = field.split('/')
    const step = parseInt(stepStr, 10)

    if (isNaN(step) || step < 1) {
      throw new Error(`Invalid step value: ${stepStr}`)
    }

    if (base === '*') {
      return { type: 'step', min, max, step }
    }

    const baseField = parseField(base, min, max)
    if (baseField.type === 'range' && baseField.values) {
      return { type: 'step', min: baseField.values[0], max: baseField.values[1], step }
    }

    throw new Error(`Invalid base for step: ${base}`)
  }

  // Range (1-5)
  if (field.includes('-')) {
    const [startStr, endStr] = field.split('-')
    const start = parseInt(startStr, 10)
    const end = parseInt(endStr, 10)

    if (isNaN(start) || isNaN(end)) {
      throw new Error(`Invalid range: ${field}`)
    }

    if (start < min || end > max || start > end) {
      throw new Error(`Range out of bounds: ${field}`)
    }

    const values: number[] = []
    for (let i = start; i <= end; i++) {
      values.push(i)
    }

    return { type: 'range', values }
  }

  // List (1,3,5)
  if (field.includes(',')) {
    const values = field.split(',').map(v => {
      const num = parseInt(v.trim(), 10)
      if (isNaN(num)) {
        throw new Error(`Invalid value: ${v}`)
      }
      if (num < min || num > max) {
        throw new Error(`Value out of bounds: ${num}`)
      }
      return num
    })

    return { type: 'list', values: [...new Set(values)].sort((a, b) => a - b) }
  }

  // Exact value
  const value = parseInt(field, 10)
  if (isNaN(value)) {
    throw new Error(`Invalid field: ${field}`)
  }

  if (value < min || value > max) {
    throw new Error(`Value out of bounds: ${value}`)
  }

  return { type: 'exact', values: [value] }
}

/**
 * Parse a cron expression
 */
export function parseCronExpression(expression: string): ParsedCronExpression {
  const parts = expression.trim().split(/\s+/)

  if (parts.length !== 5) {
    throw new Error('Cron expression must have exactly 5 fields')
  }

  const [minuteStr, hourStr, dayOfMonthStr, monthStr, dayOfWeekStr] = parts

  return {
    minute: parseField(minuteStr, 0, 59),
    hour: parseField(hourStr, 0, 23),
    dayOfMonth: parseField(dayOfMonthStr, 1, 31),
    month: parseField(monthStr, 1, 12),
    dayOfWeek: parseField(dayOfWeekStr, 0, 6),
  }
}

/**
 * Check if a value matches a cron field
 */
function matchesField(value: number, field: CronField): boolean {
  switch (field.type) {
    case 'any':
      return true
    case 'exact':
    case 'range':
    case 'list':
      return field.values ? field.values.includes(value) : false
    case 'step':
      if (field.min !== undefined && field.max !== undefined && field.step) {
        if (value < field.min || value > field.max) {
          return false
        }
        return (value - field.min) % field.step === 0
      }
      return false
  }
}

/**
 * Get the next occurrence of a cron expression
 */
export function getNextRun(expression: string, fromDate: Date = new Date()): Date {
  const parsed = parseCronExpression(expression)
  const date = new Date(fromDate)

  // Add 1 minute to start searching from next minute
  date.setMinutes(date.getMinutes() + 1, 0, 0)

  // Search for next match (up to 4 years ahead)
  const maxIterations = 4 * 365 * 24 * 60 // 4 years in minutes
  let iterations = 0

  while (iterations < maxIterations) {
    const minute = date.getMinutes()
    const hour = date.getHours()
    const dayOfMonth = date.getDate()
    const month = date.getMonth() + 1
    const dayOfWeek = date.getDay()

    if (
      matchesField(minute, parsed.minute) &&
      matchesField(hour, parsed.hour) &&
      matchesField(dayOfMonth, parsed.dayOfMonth) &&
      matchesField(month, parsed.month) &&
      matchesField(dayOfWeek, parsed.dayOfWeek)
    ) {
      return date
    }

    // Increment by 1 minute
    date.setTime(date.getTime() + 60000)
    iterations++
  }

  throw new Error('Could not find next run time within 4 years')
}

/**
 * Validate a cron expression
 */
export function validateCronExpression(expression: string): CronValidationResult {
  try {
    const parsed = parseCronExpression(expression)
    const nextRun = getNextRun(expression)

    return {
      valid: true,
      nextRun,
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get a human-readable description of a cron expression
 */
export function describeCronExpression(expression: string): string {
  try {
    const parsed = parseCronExpression(expression)

    // Build a simplified description
    if (parsed.minute.type === 'any' && parsed.hour.type === 'any') {
      return 'Every minute'
    }

    if (parsed.minute.type === 'step' && parsed.hour.type === 'any') {
      return `Every ${parsed.minute.step} minutes`
    }

    if (parsed.minute.type === 'exact' && parsed.hour.type === 'exact') {
      const hour = parsed.hour.values?.[0] ?? 0
      const minute = parsed.minute.values?.[0] ?? 0
      return `At ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    }

    return 'Custom schedule'
  } catch {
    return 'Invalid schedule'
  }
}

/**
 * Get common preset schedules
 */
export const CronPresets: Record<string, string> = {
  everyMinute: '* * * * *',
  every5Minutes: '*/5 * * * *',
  every15Minutes: '*/15 * * * *',
  every30Minutes: '*/30 * * * *',
  everyHour: '0 * * * *',
  every2Hours: '0 */2 * * *',
  every6Hours: '0 */6 * * *',
  every12Hours: '0 */12 * * *',
  dailyAtMidnight: '0 0 * * *',
  dailyAt9am: '0 9 * * *',
  weekdaysAt9am: '0 9 * * 1-5',
  weekly: '0 0 * * 0',
  monthly: '0 0 1 * *',
  yearly: '0 0 1 1 *',
}
