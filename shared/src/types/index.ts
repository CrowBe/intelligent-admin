/**
 * Shared TypeScript Types
 * Common types used across frontend and backend
 */

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Email Intelligence Types
export interface EmailAnalysis {
  urgencyScore: number;
  category: 'urgent' | 'standard' | 'follow_up' | 'admin' | 'spam';
  businessRelevance: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  actionRequired: boolean;
  suggestedActions: string[];
  reasoning: string;
}

export interface EmailMessage {
  id: string;
  threadId?: string;
  subject: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  body: string;
  snippet: string;
  date: Date;
  isRead: boolean;
  isImportant: boolean;
  labels: string[];
  analysis?: EmailAnalysis;
}

export interface MorningDigest {
  id: string;
  userId: string;
  date: Date;
  summary: string;
  urgentEmails: number;
  totalEmails: number;
  keyActions: string[];
  createdAt: Date;
}

// Chat and AI Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    processingTime?: number;
    tokens?: number;
  };
}

export interface ChatConversation {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Business Context Types
export interface BusinessContext {
  id: string;
  userId: string;
  businessName: string;
  businessType: string;
  industry: string;
  location: string;
  specialties: string[];
  workingHours: string;
  preferences: {
    urgencyThreshold: number;
    autoRespond: boolean;
    digestFrequency: 'daily' | 'weekly';
  };
  createdAt: Date;
  updatedAt: Date;
}

// Industry Knowledge Types
export interface IndustryStandard {
  id: string;
  title: string;
  description: string;
  category: string;
  industry: string;
  complianceLevel: 'mandatory' | 'recommended' | 'optional';
  source: string;
  lastUpdated: Date;
}

// Integration Types
export interface Integration {
  id: string;
  userId: string;
  type: 'gmail' | 'calendar' | 'hubspot' | 'other';
  status: 'connected' | 'disconnected' | 'error';
  credentials?: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
  };
  settings: Record<string, any>;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// File Upload Types
export interface UploadedFile {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  path: string;
  uploadedAt: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'email' | 'urgent' | 'system' | 'integration';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
}

// Utility Types
export type Status = 'pending' | 'processing' | 'completed' | 'failed';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// Environment Types
export interface EnvironmentConfig {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  apiBaseUrl: string;
  frontendUrl: string;
  databaseUrl: string;
}