# Repository Pattern Implementation

This directory contains the implementation of the Repository Pattern for the Intelligent Admin backend, providing a clean abstraction layer for data access.

## Architecture Overview

The repository pattern implementation consists of several key components:

### 1. Base Repository (`base/BaseRepository.ts`)
- Abstract base class implementing common CRUD operations
- Provides standard methods like `findById`, `create`, `update`, `delete`
- Includes pagination support
- Handles Prisma-specific transformations

### 2. Repository Interface (`interfaces/IRepository.ts`)
- Defines the contract for all repository implementations
- Includes TypeScript interfaces for:
  - `IRepository<T>` - Main repository interface
  - `QueryOptions` - Options for queries (sorting, pagination, etc.)
  - `PaginatedResult<T>` - Structure for paginated responses

### 3. Specific Repositories
Each model has its own repository with domain-specific methods:

- **IndustryRepository**: `IndustryItemRepository`, `IndustrySourceRepository`
- **NotificationRepository**: `NotificationPreferenceRepository`, `NotificationTokenRepository`, `NotificationLogRepository`
- **Other Repositories**: `UserRepository`, `TaskRepository`, `EmailAnalysisRepository`, etc.

### 4. Dependency Injection (`RepositoryFactory.ts`)
- `RepositoryFactory`: Singleton factory for creating repository instances
- `DIContainer`: Dependency injection container for managing repositories
- Ensures single instances of repositories throughout the application

### 5. Unit of Work (`UnitOfWork.ts`)
- Manages transactions across multiple repositories
- Provides transactional consistency
- Includes specialized implementations for business operations

## Usage Examples

### Basic Usage

```typescript
import { DIContainer } from './repositories/RepositoryFactory';
import { initializeDependencies } from './services/initialization';

// Initialize at application startup
initializeDependencies();

// Get repository instance
const container = DIContainer.getInstance();
const userRepo = container.user;

// Use repository methods
const user = await userRepo.findByEmail('user@example.com');
const newUser = await userRepo.create({
  email: 'new@example.com',
  name: 'New User'
});
```

### Using in Services

```typescript
export class IndustryService {
  private itemRepository: IndustryItemRepository;
  private sourceRepository: IndustrySourceRepository;
  
  constructor() {
    const container = DIContainer.getInstance();
    this.itemRepository = container.industryItem;
    this.sourceRepository = container.industrySource;
  }

  async search(query: string, limit: number) {
    return await this.itemRepository.search(query, limit);
  }
}
```

### Transactions with Unit of Work

```typescript
import { createUnitOfWork } from './repositories/UnitOfWork';
import { prisma } from './services/prisma';

const uow = createUnitOfWork(prisma, 'business');

await uow.transaction(async (transactionalUow) => {
  const userRepo = transactionalUow.repositories.getUserRepository();
  const taskRepo = transactionalUow.repositories.getTaskRepository();

  const user = await userRepo.create({
    email: 'user@example.com',
    name: 'User'
  });

  await taskRepo.create({
    userId: user.id,
    title: 'First Task',
    dueDate: new Date()
  });
});
```

### Pagination

```typescript
const paginatedResults = await industryItemRepo.findPaginated(
  { category: 'electrical' }, // filter
  { page: 1, pageSize: 10 },   // pagination
  { orderBy: { relevanceScore: 'desc' } } // options
);

console.log(paginatedResults);
// {
//   data: [...],
//   total: 50,
//   page: 1,
//   pageSize: 10,
//   totalPages: 5,
//   hasNext: true,
//   hasPrevious: false
// }
```

## Benefits

1. **Separation of Concerns**: Business logic is separated from data access logic
2. **Testability**: Easy to mock repositories for unit testing
3. **Consistency**: All repositories follow the same pattern and interface
4. **Type Safety**: Full TypeScript support with proper typing
5. **Transaction Support**: Clean transaction handling through Unit of Work
6. **Flexibility**: Easy to switch data sources or add caching layers

## Testing

Run the repository tests:

```bash
npm test -- repositories.test.ts
```

The test file (`__tests__/repositories.test.ts`) includes comprehensive tests for:
- CRUD operations
- Domain-specific methods
- Transaction handling
- Pagination
- Error scenarios

## Adding New Repositories

To add a new repository:

1. Create the repository class extending `BaseRepository`:

```typescript
export class MyModelRepository extends BaseRepository<
  MyModel,
  Prisma.MyModelCreateInput,
  Prisma.MyModelUpdateInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'myModel');
  }

  // Add domain-specific methods
  async findBySpecialField(value: string): Promise<MyModel | null> {
    return await this.model.findFirst({
      where: { specialField: value }
    });
  }
}
```

2. Add to the RepositoryFactory:

```typescript
getMyModelRepository(): MyModelRepository {
  const key = 'myModel';
  if (!this.repositories.has(key)) {
    this.repositories.set(key, new MyModelRepository(this.prisma));
  }
  return this.repositories.get(key);
}
```

3. Add to DIContainer:

```typescript
get myModel() {
  return this.repositoryFactory.getMyModelRepository();
}
```

## Best Practices

1. **Keep repositories focused**: Each repository should handle a single model
2. **Use transactions for related operations**: Leverage Unit of Work for consistency
3. **Implement domain-specific methods**: Add methods that make sense for the business domain
4. **Handle errors appropriately**: Catch and transform database errors into meaningful messages
5. **Use pagination for large datasets**: Always paginate when returning lists
6. **Test thoroughly**: Write tests for both success and failure scenarios

## Migration from Direct Prisma Usage

If migrating existing code:

1. Initialize DIContainer at startup
2. Replace direct Prisma calls with repository methods
3. Update services to use repositories instead of Prisma client
4. Add domain-specific methods as needed
5. Update tests to use repository pattern

## Future Enhancements

Potential improvements to consider:
- Caching layer integration
- Query builder pattern for complex queries
- Audit logging for data changes
- Soft delete support
- Event sourcing integration
