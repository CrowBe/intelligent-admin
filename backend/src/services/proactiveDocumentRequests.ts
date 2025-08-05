import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

export interface DocumentRequestTrigger {
  keywords: string[];
  documentTypes: string[];
  priority: 'high' | 'medium' | 'low';
  message: string;
  context?: string;
}

export interface DocumentSuggestion {
  type: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  keywords: string[];
  message: string;
  context?: string;
}

class ProactiveDocumentRequestsService {
  private triggers: DocumentRequestTrigger[] = [
    // Electrical Work Triggers
    {
      keywords: ['electrical', 'wiring', 'switchboard', 'power point', 'circuit'],
      documentTypes: ['electrical_certificate', 'safety_certificate', 'test_results'],
      priority: 'high',
      message: "For electrical work, I'll need to see your electrical safety certificates and test results to ensure compliance with Australian Standards AS/NZS 3000.",
      context: 'safety_compliance'
    },
    {
      keywords: ['quote', 'estimate', 'pricing', 'cost'],
      documentTypes: ['quote', 'estimate', 'price_list'],
      priority: 'medium',
      message: "I can help you create a more accurate quote if you upload your current price lists and previous quotes for similar work.",
      context: 'pricing'
    },
    {
      keywords: ['invoice', 'bill', 'payment', 'owing'],
      documentTypes: ['invoice', 'receipt', 'statement'],
      priority: 'medium',
      message: "To help track your finances, please upload any outstanding invoices or recent payment receipts.",
      context: 'financial_tracking'
    },
    {
      keywords: ['contract', 'agreement', 'terms', 'conditions'],
      documentTypes: ['contract', 'agreement', 'terms_conditions'],
      priority: 'medium',
      message: "I can review your contract terms to ensure they protect your business interests and comply with Australian consumer law.",
      context: 'legal_compliance'
    },
    {
      keywords: ['safety', 'whs', 'workplace health', 'risk assessment', 'hazard'],
      documentTypes: ['safety_document', 'risk_assessment', 'safety_plan'],
      priority: 'high',
      message: "Safety documentation is crucial. Please upload your current risk assessments, safety plans, and WHS procedures.",
      context: 'safety_compliance'
    },
    {
      keywords: ['permit', 'license', 'registration', 'certification'],
      documentTypes: ['permit', 'license', 'certificate'],
      priority: 'high',
      message: "I'll need to see your relevant permits and licenses to ensure all work is properly authorized.",
      context: 'legal_compliance'
    },
    {
      keywords: ['materials', 'parts', 'supplies', 'order'],
      documentTypes: ['receipt', 'delivery_docket', 'purchase_order'],
      priority: 'low',
      message: "Upload your material receipts and delivery dockets to help track job costs and warranty information.",
      context: 'cost_tracking'
    },
    {
      keywords: ['warranty', 'guarantee', 'defect', 'fault'],
      documentTypes: ['warranty', 'guarantee_certificate', 'service_record'],
      priority: 'medium',
      message: "Please upload warranty documents and service records to help resolve any issues quickly.",
      context: 'warranty_management'
    },
    {
      keywords: ['plan', 'drawing', 'blueprint', 'diagram'],
      documentTypes: ['technical_drawing', 'plan', 'diagram'],
      priority: 'medium',
      message: "Technical drawings and plans will help me provide more accurate advice and estimates.",
      context: 'technical_reference'
    },
    {
      keywords: ['emergency', 'urgent', 'immediate', 'asap'],
      documentTypes: ['photo', 'site_photo', 'damage_photo'],
      priority: 'high',
      message: "For urgent issues, please upload photos of the problem area so I can better assess the situation and prioritize the response.",
      context: 'emergency_response'
    }
  ];

