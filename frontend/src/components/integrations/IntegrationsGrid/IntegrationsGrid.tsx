import React from 'react';
import { IntegrationCard } from '../IntegrationCard';
import { useIntegrations } from '@/hooks/useIntegrations';
import {
  Mail,
  Calendar,
  DollarSign,
  Users,
  MessageSquare,
  Slack
} from 'lucide-react';

// Icon mapping for integrations
const iconMap: Record<string, React.ReactNode> = {
  gmail: <Mail className="w-5 h-5 text-red-500 dark:text-red-400" />,
  calendar: <Calendar className="w-5 h-5 text-blue-500 dark:text-blue-400" />,
  'google-calendar': <Calendar className="w-5 h-5 text-blue-500 dark:text-blue-400" />,
  quickbooks: <DollarSign className="w-5 h-5 text-green-500 dark:text-green-400" />,
  xero: <DollarSign className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />,
  hubspot: <Users className="w-5 h-5 text-orange-500 dark:text-orange-400" />,
  slack: <Slack className="w-5 h-5 text-purple-500 dark:text-purple-400" />,
};

interface IntegrationsGridProps {
  onIntegrationConnect?: (integrationId: string) => void;
  onIntegrationDisconnect?: (integrationId: string) => void;
}

export function IntegrationsGrid({
  onIntegrationConnect,
  onIntegrationDisconnect
}: IntegrationsGridProps): React.ReactElement {
  const { integrations, loading, error, connect, disconnect } = useIntegrations();

  const handleConnect = async (integrationId: string): Promise<void> => {
    await connect(integrationId);
    onIntegrationConnect?.(integrationId);
  };

  const handleDisconnect = async (integrationId: string): Promise<void> => {
    await disconnect(integrationId);
    onIntegrationDisconnect?.(integrationId);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Failed to load integrations. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
      {integrations.map((integration) => (
        <IntegrationCard
          key={integration.id}
          title={integration.name}
          description={integration.description}
          icon={iconMap[integration.id] || <MessageSquare className="w-5 h-5 text-slate-500" />}
          connected={integration.isConnected}
          benefits={integration.benefits}
          comingSoon={integration.comingSoon}
          onConnect={() => handleConnect(integration.id)}
          onDisconnect={() => handleDisconnect(integration.id)}
        />
      ))}
    </div>
  );
}
