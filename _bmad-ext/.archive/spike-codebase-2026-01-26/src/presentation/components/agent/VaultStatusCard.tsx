/**
 * Vault Status Card Component
 *
 * Displays:
 * - Vault initialization status
 * - Migration status
 * - Manual re-migration button
 *
 * Part of P1-09: Simplify Agent/Key Flow for Phase 1
 * Based on P1-08 vault chain investigation findings.
 *
 * @module agent/VaultStatusCard
 * @story P1-09
 * @priority P1
 */

import { useState, useEffect } from 'react';
import { Shield, Lock, AlertCircle, CheckCircle2, RefreshCw, Info } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { toast } from 'sonner';
import { useAppStore } from '@/infrastructure/persistence/stores/use-app-store';
import { useMigrationState, useMigrationMessage } from '@/infrastructure/persistence/stores/providers/use-migration-state';
import { credentialVault } from '@/lib/agent/providers/credential-vault';
import { isMigrationNeeded, migrateApiKeysToVault } from '@/infrastructure/persistence/stores/providers/migrate-api-keys-to-vault';

export interface VaultStatusCardProps {
  className?: string;
}

interface VaultStatus {
  isInitialized: boolean;
  isInitializing: boolean;
  hasKeys: boolean;
  keyCount: number;
}

/**
 * Check vault status
 * P1-15 FIX: Now reactive to provider changes by using Zustand selector
 */
function useVaultStatus(): VaultStatus {
  const [status, setStatus] = useState<VaultStatus>({
    isInitialized: false,
    isInitializing: false,
    hasKeys: false,
    keyCount: 0,
  });

  // Subscribe to providers using selector - re-renders when providers change
  const providers = useAppStore(s => s.providers);

  useEffect(() => {
    // Check if vault is initialized
    const checkVault = async () => {
      try {
        setStatus(prev => ({ ...prev, isInitializing: true }));

        // Try to get vault status - this will trigger initialization if needed
        const vault = (credentialVault as any).masterKey;
        const isInitialized = !!vault;

        // Count stored keys from subscribed providers
        const keyCount = providers.filter(p => p.hasApiKey).length;

        setStatus({
          isInitialized,
          isInitializing: false,
          hasKeys: keyCount > 0,
          keyCount,
        });
      } catch (error) {
        console.error('[VaultStatusCard] Failed to check vault:', error);
        setStatus(prev => ({ ...prev, isInitializing: false }));
      }
    };

    checkVault();
  }, [providers]); // P1-15 FIX: Re-run when providers change

  return status;
}

export function VaultStatusCard({ className = '' }: VaultStatusCardProps) {
  const vaultStatus = useVaultStatus();
  const providers = useAppStore(s => s.providers);
  const updateProvider = useAppStore(s => s.updateProvider);
  const migrationPhase = useMigrationState(s => s.phase);
  const migrationMessage = useMigrationMessage();
  const [isRemigrating, setIsRemigrating] = useState(false);

  // Check if migration is needed
  const migrationNeeded = isMigrationNeeded(providers);
  const keysNeedingMigration = providers.filter(p => 'apiKey' in p && typeof (p as any).apiKey === 'string').length;

  /**
   * Manual re-migration trigger
   * For users who need to re-run migration
   */
  const handleRemigrate = async () => {
    if (isRemigrating) return;

    setIsRemigrating(true);
    try {
      const result = await migrateApiKeysToVault(
        providers,
        null,
        updateProvider
      );

      if (result.success) {
        toast.success(`✓ Re-migration complete: ${result.migratedCount} providers`);
      } else {
        toast.error(`✗ Re-migration failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[VaultStatusCard] Re-migration failed:', error);
      toast.error('✗ Re-migration failed. Check console for details.');
    } finally {
      setIsRemigrating(false);
    }
  };

  const getVaultStatusIcon = () => {
    if (vaultStatus.isInitializing) {
      return <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />;
    }
    if (vaultStatus.isInitialized && vaultStatus.keyCount > 0) {
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    }
    if (vaultStatus.isInitialized) {
      return <Lock className="h-4 w-4 text-muted-foreground" />;
    }
    return <AlertCircle className="h-4 w-4 text-warning" />;
  };

  const getVaultStatusText = () => {
    if (vaultStatus.isInitializing) {
      return 'Initializing...';
    }
    if (vaultStatus.isInitialized && vaultStatus.keyCount > 0) {
      return `${vaultStatus.keyCount} API key${vaultStatus.keyCount > 1 ? 's' : ''} stored`;
    }
    if (vaultStatus.isInitialized) {
      return 'Vault ready - no keys yet';
    }
    return 'Vault not initialized';
  };

  return (
    <div className={`border border-border rounded-none p-4 space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="font-semibold font-mono">Vault Status</h3>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {getVaultStatusIcon()}
          <span className="text-muted-foreground">{getVaultStatusText()}</span>
        </div>
      </div>

      {/* Migration Status */}
      {migrationNeeded && (
        <div className="bg-warning/10 border border-warning/30 rounded p-3 flex items-start gap-3">
          <Info className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-warning">
              Migration Available
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {keysNeedingMigration} provider{keysNeedingMigration > 1 ? 's have' : ' has'} API keys that can be migrated to encrypted vault storage.
            </p>
          </div>
        </div>
      )}

      {/* Migration Progress */}
      {migrationMessage && (
        <div className="bg-info/10 border border-info/30 rounded p-3 flex items-start gap-3">
          <RefreshCw className="h-4 w-4 text-info mt-0.5 flex-shrink-0 animate-spin" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-info">
              {migrationMessage}
            </p>
          </div>
        </div>
      )}

      {/* Info Text */}
      <p className="text-xs text-muted-foreground">
        API keys are encrypted with AES-256-GCM and stored locally in your browser.
        Keys are never sent to external servers except the provider API.
      </p>

      {/* Manual Re-migration Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRemigrate}
          disabled={isRemigrating || ['backup', 'migrating', 'verifying', 'rollback'].includes(migrationPhase)}
          className="gap-2 rounded-none text-xs"
        >
          <RefreshCw className={`h-3 w-3 ${isRemigrating ? 'animate-spin' : ''}`} />
          {isRemigrating ? 'Re-migrating...' : 'Re-migrate Keys'}
        </Button>
      </div>
    </div>
  );
}
