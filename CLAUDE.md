# AI-Powered Administrative Assistant - Claude Code Instructions

## Project Overview
This is an AI-driven administrative assistant application for small trade businesses in Australia. The application features an AI chat interface accessible from mobile and desktop devices, with MCP (Model Context Protocol) integrations, secure authentication, and document processing capabilities.

## Quick Reference
- **Documentation**: See `/docs/` folder for detailed specifications
- **Architecture**: Microservices with React frontend, Node.js backend, PostgreSQL database
- **Development**: Phase-based approach starting with MVP (chat + Gmail integration)
- **Testing**: Run `npm run test` for backend, `npm run test:frontend` for frontend
- **Build**: Use `npm run build` to build all services
- **Deployment**: Docker-based with Kubernetes for production

## Core Application Requirements

**Objective**:  
Develop an AI-driven application that acts as a centralized administrative assistant for small trade businesses in Australia. The application features a single-screen AI chat interface, accessible from both mobile and desktop devices, to manage administrative tasks. The system currently integrates with Gmail and handles document processing, with future plans for Calendar and other service integrations via MCP (Model Context Protocol) when needed. Users authenticate securely to these applications, and the app processes industry standards and business information from URLs or uploaded files to maintain persistent context.

---

#### Key Features and Functionalities

1. **AI Chat Interface**:

   - Serves as the primary user interaction point for managing tasks like scheduling, emailing, or customer updates.
   - Accessible via web browsers on mobile and desktop devices.
   - Interprets natural language queries and provides actionable responses or recommendations.

2. **Application Recommendation and Connection**:

   - AI assesses user needs and suggests relevant applications from the MCP server library.
   - Enables seamless connections to selected applications for task execution.

3. **Integration with External Applications**:

   - Connects to APIs of applications such as Gmail, Google Calendar, and HubSpot.
   - Performs tasks on behalf of users, e.g., sending emails, scheduling events, or managing contacts.

4. **Authentication Mechanism**:

   - Provides secure authentication to external applications using OAuth 2.0.
   - Manages and stores authentication tokens securely for repeated use.

5. **Document Processing and Information Extraction**:

   - Ingests documents from URLs or uploads (e.g., PDFs, Word files).
   - Extracts relevant information (e.g., trade regulations, pricing, client details) to improve task execution and recommendations.
   - Maintains persistent context across user interactions.

6. **Persistent Storage**:

   - Stores user profiles, authentication tokens, and extracted business data securely.
   - Supports retrieval of historical data to enhance AI performance.

7. **Service Integration Layer**:
   - Gmail integration for email management and analysis
   - Document processing for industry knowledge extraction
   - Future MCP integrations planned for Calendar and other services

---

#### Architecture and Components

The application will use a modular architecture for scalability and ease of development:

- **Frontend**:

  - Web-based interface using React, Angular, or Vue.js.
  - Features the AI chat interface and responsive design for mobile and desktop.

- **Backend**:

  - Server-side logic built with Node.js (Express.js), Django, or Flask.
  - Manages API integrations, authentication, and data processing.

- **AI Engine**:

  - Drives the chat interface with natural language processing (NLP).
  - Includes a recommendation system for application suggestions.
  - Processes documents for context extraction.

- **Database**:

  - Stores structured data (e.g., PostgreSQL) or flexible unstructured data (e.g., MongoDB).
  - Holds user data, tokens, and persistent context.

- **Service Layer**:

  - Gmail service for email operations and analysis
  - Document processing service for OCR and content extraction
  - Industry knowledge service for Australian trade information

- **Security Layer**:
  - Implements OAuth 2.0 for secure external app access.
  - Ensures data encryption and secure API interactions.

---

#### Data Flow

1. **User Request**:

   - User submits a request (e.g., "Email a client") via the chat interface.
   - Frontend sends the request to the backend.

2. **AI Processing**:

   - Backend routes the request to the AI engine.
   - AI interprets the request using NLP, retrieves context from the database, and processes any provided documents or URLs.

3. **Recommendation and Task Execution**:

   - AI recommends an application (e.g., Gmail) from the MCP library.
   - User selects the application, triggering OAuth 2.0 authentication.
   - Backend executes the task via the application's API (e.g., sends an email).

4. **Context Storage**:
   - AI saves interaction details and extracted data to the database for future use.

---

#### Technologies and Frameworks

- **Frontend**:

  - React with Tailwind CSS for a responsive UI.
  - WebSocket for real-time chat updates.

- **Backend**:

  - Node.js with Express.js for handling APIs and integrations.

- **AI Engine**:

  - **NLP**: Pre-trained models from Hugging Face (e.g., BERT) or custom models with TensorFlow/PyTorch.
  - **Recommendation**: Basic rule-based or machine learning algorithms.

