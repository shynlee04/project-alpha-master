/**
 * Mobile Format Button Component
 *
 * Format button for mobile toolbar.
 * Provides quick access to code formatting on mobile devices.
 */

import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/presentation/components/ui/dropdown-menu';
import { Sparkles, FileText, FileCode, Save } from 'lucide-react';

export interface MobileFormatButtonProps {
  onFormatDocument?: () => void;
  onFormatSelection?: () => void;
  onFixLint?: () => void;
  onToggleFormatOnSave?: () => void;
  isFormatting?: boolean;
  formatOnSave?: boolean;
  disabled?: boolean;
}

export function MobileFormatButton({
  onFormatDocument,
  onFormatSelection,
  onFixLint,
  onToggleFormatOnSave,
  isFormatting = false,
  formatOnSave = false,
  disabled = false,
}: MobileFormatButtonProps) {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled || isFormatting}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 w-12"
      >
        <Sparkles className="h-5 w-5" />
        <span className="sr-only">{t('formatter.mobile.format_menu')}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {onFormatDocument && (
          <DropdownMenuItem onClick={onFormatDocument} disabled={disabled}>
            <FileText className="mr-2 h-4 w-4" />
            <span>{t('formatter.mobile.format_document')}</span>
          </DropdownMenuItem>
        )}

        {onFormatSelection && (
          <DropdownMenuItem onClick={onFormatSelection} disabled={disabled}>
            <FileCode className="mr-2 h-4 w-4" />
            <span>{t('formatter.mobile.format_selection')}</span>
          </DropdownMenuItem>
        )}

        {onFixLint && (
          <DropdownMenuItem onClick={onFixLint} disabled={disabled}>
            <Sparkles className="mr-2 h-4 w-4" />
            <span>{t('formatter.mobile.fix_lint')}</span>
          </DropdownMenuItem>
        )}

        {onToggleFormatOnSave && (
          <DropdownMenuItem onClick={onToggleFormatOnSave}>
            <Save className="mr-2 h-4 w-4" />
            <span>
              {formatOnSave
                ? t('formatter.mobile.disable_format_on_save')
                : t('formatter.mobile.enable_format_on_save')}
            </span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
