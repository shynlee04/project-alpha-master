/**
 * Schedule Preset Selector
 *
 * Dropdown component for selecting common cron schedule presets.
 */

import { useTranslation } from 'react-i18next'
import { CronPresets } from '@/lib/scheduler/cron-parser'

interface SchedulePresetSelectorProps {
  value: string
  onChange: (preset: string) => void
}

export function SchedulePresetSelector({ value, onChange }: SchedulePresetSelectorProps) {
  const { t } = useTranslation()

  return (
    <div>
      <label htmlFor="schedule-preset" className="block text-sm font-medium text-[var(--foreground)] mb-1">
        {t('scheduler.schedulePreset', { defaultValue: 'Schedule Preset' })}
      </label>
      <select
        id="schedule-preset"
        className="w-full px-3 py-2 border border-[var(--border)] rounded-[4px] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
  )
}
