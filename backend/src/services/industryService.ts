import { PrismaClient, ContentType } from '@prisma/client';

export class IndustryService {
  constructor(private prisma: PrismaClient) {}

  async getStats() {
    const [totalItems, activeSources, totalSources, lastItem] = await Promise.all([
      this.prisma.industryItem.count(),
      this.prisma.industrySource.count({ where: { isActive: true } }),
      this.prisma.industrySource.count(),
      this.prisma.industryItem.findFirst({ orderBy: { updatedAt: 'desc' } })
    ]);

    const databaseBreakdown = await this.prisma.industryItem.groupBy({
      by: ['sourceId', 'contentType'],
      _count: { id: true },
    });

    // Join with source names
    const sources = await this.prisma.industrySource.findMany({ select: { id: true, name: true } });
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
        _count: { id: b._count.id }
      })),
      timestamp: new Date().toISOString(),
    };
  }

  async getCategories() {
    const categories = await this.prisma.industryItem.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });
    return categories.map(c => ({ name: c.category, count: c._count.id }));
  }

  async getSources() {
    const sources = await this.prisma.industrySource.findMany({
      orderBy: { name: 'asc' }
    });
    return sources.map(s => ({ name: s.name, itemCount: undefined as unknown as number, lastUpdated: s.lastCrawled || s.updatedAt }));
  }

  async search(query: string, limit: number) {
    if (!query) {
      return { query, results: { contextual: { regulations: [], standards: [], pricing: [], safety: [] }, database: [] }, totalResults: 0, timestamp: new Date().toISOString() };
    }

    const items = await this.prisma.industryItem.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: { relevanceScore: 'desc' },
      take: limit
    });

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
    const source = await this.prisma.industrySource.upsert({
      where: { name: 'Seed Source' },
      create: { name: 'Seed Source' },
      update: { lastCrawled: new Date() }
    });

    // Seed one example item if none exists
    const existing = await this.prisma.industryItem.count();
    if (existing === 0) {
      await this.prisma.industryItem.create({
        data: {
          sourceId: source.id,
          contentType: 'regulation',
          category: 'electrical safety',
          title: 'ESV Electrical Safety Advisory',
          content: 'Advisory regarding updated electrical safety standards in Victoria. Always consult official sources for full details.',
          relevanceScore: 0.8,
          sourceUrl: 'https://esv.vic.gov.au',
        }
      });
    }

    return { message: 'Knowledge base update triggered', status: 'ok', timestamp: new Date().toISOString(), startedAt: started.toISOString() };
  }
}
