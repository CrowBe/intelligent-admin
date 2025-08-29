import { PrismaClient, IndustryItem, IndustrySource, ContentType, Prisma } from '@prisma/client';
import { BaseRepository } from './base/BaseRepository.js';

/**
 * Repository for IndustryItem entities
 */
export class IndustryItemRepository extends BaseRepository<
  IndustryItem,
  Prisma.IndustryItemCreateInput,
  Prisma.IndustryItemUpdateInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'industryItem');
  }

  /**
   * Search industry items by query string
   */
  async search(query: string, limit: number = 50): Promise<IndustryItem[]> {
    if (!query) {
      return [];
    }

    return await this.model.findMany({
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
  }

  /**
   * Find items by content type
   */
  async findByContentType(contentType: ContentType, limit?: number): Promise<IndustryItem[]> {
    return await this.model.findMany({
      where: { contentType },
      orderBy: { relevanceScore: 'desc' },
      take: limit
    });
  }

  /**
   * Find items by category
   */
  async findByCategory(category: string): Promise<IndustryItem[]> {
    return await this.model.findMany({
      where: { category },
      orderBy: { updatedAt: 'desc' }
    });
  }

  /**
   * Get categories with item counts
   */
  async getCategoriesWithCounts(): Promise<Array<{ category: string; count: number }>> {
    const result = await this.model.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });

    return result.map(item => ({
      category: item.category,
      count: item._count.id
    }));
  }

  /**
   * Get breakdown by source and content type
   */
  async getBreakdownBySourceAndType(): Promise<Array<{
    sourceId: string;
    contentType: ContentType;
    count: number;
  }>> {
    const result = await this.model.groupBy({
      by: ['sourceId', 'contentType'],
      _count: { id: true }
    });

    return result.map(item => ({
      sourceId: item.sourceId,
      contentType: item.contentType,
      count: item._count.id
    }));
  }

  /**
   * Find high relevance items
   */
  async findHighRelevanceItems(threshold: number = 0.7): Promise<IndustryItem[]> {
    return await this.model.findMany({
      where: {
        relevanceScore: { gte: threshold }
      },
      orderBy: { relevanceScore: 'desc' }
    });
  }

  /**
   * Update relevance scores for items
   */
  async updateRelevanceScores(scores: Array<{ id: string; score: number }>): Promise<void> {
    await this.prisma.$transaction(
      scores.map(({ id, score }) =>
        this.model.update({
          where: { id },
          data: { relevanceScore: score }
        })
      )
    );
  }
}

/**
 * Repository for IndustrySource entities
 */
export class IndustrySourceRepository extends BaseRepository<
  IndustrySource,
  Prisma.IndustrySourceCreateInput,
  Prisma.IndustrySourceUpdateInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'industrySource');
  }

  /**
   * Find active sources
   */
  async findActiveSources(): Promise<IndustrySource[]> {
    return await this.model.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Find sources needing crawl
   */
  async findSourcesNeedingCrawl(hoursThreshold: number = 24): Promise<IndustrySource[]> {
    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() - hoursThreshold);

    return await this.model.findMany({
      where: {
        isActive: true,
        OR: [
          { lastCrawled: null },
          { lastCrawled: { lt: thresholdDate } }
        ]
      },
      orderBy: { lastCrawled: 'asc' }
    });
  }

  /**
   * Update last crawled timestamp
   */
  async updateLastCrawled(id: string): Promise<IndustrySource> {
    return await this.update(id, {
      lastCrawled: new Date()
    });
  }

  /**
   * Get sources with item counts
   */
  async getSourcesWithItemCounts(): Promise<Array<IndustrySource & { itemCount: number }>> {
    const sources = await this.model.findMany({
      include: {
        _count: {
          select: { items: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return sources.map((source: any) => ({
      ...source,
      itemCount: source._count.items
    }));
  }

  /**
   * Find source by name
   */
  async findByName(name: string): Promise<IndustrySource | null> {
    return await this.model.findUnique({
      where: { name }
    });
  }

  /**
   * Toggle source active status
   */
  async toggleActiveStatus(id: string): Promise<IndustrySource> {
    const source = await this.findById(id);
    if (!source) {
      throw new Error('Source not found');
    }

    return await this.update(id, {
      isActive: !source.isActive
    });
  }
}
