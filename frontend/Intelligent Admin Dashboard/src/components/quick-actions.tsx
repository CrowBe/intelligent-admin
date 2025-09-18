import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { 
  Mail, 
  Calendar, 
  Users, 
  AlertCircle, 
  TrendingUp, 
  Clock,
  ChevronRight,
  Star,
  MessageCircle
} from 'lucide-react';

interface EmailSummary {
  id: string;
  from: string;
  subject: string;
  urgency: 'high' | 'medium' | 'low';
  preview: string;
  timestamp: string;
}

interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  type: 'meeting' | 'appointment' | 'deadline';
  location?: string;
}

interface Lead {
  id: string;
  name: string;
  company: string;
  value: string;
  lastContact: string;
  status: 'hot' | 'warm' | 'cold';
}

interface QuickActionsProps {
  onChatAbout?: (section: string, context: any) => void;
}

const mockEmails: EmailSummary[] = [
  {
    id: '1',
    from: 'sarah.johnson@clientco.com',
    subject: 'Urgent: Project Timeline Update Needed',
    urgency: 'high',
    preview: 'Hi, we need to discuss the revised timeline for the bathroom renovation...',
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    from: 'mike.builder@supplies.com',
    subject: 'Material Delivery Confirmation',
    urgency: 'high',
    preview: 'Your order #12345 has been confirmed for delivery tomorrow morning...',
    timestamp: '4 hours ago'
  },
  {
    id: '3',
    from: 'accounts@utilities.com',
    subject: 'Monthly Invoice - Due Soon',
    urgency: 'medium',
    preview: 'Your monthly utility bill is now available for review...',
    timestamp: '1 day ago'
  },
  {
    id: '4',
    from: 'team@projectmanager.com',
    subject: 'Weekly Report Summary',
    urgency: 'low',
    preview: 'Here\'s your weekly project progress summary...',
    timestamp: '2 days ago'
  }
];

const mockSchedule: ScheduleItem[] = [
  {
    id: '1',
    title: 'Site Inspection - Wilson Kitchen',
    time: '9:00 AM',
    type: 'appointment',
    location: '123 Oak Street'
  },
  {
    id: '2',
    title: 'Team Meeting - Weekly Check-in',
    time: '2:00 PM',
    type: 'meeting'
  },
  {
    id: '3',
    title: 'Quote Deadline - Henderson Bathroom',
    time: '5:00 PM',
    type: 'deadline'
  }
];

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

