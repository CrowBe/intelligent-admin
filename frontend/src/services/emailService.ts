// Email Intelligence Service
// Provides API integration for email analysis and management

import { api } from './api';

export interface EmailSummary {
  id: string;
  from: string;
  subject: string;
  urgency: 'high' | 'medium' | 'low';
  preview: string;
  timestamp: string;
  analysis?: EmailAnalysis;
}

export interface EmailAnalysis {
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: 'urgent' | 'standard' | 'follow-up' | 'admin' | 'spam';
  urgencyScore: number;
  businessRelevance: number;
  actionRequired: boolean;
  estimatedReadTime: number;
  keywords: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  suggestedActions: string[];
  reasoning: string;
}

export interface EmailAnalysisResponse {
  success: boolean;
  data: {
    totalEmails: number;
    analyzedEmails: EmailSummary[];
    summary: {
      urgentCount: number;
      highPriorityCount: number;
      actionRequiredCount: number;
      categoryCounts: {
        urgent: number;
        standard: number;
        followUp: number;
        admin: number;
        spam: number;
      };
    };
  };
}

class EmailService {
  /**
   * Fetch and analyze recent emails
   */
  async fetchEmailAnalysis(limit = 20): Promise<EmailSummary[]> {
    try {
      // In a real implementation, this would call the backend email API
      // For now, we'll return mock data that will be replaced with real API calls
      const response = await api.get(`/emails/analyses/current-user?limit=${limit}`);

      if (response.analyses) {
        return response.analyses.map((analysis: any) => ({
          id: analysis.emailId,
          from: analysis.from || 'Unknown Sender',
          subject: analysis.subject,
          urgency: this.mapPriorityToUrgency(analysis.priority),
          preview: analysis.snippet || '',
          timestamp: analysis.analyzedAt || new Date().toISOString(),
          analysis: {
            priority: analysis.priority,
            category: analysis.category,
            urgencyScore: analysis.urgencyScore || 0,
            businessRelevance: analysis.businessRelevance || 0,
            actionRequired: analysis.actionRequired || false,
            estimatedReadTime: analysis.estimatedReadTime || 1,
            keywords: analysis.keywords || [],
            sentiment: analysis.sentiment || 'neutral',
            suggestedActions: analysis.suggestedActions || [],
            reasoning: analysis.reasoning || ''
          }
        }));
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch email analysis:', error);
      // Return empty array on error - hook will handle error state
      throw error;
    }
  }

  /**
   * Analyze a specific email
   */
  async analyzeEmail(emailId: string): Promise<EmailAnalysis> {
    try {
      const response = await api.post('/emails/analyze', { emailId });
      return response.analysis;
    } catch (error) {
      console.error('Failed to analyze email:', error);
      throw error;
    }
  }

  /**
   * Get urgent emails for the current user
   */
  async getUrgentEmails(): Promise<EmailSummary[]> {
    try {
      const response = await api.get('/emails/urgent/current-user');

      if (response.urgentEmails) {
        return response.urgentEmails.map((email: any) => ({
          id: email.emailId,
          from: email.from || 'Unknown Sender',
          subject: email.subject,
          urgency: 'high' as const,
          preview: email.snippet || '',
          timestamp: email.analyzedAt || new Date().toISOString()
        }));
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch urgent emails:', error);
      throw error;
    }
  }

  /**
   * Get email statistics
   */
  async getEmailStats(userId: string): Promise<any> {
    try {
      const response = await api.get(`/emails/stats/${userId}`);
      return response.stats;
    } catch (error) {
      console.error('Failed to fetch email stats:', error);
      throw error;
    }
  }

  /**
   * Map backend priority to frontend urgency
   */
  private mapPriorityToUrgency(priority: string): 'high' | 'medium' | 'low' {
    switch (priority) {
      case 'urgent':
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
      default:
        return 'low';
    }
  }
}

export const emailService = new EmailService();