- **Database**:

  - PostgreSQL for structured data or MongoDB for flexibility.

- **Authentication**:

  - OAuth 2.0 with libraries like Passport.js.

- **Document Processing**:

  - **OCR**: Tesseract.js for text extraction.
  - **NLP**: spaCy or NLTK for information extraction.

- **Cloud Hosting**:
  - AWS, Google Cloud, or Azure for scalable deployment.

---

#### Security Considerations

- **Authentication**: Use OAuth 2.0 for secure access to external applications; encrypt tokens in storage.
- **Data Security**: Encrypt sensitive data in transit (SSL/TLS) and at rest.
- **API Protection**: Implement rate limiting, input validation, and secure API keys.
- **Compliance**: Ensure adherence to the Australian Privacy Act 1988 and trade-specific regulations.

---

#### Scalability and Performance

- **Microservices**: Separate backend into services (e.g., AI, authentication) for independent scaling.
- **Caching**: Use Redis for frequently accessed data to reduce database load.
- **Load Balancing**: Distribute traffic across servers as usage increases.
- **Async Processing**: Handle document processing with message queues (e.g., RabbitMQ).

---

#### Development Approach

1. **Phase 1: Core Setup**

   - Develop the AI chat interface with basic NLP capabilities.
   - Implement authentication and connect to one application (e.g., Gmail).
   - Set up the database for user data and tokens.

2. **Phase 2: Application Recommendations**

   - Build the recommendation system for suggesting applications.
   - Add integrations with additional applications (e.g., Calendar, HubSpot).

3. **Phase 3: Document Processing**

   - Enable document uploads and URL ingestion.
   - Process and store extracted data for persistent context.

4. **Phase 4: Advanced Integrations**

   - Implement Calendar integration for scheduling coordination
   - Add additional service integrations as needed

5. **Phase 5: Refinement**
   - Perform unit, integration, and user testing.
   - Optimize for performance and cross-platform compatibility.
   - Conduct a security audit.

---

#### Additional Guidance

- **MVP Strategy**: Start with a minimal viable product (chat + one integration) and expand iteratively.
- **Pre-Trained Models**: Use existing NLP models to accelerate development and ensure accuracy.
- **User Experience**: Design a simple, intuitive chat interface tailored to trade business owners.
- **Documentation**: Maintain clear documentation for APIs, data models, and integrations.
- **Feedback Loop**: Include a mechanism for users to provide feedback on AI responses.

---

## Development Instructions for Claude Code

### Current Development Phase
We are in **Phase 2: Email Intelligence & Industry Knowledge** (see `/docs/development-roadmap.md` and WARP.md)

### Immediate Next Steps
1. **Email Intelligence**: Complete Gmail OAuth flow and urgency detection system
2. **Push Notifications**: Implement Firebase integration for Morning Brief notifications  
3. **Industry Knowledge**: Integrate Australian trade standards and regulations
4. **Mobile Optimization**: Improve touch-first interface for field professionals
5. **User Onboarding**: Build progressive disclosure flow for new users

### Key Implementation Guidelines

#### Code Quality Standards
- **TypeScript**: Strict mode enabled throughout
- **Testing**: Minimum 80% code coverage with co-located test files
- **Linting**: ESLint + Prettier configuration with strict rules (see Linting Configuration below)
- **Architecture**: Follow microservices patterns from `/docs/system-architecture.md`
- **Component Organization**: Co-located structure (see Component Standards below)

#### Linting Configuration
The project uses a strict, consistent ESLint configuration across all modules:

**Applied Rules:**
- **TypeScript Strict Mode**: `no-explicit-any` (error), `explicit-function-return-type` (error)
- **Code Complexity**: Cyclomatic complexity max 10, nesting depth max 4 (warnings)
- **File Limits**: Max 300 lines per file, max 50 lines per function (warnings, excluding blanks/comments)
- **Function Limits**: Max 4 parameters per function (warning)
- **Security**: Node.js security vulnerabilities detection (backend only)
- **React/A11y**: Accessibility and React best practices (frontend only)
- **Import/Export**: Consistent type imports, no duplicate imports

**Module-Specific Configurations:**
- **Root** (`eslint.config.js`): Base TypeScript strict rules for all files
- **Frontend** (`frontend/eslint.config.js`): React, JSX, accessibility rules
- **Backend** (`backend/eslint.config.js`): Node.js and security-specific rules
- **Shared** (`shared/eslint.config.js`): TypeScript library rules

**Linting Automation Options:**
1. **Lint-on-Save** (Recommended): Configure your IDE to run ESLint on file save
   - VS Code: Install ESLint extension, enable `eslint.codeActionsOnSave`
   - Provides immediate feedback during development
   
