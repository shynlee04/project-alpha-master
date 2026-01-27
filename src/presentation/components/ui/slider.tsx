/**
 * @fileoverview Slider Component
 * @module components/ui/slider
 *
 * Basic range slider using HTML5 input styled with Tailwind.
 * Provides a controlled component for numeric range selection.
 * 8-bit aesthetic: square/rectangular elements, no rounded-full
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  /**
   * Current value(s) of the slider
   */
  value: number | number[];

  /**
   * Minimum value
   */
  min?: number;

  /**
   * Maximum value
   */
  max?: number;

  /**
   * Step increment
   */
  step?: number;

  /**
   * Change callback
   */
  onValueChange?: (value: number | number[]) => void;
}

export function Slider({
  value = 0,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  className,
  disabled = false,
  ...props
}: SliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onValueChange?.(newValue);
  };

  // Handle array values (for range sliders with two handles)
  const currentValue = Array.isArray(value) ? value[0] : value;

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={currentValue}
      onChange={handleChange}
      disabled={disabled}
      className={cn(
        // 8-bit aesthetic: rounded-none track, square thumb
        'w-full h-2 bg-muted rounded-none appearance-none cursor-pointer',
        'accent-primary',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // WebKit (Chrome, Safari, Edge) - square thumb for 8-bit look
        '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4',
        '[&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:bg-primary',
        '[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-border',
        // Mozilla (Firefox) - square thumb for 8-bit look
        '[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4',
        '[&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:bg-primary',
        '[&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-border',
        className
      )}
      {...props}
    />
  );
}
