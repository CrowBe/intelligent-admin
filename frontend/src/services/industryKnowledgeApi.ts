import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

export interface IndustryStats {
  totalSources: number;
  activeSources: number;
  totalItems: number;
  lastUpdate: Date;
  cacheStatus: string;
  databaseBreakdown: Array<{
    source: string;
    contentType: string;
    _count: { id: number };
  }>;
  timestamp: string;
}

export interface IndustryKnowledgeItem {
  id: string;
  source: string;
  contentType: string;
  category: string;
  title: string;
  content: string;
  relevanceScore: number;
  lastUpdated: Date;
  sourceUrl?: string;
}

export interface IndustrySearchResult {
  query: string;
  results: {
    contextual: {
      regulations: IndustryKnowledgeItem[];
      standards: IndustryKnowledgeItem[];
      pricing: IndustryKnowledgeItem[];
      safety: IndustryKnowledgeItem[];
    };
    database: IndustryKnowledgeItem[];
  };
  totalResults: number;
  timestamp: string;
}

export interface IndustryCategory {
  name: string;
  count: number;
}

export interface IndustrySource {
  name: string;
  itemCount: number;
  lastUpdated: Date;
}

class IndustryKnowledgeApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/v1/industry`;
  }

  /**
   * Get authorization headers with Kinde token
   */
  private async getAuthHeaders(getToken?: () => Promise<string | null>): Promise<HeadersInit> {
    let token = '';
    if (getToken) {
      token = await getToken() || '';
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get industry knowledge statistics
   */
  async getStats(getToken?: () => Promise<string | null>): Promise<IndustryStats> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      
      const response = await fetch(`${this.baseUrl}/stats`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching industry stats:', error);
      throw error;
    }
  }

  /**
   * Trigger industry knowledge update
   */
  async updateKnowledgeBase(getToken?: () => Promise<string | null>): Promise<{ message: string; status: string; timestamp: string }> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      
      const response = await fetch(`${this.baseUrl}/update`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating industry knowledge base:', error);
      throw error;
    }
  }

  /**
   * Search industry knowledge
   */
  async searchKnowledge(
    query: string, 
    limit: number = 10,
    getToken?: () => Promise<string | null>
  ): Promise<IndustrySearchResult> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString()
      });
      
      const response = await fetch(`${this.baseUrl}/search?${params}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching industry knowledge:', error);
      throw error;
    }
  }

  /**
   * Get knowledge by category
   */
  async getKnowledgeByCategory(
    category: string,
    limit: number = 20,
    getToken?: () => Promise<string | null>
  ): Promise<{ category: string; results: IndustryKnowledgeItem[]; totalResults: number; timestamp: string }> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      const params = new URLSearchParams({ limit: limit.toString() });
      
      const response = await fetch(`${this.baseUrl}/category/${encodeURIComponent(category)}?${params}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching knowledge by category:', error);
      throw error;
    }
  }

  /**
   * Get available categories
   */
  async getCategories(getToken?: () => Promise<string | null>): Promise<{ categories: IndustryCategory[]; timestamp: string }> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      
      const response = await fetch(`${this.baseUrl}/categories`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Get industry sources status
   */
  async getSources(getToken?: () => Promise<string | null>): Promise<{ sources: IndustrySource[]; timestamp: string }> {
    try {
      const headers = await this.getAuthHeaders(getToken);
      
      const response = await fetch(`${this.baseUrl}/sources`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching sources:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const industryKnowledgeApi = new IndustryKnowledgeApiService();