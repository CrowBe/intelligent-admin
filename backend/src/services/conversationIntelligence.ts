import { prisma } from '../db/index.js';
import { industryKnowledgeService } from './industryKnowledge.js';
import { businessContextService } from './businessContext.js';
import { logger } from '../utils/logger.js';



/**
 * Conversation Intelligence Service
 * Manages natural discovery of user business context through conversation
 */

export interface BusinessContextClue {
  type: 'industry' | 'location' | 'service_type' | 'customer_type' | 'work_scale';
  value: string;
  confidence: number;
  evidence: string;
}

export interface ConversationSuggestion {
  type: 'standard_confirmation' | 'context_clarification' | 'industry_insight';
  content: string;
  data: any;
  priority: number;
}

export interface SmartPrompt {
  question: string;
  context: string;
  expectedAnswers: string[];
  followUpActions: string[];
}

class ConversationIntelligenceService {
  private static instance: ConversationIntelligenceService;

  private constructor() {}

  public static getInstance(): ConversationIntelligenceService {
    if (!ConversationIntelligenceService.instance) {
      ConversationIntelligenceService.instance = new ConversationIntelligenceService();
    }
    return ConversationIntelligenceService.instance;
  }

  /**
   * Analyze user message for business context clues
   */
  async analyzeForBusinessContext(
    userId: string,
    message: string,
    conversationHistory: Array<{ role: string; content: string }>
  ): Promise<{
    contextClues: BusinessContextClue[];
    suggestions: ConversationSuggestion[];
    smartPrompts: SmartPrompt[];
  }> {
    try {
      const contextClues = this.extractContextClues(message);
      
      // Get existing user context
      const existingProfile = await businessContextService.getBusinessProfile(userId);
      
      // Generate intelligent suggestions based on discoveries
      const suggestions = await this.generateSmartSuggestions(
        contextClues, 
        existingProfile, 
        conversationHistory
      );

      // Create natural follow-up prompts
      const smartPrompts = this.generateSmartPrompts(contextClues, suggestions);

      // Store learned context clues
      await this.storeContextClues(userId, contextClues);

      return { contextClues, suggestions, smartPrompts };
    } catch (error) {
      logger.error('Error analyzing conversation for business context:', error);
      return { contextClues: [], suggestions: [], smartPrompts: [] };
    }
  }

  /**
   * Extract business context clues from natural conversation
   */
  private extractContextClues(message: string): BusinessContextClue[] {
    const clues: BusinessContextClue[] = [];
    const messageLower = message.toLowerCase();

    // Industry Detection Patterns
    const industryPatterns = {
      electrical: {
        keywords: ['wiring', 'electrical', 'switchboard', 'outlet', 'circuit', 'voltage', 'electrician', 'power', 'lighting', 'meter'],
        phrases: ['electrical work', 'power installation', 'lighting upgrade', 'electrical fault']
      },
      plumbing: {
        keywords: ['plumbing', 'pipes', 'water', 'drain', 'toilet', 'shower', 'tap', 'hot water', 'plumber'],
        phrases: ['blocked drain', 'water leak', 'bathroom renovation']
      },
      hvac: {
        keywords: ['heating', 'cooling', 'aircon', 'ventilation', 'hvac', 'air conditioning', 'ducted'],
        phrases: ['air conditioning', 'heating system', 'climate control']
      }
    };

    // Check for industry indicators
    for (const [industry, patterns] of Object.entries(industryPatterns)) {
      let matches = 0;
      let evidence = '';

      // Check keywords
      for (const keyword of patterns.keywords) {
        if (messageLower.includes(keyword)) {
          matches++;
          evidence += `"${keyword}" `;
        }
      }

      // Check phrases (higher weight)
      for (const phrase of patterns.phrases) {
        if (messageLower.includes(phrase)) {
          matches += 2;
          evidence += `"${phrase}" `;
        }
      }

      if (matches > 0) {
        clues.push({
          type: 'industry',
          value: industry,
          confidence: Math.min(matches * 0.2, 1.0),
          evidence: evidence.trim()
        });
      }
    }

    // Location Detection (Australian focus)
    const locationPatterns = {
      'Victoria': ['victoria', 'vic', 'melbourne', 'geelong', 'ballarat', 'esv', 'energy safe victoria'],
      'NSW': ['nsw', 'new south wales', 'sydney', 'newcastle', 'wollongong'],
      'Queensland': ['qld', 'queensland', 'brisbane', 'gold coast', 'sunshine coast'],
      'South Australia': ['sa', 'south australia', 'adelaide'],
      'Western Australia': ['wa', 'western australia', 'perth'],
      'Tasmania': ['tas', 'tasmania', 'hobart'],
      'ACT': ['act', 'canberra', 'australian capital territory'],
      'Northern Territory': ['nt', 'northern territory', 'darwin']
    };

    for (const [state, indicators] of Object.entries(locationPatterns)) {
      for (const indicator of indicators) {
        if (messageLower.includes(indicator)) {
          clues.push({
            type: 'location',
            value: state,
            confidence: 0.8,
            evidence: `mentioned "${indicator}"`
          });
          break;
        }
      }
    }

    // Service Type Detection
    const servicePatterns = {
      'residential': ['home', 'house', 'residential', 'homeowner', 'family', 'domestic', 'unit', 'apartment'],
      'commercial': ['office', 'shop', 'store', 'business', 'commercial', 'retail', 'restaurant', 'cafe'],
      'industrial': ['factory', 'warehouse', 'industrial', 'manufacturing', 'plant', 'facility']
    };

    for (const [serviceType, keywords] of Object.entries(servicePatterns)) {
      let matches = 0;
      let evidence = '';

      for (const keyword of keywords) {
        if (messageLower.includes(keyword)) {
          matches++;
          evidence += `"${keyword}" `;
        }
      }

      if (matches > 0) {
        clues.push({
          type: 'service_type',
          value: serviceType,
          confidence: Math.min(matches * 0.3, 1.0),
          evidence: evidence.trim()
        });
      }
    }

    // Work Scale Detection
    const scalePatterns = {
      'small_jobs': ['quick fix', 'small job', 'minor repair', 'couple hours', 'half day'],
      'medium_jobs': ['renovation', 'upgrade', 'rewiring', 'full installation', 'new system'],
      'large_jobs': ['new build', 'construction', 'major renovation', 'complete rewire', 'new development']
    };

    for (const [scale, phrases] of Object.entries(scalePatterns)) {
      for (const phrase of phrases) {
        if (messageLower.includes(phrase)) {
          clues.push({
            type: 'work_scale',
            value: scale,
            confidence: 0.7,
            evidence: `mentioned "${phrase}"`
          });
          break;
        }
      }
    }

    return clues;
  }

