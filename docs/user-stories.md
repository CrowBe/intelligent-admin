# User Stories Documentation

## User Story 1: First-Time User Onboarding - "Dave the Electrician"

### User Profile
- **Name:** Dave Thompson
- **Business:** Small electrical contracting (3 employees)
- **Location:** Melbourne, Australia
- **Tech Comfort:** Basic (iPhone user, basic email, struggles with admin)
- **Pain Points:** 
  - Spends more time on admin than actual electrical work
  - 47 unread emails causing stress
  - Poor at follow-ups, losing jobs due to delayed quotes
  - Lacks confidence in professional communication
  - Typically gives up on new tech solutions

### Scenario Context
Dave heard about the AI assistant from another tradie at the pub. He's accessing the system on his phone during lunch break, feeling skeptical but desperate for help with admin tasks.

### User Journey Flow

#### 1. Initial Landing & Sign-up
**User Behavior:**
- Hesitant and confused about what to do
- Types simple "Hello" to test the system
- Concerned about email security during sign-up

**System Requirements:**
- Clear, welcoming initial message
- Simple sign-up process
- Immediate reassurance about security
- Progressive disclosure of features

#### 2. Business Context Gathering
**User Behavior:**
- Overwhelmed by scope of problems (emails, quotes, follow-ups)
- Needs guided questioning rather than open-ended prompts
- Responds better to specific problems than general capabilities

**System Requirements:**
- Ask focused questions about daily pain points
- Acknowledge user frustration
- Use conversational, non-technical language
- Build empathy before offering solutions

#### 3. Gmail Integration Setup
**User Behavior:**
- Major security concerns about email access
- Needs reassurance about control and reversibility
- Wants to understand exactly what will happen

**System Requirements:**
- Clear step-by-step explanation before OAuth
- Emphasize read-only access initially
- Show how to disconnect before connecting
- Use Google's standard OAuth flow
- Confirm successful connection with clear visual feedback

#### 4. AI Capability Demonstration
**User Behavior:**
- Impressed by quality of suggested email response
- Surprised by professional tone that still sounds like him
- Wants to understand how the AI makes decisions

**System Requirements:**
- Show real email with AI-generated response
- Explain AI reasoning in simple terms (pattern recognition vs "magic")
- Demonstrate context understanding (urgency detection)
- Maintain transparency about how decisions are made

#### 5. Progressive Feature Introduction
**User Behavior:**
- Becomes more confident as each feature proves valuable
- Accepts additional integrations more readily
- Wants to maintain control over final actions

**System Requirements:**
- Suggest calendar integration based on demonstrated need
- Offer draft creation (not automatic sending) as next step
- Focus on time-saving benefits
- Don't overwhelm with too many simultaneous integrations

#### 6. Email Processing & Prioritization
**User Behavior:**
- Appreciates AI's ability to prioritize by urgency
- Values explanation of decision-making logic
- Prefers batch processing over one-by-one handling

**System Requirements:**
- Process multiple emails and rank by priority
- Explain urgency detection (keywords, business impact)
- Show different tones for different client types (B2B vs casual)
- Provide clear drafts review interface

#### 7. Maintaining User Control
**User Behavior:**
- Wants to review before sending anything
- Prefers familiar interfaces (Gmail app) for final actions
- Values being "the boss" who makes final decisions

**System Requirements:**
- Create drafts, don't send automatically
- Provide easy links to Gmail drafts
- Clear instructions for review and send process
- Maintain human checkpoints for all customer communications

### Key Success Metrics
- User completes OAuth flow without abandoning
- User sends at least one AI-drafted email
- User requests additional integrations
- User expresses intent to continue using system
- Time to first successful email: < 10 minutes

### Critical Technical Requirements

#### Security & Trust
- Standard OAuth 2.0 implementation
- Clear permission scoping (read vs write)
- Easy disconnection process
- Transparent data usage explanation

#### AI Capabilities
- Email content analysis and urgency detection
- Context-aware response drafting
- Tone adaptation based on recipient type
- Learning from user's historical communication style

#### User Experience
- Mobile-optimized chat interface
- Progressive feature disclosure
- Clear error handling and help text
- Seamless integration with existing tools (Gmail, Calendar)

#### Integration Points
- Google Gmail API (OAuth 2.0)
- Google Calendar API
- Draft creation without automatic sending
- Link generation to native apps

### Lessons for Development

#### Do's
- Start with one integration and prove value
- Explain AI decision-making transparently
- Maintain user control over all final actions
- Use conversational, empathetic language
- Show don't tell - demonstrate with real data

