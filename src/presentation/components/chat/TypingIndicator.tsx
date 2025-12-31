/**
 * TypingIndicator Component
 * Animated typing indicator for streaming messages
 * Max 120 lines
 */

import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TypingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-3">
      <div className={cn(
        'w-8 h-8 rounded-sm flex items-center justify-center',
        'border-2 bg-purple-600 border-purple-400'
      )}>
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className={cn(
        'flex items-center gap-1 px-4 py-2 rounded-sm',
        'bg-slate-800/80 border-2 border-slate-600',
        'shadow-md'
      )}>
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
