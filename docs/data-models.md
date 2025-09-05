# Data Models

## Database Schema Design

### Overview
The application uses PostgreSQL as the primary database with Prisma ORM. The current schema is designed to support:
- **Phase 2A**: Email Intelligence & Notification Management
- **Phase 2B**: Industry Intelligence & Business Context
- **Core Features**: User management, onboarding, task tracking

### Design Principles
- CUID-based primary keys for better distributed performance
- JSON columns for flexible configuration storage
- Strategic indexing for query performance
- Foreign key relationships for data integrity
- Enum types for content categorization

## Core Data Models

### User Management

#### User
Basic user account information (placeholder model).

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Purpose**: Core user identity for authentication and authorization.
**Relations**: Referenced by all user-scoped models.
**Note**: This is a minimal placeholder model. Full user management is handled by Kinde authentication.

#### UserPreference
User business profile and application preferences.

```prisma
model UserPreference {
  id              String   @id @default(cuid())
  userId          String   @unique
  businessProfile Json?    // Business name, type, size, etc.
  preferences     Json     // General preferences
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

**Purpose**: Store user-specific business context and application settings.
**Key Fields**:
- `businessProfile`: Industry type, company size, trade specialization
- `preferences`: UI settings, AI personality, notification preferences

**TypeScript Interface:**
```typescript
interface UserPreference {
  id: string;
  userId: string;
  businessProfile?: {
    businessName: string;
    businessType: 'plumbing' | 'electrical' | 'carpentry' | 'other';
    businessSize: 'sole_trader' | 'small' | 'medium';
    location: string;
  };
  preferences: {
    aiPersonality: 'professional' | 'friendly' | 'concise';
    proactiveMode: boolean;
    timezone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Task Management

#### Task
User tasks with due dates and reminder tracking.

```prisma
model Task {
  id           String    @id @default(cuid())
  userId       String
  title        String
  description  String?
  status       String    @default("pending") // pending, completed, cancelled
  dueDate      DateTime
  reminderSent Boolean   @default(false)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([userId])
  @@index([status])
  @@index([dueDate])
}
```

**Purpose**: Track user tasks and send automated reminders.
**Key Features**:
- Status tracking for task lifecycle
- Due date indexing for efficient reminder queries
- Reminder sent tracking to avoid duplicates

**TypeScript Interface:**
```typescript
interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed' | 'cancelled';
  dueDate: Date;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### User Onboarding

#### OnboardingProgress
Tracks user progress through the onboarding flow.

```prisma
model OnboardingProgress {
  id          String    @id @default(cuid())
  userId      String
  step        String    // welcome, business_profile, gmail_connect, etc.
  completedAt DateTime?
  skipped     Boolean   @default(false)
  data        Json?     // Step-specific data
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([userId, step])
  @@index([userId])
}
```

**Purpose**: Progressive disclosure onboarding with step tracking.
**Key Features**:
- Unique constraint prevents duplicate steps per user
- Step-specific data storage for flexible onboarding flows
- Skip tracking for optional steps

**Common Steps**:
- `welcome`: Initial welcome screen
- `business_profile`: Business details collection
- `gmail_connect`: Gmail OAuth setup
- `notification_preferences`: Notification settings
- `first_task`: Create first task walkthrough

**TypeScript Interface:**
```typescript
interface OnboardingProgress {
  id: string;
  userId: string;
  step: string;
  completedAt?: Date;
  skipped: boolean;
  data?: {
    // Step-specific data structure
    businessType?: string;
    notificationTime?: string;
    integrationScopes?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## Phase 2A: Email Intelligence & Notifications

### Email Analysis

#### EmailAnalysis
AI-powered analysis of Gmail messages for priority and urgency detection.

```prisma
model EmailAnalysis {
  id                String   @id @default(cuid())
  userId            String
  emailId           String   @unique
  subject           String
  sender            String
  snippet           String
  priority          String   // urgent, high, medium, low
  category          String   // urgent, standard, follow-up, admin, spam
  urgencyScore      Float
  businessRelevance Float
  actionRequired    Boolean
  keywords          String[]
  suggestedActions  String[]
  reasoning         String
  notificationSent  Boolean  @default(false)
  analyzedAt        DateTime @default(now())
  createdAt         DateTime @default(now())

  @@index([userId])
  @@index([priority])
  @@index([category])
}
```

**Purpose**: Analyze incoming emails for business relevance and urgency.
**Key Features**:
- AI-driven priority scoring (0-1 float scale)
- Category classification for filtering
- Action suggestion generation
- Notification tracking to prevent spam

**Priority Levels**:
- `urgent`: Customer complaints, payment issues, safety concerns
- `high`: Project deadlines, supplier communications
- `medium`: General business communications
- `low`: Newsletters, marketing, social updates

**TypeScript Interface:**
```typescript
interface EmailAnalysis {
  id: string;
  userId: string;
  emailId: string; // Gmail message ID
  subject: string;
  sender: string;
  snippet: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: 'urgent' | 'standard' | 'follow-up' | 'admin' | 'spam';
  urgencyScore: number; // 0-1 scale
  businessRelevance: number; // 0-1 scale
  actionRequired: boolean;
  keywords: string[];
  suggestedActions: string[];
  reasoning: string; // AI explanation
  notificationSent: boolean;
  analyzedAt: Date;
  createdAt: Date;
}
```

### Notification Management

#### NotificationPreference
User-specific notification settings and timing preferences.

```prisma
model NotificationPreference {
  id                String   @id @default(cuid())
  userId            String
  type              String   // morning_brief, urgent_email, task_reminder, etc.
  enabled           Boolean  @default(true)
  timingPreferences Json?    // {startHour, startMinute, endHour, endMinute, timezone, daysOfWeek}
  channels          Json?    // {push: true, email: false, sms: false}
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([userId, type])
  @@index([userId])
}
```

**Purpose**: Fine-grained notification control per user and notification type.
**Key Features**:
- Type-specific settings (morning brief vs urgent emails)
- Multi-channel support (push, email, SMS)
- Timing windows for business hours

**Notification Types**:
- `morning_brief`: Daily email summary
- `urgent_email`: Immediate urgent email alerts
- `task_reminder`: Task due date reminders
- `system_update`: Application updates

#### NotificationToken
Device tokens for push notifications.

```prisma
model NotificationToken {
  id        String   @id @default(cuid())
  userId    String
  token     String
  platform  String   // web, ios, android
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([token])
}
```

**Purpose**: Firebase Cloud Messaging (FCM) token management.
**Key Features**:
- Multi-device support per user
- Platform-specific token handling
- Active status for token cleanup

#### NotificationLog
Audit trail for all notifications sent.

```prisma
model NotificationLog {
  id       String    @id @default(cuid())
  userId   String
  type     String    // notification type
  title    String
  body     String
  data     Json?
  channel  String    // push, email, sms
  status   String    // pending, sent, delivered, failed, read
  sentAt   DateTime?
  readAt   DateTime?
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([type])
  @@index([status])
}
```

**Purpose**: Track notification delivery and engagement metrics.
**Key Features**:
- Status tracking for delivery confirmation
- Read receipt tracking
- Debugging failed notifications

**TypeScript Interfaces:**
```typescript
interface NotificationPreference {
  id: string;
  userId: string;
  type: 'morning_brief' | 'urgent_email' | 'task_reminder' | 'system_update';
  enabled: boolean;
  timingPreferences?: {
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
    timezone: string;
    daysOfWeek: number[]; // 0-6, Sunday=0
  };
  channels?: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface NotificationLog {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: any;
  channel: 'push' | 'email' | 'sms';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  sentAt?: Date;
  readAt?: Date;
  createdAt: Date;
}
```

## Phase 2B: Industry Intelligence & Business Context

### Industry Knowledge Management

#### IndustrySource
External sources for Australian trade industry information.

```prisma
model IndustrySource {
  id          String       @id @default(cuid())
  name        String       @unique
  url         String?
  isActive    Boolean      @default(true)
  lastCrawled DateTime?
  items       IndustryItem[]
  crawls      CrawlLog[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}
```

**Purpose**: Manage sources of Australian trade standards and regulations.
**Key Sources**:
- Standards Australia
- Safe Work Australia
- Australian Building Codes Board
- State-specific trade authorities
- Industry association websites

#### ContentType Enum
Categorizes different types of industry content.

```prisma
enum ContentType {
  regulation
  standard
  pricing
  safety
  best_practice
}
```

**Content Types**:
- `regulation`: Legal requirements and compliance
- `standard`: Australian Standards (AS/NZS)
- `pricing`: Market rates and pricing guides
- `safety`: Work health and safety requirements
- `best_practice`: Industry recommendations

#### IndustryItem
Specific pieces of industry knowledge and standards.

```prisma
model IndustryItem {
  id             String      @id @default(cuid())
  sourceId       String
  source         IndustrySource @relation(fields: [sourceId], references: [id])
  contentType    ContentType
  category       String
  title          String
  content        String
  relevanceScore Float       @default(0)
  sourceUrl      String?
  lastUpdated    DateTime    @default(now())
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt

  @@index([category])
  @@index([contentType])
  @@index([relevanceScore])
}
```

**Purpose**: Store and index searchable industry knowledge.
**Key Features**:
- AI-generated relevance scoring for search ranking
- Category-based organization (electrical, plumbing, carpentry)
- Full-text content for AI context retrieval

**Categories**:
- `electrical`: Electrical work standards and regulations
- `plumbing`: Plumbing codes and water safety
- `carpentry`: Building standards and timber regulations
- `hvac`: Heating, ventilation, air conditioning
- `general`: Cross-trade regulations and safety

#### CrawlLog
Audit trail for automated data collection from industry sources.

```prisma
model CrawlLog {
  id        String   @id @default(cuid())
  sourceId  String
  source    IndustrySource @relation(fields: [sourceId], references: [id])
  status    String
  message   String?
  startedAt DateTime @default(now())
  finishedAt DateTime?
}
```

**Purpose**: Track automated crawling of industry websites.
**Statuses**:
- `running`: Crawl in progress
- `completed`: Successful completion
- `failed`: Error occurred
- `partial`: Some content retrieved

**TypeScript Interfaces:**
```typescript
interface IndustryItem {
  id: string;
  sourceId: string;
  source: IndustrySource;
  contentType: 'regulation' | 'standard' | 'pricing' | 'safety' | 'best_practice';
  category: string;
  title: string;
  content: string;
  relevanceScore: number; // 0-1 AI-generated score
  sourceUrl?: string;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface IndustrySource {
  id: string;
  name: string;
  url?: string;
  isActive: boolean;
  lastCrawled?: Date;
  items: IndustryItem[];
  crawls: CrawlLog[];
  createdAt: Date;
  updatedAt: Date;
}
```

## Database Relationships

### Entity Relationship Overview
```
User (1) ──────────── (1) UserPreference
  │
  ├── (many) OnboardingProgress
  ├── (many) Task
  ├── (many) EmailAnalysis
  ├── (many) NotificationPreference
  ├── (many) NotificationToken
  └── (many) NotificationLog

IndustrySource (1) ── (many) IndustryItem
  │
  └── (many) CrawlLog
```

### Key Foreign Key Relationships
- All user-scoped models reference `User.id`
- `IndustryItem.sourceId` → `IndustrySource.id`
- `CrawlLog.sourceId` → `IndustrySource.id`

### Unique Constraints
- `User.email` - Single email per account
- `IndustrySource.name` - Unique source names
- `EmailAnalysis.emailId` - One analysis per Gmail message
- `OnboardingProgress.[userId, step]` - One record per step per user
- `NotificationPreference.[userId, type]` - One preference per notification type

## Performance Optimization

### Indexing Strategy
The schema includes strategic indexes for query performance:

**User-scoped Queries**:
- All models with `userId` have indexes for user-specific data retrieval
- Composite indexes on `[userId, type]` for notification preferences

**Time-based Queries**:
- `Task.dueDate` - For reminder scheduling
- `EmailAnalysis.analyzedAt` - For recent email analysis
- `NotificationLog.createdAt` - For notification history

**Content Discovery**:
- `IndustryItem.[category, contentType, relevanceScore]` - For AI knowledge retrieval
- `EmailAnalysis.[priority, category]` - For email filtering

**Notification Processing**:
- `NotificationToken.token` - For FCM token lookup
- `NotificationLog.status` - For delivery tracking

### Query Performance Considerations

**Hot Paths**:
1. **Email Analysis Lookup**: `WHERE userId = ? AND priority = 'urgent'`
2. **Task Reminders**: `WHERE status = 'pending' AND dueDate < NOW()`
3. **Industry Knowledge Search**: `WHERE category = ? AND contentType = ?`
4. **Notification Delivery**: `WHERE userId = ? AND active = true`

**JSON Column Usage**:
- `NotificationPreference.timingPreferences` - Structured timing rules
- `UserPreference.businessProfile` - Flexible business metadata
- `OnboardingProgress.data` - Step-specific configuration
- `NotificationLog.data` - Notification payload data

## Data Validation and Business Rules

### User Management
- `User.email` must be valid email format and unique
- `UserPreference.businessProfile.businessType` from predefined enum
- `OnboardingProgress.step` must match application flow steps

### Task Management
- `Task.status` limited to: pending, completed, cancelled
- `Task.dueDate` must be future date for new tasks
- `Task.title` required, max 255 characters

### Email Intelligence
- `EmailAnalysis.emailId` must be valid Gmail message ID
- `EmailAnalysis.urgencyScore` range: 0.0 to 1.0
- `EmailAnalysis.priority` from: urgent, high, medium, low

### Notification System
- `NotificationToken.platform` limited to: web, ios, android
- `NotificationPreference.type` must match supported notification types
- `NotificationLog.status` follows delivery lifecycle states

### Industry Knowledge
- `IndustryItem.contentType` must use ContentType enum
- `IndustryItem.relevanceScore` range: 0.0 to 1.0
- `IndustrySource.name` must be unique across all sources

## Data Retention and Maintenance

### Automated Cleanup Policies

**Notification Data**:
- `NotificationLog`: Retain 6 months for analytics
- `NotificationToken`: Remove inactive tokens after 30 days

**Task Management**:
- `Task` (completed): Retain 1 year
- `Task` (cancelled): Retain 6 months

**Email Analysis**:
- `EmailAnalysis`: Retain 1 year for learning
- Purge after Gmail message deletion

**Industry Knowledge**:
- `IndustryItem`: Indefinite retention
- `CrawlLog`: Retain 3 months for debugging

**User Data**:
- `OnboardingProgress`: Retain indefinitely
- `UserPreference`: Retain until account deletion

### Maintenance Operations

**Weekly Tasks**:
- Update `IndustryItem.relevanceScore` based on user interactions
- Archive old `NotificationLog` entries
- Cleanup inactive `NotificationToken` records

**Monthly Tasks**:
- Reindex `IndustryItem.content` for full-text search
- Analyze `EmailAnalysis` patterns for model improvement
- Cleanup completed `CrawlLog` entries

## Migration Strategy

### Database Versioning
The application uses Prisma migrations for schema evolution:

```bash
# Generate new migration
npx prisma migrate dev --name "add_feature_name"

# Apply to production
npx prisma migrate deploy
```

### Migration Best Practices
1. **Backward Compatibility**: New columns should be nullable or have defaults
2. **Index Creation**: Add indexes in separate migrations for large tables
3. **Data Migration**: Use Prisma scripts for data transformation
4. **Rollback Strategy**: Always test rollback procedures

### Current Schema Version
- **Phase 2A**: Email intelligence and notification management
- **Phase 2B**: Industry knowledge and business context
- **Status**: Active development with incremental migrations

## Backup and Recovery

### Backup Strategy
- **Frequency**: Daily automated backups
- **Retention**: 30 days rolling retention
- **Critical Data**: Extra protection for user preferences and industry knowledge

### Recovery Procedures
1. **Point-in-time Recovery**: PostgreSQL WAL-based recovery
2. **Data Corruption**: Restore from nearest backup
3. **Schema Issues**: Rollback migrations and restore data

---

This data model supports the current Phase 2 implementation of the AI-powered administrative assistant, with robust notification management, email intelligence, and Australian trade industry knowledge integration.