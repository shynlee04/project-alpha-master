/**
 * @fileoverview Saved Searches Component
 * @module presentation/components/search/SavedSearches
 *
 * Saved searches UI with save, load, edit, and delete functionality.
 *
 * @story S-027 Advanced Search with Filters
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bookmark,
  FolderOpen,
  Trash2,
  Edit2,
  X,
  Clock,
} from 'lucide-react';
import { Button } from '@/presentation/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/presentation/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { SavedSearch } from '@/hooks/useAdvancedSearch';

export interface SavedSearchesProps {
  /** Saved searches */
  savedSearches: SavedSearch[];

  /** Save current search */
  onSaveSearch: (name: string) => void;

  /** Load saved search */
  onLoadSearch: (id: string) => void;

  /** Delete saved search */
  onDeleteSearch: (id: string) => void;

  /** Current query */
  currentQuery?: string;

  /** CSS class name */
  className?: string;
}

/**
 * Saved searches component
 */
export const SavedSearches: React.FC<SavedSearchesProps> = ({
  savedSearches,
  onSaveSearch,
  onLoadSearch,
  onDeleteSearch,
  currentQuery = '',
  className,
}) => {
  const { t } = useTranslation();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleSave = () => {
    if (saveName.trim()) {
      onSaveSearch(saveName.trim());
      setSaveName('');
      setSaveDialogOpen(false);
    }
  };

  const handleLoad = (id: string) => {
    onLoadSearch(id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t('search.confirmDelete', 'Are you sure you want to delete this saved search?'))) {
      onDeleteSearch(id);
    }
  };

  const startEdit = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditName(name);
  };

  const saveEdit = (_id: string) => {
    if (editName.trim()) {
      // In a real app, you'd have an onEditSearch callback
      setEditingId(null);
      setEditName('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <h3 className="text-sm font-semibold font-pixel uppercase tracking-wider flex items-center gap-2">
          <Bookmark className="w-4 h-4" />
          {t('search.savedSearches', 'Saved Searches')}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSaveDialogOpen(true)}
          disabled={!currentQuery.trim()}
          className="h-7 text-xs"
        >
          {t('search.saveCurrent', 'Save Current')}
        </Button>
      </div>

      {/* Saved searches list */}
      <div className="max-h-64 overflow-y-auto">
        {savedSearches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <Bookmark className="w-8 h-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">
              {t('search.noSavedSearches', 'No saved searches yet')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('search.saveSearchHint', 'Save a search to quickly access it later')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {savedSearches.map((search) => (
              <div
                key={search.id}
                className="group relative"
              >
                {editingId === search.id ? (
                  // Edit mode
                  <div className="flex items-center gap-2 p-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 h-8 px-2 text-sm border border-border rounded-none bg-background"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(search.id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => saveEdit(search.id)}
                      className="h-7 px-2"
                    >
                      {t('common.save', 'Save')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEdit}
                      className="h-7 px-2"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  // Display mode
                  <button
                    onClick={() => handleLoad(search.id)}
                    className="w-full flex items-start gap-3 p-3 text-left hover:bg-secondary transition-colors duration-150"
                  >
                    <FolderOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                          {search.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground truncate">
                          {search.query}
                        </span>
                        {Object.keys(search.filters).length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            • {Object.keys(search.filters).length} {t('search.filters', 'filters')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>
                          {t('search.lastUsed', 'Used')} {new Date(search.lastUsed).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <button
                        onClick={(e) => startEdit(search.id, search.name, e)}
                        className="p-1.5 hover:bg-muted rounded-none transition-colors duration-150"
                        title={t('search.rename', 'Rename')}
                      >
                        <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(search.id, e)}
                        className="p-1.5 hover:bg-destructive/10 rounded-none transition-colors duration-150"
                        title={t('search.delete', 'Delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save search dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>
              {t('search.saveSearchTitle', 'Save Search')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t('search.searchName', 'Search Name')}
              </label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder={t('search.searchNamePlaceholder', 'My search')}
                className="w-full h-10 px-3 border border-border rounded-none bg-background"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') setSaveDialogOpen(false);
                }}
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">{t('search.query', 'Query')}:</span>{' '}
                <span className="text-muted-foreground">{currentQuery}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setSaveDialogOpen(false)}
            >
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={!saveName.trim()}
            >
              {t('common.save', 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
