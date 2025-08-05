// Email Intelligence Service
// Backend service for analyzing emails and generating insights
import { ollamaService } from './ollamaService.js';
import { logger } from '../utils/logger.js';

export interface EmailSummary {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  date: Date;
  isRead: boolean;
}

export interface EmailAnalysis {
  id: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: 'urgent' | 'standard' | 'follow-up' | 'admin' | 'spam';
  urgencyScore: number; // 0-100
  actionRequired: boolean;
  suggestedActions: string[];
  reasoning: string;
  businessRelevance: number; // 0-100
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface MorningDigest {
  generatedAt: Date;
  dateRange: {
    from: Date;
    to: Date;
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
  urgentEmails: Array<EmailSummary & { analysis: EmailAnalysis }>;
  highPriorityEmails: Array<EmailSummary & { analysis: EmailAnalysis }>;
  actionRequiredEmails: Array<EmailSummary & { analysis: EmailAnalysis }>;
  businessInsights: string[];
  recommendations: string[];
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
    timeOfDay: string; // "09:00"
    includeWeekends: boolean;
  };
  analysisSettings: {
    enableSentimentAnalysis: boolean;
    enableBusinessRelevanceScoring: boolean;
    enableActionSuggestions: boolean;
    strictSpamFiltering: boolean;
  };
}

// Trade business specific keywords for Australian market
const TRADE_URGENT_KEYWORDS = [
  'emergency', 'urgent', 'asap', 'breakdown', 'leak', 'flooding',
  'no power', 'electrical fault', 'gas leak', 'heating failure',
  'air con not working', 'plumbing emergency', 'blocked drain',
  'sparking', 'short circuit', 'fuse blown', 'hot water failure'
];

const TRADE_BUSINESS_KEYWORDS = [
  'quote', 'estimate', 'invoice', 'payment', 'service', 'repair',
  'maintenance', 'installation', 'inspection', 'certification',
  'compliance', 'warranty', 'guarantee', 'schedule', 'booking',
  'site visit', 'materials', 'labour', 'gsf', 'abn'
];

const GENERAL_URGENT_KEYWORDS = [
  'urgent', 'asap', 'emergency', 'critical', 'immediate', 'priority',
  'deadline', 'overdue', 'final notice', 'action required'
];

export class EmailIntelligenceService {
  
  /**
   * Analyze a batch of emails and return analysis results
   */
  static async analyzeEmails(emails: EmailSummary[], preferences?: UserEmailPreferences): Promise<Array<EmailSummary & { analysis: EmailAnalysis }>> {
    const results = [];
    
    for (const email of emails) {
      const analysis = await this.analyzeEmail(email, preferences);
      results.push({ ...email, analysis });
    }
    
    return results;
  }

  /**
   * Analyze a single email and determine priority, category, and insights
   */
  private static async analyzeEmail(email: EmailSummary, preferences?: UserEmailPreferences): Promise<EmailAnalysis> {
    const content = `${email.subject} ${email.snippet}`;
    
    // Try Ollama AI analysis first if available
    if (ollamaService.getAvailability()) {
      try {
        const aiAnalysis = await ollamaService.analyzeEmailContent(content);
        
        // Combine AI analysis with rule-based enhancements
        const enhancedAnalysis = this.enhanceAIAnalysis(aiAnalysis, email, preferences);
        
        logger.info('Email analyzed using Ollama AI', {
          emailId: email.id,
          urgencyScore: enhancedAnalysis.urgencyScore,
          category: enhancedAnalysis.category
        });
        
        return enhancedAnalysis;
      } catch (error) {
        logger.warn('Ollama analysis failed, falling back to rule-based:', error);
      }
    }
    
    // Fallback to rule-based analysis
    return this.ruleBasedAnalysis(email, preferences);
  }
  
