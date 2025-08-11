import React, { useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { PlusIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

export function ChatInterface() {
  const { 
    currentSession, 
    connectionStatus, 
    sessions, 
    createSession, 
    switchSession, 
    deleteSession,
    isOllamaAvailable,
    ollamaModel,
    toggleLLMProvider,
    useOllama
  } = useChat();
  const [showSessionList, setShowSessionList] = useState(false);

  const handleNewChat = async () => {
    await createSession();
    setShowSessionList(false);
  };

  const handleSwitchSession = async (sessionId: string) => {
    await switchSession(sessionId);
    setShowSessionList(false);
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) return;
    
    if (confirm('Are you sure you want to delete this chat?')) {
      await deleteSession(sessionId);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header with Session Management */}
      <div className="border-b border-border bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className={`w-2 h-2 rounded-full shrink-0 ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'connecting' ? 'bg-yellow-500' : 
              'bg-red-500'
            }`} />
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">
                {currentSession?.title || 'AI Chat Session'}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground capitalize">{connectionStatus}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Ollama Toggle */}
            {isOllamaAvailable && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLLMProvider}
                className={`px-2 sm:px-3 ${useOllama ? 'bg-green-50 dark:bg-green-950 border-green-500' : ''}`}
                title={useOllama ? `Using Ollama (${ollamaModel})` : 'Using Mock API'}
              >
                <span className="hidden sm:inline">
                  {useOllama ? '🟢 Local' : '☁️ API'}
                </span>
                <span className="sm:hidden">
                  {useOllama ? '🟢' : '☁️'}
                </span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSessionList(!showSessionList)}
              className="px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Sessions</span>
              <span className="sm:hidden">📋</span>
              <span className="ml-1">({sessions.length})</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleNewChat}
              className="px-2 sm:px-3"
            >
              <PlusIcon className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">New Chat</span>
            </Button>
          </div>
        </div>

        {/* Session List Dropdown */}
        {showSessionList && (
          <div className="border-t border-border bg-background">
            <div className="p-3 sm:p-4 max-h-48 sm:max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {sessions.map((session) => (
                  <Card
                    key={session.id}
                    className={`p-3 cursor-pointer transition-colors ${
                      currentSession?.id === session.id 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => handleSwitchSession(session.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate text-sm">
                          {session.title}
                        </h4>
                        {session.lastMessage && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {session.lastMessage}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(session.lastActivity, { addSuffix: true })}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {session.messageCount} messages
                          </span>
                        </div>
                      </div>
                      
                      {sessions.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className="ml-2 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 min-h-0">
        <ChatMessages />
      </div>

      {/* Chat Input */}
      <div className="border-t border-border bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <ChatInput />
      </div>
    </div>
  );
}