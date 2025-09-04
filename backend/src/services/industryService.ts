import type { ContentType } from '@prisma/client';
import type { IndustryItemRepository, IndustrySourceRepository } from '../repositories/IndustryRepository.js';
import { DIContainer } from '../repositories/RepositoryFactory.js';

export class IndustryService {
  private readonly itemRepository: IndustryItemRepository;
  private readonly sourceRepository: IndustrySourceRepository;
  
  constructor() {
    const container = DIContainer.getInstance();
    this.itemRepository = container.industryItem;
    this.sourceRepository = container.industrySource;
  }

  async getStats() {
    const [totalItems, activeSources, totalSources, lastItem] = await Promise.all([
      this.itemRepository.count(),
      this.sourceRepository.count({ isActive: true } as any),
      this.sourceRepository.count(),
      this.itemRepository.findOne({} as any)
    ]);

    const databaseBreakdown = await this.itemRepository.getBreakdownBySourceAndType();

    // Join with source names
    const sources = await this.sourceRepository.findAll();
    const sourceMap = new Map(sources.map(s => [s.id, s.name] as const));

    return {
      totalSources,
      activeSources,
      totalItems,
      lastUpdate: lastItem?.updatedAt || null,
      cacheStatus: totalItems > 0 ? 'loaded' : 'empty',
      databaseBreakdown: databaseBreakdown.map(b => ({
        source: sourceMap.get(b.sourceId) || b.sourceId,
        contentType: b.contentType,
        _count: { id: b.count }
      })),
      timestamp: new Date().toISOString(),
    };
  }

  async getCategories() {
    const categories = await this.itemRepository.getCategoriesWithCounts();
    return categories.map(c => ({ name: c.category, count: c.count }));
  }

  async getSources() {
    const sources = await this.sourceRepository.getSourcesWithItemCounts();
    return sources.map(s => ({ 
      name: s.name, 
      itemCount: s.itemCount, 
      lastUpdated: s.lastCrawled || s.updatedAt 
    }));
  }

  async search(query: string, limit: number) {
    if (!query) {
      return { 
        query, 
        results: { 
          contextual: { regulations: [], standards: [], pricing: [], safety: [] }, 
          database: [] 
        }, 
        totalResults: 0, 
        timestamp: new Date().toISOString() 
      };
    }

    const items = await this.itemRepository.search(query, limit);

    const convert = (it: any) => ({
      id: it.id,
      source: it.sourceId,
      contentType: it.contentType,
      category: it.category,
      title: it.title,
      content: it.content,
      relevanceScore: it.relevanceScore,
      lastUpdated: it.updatedAt,
      sourceUrl: it.sourceUrl,
    });

    const byType = (type: ContentType) => items.filter(i => i.contentType === type).map(convert);

    return {
      query,
      results: {
        contextual: {
          regulations: byType('regulation' as ContentType),
          standards: byType('standard' as ContentType),
          pricing: byType('pricing' as ContentType),
          safety: byType('safety' as ContentType),
        },
        database: items.map(convert)
      },
      totalResults: items.length,
      timestamp: new Date().toISOString()
    };
  }

  async updateKnowledgeBase() {
    // Placeholder: Ingestion stubs would go here (ESV, MEA, standards metadata, etc.)
    const started = new Date();
    
    let source = await this.sourceRepository.findByName('Seed Source');
    if (!source) {
      source = await this.sourceRepository.create({ name: 'Seed Source' });
    } else {
      source = await this.sourceRepository.updateLastCrawled(source.id);
    }

    // Seed one example item if none exists
    const existing = await this.itemRepository.count();
    if (existing === 0) {
      await this.itemRepository.create({
        source: { connect: { id: source.id } },
        contentType: 'regulation',
        category: 'electrical safety',
        title: 'ESV Electrical Safety Advisory',
        content: 'Advisory regarding updated electrical safety standards in Victoria. Always consult official sources for full details.',
        relevanceScore: 0.8,
        sourceUrl: 'https://esv.vic.gov.au',
      });
    }

    return { message: 'Knowledge base update triggered', status: 'ok', timestamp: new Date().toISOString(), startedAt: started.toISOString() };
  }
}
