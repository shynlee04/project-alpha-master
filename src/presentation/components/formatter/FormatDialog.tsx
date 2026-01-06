/**
 * Format Dialog Component
 *
 * Dialog for configuring code formatting options.
 * Provides UI for Prettier and ESLint settings.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog';
import { Label } from '@/presentation/components/ui/label';
import { Switch } from '@/presentation/components/ui/switch';
import { Slider } from '@/presentation/components/ui/slider';
import { Button } from '@/presentation/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/presentation/components/ui/select';
import type { FormatOptions } from '@/lib/formatter';

export interface FormatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: Partial<FormatOptions>;
  onSave: (options: Partial<FormatOptions>) => void;
  formatOnSave: boolean;
  onFormatOnSaveChange: (enabled: boolean) => void;
}

export function FormatDialog({
  open,
  onOpenChange,
  options,
  onSave,
  formatOnSave,
  onFormatOnSaveChange,
}: FormatDialogProps) {
  const { t } = useTranslation();
  const [localOptions, setLocalOptions] = useState<Partial<FormatOptions>>(options);

  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  const handleSave = () => {
    onSave(localOptions);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalOptions(options);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('formatter.dialog.title')}</DialogTitle>
          <DialogDescription>
            {t('formatter.dialog.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format on Save */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="format-on-save">
                {t('formatter.dialog.format_on_save')}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t('formatter.dialog.format_on_save_description')}
              </p>
            </div>
            <Switch
              id="format-on-save"
              checked={formatOnSave}
              onCheckedChange={onFormatOnSaveChange}
            />
          </div>

          {/* Tab Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t('formatter.dialog.tab_size')}</Label>
              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {localOptions.tabSize || 2}
              </span>
            </div>
            <Slider
              value={[localOptions.tabSize || 2]}
              onValueChange={([value]) =>
                setLocalOptions((prev) => ({ ...prev, tabSize: value }))
              }
              min={2}
              max={8}
              step={2}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>2</span>
              <span>4</span>
              <span>6</span>
              <span>8</span>
            </div>
          </div>

          {/* Semicolons */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="semi">{t('formatter.dialog.semicolons')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('formatter.dialog.semicolons_description')}
              </p>
            </div>
            <Switch
              id="semi"
              checked={localOptions.semi ?? true}
              onCheckedChange={(checked) =>
                setLocalOptions((prev) => ({ ...prev, semi: checked }))
              }
            />
          </div>

          {/* Quotes */}
          <div className="space-y-2">
            <Label>{t('formatter.dialog.quotes')}</Label>
            <Select
              value={localOptions.singleQuote ? 'single' : 'double'}
              onValueChange={(value) =>
                setLocalOptions((prev) => ({
                  ...prev,
                  singleQuote: value === 'single',
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="double">
                  {t('formatter.dialog.quotes_double')}
                </SelectItem>
                <SelectItem value="single">
                  {t('formatter.dialog.quotes_single')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Trailing Commas */}
          <div className="space-y-2">
            <Label>{t('formatter.dialog.trailing_commas')}</Label>
            <Select
              value={localOptions.trailingComma || 'es5'}
              onValueChange={(value: 'none' | 'es5' | 'all') =>
                setLocalOptions((prev) => ({ ...prev, trailingComma: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  {t('formatter.dialog.trailing_commas_none')}
                </SelectItem>
                <SelectItem value="es5">
                  {t('formatter.dialog.trailing_commas_es5')}
                </SelectItem>
                <SelectItem value="all">
                  {t('formatter.dialog.trailing_commas_all')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Arrow Parens */}
          <div className="space-y-2">
            <Label>{t('formatter.dialog.arrow_parens')}</Label>
            <Select
              value={localOptions.arrowParens || 'avoid'}
              onValueChange={(value: 'avoid' | 'always') =>
                setLocalOptions((prev) => ({ ...prev, arrowParens: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="avoid">
                  {t('formatter.dialog.arrow_parens_avoid')}
                </SelectItem>
                <SelectItem value="always">
                  {t('formatter.dialog.arrow_parens_always')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Print Width */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t('formatter.dialog.print_width')}</Label>
              <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {localOptions.printWidth || 80}
              </span>
            </div>
            <Slider
              value={[localOptions.printWidth || 80]}
              onValueChange={([value]) =>
                setLocalOptions((prev) => ({ ...prev, printWidth: value }))
              }
              min={60}
              max={120}
              step={10}
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {t('formatter.dialog.cancel')}
          </Button>
          <Button onClick={handleSave}>
            {t('formatter.dialog.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
