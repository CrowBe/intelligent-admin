// EmailSummaryCard Component
// Displays email intelligence summary with urgency indicators

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, MessageCircle, Clock } from 'lucide-react';
import type { EmailSummary } from '@/services/emailService';

export interface EmailSummaryCardProps {
  emails: EmailSummary[];
  loading?: boolean;
  onChatAbout?: (section: string, context: any) => void;
}

export function EmailSummaryCard({
  emails,
  loading = false,
  onChatAbout
}: EmailSummaryCardProps): React.ReactElement {
  const getUrgencyColor = (urgency: string): string => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400';
    }
  };

  const getEmailsByPriority = (): {
    high: EmailSummary[];
    medium: EmailSummary[];
    low: EmailSummary[];
  } => {
    const high = emails.filter(e => e.urgency === 'high');
    const medium = emails.filter(e => e.urgency === 'medium');
    const low = emails.filter(e => e.urgency === 'low');
    return { high, medium, low };
  };

  const emailsByPriority = getEmailsByPriority();
  const highPriorityCount = emailsByPriority.high.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle>Priority Emails</CardTitle>
          </div>
          {highPriorityCount > 0 && (
            <Badge variant="destructive">{highPriorityCount} urgent</Badge>
          )}
        </div>
        <CardDescription>AI-prioritized emails needing attention</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"
              />
            ))}
          </div>
        ) : emails.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No emails to display</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {emails.map(email => (
                <div
                  key={email.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getUrgencyColor(email.urgency)}>
                          {email.urgency}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {email.timestamp}
                        </span>
                      </div>
                      <p className="font-medium text-sm truncate">{email.subject}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        From: {email.from}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {email.preview}
                  </p>
                  {onChatAbout && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() =>
                        onChatAbout('email', {
                          id: email.id,
                          subject: email.subject,
                          from: email.from
                        })
                      }
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Chat about this
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        <Button variant="outline" className="w-full mt-4">
          View All Emails
        </Button>
      </CardContent>
    </Card>
  );
}
