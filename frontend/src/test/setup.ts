import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Global test setup
beforeAll(() => {
  // Mock environment variables
  Object.defineProperty(import.meta, 'env', {
    value: {
      VITE_API_BASE_URL: 'http://localhost:3001/api/v1',
      DEV: false,
      PROD: false,
      MODE: 'test'
    },
    writable: true
  });
  
  // Mock console methods in tests
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

// Mock IntersectionObserver for components that use it
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
});

// Mock ResizeObserver
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock fetch for API calls
globalThis.fetch = vi.fn();

// Mock Blob for File constructor
Object.defineProperty(window, 'Blob', {
  writable: true,
  value: class MockBlob {
    public size: number;
    public type: string;
    private data: BlobPart[];
    
    constructor(blobParts: BlobPart[] = [], options: BlobPropertyBag = {}) {
      this.data = blobParts;
      this.type = options.type || '';
      this.size = blobParts.reduce((acc, part) => {
        if (typeof part === 'string') return acc + part.length;
        return acc + 1024; // Default size for non-string parts
      }, 0);
    }
    
    slice(start?: number, end?: number, contentType?: string): Blob {
      return new MockBlob([], { type: contentType });
    }
    
    async text(): Promise<string> {
      return this.data.join('');
    }
  },
});

// Mock File and FileReader for file upload tests
Object.defineProperty(window, 'File', {
  writable: true,
  value: class MockFile extends Blob {
    public name: string;
    public lastModified: number;
    public webkitRelativePath: string;
    
    constructor(bits: BlobPart[], name: string, options: FilePropertyBag = {}) {
      super(bits, { type: options.type });
      this.name = name;
      this.lastModified = options.lastModified || Date.now();
      this.webkitRelativePath = '';
    }
  },
});

Object.defineProperty(window, 'FileReader', {
  writable: true,
  value: class MockFileReader {
    result: string | null = null;
    onload: ((event: any) => void) | null = null;
    onerror: ((event: any) => void) | null = null;
    
    readAsDataURL() {
      setTimeout(() => {
        this.result = 'data:text/plain;base64,dGVzdA==';
        this.onload?.({ target: this });
      }, 10);
    }
    
    readAsText() {
      setTimeout(() => {
        this.result = 'test content';
        this.onload?.({ target: this });
      }, 10);
    }
  },
});