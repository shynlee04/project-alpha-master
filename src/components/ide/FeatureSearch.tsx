import React, { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

/**
 * Feature Search Component
 * 
 * Provides real-time search filtering for IDE features.
 * Supports keyboard navigation and highlighting.
 * 
 * @component FeatureSearch
 */

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  category: string;
  action: () => void;
}

export interface FeatureSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeatureSearch: React.FC<FeatureSearchProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Define available features
  const features: FeatureItem[] = [
    {
      id: 'monaco-editor',
      title: t('featureSearch.monacoEditor'),
      description: t('featureSearch.monacoEditorDesc'),
      category: t('featureSearch.categoryEditor'),
      action: () => {
        // Focus Monaco editor
        onClose();
      },
    },
    {
      id: 'terminal',
      title: t('featureSearch.terminal'),
      description: t('featureSearch.terminalDesc'),
      category: t('featureSearch.categoryTools'),
      action: () => {
        // Focus terminal
        onClose();
      },
    },
    {
      id: 'file-explorer',
      title: t('featureSearch.fileExplorer'),
      description: t('featureSearch.fileExplorerDesc'),
      category: t('featureSearch.categoryTools'),
      action: () => {
        // Focus file explorer
        onClose();
      },
    },
    {
      id: 'agent-chat',
      title: t('featureSearch.agentChat'),
      description: t('featureSearch.agentChatDesc'),
      category: t('featureSearch.categoryAI'),
      action: () => {
        // Open agent chat
        onClose();
      },
    },
    {
      id: 'settings',
      title: t('featureSearch.settings'),
      description: t('featureSearch.settingsDesc'),
      category: t('featureSearch.categoryTools'),
      action: () => {
        // Open settings
        onClose();
      },
    },
    {
      id: 'sync-status',
      title: t('featureSearch.syncStatus'),
      description: t('featureSearch.syncStatusDesc'),
      category: t('featureSearch.categoryStatus'),
      action: () => {
        // Check sync status
        onClose();
      },
    },
    {
      id: 'webcontainer-status',
      title: t('featureSearch.webcontainerStatus'),
      description: t('featureSearch.webcontainerStatusDesc'),
      category: t('featureSearch.categoryStatus'),
      action: () => {
        // Check WebContainer status
        onClose();
      },
    },
    {
      id: 'keyboard-shortcuts',
      title: t('featureSearch.keyboardShortcuts'),
      description: t('featureSearch.keyboardShortcutsDesc'),
      category: t('featureSearch.categoryHelp'),
      action: () => {
        // Show keyboard shortcuts
        onClose();
      },
    },
  ];

  // Filter features based on search
  const filteredFeatures = features.filter((feature) => {
    const searchLower = search.toLowerCase();
    const titleLower = feature.title.toLowerCase();
    const descLower = feature.description.toLowerCase();
    
    return (
      titleLower.includes(searchLower) ||
      descLower.includes(searchLower)
    );
  });

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => 
        prev < filteredFeatures.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => 
        prev > 0 ? prev - 1 : prev
      );
    } else if (e.key === 'Enter' && filteredFeatures.length > 0) {
      e.preventDefault();
      filteredFeatures[selectedIndex].action();
      onClose();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [isOpen, filteredFeatures, selectedIndex, onClose]);

  // Reset selection when search changes
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setSelectedIndex(0);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 transition-all duration-200",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 w-full max-w-3xl mx-auto mt-[10vh]">
        <div className="rounded-lg border border-border bg-card shadow-pixel overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Search className="w-5 h-5" />
              {t('featureSearch.title')}
            </h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label={t('featureSearch.close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t('featureSearch.placeholder')}
                className="w-full h-10 pl-10 pr-3 rounded-md border border-border bg-transparent text-sm outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 placeholder:text-muted-foreground"
                autoFocus={isOpen}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={t('featureSearch.clear')}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {filteredFeatures.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Search className="mb-3 h-12 w-12" />
                <p className="text-sm">{t('featureSearch.noResults')}</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredFeatures.map((feature, index) => (
                  <button
                    key={feature.id}
                    onClick={() => {
                      feature.action();
                      onClose();
                    }}
                    className={cn(
                      "w-full text-left p-4 rounded-md border border-border transition-all",
                      "hover:bg-accent hover:border-primary",
                      index === selectedIndex && "bg-accent border-primary ring-2 ring-primary ring-offset-0"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                          <span className="text-lg font-bold text-primary">
                            {feature.title.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground mb-1">
                          {feature.category}
                        </div>
                        <h3 className="font-medium text-foreground mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
};

export default FeatureSearch;
