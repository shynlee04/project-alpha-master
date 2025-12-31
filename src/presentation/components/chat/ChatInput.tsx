/**
 * ChatInput Component
 * Message input with debouncing and keyboard shortcuts
 * Max 120 lines
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isStreaming?: boolean;
  className?: string;
}

export function ChatInput({
  onSendMessage,
  isStreaming = false,
  className
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [debouncedInput, setDebouncedInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced input handler (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(input);
    }, 300);

    return () => clearTimeout(timer);
  }, [input]);

  // Submit handler
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!debouncedInput.trim() || isStreaming) return;
    onSendMessage(debouncedInput.trim());
    setInput('');
    setDebouncedInput('');
  }, [debouncedInput, isStreaming, onSendMessage]);

  // Keyboard handler (Enter to send, Shift+Enter for new line)
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  // Auto-resize textarea
  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  return (
    <form onSubmit={handleSubmit} className={cn('flex gap-2 p-4', className)}>
      <textarea
        ref={inputRef}
        value={input}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        disabled={isStreaming}
        className={cn(
          'flex-1 min-h-[44px] max-h-32 px-4 py-3',
          'bg-slate-800 border-2 border-slate-600 rounded-sm',
          'text-slate-100 placeholder:text-slate-500',
          'focus:outline-none focus:border-slate-500',
          'resize-none overflow-y-auto',
          'font-mono text-sm'
        )}
        rows={1}
      />
      <Button
        type="submit"
        disabled={isStreaming || !debouncedInput.trim()}
        className={cn(
          'h-11 px-4',
          'bg-blue-600 hover:bg-blue-700',
          'border-2 border-blue-400',
          'text-white',
          'rounded-sm',
          'font-mono text-sm font-semibold'
        )}
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
