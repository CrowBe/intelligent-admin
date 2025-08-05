// Email Intelligence API Service
// Connects frontend to backend email intelligence endpoints

import { EmailSummary } from './gmailApi';

export interface EmailAnalysisResponse {
  success: boolean;
  data: {
    totalEmails: number;
    analyzedEmails: Array<EmailSummary & {
      analysis: {
        id: string;
        priority: 'urgent' | 'high' | 'medium' | 'low';
        category: 'urgent' | 'standard' | 'follow-up' | 'admin' | 'spam';
        urgencyScore: number;
        actionRequired: boolean;
        suggestedActions: string[];
        reasoning: string;
        businessRelevance: number;
        sentiment: 'positive' | 'neutral' | 'negative';
      };
    }>;
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

export interface DigestResponse {
  success: boolean;
  data: {
    generatedAt: string;
    dateRange: {
      from: string;
      to: string;
    };
    summary: {
      totalEmails: number;
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
    urgentEmails: any[];
    highPriorityEmails: any[];
    actionRequiredEmails: any[];
    businessInsights: string[];
    recommendations: string[];
  };
}

export interface UserEmailPreferences {
  userId: string;
  urgentKeywords: string[];
  businessKeywords: string[];
  spamKeywords: string[];
  priorityRules: {
    fromAddresses: { email: string; priority: 'urgent' | 'high' | 'medium' | 'low' }[];
    subjectPatterns: { pattern: string; priority: 'urgent' | 'high' | 'medium' | 'low' }[];
  };
  digestSettings: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'on-demand';
    timeOfDay: string;
    includeWeekends: boolean;
  };
  analysisSettings: {
    enableSentimentAnalysis: boolean;
    enableBusinessRelevanceScoring: boolean;
    enableActionSuggestions: boolean;
    strictSpamFiltering: boolean;
  };
}

class EmailIntelligenceApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  }

  private async getAuthHeaders(getToken?: () => Promise<string | null>): Promise<HeadersInit> {
    // Get the auth token from Kinde auth context
    let token = '';
    if (getToken) {
      token = await getToken() || '';
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Analyze emails using backend AI service
   */
  async analyzeEmails(emails: EmailSummary[], preferences?: UserEmailPreferences, getToken?: () => Promise<string | null>): Promise<EmailAnalysisResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/emails/analyze`, {
        method: 'POST',
        headers: await this.getAuthHeaders(getToken),
        body: JSON.stringify({
          emails: emails.map(email => ({
            id: email.id,
            subject: email.subject,
            from: email.from,
            snippet: email.snippet,
            date: email.date.toISOString(),
            isRead: false // Default value since Gmail API doesn't always provide this
          })),
          preferences
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to analyze emails:', error);
      throw error;
    }
  }

  /**
   * Generate morning digest using backend service
   */
  async generateDigest(
    emails: EmailSummary[], 
    dateRange?: { from: Date; to: Date },
    preferences?: UserEmailPreferences,
    getToken?: () => Promise<string | null>
  ): Promise<DigestResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/emails/digest`, {
        method: 'POST',
        headers: await this.getAuthHeaders(getToken),
        body: JSON.stringify({
          emails: emails.map(email => ({
            id: email.id,
            subject: email.subject,
            from: email.from,
            snippet: email.snippet,
            date: email.date.toISOString(),
            isRead: false
          })),
          dateRange: dateRange ? {
            from: dateRange.from.toISOString(),
            to: dateRange.to.toISOString()
          } : undefined,
          preferences
        }),
      });

      if (!response.ok) {
        throw new Error(`Digest generation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to generate digest:', error);
      throw error;
    }
  }

  /**
   * Get user's email preferences
   */
  async getPreferences(getToken?: () => Promise<string | null>): Promise<{ success: boolean; data: UserEmailPreferences }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/emails/preferences`, {
        method: 'GET',
        headers: await this.getAuthHeaders(getToken),
      });

      if (!response.ok) {
        throw new Error(`Failed to get preferences: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get preferences:', error);
      throw error;
    }
  }

  /**
   * Update user's email preferences
   */
  async updatePreferences(preferences: Partial<UserEmailPreferences>, getToken?: () => Promise<string | null>): Promise<{ success: boolean; data: UserEmailPreferences }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/emails/preferences`, {
        method: 'PUT',
        headers: await this.getAuthHeaders(getToken),
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error(`Failed to update preferences: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  }
}

export const emailIntelligenceApi = new EmailIntelligenceApiService();