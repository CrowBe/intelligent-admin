/**
 * Action System Types
 * Defines the structure for application actions that can be suggested by the AI
 */

export type ActionType = 
  | 'navigate'
  | 'open_modal'
  | 'start_flow'
  | 'execute_function'
  | 'external_link'
  | 'copy_text'
  | 'download'
  | 'settings';

export type ActionPriority = 'high' | 'medium' | 'low';

export interface ActionParameter {
  key: string;
  value: string | number | boolean;
  type: 'string' | 'number' | 'boolean';
}

export interface ApplicationAction {
  id: string;
  type: ActionType;
  label: string;
  description?: string;
  icon?: string;
  route?: string; // For navigation actions
  modalId?: string; // For modal actions
  flowId?: string; // For workflow actions
  functionName?: string; // For function execution
  parameters?: ActionParameter[];
  priority?: ActionPriority;
  requiresAuth?: boolean;
  category?: string;
}

// Predefined actions available in the application
export const AVAILABLE_ACTIONS: ApplicationAction[] = [
  // Gmail Integration Actions
  {
    id: 'connect_gmail',
    type: 'start_flow',
    label: 'Connect Gmail Account',
    description: 'Set up Gmail integration for email automation',
    icon: '📧',
    flowId: 'gmail_connection',
    category: 'email',
    priority: 'high'
  },
  {
    id: 'view_emails',
    type: 'navigate',
    label: 'View Email Dashboard',
    description: 'See your prioritized emails and insights',
    icon: '📨',
    route: '/dashboard/emails',
    category: 'email'
  },
  {
    id: 'email_settings',
    type: 'navigate',
    label: 'Email Settings',
    description: 'Configure email automation rules',
    icon: '⚙️',
    route: '/settings/email',
    category: 'email'
  },
  
  // Document Management Actions
  {
    id: 'upload_document',
    type: 'open_modal',
    label: 'Upload Document',
    description: 'Add a new document to your library',
    icon: '📄',
    modalId: 'document_upload',
    category: 'documents'
  },
  {
    id: 'view_documents',
    type: 'navigate',
    label: 'Document Library',
    description: 'Browse and manage your documents',
    icon: '📁',
    route: '/documents',
    category: 'documents'
  },
  {
    id: 'scan_document',
    type: 'start_flow',
    label: 'Scan Document',
    description: 'Extract information from a document',
    icon: '🔍',
    flowId: 'document_scan',
    category: 'documents'
  },
  
  // Customer Management Actions
  {
    id: 'add_customer',
    type: 'open_modal',
    label: 'Add New Customer',
    description: 'Create a new customer record',
    icon: '👤',
    modalId: 'add_customer',
    category: 'customers'
  },
  {
    id: 'view_customers',
    type: 'navigate',
    label: 'Customer List',
    description: 'View and manage all customers',
    icon: '👥',
    route: '/customers',
    category: 'customers'
  },
  
  // Quote & Invoice Actions
  {
    id: 'create_quote',
    type: 'start_flow',
    label: 'Create Quote',
    description: 'Generate a new quote for a customer',
    icon: '💰',
    flowId: 'create_quote',
    category: 'finance',
    priority: 'high'
  },
  {
    id: 'create_invoice',
    type: 'start_flow',
    label: 'Create Invoice',
    description: 'Generate a new invoice',
    icon: '🧾',
    flowId: 'create_invoice',
    category: 'finance'
  },
  {
    id: 'view_invoices',
    type: 'navigate',
    label: 'Invoice History',
    description: 'View all invoices and payment status',
    icon: '📊',
    route: '/invoices',
    category: 'finance'
  },
  
  // Job Management Actions
  {
    id: 'schedule_job',
    type: 'open_modal',
    label: 'Schedule Job',
    description: 'Add a new job to your calendar',
    icon: '📅',
    modalId: 'schedule_job',
    category: 'jobs',
    priority: 'high'
  },
  {
    id: 'view_schedule',
    type: 'navigate',
    label: 'View Schedule',
    description: 'See your job calendar',
    icon: '🗓️',
    route: '/schedule',
    category: 'jobs'
  },
  
  // Compliance & Regulations
  {
    id: 'compliance_check',
    type: 'start_flow',
    label: 'Compliance Check',
    description: 'Review compliance requirements',
    icon: '✅',
    flowId: 'compliance_check',
    category: 'compliance'
  },
  {
    id: 'view_regulations',
    type: 'navigate',
    label: 'Regulations Library',
    description: 'Browse Australian trade regulations',
    icon: '📚',
    route: '/regulations',
    category: 'compliance'
  },
  
  // Settings & Profile
  {
    id: 'account_settings',
    type: 'navigate',
    label: 'Account Settings',
    description: 'Manage your account preferences',
    icon: '👤',
    route: '/settings/account',
    category: 'settings'
  },
  {
    id: 'business_profile',
    type: 'navigate',
    label: 'Business Profile',
    description: 'Update your business information',
    icon: '🏢',
    route: '/settings/business',
    category: 'settings'
  },
  {
    id: 'notification_settings',
    type: 'navigate',
    label: 'Notification Settings',
    description: 'Configure your notification preferences',
    icon: '🔔',
    route: '/settings/notifications',
    category: 'settings'
  }
];

