/**
 * Keyboard Shortcuts Overlay Component
 *
 * @epic Epic-23 Story P1.3
 * @description
 * Keyboard shortcuts documentation overlay with 8-bit design system styling.
 * Displays all available keyboard shortcuts in a discoverable way.
 * Supports i18n for internationalization.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Keyboard, Search, Save, FileText, Terminal, Layout, ChevronRight, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import "@/styles/design-tokens.css";

/**
 * Overlay variants using CVA
 */
const overlayVariants = cva(
  [
    "fixed inset-0 z-50",
    "bg-background/95 backdrop-blur-sm",
    "border-2 border-border",
    "rounded-none shadow-lg",
    "max-w-2xl max-h-[80vh]",
    "overflow-hidden",
  ],
  {
    variants: {
      default: {},
    },
  }
);

export interface KeyboardShortcut {
  key: string;
  description: string;
  category: string;
  action?: () => void;
}

export interface KeyboardShortcutsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

/**
 * Default keyboard shortcuts configuration
 */
const defaultShortcuts: KeyboardShortcut[] = [
  {
    key: "Ctrl+B / Cmd+B",
    description: "sidebar.toggleSidebar",
    category: "layout",
  },
  {
    key: "Ctrl+\\ / Cmd+\\",
    description: "sidebar.toggleChat",
    category: "layout",
  },
  {
    key: "Ctrl+S / Cmd+S",
    description: "editor.saveFile",
    category: "editor",
  },
  {
    key: "Ctrl+W / Cmd+W",
    description: "editor.closeTab",
    category: "editor",
  },
  {
    key: "Ctrl+P / Cmd+P",
    description: "commandPalette.open",
    category: "navigation",
  },
  {
    key: "Ctrl+` / Cmd+`",
    description: "terminal.focusTerminal",
    category: "terminal",
  },
  {
    key: "Ctrl+K / Cmd+K",
    description: "shortcuts.openShortcuts",
    category: "navigation",
  },
  {
    key: "Ctrl+Shift+F / Cmd+Shift+F",
    description: "sidebar.toggleSearch",
    category: "sidebar",
  },
  {
    key: "Ctrl+Shift+E / Cmd+Shift+E",
    description: "sidebar.toggleExplorer",
    category: "sidebar",
  },
  {
    key: "Ctrl+Shift+G / Cmd+Shift+G",
    description: "sidebar.toggleAgents",
    category: "sidebar",
  },
  {
    key: "Ctrl+, / Cmd+,",
    description: "sidebar.toggleSettings",
    category: "sidebar",
  },
];

/**
 * KeyboardShortcutsOverlay - Displays all keyboard shortcuts
 *
 * Provides discoverable keyboard shortcuts documentation.
 * Maintains 8-bit aesthetic with smooth animations.
 */
export function KeyboardShortcutsOverlay({
  isOpen,
  onClose,
  className,
}: KeyboardShortcutsOverlayProps) {
  const [activeCategory, setActiveCategory] = React.useState<string>("all");

  const categories = [
    "all",
    "layout",
    "editor",
    "terminal",
    "sidebar",
    "navigation",
  ];

  const filteredShortcuts = activeCategory === "all"
    ? defaultShortcuts
    : defaultShortcuts.filter((s) => s.category === activeCategory);

  const groupedShortcuts = filteredShortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <DialogPrimitive.Content
          className={cn(overlayVariants(), className)}
          onPointerDownOutside={(e) => {
            if (e.target === e.currentTarget) return;
            onClose();
          }}
          onEscapeKeyDown={onClose}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-secondary/30">
            <div className="flex items-center gap-3">
              <Keyboard className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                keyboardShortcuts.title
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X className="w-5 h-5" />
              <span className="text-sm">keyboardShortcuts.close</span>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 px-6 py-3 border-b border-border bg-secondary/20">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-none border-2 transition-colors",
                  "hover:bg-accent/50",
                  activeCategory === category
                    ? "bg-primary text-primary-foreground border-primary"
                    : "text-muted-foreground border-transparent hover:border-border"
                )}
              >
                <span className="text-sm font-medium">
                  {category === "all" && "shortcuts.all"}
                  {category === "layout" && "shortcuts.layout"}
                  {category === "editor" && "shortcuts.editor"}
                  {category === "terminal" && "shortcuts.terminal"}
                  {category === "sidebar" && "shortcuts.sidebar"}
                  {category === "navigation" && "shortcuts.navigation"}
                </span>
              </button>
            ))}
          </div>

          {/* Shortcuts List */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
              <div key={category} className="mb-6">
                {/* Category Header */}
                <div className="flex items-center gap-2 mb-3">
                  {category === "layout" && <Layout className="w-4 h-4 text-primary" />}
                  {category === "editor" && <FileText className="w-4 h-4 text-primary" />}
                  {category === "terminal" && <Terminal className="w-4 h-4 text-primary" />}
                  {category === "sidebar" && <Layout className="w-4 h-4 text-primary" />}
                  {category === "navigation" && <Search className="w-4 h-4 text-primary" />}
                  <h3 className="text-base font-semibold text-foreground">
                    {category === "all" && "shortcuts.all"}
                    {category === "layout" && "shortcuts.layout"}
                    {category === "editor" && "shortcuts.editor"}
                    {category === "terminal" && "shortcuts.terminal"}
                    {category === "sidebar" && "shortcuts.sidebar"}
                    {category === "navigation" && "shortcuts.navigation"}
                  </h3>
                </div>

                {/* Shortcuts */}
                <div className="space-y-2">
                  {shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.key}
                      className="flex items-center justify-between py-2 px-3 bg-background border border-border rounded-none"
                    >
                      <div className="flex items-center gap-4">
                        <kbd className="px-2 py-1 bg-secondary border border-border rounded-none text-xs font-mono text-foreground">
                          {shortcut.key}
                        </kbd>
                        <span className="text-sm text-muted-foreground">
                          {shortcut.description}
                        </span>
                      </div>
                      {shortcut.action && (
                        <button
                          onClick={shortcut.action}
                          className="text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                          {shortcut.key}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border bg-secondary/30">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <HelpCircle className="w-4 h-4" />
              <span>keyboardShortcuts.footer</span>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

KeyboardShortcutsOverlay.displayName = "KeyboardShortcutsOverlay";
