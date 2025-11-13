import React from 'react';
import { Accordion } from '@/components/ui/accordion';
import { EmailSummaryCard } from './EmailSummaryCard';
import { ScheduleCard } from './ScheduleCard';
import { LeadsCard } from './LeadsCard';

interface SectionContext {
  section: string;
  data: Record<string, unknown>;
}

interface QuickActionsProps {
  onChatAbout?: (context: SectionContext) => void;
}

export function QuickActions({ onChatAbout }: QuickActionsProps): React.ReactElement {
  const handleEmailChat = (emailContext: {
    highPriorityEmails: unknown[];
    urgentCount: number;
    totalEmails: number;
  }): void => {
    onChatAbout?.({
      section: 'emails',
      data: emailContext
    });
  };

  const handleScheduleChat = (scheduleContext: {
    todayItems: unknown[];
    totalItems: number;
    nextAppointment?: unknown;
  }): void => {
    onChatAbout?.({
      section: 'schedule',
      data: scheduleContext
    });
  };

  const handleLeadsChat = (leadsContext: {
    hotLeads: unknown[];
    warmLeads: unknown[];
    totalValue: number;
    overdueCount: number;
  }): void => {
    onChatAbout?.({
      section: 'leads',
      data: leadsContext
    });
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <Accordion type="multiple" defaultValue={['emails', 'schedule', 'leads']} className="space-y-4">
        <EmailSummaryCard onChatAbout={handleEmailChat} />
        <ScheduleCard onChatAbout={handleScheduleChat} />
        <LeadsCard onChatAbout={handleLeadsChat} />
      </Accordion>
    </div>
  );
}
