import { prisma } from './prisma.js';
import { DIContainer } from '../repositories/RepositoryFactory.js';

/**
 * Initialize the dependency injection container
 * This should be called once at application startup
 */
export function initializeDependencies(): void {
  // Initialize DI Container with Prisma instance
  DIContainer.initialize(prisma);
  
  console.log('Dependency injection container initialized');
}

/**
 * Get the initialized DI container
 * Throws error if not initialized
 */
export function getContainer(): DIContainer {
  return DIContainer.getInstance();
}

/**
 * Cleanup function for graceful shutdown
 */
export async function cleanup(): Promise<void> {
  await prisma.$disconnect();
  console.log('Database connection closed');
}