export function QuickActions({ onChatAbout }: QuickActionsProps) {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'low': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
      case 'warm': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
      case 'cold': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400';
    }
  };

  const getEmailsByPriority = () => {
    const high = mockEmails.filter(e => e.urgency === 'high');
    const medium = mockEmails.filter(e => e.urgency === 'medium');
    const low = mockEmails.filter(e => e.urgency === 'low');
    return { high, medium, low };
  };

  const emailsByPriority = getEmailsByPriority();

  return (
    <div className="space-y-4 lg:space-y-6">
      <Accordion type="multiple" defaultValue={["emails", "schedule", "leads"]} className="space-y-4">
        {/* Email Summary */}
        <AccordionItem value="emails">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-2">
                <AccordionTrigger className="cursor-pointer hover:bg-slate-50 rounded-lg transition-colors [&[data-state=open]>div]:text-slate-600 flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full">
                    <div className="flex items-center gap-2 mb-2 lg:mb-0">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <CardTitle className="text-base lg:text-lg">Email Summary</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs">
                        {emailsByPriority.high.length} High priority
                      </Badge>
                      <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs">
                        {emailsByPriority.medium.length} Medium
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onChatAbout?.('emails', { 
                    highPriority: emailsByPriority.high,
                    mediumPriority: emailsByPriority.medium,
                    totalUnread: mockEmails.length 
                  })}
                  className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white border-none shrink-0 w-full lg:w-auto"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Chat about this
                </Button>
              </div>
              <CardDescription className="text-left">
                Prioritized emails that need your attention
              </CardDescription>
            </CardHeader>
            <AccordionContent>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* High Priority Emails */}
                  {emailsByPriority.high.length > 0 && (
                    <div>
                      <h4 className="text-sm text-slate-700 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        High Priority ({emailsByPriority.high.length})
                      </h4>
                      <div className="space-y-2">
                        {emailsByPriority.high.map((email) => (
                          <div key={email.id} className="p-3 rounded-lg border border-red-200 bg-red-50">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-900 truncate">{email.from}</p>
                                <p className="text-sm text-slate-700 truncate">{email.subject}</p>
                              </div>
                              <span className="text-xs text-slate-500 ml-2">{email.timestamp}</span>
                            </div>
                            <p className="text-sm text-slate-600 truncate">{email.preview}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medium Priority Emails */}
                  {emailsByPriority.medium.length > 0 && (
                    <div>
                      <h4 className="text-sm text-slate-700 mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        Medium Priority ({emailsByPriority.medium.length})
                      </h4>
                      <div className="space-y-2">
                        {emailsByPriority.medium.map((email) => (
                          <div key={email.id} className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-900 truncate">{email.from}</p>
                                <p className="text-sm text-slate-700 truncate">{email.subject}</p>
                              </div>
                              <span className="text-xs text-slate-500 ml-2">{email.timestamp}</span>
                            </div>
                            <p className="text-sm text-slate-600 truncate">{email.preview}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <Button variant="outline" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    View All Emails
                  </Button>
                </div>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Today's Schedule */}
        <AccordionItem value="schedule">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-2">
                <AccordionTrigger className="cursor-pointer hover:bg-slate-50 rounded-lg transition-colors [&[data-state=open]>div]:text-slate-600 flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full">
                    <div className="flex items-center gap-2 mb-2 lg:mb-0">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <CardTitle className="text-base lg:text-lg">Today's Schedule</CardTitle>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                      {mockSchedule.length} items
                    </Badge>
                  </div>
                </AccordionTrigger>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onChatAbout?.('schedule', { 
                    todayItems: mockSchedule,
                    totalItems: mockSchedule.length,
                    nextAppointment: mockSchedule[0]
                  })}
                  className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white border-none shrink-0 w-full lg:w-auto"
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Chat about this
                </Button>
              </div>
              <CardDescription className="text-left">
                Your upcoming appointments and deadlines
              </CardDescription>
            </CardHeader>
            <AccordionContent>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {mockSchedule.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                        {item.type === 'meeting' ? <Users className="w-4 h-4 text-green-600" /> :
                         item.type === 'deadline' ? <AlertCircle className="w-4 h-4 text-red-600" /> :
                         <Clock className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-900">{item.title}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <span>{item.time}</span>
                          {item.location && (
                            <>
                              <span>•</span>
                              <span>{item.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button variant="outline" className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    View Full Calendar
                  </Button>
                </div>
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>

        {/* Lead Follow-ups */}
        <AccordionItem value="leads">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-2">
                <AccordionTrigger className="cursor-pointer hover:bg-slate-50 rounded-lg transition-colors [&[data-state=open]>div]:text-slate-600 flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full">
                    <div className="flex items-center gap-2 mb-2 lg:mb-0">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      <CardTitle className="text-base lg:text-lg">Lead Follow-ups</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                        {mockLeads.filter(l => l.status === 'hot').length} Hot
                      </Badge>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-700 text-xs">
                        {mockLeads.filter(l => l.status === 'warm').length} Warm
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onChatAbout?.('leads', { 
                    hotLeads: mockLeads.filter(l => l.status === 'hot'),
                    warmLeads: mockLeads.filter(l => l.status === 'warm'),
                    totalValue: mockLeads.reduce((sum, lead) => sum + parseInt(lead.value.replace(/[$,]/g, '')), 0),
                    overdueCount: mockLeads.filter(l => l.lastContact.includes('days') || l.lastContact.includes('week')).length
                  })}
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
                    <div key={lead.id} className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm text-slate-900">{lead.name}</p>
                          <p className="text-sm text-slate-600">{lead.company}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-900">{lead.value}</p>
                          <Badge variant="outline" className={getStatusColor(lead.status)}>
                            <Star className="w-3 h-3 mr-1" />
                            {lead.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">Last contact: {lead.lastContact}</span>
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
      </Accordion>
    </div>
  );
}