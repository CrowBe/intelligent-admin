import { prisma } from '../db/index.js';
import { logger } from '../utils/logger';



export interface EmailUrgencyAnalysis {
  urgencyScore: number; // 0-1 scale
  category: 'urgent' | 'standard' | 'follow_up' | 'admin';
  keywords: string[];
  businessImpact: 'high' | 'medium' | 'low';
  suggestedActions: string[];
  customerType: 'business' | 'residential' | 'unknown';
  jobValue?: number;
  confidence: number; // 0-1 scale
  reasoning: string;
}

export interface EmailContent {
  messageId: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: Date;
  threadId?: string;
}

export class EmailUrgencyDetectionService {
  private static instance: EmailUrgencyDetectionService;

  // Urgent keywords with weights
  private urgentKeywords = {
    // Emergency/Safety (highest priority)
    'emergency': 1.0,
    'urgent': 0.9,
    'asap': 0.9,
    'power out': 1.0,
    'power outage': 1.0,
    'no power': 1.0,
    'electrical fire': 1.0,
    'sparks': 0.9,
    'burning smell': 0.9,
    'smoke': 0.9,
    'shock': 0.8,
    'electrocuted': 1.0,
    'dangerous': 0.8,
    'safety': 0.7,
    'hazard': 0.7,
    
    // Business Impact
    'business down': 0.9,
    'can\'t operate': 0.8,
    'losing money': 0.8,
    'customers waiting': 0.7,
    'production stopped': 0.8,
    'equipment down': 0.7,
    'system failure': 0.8,
    'critical': 0.8,
    
    // Time Sensitive
    'today': 0.6,
    'immediately': 0.9,
    'right now': 0.8,
    'this morning': 0.7,
    'this afternoon': 0.6,
    'deadline': 0.7,
    'overdue': 0.6,
    
    // Customer Complaints
    'complaint': 0.6,
    'not working': 0.5,
    'broken': 0.5,
    'fault': 0.6,
    'problem': 0.4,
    'issue': 0.3,
    'help': 0.3,
    'stuck': 0.5,
    'won\'t start': 0.5,
    'tripping': 0.7,
    'flickering': 0.6
  };

  // Business indicators
  private businessKeywords = [
    'office', 'shop', 'store', 'factory', 'warehouse', 'commercial', 'business',
    'pty ltd', 'company', 'corp', 'restaurant', 'cafe', 'retail', 'industrial'
  ];

