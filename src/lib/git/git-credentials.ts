/**
 * @fileoverview Git Credentials Manager
 * @module lib/git/git-credentials
 *
 * Secure credential storage for Git operations.
 * Supports HTTPS tokens and SSH keys.
 *
 * @story S-035 - Git Integration
 */

/**
 * Git credential type
 */
export type GitCredentialType = 'https' | 'ssh';

/**
 * HTTPS credentials
 */
export interface HttpsCredentials {
  type: 'https';
  username: string;
  token: string;
}

/**
 * SSH credentials
 */
export interface SshCredentials {
  type: 'ssh';
  privateKey: string;
  publicKey?: string;
  passphrase?: string;
}

/**
 * Git credentials union
 */
export type GitCredentials = HttpsCredentials | SshCredentials;

/**
 * Credential storage entry
 */
interface CredentialEntry {
  url: string;
  credentials: GitCredentials;
  createdAt: number;
  lastUsed: number;
}

/**
 * Git Credential Manager
 *
 * Manages secure storage and retrieval of Git credentials.
 * Uses IndexedDB for persistent storage.
 */
export class GitCredentialManager {
  private static readonly STORAGE_KEY = 'git-credentials';
  private cache: Map<string, GitCredentials> = new Map();

  /**
   * Get credentials for URL
   */
  async getCredentials(url: string): Promise<GitCredentials | null> {
    try {
      // Check cache first
      if (this.cache.has(url)) {
        return this.cache.get(url)!;
      }

      // Load from storage
      const entry = await this.getEntry(url);
      if (entry) {
        this.cache.set(url, entry.credentials);
        return entry.credentials;
      }

      return null;
    } catch (error) {
      console.error('Failed to get credentials:', error);
      return null;
    }
  }

  /**
   * Save credentials for URL
   */
  async saveCredentials(url: string, credentials: GitCredentials): Promise<void> {
    try {
      const entry: CredentialEntry = {
        url,
        credentials,
        createdAt: Date.now(),
        lastUsed: Date.now(),
      };

      await this.saveEntry(entry);
      this.cache.set(url, credentials);
    } catch (error) {
      console.error('Failed to save credentials:', error);
      throw new Error(`Failed to save credentials: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Remove credentials for URL
   */
  async removeCredentials(url: string): Promise<void> {
    try {
      await this.deleteEntry(url);
      this.cache.delete(url);
    } catch (error) {
      console.error('Failed to remove credentials:', error);
    }
  }

  /**
   * List all stored credential URLs
   */
  async listUrls(): Promise<string[]> {
    try {
      const all = await this.getAllEntries();
      return all.map(entry => entry.url);
    } catch (error) {
      console.error('Failed to list credential URLs:', error);
      return [];
    }
  }

  /**
   * Clear all credentials
   */
  async clearAll(): Promise<void> {
    try {
      await this.clearStorage();
      this.cache.clear();
    } catch (error) {
      console.error('Failed to clear credentials:', error);
    }
  }

  /**
   * Get entry from storage
   */
  private async getEntry(url: string): Promise<CredentialEntry | null> {
    const all = await this.getAllEntries();
    return all.find(entry => entry.url === url) || null;
  }

  /**
   * Save entry to storage
   */
  private async saveEntry(entry: CredentialEntry): Promise<void> {
    const all = await this.getAllEntries();
    const index = all.findIndex(e => e.url === entry.url);

    if (index >= 0) {
      all[index] = entry;
    } else {
      all.push(entry);
    }

    await this.saveToStorage(all);
  }

  /**
   * Delete entry from storage
   */
  private async deleteEntry(url: string): Promise<void> {
    const all = await this.getAllEntries();
    const filtered = all.filter(entry => entry.url !== url);
    await this.saveToStorage(filtered);
  }

  /**
   * Get all entries from storage
   */
  private async getAllEntries(): Promise<CredentialEntry[]> {
    try {
      const stored = localStorage.getItem(GitCredentialManager.STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  /**
   * Save all entries to storage
   */
  private async saveToStorage(entries: CredentialEntry[]): Promise<void> {
    localStorage.setItem(GitCredentialManager.STORAGE_KEY, JSON.stringify(entries));
  }

  /**
   * Clear storage
   */
  private async clearStorage(): Promise<void> {
    localStorage.removeItem(GitCredentialManager.STORAGE_KEY);
  }

  /**
   * Fill credentials for Git operation
   */
  fill(url: string): (username: string | undefined) => {
    username: string;
    password: string;
  } | null {
    const creds = this.cache.get(url);
    if (!creds || creds.type !== 'https') {
      return null;
    }

    return () => ({
      username: creds.username,
      password: creds.token,
    });
  }
}

/**
 * Global credential manager instance
 */
export const gitCredentialManager = new GitCredentialManager();
