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
global.fetch = vi.fn();

// Mock File and FileReader for file upload tests
Object.defineProperty(window, 'File', {
  writable: true,
  value: class MockFile {
    constructor(public name: string, public type: string, public size: number = 1024) {}
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