// Create a map for quick lookup
export const ACTION_MAP = new Map(
  AVAILABLE_ACTIONS.map(action => [action.id, action])
);

// Token format for inline actions: [[action:action_id]]
export const ACTION_TOKEN_REGEX = /\[\[action:([a-z_]+)\]\]/g;

// Parse action tokens from text
export function parseActionTokens(text: string): {
  cleanText: string;
  actions: ApplicationAction[];
} {
  const actions: ApplicationAction[] = [];
  const cleanText = text.replace(ACTION_TOKEN_REGEX, (match, actionId) => {
    const action = ACTION_MAP.get(actionId);
    if (action) {
      actions.push(action);
      return `[${action.label}]`; // Placeholder for UI replacement
    }
    return match; // Keep original if action not found
  });
  
  return { cleanText, actions };
}

// Generate action suggestions based on context
export function getContextualActions(message: string): ApplicationAction[] {
  const lowercaseMessage = message.toLowerCase();
  const suggestions: ApplicationAction[] = [];
  
  // Email-related context
  if (lowercaseMessage.includes('email') || lowercaseMessage.includes('gmail')) {
    suggestions.push(
      ACTION_MAP.get('connect_gmail')!,
      ACTION_MAP.get('view_emails')!,
      ACTION_MAP.get('email_settings')!
    );
  }
  
  // Document-related context
  if (lowercaseMessage.includes('document') || lowercaseMessage.includes('file')) {
    suggestions.push(
      ACTION_MAP.get('upload_document')!,
      ACTION_MAP.get('view_documents')!
    );
  }
  
  // Customer-related context
  if (lowercaseMessage.includes('customer') || lowercaseMessage.includes('client')) {
    suggestions.push(
      ACTION_MAP.get('add_customer')!,
      ACTION_MAP.get('view_customers')!
    );
  }
  
  // Quote/Invoice context
  if (lowercaseMessage.includes('quote')) {
    suggestions.push(ACTION_MAP.get('create_quote')!);
  }
  if (lowercaseMessage.includes('invoice')) {
    suggestions.push(
      ACTION_MAP.get('create_invoice')!,
      ACTION_MAP.get('view_invoices')!
    );
  }
  
  // Job/Schedule context
  if (lowercaseMessage.includes('job') || lowercaseMessage.includes('schedule')) {
    suggestions.push(
      ACTION_MAP.get('schedule_job')!,
      ACTION_MAP.get('view_schedule')!
    );
  }
  
  // Compliance context
  if (lowercaseMessage.includes('compliance') || lowercaseMessage.includes('regulation')) {
    suggestions.push(
      ACTION_MAP.get('compliance_check')!,
      ACTION_MAP.get('view_regulations')!
    );
  }
  
  return suggestions.filter(Boolean).slice(0, 3); // Return top 3 suggestions
}

// Format actions for LLM context
export function formatActionsForLLM(actions: ApplicationAction[]): string {
  return actions.map(action => 
    `- [[action:${action.id}]]: ${action.label} - ${action.description}`
  ).join('\n');
}

// Generate action instructions for system prompt
export function getActionInstructions(): string {
  return `
AVAILABLE ACTIONS:
You can suggest actions to help users navigate and use Intelligent Admin's features.
Use the format [[action:action_id]] to insert an action link in your response.

Available actions:
${formatActionsForLLM(AVAILABLE_ACTIONS)}

GUIDELINES:
- Only suggest actions that are directly relevant to the user's request
- Place action tokens naturally within your response text
- Don't overwhelm users with too many actions (max 3-4 per response)
- Prioritize high-priority actions when appropriate
- Example: "You can [[action:connect_gmail]] to start receiving automated email insights."
`;
}
