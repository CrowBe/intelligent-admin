import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { industryRouter } from '../industry.js';
import { IndustryService } from '../../services/industryService.js';

// Mock the service
vi.mock('../../services/industryService.js');

describe('Industry Routes', () => {
  let app: express.Application;
  let mockIndustryService: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/industry', industryRouter);

    // Create mock industry service
    mockIndustryService = {
      getStats: vi.fn(),
      getCategories: vi.fn(),
      getSources: vi.fn(),
      search: vi.fn(),
      updateKnowledgeBase: vi.fn(),
    };

    // Mock the service constructor
    const MockIndustryService = IndustryService as any;
    MockIndustryService.mockImplementation(() => mockIndustryService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /stats', () => {
    it('should return industry statistics', async () => {
      const mockStats = {
        totalItems: 1250,
        categories: {
          regulations: 456,
          standards: 389,
          guidelines: 405,
        },
        sources: {
          'Standards Australia': 892,
          'Safe Work Australia': 358,
        },
        lastUpdated: new Date().toISOString(),
        recentUpdates: 15,
      };

      mockIndustryService.getStats.mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/api/industry/stats');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStats);
      expect(mockIndustryService.getStats).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      mockIndustryService.getStats.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/industry/stats');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to get industry statistics'
      });
    });

    it('should handle service throwing non-Error objects', async () => {
      mockIndustryService.getStats.mockRejectedValue('String error');

      const response = await request(app)
        .get('/api/industry/stats');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to get industry statistics'
      });
    });
  });

  describe('GET /categories', () => {
    it('should return available categories', async () => {
      const mockCategories = [
        { id: 'electrical', name: 'Electrical Standards', count: 150 },
        { id: 'plumbing', name: 'Plumbing Regulations', count: 89 },
        { id: 'building', name: 'Building Codes', count: 234 },
        { id: 'safety', name: 'Safety Guidelines', count: 178 },
      ];

      mockIndustryService.getCategories.mockResolvedValue(mockCategories);

      const response = await request(app)
        .get('/api/industry/categories');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('categories', mockCategories);
      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
      expect(mockIndustryService.getCategories).toHaveBeenCalledTimes(1);
    });

    it('should handle empty categories', async () => {
      mockIndustryService.getCategories.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/industry/categories');

      expect(response.status).toBe(200);
      expect(response.body.categories).toEqual([]);
    });

    it('should handle service errors', async () => {
      mockIndustryService.getCategories.mockRejectedValue(new Error('Categories not accessible'));

      const response = await request(app)
        .get('/api/industry/categories');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to get categories'
      });
    });
  });

  describe('GET /sources', () => {
    it('should return available sources', async () => {
      const mockSources = [
        { 
          id: 'standards-australia',
          name: 'Standards Australia',
          url: 'https://www.standards.org.au',
          isActive: true,
          lastUpdated: '2024-01-15T10:30:00Z',
          itemCount: 892
        },
        {
          id: 'safe-work-australia',
          name: 'Safe Work Australia',
          url: 'https://www.safeworkaustralia.gov.au',
          isActive: true,
          lastUpdated: '2024-01-14T15:45:00Z',
          itemCount: 358
        }
      ];

      mockIndustryService.getSources.mockResolvedValue(mockSources);

      const response = await request(app)
        .get('/api/industry/sources');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('sources', mockSources);
      expect(response.body).toHaveProperty('timestamp');
      expect(mockIndustryService.getSources).toHaveBeenCalledTimes(1);
    });

    it('should handle sources service errors', async () => {
      mockIndustryService.getSources.mockRejectedValue(new Error('Sources unavailable'));

      const response = await request(app)
        .get('/api/industry/sources');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to get sources'
      });
    });
  });

  describe('GET /search', () => {
    it('should search industry items with query', async () => {
      const mockSearchResults = {
        results: [
          {
            id: 'item-1',
            title: 'Electrical Installation Standards AS 3000',
            category: 'electrical',
            summary: 'Australian Standard for electrical installations',
            relevanceScore: 0.95,
            source: 'Standards Australia',
            lastUpdated: '2024-01-10T08:00:00Z'
          },
          {
            id: 'item-2',
            title: 'Electrical Safety in Construction',
            category: 'safety',
            summary: 'Guidelines for electrical safety on construction sites',
            relevanceScore: 0.87,
            source: 'Safe Work Australia',
            lastUpdated: '2024-01-08T14:30:00Z'
          }
        ],
        total: 2,
        query: 'electrical safety',
        timestamp: new Date().toISOString()
      };

      mockIndustryService.search.mockResolvedValue(mockSearchResults);

      const response = await request(app)
        .get('/api/industry/search')
        .query({ q: 'electrical safety', limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSearchResults);
      expect(mockIndustryService.search).toHaveBeenCalledWith('electrical safety', 10);
    });

    it('should handle search without query', async () => {
      const mockEmptyResults = {
        results: [],
        total: 0,
        query: '',
        timestamp: new Date().toISOString()
      };

      mockIndustryService.search.mockResolvedValue(mockEmptyResults);

      const response = await request(app)
        .get('/api/industry/search');

      expect(response.status).toBe(200);
      expect(mockIndustryService.search).toHaveBeenCalledWith('', 10);
    });

    it('should use default limit when not provided', async () => {
      mockIndustryService.search.mockResolvedValue({ results: [], total: 0 });

      await request(app)
        .get('/api/industry/search')
        .query({ q: 'test' });

      expect(mockIndustryService.search).toHaveBeenCalledWith('test', 10);
    });

    it('should handle custom limit parameter', async () => {
      mockIndustryService.search.mockResolvedValue({ results: [], total: 0 });

      await request(app)
        .get('/api/industry/search')
        .query({ q: 'plumbing', limit: '25' });

      expect(mockIndustryService.search).toHaveBeenCalledWith('plumbing', 25);
    });

    it('should handle search service errors', async () => {
      mockIndustryService.search.mockRejectedValue(new Error('Search service unavailable'));

      const response = await request(app)
        .get('/api/industry/search')
        .query({ q: 'test search' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to search industry items'
      });
    });

    it('should trim whitespace from search query', async () => {
      mockIndustryService.search.mockResolvedValue({ results: [], total: 0 });

      await request(app)
        .get('/api/industry/search')
        .query({ q: '  electrical wiring  ' });

      expect(mockIndustryService.search).toHaveBeenCalledWith('electrical wiring', 10);
    });
  });

  describe('POST /update', () => {
    it('should update knowledge base successfully', async () => {
      const mockUpdateResult = {
        success: true,
        itemsUpdated: 45,
        itemsAdded: 12,
        itemsRemoved: 3,
        categories: ['electrical', 'plumbing', 'safety'],
        sources: ['Standards Australia', 'Safe Work Australia'],
        duration: 5420, // milliseconds
        lastUpdated: new Date().toISOString(),
        errors: []
      };

      mockIndustryService.updateKnowledgeBase.mockResolvedValue(mockUpdateResult);

      const response = await request(app)
        .post('/api/industry/update');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUpdateResult);
      expect(mockIndustryService.updateKnowledgeBase).toHaveBeenCalledTimes(1);
    });

    it('should handle update with partial success', async () => {
      const mockUpdateResult = {
        success: false,
        itemsUpdated: 23,
        itemsAdded: 5,
        itemsRemoved: 0,
        categories: ['electrical'],
        sources: ['Standards Australia'],
        duration: 8900,
        lastUpdated: new Date().toISOString(),
        errors: [
          'Failed to fetch from Safe Work Australia: Timeout',
          'Plumbing category update failed: Access denied'
        ]
      };

      mockIndustryService.updateKnowledgeBase.mockResolvedValue(mockUpdateResult);

      const response = await request(app)
        .post('/api/industry/update');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toHaveLength(2);
    });

    it('should handle update service errors', async () => {
      mockIndustryService.updateKnowledgeBase.mockRejectedValue(new Error('Update service crashed'));

      const response = await request(app)
        .post('/api/industry/update');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to update knowledge base'
      });
    });
  });

  describe('Service Integration', () => {
    it('should handle service initialization correctly', async () => {
      // Test that service is only initialized once across multiple requests
      mockIndustryService.getStats.mockResolvedValue({ totalItems: 100 });

      await request(app).get('/api/industry/stats');
      await request(app).get('/api/industry/stats');

      // Service should be created once but called twice
      expect(IndustryService).toHaveBeenCalledTimes(1);
      expect(mockIndustryService.getStats).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed query parameters', async () => {
      mockIndustryService.search.mockResolvedValue({ results: [], total: 0 });

      const response = await request(app)
        .get('/api/industry/search')
        .query({ limit: 'invalid-number' });

      expect(response.status).toBe(200);
      expect(mockIndustryService.search).toHaveBeenCalledWith('', 0);
    });

    it('should handle negative limit values', async () => {
      mockIndustryService.search.mockResolvedValue({ results: [], total: 0 });

      const response = await request(app)
        .get('/api/industry/search')
        .query({ limit: '-5' });

      expect(response.status).toBe(200);
      expect(mockIndustryService.search).toHaveBeenCalledWith('', -5);
    });

    it('should handle very long search queries', async () => {
      const longQuery = 'a'.repeat(1000);
      mockIndustryService.search.mockResolvedValue({ results: [], total: 0 });

      const response = await request(app)
        .get('/api/industry/search')
        .query({ q: longQuery });

      expect(response.status).toBe(200);
      expect(mockIndustryService.search).toHaveBeenCalledWith(longQuery, 10);
    });

    it('should handle service timeout scenarios', async () => {
      mockIndustryService.updateKnowledgeBase.mockRejectedValue(
        new Error('Request timeout after 30 seconds')
      );

      const response = await request(app)
        .post('/api/industry/update');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to update knowledge base');
    });
  });
});