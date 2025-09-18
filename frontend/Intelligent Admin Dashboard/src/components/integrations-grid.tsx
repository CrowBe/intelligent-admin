import { IntegrationCard } from './integration-card';
import { 
  Mail, 
  Calendar, 
  FolderOpen, 
  Users, 
  Wrench, 
  FileText,
  Phone,
  CreditCard,
  BarChart3,
  Slack
} from 'lucide-react';

interface IntegrationsGridProps {
  onIntegrationConnect?: (integration: string) => void;
}

export function IntegrationsGrid({ onIntegrationConnect }: IntegrationsGridProps) {
  const integrations = [
    {
      id: 'gmail',
      title: 'Gmail',
      description: 'Manage and prioritize your emails automatically',
      icon: <Mail className="w-5 h-5 text-red-500" />,
      connected: true,
      benefits: [
        'Auto-prioritize urgent emails',
        'Smart email summaries',
        'Follow-up reminders'
      ]
    },
    {
      id: 'google-calendar',
      title: 'Google Calendar',
      description: 'Sync your schedule and get smart reminders',
      icon: <Calendar className="w-5 h-5 text-blue-500" />,
      connected: true,
      benefits: [
        'Schedule optimization',
        'Travel time calculations',
        'Client meeting prep'
      ]
    },
    {
      id: 'google-drive',
      title: 'Google Drive',
      description: 'Organize project files and documents',
      icon: <FolderOpen className="w-5 h-5 text-yellow-500" />,
      connected: false,
      benefits: [
        'Auto-organize project files',
        'Smart document search',
        'Client file sharing'
      ]
    },
    {
      id: 'hubspot',
      title: 'HubSpot CRM',
      description: 'Track leads and manage customer relationships',
      icon: <Users className="w-5 h-5 text-orange-500" />,
      connected: false,
      benefits: [
        'Lead scoring automation',
        'Follow-up sequences',
        'Deal pipeline tracking'
      ]
    },
    {
      id: 'quickbooks',
      title: 'QuickBooks',
      description: 'Streamline invoicing and expense tracking',
      icon: <CreditCard className="w-5 h-5 text-green-500" />,
      connected: false,
      benefits: [
        'Automated invoice generation',
        'Expense categorization',
        'Cash flow insights'
      ]
    },
    {
      id: 'monday',
      title: 'Monday.com',
      description: 'Manage projects and team collaboration',
      icon: <Wrench className="w-5 h-5 text-purple-500" />,
      connected: false,
      benefits: [
        'Project timeline tracking',
        'Team task assignment',
        'Progress reporting'
      ]
    },
    {
      id: 'docusign',
      title: 'DocuSign',
      description: 'Digital contract signing and management',
      icon: <FileText className="w-5 h-5 text-indigo-500" />,
      connected: false,
      comingSoon: true,
      benefits: [
        'Automated contract workflows',
        'Signature reminders',
        'Document status tracking'
      ]
    },
    {
      id: 'twilio',
      title: 'Phone System',
      description: 'Smart call routing and SMS automation',
      icon: <Phone className="w-5 h-5 text-teal-500" />,
      connected: false,
      comingSoon: true,
      benefits: [
        'Call routing optimization',
        'SMS appointment reminders',
        'Lead qualification calls'
      ]
    },
    {
      id: 'analytics',
      title: 'Business Analytics',
      description: 'Track performance and business insights',
      icon: <BarChart3 className="w-5 h-5 text-pink-500" />,
      connected: false,
      comingSoon: true,
      benefits: [
        'Revenue tracking',
        'Client acquisition costs',
        'Productivity metrics'
      ]
    },
    {
      id: 'slack',
      title: 'Slack',
      description: 'Team communication and notifications',
      icon: <Slack className="w-5 h-5 text-purple-600" />,
      connected: false,
      comingSoon: true,
      benefits: [
        'Smart notification filtering',
        'Project update summaries',
        'Team coordination'
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
      {integrations.map((integration) => (
        <IntegrationCard
          key={integration.id}
          title={integration.title}
          description={integration.description}
          icon={integration.icon}
          connected={integration.connected}
          benefits={integration.benefits}
          comingSoon={integration.comingSoon}
          onConnect={() => onIntegrationConnect?.(integration.id)}
        />
      ))}
    </div>
  );
}