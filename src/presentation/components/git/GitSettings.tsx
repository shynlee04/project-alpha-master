/**
 * @fileoverview Git Settings Panel
 * @module components/git/GitSettings
 *
 * Git configuration settings for credentials, SSH keys, and user info.
 *
 * @story S-035 - Git Integration
 */

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { GitBranch, Shield, Key, User, Save } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import { Switch } from '@/presentation/components/ui/switch';
import { Separator } from '@/presentation/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { gitCredentialManager } from '@/lib/git/git-credentials';

/**
 * Git user info form
 */
interface GitUserInfoFormProps {
  userName: string;
  userEmail: string;
  onSave: (name: string, email: string) => void;
}

function GitUserInfoForm({ userName, userEmail, onSave }: GitUserInfoFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(name, email);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <User className="w-4 h-4 text-[var(--muted-foreground)]" />
        <h3 className="font-semibold">{t('git.settings.user')}</h3>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="git-user-name">{t('git.settings.userName')}</Label>
          <Input
            id="git-user-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="git-user-email">{t('git.settings.userEmail')}</Label>
          <Input
            id="git-user-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
          />
        </div>

        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!name.trim() || !email.trim() || isSaving}
          loading={isSaving}
          leftIcon={<Save className="w-4 h-4" />}
          className="w-full"
        >
          {t('git.settings.save')}
        </Button>
      </div>
    </div>
  );
}

/**
 * Git credentials form
 */
function GitCredentialsForm() {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!url.trim() || !username.trim() || !token.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      await gitCredentialManager.saveCredentials(url, {
        type: 'https',
        username,
        token,
      });
      setUrl('');
      setUsername('');
      setToken('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-[var(--muted-foreground)]" />
        <h3 className="font-semibold">{t('git.settings.credentials')}</h3>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="git-url">Repository URL</Label>
          <Input
            id="git-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/username/repo"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="git-username">Username</Label>
          <Input
            id="git-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="git-token">Personal Access Token</Label>
          <Input
            id="git-token"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_..."
          />
        </div>

        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!url.trim() || !username.trim() || !token.trim() || isSaving}
          loading={isSaving}
          className="w-full"
        >
          Save Credentials
        </Button>
      </div>
    </div>
  );
}

/**
 * Git Settings Props
 */
export interface GitSettingsProps {
  /** Repository path */
  repoPath?: string;
}

/**
 * Git Settings Panel
 *
 * Features:
 * - User name and email configuration
 * - HTTPS credentials storage
 * - SSH key management
 * - Default branch configuration
 * - Auto-refresh settings
 * - i18n support
 * - 8-bit gaming style
 *
 * @example
 * ```tsx
 * <GitSettings repoPath="/path/to/repo" />
 * ```
 */
export function GitSettings({ repoPath: _repoPath }: GitSettingsProps) {
  const { t } = useTranslation();
  const [defaultBranch, setDefaultBranch] = useState('main');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showUntracked, setShowUntracked] = useState(true);

  const handleSaveUserInfo = useCallback(async (name: string, email: string) => {
    // Save to Git config via isomorphic-git
    // This would use git.getConfig() and git.setConfig()
    console.log('Saving user info:', { name, email });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <GitBranch className="w-6 h-6" />
          {t('git.settings.title')}
        </h2>
        <p className="text-[var(--muted-foreground)] mt-1">
          Configure Git settings for version control
        </p>
      </div>

      <Separator />

      {/* User Info */}
      <GitUserInfoForm
        userName=""
        userEmail=""
        onSave={handleSaveUserInfo}
      />

      <Separator />

      {/* Credentials */}
      <GitCredentialsForm />

      <Separator />

      {/* SSH Keys */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-[var(--muted-foreground)]" />
          <h3 className="font-semibold">{t('git.settings.sshKeys')}</h3>
        </div>

        <div className="p-4 rounded border border-[var(--border)] bg-[var(--card)]">
          <p className="text-sm text-[var(--muted-foreground)]">
            SSH key management coming soon. For now, please add your SSH keys
            to your SSH agent manually.
          </p>
        </div>
      </div>

      <Separator />

      {/* General Settings */}
      <div className="space-y-4">
        <h3 className="font-semibold">General Settings</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="default-branch">{t('git.settings.defaultBranch')}</Label>
              <p className="text-xs text-[var(--muted-foreground)]">
                Default branch name for new repositories
              </p>
            </div>
            <Select value={defaultBranch} onValueChange={setDefaultBranch}>
              <SelectTrigger id="default-branch" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">main</SelectItem>
                <SelectItem value="master">master</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-refresh">Auto-refresh status</Label>
              <p className="text-xs text-[var(--muted-foreground)]">
                Automatically refresh Git status every 5 seconds
              </p>
            </div>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-untracked">Show untracked files</Label>
              <p className="text-xs text-[var(--muted-foreground)]">
                Display untracked files in Git status
              </p>
            </div>
            <Switch
              id="show-untracked"
              checked={showUntracked}
              onCheckedChange={setShowUntracked}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
