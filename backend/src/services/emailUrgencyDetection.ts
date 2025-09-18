import type { PrismaClient } from '@prisma/client';
import { NotificationService } from './notificationService.js';

// Define email input type
interface EmailInput {
  userId: string;
  emailId: string;
  subject: string;
  from: string;
  snippet: string;
  bodyPreview?: string;
  receivedAt: Date;
}

// Email priority levels
export enum EmailPriority {
  URGENT = 'urgent',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

// Email category types
export enum EmailCategory {
  URGENT = 'urgent', // 🔴 Requires immediate action
  STANDARD = 'standard', // 🟡 Normal business emails
  FOLLOW_UP = 'follow-up', // 🟢 Follow-up required
  ADMIN = 'admin', // 📋 Administrative/informational
  SPAM = 'spam', // 🗑️ Likely spam
}

// Urgency keywords for Australian trade businesses
const URGENT_KEYWORDS = [
  'urgent',
  'asap',
  'emergency',
  'critical',
  'immediate',
  'deadline',
  'time sensitive',
  'rush',
  'priority',
  'today',
  'overdue',
  'final notice',
  'last chance',
  'breaking',
  'alert',
  // Trade-specific urgent keywords
  'leak',
  'flood',
  'blocked',
  'burst',
  'no power',
  'no water',
  'gas leak',
  'electrical fault',
  'safety issue',
  'health hazard',
  'emergency callout',
  'after hours',
  'weekend emergency',
];

const BUSINESS_KEYWORDS = [
  'invoice',
  'payment',
  'quote',
  'estimate',
  'contract',
  'proposal',
  'project',
  'meeting',
  'appointment',
  'schedule',
  'client',
  'customer',
  'order',
  'delivery',
  'service',
  'maintenance',
  'repair',
  'installation',
  'booking',
  'reservation',
  'follow up',
  'feedback',
  'review',
  // Trade-specific business keywords
  'site visit',
  'job',
  'call out',
  'inspection',
  'compliance',
  'permit',
  'certification',
  'warranty',
  'defect',
  'rectification',
];

const ADMIN_KEYWORDS = [
  'notification',
  'update',
  'newsletter',
  'report',
  'summary',
  'confirmation',
  'receipt',
  'statement',
  'reminder',
  'subscription',
  'account',
  'billing',
  'renewal',
  'terms',
  'policy',
  'legal',
  'tax',
  'gst',
  'bas',
  'super',
  'insurance',
];

const SPAM_INDICATORS = [
  'free',
  'win',
  'winner',
  'congratulations',
  'limited time',
  'click here',
  'act now',
  'make money',
  'work from home',
  'no obligation',
  'risk free',
  'guarantee',
  'amazing deal',
  'once in a lifetime',
  'special offer',
];

export interface EmailAnalysis {
  id?: string;
  userId: string;
  emailId: string;
  subject: string;
  from: string;
  snippet: string;
  priority: EmailPriority;
  category: EmailCategory;
  urgencyScore: number; // 0-100
  businessRelevance: number; // 0-100
  actionRequired: boolean;
  keywords: string[];
  suggestedActions: string[];
  reasoning: string;
  notificationSent?: boolean;
  analyzedAt?: Date;
}

export class EmailUrgencyDetectionService {
  private readonly notificationService: NotificationService;

  constructor(private readonly prisma: PrismaClient) {
    this.notificationService = new NotificationService();
  }

  /**
   * Analyze email urgency and categorize
   */
  async analyzeEmail(email: {
    userId: string;
    emailId: string;
    subject: string;
    from: string;
    snippet: string;
    bodyPreview?: string;
    receivedAt: Date;
  }): Promise<EmailAnalysis> {
    const content = `${email.subject} ${email.snippet} ${email.bodyPreview || ''}`.toLowerCase();
    const fromDomain = email.from.split('@')[1]?.toLowerCase() || '';

    // Calculate scores
    const urgencyScore = this.calculateUrgencyScore(content, email);
    const businessRelevance = this.calculateBusinessRelevance(content, fromDomain);
    const spamScore = this.calculateSpamScore(content, email);

    // Determine category and priority
    const category = this.determineCategory(content, urgencyScore, businessRelevance, spamScore);
    const priority = this.determinePriority(urgencyScore, businessRelevance, category);

    // Extract keywords
    const keywords = this.extractKeywords(content);

    // Check if action is required
    const actionRequired = this.requiresAction(content, category);

    // Generate suggested actions
    const suggestedActions = this.generateSuggestedActions(category, urgencyScore, actionRequired);

    // Generate reasoning
    const reasoning = this.generateReasoning(category, priority, urgencyScore, businessRelevance);

    const analysis: EmailAnalysis = {
      userId: email.userId,
      emailId: email.emailId,
      subject: email.subject,
      from: email.from,
      snippet: email.snippet,
      priority,
      category,
      urgencyScore,
      businessRelevance,
      actionRequired,
      keywords,
      suggestedActions,
      reasoning,
      notificationSent: false,
    };

    // Save analysis to database
    const saved = await this.saveAnalysis(analysis);
    analysis.id = saved.id;
    analysis.analyzedAt = saved.analyzedAt;

    return analysis;
  }