#### Don'ts
- Don't overwhelm with multiple simultaneous integrations
- Don't send anything automatically without explicit permission
- Don't use technical jargon or complex explanations
- Don't assume user comfort with new technology
- Don't introduce lukewarm integrations during initial flow

### Next Development Priorities
1. Robust OAuth flow with clear security messaging
2. Email analysis engine with urgency detection
3. Draft creation system with tone adaptation
4. Mobile-optimized chat interface
5. Clear integration management dashboard

### Testing Scenarios
- Test with users who have varying tech comfort levels
- Validate email urgency detection accuracy
- Ensure OAuth flow completion rates
- Measure time-to-value for first successful task
- Test error handling and recovery flows

---

## User Story 2: Daily Email Management & Engagement - "Dave Returns"

### User Profile
- **Same User:** Dave Thompson (after 2 weeks of usage)
- **Context:** Has successfully onboarded, now establishing daily routine
- **Time:** Monday 7:30 AM, checking emails before first job

### Scenario Context
Dave received a push notification "Morning Brief" about urgent overnight emails. This is the key engagement mechanism that brings users back daily.

### User Journey Flow

#### 1. Push Notification Engagement System
**Notification Strategy:**
- **Trigger:** AI detects genuinely urgent emails (equipment failures, emergency calls)
- **Timing:** Early morning (7:00-7:30 AM) before workday starts
- **Content:** "🔴 Morning Brief: 2 urgent issues - Westfield food court down + Jim's Auto power problems. Tap to respond."
- **Threshold:** Conservative approach - better to miss borderline cases than spam users

**Technical Requirements:**
- Push notification infrastructure
- Urgency detection algorithm with keyword analysis
- User preference settings for notification timing/frequency
- Integration with email analysis pipeline

#### 2. Email Prioritization & Triage
**User Behavior:**
- Wants urgent issues handled first
- Appreciates clear categorization (🔴 Urgent, 🟡 Standard, 🟢 Follow-ups, 📋 Admin)
- Needs quick assessment of business impact

**System Requirements:**
- Automated email categorization
- Visual priority indicators
- Business impact assessment (number of affected customers, revenue at risk)
- Clear summary of what needs immediate attention

#### 3. Workflow Learning & Adaptation
**Key Learning Opportunities:**
- **Task Batching:** User prefers handling similar tasks together when in "email mode"
- **Follow-up Timing:** Higher value quotes ($2K+) need faster follow-up (3-4 days vs 7 days)
- **Communication Tone:** Business customers get direct approach, residential customers need gentle tone
- **Schedule Flexibility:** User's willingness to reschedule based on emergency priority

**System Requirements:**
- Preference learning engine
- Context-aware questioning during interactions
- Progressive profiling of user workflow patterns
- Application of learned preferences to future tasks

#### 4. Language Clarity & User Control
**Critical Insight:** Initial language must clearly distinguish suggestions from actions
- ❌ "I suggested you can be there by 8:30 AM if you reschedule your 9 AM residential job"
- ✅ "Quick question: Your 9 AM with Mrs. Chen might need shifting - would you be willing to move her to 11:30 AM?"

**System Requirements:**
- Conditional language for all scheduling suggestions
- Clear approval gates before any customer communication
- Transparent reasoning for recommendations

