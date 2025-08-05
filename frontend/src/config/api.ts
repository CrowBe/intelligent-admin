// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me'
  },
  chat: {
    sessions: '/chat/sessions',
    messages: '/chat/messages',
    stream: '/chat/stream'
  },
  documents: {
    base: '/documents',
    upload: '/documents/upload',
    search: '/documents/search'
  },
  email: {
    analyze: '/emails/analyze',
    connect: '/emails/connect'
  },
  industry: {
    knowledge: '/industry/knowledge'
  }
} as const;

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
} as const;

export const createApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};