  /**
   * Batch analyze multiple emails
   */
  async analyzeEmails(
    emails: Array<{
      userId: string;
      emailId: string;
      subject: string;
      from: string;
      snippet: string;
      bodyPreview?: string;
      receivedAt: Date;
    }>
  ): Promise<EmailAnalysis[]> {
    const analyses = [];
    for (const email of emails) {
      try {
        const analysis = await this.analyzeEmail(email);
        analyses.push(analysis);
      } catch (error) {
        console.error(`Failed to analyze email ${email.emailId}:`, error);
      }
    }
    return analyses;
  }

  /**
   * Calculate urgency score (0-100)
   */
  private calculateUrgencyScore(content: string, email: any): number {
    let score = 0;

    // Check for urgent keywords
    URGENT_KEYWORDS.forEach(keyword => {
      if (content.includes(keyword)) {
        score += keyword.includes('emergency') || keyword.includes('leak') ? 25 : 15;
      }
    });

    // Time-based urgency
    const emailAge = Date.now() - new Date(email.receivedAt).getTime();
    const hoursOld = emailAge / (1000 * 60 * 60);

    if (hoursOld < 1) {
      score += 10;
    } // Very recent
    if (hoursOld < 4) {
      score += 5;
    } // Recent

    // Subject line indicators
    if (email.subject.includes('!')) {
      score += 5;
    }
    if (email.subject.toUpperCase() === email.subject && email.subject.length > 5) {
      score += 10;
    } // ALL CAPS
    if (email.subject.includes('RE:') && email.subject.includes('RE: RE:')) {
      score += 8;
    } // Long thread

    // Time mentions in content
    if (content.includes('today') || content.includes('tonight')) {
      score += 10;
    }
    if (content.includes('tomorrow')) {
      score += 5;
    }
    if (content.includes('this week')) {
      score += 3;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate business relevance (0-100)
   */
  private calculateBusinessRelevance(content: string, fromDomain: string): number {
    let score = 30; // Base score

    // Business keywords
    BUSINESS_KEYWORDS.forEach(keyword => {
      if (content.includes(keyword)) {
        score += keyword.includes('invoice') || keyword.includes('payment') ? 12 : 8;
      }
    });

    // Domain-based scoring
    const personalDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'];
    if (!personalDomains.includes(fromDomain) && fromDomain) {
      score += 15; // Business email domain
    }

    // Trade-specific patterns
    if (content.includes('site visit') || content.includes('job site')) {
      score += 15;
    }
    if (content.includes('quote') || content.includes('estimate')) {
      score += 20;
    }
    if (content.includes('invoice') || content.includes('payment')) {
      score += 20;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate spam likelihood (0-100)
   */
  private calculateSpamScore(content: string, email: any): number {
    let score = 0;

    SPAM_INDICATORS.forEach(indicator => {
      if (content.includes(indicator)) {
        score += 15;
      }
    });

    // Excessive punctuation
    const exclamationCount = (content.match(/!/g) || []).length;
    score += Math.min(20, exclamationCount * 5);

    // Suspicious patterns
    if (email.from.includes('noreply@') && content.includes('click here')) {
      score += 20;
    }
    if (content.includes('$') && content.includes('free')) {
      score += 15;
    }

    // All caps subject
    if (email.subject.toUpperCase() === email.subject && email.subject.length > 20) {
      score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Determine email category
   */
  private determineCategory(
    content: string,
    urgencyScore: number,
    businessRelevance: number,
    spamScore: number
  ): EmailCategory {
    if (spamScore > 60) {
      return EmailCategory.SPAM;
    }
    if (urgencyScore > 70) {
      return EmailCategory.URGENT;
    }
    if (content.includes('follow up') || content.includes('following up')) {
      return EmailCategory.FOLLOW_UP;
    }
    if (businessRelevance > 70) {
      return EmailCategory.STANDARD;
    }
    if (ADMIN_KEYWORDS.some(keyword => content.includes(keyword))) {
      return EmailCategory.ADMIN;
    }

    return EmailCategory.STANDARD;
  }

  /**
   * Determine priority level
   */
  private determinePriority(urgencyScore: number, businessRelevance: number, category: EmailCategory): EmailPriority {
    if (category === EmailCategory.URGENT || urgencyScore > 80) {
      return EmailPriority.URGENT;
    }
    if (urgencyScore > 60 || (businessRelevance > 80 && urgencyScore > 40)) {
      return EmailPriority.HIGH;
    }
    if (urgencyScore < 20 && businessRelevance < 30) {
      return EmailPriority.LOW;
    }
    return EmailPriority.MEDIUM;
  }

  /**
   * Extract relevant keywords
   */
  private extractKeywords(content: string): string[] {
    const keywords = new Set<string>();

    // Check all keyword lists
    [...URGENT_KEYWORDS, ...BUSINESS_KEYWORDS].forEach(keyword => {
      if (content.includes(keyword)) {
        keywords.add(keyword);
      }
    });

    return Array.from(keywords).slice(0, 10); // Limit to 10 keywords
  }

  /**
   * Check if action is required
   */
  private requiresAction(content: string, category: EmailCategory): boolean {
    if (category === EmailCategory.URGENT) {
      return true;
    }
    if (category === EmailCategory.SPAM) {
      return false;
    }

    const actionPhrases = [
      'please respond',
      'please reply',
      'please confirm',
      'action required',
      'response required',
      'approval needed',
      'waiting for',
      'need your',
      'please provide',
      'please send',
      'please complete',
      'please review',
    ];

    return actionPhrases.some(phrase => content.includes(phrase));
  }

  /**
   * Generate suggested actions
   */
  private generateSuggestedActions(category: EmailCategory, urgencyScore: number, actionRequired: boolean): string[] {
    const actions = [];

    switch (category) {
      case EmailCategory.URGENT:
        actions.push('Respond immediately');
        actions.push('Call sender if phone number available');
        break;
      case EmailCategory.STANDARD:
        if (actionRequired) {
          actions.push('Review and respond within 24 hours');
        } else {
          actions.push('Review when convenient');
        }
        break;
      case EmailCategory.FOLLOW_UP:
        actions.push('Check previous correspondence');
        actions.push('Respond with update');
        break;
      case EmailCategory.ADMIN:
        actions.push('File for reference');
        break;
      case EmailCategory.SPAM:
        actions.push('Mark as spam');
        actions.push('Unsubscribe if legitimate');
        break;
    }

    if (urgencyScore > 70) {
      actions.unshift('⚡ Prioritize this email');
    }

    return actions;
  }

  /**
   * Generate reasoning for the analysis
   */
  private generateReasoning(
    category: EmailCategory,
    priority: EmailPriority,
    urgencyScore: number,
    businessRelevance: number
  ): string {
    const reasons = [];

    if (urgencyScore > 70) {
      reasons.push(`High urgency detected (score: ${urgencyScore})`);
    }

    if (businessRelevance > 70) {
      reasons.push(`High business relevance (score: ${businessRelevance})`);
    }

    switch (category) {
      case EmailCategory.URGENT:
        reasons.push('Contains urgent keywords or emergency indicators');
        break;
      case EmailCategory.STANDARD:
        reasons.push('Standard business communication');
        break;
      case EmailCategory.FOLLOW_UP:
        reasons.push('Follow-up on previous correspondence');
        break;
      case EmailCategory.ADMIN:
        reasons.push('Administrative or informational content');
        break;
      case EmailCategory.SPAM:
        reasons.push('Likely spam or promotional content');
        break;
    }

    return `${reasons.join('. ')}.`;
  }

  /**
   * Save analysis to database
   */
  private async saveAnalysis(analysis: EmailAnalysis): Promise<any> {
    return await this.prisma.emailAnalysis.create({
      data: {
        userId: analysis.userId,
        emailId: analysis.emailId,
        subject: analysis.subject,
        sender: analysis.from,
        snippet: analysis.snippet,
        priority: analysis.priority,
        category: analysis.category,
        urgencyScore: analysis.urgencyScore,
        businessRelevance: analysis.businessRelevance,
        actionRequired: analysis.actionRequired,
        keywords: analysis.keywords,
        suggestedActions: analysis.suggestedActions,
        reasoning: analysis.reasoning,
        notificationSent: false,
        analyzedAt: new Date(),
      },
    });
  }

  /**
   * Get recent analyses for a user
   */
  async getRecentAnalyses(userId: string, limit: number = 50): Promise<any[]> {
    return await this.prisma.emailAnalysis.findMany({
      where: { userId },
      orderBy: { analyzedAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get analysis by email ID
   */
  async getAnalysisByEmailId(emailId: string): Promise<any | null> {
    return await this.prisma.emailAnalysis.findFirst({
      where: { emailId },
    });
  }
}
