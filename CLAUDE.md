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
Develop an AI-driven application that acts as a centralized administrative assistant for small trade businesses in Australia. The application will feature an AI chat interface, accessible from both mobile and desktop devices, to manage administrative tasks. It will recommend and connect to external applications (e.g., Gmail, Calendar, HubSpot) through an AI-curated library of **MCP (Model Context Protocol)** servers, which enable the main AI agent to interface with specialized agents for specific tasks. Users will authenticate securely to these applications, and the app will process industry standards and business information from URLs or uploaded files to maintain persistent context.

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

7. **MCP Server Library**:
   - A collection of specialized agents for tasks like email integration or document handling.
   - AI dynamically selects and interfaces with these agents via the **Model Context Protocol**.

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

- **MCP Agents**:

  - Specialized agents for specific tasks (e.g., Gmail API calls, file parsing).
  - Communicate with the AI engine via the Model Context Protocol.

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

4. **Phase 4: MCP Integration**

   - Define the MCP server library and connect specialized agents.
   - Test AI-driven agent selection and task execution.

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
We are in **Phase 1: Foundation & Core Chat** (see `/docs/development-roadmap.md`)

### Immediate Next Steps
1. **Project Structure Setup**: Create the monorepo structure as defined in `/docs/project-structure.md`
2. **Environment Setup**: Follow `/docs/development-environment.md` for local development
3. **Database Schema**: Implement the schema from `/docs/data-models.md`
4. **API Foundation**: Build REST endpoints per `/docs/api-documentation.md`
5. **Frontend Scaffold**: Create React components for chat interface

### Key Implementation Guidelines

#### Code Quality Standards
- **TypeScript**: Strict mode enabled throughout
- **Testing**: Minimum 80% code coverage
- **Linting**: ESLint + Prettier configuration
- **Architecture**: Follow microservices patterns from `/docs/system-architecture.md`

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
When building, focus on this order:
1. `/packages/shared/` - Common types and utilities
2. `/packages/backend/` - API server with authentication
3. `/packages/frontend/` - React chat interface
4. `/packages/ai-engine/` - AI processing service
5. Integration services (after MVP)

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
- **AI Models**: Hugging Face Transformers or OpenAI API
- **Databases**: PostgreSQL (primary), Redis (cache)
- **OAuth Providers**: Google, Microsoft for integrations
- **File Storage**: Local filesystem initially, S3-compatible later

This comprehensive planning provides a solid foundation for building the AI-powered administrative assistant application systematically and efficiently.