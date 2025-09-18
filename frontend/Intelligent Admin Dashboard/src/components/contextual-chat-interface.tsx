import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Send, Bot, User, X, Minimize2 } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ContextualChatInterfaceProps {
  currentPage: string;
  pageContext?: any;
  sectionContext?: { section: string; data: any } | null;
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
}

export function ContextualChatInterface({ 
  currentPage, 
  pageContext, 
  sectionContext,
  isOpen, 
  onClose,
  onMinimize 
}: ContextualChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Initialize contextual messages based on current page or section
  useEffect(() => {
    if (isOpen) {
      const contextualMessage = sectionContext 
        ? getSectionSpecificMessage(sectionContext.section, sectionContext.data)
        : getContextualWelcomeMessage(currentPage, pageContext);
      
      setMessages([{
        id: '1',
        content: contextualMessage,
        sender: 'ai',
        timestamp: new Date()
      }]);
    }
  }, [isOpen, currentPage, pageContext, sectionContext]);

  const getSectionSpecificMessage = (section: string, data: any): string => {
    switch (section) {
      case 'emails':
        return `I can see you want to discuss your emails! You have ${data.highPriority?.length || 0} high-priority emails including "${data.highPriority?.[0]?.subject || 'urgent items'}" that need immediate attention. Would you like me to help prioritize responses, draft replies, or set up automated filters?`;
      case 'schedule':
        return `Let's talk about your schedule! You have ${data.totalItems} items today, starting with "${data.nextAppointment?.title}" at ${data.nextAppointment?.time}. I can help optimize your schedule, prepare for meetings, or suggest time-saving strategies. What would be most helpful?`;
      case 'leads':
        return `Great choice to focus on leads! You have ${data.hotLeads?.length || 0} hot leads worth approximately $${data.totalValue?.toLocaleString() || '0'}, with ${data.overdueCount} follow-ups overdue. I can help you prioritize outreach, draft follow-up messages, or create a systematic approach. Where should we start?`;
      default:
        return `I'm here to help with the ${section} section. What specific questions or tasks can I assist you with?`;
    }
  };

  const getContextualWelcomeMessage = (page: string, context?: any): string => {
    switch (page) {
      case 'dashboard':
        return `I can see you're on the dashboard! I notice you have ${context?.urgentEmails || 3} urgent emails, ${context?.todayTasks || 3} tasks today, and ${context?.activeLeads || 2} leads that need follow-up. What would you like help with?`;
      case 'integrations':
        return "I see you're looking at integrations! I can help you choose the best tools to connect, explain the benefits of each integration, or guide you through the setup process. What interests you most?";
      case 'analytics':
        return "You're viewing the analytics section! Once we have more data, I can help you identify trends, suggest optimizations, and create custom reports. Is there specific business data you'd like to track?";
      default:
        return `Hi! I'm your AI assistant. I can see you're currently on the ${page} page. How can I help you optimize your business operations today?`;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response based on context
    setTimeout(() => {
      const aiResponse = generateContextualResponse(inputValue, currentPage, pageContext);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateContextualResponse = (userInput: string, currentPage: string, context?: any): string => {
    const input = userInput.toLowerCase();
    
    // Section-specific responses
    if (sectionContext) {
      const { section, data } = sectionContext;
      
      if (section === 'emails') {
        if (input.includes('prioritize') || input.includes('urgent')) {
          return `I recommend tackling Sarah Johnson's email first - it's about a project timeline and could impact your schedule. I can draft a response acknowledging the timeline concern and suggesting a quick call to clarify requirements. Would you like me to create that draft?`;
        }
        if (input.includes('draft') || input.includes('reply')) {
          return `I'll help you draft professional responses! For the urgent emails, I suggest a structured approach: 1) Acknowledge receipt, 2) Address key concerns, 3) Provide next steps. Should I start with the project timeline email from Sarah Johnson?`;
        }
        return `For your ${data.totalUnread} emails, I can help with drafting responses, setting up filters, or creating templates for common inquiries. What's your biggest email challenge right now?`;
      }
      
      if (section === 'schedule') {
        if (input.includes('optimize') || input.includes('travel')) {
          return `Looking at your Wilson Kitchen site inspection at 123 Oak Street, I can help calculate optimal travel routes and suggest grouping nearby appointments. Would you like me to analyze your location efficiency for the week?`;
        }
        if (input.includes('prepare') || input.includes('meeting')) {
          return `For your team meeting at 2 PM, I can help prepare an agenda based on current project statuses, outstanding issues, and team productivity metrics. Should I draft a structured agenda?`;
        }
        return `With ${data.totalItems} items today, I can help with time management, meeting preparation, or schedule optimization. What aspect would you like to improve?`;
      }
      
      if (section === 'leads') {
        if (input.includes('prioritize') || input.includes('follow up')) {
          return `Jennifer Davis from Davis Property Group is your hottest lead ($15,000 value, 3 days since contact). I recommend reaching out today with a project update or new service offering. Should I draft a personalized follow-up message?`;
        }
        if (input.includes('strategy') || input.includes('approach')) {
          return `For systematic lead management, I suggest: 1) Daily hot lead outreach, 2) Weekly warm lead nurturing, 3) Monthly cold lead re-engagement. I can set up automated reminders and templates. Which would you like to start with?`;
        }
        return `Your ${data.totalValue?.toLocaleString()} pipeline needs attention! I can help with follow-up strategies, message templates, or lead scoring. What's your biggest sales challenge?`;
      }
    }

    // Page-specific responses
    if (currentPage === 'dashboard') {
      if (input.includes('email')) {
        return "I can help you prioritize your emails! I see Sarah Johnson's email about the project timeline is marked as urgent. Would you like me to draft a response or schedule a follow-up call?";
      }
      if (input.includes('schedule') || input.includes('calendar')) {
        return "Looking at your schedule, you have a site inspection at 9 AM and a team meeting at 2 PM. I can help you prepare for these meetings or optimize your travel route between appointments.";
      }
      if (input.includes('lead')) {
        return "Jennifer Davis from Davis Property Group hasn't been contacted in 3 days - that's a hot lead worth $15,000! Would you like me to suggest a follow-up strategy or draft a message?";
      }
    }
    
    if (currentPage === 'integrations') {
      if (input.includes('recommend') || input.includes('suggest')) {
        return "Based on your trade business, I'd recommend starting with QuickBooks for invoicing and HubSpot for lead management. These will give you the biggest time savings. Would you like me to explain how to set them up?";
      }
      if (input.includes('quickbooks') || input.includes('accounting')) {
        return "QuickBooks integration will automate your invoicing and expense tracking. It can save you about 5 hours per week! I can guide you through connecting it and setting up automated workflows.";
      }
    }

    // General responses
    const generalResponses = [
      "That's a great question! Based on what I can see on this page, I think the best approach would be to focus on automating your most time-consuming tasks first. What takes up most of your admin time?",
      "I can help with that! Let me suggest a few options based on your current business setup. Would you prefer a quick solution or something more comprehensive?",
      "Excellent! I can see several opportunities to streamline that process. Let me walk you through the most effective approach for your trade business.",
      "That's exactly the kind of optimization that can save you hours each week! Based on your current integrations, here's what I recommend..."
    ];
    
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 lg:inset-y-0 lg:right-0 w-full lg:w-96 bg-white dark:bg-slate-800 lg:border-l border-slate-200 dark:border-slate-700 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-teal-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3>AI Assistant</h3>
              <p className="text-xs text-slate-300">
                Contextual help for {currentPage}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onMinimize && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMinimize}
                className="text-white hover:bg-white/10 w-8 h-8 p-0"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10 w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white ml-auto'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {message.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-teal-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Ask about ${currentPage}...`}
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button 
              onClick={handleSendMessage}
              className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white"
              disabled={!inputValue.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}