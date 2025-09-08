/**
 * Global Type Definitions for Shared Package
 * Defines globals for Node.js and browser environments
 */

// Node.js globals
declare global {
  const process: {
    env: Record<string, string | undefined>;
  };

  const performance: {
    now(): number;
  };

  const global: {
    gc?: () => void;
  };

  // URL constructor (available in both Node.js and browsers)
  const URL: {
    new (url: string, base?: string): {
      toString(): string;
      searchParams: {
        set(name: string, value: string): void;
      };
    };
  };
}

export {}; // Make this a module