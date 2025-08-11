import { logger } from '../utils/logger.js';
import { prisma } from '../db/index.js';
import * as cheerio from 'cheerio';
import axios from 'axios';



/**
 * Industry Knowledge Service
 * Handles Australian trade industry data collection and processing
 */

export interface IndustrySource {
  id: string;
  name: string;
  url: string;
  type: 'standards' | 'regulations' | 'association' | 'publication';
  lastUpdated?: Date;
  status: 'active' | 'inactive' | 'error';
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  source: string;
  category: string;
  tags: string[];
  relevanceScore: number;
  lastUpdated: Date;
  url?: string;
}

export interface IndustryContext {
  regulations: KnowledgeItem[];
  standards: KnowledgeItem[];
  pricing: KnowledgeItem[];
  safety: KnowledgeItem[];
}

class IndustryKnowledgeService {
  private static instance: IndustryKnowledgeService;
  private sources: IndustrySource[] = [];
  private knowledgeCache: Map<string, KnowledgeItem[]> = new Map();
  private lastUpdate: Date = new Date(0);

  private constructor() {
    this.initializeSources();
  }

  public static getInstance(): IndustryKnowledgeService {
    if (!IndustryKnowledgeService.instance) {
      IndustryKnowledgeService.instance = new IndustryKnowledgeService();
    }
    return IndustryKnowledgeService.instance;
  }

  /**
   * Initialize industry data sources
   */
  private initializeSources(): void {
    this.sources = [
      {
        id: 'australian-standards',
        name: 'Australian Standards (AS/NZS)',
        url: 'https://www.standards.org.au',
        type: 'standards',
        status: 'active'
      },
      {
        id: 'esv-regulations',
        name: 'Energy Safe Victoria',
        url: 'https://www.esv.vic.gov.au',
        type: 'regulations',
        status: 'active'
      },
      {
        id: 'mea-data',
        name: 'Master Electricians Australia',
        url: 'https://www.masterelectricians.com.au',
        type: 'association',
        status: 'active'
      },
      {
        id: 'electrical-connection',
        name: 'Electrical Connection Magazine',
        url: 'https://www.electricalconnection.com.au',
        type: 'publication',
        status: 'active'
      }
    ];
  }

  /**
   * Scrape and process industry data from sources
   */
  public async updateKnowledgeBase(): Promise<void> {
    logger.info('Starting industry knowledge base update');
    
    try {
      for (const source of this.sources) {
        if (source.status === 'active') {
          logger.info(`Processing source: ${source.name}`);
          
          try {
            const data = await this.scrapeSource(source);
            await this.processSourceData(source, data);
            
            source.lastUpdated = new Date();
            logger.info(`Successfully processed ${source.name}`);
          } catch (error) {
            logger.error(`Error processing ${source.name}:`, error);
            source.status = 'error';
          }
        }
      }
      
      this.lastUpdate = new Date();
      logger.info('Industry knowledge base update completed');
    } catch (error) {
      logger.error('Error updating knowledge base:', error);
      throw error;
    }
  }

  /**
   * Scrape data from a specific industry source
   */
  private async scrapeSource(source: IndustrySource): Promise<string> {
    try {
      const response = await axios.get(source.url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; IntelligentAdmin/1.0; +https://intelligentadmin.com.au)'
        }
      });
      