  /**
   * Analyze message content and suggest document uploads
   */
  async analyzeMessageForDocumentRequests(
    userId: string,
    messageContent: string,
    sessionId?: string
  ): Promise<DocumentSuggestion[]> {
    const suggestions: DocumentSuggestion[] = [];
    const lowerContent = messageContent.toLowerCase();

    // Check each trigger against the message content
    for (const trigger of this.triggers) {
      const matchedKeywords = trigger.keywords.filter(keyword => 
        lowerContent.includes(keyword.toLowerCase())
      );

      if (matchedKeywords.length > 0) {
        // Check if user already has documents of these types
        const existingDocs = await this.checkExistingDocuments(userId, trigger.documentTypes);
        
        // Only suggest if user doesn't have recent documents of this type
        if (!existingDocs.hasRecentDocuments) {
          suggestions.push({
            type: trigger.documentTypes[0],
            reason: `Detected keywords: ${matchedKeywords.join(', ')}`,
            priority: trigger.priority,
            keywords: matchedKeywords,
            message: trigger.message,
            context: trigger.context
          });
        }
      }
    }

    // Log the analysis
    if (suggestions.length > 0) {
      logger.info(`Document suggestions generated for user ${userId}:`, {
        messageContent: messageContent.substring(0, 100),
        suggestions: suggestions.map(s => ({ type: s.type, priority: s.priority }))
      });
    }

    return suggestions;
  }

  /**
   * Analyze chat session context for document needs
   */
  async analyzeSessionForDocumentNeeds(
    userId: string,
    sessionId: string,
    messageLimit: number = 10
  ): Promise<DocumentSuggestion[]> {
    // Get recent messages from the session
    const messages = await prisma.message.findMany({
      where: {
        sessionId,
        deletedAt: null
      },
      orderBy: { timestamp: 'desc' },
      take: messageLimit,
      select: {
        content: true,
        role: true,
        timestamp: true
      }
    });

    // Combine all message content
    const combinedContent = messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join(' ');

    return this.analyzeMessageForDocumentRequests(userId, combinedContent, sessionId);
  }

  /**
   * Check if user has existing documents of specified types
   */
  private async checkExistingDocuments(
    userId: string,
    documentTypes: string[]
  ): Promise<{ hasRecentDocuments: boolean; documentCount: number }> {
    const recentThreshold = new Date();
    recentThreshold.setDate(recentThreshold.getDate() - 30); // 30 days

    const count = await prisma.document.count({
      where: {
        userId,
        category: { in: documentTypes },
        uploadedAt: { gte: recentThreshold },
        deletedAt: null
      }
    });

    return {
      hasRecentDocuments: count > 0,
      documentCount: count
    };
  }

