/**
 * @fileoverview ContextMenu Component
 * S-024: Enhanced right-click context menu for file tree operations
 *
 * Features:
 * - File operations: Open, Rename, Duplicate, Delete, Download, Copy Path, Reveal
 * - Folder operations: New File, New Folder, Rename, Delete
 * - Advanced items (with Option key): Copy Absolute Path, Duplicate with References, Run Script
 * - Keyboard shortcuts display (F2, Cmd+Backspace)
 * - Smart positioning to avoid viewport edges
 * - 8-bit gaming style (no blur effects)
 * - i18n support
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    Pencil,
    Trash2,
    Copy,
    Download,
    ExternalLink,
    Scissors,
    Terminal,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ContextMenuAction, TreeNode } from './types';

interface ContextMenuProps {
    visible: boolean;
    x: number;
    y: number;
    targetNode: TreeNode | null;
    onAction: (action: ContextMenuAction) => void;
    onClose: () => void;
    /** Whether Option key is held (for advanced options) */
    optionKeyHeld?: boolean;
}

interface MenuItem {
    action?: ContextMenuAction;
    labelKey?: string;
    labelDefault?: string;
    icon?: React.ReactNode;
    destructive?: boolean;
    shortcut?: string;
    requiresDirectory?: boolean;
    advanced?: boolean; // Only shown when Option is held
    type?: 'separator'; // Special type for menu separators
}

/**
 * ContextMenu - Enhanced file tree context menu with full CRUD operations
 */
export function ContextMenu({
    visible,
    x,
    y,
    targetNode,
    onAction,
    onClose,
    optionKeyHeld = false,
}: ContextMenuProps): React.JSX.Element | null {
    const menuRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x, y });
    const { t } = useTranslation();

    // Adjust position to avoid viewport edges
    useEffect(() => {
        if (!visible) return;

        const MENU_WIDTH = 200;
        const MENU_HEIGHT = 400; // Approximate max height
        const PADDING = 10;

        let adjustedX = x;
        let adjustedY = y;

        // Check right edge
        if (x + MENU_WIDTH > window.innerWidth - PADDING) {
            adjustedX = window.innerWidth - MENU_WIDTH - PADDING;
        }

        // Check bottom edge
        if (y + MENU_HEIGHT > window.innerHeight - PADDING) {
            adjustedY = window.innerHeight - MENU_HEIGHT - PADDING;
        }

        // Check left edge
        if (adjustedX < PADDING) {
            adjustedX = PADDING;
        }

        // Check top edge
        if (adjustedY < PADDING) {
            adjustedY = PADDING;
        }

        setPosition({ x: adjustedX, y: adjustedY });
    }, [visible, x, y]);

    // Track Option key state
    useEffect(() => {
        if (!visible) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Alt' || e.key === 'Option') {
                // Trigger re-render to show advanced options
                setPosition((prev) => ({ ...prev }));
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Alt' || e.key === 'Option') {
                // Trigger re-render to hide advanced options
                setPosition((prev) => ({ ...prev }));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [visible]);

    // Close on outside click
    useEffect(() => {
        if (!visible) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        // Delay to avoid immediate close
        const timeoutId = setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [visible, onClose]);

    // Focus menu when visible
    useEffect(() => {
        if (visible && menuRef.current) {
            menuRef.current.focus();
        }
    }, [visible]);

    // Define all menu items
    const allMenuItems: MenuItem[] = [
        // File operations
        {
            action: 'rename',
            labelKey: 'contextMenu.rename',
            labelDefault: 'Rename',
            icon: <Pencil size={14} />,
            shortcut: 'F2',
        },
        {
            action: 'duplicate',
            labelKey: 'contextMenu.duplicate',
            labelDefault: 'Duplicate',
            icon: <Copy size={14} />,
        },
        {
            action: 'delete',
            labelKey: 'contextMenu.delete',
            labelDefault: 'Delete',
            icon: <Trash2 size={14} />,
            destructive: true,
            shortcut: '⌫',
        },
        { type: 'separator' },
        {
            action: 'download',
            labelKey: 'contextMenu.download',
            labelDefault: 'Download',
            icon: <Download size={14} />,
        },
        {
            action: 'copy-path',
            labelKey: 'contextMenu.copyPath',
            labelDefault: 'Copy Path',
            icon: <Copy size={14} />,
        },
        {
            action: 'reveal-in-finder',
            labelKey: 'contextMenu.revealInFinder',
            labelDefault: 'Reveal in Finder',
            icon: <ExternalLink size={14} />,
        },
        { type: 'separator' },
        // Advanced options (Option key)
        {
            action: 'copy-absolute-path',
            labelKey: 'contextMenu.copyAbsolutePath',
            labelDefault: 'Copy Absolute Path',
            icon: <Copy size={14} />,
            advanced: true,
        },
        {
            action: 'duplicate-with-references',
            labelKey: 'contextMenu.duplicateWithReferences',
            labelDefault: 'Duplicate with References',
            icon: <Scissors size={14} />,
            advanced: true,
        },
        {
            action: 'run-script',
            labelKey: 'contextMenu.runScript',
            labelDefault: 'Run Script',
            icon: <Terminal size={14} />,
            advanced: true,
        },
    ];

    // Filter items based on node type and Option key state
    const filterMenuItems = useCallback((items: MenuItem[], isDirectory: boolean): MenuItem[] => {
        return items.filter((item) => {
            // Skip separators for now (we'll add them back)
            if ('type' in item && item.type === 'separator') return false;

            const menuItem = item as MenuItem;

            // Filter out directory-specific items for files
            if (menuItem.requiresDirectory && !isDirectory) return false;

            // Filter advanced items unless Option is held
            if (menuItem.advanced && !optionKeyHeld) return false;

            return true;
        });
    }, [optionKeyHeld]);

    if (!visible || !targetNode) {
        return null;
    }

    const isDirectory = targetNode.type === 'directory';
    const filteredItems = filterMenuItems(allMenuItems, isDirectory);

    const handleAction = (action: ContextMenuAction) => {
        onAction(action);
        onClose();
    };

    return (
        <div
            ref={menuRef}
            role="menu"
            tabIndex={-1}
            className="fixed z-50 bg-popover border-2 border-border rounded shadow-lg py-1 min-w-[180px] max-h-[60vh] overflow-auto focus:outline-none"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
        >
            {filteredItems.map((item, _index) => (
                <button
                    key={item.action}
                    role="menuitem"
                    className={`
                        w-full px-3 py-2 text-left text-sm flex items-center justify-between gap-3
                        ${item.destructive
                            ? 'text-destructive hover:bg-destructive/20'
                            : 'text-popover-foreground hover:bg-accent/50'
                        }
                        transition-colors focus-visible:outline-none focus-visible:bg-accent/50
                        ${item.advanced ? 'text-muted-foreground' : ''}
                    `}
                    onClick={() => handleAction(item.action)}
                    title={item.labelDefault}
                >
                    <span className="flex items-center gap-2">
                        {item.icon}
                        <span>{t(item.labelKey, { defaultValue: item.labelDefault })}</span>
                    </span>
                    {item.shortcut && (
                        <span className="text-xs text-muted-foreground ml-auto">
                            {item.shortcut}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}
