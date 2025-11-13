import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Calendar,
  Users,
  AlertCircle,
  Clock,
  ChevronRight,
  MessageCircle
} from 'lucide-react';

interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  type: 'meeting' | 'appointment' | 'deadline';
  location?: string;
}

interface ScheduleCardProps {
  onChatAbout?: (context: {
    todayItems: ScheduleItem[];
    totalItems: number;
    nextAppointment?: ScheduleItem;
  }) => void;
}

// Mock data - TODO: Replace with real data from calendar integration
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

export function ScheduleCard({ onChatAbout }: ScheduleCardProps): JSX.Element {
  const handleChatAbout = (): void => {
    onChatAbout?.({
      todayItems: mockSchedule,
      totalItems: mockSchedule.length,
      nextAppointment: mockSchedule[0]
    });
  };

  return (
    <AccordionItem value="schedule">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-2">
            <AccordionTrigger className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors [&[data-state=open]>div]:text-slate-600 dark:[&[data-state=open]>div]:text-slate-400 flex-1">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between w-full">
                <div className="flex items-center gap-2 mb-2 lg:mb-0">
                  <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <CardTitle className="text-base lg:text-lg">Today's Schedule</CardTitle>
                </div>
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs">
                  {mockSchedule.length} items
                </Badge>
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
            Your upcoming appointments and deadlines
          </CardDescription>
        </CardHeader>
        <AccordionContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {mockSchedule.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30">
                    {item.type === 'meeting' ? <Users className="w-4 h-4 text-green-600 dark:text-green-400" /> :
                     item.type === 'deadline' ? <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" /> :
                     <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900 dark:text-slate-100">{item.title}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <span>{item.time}</span>
                      {item.location && (
                        <>
                          <span>•</span>
                          <span>{item.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
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
  );
}
