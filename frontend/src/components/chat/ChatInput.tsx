import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { 
  PaperAirplaneIcon, 
  PaperClipIcon, 
  MicrophoneIcon,
  StopIcon 
} from '@heroicons/react/24/outline';

export function ChatInput() {
  const { sendMessage, isLoading, currentSession } = useChat();
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading || !currentSession) return;

    const messageToSend = message.trim();
    setMessage('');
    
    await sendMessage(messageToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileUpload = () => {
    // TODO: Implement file upload
    console.log('File upload clicked');
  };

  const toggleRecording = () => {
    if (isRecording) {
      // TODO: Stop recording and process audio
      setIsRecording(false);
    } else {
      // TODO: Start recording
      setIsRecording(true);
    }
  };

  const isDisabled = isLoading || !currentSession;

  return (
    <div className="border-t border-border bg-background">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-2 sm:gap-3">
            {/* File upload button - Hidden on mobile to save space */}
            <button
              type="button"
              onClick={handleFileUpload}
              disabled={isDisabled}
              className="hidden sm:flex flex-shrink-0 p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Attach file"
            >
              <PaperClipIcon className="w-5 h-5" />
            </button>

            {/* Message input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  currentSession 
                    ? "Type your message..." 
                    : "Start a new chat to begin"
                }
                disabled={isDisabled}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 border border-border rounded-lg sm:rounded-xl resize-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />

              {/* Voice input button - Hidden on mobile */}
              <button
                type="button"
                onClick={toggleRecording}
                disabled={isDisabled}
                className={`hidden sm:block absolute right-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-lg transition-colors ${
                  isRecording 
                    ? 'text-destructive bg-destructive/10 hover:bg-destructive/20' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isRecording ? "Stop recording" : "Voice input"}
              >
                {isRecording ? (
                  <StopIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <MicrophoneIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>

            {/* Send button */}
            <button
              type="submit"
              disabled={isDisabled || !message.trim()}
              className="flex-shrink-0 p-2 sm:p-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Send message"
            >
              <PaperAirplaneIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Character count */}
          {message.length > 500 && (
            <div className="text-xs text-gray-500 mt-2 text-right">
              {message.length} / 2000 characters
            </div>
          )}
        </form>

        {/* Quick actions - Scrollable on mobile */}
        <div className="flex items-center gap-2 mt-2 sm:mt-3 overflow-x-auto scrollbar-hide">
          <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">Quick:</span>
          {[
            'Help me with emails',
            'Schedule a meeting',
            'Create an invoice',
            'Show integrations'
          ].map((action, index) => (
            <button
              key={index}
              onClick={() => setMessage(action)}
              disabled={isDisabled}
              className="shrink-0 px-2 py-1 text-xs bg-accent hover:bg-accent/80 text-accent-foreground rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}