      return response.data;
    } catch (error) {
      logger.error(`Failed to scrape ${source.name}:`, error);
      throw error;
    }
  }

  /**
   * Process and extract knowledge from scraped data
   */
  private async processSourceData(source: IndustrySource, html: string): Promise<void> {
    const $ = cheerio.load(html);
    const items: KnowledgeItem[] = [];

    try {
      switch (source.type) {
        case 'standards':
          await this.processStandardsData($, source, items);
          break;
        case 'regulations':
          await this.processRegulationsData($, source, items);
          break;
        case 'association':
          await this.processAssociationData($, source, items);
          break;
        case 'publication':
          await this.processPublicationData($, source, items);
          break;
      }

      // Store processed items in cache
      this.knowledgeCache.set(source.id, items);
      
      // Save to database
      await this.saveItemsToDatabase(source, items);
      
      logger.info(`Processed ${items.length} items from ${source.name}`);
    } catch (error) {
      logger.error(`Error processing data from ${source.name}:`, error);
      throw error;
    }
  }

  /**
   * Save knowledge items to database
   */
  private async saveItemsToDatabase(source: IndustrySource, items: KnowledgeItem[]): Promise<void> {
    try {
      // First, mark existing items from this source as inactive
      await prisma.industryKnowledge.updateMany({
        where: { source: source.id },
        data: { isActive: false }
      });

      // Create new records
      const dbItems = items.map(item => ({
        source: source.id,
        sourceUrl: item.url,
        contentType: this.mapCategoryToContentType(item.category),
        category: 'electrical', // Default to electrical for now
        title: item.title.substring(0, 500), // Ensure title fits
        content: item.content,
        extractedData: JSON.stringify({
          tags: item.tags,
          relevanceScore: item.relevanceScore
        }),
        relevanceScore: item.relevanceScore,
        lastUpdated: item.lastUpdated,
        nextUpdateDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        isActive: true
      }));

      if (dbItems.length > 0) {
        await prisma.industryKnowledge.createMany({
          data: dbItems,
          skipDuplicates: true
        });
        
        logger.info(`Saved ${dbItems.length} items to database from ${source.name}`);
      }
    } catch (error) {
      logger.error(`Error saving items to database from ${source.name}:`, error);
      throw error;
    }
  }

  /**
   * Map category to content type for database
   */
  private mapCategoryToContentType(category: string): string {
    const mapping: { [key: string]: string } = {
      'standards': 'standard',
      'regulations': 'regulation',
      'safety': 'regulation',
      'pricing': 'pricing',
      'general': 'best_practice',
      'training': 'best_practice',
      'industry-news': 'best_practice'
    };
    
    return mapping[category] || 'best_practice';
  }

  /**
   * Process Australian Standards data
   */
  private async processStandardsData(
    $: cheerio.Root, 
    source: IndustrySource, 
    items: KnowledgeItem[]
  ): Promise<void> {
    // Process electrical standards (AS/NZS 3000, AS/NZS 3008, etc.)
    $('.standard-item, .search-result').each((index, element) => {
      const title = $(element).find('h3, .title').text().trim();
      const content = $(element).find('.description, .summary').text().trim();
      const standardNumber = this.extractStandardNumber(title);
      
      if (title && content && this.isElectricalStandard(standardNumber)) {
        items.push({
          id: `${source.id}-${Date.now()}-${index}`,
          title,
          content,
          source: source.name,
          category: 'standards',
          tags: this.extractTags(title, content),
          relevanceScore: this.calculateRelevanceScore(title, content, 'electrical'),
          lastUpdated: new Date(),
          url: $(element).find('a').attr('href')
        });
      }
    });
  }

  /**
   * Process ESV regulations data
   */
  private async processRegulationsData(
    $: cheerio.Root, 
    source: IndustrySource, 
    items: KnowledgeItem[]
  ): Promise<void> {
    // Process electrical safety regulations
    $('.regulation-item, .content-item').each((index, element) => {
      const title = $(element).find('h2, h3, .title').text().trim();
      const content = $(element).find('p, .content').text().trim();
      
      if (title && content) {
        items.push({
          id: `${source.id}-${Date.now()}-${index}`,
          title,
          content,
          source: source.name,
          category: 'regulations',
          tags: this.extractTags(title, content),
          relevanceScore: this.calculateRelevanceScore(title, content, 'safety'),
          lastUpdated: new Date(),
          url: $(element).find('a').attr('href')
        });
      }
    });
  }

  /**
   * Process MEA association data
   */
  private async processAssociationData(
    $: cheerio.Root, 
    source: IndustrySource, 
    items: KnowledgeItem[]
  ): Promise<void> {
    // Process industry news, pricing guides, certification info
    $('.news-item, .guide-item, .pricing-item').each((index, element) => {
      const title = $(element).find('h2, h3, .title').text().trim();
      const content = $(element).find('.excerpt, .summary, p').text().trim();
      
      if (title && content) {
        const category = this.categorizeAssociationContent(title, content);
        items.push({
          id: `${source.id}-${Date.now()}-${index}`,
          title,
          content,
          source: source.name,
          category,
          tags: this.extractTags(title, content),
          relevanceScore: this.calculateRelevanceScore(title, content, category),
          lastUpdated: new Date(),
          url: $(element).find('a').attr('href')
        });
      }
    });
  }

  /**
   * Process trade publication data
   */
  private async processPublicationData(
    $: cheerio.Root, 
    source: IndustrySource, 
    items: KnowledgeItem[]
  ): Promise<void> {
    // Process articles and industry news
    $('.article-item, .post-item').each((index, element) => {
      const title = $(element).find('h2, h3, .title').text().trim();
      const content = $(element).find('.excerpt, .summary').text().trim();
      
      if (title && content) {
        items.push({
          id: `${source.id}-${Date.now()}-${index}`,
          title,
          content,
          source: source.name,
          category: 'industry-news',
          tags: this.extractTags(title, content),
          relevanceScore: this.calculateRelevanceScore(title, content, 'news'),
          lastUpdated: new Date(),
          url: $(element).find('a').attr('href')
        });
      }
    });
  }

  /**
   * Get relevant industry context for a query
   */
  public async getIndustryContext(query: string, limit: number = 10): Promise<IndustryContext> {
    const allItems: KnowledgeItem[] = [];
    
    // Combine all cached knowledge items
    for (const items of this.knowledgeCache.values()) {
      allItems.push(...items);
    }

    // Filter and score items based on query relevance
    const relevantItems = allItems
      .filter(item => this.isRelevantToQuery(item, query))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    // Categorize results
    return {
      regulations: relevantItems.filter(item => item.category === 'regulations'),
      standards: relevantItems.filter(item => item.category === 'standards'),
      pricing: relevantItems.filter(item => item.category === 'pricing'),
      safety: relevantItems.filter(item => item.category === 'safety')
    };
  }

  /**
   * Helper methods
   */
  private extractStandardNumber(title: string): string {
    const match = title.match(/AS\/NZS?\s*(\d+)/i);
    return match ? match[1] : '';
  }

  private isElectricalStandard(standardNumber: string): boolean {
    const electricalStandards = ['3000', '3008', '3017', '3100', '3112', '4755'];
    return electricalStandards.includes(standardNumber);
  }

  private extractTags(title: string, content: string): string[] {
    const text = `${title} ${content}`.toLowerCase();
    const tags = [];
    
    // Common electrical terms
    const electricalTerms = [
      'wiring', 'installation', 'safety', 'voltage', 'current', 'circuit',
      'switchboard', 'cable', 'conduit', 'earthing', 'protection', 'testing'
    ];
    
    electricalTerms.forEach(term => {
      if (text.includes(term)) {
        tags.push(term);
      }
    });
    
    return tags;
  }

  private calculateRelevanceScore(title: string, content: string, context: string): number {
    let score = 0;
    const text = `${title} ${content}`.toLowerCase();
    
    // Base score
    score += 50;
    
    // Boost for electrical terms
    if (text.includes('electrical') || text.includes('electrician')) score += 20;
    if (text.includes('australian') || text.includes('victoria')) score += 15;
    if (text.includes('safety') || text.includes('regulation')) score += 15;
    if (text.includes('standard') || text.includes('as/nzs')) score += 10;
    
    // Context-specific boosts
    switch (context) {
      case 'safety':
        if (text.includes('safety') || text.includes('hazard')) score += 25;
        break;
      case 'electrical':
        if (text.includes('wiring') || text.includes('installation')) score += 20;
        break;
      case 'pricing':
        if (text.includes('cost') || text.includes('price')) score += 20;
        break;
    }
    
    return Math.min(score, 100);
  }

  private categorizeAssociationContent(title: string, content: string): string {
    const text = `${title} ${content}`.toLowerCase();
    
    if (text.includes('price') || text.includes('cost') || text.includes('rate')) {
      return 'pricing';
    }
    if (text.includes('safety') || text.includes('regulation') || text.includes('compliance')) {
      return 'safety';
    }
    if (text.includes('training') || text.includes('certification') || text.includes('license')) {
      return 'training';
    }
    
    return 'general';
  }

  private isRelevantToQuery(item: KnowledgeItem, query: string): boolean {
    const queryLower = query.toLowerCase();
    const itemText = `${item.title} ${item.content} ${item.tags.join(' ')}`.toLowerCase();
    
    // Simple keyword matching - can be enhanced with NLP
    return queryLower.split(' ').some(word => 
      word.length > 2 && itemText.includes(word)
    );
  }

  /**
   * Get knowledge base statistics
   */
  public getStats(): object {
    const totalItems = Array.from(this.knowledgeCache.values())
      .reduce((sum, items) => sum + items.length, 0);
      
    return {
      totalSources: this.sources.length,
      activeSources: this.sources.filter(s => s.status === 'active').length,
      totalItems: totalItems,
      lastUpdate: this.lastUpdate,
      cacheStatus: this.knowledgeCache.size > 0 ? 'loaded' : 'empty'
    };
  }
}

export const industryKnowledgeService = IndustryKnowledgeService.getInstance();