  /**
   * Get cross-referenced document suggestions based on industry standards
   */
  async getCrossReferencedSuggestions(
    userId: string,
    documentType: string,
    existingDocuments: any[]
  ): Promise<DocumentSuggestion[]> {
    const suggestions: DocumentSuggestion[] = [];

    // Get user's business context
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { businessType: true, preferences: true }
    });

    if (!user) return suggestions;

    // Cross-reference with industry knowledge
    const industryKnowledge = await prisma.industryKnowledge.findMany({
      where: {
        category: user.businessType || 'electrical',
        contentType: 'regulation',
        isActive: true
      },
      take: 5
    });

    // Generate suggestions based on industry requirements
    for (const knowledge of industryKnowledge) {
      if (this.shouldSuggestBasedOnIndustryKnowledge(knowledge, existingDocuments)) {
        suggestions.push({
          type: this.inferDocumentTypeFromKnowledge(knowledge),
          reason: `Required by ${knowledge.source}: ${knowledge.title}`,
          priority: 'high',
          keywords: [],
          message: `Based on industry regulations, you may need to provide ${this.inferDocumentTypeFromKnowledge(knowledge)} documentation.`,
          context: 'industry_compliance'
        });
      }
    }

    return suggestions;
  }

  /**
   * Generate smart prompts for missing documentation
   */
  async generateSmartPrompts(
    userId: string,
    context: string = 'general'
  ): Promise<string[]> {
    const prompts: string[] = [];

    // Get user's recent document upload patterns
    const recentDocs = await prisma.document.findMany({
      where: {
        userId,
        uploadedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // 30 days
        deletedAt: null
      },
      select: { category: true, title: true, uploadedAt: true }
    });

    const categories = new Set(recentDocs.map(doc => doc.category).filter(Boolean));

    // Generate context-specific prompts
    switch (context) {
      case 'new_job':
        if (!categories.has('quote')) {
          prompts.push("Have you prepared a quote for this job? Upload it so I can track the project progress.");
        }
        if (!categories.has('safety_document')) {
          prompts.push("Don't forget to upload your safety assessment and WHS documentation for this job site.");
        }
        break;

      case 'job_completion':
        if (!categories.has('certificate')) {
          prompts.push("Remember to upload completion certificates and test results for compliance records.");
        }
        if (!categories.has('photo')) {
          prompts.push("Upload 'after' photos of the completed work for your portfolio and warranty records.");
        }
        break;

      case 'financial_review':
        if (!categories.has('invoice')) {
          prompts.push("Upload recent invoices so I can help track your cash flow and outstanding payments.");
        }
        if (!categories.has('receipt')) {
          prompts.push("Don't forget to upload material receipts for accurate job costing and tax records.");
        }
        break;
    }

    return prompts;
  }

  /**
   * Track document request effectiveness
   */
  async trackDocumentRequestOutcome(
    userId: string,
    suggestionType: string,
    outcome: 'uploaded' | 'ignored' | 'dismissed',
    documentId?: string
  ): Promise<void> {
    // This could be expanded to track user preferences and improve suggestions
    logger.info(`Document request outcome tracked:`, {
      userId,
      suggestionType,
      outcome,
      documentId
    });

    // Update user preferences based on their response patterns
    if (outcome === 'dismissed') {
      await this.updateUserDocumentPreferences(userId, suggestionType, 'reduce_frequency');
    } else if (outcome === 'uploaded') {
      await this.updateUserDocumentPreferences(userId, suggestionType, 'increase_relevance');
    }
  }

  private shouldSuggestBasedOnIndustryKnowledge(knowledge: any, existingDocs: any[]): boolean {
    // Check if the knowledge content suggests a document requirement
    const content = knowledge.content.toLowerCase();
    const requirementKeywords = ['must provide', 'shall submit', 'required documentation', 'certificate required'];
    
    return requirementKeywords.some(keyword => content.includes(keyword));
  }

  private inferDocumentTypeFromKnowledge(knowledge: any): string {
    const content = knowledge.content.toLowerCase();
    
    if (content.includes('certificate')) return 'certificate';
    if (content.includes('permit')) return 'permit';
    if (content.includes('license')) return 'license';
    if (content.includes('test result')) return 'test_results';
    if (content.includes('assessment')) return 'risk_assessment';
    
    return 'compliance_document';
  }

  private async updateUserDocumentPreferences(
    userId: string,
    suggestionType: string,
    action: 'reduce_frequency' | 'increase_relevance'
  ): Promise<void> {
    try {
      const preferenceType = `document_suggestions_${suggestionType}`;
      
      await prisma.userPreference.upsert({
        where: {
          userId_preferenceType: {
            userId,
            preferenceType
          }
        },
        update: {
          preferenceData: JSON.stringify({ action, updatedAt: new Date() }),
          confidence: action === 'increase_relevance' ? 0.8 : 0.3,
          lastAppliedAt: new Date()
        },
        create: {
          userId,
          preferenceType,
          preferenceData: JSON.stringify({ action, createdAt: new Date() }),
          confidence: action === 'increase_relevance' ? 0.8 : 0.3
        }
      });
    } catch (error) {
      logger.error('Failed to update user document preferences:', error);
    }
  }
}

export const proactiveDocumentRequestsService = new ProactiveDocumentRequestsService();