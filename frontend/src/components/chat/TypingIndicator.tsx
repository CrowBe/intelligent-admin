import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

export function TypingIndicator() {
  return (
    <div className="flex gap-4 justify-start">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
          <SparklesIcon className="w-4 h-4 text-primary-foreground" />
        </div>
      </div>

      <div className="max-w-2xl">
        <div className="px-4 py-3 rounded-2xl bg-accent border border-border">
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <span>AI is typing...</span>
        </div>
      </div>
    </div>
  );
}