#### 5. Onboarding Integration
**Morning Brief Setup Process:**
- Introduce after successful Gmail/Calendar integration
- Frame as time-saving convenience, not requirement
- Emphasize conservative approach (won't spam)
- Use push notifications instead of SMS (less friction, better UX)
- Allow easy disable in settings

### Key Success Metrics
- Morning Brief open rate >70%
- Time from notification to first action <5 minutes
- User retention day 14+ >80%
- Learned preference accuracy (follows user patterns)
- Reduction in missed follow-ups

### Critical Technical Requirements

#### Engagement Infrastructure
- Push notification system with smart timing
- Urgency detection with machine learning capability
- Email categorization engine
- User preference storage and application

#### Learning System
- Pattern recognition for user workflow preferences
- Context-aware questioning system
- Progressive user profiling
- Preference application to future recommendations

#### App Branding Consideration
- **Name Change:** "TradeAssist" → "Intelligent Admin" 
- **Logo Concept:** Stylized AI | IA design
- **Rationale:** More generic, professional, industry-agnostic

### Development Priorities
1. Push notification infrastructure and urgency detection
2. Email categorization and prioritization system
3. Workflow learning engine with preference storage
4. Morning Brief feature with onboarding integration
5. Clear conditional language patterns throughout UI

---

## User Story 3: Business & Industry Context Gathering - "Understanding Dave's Trade"

### User Profile
- **Same User:** Dave Thompson (during extended onboarding)
- **Context:** System has email/calendar integration but needs industry knowledge to provide accurate advice
- **Goal:** Gather comprehensive business and industry context for better AI responses

### Scenario Context
After connecting basic integrations, the AI realizes it needs deeper understanding of Dave's specific trade, regulations, pricing, and business practices to provide valuable assistance.

### User Journey Flow

#### 1. Context Gap Recognition
**System Trigger:** AI identifies industry-specific terms in emails (RCD testing, compliance certificates, switchboard upgrades) that require domain knowledge

**User Behavior:**
- Willing to help but doesn't want to explain everything manually
- Prefers pointing to existing authoritative sources
- Values accuracy and wants to avoid embarrassing mistakes

#### 2. Industry Source Identification
**Key Information Sources Identified:**
- **Regulatory:** Australian Standards, Energy Safe Victoria (ESV)
- **Industry Bodies:** Master Electricians Australia (MEA)
- **Trade Publications:** *Electrical Connection* magazine pricing surveys
- **Business-Specific:** User's own website (davethomsonelectrical.com.au)
- **Competitive Intelligence:** Other local electrician websites

**User Preferences:**
- Trusts established industry sources over generic information
- Concerned about outdated pricing or regulations
- Values competitive market intelligence but feels "dodgy" about manual competitor research

#### 3. Business-Specific Context Areas

**Pricing Structure Learning:**
- Emergency vs. standard rates
- Commercial vs. residential pricing tiers
- Callout fees vs. hourly rates
- Certificate and compliance costs often forgotten in initial quotes

**Regulatory Knowledge:**
- Certificate of Electrical Safety requirements
- Different compliance levels for different job types
- Commercial vs. residential paperwork requirements

**Service Categorization:**
- Simple jobs (power points) - no certificates needed
- Complex jobs (switchboard work) - certificates required
- Emergency callouts - premium pricing
- Routine maintenance vs. new installations

#### 4. Information Sourcing Strategy
**User-Guided Discovery:**
- Ask user to identify their trusted information sources
- Request business website URL for tone/service matching
- Identify industry publications they reference
- Understand their competitive research habits

**Automated Information Gathering:**
- Web scraping of identified authoritative sources
- Regular updates to maintain current information
- Cross-referencing multiple sources for validation
- Integration with business pricing and service data

### Key Success Metrics
- Accuracy of industry-specific advice and recommendations
- Reduction in pricing estimation errors
- Correct compliance requirement identification
- User confidence in AI-generated quotes and responses

### Critical Technical Requirements

#### Information Processing Pipeline
- Web scraping capabilities for identified industry sources
- Document processing for regulations and standards
- Data validation and cross-referencing systems
- Regular update mechanisms for dynamic information (pricing, regulations)

#### Knowledge Integration
- Industry-specific terminology recognition
- Context-aware application of regulations to specific job types
- Pricing calculation engines with multiple rate structures
- Compliance requirement mapping to job categories

#### Source Management
- User-configurable trusted source lists
- Source reliability scoring and validation
- Update frequency management
- Conflict resolution between contradictory sources

### Information Categories to Process

#### Regulatory/Compliance
- Australian electrical standards and codes
- State-specific regulations (Energy Safe Victoria)
- Certification requirements by job type
- Safety protocols and testing requirements

#### Industry/Market Data
- Current pricing benchmarks and surveys
- Industry best practices and guidelines
- Trade association recommendations
- Market rate comparisons

#### Business-Specific
- User's service offerings and specializations
- Existing pricing structure and policies
- Brand voice and customer communication style
- Geographic service area and local market conditions

### Development Priorities
1. Web scraping and document processing infrastructure
2. Industry knowledge base with regular updates
3. Context-aware information application system
4. User-guided source identification and validation
5. Cross-referencing and conflict resolution mechanisms

---

## User Story 4: Document Upload Processing - "Understanding Client Requirements"

### User Profile
- **Same User:** Dave Thompson (established user, ~3 weeks usage)
- **Context:** System has industry knowledge from web sources, now needs to process user-specific documents
- **Goal:** Analyze client-provided documents to extract requirements, identify risks, and inform accurate quotes

### Scenario Context
Dave receives a commercial contract opportunity requiring compliance with client-specific standards that differ from industry defaults. The system must proactively identify when documents would be helpful and process them effectively.

### User Journey Flow

#### 1. Proactive Document Request Recognition
**System Triggers for Document Requests:**
- Keywords: "standards," "requirements," "specifications," "insurance," "council approval"
- Large job values (>$2,000)
- Commercial clients
- Complex project descriptions
- Compliance/safety concerns mentioned
- Repeat customers with previous work history

**User Behavior:**
- Often has relevant documents but doesn't think to share them proactively
- Appreciates when system identifies potential document needs
- Values time-saving analysis over manual document review

#### 2. Document Input Methods
**Multiple Upload Pathways:**
- Forward email with PDF attachments to connected Gmail
- Direct file upload via mobile app
- Photo capture of physical documents
- URL input for online specifications/requirements

**User Preferences:**
- Email forwarding preferred (already in workflow)
- Simple, familiar interface important
- Clear confirmation of successful document receipt

#### 3. Intelligent Document Analysis

**Cross-Reference with Existing Knowledge:**
- Compare client requirements against industry standards (ESV, MEA)
- Identify deviations from normal practices
- Flag requirements that exceed standard compliance

**Risk and Opportunity Identification:**
- Higher-than-normal requirements (monthly vs. 6-monthly RCD testing)
- Undefined scope areas requiring clarification
- Equipment/certification needs user may not possess
- Premium pricing justification opportunities

**Financial Impact Analysis:**
- Calculate cost implications of non-standard requirements
- Identify ongoing vs. one-time costs
- Suggest equipment investment vs. subcontracting decisions
- Highlight potential partnership opportunities

#### 4. Actionable Insights Generation

**Immediate Practical Advice:**
- "Monthly RCD testing would be $400/month across 12 buildings"
- "Thermal imaging requires equipment ($3K-8K) or subcontracting ($200-400/inspection)"
- "24-hour response requirement needs standby cost factoring"

**Strategic Business Guidance:**
- Equipment purchase vs. subcontract analysis
- Partnership opportunities with specialists
- Premium pricing justification based on higher standards
- Risk mitigation suggestions

#### 5. Integration with Quote Preparation
**Document insights directly inform:**
- Accurate cost estimation including compliance premiums
- Identification of scope clarification needs
- Risk factor communication to client
- Professional presentation of understanding client needs

### Example Document Processing Scenarios

#### Commercial Property Standards
**Document:** CBD Property Group Electrical Maintenance Standards
**Analysis Output:**
- Requirements exceeding ESV standards identified
- Cost implications calculated ($400/month additional for monthly testing)
- Equipment gaps highlighted (thermal imaging needs)
- Scope clarification needs flagged ("comprehensive audits" undefined)

#### Insurance Claim Documentation
**Trigger:** Customer mentions insurance company involvement
**System Request:** "For insurance electrical work, they sometimes have specific documentation requirements. Did they provide any claim forms or specifications?"
**Value:** Ensures compliance with insurance requirements, prevents claim rejection

#### Building Plans and Permits
**Trigger:** Large renovation or new installation discussion
**System Request:** "Do you have the architect's electrical plans or building permit? I can review them to ensure your quote covers everything and meets code."
**Value:** Comprehensive quoting, code compliance verification

### Key Success Metrics
- Accuracy improvement in quotes involving client-specific requirements
- Reduction in scope creep and unexpected costs
- Increased win rate on complex commercial contracts
- User proactive document sharing after system prompts
- Time saved on manual document review (from hours to minutes)

### Critical Technical Requirements

#### Document Processing Pipeline
- Multi-format document ingestion (PDF, images, emails)
- OCR capabilities for scanned documents
- Structured data extraction from various document types
- Integration with email processing workflow

#### Analysis Engine
- Cross-referencing with existing industry knowledge base
- Deviation detection from standard requirements
- Cost calculation integration with user's pricing structure
- Risk assessment and opportunity identification

#### Intelligent Prompting System
- Keyword and context-based document request triggers
- Learning from user document sharing patterns
- Timing optimization for document requests
- Clear value proposition communication for document sharing

#### Output Generation
- Structured analysis with clear action items
- Financial impact calculations
- Risk and opportunity summaries
- Integration with quote preparation workflow

### Information Categories to Extract

#### Compliance Requirements
- Testing frequencies and standards
- Certification needs beyond standard requirements
- Response time commitments
- Documentation and reporting requirements

#### Technical Specifications
- Equipment and material requirements
- Installation standards and methods
- Safety protocols and procedures
- Quality assurance measures

#### Commercial Terms
- Service level agreements
- Penalty clauses and performance metrics
- Payment terms and milestone requirements
- Liability and insurance provisions

### Development Priorities
1. Multi-format document processing infrastructure
2. Cross-referencing engine with industry knowledge base
3. Proactive document request triggering system
4. Financial impact calculation and presentation
5. Integration with quote preparation and customer communication

### Next Scenario Options Available
5. **Complex multi-step tasks** - Coordinated scheduling and follow-up
6. **Different user types** - Varying tech comfort levels and business needs  
8. **Integration setup** - Adding new services beyond Gmail/Calendar
9. **Error handling and recovery** - When things go wrong