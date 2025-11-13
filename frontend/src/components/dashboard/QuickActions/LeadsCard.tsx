import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  TrendingUp,
  Star,
  Users,
  MessageCircle
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  company: string;
  value: string;
  lastContact: string;
  status: 'hot' | 'warm' | 'cold';
}

interface LeadsCardProps {
  onChatAbout?: (context: {
    hotLeads: Lead[];
    warmLeads: Lead[];
    totalValue: number;
    overdueCount: number;
  }) => void;
}

// Mock data - TODO: Replace with real data from CRM integration
const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Jennifer Davis',
    company: 'Davis Property Group',
    value: '$15,000',
    lastContact: '3 days ago',
    status: 'hot'
  },
  {
    id: '2',
    name: 'Robert Chen',
    company: 'Chen Investments',
    value: '$8,500',
    lastContact: '1 week ago',
    status: 'warm'
  }
];

export function LeadsCard({ onChatAbout }: LeadsCardProps): React.ReactElement {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'hot': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'warm': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'cold': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400';
    }
  };

  const hotLeads = mockLeads.filter(l => l.status === 'hot');
  const warmLeads = mockLeads.filter(l => l.status === 'warm');
  const totalValue = mockLeads.reduce((sum, lead) => sum + parseInt(lead.value.replace(/[$,]/g, ''), 10), 0);
  const overdueCount = mockLeads.filter(l => l.lastContact.includes('days') || l.lastContact.includes('week')).length;

  const handleChatAbout = (): void => {
    onChatAbout?.({
      hotLeads,
      warmLeads,
      totalValue,
      overdueCount
    });
  };

  return (
    <AccordionItem value="leads">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-2">
            <AccordionTrigger className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors [&[data-state=open]>div]:text-slate-600 dark:[&[data-state=open]>div]:text-slate-400 flex-1">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full">
                <div className="flex items-center gap-2 mb-2 lg:mb-0">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <CardTitle className="text-base lg:text-lg">Lead Follow-ups</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs">
                    {hotLeads.length} Hot
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs">
                    {warmLeads.length} Warm
                  </Badge>
                </div>
              </div>
            </AccordionTrigger>
            <Button
              variant="outline"
              size="sm"
              onClick={handleChatAbout}
              className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white border-none shrink-0 w-full lg:w-auto"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Chat about this
            </Button>
          </div>
          <CardDescription className="text-left">
            High-priority leads that need attention
          </CardDescription>
        </CardHeader>
        <AccordionContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {mockLeads.map((lead) => (
                <div key={lead.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm text-slate-900 dark:text-slate-100">{lead.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{lead.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-900 dark:text-slate-100">{lead.value}</p>
                      <Badge variant="outline" className={getStatusColor(lead.status)}>
                        <Star className="w-3 h-3 mr-1" />
                        {lead.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Last contact: {lead.lastContact}</span>
                    <Button size="sm" variant="outline">
                      Follow Up
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                <Users className="w-4 h-4 mr-2" />
                View All Leads
              </Button>
            </div>
          </CardContent>
        </AccordionContent>
      </Card>
    </AccordionItem>
  );
}
