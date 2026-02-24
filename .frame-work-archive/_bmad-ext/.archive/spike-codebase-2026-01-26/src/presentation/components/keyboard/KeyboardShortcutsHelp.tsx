/**
 * @fileoverview Keyboard Shortcuts Help Modal
 * @module components/keyboard/KeyboardShortcutsHelp
 *
 * Modal dialog displaying all available keyboard shortcuts organized by category.
 * Provides discoverability for keyboard shortcuts and helps users learn available commands.
 *
 * @story S-021 Implement Keyboard Shortcuts System
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';
import { Button } from '@/presentation/components/ui/button';
import { Badge } from '@/presentation/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/tabs';
import { X, Keyboard, Navigation, Edit, Eye, Wrench, HelpCircle } from 'lucide-react';
import { KeyboardShortcutManager, formatShortcut } from '@/lib/keyboard/KeyboardShortcutManager';
import type { KeyboardShortcut } from '@/lib/keyboard/KeyboardShortcutManager';

export interface KeyboardShortcutsHelpProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
}

/**
 * Category icons mapping
 */
const CATEGORY_ICONS: Record<KeyboardShortcut['category'], React.ReactNode> = {
  global: <Keyboard className="h-4 w-4" />,
  navigation: <Navigation className="h-4 w-4" />,
  editing: <Edit className="h-4 w-4" />,
  view: <Eye className="h-4 w-4" />,
  tools: <Wrench className="h-4 w-4" />,
  help: <HelpCircle className="h-4 w-4" />,
};

/**
 * Category tab order
 */
const CATEGORY_ORDER: KeyboardShortcut['category'][] = [
  'global',
  'navigation',
  'editing',
  'view',
  'tools',
  'help',
];

/**
 * Keyboard Shortcut Item Component
 */
interface ShortcutItemProps {
  shortcut: KeyboardShortcut;
}

const ShortcutItem: React.FC<ShortcutItemProps> = ({ shortcut }) => {
  const { t } = useTranslation();
  const shortcutLabel = formatShortcut(shortcut);

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        {CATEGORY_ICONS[shortcut.category]}
        <span className="text-sm">{t(shortcut.description)}</span>
      </div>
      <Badge variant="outline" className="font-mono text-xs">
        {shortcutLabel}
      </Badge>
    </div>
  );
};

/**
 * Shortcuts Category Section Component
 */
interface CategorySectionProps {
  category: KeyboardShortcut['category'];
  shortcuts: KeyboardShortcut[];
}

const CategorySection: React.FC<CategorySectionProps> = ({ category, shortcuts }) => {
  const { t } = useTranslation();

  if (shortcuts.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        {CATEGORY_ICONS[category]}
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t(`keyboardShortcuts.categories.${category}`)}
        </h3>
      </div>
      <div className="space-y-1">
        {shortcuts.map((shortcut) => (
          <ShortcutItem key={shortcut.id} shortcut={shortcut} />
        ))}
      </div>
    </div>
  );
};

/**
 * Keyboard Shortcuts Help Modal Component
 *
 * Displays all available keyboard shortcuts in an organized modal dialog.
 * Shortcuts are grouped by category and can be filtered using tabs.
 */
export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const [shortcuts, setShortcuts] = useState<
    Map<KeyboardShortcut['category'], KeyboardShortcut[]>
  >(new Map());

  // Load shortcuts when modal opens
  useEffect(() => {
    if (isOpen) {
      setShortcuts(KeyboardShortcutManager.getAllShortcuts());
    }
  }, [isOpen]);

  // Close modal on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Check if shortcuts are available
  const shortcutsAvailable = KeyboardShortcutManager.enabled;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-primary" />
              <DialogTitle className="text-xl">
                {t('keyboardShortcuts.title')}
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
              aria-label={t('common.close')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            {t('keyboardShortcuts.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {!shortcutsAvailable && (
            <div className="mb-4 p-3 bg-muted rounded-md border border-border">
              <p className="text-sm text-muted-foreground">
                {t('keyboardShortcuts.notAvailable')}
              </p>
            </div>
          )}

          <div className="h-[500px] overflow-y-auto pr-4">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-4">
                <TabsTrigger value="all" className="text-xs">
                  {t('keyboardShortcuts.allTabs')}
                </TabsTrigger>
                {CATEGORY_ORDER.slice(0, 5).map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="text-xs hidden lg:flex"
                  >
                    {t(`keyboardShortcuts.categories.${category}`)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* All shortcuts tab */}
              <TabsContent value="all" className="space-y-6 mt-0">
                {CATEGORY_ORDER.map((category) => {
                  const categoryShortcuts = shortcuts.get(category) || [];
                  return (
                    <CategorySection
                      key={category}
                      category={category}
                      shortcuts={categoryShortcuts}
                    />
                  );
                })}
              </TabsContent>

              {/* Individual category tabs */}
              {CATEGORY_ORDER.map((category) => {
                const categoryShortcuts = shortcuts.get(category) || [];
                return (
                  <TabsContent key={category} value={category} className="mt-0">
                    <CategorySection
                      category={category}
                      shortcuts={categoryShortcuts}
                    />
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {t('keyboardShortcuts.hint', {
              modifier: /Mac|iPod|iPhone|iPad/.test(navigator.platform)
                ? 'Cmd'
                : 'Ctrl',
            })}
          </p>
          <Button onClick={onClose} variant="outline" size="sm">
            {t('common.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Default export
 */
export default KeyboardShortcutsHelp;
