import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Seeding database...');

  // Create test user
  const hashedPassword = await bcryptjs.hash('testpassword123', 12);
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      businessName: 'Test Plumbing Co',
      businessType: 'plumbing',
      phone: '+61400000000',
      emailVerified: true,
      preferences: {
        notifications: {
          email: true,
          push: false,
          sms: false,
        },
        ai: {
          personality: 'professional',
          proactiveMode: true,
          autoSuggestions: true,
        },
        integrations: {
          autoConnect: false,
        },
      },
    },
  });

  console.log('✅ Created test user:', testUser.email);

  // Create MCP Agents
  const gmailAgent = await prisma.mCPAgent.upsert({
    where: { name: 'gmail-agent' },
    update: {},
    create: {
      name: 'gmail-agent',
      description: 'Gmail integration agent for email management',
      endpoint: 'http://localhost:3001/mcp/gmail',
      capabilities: [
        {
          name: 'send_email',
          description: 'Send emails via Gmail',
          inputSchema: {
            type: 'object',
            properties: {
              to: { type: 'string' },
              subject: { type: 'string' },
              body: { type: 'string' },
            },
            required: ['to', 'subject', 'body'],
          },
        },
        {
          name: 'read_emails',
          description: 'Read emails from Gmail',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              limit: { type: 'number', default: 10 },
            },
          },
        },
      ],
      configuration: {
        timeout: 30000,
        retries: 3,
        rateLimit: {
          requests: 100,
          window: 3600,
        },
      },
      version: '1.0.0',
      healthCheckUrl: 'http://localhost:3001/mcp/gmail/health',
      healthStatus: 'unknown',
    },
  });

  const calendarAgent = await prisma.mCPAgent.upsert({
    where: { name: 'calendar-agent' },
    update: {},
    create: {
      name: 'calendar-agent',
      description: 'Google Calendar integration agent',
      endpoint: 'http://localhost:3001/mcp/calendar',
      capabilities: [
        {
          name: 'create_event',
          description: 'Create calendar events',
          inputSchema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              startTime: { type: 'string' },
              endTime: { type: 'string' },
              description: { type: 'string' },
            },
            required: ['title', 'startTime', 'endTime'],
          },
        },
        {
          name: 'list_events',
          description: 'List upcoming calendar events',
          inputSchema: {
            type: 'object',
            properties: {
              timeMin: { type: 'string' },
              timeMax: { type: 'string' },
              maxResults: { type: 'number', default: 10 },
            },
          },
        },
      ],
      configuration: {
        timeout: 15000,
        retries: 2,
      },
      version: '1.0.0',
      healthCheckUrl: 'http://localhost:3001/mcp/calendar/health',
      healthStatus: 'unknown',
    },
  });

  const documentAgent = await prisma.mCPAgent.upsert({
    where: { name: 'document-agent' },
    update: {},
    create: {
      name: 'document-agent',
      description: 'Document processing and analysis agent',
      endpoint: 'http://localhost:3001/mcp/document',
      capabilities: [
        {
          name: 'process_document',
          description: 'Process and extract text from documents',
          inputSchema: {
            type: 'object',
            properties: {
              filePath: { type: 'string' },
              extractText: { type: 'boolean', default: true },
              performOCR: { type: 'boolean', default: false },
            },
            required: ['filePath'],
          },
        },
        {
          name: 'search_documents',
          description: 'Search through processed documents',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string' },
              limit: { type: 'number', default: 10 },
            },
            required: ['query'],
          },
        },
      ],
      configuration: {
        timeout: 60000,
        retries: 1,
        maxFileSize: 10485760, // 10MB
      },
      version: '1.0.0',
      healthCheckUrl: 'http://localhost:3001/mcp/document/health',
      healthStatus: 'unknown',
    },
  });

  console.log('✅ Created MCP agents:', [gmailAgent.name, calendarAgent.name, documentAgent.name]);

  // Create sample chat session
  const chatSession = await prisma.chatSession.create({
    data: {
      userId: testUser.id,
      title: 'Getting Started',
      contextData: {
        businessType: 'plumbing',
        currentTask: 'setup',
      },
      messageCount: 2,
    },
  });

  // Create sample messages
  await prisma.message.createMany({
    data: [
      {
        sessionId: chatSession.id,
        role: 'user',
        content: 'Hi, I need help setting up my business email integration.',
        metadata: {},
      },
      {
        sessionId: chatSession.id,
        role: 'assistant',
        content: 'I can help you set up email integration with Gmail. Would you like me to guide you through connecting your Gmail account?',
        metadata: {
          suggestions: ['Connect Gmail', 'Learn more about integrations', 'View available features'],
        },
      },
    ],
  });

  console.log('✅ Created sample chat session and messages');

  console.log('🎉 Database seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });