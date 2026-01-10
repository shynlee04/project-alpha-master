/**
 * @fileoverview Provider Playground Route Definition
 * @module routes/__debug__/provider-playground/route
 *
 * Registers the debug route at /__debug__/provider-playground
 */

import { createFileRoute } from '@tanstack/react-router';
import ProviderPlayground from './index';

export const Route = createFileRoute('/__debug__/provider-playground')({
  component: ProviderPlayground,
});
