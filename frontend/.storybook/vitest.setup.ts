import { setProjectAnnotations } from '@storybook/react-vite';
import * as projectAnnotations from './preview.tsx';
import { vi } from 'vitest';

// Mock the ChatContext to prevent "useChat must be used within a ChatProvider" errors
vi.mock('../src/contexts/ChatContext', () => ({
  useChat: () => ({
    currentSession: null,
    sessions: [],
    messages: [],
    isLoading: false,
    isTyping: false,
    error: null,
    connectionStatus: 'connected',
    regenerateResponse: vi.fn((id: string) => {
      console.log('Mock regenerate response for:', id);
    }),
    sendMessage: vi.fn((message: string) => {
      console.log('Mock send message:', message);
    }),
    clearMessages: vi.fn(() => {
      console.log('Mock clear messages');
    }),
  }),
  ChatProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
setProjectAnnotations([projectAnnotations]);