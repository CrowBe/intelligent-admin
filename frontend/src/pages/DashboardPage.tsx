import React from 'react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { useAppAuth } from '../contexts/KindeAuthContext';
export const DashboardPage: React.FC = () => {
  const { user } = useAppAuth();

  // Mock data - in real app this would come from API
  const stats = {
    totalEmails: 24,
    urgentCount: 3,
    actionRequired: 7,
    processed: 89,
  };

  const urgentEmails = [
    {
      id: '1',
      subject: 'Emergency plumbing repair needed ASAP',
      from: 'sarah@homebuilders.com.au',
      time: '2 hours ago',
      priority: 'urgent' as const,
    },
    {
      id: '2',
      subject: 'Quote deadline today - bathroom renovation',
      from: 'mike@renovations.net.au',
      time: '4 hours ago',
      priority: 'high' as const,
    },
    {
      id: '3',
      subject: 'Inspection scheduled for tomorrow morning',
      from: 'inspector@council.nsw.gov.au',
      time: '6 hours ago',
      priority: 'high' as const,
    },
  ];

  const quickActions = [
    { title: 'Check Email Intelligence', href: '/emails', icon: '📧' },
    { title: 'Connect Gmail', href: '/connections', icon: '🔗' },
    { title: 'View Settings', href: '/settings', icon: '⚙️' },
    { title: 'Get Help', href: '/help', icon: '❓' },
  ];

  return (
    <div className='space-y-8'>
      {/* Welcome Header */}
      <div className='bg-gradient-to-r from-primary to-primary/80 rounded-lg p-6 text-primary-foreground'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl lg:text-3xl font-bold mb-2'>Good morning, {user?.firstName || 'User'}! 👋</h1>
            <p className='text-primary-foreground/80'>
              Here's what's happening with your business communications today.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='text-2xl font-bold text-foreground'>{stats.totalEmails}</div>
            <div className='text-sm text-muted-foreground'>New Emails Today</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='text-2xl font-bold text-urgent'>{stats.urgentCount}</div>
            <div className='text-sm text-muted-foreground'>Urgent Items</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='text-2xl font-bold text-high'>{stats.actionRequired}</div>
            <div className='text-sm text-muted-foreground'>Action Required</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='text-2xl font-bold text-green-600'>{stats.processed}%</div>
            <div className='text-sm text-muted-foreground'>Processed</div>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Urgent Emails */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              🚨 Urgent Emails
              {stats.urgentCount > 0 && (
                <Badge variant='urgent' size='sm'>
                  {stats.urgentCount}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {urgentEmails.length > 0 ? (
              <div className='space-y-3'>
                {urgentEmails.map(email => (
                  <div key={email.id} className='p-3 border border-border rounded-lg hover:bg-accent transition-colors'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='flex-1 min-w-0'>
                        <h4 className='font-medium text-foreground truncate'>{email.subject}</h4>
                        <p className='text-sm text-muted-foreground truncate'>{email.from}</p>
                        <p className='text-xs text-muted-foreground/70 mt-1'>{email.time}</p>
                      </div>
                      <Badge variant={email.priority} size='sm'>
                        {email.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
                <div className='pt-2'>
                  <Button variant='outline' size='sm' className='w-full'>
                    View All Emails →
                  </Button>
                </div>
              </div>
            ) : (
              <div className='text-center py-8 text-muted-foreground'>
                <div className='text-2xl mb-2'>✅</div>
                <p>No urgent emails right now!</p>
                <p className='text-sm'>You're all caught up.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>⚡ Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-3'>
              {quickActions.map((action, index) => (
                <a
                  key={index}
                  href={action.href}
                  className='p-4 border border-border rounded-lg hover:bg-accent transition-colors text-center block'
                >
                  <div className='text-2xl mb-2'>{action.icon}</div>
                  <div className='text-sm font-medium text-foreground'>{action.title}</div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Today's AI Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='p-4 bg-primary/5 border border-primary/20 rounded-lg'>
              <h4 className='font-medium text-primary mb-2'>📈 Email Volume Trend</h4>
              <p className='text-sm text-primary/80'>
                Your email volume is 15% higher than usual today. Consider blocking 2-3 hours for focused email
                responses.
              </p>
            </div>

            <div className='p-4 bg-green-500/5 border border-green-500/20 rounded-lg'>
              <h4 className='font-medium text-green-700 dark:text-green-400 mb-2'>😊 Customer Sentiment</h4>
              <p className='text-sm text-green-700/80 dark:text-green-400/80'>
                Positive customer sentiment detected in 4 emails today. Great job maintaining client relationships!
              </p>
            </div>

            <div className='p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg'>
              <h4 className='font-medium text-amber-700 dark:text-amber-400 mb-2'>⏰ Upcoming Deadlines</h4>
              <p className='text-sm text-amber-700/80 dark:text-amber-400/80'>
                3 quote requests have deadlines within the next 2 days. Consider prioritizing these responses.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
