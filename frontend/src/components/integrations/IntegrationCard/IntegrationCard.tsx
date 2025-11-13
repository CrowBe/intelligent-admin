import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Plus, ExternalLink } from 'lucide-react';

interface IntegrationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  benefits?: string[];
  comingSoon?: boolean;
}

export function IntegrationCard({
  title,
  description,
  icon,
  connected,
  onConnect,
  onDisconnect,
  benefits = [],
  comingSoon = false
}: IntegrationCardProps): React.ReactElement {
  const handleManageConnection = (): void => {
    if (connected && onDisconnect !== undefined) {
      onDisconnect();
    }
  };

  return (
    <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3 mb-2 sm:mb-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
              {icon}
            </div>
            <div className="flex-1">
              <CardTitle className="text-base lg:text-lg text-slate-900 dark:text-white">{title}</CardTitle>
              <CardDescription className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                {description}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2 sm:flex-col sm:gap-1">
            {connected && (
              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700 text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            )}
            {comingSoon && (
              <Badge data-slot="badge" variant="outline" className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs">
                Coming Soon
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {benefits.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-slate-700 dark:text-slate-300">Benefits:</p>
            <ul className="space-y-1">
              {benefits.map((benefit, index) => (
                <li key={index} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-2">
          {connected ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleManageConnection}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          ) : (
            <Button
              className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white"
              onClick={onConnect}
              disabled={comingSoon}
            >
              <Plus className="w-4 h-4 mr-2" />
              {comingSoon ? 'Coming Soon' : 'Connect'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