  /**
   * Enhanced AI analysis with rule-based improvements
   */
  private static enhanceAIAnalysis(
    aiAnalysis: any, 
    email: EmailSummary, 
    preferences?: UserEmailPreferences
  ): EmailAnalysis {
    const content = `${email.subject} ${email.snippet}`.toLowerCase();
    
    // Apply user preferences to AI analysis
    let adjustedUrgencyScore = aiAnalysis.urgencyScore;
    
    // Check sender priority rules
    const fromRule = preferences?.priorityRules?.fromAddresses?.find(
      rule => rule.email.toLowerCase() === email.from.toLowerCase()
    );
    if (fromRule) {
      switch (fromRule.priority) {
        case 'urgent': adjustedUrgencyScore = Math.max(adjustedUrgencyScore, 80); break;
        case 'high': adjustedUrgencyScore = Math.max(adjustedUrgencyScore, 60); break;
        case 'medium': adjustedUrgencyScore = Math.max(adjustedUrgencyScore, 40); break;
        case 'low': adjustedUrgencyScore = Math.min(adjustedUrgencyScore, 30); break;
      }
    }
    
    // Custom urgent keywords from user preferences
    preferences?.urgentKeywords?.forEach(keyword => {
      if (content.includes(keyword.toLowerCase())) {
        adjustedUrgencyScore = Math.max(adjustedUrgencyScore, 75);
      }
    });
    
    // Determine priority based on adjusted urgency score
    const priority = this.determinePriority(adjustedUrgencyScore, email, preferences);
    
    return {
      id: email.id,
      priority,
      category: aiAnalysis.category,
      urgencyScore: adjustedUrgencyScore,
      actionRequired: aiAnalysis.actionRequired,
      suggestedActions: aiAnalysis.suggestedActions || [],
      reasoning: aiAnalysis.reasoning,
      businessRelevance: aiAnalysis.businessRelevance,
      sentiment: aiAnalysis.sentiment
    };
  }
  
  /**
   * Rule-based analysis fallback
   */
  private static ruleBasedAnalysis(email: EmailSummary, preferences?: UserEmailPreferences): EmailAnalysis {
    const content = `${email.subject} ${email.snippet}`.toLowerCase();
    
    // Calculate urgency score
    const urgencyScore = this.calculateUrgencyScore(content, email, preferences);
    
    // Determine priority based on urgency score
    const priority = this.determinePriority(urgencyScore, email, preferences);
    
    // Categorize email
    const category = this.categorizeEmail(content, email, preferences);
    
    // Check if action is required
    const actionRequired = this.requiresAction(content, email, preferences);
    
    // Generate suggested actions
    const suggestedActions = this.generateSuggestedActions(content, email, category, actionRequired);
    
    // Calculate business relevance
    const businessRelevance = this.calculateBusinessRelevance(content, preferences);
    
    // Determine sentiment
    const sentiment = this.analyzeSentiment(content);
    
    // Generate reasoning
    const reasoning = this.generateReasoning(urgencyScore, category, actionRequired, businessRelevance);

    return {
      id: email.id,
      priority,
      category,
      urgencyScore,
      actionRequired,
      suggestedActions,
      reasoning,
      businessRelevance,
      sentiment
    };
  }

  /**
   * Calculate urgency score (0-100) based on content analysis
   */
  private static calculateUrgencyScore(content: string, email: EmailSummary, preferences?: UserEmailPreferences): number {
    let score = 0;
    
    // Check for urgent keywords
    GENERAL_URGENT_KEYWORDS.forEach(keyword => {
      if (content.includes(keyword)) {
        score += 15;
      }
    });
    
    // Trade-specific urgent keywords get higher score
    TRADE_URGENT_KEYWORDS.forEach(keyword => {
      if (content.includes(keyword)) {
        score += 25;
      }
    });
    
    // Custom urgent keywords from user preferences
    preferences?.urgentKeywords?.forEach(keyword => {
      if (content.includes(keyword.toLowerCase())) {
        score += 20;
      }
    });
    
    // Check sender priority rules
    const fromRule = preferences?.priorityRules?.fromAddresses?.find(
      rule => rule.email.toLowerCase() === email.from.toLowerCase()
    );
    if (fromRule) {
      switch (fromRule.priority) {
        case 'urgent': score += 30; break;
        case 'high': score += 20; break;
        case 'medium': score += 10; break;
        case 'low': score -= 10; break;
      }
    }
    
    // Recent emails (last 2 hours) get slight urgency boost
    const hoursSinceReceived = (Date.now() - email.date.getTime()) / (1000 * 60 * 60);
    if (hoursSinceReceived <= 2) {
      score += 5;
    }
    
    // Unread emails get slight urgency boost
    if (!email.isRead) {
      score += 5;
    }
    
    // Cap at 100
    return Math.min(score, 100);
  }