  // Job value indicators (AUD amounts)
  private jobValuePatterns = [
    /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?) dollars?/gi,
    /quote.*?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi
  ];

  private constructor() {}

  public static getInstance(): EmailUrgencyDetectionService {
    if (!EmailUrgencyDetectionService.instance) {
      EmailUrgencyDetectionService.instance = new EmailUrgencyDetectionService();
    }
    return EmailUrgencyDetectionService.instance;
  }

  /**
   * Analyze email urgency and business impact
   */
  async analyzeEmailUrgency(userId: string, email: EmailContent): Promise<EmailUrgencyAnalysis> {
    try {
      const fullText = `${email.subject} ${email.body}`.toLowerCase();
      
      // Calculate urgency score
      const urgencyScore = this.calculateUrgencyScore(fullText);
      
      // Detect keywords
      const keywords = this.extractKeywords(fullText);
      
      // Determine business impact
      const businessImpact = this.assessBusinessImpact(urgencyScore, keywords, fullText);
      
      // Categorize email
      const category = this.categorizeEmail(urgencyScore, keywords);
      
      // Detect customer type
      const customerType = this.detectCustomerType(email.from, fullText);
      
      // Extract job value
      const jobValue = this.extractJobValue(fullText);
      
      // Generate suggested actions
      const suggestedActions = this.generateSuggestedActions(category, keywords, businessImpact);
      
      // Calculate confidence
      const confidence = this.calculateConfidence(keywords.length, fullText.length);
      
      // Generate reasoning
      const reasoning = this.generateReasoning(urgencyScore, keywords, businessImpact);

      const analysis: EmailUrgencyAnalysis = {
        urgencyScore,
        category,
        keywords,
        businessImpact,
        suggestedActions,
        customerType,
        jobValue,
        confidence,
        reasoning
      };

      // Store analysis in database
      await this.storeAnalysis(userId, email.messageId, analysis);

      logger.info(`Email urgency analysis completed for ${email.messageId}: ${category} (${urgencyScore.toFixed(2)})`);
      
      return analysis;

    } catch (error) {
      logger.error('Failed to analyze email urgency:', error);
      
      // Return safe defaults
      return {
        urgencyScore: 0.3,
        category: 'standard',
        keywords: [],
        businessImpact: 'low',
        suggestedActions: ['Review email content'],
        customerType: 'unknown',
        confidence: 0.1,
        reasoning: 'Analysis failed - manual review required'
      };
    }
  }

  /**
   * Calculate urgency score based on keywords and patterns
   */
  private calculateUrgencyScore(text: string): number {
    let score = 0;
    let matches = 0;

    // Check for urgent keywords
    Object.entries(this.urgentKeywords).forEach(([keyword, weight]) => {
      if (text.includes(keyword)) {
        score += weight;
        matches++;
      }
    });

    // Time indicators
    if (text.includes('today') || text.includes('this morning')) score += 0.3;
    if (text.includes('tonight') || text.includes('after hours')) score += 0.4;
    if (text.includes('weekend') || text.includes('saturday') || text.includes('sunday')) score += 0.5;

    // Exclamation marks and caps
    const exclamationCount = (text.match(/!/g) || []).length;
    if (exclamationCount > 2) score += 0.2;
    
    const capsWords = (text.match(/\b[A-Z]{3,}\b/g) || []).length;
    if (capsWords > 2) score += 0.3;

    // Multiple keywords boost score
    if (matches > 1) score *= 1.2;
    if (matches > 3) score *= 1.4;

    // Normalize to 0-1 scale
    return Math.min(score, 1.0);
  }

  /**
   * Extract matched keywords
   */
  private extractKeywords(text: string): string[] {
    const keywords: string[] = [];
    
    Object.keys(this.urgentKeywords).forEach(keyword => {
      if (text.includes(keyword)) {
        keywords.push(keyword);
      }
    });

    return keywords;
  }

  /**
   * Assess business impact
   */
  private assessBusinessImpact(urgencyScore: number, keywords: string[], text: string): 'high' | 'medium' | 'low' {
    // High impact indicators
    const highImpactKeywords = ['emergency', 'power out', 'business down', 'losing money', 'critical'];
    if (keywords.some(k => highImpactKeywords.includes(k)) || urgencyScore > 0.8) {
      return 'high';
    }

    // Medium impact indicators
    const mediumImpactKeywords = ['urgent', 'asap', 'equipment down', 'customers waiting'];
    if (keywords.some(k => mediumImpactKeywords.includes(k)) || urgencyScore > 0.5) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Categorize email based on urgency and content
   */
  private categorizeEmail(urgencyScore: number, keywords: string[]): 'urgent' | 'standard' | 'follow_up' | 'admin' {
    if (urgencyScore > 0.7) return 'urgent';
    
    // Check for follow-up indicators
    const followUpKeywords = ['quote', 'estimate', 'invoice', 'payment', 'follow up', 'checking in'];
    if (keywords.some(k => followUpKeywords.some(f => k.includes(f)))) {
      return 'follow_up';
    }

    // Check for admin indicators
    const adminKeywords = ['certificate', 'compliance', 'permit', 'inspection', 'paperwork'];
    if (keywords.some(k => adminKeywords.some(a => k.includes(a)))) {
      return 'admin';
    }

    return 'standard';
  }

  /**
   * Detect customer type from email and content
   */
  private detectCustomerType(from: string, text: string): 'business' | 'residential' | 'unknown' {
    const fromLower = from.toLowerCase();
    const textLower = text.toLowerCase();

    // Business indicators
    if (this.businessKeywords.some(keyword => 
      fromLower.includes(keyword) || textLower.includes(keyword)
    )) {
      return 'business';
    }

    // Residential indicators
    const residentialKeywords = ['home', 'house', 'apartment', 'unit', 'residence', 'domestic'];
    if (residentialKeywords.some(keyword => textLower.includes(keyword))) {
      return 'residential';
    }

    return 'unknown';
  }

  /**
   * Extract potential job value from text
   */
  private extractJobValue(text: string): number | undefined {
    let maxValue = 0;

    this.jobValuePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const value = parseFloat(match.replace(/[,$]/g, ''));
          if (!isNaN(value) && value > maxValue && value < 100000) {
            maxValue = value;
          }
        });
      }
    });

    return maxValue > 0 ? maxValue : undefined;
  }

  /**
   * Generate suggested actions based on analysis
   */
  private generateSuggestedActions(
    category: string, 
    keywords: string[], 
    businessImpact: string
  ): string[] {
    const actions: string[] = [];

    if (category === 'urgent') {
      actions.push('Call customer immediately');
      if (keywords.includes('power out') || keywords.includes('emergency')) {
        actions.push('Offer emergency service rate');
        actions.push('Check availability for same-day service');
      }
    }

    if (businessImpact === 'high') {
      actions.push('Prioritize in schedule');
      actions.push('Consider premium service charge');
    }

    if (category === 'follow_up') {
      actions.push('Send quote or follow-up response');
    }

    if (category === 'admin') {
      actions.push('Review compliance requirements');
      actions.push('Prepare necessary documentation');
    }

    // Default actions
    if (actions.length === 0) {
      actions.push('Review email and respond within 24 hours');
    }

    return actions;
  }

  /**
   * Calculate confidence in analysis
   */
  private calculateConfidence(keywordCount: number, textLength: number): number {
    let confidence = 0.5; // Base confidence

    // More keywords = higher confidence
    confidence += Math.min(keywordCount * 0.1, 0.3);

    // Longer text = slightly higher confidence
    if (textLength > 100) confidence += 0.1;
    if (textLength > 500) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  /**
   * Generate human-readable reasoning
   */
  private generateReasoning(urgencyScore: number, keywords: string[], businessImpact: string): string {
    const reasons: string[] = [];

    if (urgencyScore > 0.7) {
      reasons.push(`High urgency score (${(urgencyScore * 100).toFixed(0)}%)`);
    }

    if (keywords.length > 0) {
      reasons.push(`Urgent keywords detected: ${keywords.slice(0, 3).join(', ')}`);
    }

    if (businessImpact === 'high') {
      reasons.push('High business impact indicated');
    }

    return reasons.length > 0 
      ? reasons.join('; ')
      : 'Standard email with no urgent indicators';
  }

  /**
   * Store analysis in database
   */
  private async storeAnalysis(userId: string, messageId: string, analysis: EmailUrgencyAnalysis): Promise<void> {
    try {
      await prisma.emailAnalysis.upsert({
        where: {
          userId_emailMessageId: {
            userId,
            emailMessageId: messageId
          }
        },
        update: {
          urgencyScore: analysis.urgencyScore,
          category: analysis.category,
          keywords: JSON.stringify(analysis.keywords),
          businessImpact: analysis.businessImpact,
          suggestedActions: JSON.stringify(analysis.suggestedActions),
          customerType: analysis.customerType,
          jobValue: analysis.jobValue,
          userFeedback: null // Reset feedback on re-analysis
        },
        create: {
          userId,
          emailMessageId: messageId,
          senderEmail: '', // Would be filled by caller
          subject: '', // Would be filled by caller
          urgencyScore: analysis.urgencyScore,
          category: analysis.category,
          keywords: JSON.stringify(analysis.keywords),
          businessImpact: analysis.businessImpact,
          suggestedActions: JSON.stringify(analysis.suggestedActions),
          customerType: analysis.customerType,
          jobValue: analysis.jobValue
        }
      });
    } catch (error) {
      logger.error('Failed to store email analysis:', error);
    }
  }

  /**
   * Get urgent emails for morning brief
   */
  async getUrgentEmailsForUser(userId: string, since: Date): Promise<any[]> {
    try {
      const urgentEmails = await prisma.emailAnalysis.findMany({
        where: {
          userId,
          analyzedAt: {
            gte: since
          },
          urgencyScore: {
            gte: 0.6 // Only include moderately urgent and above
          }
        },
        orderBy: {
          urgencyScore: 'desc'
        },
        take: 10 // Limit to top 10 most urgent
      });

      return urgentEmails;
    } catch (error) {
      logger.error('Failed to get urgent emails:', error);
      return [];
    }
  }

  /**
   * Update analysis confidence based on user feedback
   */
  async updateAnalysisFromFeedback(
    userId: string, 
    messageId: string, 
    feedback: {
      correctUrgency: boolean;
      correctCategory: boolean;
      actualCategory?: string;
      actualUrgencyScore?: number;
    }
  ): Promise<void> {
    try {
      await prisma.emailAnalysis.update({
        where: {
          userId_emailMessageId: {
            userId,
            emailMessageId: messageId
          }
        },
        data: {
          userFeedback: JSON.stringify(feedback)
        }
      });

      logger.info(`Updated email analysis feedback for ${messageId}`);
    } catch (error) {
      logger.error('Failed to update analysis feedback:', error);
    }
  }
}

export const emailUrgencyDetectionService = EmailUrgencyDetectionService.getInstance();