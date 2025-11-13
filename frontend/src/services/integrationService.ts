// Integration Management Service
// Handles OAuth connections and integration status

import { api } from './api';
import type { ReactNode } from 'react';

export interface Integration {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  connected: boolean;
  benefits: string[];
  comingSoon?: boolean;
  category?: 'communication' | 'finance' | 'productivity' | 'other';
}

export interface IntegrationConnection {
  integrationId: string;
  userId: string;
  status: 'connected' | 'disconnected' | 'error';
  connectedAt?: string;
  lastSyncedAt?: string;
  metadata?: Record<string, any>;
}

class IntegrationService {
  /**
   * Fetch all available integrations and their connection status
   */
  async fetchIntegrations(): Promise<Integration[]> {
    try {
      // In production, this would fetch from /api/admin/integrations
      // For now, return mock data that matches the UI requirements
      return this.getMockIntegrations();
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
      throw error;
    }
  }

  /**
   * Connect to an integration via OAuth
   */
  async connectIntegration(integrationId: string): Promise<{ success: boolean; authUrl?: string }> {
    try {
      // Initiate OAuth flow
      const response = await api.post(`/admin/integrations/${integrationId}/connect`);

      if (response.authUrl) {
        // Redirect to OAuth provider
        window.location.href = response.authUrl;
        return { success: true, authUrl: response.authUrl };
      }

      return { success: response.success };
    } catch (error) {
      console.error('Failed to connect integration:', error);
      throw error;
    }
  }

  /**
   * Disconnect from an integration
   */
  async disconnectIntegration(integrationId: string): Promise<{ success: boolean }> {
    try {
      const response = await api.post(`/admin/integrations/${integrationId}/disconnect`);
      return { success: response.success };
    } catch (error) {
      console.error('Failed to disconnect integration:', error);
      throw error;
    }
  }

  /**
   * Get connection status for a specific integration
   */
  async getConnectionStatus(integrationId: string): Promise<IntegrationConnection | null> {
    try {
      const response = await api.get(`/admin/integrations/${integrationId}/status`);
      return response.connection;
    } catch (error) {
      console.error('Failed to fetch connection status:', error);
      return null;
    }
  }

  /**
   * Mock integrations data (will be replaced with real API data)
   */
  private getMockIntegrations(): Integration[] {
    return [
      {
        id: 'gmail',
        title: 'Gmail',
        description: 'Connect your Gmail account for email analysis and management',
        icon: null, // Will be replaced with actual icon component
        connected: true,
        benefits: [
          'Automatic email prioritization',
          'Smart inbox organization',
          'Quick response templates'
        ],
        category: 'communication'
      },
      {
        id: 'google-calendar',
        title: 'Google Calendar',
        description: 'Sync your calendar for scheduling and appointments',
        icon: null,
        connected: true,
        benefits: [
          'Automated scheduling',
          'Meeting reminders',
          'Calendar coordination'
        ],
        category: 'productivity'
      },
      {
        id: 'quickbooks',
        title: 'QuickBooks',
        description: 'Connect QuickBooks for invoicing and financial tracking',
        icon: null,
        connected: false,
        benefits: [
          'Automated invoicing',
          'Expense tracking',
          'Financial reports'
        ],
        category: 'finance'
      },
      {
        id: 'xero',
        title: 'Xero',
        description: 'Integrate Xero for accounting and bookkeeping',
        icon: null,
        connected: false,
        benefits: [
          'Real-time accounting',
          'Bank reconciliation',
          'Tax compliance'
        ],
        category: 'finance'
      },
      {
        id: 'hubspot',
        title: 'HubSpot CRM',
        description: 'Manage customer relationships and sales pipeline',
        icon: null,
        connected: false,
        comingSoon: true,
        benefits: [
          'Customer tracking',
          'Sales automation',
          'Lead management'
        ],
        category: 'other'
      },
      {
        id: 'slack',
        title: 'Slack',
        description: 'Get notifications and updates in Slack',
        icon: null,
        connected: false,
        comingSoon: true,
        benefits: [
          'Real-time notifications',
          'Team collaboration',
          'Quick updates'
        ],
        category: 'communication'
      }
    ];
  }
}

export const integrationService = new IntegrationService();
