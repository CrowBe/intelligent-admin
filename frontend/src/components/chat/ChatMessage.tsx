import React from 'react';
import { format } from 'date-fns';
import { useChat } from '../../contexts/ChatContext';
import { Button } from '../ui/Button';
import { 
  UserIcon, 
  SparklesIcon, 
  ClipboardDocumentIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import { parseActionTokens, ApplicationAction } from '../../types/actions';
import { ActionButton } from './ActionButton';

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
  
  // Parse action tokens from assistant messages
  const { cleanText, actions } = React.useMemo(() => {
    if (message.role === 'assistant' && message.content) {
      return parseActionTokens(message.content);
    }
    return { cleanText: message.content, actions: [] };
  }, [message.content, message.role]);
  
  // Extract structured actions from metadata
  const structuredActions = React.useMemo(() => {
    if (message.metadata?.actions) {
      return message.metadata.actions as unknown as ApplicationAction[];
    }
    return [];
  }, [message.metadata]);
  
  // Render content with inline action buttons
  const renderContent = () => {
    if (message.role !== 'assistant' || actions.length === 0) {
      return <div className="whitespace-pre-wrap">{message.content}</div>;
    }
    
    // Split content and insert action buttons
    const parts = cleanText.split(/\[([^\]]+)\]/);
    let actionIndex = 0;
    
    return (
      <div className="whitespace-pre-wrap">
        {parts.map((part, index) => {
          // Even indices are text, odd indices are action placeholders
          if (index % 2 === 0) {
            return <span key={index}>{part}</span>;
          } else if (actionIndex < actions.length) {
            const action = actions[actionIndex++];
            return (
              <ActionButton
                key={index}
                action={action}
                variant="inline"
                onActionExecuted={(action) => {
                  console.log('Action executed from chat:', action);
                }}
              />
            );
          }
          return <span key={index}>[{part}]</span>;
        })}
      </div>
    );
  };

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
          {renderContent()}

          {/* Structured Action Cards */}
          {structuredActions.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground mb-2">Quick Actions:</p>
              {structuredActions.map((action, index) => (
                <ActionButton
                  key={index}
                  action={action}
                  variant="card"
                  onActionExecuted={(action) => {
                    console.log('Structured action executed:', action);
                  }}
                />
              ))}
            </div>
          )}
          
          {/* Suggestions */}
          {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {message.metadata.suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Message footer */}
        <div className={`flex items-center gap-2 mt-2 text-xs text-muted-foreground ${
          isUser ? 'justify-end' : 'justify-start'
        }`}>
          <span>{format(message.timestamp, 'HH:mm')}</span>
          
          {message.metadata?.processingTime && (
            <span>• {message.metadata.processingTime}ms</span>
          )}

          {/* Message actions */}
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyMessage}
              className="h-5 w-5 p-0"
              title="Copy message"
            >
              <ClipboardDocumentIcon className="w-3 h-3" />
            </Button>

            {!isUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerate}
                className="h-5 w-5 p-0"
                title="Regenerate response"
              >
                <ArrowPathIcon className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}