import type { PrismaClient } from '@prisma/client';
import type { IRepository, QueryOptions, PaginatedResult, PaginationOptions } from '../interfaces/IRepository.js';

/**
 * Abstract base repository implementing common CRUD operations
 * using Prisma ORM
 */
export abstract class BaseRepository<T, CreateDTO = any, UpdateDTO = any> 
  implements IRepository<T, CreateDTO, UpdateDTO> {
  
  protected prisma: PrismaClient;
  protected modelName: string;

  constructor(prisma: PrismaClient, modelName: keyof PrismaClient) {
    this.prisma = prisma;
    this.modelName = modelName as string;
  }

  /**
   * Get the Prisma model delegate
   */
  protected get model(): any {
    return (this.prisma)[this.modelName];
  }

  /**
   * Transform filter to Prisma where clause
   */
  protected transformFilter(filter: Partial<T>): any {
    // Base implementation - can be overridden in child classes
    return filter;
  }

  /**
   * Transform options to Prisma query options
   */
  protected transformOptions(options?: QueryOptions): any {
    if (!options) {return {};}

    const prismaOptions: any = {};

    if (options.orderBy) {
      prismaOptions.orderBy = options.orderBy;
    }

    if (options.skip !== undefined) {
      prismaOptions.skip = options.skip;
    }

    if (options.take !== undefined) {
      prismaOptions.take = options.take;
    }

    if (options.include) {
      prismaOptions.include = options.include;
    }

    if (options.select) {
      prismaOptions.select = options.select;
    }

    return prismaOptions;
  }

  async findById(id: string): Promise<T | null> {
    try {
      return await this.model.findUnique({
        where: { id }
      });
    } catch (error) {
      throw new Error(`Error finding ${this.modelName} by id: ${error}`);
    }
  }

  async findAll(filter?: Partial<T>, options?: QueryOptions): Promise<T[]> {
    try {
      const where = filter ? this.transformFilter(filter) : undefined;
      const queryOptions = this.transformOptions(options);

      return await this.model.findMany({
        where,
        ...queryOptions
      });
    } catch (error) {
      throw new Error(`Error finding all ${this.modelName}: ${error}`);
    }
  }

  async findOne(filter: Partial<T>): Promise<T | null> {
    try {
      const where = this.transformFilter(filter);
      return await this.model.findFirst({
        where
      });
    } catch (error) {
      throw new Error(`Error finding ${this.modelName}: ${error}`);
    }
  }

  async create(data: CreateDTO): Promise<T> {
    try {
      return await this.model.create({
        data
      });
    } catch (error) {
      throw new Error(`Error creating ${this.modelName}: ${error}`);
    }
  }

  async createMany(data: CreateDTO[]): Promise<T[]> {
    try {
      // Use transaction to ensure all or nothing
      const results = await this.prisma.$transaction(
        data.map(item => this.model.create({ data: item }))
      );
      return results;
    } catch (error) {
      throw new Error(`Error creating multiple ${this.modelName}: ${error}`);
    }
  }

  async update(id: string, data: UpdateDTO): Promise<T> {
    try {
      return await this.model.update({
        where: { id },
        data
      });
    } catch (error) {
      throw new Error(`Error updating ${this.modelName}: ${error}`);
    }
  }

  async updateMany(filter: Partial<T>, data: UpdateDTO): Promise<number> {
    try {
      const where = this.transformFilter(filter);
      const result = await this.model.updateMany({
        where,
        data
      });
      return result.count;
    } catch (error) {
      throw new Error(`Error updating multiple ${this.modelName}: ${error}`);
    }
  }

  async delete(id: string): Promise<T> {
    try {
      return await this.model.delete({
        where: { id }
      });
    } catch (error) {
      throw new Error(`Error deleting ${this.modelName}: ${error}`);
    }
  }

  async deleteMany(filter: Partial<T>): Promise<number> {
    try {
      const where = this.transformFilter(filter);
      const result = await this.model.deleteMany({
        where
      });
      return result.count;
    } catch (error) {
      throw new Error(`Error deleting multiple ${this.modelName}: ${error}`);
    }
  }

  async count(filter?: Partial<T>): Promise<number> {
    try {
      const where = filter ? this.transformFilter(filter) : undefined;
      return await this.model.count({
        where
      });
    } catch (error) {
      throw new Error(`Error counting ${this.modelName}: ${error}`);
    }
  }

  async exists(filter: Partial<T>): Promise<boolean> {
    try {
      const count = await this.count(filter);
      return count > 0;
    } catch (error) {
      throw new Error(`Error checking existence of ${this.modelName}: ${error}`);
    }
  }

  /**
   * Get paginated results
   */
  async findPaginated(
    filter?: Partial<T>,
    pagination?: PaginationOptions,
    options?: QueryOptions
  ): Promise<PaginatedResult<T>> {
    const page = pagination?.page || 1;
    const pageSize = pagination?.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      this.findAll(filter, {
        ...options,
        skip,
        take: pageSize
      }),
      this.count(filter)
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    };
  }

  /**
   * Execute a raw query
   * @param query - The raw SQL query
   * @param params - Query parameters
   */
  async executeRaw(query: string, params?: any[]): Promise<any> {
    try {
      return await this.prisma.$queryRawUnsafe(query, ...(params || []));
    } catch (error) {
      throw new Error(`Error executing raw query: ${error}`);
    }
  }

  /**
   * Upsert (create or update) an entity
   */
  async upsert(
    where: Partial<T>,
    create: CreateDTO,
    update: UpdateDTO
  ): Promise<T> {
    try {
      return await this.model.upsert({
        where,
        create,
        update
      });
    } catch (error) {
      throw new Error(`Error upserting ${this.modelName}: ${error}`);
    }
  }
}