  /**
   * Determine priority level based on urgency score and other factors
   */
  private static determinePriority(urgencyScore: number, email: EmailSummary, preferences?: UserEmailPreferences): 'urgent' | 'high' | 'medium' | 'low' {
    if (urgencyScore >= 70) return 'urgent';
    if (urgencyScore >= 50) return 'high';
    if (urgencyScore >= 25) return 'medium';
    return 'low';
  }

  /**
   * Categorize email based on content and context
   */
  private static categorizeEmail(content: string, email: EmailSummary, preferences?: UserEmailPreferences): 'urgent' | 'standard' | 'follow-up' | 'admin' | 'spam' {
    // Check for spam indicators
    if (this.isSpam(content, email, preferences)) {
      return 'spam';
    }
    
    // Check for urgent keywords
    if (TRADE_URGENT_KEYWORDS.some(keyword => content.includes(keyword)) ||
        GENERAL_URGENT_KEYWORDS.some(keyword => content.includes(keyword))) {
      return 'urgent';
    }
    
    // Check for follow-up indicators
    if (content.includes('follow up') || content.includes('following up') ||
        content.includes('checking in') || content.includes('any update') ||
        content.includes('status update') || email.subject.toLowerCase().includes('re:')) {
      return 'follow-up';
    }
    
    // Check for admin/system emails
    if (content.includes('invoice') || content.includes('receipt') ||
        content.includes('statement') || content.includes('notification') ||
        content.includes('system') || content.includes('automated')) {
      return 'admin';
    }
    
    return 'standard';
  }

  /**
   * Check if email requires action from the user
   */
  private static requiresAction(content: string, email: EmailSummary, preferences?: UserEmailPreferences): boolean {
    const actionKeywords = [
      'please', 'can you', 'could you', 'need you to', 'required',
      'action required', 'respond', 'reply', 'confirm', 'approve',
      'review', 'sign', 'complete', 'provide', 'send', 'submit'
    ];
    
    return actionKeywords.some(keyword => content.includes(keyword));
  }

  /**
   * Generate suggested actions based on email content
   */
  private static generateSuggestedActions(content: string, email: EmailSummary, category: string, actionRequired: boolean): string[] {
    const actions: string[] = [];
    
    if (category === 'urgent') {
      actions.push('Review immediately');
      actions.push('Contact customer if needed');
    }
    
    if (actionRequired) {
      actions.push('Respond to email');
    }
    
    if (content.includes('quote') || content.includes('estimate')) {
      actions.push('Prepare quote/estimate');
      actions.push('Schedule site visit if needed');
    }
    
    if (content.includes('invoice') || content.includes('payment')) {
      actions.push('Process payment');
      actions.push('Update accounting records');
    }
    
    if (content.includes('schedule') || content.includes('booking')) {
      actions.push('Check calendar availability');
      actions.push('Confirm appointment');
    }
    
    if (category === 'follow-up') {
      actions.push('Provide status update');
    }
    
    return actions.slice(0, 3); // Limit to 3 suggestions
  }

  /**
   * Calculate business relevance score (0-100)
   */
  private static calculateBusinessRelevance(content: string, preferences?: UserEmailPreferences): number {
    let score = 50; // Start with neutral relevance
    
    // Trade business keywords increase relevance
    TRADE_BUSINESS_KEYWORDS.forEach(keyword => {
      if (content.includes(keyword)) {
        score += 10;
      }
    });
    
    // Custom business keywords from preferences
    preferences?.businessKeywords?.forEach(keyword => {
      if (content.includes(keyword.toLowerCase())) {
        score += 15;
      }
    });
    
    return Math.min(score, 100);
  }

