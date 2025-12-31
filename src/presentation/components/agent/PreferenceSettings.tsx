/**
 * @fileoverview Preference Settings Component
 * @module components/agent/PreferenceSettings
 * @governance EPIC-31-2
 *
 * UI for viewing and managing learned user preferences.
 *
 * Story 31.2: User Preference Learning & Personalization
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, RotateCcw, Download, Upload, Brain } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import {
  getUserProfile,
  setPreference,
  resetLearnedPreferences,
  resetAllPreferences,
  exportPreferences,
  importPreferences,
  markAsManualOverride,
  type UserProfile,
} from '@/lib/agent/preferences/user-profile';

interface PreferenceSettingsProps {
  /**
   * Callback when preferences change
   */
  onPreferencesChange?: (profile: UserProfile) => void;

  /**
   * User ID (default: 'default-user')
   */
  userId?: string;
}

export function PreferenceSettings({
  onPreferencesChange,
  userId = 'default-user',
}: PreferenceSettingsProps) {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, [userId]);

  const loadPreferences = async () => {
    setIsLoading(true);
    try {
      const userPrefs = await getUserProfile(userId);
      setProfile(userPrefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePreference = async (key: keyof UserProfile, value: any) => {
    if (!profile) return;

    setIsSaving(true);
    try {
      await setPreference(key, value, false, userId);
      await markAsManualOverride(key, userId);

      const updated = await getUserProfile(userId);
      setProfile(updated);
      onPreferencesChange?.(updated);
    } catch (error) {
      console.error('Failed to update preference:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetLearned = async () => {
    setIsSaving(true);
    try {
      await resetLearnedPreferences(userId);
      const updated = await getUserProfile(userId);
      setProfile(updated);
      onPreferencesChange?.(updated);
      setShowConfirmReset(false);
    } catch (error) {
      console.error('Failed to reset preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetAll = async () => {
    if (!confirm(t('preferences.resetAllConfirm', 'Are you sure you want to reset all preferences?'))) {
      return;
    }

    setIsSaving(true);
    try {
      await resetAllPreferences(userId);
      const updated = await getUserProfile(userId);
      setProfile(updated);
      onPreferencesChange?.(updated);
    } catch (error) {
      console.error('Failed to reset all preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const json = await exportPreferences(userId);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-preferences-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export preferences:', error);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const success = await importPreferences(text, userId);

        if (success) {
          const updated = await getUserProfile(userId);
          setProfile(updated);
          onPreferencesChange?.(updated);
        } else {
          alert(t('preferences.importFailed', 'Failed to import preferences'));
        }
      } catch (error) {
        console.error('Failed to import preferences:', error);
        alert(t('preferences.importFailed', 'Failed to import preferences'));
      }
    };

    input.click();
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent mb-3" />
        <p className="text-sm text-muted-foreground">
          {t('preferences.loading', 'Loading preferences...')}
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          {t('preferences.noData', 'No preferences data found')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t('preferences.title', 'Agent Preferences')}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {t('preferences.subtitle', 'Manage your AI agent preferences and learned behaviors')}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isSaving}
          >
            <Download className="w-4 h-4 mr-2" />
            {t('preferences.export', 'Export')}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
            disabled={isSaving}
          >
            <Upload className="w-4 h-4 mr-2" />
            {t('preferences.import', 'Import')}
          </Button>
        </div>
      </div>

      {/* Learned preferences indicator */}
      {profile.learned && (
        <div className="p-3 bg-success/10 border border-success/30 rounded-lg flex items-start gap-3">
          <Brain className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-success">
              {t('preferences.learnedEnabled', 'AI Learning Active')}
            </p>
            <p className="text-xs text-secondary-foreground mt-1">
              {t('preferences.learnedDesc', 'The agent has learned from your interactions. You can override any preference below.')}
            </p>
          </div>
        </div>
      )}

      {/* Language preference */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-secondary-foreground">
          {t('preferences.language.label', 'Language')}
        </label>

        <div className="flex gap-2">
          {[
            { value: 'auto', label: t('preferences.language.auto', 'Auto-detect') },
            { value: 'en', label: t('preferences.language.english', 'English') },
            { value: 'vi', label: t('preferences.language.vietnamese', 'Vietnamese') },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleUpdatePreference('language', option.value)}
              disabled={isSaving}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${profile.language === option.value
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted-hover'}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>

        {profile.manualOverrides.includes('language') && (
          <p className="text-xs text-muted-foreground">
            {t('preferences.manualOverride', 'Manually set')}
          </p>
        )}
      </div>

      {/* Detail level preference */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-secondary-foreground">
          {t('preferences.detailLevel.label', 'Response Detail Level')}
        </label>

        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'concise', label: t('preferences.detailLevel.concise', 'Concise') },
            { value: 'normal', label: t('preferences.detailLevel.normal', 'Normal') },
            { value: 'detailed', label: t('preferences.detailLevel.detailed', 'Detailed') },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleUpdatePreference('detailLevel', option.value)}
              disabled={isSaving}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${profile.detailLevel === option.value
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted-hover'}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>

        {profile.manualOverrides.includes('detailLevel') && (
          <p className="text-xs text-muted-foreground">
            {t('preferences.manualOverride', 'Manually set')}
          </p>
        )}
      </div>

      {/* Citation style preference */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-secondary-foreground">
          {t('preferences.citationStyle.label', 'Citation Style')}
        </label>

        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'inline', label: t('preferences.citationStyle.inline', 'Inline') },
            { value: 'footnote', label: t('preferences.citationStyle.footnote', 'Footnote') },
            { value: 'none', label: t('preferences.citationStyle.none', 'None') },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleUpdatePreference('citationStyle', option.value)}
              disabled={isSaving}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${profile.citationStyle === option.value
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted-hover'}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>

        {profile.manualOverrides.includes('citationStyle') && (
          <p className="text-xs text-muted-foreground">
            {t('preferences.manualOverride', 'Manually set')}
          </p>
        )}
      </div>

      {/* Response style preference */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-secondary-foreground">
          {t('preferences.responseStyle.label', 'Response Style')}
        </label>

        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'formal', label: t('preferences.responseStyle.formal', 'Formal') },
            { value: 'casual', label: t('preferences.responseStyle.casual', 'Casual') },
            { value: 'technical', label: t('preferences.responseStyle.technical', 'Technical') },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleUpdatePreference('responseStyle', option.value)}
              disabled={isSaving}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${profile.responseStyle === option.value
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted-hover'}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>

        {profile.manualOverrides.includes('responseStyle') && (
          <p className="text-xs text-muted-foreground">
            {t('preferences.manualOverride', 'Manually set')}
          </p>
        )}
      </div>

      {/* Reset actions */}
      <div className="pt-4 border-t border-border space-y-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConfirmReset(!showConfirmReset)}
          disabled={isSaving}
          className="w-full"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          {t('preferences.resetLearned', 'Reset Learned Preferences')}
        </Button>

        {showConfirmReset && (
          <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg space-y-2">
            <p className="text-sm text-warning">
              {t('preferences.resetLearnedConfirm', 'This will clear all auto-learned preferences. Manual settings will be kept. Continue?')}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmReset(false)}
                disabled={isSaving}
              >
                {t('common.cancel', 'Cancel')}
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleResetLearned}
                disabled={isSaving}
              >
                {t('common.confirm', 'Confirm')}
              </Button>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleResetAll}
          disabled={isSaving}
          className="w-full text-muted-foreground hover:text-destructive"
        >
          {t('preferences.resetAll', 'Reset All Preferences to Defaults')}
        </Button>
      </div>

      {/* Last updated */}
      <p className="text-xs text-muted-foreground text-center">
        {t('preferences.lastUpdated', 'Last updated: {{date}}', {
          date: new Date(profile.updatedAt).toLocaleString(),
        })}
      </p>
    </div>
  );
}
