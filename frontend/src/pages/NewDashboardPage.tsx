import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuickActions } from '@/components/dashboard/QuickActions/QuickActions';
import { IntegrationsGrid } from '@/components/integrations/IntegrationsGrid';
import { ChatFab } from '@/components/chat/ChatFab';
import { ContextualChatInterface } from '@/components/chat/ContextualChatInterface';
import { BarChart, Puzzle, LayoutDashboard } from 'lucide-react';
import type { SectionContext } from '@/contexts/ChatContext';

/**
 * Modern Dashboard Page with Tab Navigation
 * Integrates QuickActions, Integrations, and Contextual Chat
 */
export function NewDashboardPage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState<SectionContext | null>(null);

  const handleChatAboutSection = (context: { section: string; data: any }): void => {
    setChatContext({
      page: 'dashboard',
      section: context.section,
      data: context.data
    });
    setIsChatOpen(true);
  };

  const handleIntegrationConnect = (integrationId: string): void => {
    console.log('Integration connected:', integrationId);
  };

  const handleIntegrationDisconnect = (integrationId: string): void => {
    console.log('Integration disconnected:', integrationId);
  };

  const handleCloseChatFab = (): void => {
    setIsChatOpen(false);
    // Clear context when closing to allow general chat next time
    setChatContext(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your business operations with AI-powered insights
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2">
              <Puzzle className="h-4 w-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <QuickActions onChatAbout={handleChatAboutSection} />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Connect Your Tools
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Integrate with your favorite business applications to streamline workflows
              </p>
            </div>
            <IntegrationsGrid
              onIntegrationConnect={handleIntegrationConnect}
              onIntegrationDisconnect={handleIntegrationDisconnect}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center">
              <BarChart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Analytics Coming Soon
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                We're building powerful analytics to help you track business performance,
                identify trends, and make data-driven decisions.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat FAB */}
      <ChatFab onClick={() => setIsChatOpen(!isChatOpen)} isOpen={isChatOpen} />

      {/* Contextual Chat Interface */}
      <ContextualChatInterface
        currentPage="dashboard"
        pageContext={{
          activeTab,
          features: ['email-intelligence', 'scheduling', 'lead-management']
        }}
        sectionContext={chatContext}
        isOpen={isChatOpen}
        onClose={handleCloseChatFab}
        onMinimize={() => setIsChatOpen(false)}
      />
    </div>
  );
}
