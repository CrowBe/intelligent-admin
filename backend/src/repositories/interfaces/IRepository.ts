/**
 * Base repository interface defining common CRUD operations
 * for all repository implementations
 */
export interface IRepository<T, CreateDTO = any, UpdateDTO = any> {
  /**
   * Find a single entity by its ID
   * @param id - The unique identifier of the entity
   * @returns The entity if found, null otherwise
   */
  findById(id: string): Promise<T | null>;

  /**
   * Find all entities matching the given criteria
   * @param filter - Optional filter criteria
   * @param options - Optional query options (sorting, pagination, etc.)
   * @returns Array of matching entities
   */
  findAll(filter?: Partial<T>, options?: QueryOptions): Promise<T[]>;

  /**
   * Find a single entity matching the given criteria
   * @param filter - Filter criteria
   * @returns The first matching entity or null
   */
  findOne(filter: Partial<T>): Promise<T | null>;

  /**
   * Create a new entity
   * @param data - The data for creating the entity
   * @returns The created entity
   */
  create(data: CreateDTO): Promise<T>;

  /**
   * Create multiple entities
   * @param data - Array of data for creating entities
   * @returns Array of created entities
   */
  createMany(data: CreateDTO[]): Promise<T[]>;

  /**
   * Update an entity by its ID
   * @param id - The unique identifier of the entity
   * @param data - The data to update
   * @returns The updated entity
   */
  update(id: string, data: UpdateDTO): Promise<T>;

  /**
   * Update multiple entities matching the criteria
   * @param filter - Filter criteria for entities to update
   * @param data - The data to update
   * @returns Number of updated entities
   */
  updateMany(filter: Partial<T>, data: UpdateDTO): Promise<number>;

  /**
   * Delete an entity by its ID
   * @param id - The unique identifier of the entity
   * @returns The deleted entity
   */
  delete(id: string): Promise<T>;

  /**
   * Delete multiple entities matching the criteria
   * @param filter - Filter criteria for entities to delete
   * @returns Number of deleted entities
   */
  deleteMany(filter: Partial<T>): Promise<number>;

  /**
   * Count entities matching the given criteria
   * @param filter - Optional filter criteria
   * @returns The count of matching entities
   */
  count(filter?: Partial<T>): Promise<number>;

  /**
   * Check if an entity exists matching the given criteria
   * @param filter - Filter criteria
   * @returns True if entity exists, false otherwise
   */
  exists(filter: Partial<T>): Promise<boolean>;
}

/**
 * Query options for repository operations
 */
export interface QueryOptions {
  /**
   * Fields to sort by
   */
  orderBy?: Record<string, 'asc' | 'desc'> | Array<Record<string, 'asc' | 'desc'>>;

  /**
   * Number of records to skip
   */
  skip?: number;

  /**
   * Maximum number of records to return
   */
  take?: number;

  /**
   * Fields to include in the result
   */
  include?: Record<string, boolean | object>;

  /**
   * Fields to select
   */
  select?: Record<string, boolean>;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  pageSize: number;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
