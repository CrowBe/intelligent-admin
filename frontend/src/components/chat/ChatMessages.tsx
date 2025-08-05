import React, { useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

export function ChatMessages() {
  const { messages, isTyping, currentSession } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  if (!currentSession) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <ChatBubbleLeftIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Welcome to your AI Assistant
          </h3>
          <p className="text-gray-500 max-w-sm">
            Start a conversation to get help with your business administration tasks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <ChatBubbleLeftIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Start a conversation
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Ask me anything about managing your business, integrating with your tools, or automating your workflows.
            </p>
            
            {/* Suggested prompts */}
            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-3">Try asking:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  'Help me organize my emails',
                  'Schedule a follow-up call',
                  'Show me today\'s appointments',
                  'Create an invoice template'
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {isTyping && <TypingIndicator />}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}