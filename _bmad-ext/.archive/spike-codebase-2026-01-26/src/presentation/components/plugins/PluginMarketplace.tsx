/**
 * Plugin Marketplace Component
 *
 * Browse, search, and install plugins from the marketplace.
 * Mobile full-screen layout with 8-bit gaming style.
 *
 * @module components/plugins/PluginMarketplace
 * @story S-037 - Plugin System for extensibility with marketplace
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Star, Download, Filter } from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import { usePluginMarketplace } from '@/hooks/usePlugins';
import { usePluginsStore } from '@/infrastructure/persistence/stores/plugins-store';
import { cn } from '@/lib/utils';
import { useMediaQuery, BREAKPOINTS } from '@/hooks/useMediaQuery';

export function PluginMarketplace() {
  const { t } = useTranslation();
  const isMobile = useMediaQuery(BREAKPOINTS.mobile);

  const {
    entries,
    isLoading,
    filterCategory,
    filterSearch,
    setFilterCategory,
    setFilterSearch,
    refreshMarketplace,
    installFromMarketplace,
  } = usePluginMarketplace();

  const [installingId, setInstallingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Refresh marketplace on mount only (NOT on refreshMarketplace change to avoid infinite loop)
  useEffect(() => {
    refreshMarketplace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = Array.from(new Set(entries.map((e) => e.category)));

  const handleInstall = async (entryId: string) => {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;

    setInstallingId(entryId);

    try {
      await installFromMarketplace(entry);
    } catch (error) {
      console.error('Failed to install plugin:', error);
    } finally {
      setInstallingId(null);
    }
  };

  const isInstalled = (entryId: string) => {
    const plugins = usePluginsStore.getState().plugins;
    return plugins.some((p) => p.manifest.name.toLowerCase().replace(/\s+/g, '-') === entryId);
  };

  return (
    <div className={cn(
      'flex flex-col bg-background',
      isMobile ? 'h-dvh fixed inset-0 z-50' : 'h-full'
    )}>
      {/* Header */}
      <div className="border-b-2 border-border p-4 bg-secondary">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-mono text-foreground">
            {t('plugins.marketplace.title', 'Plugin Marketplace')}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'gap-2',
              isMobile && 'min-h-[44px]'
            )}
          >
            <Filter />
            <span>{t('plugins.marketplace.filters', 'Filters')}</span>
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder={t('plugins.marketplace.searchPlaceholder', 'Search plugins...')}
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            className={cn(
              'w-full pl-10 pr-4 py-2 border-2 border-border rounded-none',
              'bg-background text-foreground placeholder:text-muted-foreground',
              'focus:outline-none focus:border-primary',
              isMobile && 'min-h-[44px]'
            )}
          />
        </div>

        {/* Category Filters */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              variant={filterCategory === null ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilterCategory(null)}
              className={cn(
                'rounded-none',
                isMobile && 'min-h-[44px]'
              )}
            >
              {t('plugins.marketplace.allCategories', 'All')}
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={filterCategory === category ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterCategory(category)}
                className={cn(
                  'rounded-none',
                  isMobile && 'min-h-[44px]'
                )}
              >
                {category}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Plugin List */}
      <div className={cn(
        'flex-1 overflow-y-auto',
        isMobile ? 'pb-safe-bottom' : 'p-4'
      )}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">
                {t('plugins.marketplace.loading', 'Loading plugins...')}
              </p>
            </div>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {t('plugins.marketplace.noResults', 'No plugins found')}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setFilterSearch('');
                  setFilterCategory(null);
                }}
                className={cn(
                  'rounded-none',
                  isMobile && 'min-h-[44px]'
                )}
              >
                {t('plugins.marketplace.clearFilters', 'Clear Filters')}
              </Button>
            </div>
          </div>
        ) : (
          <div className={cn(
            'grid gap-4',
            isMobile ? 'grid-cols-1 p-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          )}>
            {entries.map((entry) => (
              <PluginCard
                key={entry.id}
                entry={entry}
                isInstalled={isInstalled(entry.id)}
                isInstalling={installingId === entry.id}
                onInstall={() => handleInstall(entry.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface PluginCardProps {
  entry: {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    category: string;
    tags: string[];
    downloads: number;
    rating: number;
    reviews: number;
    permissions: string[];
    icon?: string;
    screenshots?: string[];
  };
  isInstalled: boolean;
  isInstalling: boolean;
  onInstall: () => void;
}

function PluginCard({ entry, isInstalled, isInstalling, onInstall }: PluginCardProps) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery(BREAKPOINTS.mobile);

  return (
    <div className="border-2 border-border rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.5)] bg-secondary p-4">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {entry.icon ? (
          <img src={entry.icon} alt={entry.name} className="w-12 h-12 rounded-none border-2 border-border" />
        ) : (
          <div className="w-12 h-12 bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl rounded-none">
            {entry.name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold font-mono text-foreground truncate">{entry.name}</h3>
          <p className="text-sm text-muted-foreground">{entry.author}</p>
        </div>
        <div className="flex items-center gap-1 text-yellow-500">
          <Star className="h-4 w-4 fill-current" />
          <span className="text-sm font-medium">{entry.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-foreground mb-3 line-clamp-2">{entry.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {entry.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 text-xs bg-muted text-muted-foreground border border-border"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          v{entry.version} • {entry.downloads} {t('plugins.marketplace.downloads', 'downloads')}
        </div>
        <Button
          variant={isInstalled ? 'secondary' : 'primary'}
          size="sm"
          onClick={onInstall}
          disabled={isInstalled || isInstalling}
          loading={isInstalling}
          className={cn(
            'rounded-none gap-2',
            isMobile && 'min-h-[44px]'
          )}
        >
          {isInstalled ? (
            <>
              <Download />
              <span>{t('plugins.marketplace.installed', 'Installed')}</span>
            </>
          ) : (
            <>
              <Download />
              <span>{t('plugins.marketplace.install', 'Install')}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