2. **CI/CD Integration**: ESLint checks in GitHub Actions workflow
   - Prevents merging code with linting violations
   - Run `npm run lint` in CI pipeline

**Manual Linting Commands:**
- `npm run lint` - Check all files
- `npm run lint:fix` - Auto-fix where possible
- `npx eslint path/to/file.ts` - Check specific file

#### Component Organization Standards

**Co-located Component Structure** (shadcn-ui Compatible):
```
src/components/ui/
├── button/
│   ├── index.ts              # Re-exports: export { Button } from './Button'
│   ├── Button.tsx            # Component implementation
│   ├── Button.stories.tsx    # Storybook visual testing
│   └── Button.test.tsx       # Vitest unit tests
├── card/
│   ├── index.ts
│   ├── Card.tsx
│   ├── Card.stories.tsx
│   └── Card.test.tsx
```

**shadcn-ui Compatibility Maintained:**
- ✅ Import paths unchanged: `import { Button } from '@/components/ui/button'`
- ✅ CLI commands work: `npx shadcn add button`
- ✅ Path aliases preserved: `@/components` → `src/components`
- ✅ TypeScript strict mode compatible

**File Naming Conventions:**
- **Components**: PascalCase (e.g., `Button.tsx`, `ChatMessage.tsx`)
- **Stories**: `ComponentName.stories.tsx`
- **Tests**: `ComponentName.test.tsx`
- **Re-exports**: `index.ts` (lowercase)

**Import Guidelines:**
```typescript
// ✅ Within component folder: relative imports
import { Button } from './Button';

// ✅ External components: path aliases
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ✅ External libraries: direct imports
import { cva, type VariantProps } from 'class-variance-authority';
```

**Component Development Workflow:**
1. **Create Component**: Implement in `ComponentName.tsx`
2. **Add Re-exports**: Update `index.ts` for clean imports
3. **Write Stories**: Create comprehensive Storybook stories
4. **Write Tests**: Add unit tests with good coverage
5. **Update UI Index**: Add to main `src/components/ui/index.ts`

**Testing Co-location Benefits:**
- Related files stay together during refactoring
- Easier code review (all changes in one folder)
- Better development experience (less file switching)
- Clear component ownership and boundaries

#### Security Requirements
- **Authentication**: JWT with refresh tokens
- **OAuth 2.0**: For external integrations
- **Data Encryption**: AES-256 for sensitive data at rest
- **Input Validation**: Comprehensive sanitization
- **Rate Limiting**: API protection against abuse

#### Performance Targets
- **Chat Response**: < 200ms for simple queries
- **AI Processing**: < 2s for complex NLP tasks
- **File Upload**: < 30s for document processing
- **Concurrent Users**: Support 1000+ users

### File Structure Priority
Current monorepo structure (focus areas):
1. `backend/src/services/` - Email intelligence and industry knowledge services
2. `frontend/src/components/` - Chat interface and mobile optimization
3. `backend/src/routes/` - API endpoints for email analysis and notifications
4. `shared/src/types/` - Common TypeScript interfaces
5. Database schema in `backend/prisma/` - already implemented

### Testing Strategy
- **Unit Tests**: All service functions
- **Integration Tests**: API endpoints
- **Component Tests**: React components
- **E2E Tests**: Critical user flows
- Run tests before any commits

### Deployment Notes
- **Development**: Docker Compose setup
- **Production**: Kubernetes with managed databases  
- **Monitoring**: Implement logging and metrics from start
- **CI/CD**: GitHub Actions for automated testing and deployment

### External Dependencies
- **AI Models**: OpenAI API (GPT-4/3.5-turbo) for chat and analysis
- **Databases**: PostgreSQL (production), Redis (cache/sessions)
- **OAuth Providers**: Kinde (auth) + Google (Gmail integration)
- **Notifications**: Firebase for push notifications
- **File Storage**: Local filesystem (development), cloud storage (production)

### Current Implementation Status
- ✅ **Foundation**: React + Express.js + PostgreSQL architecture complete
- ✅ **Core Chat**: AI-powered conversation interface implemented
- ✅ **Authentication**: Kinde + Google OAuth flows working
- ✅ **Database**: Prisma schema with email analysis and industry knowledge models
- 🔄 **Email Intelligence**: Gmail integration and urgency detection in progress
- 🔄 **Industry Knowledge**: Australian trade regulations integration in progress
- ⏳ **Push Notifications**: Firebase integration pending
- ⏳ **Mobile UX**: Touch-first interface optimizations pending

This reflects the current state of an actively developed trade business administrative assistant with core functionality implemented and Phase 2 features in progress.