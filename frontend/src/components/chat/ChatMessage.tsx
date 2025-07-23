import React from 'react';
import { format } from 'date-fns';
import { useChat } from '../../contexts/ChatContext';
import { 
  UserIcon, 
  SparklesIcon, 
  ClipboardDocumentIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    suggestions?: string[];
    actions?: string[];
    tokenCount?: number;
    processingTime?: number;
  };
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { regenerateResponse } = useChat();

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
  };

  const handleRegenerate = () => {
    regenerateResponse(message.id);
  };

  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <SparklesIcon className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      <div className={`max-w-2xl ${isUser ? 'order-first' : ''}`}>
        <div className={`
          px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${isUser 
            ? 'message-user' 
            : isSystem 
            ? 'message-system' 
            : 'message-assistant'
          }
        `}>
          {/* Message content */}
          <div className="whitespace-pre-wrap">
            {message.content}
          </div>

          {/* Suggestions */}
          {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-2">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {message.metadata.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Message footer */}
        <div className={`flex items-center gap-2 mt-2 text-xs text-gray-500 ${
          isUser ? 'justify-end' : 'justify-start'
        }`}>
          <span>{format(message.timestamp, 'HH:mm')}</span>
          
          {message.metadata?.processingTime && (
            <span>• {message.metadata.processingTime}ms</span>
          )}

          {/* Message actions */}
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={handleCopyMessage}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Copy message"
            >
              <ClipboardDocumentIcon className="w-3 h-3" />
            </button>

            {!isUser && (
              <button
                onClick={handleRegenerate}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Regenerate response"
              >
                <ArrowPathIcon className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
    </div>
  );
}