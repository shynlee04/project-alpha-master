/**
 * EmptyChatState Component
 * Empty state placeholder for chat conversations
 * Max 120 lines
 */

import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyChatStateProps {
  title?: string;
  message?: string;
  className?: string;
}

export function EmptyChatState({
  title = 'Start a conversation',
  message = 'Type a message below to begin chatting with your agent.',
  className
}: EmptyChatStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center h-full',
      'px-4 text-center',
      className
    )}>
      {/* Icon */}
      <div className={cn(
        'w-16 h-16 rounded-sm flex items-center justify-center mb-4',
        'bg-purple-600/20 border-2 border-purple-500'
      )}>
        <Bot className="w-8 h-8 text-purple-400" />
      </div>

      {/* Title */}
      <h3 className={cn(
        'text-lg font-semibold text-slate-100 mb-2',
        'font-mono'
      )}>
        {title}
      </h3>

      {/* Message */}
      <p className={cn(
        'text-sm text-slate-400 max-w-md',
        'leading-relaxed'
      )}>
        {message}
      </p>

      {/* Hints */}
      <div className={cn(
        'mt-6 px-4 py-3',
        'bg-slate-800/50 border border-slate-700',
        'rounded-sm'
      )}>
        <p className={cn(
          'text-xs text-slate-500 font-mono',
          'leading-relaxed'
        )}>
          Press <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300">Enter</kbd> to send,{' '}
          <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300">Shift + Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}