  /**
   * Analyze sentiment of email content
   */
  private static analyzeSentiment(content: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['thank', 'great', 'excellent', 'satisfied', 'happy', 'pleased', 'good'];
    const negativeWords = ['problem', 'issue', 'complaint', 'unhappy', 'dissatisfied', 'poor', 'bad', 'terrible'];
    
    const positiveCount = positiveWords.filter(word => content.includes(word)).length;
    const negativeCount = negativeWords.filter(word => content.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Check if email appears to be spam
   */
  private static isSpam(content: string, email: EmailSummary, preferences?: UserEmailPreferences): boolean {
    const spamKeywords = [
      'congratulations you won', 'click here now', 'limited time offer',
      'act now', 'free money', 'make money fast', 'work from home',
      'guarantee', 'no obligation', 'risk free'
    ];
    
    // Check built-in spam keywords
    if (spamKeywords.some(keyword => content.includes(keyword))) {
      return true;
    }
    
    // Check custom spam keywords
    if (preferences?.spamKeywords?.some(keyword => content.includes(keyword.toLowerCase()))) {
      return true;
    }
    
    return false;
  }

  /**
   * Generate human-readable reasoning for the analysis
   */
  private static generateReasoning(urgencyScore: number, category: string, actionRequired: boolean, businessRelevance: number): string {
    const reasons: string[] = [];
    
    if (urgencyScore >= 70) {
      reasons.push('Contains urgent keywords or emergency indicators');
    } else if (urgencyScore >= 50) {
      reasons.push('Shows high priority indicators');
    }
    
    if (category === 'urgent') {
      reasons.push('Categorized as urgent due to emergency or critical keywords');
    }
    
    if (actionRequired) {
      reasons.push('Requires action or response from recipient');
    }
    
    if (businessRelevance >= 70) {
      reasons.push('High business relevance with trade-specific content');
    }
    
    if (reasons.length === 0) {
      reasons.push('Standard email with normal priority');
    }
    
    return reasons.join('. ') + '.';
  }

  /**
   * Generate morning digest from analyzed emails
   */
  static async generateMorningDigest(
    analyzedEmails: Array<EmailSummary & { analysis: EmailAnalysis }>,
    dateRange: { from: Date; to: Date },
    userContext?: any
  ): Promise<MorningDigest> {
    // Calculate summary statistics
    const summary = {
      totalEmails: analyzedEmails.length,
      urgentCount: analyzedEmails.filter(e => e.analysis.priority === 'urgent').length,
      highPriorityCount: analyzedEmails.filter(e => e.analysis.priority === 'high').length,
      actionRequiredCount: analyzedEmails.filter(e => e.analysis.actionRequired).length,
      categoryCounts: {
        urgent: analyzedEmails.filter(e => e.analysis.category === 'urgent').length,
        standard: analyzedEmails.filter(e => e.analysis.category === 'standard').length,
        followUp: analyzedEmails.filter(e => e.analysis.category === 'follow-up').length,
        admin: analyzedEmails.filter(e => e.analysis.category === 'admin').length,
        spam: analyzedEmails.filter(e => e.analysis.category === 'spam').length,
      }
    };

    // Filter emails by priority
    const urgentEmails = analyzedEmails
      .filter(e => e.analysis.priority === 'urgent')
      .sort((a, b) => b.analysis.urgencyScore - a.analysis.urgencyScore)
      .slice(0, 5);

    const highPriorityEmails = analyzedEmails
      .filter(e => e.analysis.priority === 'high')
      .sort((a, b) => b.analysis.urgencyScore - a.analysis.urgencyScore)
      .slice(0, 8);

    const actionRequiredEmails = analyzedEmails
      .filter(e => e.analysis.actionRequired)
      .sort((a, b) => b.analysis.urgencyScore - a.analysis.urgencyScore)
      .slice(0, 10);

    // Generate business insights and recommendations
    const businessInsights = await this.generateBusinessInsights(summary, analyzedEmails, userContext);
    const recommendations = await this.generateRecommendations(summary, analyzedEmails, userContext);

    return {
      generatedAt: new Date(),
      dateRange,
      summary,
      urgentEmails,
      highPriorityEmails,
      actionRequiredEmails,
      businessInsights,
      recommendations
    };
  }

  /**
   * Generate business insights from email analysis
   */
  private static async generateBusinessInsights(
    summary: any, 
    emails: Array<EmailSummary & { analysis: EmailAnalysis }>,
    userContext?: any
  ): Promise<string[]> {
    // Try Ollama AI insights first
    if (ollamaService.getAvailability()) {
      try {
        const emailSummaries = emails.slice(0, 15).map(email => ({
          subject: email.subject,
          snippet: email.snippet,
          priority: email.analysis.priority
        }));
        
        const aiDigest = await ollamaService.generateMorningDigest(emailSummaries, userContext);
        
        // Extract insights from AI digest
        const lines = aiDigest.split('\n').filter(line => line.trim());
        const insights = lines
          .filter(line => line.includes('insight') || line.includes('pattern') || line.includes('trend'))
          .slice(0, 3);
          
        if (insights.length > 0) {
          return insights.map(insight => `🤖 ${insight.replace(/^[•\-*]\s*/, '')}`);
        }
      } catch (error) {
        logger.warn('AI insights generation failed, using rule-based:', error);
      }
    }
    
    // Fallback to rule-based insights
    const insights: string[] = [];

    // Email volume insights
    if (summary.totalEmails > 30) {
      insights.push(`📈 High email volume (${summary.totalEmails} emails). Consider email management strategies.`);
    } else if (summary.totalEmails < 5) {
      insights.push(`📉 Low email volume (${summary.totalEmails} emails). Good inbox management!`);
    }

    // Business engagement insights
    const businessEmails = emails.filter(e => e.analysis.businessRelevance >= 70);
    if (businessEmails.length > summary.totalEmails * 0.7) {
      insights.push(`💼 High business engagement (${Math.round(businessEmails.length / summary.totalEmails * 100)}% business-related emails).`);
    }

    // Customer sentiment insights
    const positiveEmails = emails.filter(e => e.analysis.sentiment === 'positive');
    if (positiveEmails.length > summary.totalEmails * 0.3) {
      insights.push(`😊 Positive customer sentiment detected in ${positiveEmails.length} emails.`);
    }

    return insights.length > 0 ? insights : ['📊 Email patterns look normal for your business.'];
  }

  /**
   * Generate actionable recommendations
   */
  private static async generateRecommendations(
    summary: any, 
    emails: Array<EmailSummary & { analysis: EmailAnalysis }>,
    userContext?: any
  ): Promise<string[]> {
    // Try AI-generated recommendations
    if (ollamaService.getAvailability()) {
      try {
        const emailSummaries = emails.slice(0, 15).map(email => ({
          subject: email.subject,
          snippet: email.snippet,
          priority: email.analysis.priority
        }));
        
        const aiDigest = await ollamaService.generateMorningDigest(emailSummaries, userContext);
        
        // Extract recommendations from AI digest
        const lines = aiDigest.split('\n').filter(line => line.trim());
        const recommendations = lines
          .filter(line => 
            line.includes('recommend') || 
            line.includes('suggest') || 
            line.includes('should') ||
            line.includes('consider')
          )
          .slice(0, 4);
          
        if (recommendations.length > 0) {
          return recommendations.map(rec => `🤖 ${rec.replace(/^[•\-*]\s*/, '')}`);
        }
      } catch (error) {
        logger.warn('AI recommendations generation failed, using rule-based:', error);
      }
    }
    
    // Fallback to rule-based recommendations
    const recommendations: string[] = [];

    // Priority-based recommendations
    if (summary.urgentCount > 0) {
      recommendations.push(`🔥 Address ${summary.urgentCount} urgent email${summary.urgentCount > 1 ? 's' : ''} first`);
    }

    if (summary.actionRequiredCount > 10) {
      recommendations.push(`📋 Block 2-3 hours today for email responses (${summary.actionRequiredCount} emails need action)`);
    }

    // Time management recommendations
    if (summary.totalEmails > 20) {
      recommendations.push(`⏰ Consider batching email responses at set times (9 AM, 2 PM, 5 PM)`);
    }

    // Default recommendation
    if (recommendations.length === 0) {
      recommendations.push(`✅ Your inbox looks manageable today!`);
    }

    return recommendations;
  }
}