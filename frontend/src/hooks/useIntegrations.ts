// useIntegrations Hook
// Manages integration connections and status

import { useState, useEffect, useCallback } from 'react';
import { integrationService, type Integration } from '../services/integrationService';
import { toast } from 'sonner';

export interface UseIntegrationsReturn {
  integrations: Integration[];
  loading: boolean;
  error: Error | null;
  connect: (integrationId: string) => Promise<void>;
  disconnect: (integrationId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useIntegrations(): UseIntegrationsReturn {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchIntegrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await integrationService.fetchIntegrations();
      setIntegrations(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch integrations'));
      console.error('Error fetching integrations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchIntegrations();
  }, [fetchIntegrations]);

  const connect = useCallback(async (integrationId: string) => {
    try {
      const integration = integrations.find(i => i.id === integrationId);

      if (integration?.comingSoon) {
        toast.info(`${integration.title} integration coming soon!`, {
          description: 'This integration is currently under development.'
        });
        return;
      }

      toast.loading('Connecting integration...');

      const result = await integrationService.connectIntegration(integrationId);

      if (result.success) {
        // Update local state optimistically
        setIntegrations(prev =>
          prev.map(i =>
            i.id === integrationId ? { ...i, connected: true } : i
          )
        );

        toast.success('Integration connected successfully!', {
          description: `You can now use ${integration?.title} features.`
        });

        // Refresh to get latest status
        await refresh();
      }
    } catch (err) {
      console.error('Error connecting integration:', err);
      toast.error('Failed to connect integration', {
        description: err instanceof Error ? err.message : 'Please try again later.'
      });
    }
  }, [integrations, refresh]);

  const disconnect = useCallback(async (integrationId: string) => {
    try {
      const integration = integrations.find(i => i.id === integrationId);

      toast.loading('Disconnecting integration...');

      const result = await integrationService.disconnectIntegration(integrationId);

      if (result.success) {
        // Update local state optimistically
        setIntegrations(prev =>
          prev.map(i =>
            i.id === integrationId ? { ...i, connected: false } : i
          )
        );

        toast.success('Integration disconnected', {
          description: `${integration?.title} has been disconnected.`
        });

        // Refresh to get latest status
        await refresh();
      }
    } catch (err) {
      console.error('Error disconnecting integration:', err);
      toast.error('Failed to disconnect integration', {
        description: err instanceof Error ? err.message : 'Please try again later.'
      });
    }
  }, [integrations, refresh]);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  return {
    integrations,
    loading,
    error,
    connect,
    disconnect,
    refresh
  };
}
