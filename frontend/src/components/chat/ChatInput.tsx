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
    <div className="border-t border-gray-200 bg-white">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-3">
            {/* File upload button */}
            <button
              type="button"
              onClick={handleFileUpload}
              disabled={isDisabled}
              className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    ? "Ask me anything about your business..." 
                    : "Start a new chat to begin"
                }
                disabled={isDisabled}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />

              {/* Voice input button */}
              <button
                type="button"
                onClick={toggleRecording}
                disabled={isDisabled}
                className={`absolute right-2 top-2 p-2 rounded-lg transition-colors ${
                  isRecording 
                    ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isRecording ? "Stop recording" : "Voice input"}
              >
                {isRecording ? (
                  <StopIcon className="w-5 h-5" />
                ) : (
                  <MicrophoneIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Send button */}
            <button
              type="submit"
              disabled={isDisabled || !message.trim()}
              className="flex-shrink-0 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
              title="Send message"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Character count */}
          {message.length > 500 && (
            <div className="text-xs text-gray-500 mt-2 text-right">
              {message.length} / 2000 characters
            </div>
          )}
        </form>

        {/* Quick actions */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-gray-500">Quick actions:</span>
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
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}