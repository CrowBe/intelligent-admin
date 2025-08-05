import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Types
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

interface ChatSession {
  id: string;
  title: string;
  lastMessage?: string;
  lastActivity: Date;
  messageCount: number;
  contextData?: {
    businessType?: string;
    currentTask?: string;
  };
}

interface ChatState {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
}

type ChatAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONNECTION_STATUS'; payload: 'connected' | 'connecting' | 'disconnected' }
  | { type: 'SET_CURRENT_SESSION'; payload: ChatSession }
  | { type: 'ADD_SESSION'; payload: ChatSession }
  | { type: 'UPDATE_SESSION'; payload: { id: string; updates: Partial<ChatSession> } }
  | { type: 'DELETE_SESSION'; payload: string }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<Message> } }
  | { type: 'CLEAR_MESSAGES' };

interface ChatContextType extends ChatState {
  sendMessage: (content: string) => Promise<void>;
  createSession: (title?: string) => Promise<ChatSession>;
  switchSession: (sessionId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  clearError: () => void;
  regenerateResponse: (messageId: string) => Promise<void>;
}

// Initial state
const initialState: ChatState = {
  currentSession: null,
  sessions: [],
  messages: [],
  isLoading: false,
  isTyping: false,
  error: null,
  connectionStatus: 'disconnected',
};

// Reducer
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CONNECTION_STATUS':
      return { ...state, connectionStatus: action.payload };
    case 'SET_CURRENT_SESSION':
      return { ...state, currentSession: action.payload };
    case 'ADD_SESSION':
      return {
        ...state,
        sessions: [action.payload, ...state.sessions],
        currentSession: action.payload,
      };
    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === action.payload.id
            ? { ...session, ...action.payload.updates }
            : session
        ),
        currentSession: state.currentSession?.id === action.payload.id
          ? { ...state.currentSession, ...action.payload.updates }
          : state.currentSession,
      };
    case 'DELETE_SESSION':
      const filteredSessions = state.sessions.filter(s => s.id !== action.payload);
      return {
        ...state,
        sessions: filteredSessions,
        currentSession: state.currentSession?.id === action.payload
          ? filteredSessions[0] || null
          : state.currentSession,
        messages: state.currentSession?.id === action.payload ? [] : state.messages,
      };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(message =>
          message.id === action.payload.id
            ? { ...message, ...action.payload.updates }
            : message
        ),
      };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
    default:
      return state;
  }
}

// Context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Mock data for development
  React.useEffect(() => {
    // Initialize with mock session
    const mockSession: ChatSession = {
      id: '1',
      title: 'Getting Started',
      lastMessage: 'I can help you set up email integration with Gmail. Would you like me to guide you through connecting your Gmail account?',
      lastActivity: new Date(),
      messageCount: 2,
      contextData: {
        businessType: 'plumbing',
        currentTask: 'setup',
      },
    };

    const mockMessages: Message[] = [
      {
        id: '1',
        role: 'user',
        content: 'Hi, I need help setting up my business email integration.',
        timestamp: new Date(Date.now() - 60000),
      },
      {
        id: '2',
        role: 'assistant',
        content: 'I can help you set up email integration with Gmail. Would you like me to guide you through connecting your Gmail account?',
        timestamp: new Date(),
        metadata: {
          suggestions: ['Connect Gmail', 'Learn more about integrations', 'View available features'],
        },
      },
    ];

    dispatch({ type: 'ADD_SESSION', payload: mockSession });
    dispatch({ type: 'SET_MESSAGES', payload: mockMessages });
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' });
  }, []);

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const sendMessage = useCallback(async (content: string) => {
    if (!state.currentSession) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    // Add user message immediately
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });

    try {
      // Show typing indicator
      dispatch({ type: 'SET_TYPING', payload: true });

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock assistant response
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: `I understand you need help with "${content}". Let me assist you with that. This is a mock response for development purposes.`,
        timestamp: new Date(),
        metadata: {
          suggestions: ['Tell me more', 'Show me how', 'What else can you do?'],
          processingTime: 1500,
        },
      };

      dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });
      
      // Update session
      if (state.currentSession) {
        dispatch({
          type: 'UPDATE_SESSION',
          payload: {
            id: state.currentSession.id,
            updates: {
              lastMessage: assistantMessage.content,
              lastActivity: new Date(),
              messageCount: state.messages.length + 2,
            },
          },
        });
      }
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to send message',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_TYPING', payload: false });
    }
  }, [state.currentSession, state.messages.length]);

  const createSession = useCallback(async (title = 'New Chat'): Promise<ChatSession> => {
    const newSession: ChatSession = {
      id: generateId(),
      title,
      lastActivity: new Date(),
      messageCount: 0,
    };

    dispatch({ type: 'ADD_SESSION', payload: newSession });
    dispatch({ type: 'CLEAR_MESSAGES' });

    return newSession;
  }, []);

  const switchSession = useCallback(async (sessionId: string) => {
    const session = state.sessions.find(s => s.id === sessionId);
    if (!session) return;

    dispatch({ type: 'SET_CURRENT_SESSION', payload: session });
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // TODO: Load messages for session from API
      // Mock loading messages
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (sessionId === '1') {
        // Mock messages for the default session
        const mockMessages: Message[] = [
          {
            id: '1',
            role: 'user',
            content: 'Hi, I need help setting up my business email integration.',
            timestamp: new Date(Date.now() - 60000),
          },
          {
            id: '2',
            role: 'assistant',
            content: 'I can help you set up email integration with Gmail. Would you like me to guide you through connecting your Gmail account?',
            timestamp: new Date(),
            metadata: {
              suggestions: ['Connect Gmail', 'Learn more about integrations', 'View available features'],
            },
          },
        ];
        dispatch({ type: 'SET_MESSAGES', payload: mockMessages });
      } else {
        dispatch({ type: 'SET_MESSAGES', payload: [] });
      }
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load session',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.sessions]);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      // TODO: API call to delete session
      dispatch({ type: 'DELETE_SESSION', payload: sessionId });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to delete session',
      });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const regenerateResponse = useCallback(async (messageId: string) => {
    // TODO: Implement regenerate response
    console.log('Regenerating response for message:', messageId);
  }, []);

  const value: ChatContextType = {
    ...state,
    sendMessage,
    createSession,
    switchSession,
    deleteSession,
    clearError,
    regenerateResponse,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

// Hook
export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}