  /**
   * Generate intelligent suggestions based on discovered context
   */
  private async generateSmartSuggestions(
    contextClues: BusinessContextClue[],
    existingProfile: any,
    conversationHistory: Array<{ role: string; content: string }>
  ): Promise<ConversationSuggestion[]> {
    const suggestions: ConversationSuggestion[] = [];

    // Find the most confident industry clue
    const industryClue = contextClues
      .filter(c => c.type === 'industry')
      .sort((a, b) => b.confidence - a.confidence)[0];

    // Find location clue
    const locationClue = contextClues
      .filter(c => c.type === 'location')
      .sort((a, b) => b.confidence - a.confidence)[0];

    // If we detected electrical work in Victoria, suggest ESV standards
    if (industryClue?.value === 'electrical' && locationClue?.value === 'Victoria') {
      suggestions.push({
        type: 'standard_confirmation',
        content: "Since you're doing electrical work in Victoria, I can help you with ESV requirements and AS/NZS standards. Would you like me to check what's relevant for your specific job?",
        data: {
          industry: 'electrical',
          location: 'Victoria',
          standards: ['ESV', 'AS/NZS 3000', 'AS/NZS 3008']
        },
        priority: 9
      });
    }

    // If industry detected but location unclear
    if (industryClue && !locationClue) {
      suggestions.push({
        type: 'context_clarification',
        content: `I noticed you're working on ${industryClue.value} projects. Which state are you based in? This helps me provide the right local regulations and standards.`,
        data: {
          industry: industryClue.value,
          needsLocation: true
        },
        priority: 8
      });
    }

    // Service type specific insights
    const serviceClue = contextClues.find(c => c.type === 'service_type');
    if (serviceClue && industryClue) {
      const insights = await this.getServiceTypeInsights(industryClue.value, serviceClue.value);
      if (insights.length > 0) {
        suggestions.push({
          type: 'industry_insight',
          content: `For ${serviceClue.value} ${industryClue.value} work, here are some key considerations: ${insights.join(', ')}. Should I look up the specific standards for this type of job?`,
          data: {
            serviceType: serviceClue.value,
            industry: industryClue.value,
            insights
          },
          priority: 7
        });
      }
    }

    // Proactive standard search based on work scale
    const scaleClue = contextClues.find(c => c.type === 'work_scale');
    if (scaleClue && industryClue) {
      const relevantStandards = await this.findRelevantStandards(
        industryClue.value,
        scaleClue.value,
        locationClue?.value
      );

      if (relevantStandards.length > 0) {
        suggestions.push({
          type: 'standard_confirmation',
          content: `Based on your ${scaleClue.value.replace('_', ' ')}, I found these relevant standards: ${relevantStandards.map(s => s.title).join(', ')}. Should I provide the details for any of these?`,
          data: {
            workScale: scaleClue.value,
            standards: relevantStandards
          },
          priority: 6
        });
      }
    }

    return suggestions.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Generate natural follow-up prompts
   */
  private generateSmartPrompts(
    contextClues: BusinessContextClue[],
    suggestions: ConversationSuggestion[]
  ): SmartPrompt[] {
    const prompts: SmartPrompt[] = [];

    // If we have industry but no specific job details
    const industryClue = contextClues.find(c => c.type === 'industry');
    if (industryClue && contextClues.length === 1) {
      prompts.push({
        question: `What type of ${industryClue.value} work are you planning?`,
        context: `User identified as ${industryClue.value} professional, need job specifics`,
        expectedAnswers: ['installation', 'repair', 'upgrade', 'maintenance', 'new build'],
        followUpActions: ['search_relevant_standards', 'estimate_job_value', 'check_compliance_requirements']
      });
    }

    // If we have industry and location but no service type
    const locationClue = contextClues.find(c => c.type === 'location');
    if (industryClue && locationClue && !contextClues.find(c => c.type === 'service_type')) {
      prompts.push({
        question: `Is this for a residential property, commercial building, or industrial facility?`,
        context: `Know industry (${industryClue.value}) and location (${locationClue.value}), need service type`,
        expectedAnswers: ['residential', 'commercial', 'industrial'],
        followUpActions: ['load_service_specific_standards', 'suggest_typical_requirements']
      });
    }

    return prompts;
  }

  /**
   * Store discovered context clues for future reference
   */
  private async storeContextClues(userId: string, clues: BusinessContextClue[]): Promise<void> {
    for (const clue of clues) {
      if (clue.confidence > 0.5) { // Only store high-confidence clues
        try {
          await businessContextService.learnFromInteraction(userId, 'context_discovery', {
            type: clue.type,
            value: clue.value,
            confidence: clue.confidence,
            evidence: clue.evidence
          });
        } catch (error) {
          logger.error(`Error storing context clue: ${error}`);
        }
      }
    }
  }

  /**
   * Get service-type specific insights
   */
  private async getServiceTypeInsights(industry: string, serviceType: string): Promise<string[]> {
    const insights: string[] = [];

    if (industry === 'electrical') {
      switch (serviceType) {
        case 'residential':
          insights.push('RCD protection required', 'smoke alarm compliance', 'safety switch testing');
          break;
        case 'commercial':
          insights.push('emergency lighting requirements', 'exit sign compliance', 'regular testing schedules');
          break;
        case 'industrial':
          insights.push('three-phase power requirements', 'industrial safety standards', 'equipment isolation procedures');
          break;
      }
    }

    return insights;
  }

  /**
   * Find relevant standards based on context
   */
  private async findRelevantStandards(
    industry: string,
    workScale: string,
    location?: string
  ): Promise<Array<{ title: string; relevance: number }>> {
    const searchQuery = `${industry} ${workScale.replace('_', ' ')} ${location || ''}`;
    
    try {
      const context = await industryKnowledgeService.getIndustryContext(searchQuery, 3);
      const standards = [...context.standards, ...context.regulations];
      
      return standards.map(std => ({
        title: std.title,
        relevance: std.relevanceScore
      })).sort((a, b) => b.relevance - a.relevance);
    } catch (error) {
      logger.error('Error finding relevant standards:', error);
      return [];
    }
  }

  /**
   * Generate response enhancement with natural context discovery
   */
  async enhanceResponse(
    userId: string,
    originalResponse: string,
    conversationAnalysis: {
      contextClues: BusinessContextClue[];
      suggestions: ConversationSuggestion[];
      smartPrompts: SmartPrompt[];
    }
  ): Promise<string> {
    let enhancedResponse = originalResponse;

    // Add the most important suggestion naturally
    const topSuggestion = conversationAnalysis.suggestions[0];
    if (topSuggestion) {
      enhancedResponse += `\n\n${topSuggestion.content}`;
    }

    // Add a smart prompt if context is incomplete
    const relevantPrompt = conversationAnalysis.smartPrompts[0];
    if (relevantPrompt && conversationAnalysis.contextClues.length < 3) {
      enhancedResponse += `\n\nTo give you more specific guidance: ${relevantPrompt.question}`;
    }

    return enhancedResponse;
  }
}

export const conversationIntelligenceService = ConversationIntelligenceService.getInstance();