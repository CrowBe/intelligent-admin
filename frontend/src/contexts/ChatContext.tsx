import React, { createContext, useContext, useReducer, useCallback, useEffect, useState } from 'react';
import { ollamaApi } from '../services/ollamaApi';
import { getContextualActions } from '../types/actions';

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
  isOllamaAvailable: boolean;
  ollamaModel: string | null;
  toggleLLMProvider: () => void;
  useOllama: boolean;
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
  const [isOllamaAvailable, setIsOllamaAvailable] = useState(false);
  const [ollamaModel, setOllamaModel] = useState<string | null>(null);
  const [useOllama, setUseOllama] = useState(() => {
    // Check localStorage for user preference
    const savedPreference = localStorage.getItem('useOllama');
    return savedPreference === 'true';
  });

  // Check Ollama availability on mount
  useEffect(() => {
    const checkOllama = async () => {
      const available = await ollamaApi.checkAvailability();
      setIsOllamaAvailable(available);
      if (available) {
        const config = ollamaApi.getConfig();
        setOllamaModel(config.model);
      }
    };
    checkOllama();
  }, []);

  // Mock data for development
  React.useEffect(() => {
    // Initialize with mock session
    const mockSession: ChatSession = {
      id: '1',
      title: 'Getting Started',
      lastMessage: useOllama && isOllamaAvailable 
        ? 'I\'m running locally via Ollama! How can I help you with your business today?'
        : 'I can help you set up email integration with Gmail. Would you like me to guide you through connecting your Gmail account?',
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
        content: useOllama && isOllamaAvailable
          ? `I'm running locally via Ollama (Model: ${ollamaModel})! I can help you set up email integration with Gmail. Would you like me to guide you through connecting your Gmail account?`
          : 'I can help you set up email integration with Gmail. Would you like me to guide you through connecting your Gmail account?',
        timestamp: new Date(),
        metadata: {
          suggestions: ['Connect Gmail', 'Learn more about integrations', 'View available features'],
        },
      },
    ];

    dispatch({ type: 'ADD_SESSION', payload: mockSession });
    dispatch({ type: 'SET_MESSAGES', payload: mockMessages });
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' });
  }, [useOllama, isOllamaAvailable, ollamaModel]);

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

      let assistantContent: string;
      let processingTime: number;
      const startTime = Date.now();

      // Use Ollama if available and enabled
      if (useOllama && isOllamaAvailable) {
        try {
          // Prepare conversation history for Ollama
          const messages = state.messages.slice(-10).map(msg => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content
          }));
          messages.push({ role: 'user', content });

          // Call Ollama API
          const response = await ollamaApi.generateChatCompletion(messages, {
            temperature: 0.7,
            // Use the default system prompt from ollamaApi which has full context
          });

          assistantContent = response.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';
          processingTime = Date.now() - startTime;
        } catch (ollamaError) {
          console.error('Ollama failed:', ollamaError);
          // Fallback to mock response if Ollama fails
          await new Promise(resolve => setTimeout(resolve, 1500));
          assistantContent = `[Ollama Error - Using Mock] I understand you need help with "${content}". Let me assist you with that.`;
          processingTime = 1500;
        }
      } else {
        // Use mock response for development (or when Ollama is not available)
        await new Promise(resolve => setTimeout(resolve, 1500));
        assistantContent = `I understand you need help with "${content}". Let me assist you with that. ${!isOllamaAvailable ? '(Ollama is not available - using mock response)' : '(Using mock response - Ollama is disabled)'}`;
        processingTime = 1500;
      }

      // Get contextual actions based on the conversation
      const contextualActions = getContextualActions(content);
      
      // Create assistant message
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        metadata: {
          suggestions: generateSuggestions(content),
          actions: contextualActions as any[], // Include contextual actions
          processingTime,
          llmProvider: useOllama && isOllamaAvailable ? 'ollama' : 'mock',
          model: useOllama && isOllamaAvailable ? ollamaModel : 'mock',
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
  }, [state.currentSession, state.messages, useOllama, isOllamaAvailable, ollamaModel]);

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

  const toggleLLMProvider = useCallback(() => {
    const newValue = !useOllama;
    setUseOllama(newValue);
    localStorage.setItem('useOllama', newValue.toString());
    
    // Show status message
    const provider = newValue && isOllamaAvailable ? 'Ollama (Local)' : 'Mock/API';
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: generateId(),
        role: 'system' as const,
        content: `Switched to ${provider} for chat responses.`,
        timestamp: new Date(),
        metadata: {},
      },
    });
  }, [useOllama, isOllamaAvailable]);

  // Helper function to generate context-aware suggestions
  const generateSuggestions = (userMessage: string): string[] => {
    const suggestions: string[] = [];
    const content = userMessage.toLowerCase();
    
    if (content.includes('email') || content.includes('gmail')) {
      suggestions.push('How do I connect my Gmail account?');
      suggestions.push('Show me email automation features');
      suggestions.push('Help with email templates');
    } else if (content.includes('invoice') || content.includes('quote')) {
      suggestions.push('Create a professional quote template');
      suggestions.push('Set up automatic invoicing');
      suggestions.push('Track payment status');
    } else if (content.includes('customer') || content.includes('client')) {
      suggestions.push('Manage customer relationships');
      suggestions.push('Set up follow-up reminders');
      suggestions.push('Import customer data');
    } else {
      suggestions.push('Tell me more');
      suggestions.push('Show me how');
      suggestions.push('What else can you do?');
    }
    
    return suggestions.slice(0, 3);
  };

  const value: ChatContextType = {
    ...state,
    sendMessage,
    createSession,
    switchSession,
    deleteSession,
    clearError,
    regenerateResponse,
    isOllamaAvailable,
    ollamaModel,
    toggleLLMProvider,
    useOllama,
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