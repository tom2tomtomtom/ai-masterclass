const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

// Load environment variables
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const businessPromptTemplates = [
  // MARKETING CATEGORY
  {
    title: 'Brand Voice Definition Generator',
    description: 'Define and establish a consistent brand voice across all marketing communications',
    content: `You are a brand strategist specializing in voice and tone development.

Brand Context: {{brand_name}}
Industry: {{industry}}
Target Audience: {{target_audience}}
Brand Values: {{brand_values}}
Competitive Landscape: {{competitors}}

Create a comprehensive brand voice guide that includes:

1. **Voice Characteristics**
   - Primary personality traits (3-5 key attributes)
   - Communication style preferences
   - Emotional tone guidelines

2. **Do's and Don'ts**
   - Language to embrace
   - Words/phrases to avoid
   - Tone situations to navigate

3. **Practical Examples**
   - Social media post examples
   - Email communication samples
   - Customer service response templates

4. **Voice Consistency Framework**
   - Guidelines for different platforms
   - Adaptation strategies for various audiences
   - Quality assurance checklist

Ensure the voice feels authentic, memorable, and aligned with business objectives.`,
    industry_category: 'marketing',
    use_case_category: 'strategy',
    is_public: true,
    usage_count: 0
  },
  {
    title: 'SEO Content Strategy Planner',
    description: 'Develop comprehensive SEO content strategies with keyword targeting and content calendars',
    content: `You are an SEO content strategist with expertise in organic search optimization.

Business Details: {{business_name}}
Target Keywords: {{primary_keywords}}
Industry: {{industry}}
Target Audience: {{target_audience}}
Content Goals: {{content_goals}}
Competitor Analysis: {{competitor_insights}}

Develop a 90-day SEO content strategy including:

1. **Keyword Strategy**
   - Primary keyword clusters (5-8 clusters)
   - Long-tail keyword opportunities
   - Search intent mapping
   - Difficulty vs. opportunity analysis

2. **Content Calendar Framework**
   - Weekly publishing schedule
   - Content type distribution (blog, video, infographic, etc.)
   - Seasonal content opportunities
   - Trending topic integration plan

3. **Content Optimization Guidelines**
   - On-page SEO best practices
   - Internal linking strategy
   - Meta description templates
   - Schema markup recommendations

4. **Performance Tracking Plan**
   - Key metrics to monitor
   - Reporting schedule
   - Success criteria definition
   - Iteration and improvement process

Focus on sustainable, white-hat SEO practices that drive organic traffic growth.`,
    industry_category: 'marketing',
    use_case_category: 'content_strategy',
    is_public: true,
    usage_count: 0
  },
  {
    title: 'Social Media Crisis Management Plan',
    description: 'Create comprehensive crisis communication strategies for social media incidents',
    content: `You are a social media crisis management expert with experience in brand protection.

Brand: {{brand_name}}
Industry: {{industry}}
Crisis Scenario: {{crisis_type}}
Stakeholders: {{key_stakeholders}}
Brand Values: {{core_values}}

Create a crisis management response plan including:

1. **Immediate Response Protocol** (First 30 minutes)
   - Internal team notification process
   - Situation assessment checklist
   - Initial response template
   - Decision-making hierarchy

2. **Communication Strategy**
   - Key messaging framework
   - Tone and voice guidelines
   - Platform-specific responses
   - Stakeholder communication plan

3. **Response Templates**
   - Acknowledgment statements
   - Apology frameworks (when appropriate)
   - Corrective action communications
   - Follow-up messaging

4. **Long-term Recovery Plan**
   - Reputation rehabilitation strategy
   - Content strategy adjustments
   - Community rebuilding tactics
   - Monitoring and measurement plan

Ensure responses are authentic, transparent, and aligned with brand values while protecting brand reputation.`,
    industry_category: 'marketing',
    use_case_category: 'communication',
    is_public: true,
    usage_count: 0
  },
  {
    title: 'Influencer Partnership Campaign Brief',
    description: 'Design effective influencer marketing campaigns with clear objectives and guidelines',
    content: `You are an influencer marketing strategist specializing in authentic brand partnerships.

Campaign Details:
Brand: {{brand_name}}
Product/Service: {{product_details}}
Campaign Goals: {{campaign_objectives}}
Budget Range: {{budget_range}}
Target Audience: {{target_demographics}}
Timeline: {{campaign_timeline}}

Create a comprehensive influencer campaign brief including:

1. **Campaign Objectives & KPIs**
   - Primary goals (awareness, engagement, conversions)
   - Success metrics and benchmarks
   - ROI measurement framework
   - Timeline milestones

2. **Influencer Criteria**
   - Audience size and engagement requirements
   - Content style preferences
   - Brand alignment factors
   - Demographic specifications

3. **Content Guidelines**
   - Key messaging points
   - Brand voice requirements
   - Visual style guidelines
   - Hashtag strategy
   - Required disclosures

4. **Campaign Execution Plan**
   - Content calendar template
   - Approval process workflow
   - Deliverable specifications
   - Performance tracking methods

5. **Partnership Terms**
   - Compensation structure suggestions
   - Usage rights requirements
   - Exclusivity considerations
   - Performance bonus criteria

Focus on creating authentic partnerships that drive meaningful engagement and brand awareness.`,
    industry_category: 'marketing',
    use_case_category: 'strategy',
    is_public: true,
    usage_count: 0
  },
  {
    title: 'Email Marketing Automation Sequence',
    description: 'Build high-converting email automation sequences for customer nurturing',
    content: `You are an email marketing automation specialist focused on customer journey optimization.

Business Context:
Company: {{company_name}}
Product/Service: {{product_details}}
Customer Persona: {{target_customer}}
Journey Stage: {{customer_stage}}
Business Goals: {{email_goals}}

Design an email automation sequence including:

1. **Sequence Strategy**
   - Email series purpose and objectives
   - Target customer journey stage
   - Sequence length and timing
   - Trigger conditions

2. **Email Content Framework**
   - Subject line formulas
   - Opening hook strategies
   - Value proposition messaging
   - Call-to-action optimization
   - Personalization elements

3. **Individual Email Outlines**
   - Email 1: Welcome/Introduction
   - Email 2: Value delivery
   - Email 3: Social proof/testimonials
   - Email 4: Educational content
   - Email 5: Soft sales approach
   - Email 6: Direct conversion ask
   - Email 7: Last chance/urgency

4. **Optimization Elements**
   - A/B testing opportunities
   - Personalization tags
   - Dynamic content suggestions
   - Mobile optimization tips
   - Deliverability best practices

5. **Performance Tracking**
   - Key metrics to monitor
   - Success benchmarks
   - Optimization indicators
   - Reporting schedule

Create sequences that nurture relationships while driving business results.`,
    industry_category: 'marketing',
    use_case_category: 'content_creation',
    is_public: true,
    usage_count: 0
  },

  // SALES CATEGORY
  {
    title: 'Sales Discovery Call Framework',
    description: 'Structure effective discovery calls to uncover customer needs and pain points',
    content: `You are a sales methodology expert specializing in consultative selling approaches.

Sales Context:
Product/Service: {{offering_details}}
Target Customer: {{prospect_profile}}
Industry: {{prospect_industry}}
Sales Cycle: {{typical_sales_cycle}}
Meeting Duration: {{call_duration}}

Create a comprehensive discovery call framework including:

1. **Pre-Call Preparation**
   - Research checklist
   - Hypothesis development
   - Question preparation
   - Technical setup requirements

2. **Call Opening (5-10 minutes)**
   - Rapport building techniques
   - Agenda setting
   - Expectations alignment
   - Permission to explore

3. **Discovery Question Framework (20-30 minutes)**
   - Current state exploration
   - Pain point identification
   - Impact quantification
   - Decision-making process
   - Budget and timeline discussions
   - Success criteria definition

4. **Active Listening Techniques**
   - Note-taking strategies
   - Clarifying question examples
   - Emotional intelligence cues
   - Body language reading (virtual/in-person)

5. **Call Closing & Next Steps (5-10 minutes)**
   - Summary and confirmation
   - Next step agreements
   - Follow-up timeline
   - Internal champion identification

6. **Post-Call Actions**
   - CRM documentation
   - Stakeholder notifications
   - Proposal preparation
   - Follow-up scheduling

Focus on building trust while gathering comprehensive qualification information.`,
    industry_category: 'sales',
    use_case_category: 'communication',
    is_public: true,
    usage_count: 0
  },
  {
    title: 'Objection Handling Response Guide',
    description: 'Prepare effective responses to common sales objections across different scenarios',
    content: `You are a sales training expert specializing in objection handling and negotiation.

Sales Context:
Product/Service: {{product_details}}
Price Range: {{pricing_tier}}
Target Market: {{customer_segment}}
Competition: {{main_competitors}}
Common Objections: {{known_objections}}

Create a comprehensive objection handling guide including:

1. **Objection Categories & Responses**

   **PRICE OBJECTIONS**
   - "It's too expensive"
   - "We don't have budget"
   - "Your competitor is cheaper"
   
   **AUTHORITY OBJECTIONS**
   - "I need to check with my boss"
   - "The decision isn't mine to make"
   - "We need committee approval"
   
   **NEED OBJECTIONS**
   - "We don't need this right now"
   - "Our current solution works fine"
   - "This isn't a priority"
   
   **TRUST OBJECTIONS**
   - "We've never heard of your company"
   - "How do we know this will work?"
   - "We had a bad experience before"

2. **Response Framework** (for each objection)
   - Acknowledge and validate
   - Ask clarifying questions
   - Provide relevant information
   - Confirm understanding
   - Suggest next steps

3. **Advanced Techniques**
   - Feel, felt, found method
   - Boomerang technique
   - Evidence and social proof
   - Alternative close options

4. **Prevention Strategies**
   - Early objection identification
   - Preemptive addressing
   - Value establishment
   - Relationship building

Provide specific language examples and practice scenarios for each objection type.`,
    industry_category: 'sales',
    use_case_category: 'communication',
    is_public: true,
    usage_count: 0
  },
  {
    title: 'Sales Proposal Template Generator',
    description: 'Create compelling, customized sales proposals that address specific customer needs',
    content: `You are a sales proposal expert with expertise in persuasive business writing.

Proposal Context:
Client: {{client_name}}
Industry: {{client_industry}}
Challenge: {{client_challenge}}
Solution: {{proposed_solution}}
Timeline: {{project_timeline}}
Budget: {{proposal_budget}}
Decision Makers: {{key_stakeholders}}

Create a comprehensive sales proposal including:

1. **Executive Summary**
   - Client challenge overview
   - Proposed solution summary
   - Expected outcomes
   - Investment overview
   - Timeline highlights

2. **Situation Analysis**
   - Current state assessment
   - Pain point identification
   - Impact quantification
   - Opportunity definition

3. **Proposed Solution**
   - Solution overview
   - Feature explanations
   - Benefit statements
   - Differentiator highlights
   - Implementation approach

4. **Implementation Plan**
   - Project phases
   - Timeline milestones
   - Resource requirements
   - Risk mitigation
   - Success metrics

5. **Investment & ROI**
   - Pricing breakdown
   - Payment terms
   - ROI calculations
   - Cost-benefit analysis
   - Value justification

6. **Company Credibility**
   - Relevant case studies
   - Client testimonials
   - Team qualifications
   - Company achievements

7. **Next Steps**
   - Decision timeline
   - Implementation start date
   - Contract process
   - Support transition

Focus on client-centric language and quantifiable business value.`,
    industry_category: 'sales',
    use_case_category: 'content_creation',
    is_public: true,
    usage_count: 0
  },
  {
    title: 'Customer Retention Strategy Framework',
    description: 'Develop strategies to increase customer lifetime value and reduce churn',
    content: `You are a customer success strategist focused on retention and growth optimization.

Business Context:
Company: {{company_name}}
Product/Service: {{offering_type}}
Customer Segment: {{target_segment}}
Current Churn Rate: {{churn_rate}}
Retention Goals: {{retention_targets}}
Customer Lifecycle: {{typical_lifecycle}}

Develop a comprehensive retention strategy including:

1. **Churn Risk Identification**
   - Early warning indicators
   - Behavioral pattern analysis
   - Usage threshold definitions
   - Engagement scoring model
   - Risk segmentation framework

2. **Proactive Retention Tactics**
   - Onboarding optimization
   - Regular check-in schedules
   - Value demonstration programs
   - Education and training initiatives
   - Success milestone celebrations

3. **Reactive Retention Strategies**
   - At-risk customer interventions
   - Cancellation prevention workflows
   - Win-back campaign sequences
   - Feedback collection processes
   - Resolution escalation paths

4. **Customer Expansion Opportunities**
   - Upselling identification
   - Cross-selling programs
   - Usage expansion strategies
   - Referral incentive programs
   - Loyalty program development

5. **Communication Framework**
   - Lifecycle email sequences
   - Personal outreach templates
   - Value demonstration content
   - Success story sharing
   - Feedback request approaches

6. **Measurement & Optimization**
   - Retention metrics tracking
   - Cohort analysis methods
   - A/B testing protocols
   - ROI calculation models
   - Continuous improvement processes

Focus on creating lasting customer relationships that drive mutual value.`,
    industry_category: 'sales',
    use_case_category: 'strategy',
    is_public: true,
    usage_count: 0
  },

  // CONSULTING CATEGORY
  {
    title: 'Business Process Analysis Framework',
    description: 'Systematically analyze and optimize business processes for efficiency improvements',
    content: `You are a business process improvement consultant with expertise in operational optimization.

Analysis Context:
Organization: {{company_name}}
Process Focus: {{process_name}}
Department: {{department}}
Current Challenges: {{known_issues}}
Improvement Goals: {{objectives}}

Conduct a comprehensive process analysis including:

1. **Current State Documentation**
   - Process flow mapping
   - Stakeholder identification
   - Input/output analysis
   - Resource requirement assessment
   - Timeline documentation
   - Quality checkpoints

2. **Performance Measurement**
   - Key performance indicators
   - Cycle time analysis
   - Quality metrics
   - Cost calculations
   - Customer satisfaction impact
   - Employee satisfaction factors

3. **Gap Analysis**
   - Inefficiency identification
   - Bottleneck discovery
   - Redundancy detection
   - Quality issue pinpointing
   - Resource waste analysis
   - Technology gap assessment

4. **Root Cause Analysis**
   - Problem categorization
   - Cause-effect relationships
   - Contributing factor identification
   - Impact prioritization
   - Solution opportunity mapping

5. **Improvement Recommendations**
   - Process redesign suggestions
   - Technology integration opportunities
   - Training requirement identification
   - Resource reallocation options
   - Quality enhancement methods
   - Timeline optimization strategies

6. **Implementation Roadmap**
   - Change management approach
   - Phased implementation plan
   - Risk mitigation strategies
   - Success measurement framework
   - Stakeholder communication plan

Provide specific, actionable recommendations with quantified benefits.`,
    industry_category: 'consulting',
    use_case_category: 'analysis',
    is_public: true,
    usage_count: 0
  },
  {
    title: 'Digital Transformation Strategy Guide',
    description: 'Create comprehensive digital transformation roadmaps for organizations',
    content: `You are a digital transformation consultant specializing in technology-enabled business change.

Transformation Context:
Organization: {{organization_name}}
Industry: {{industry_sector}}
Current Technology State: {{tech_maturity}}
Business Objectives: {{strategic_goals}}
Budget Range: {{investment_capacity}}
Timeline: {{transformation_timeline}}

Develop a digital transformation strategy including:

1. **Current State Assessment**
   - Technology infrastructure audit
   - Digital capability evaluation
   - Process digitization analysis
   - Data management maturity
   - Cultural readiness assessment
   - Competitive positioning review

2. **Future State Vision**
   - Digital business model design
   - Technology architecture blueprint
   - Process automation opportunities
   - Data-driven decision framework
   - Customer experience transformation
   - Employee experience enhancement

3. **Strategic Priorities**
   - Critical success factors
   - Investment prioritization
   - Quick wins identification
   - Long-term capabilities
   - Risk mitigation priorities
   - Change management focus

4. **Technology Roadmap**
   - Infrastructure modernization
   - Application portfolio optimization
   - Data platform development
   - Integration architecture
   - Security framework enhancement
   - Cloud migration strategy

5. **Implementation Framework**
   - Phased delivery approach
   - Pilot program design
   - Scaling methodology
   - Governance structure
   - Performance measurement
   - Continuous improvement process

6. **Change Management Strategy**
   - Stakeholder engagement plan
   - Communication strategy
   - Training and development
   - Cultural transformation
   - Resistance management
   - Success celebration

Focus on sustainable transformation that delivers measurable business value.`,
    industry_category: 'consulting',
    use_case_category: 'strategy',
    is_public: true,
    usage_count: 0
  },
  {
    title: 'Market Entry Strategy Framework',
    description: 'Develop comprehensive strategies for entering new markets or launching new products',
    content: `You are a market strategy consultant with expertise in business expansion and product launches.

Market Entry Context:
Company: {{company_name}}
Target Market: {{market_details}}
Product/Service: {{offering_description}}
Entry Timeline: {{launch_timeline}}
Investment Capacity: {{budget_range}}
Success Metrics: {{key_objectives}}

Create a comprehensive market entry strategy including:

1. **Market Analysis**
   - Market size and growth potential
   - Customer segment identification
   - Competitive landscape mapping
   - Regulatory environment assessment
   - Cultural considerations
   - Economic factors analysis

2. **Entry Strategy Options**
   - Direct investment approach
   - Partnership/joint venture model
   - Licensing opportunities
   - Acquisition possibilities
   - Franchising potential
   - Online/digital-first strategy

3. **Competitive Positioning**
   - Value proposition definition
   - Differentiation strategy
   - Pricing approach
   - Brand positioning
   - Competitive advantages
   - Unique selling propositions

4. **Go-to-Market Plan**
   - Customer acquisition strategy
   - Channel partner identification
   - Sales approach design
   - Marketing campaign framework
   - Distribution strategy
   - Customer support model

5. **Operational Requirements**
   - Resource needs assessment
   - Staffing requirements
   - Infrastructure needs
   - Technology requirements
   - Legal and compliance setup
   - Financial management structure

6. **Risk Assessment & Mitigation**
   - Market risks identification
   - Competitive response scenarios
   - Regulatory risk evaluation
   - Financial risk analysis
   - Operational risk assessment
   - Contingency planning

7. **Success Measurement Framework**
   - Key performance indicators
   - Milestone tracking
   - ROI calculations
   - Market penetration metrics
   - Customer satisfaction measures
   - Competitive position tracking

Provide data-driven recommendations with clear implementation timelines.`,
    industry_category: 'consulting',
    use_case_category: 'strategy',
    is_public: true,
    usage_count: 0
  },
  {
    title: 'Organizational Change Management Plan',
    description: 'Design effective change management strategies for organizational transformations',
    content: `You are an organizational change management consultant with expertise in human-centered transformation.

Change Context:
Organization: {{organization_name}}
Change Type: {{change_description}}
Scope: {{change_scope}}
Timeline: {{implementation_timeline}}
Stakeholders: {{affected_groups}}
Success Criteria: {{desired_outcomes}}

Develop a comprehensive change management plan including:

1. **Change Readiness Assessment**
   - Organizational culture evaluation
   - Change capacity analysis
   - Stakeholder influence mapping
   - Historical change experience
   - Current engagement levels
   - Resource availability assessment

2. **Stakeholder Analysis & Engagement**
   - Stakeholder identification and categorization
   - Influence and impact assessment
   - Communication preferences
   - Engagement strategy design
   - Champion identification
   - Resistance management approach

3. **Communication Strategy**
   - Key messaging framework
   - Communication channel selection
   - Frequency and timing plan
   - Feedback collection mechanisms
   - Two-way dialogue facilitation
   - Crisis communication protocols

4. **Training & Development Plan**
   - Skill gap analysis
   - Training needs assessment
   - Learning delivery methods
   - Competency development framework
   - Performance support tools
   - Knowledge transfer protocols

5. **Implementation Roadmap**
   - Change phases and milestones
   - Quick wins identification
   - Pilot program design
   - Scaling strategy
   - Risk mitigation plans
   - Contingency procedures

6. **Reinforcement & Sustainability**
   - Success measurement system
   - Behavioral reinforcement mechanisms
   - Recognition and reward programs
   - Continuous improvement processes
   - Embedding in organizational systems
   - Long-term sustainability planning

7. **Resistance Management**
   - Resistance source identification
   - Root cause analysis
   - Intervention strategies
   - Support mechanisms
   - Escalation procedures
   - Recovery planning

Focus on creating lasting organizational transformation with high employee adoption.`,
    industry_category: 'consulting',
    use_case_category: 'strategy',
    is_public: true,
    usage_count: 0
  },

  // DEVELOPMENT/TECHNOLOGY CATEGORY
  {
    title: 'Technical Requirements Document Generator',
    description: 'Create comprehensive technical specifications for software development projects',
    content: `You are a technical business analyst with expertise in software requirements documentation.

Project Context:
Project Name: {{project_name}}
System Type: {{system_type}}
Stakeholders: {{key_stakeholders}}
Business Objectives: {{business_goals}}
Technical Constraints: {{technical_limitations}}
Timeline: {{project_timeline}}

Create a comprehensive technical requirements document including:

1. **Executive Summary**
   - Project overview and purpose
   - Key stakeholders and roles
   - Success criteria definition
   - High-level timeline
   - Budget considerations

2. **Functional Requirements**
   - User story documentation
   - Use case scenarios
   - Feature specifications
   - User interface requirements
   - Workflow definitions
   - Business rule documentation

3. **Non-Functional Requirements**
   - Performance specifications
   - Security requirements
   - Scalability needs
   - Reliability standards
   - Usability guidelines
   - Compliance requirements

4. **Technical Architecture**
   - System architecture overview
   - Technology stack recommendations
   - Integration requirements
   - Database design considerations
   - API specifications
   - Third-party dependencies

5. **Data Requirements**
   - Data model specifications
   - Data flow documentation
   - Storage requirements
   - Data quality standards
   - Migration needs
   - Backup and recovery

6. **Quality Assurance**
   - Testing strategy outline
   - Acceptance criteria
   - Quality metrics
   - Testing environment needs
   - Validation procedures
   - Performance benchmarks

7. **Implementation Considerations**
   - Development methodology
   - Risk assessment
   - Resource requirements
   - Deployment strategy
   - Maintenance planning
   - Training needs

Ensure requirements are specific, measurable, achievable, relevant, and time-bound.`,
    industry_category: 'development',
    use_case_category: 'documentation',
    is_public: true,
    usage_count: 0
  },
  {
    title: 'API Documentation Generator',
    description: 'Create clear, comprehensive API documentation for developers',
    content: `You are a technical writer specializing in API documentation and developer experience.

API Context:
API Name: {{api_name}}
Purpose: {{api_purpose}}
Target Developers: {{developer_audience}}
Technology: {{tech_stack}}
Authentication: {{auth_method}}
Base URL: {{api_base_url}}

Create comprehensive API documentation including:

1. **Getting Started Guide**
   - API overview and purpose
   - Base URL and versioning
   - Authentication setup
   - Rate limiting information
   - SDK availability
   - Quick start tutorial

2. **Authentication & Security**
   - Authentication methods
   - API key management
   - Token handling
   - Security best practices
   - HTTPS requirements
   - Error handling for auth failures

3. **Endpoint Documentation**
   For each endpoint:
   - HTTP method and URL
   - Description and purpose
   - Required/optional parameters
   - Request body examples
   - Response format and examples
   - Status codes and meanings
   - Error response examples

4. **Code Examples**
   - cURL command examples
   - JavaScript/Node.js examples
   - Python examples
   - PHP examples
   - Other relevant languages
   - SDK usage examples

5. **Data Models**
   - Request object schemas
   - Response object schemas
   - Data type definitions
   - Validation rules
   - Relationship documentation
   - Enum value listings

6. **Advanced Features**
   - Webhooks documentation
   - Batch operations
   - Pagination handling
   - Filtering and sorting
   - Real-time features
   - File upload procedures

7. **Testing & Troubleshooting**
   - Interactive API explorer
   - Postman collection
   - Common error scenarios
   - Debugging guidelines
   - FAQ section
   - Support contact information

Focus on developer-friendly explanations with practical, working examples.`,
    industry_category: 'development',
    use_case_category: 'documentation',
    is_public: true,
    usage_count: 0
  },
  {
    title: 'Code Review Checklist Generator',
    description: 'Create comprehensive code review checklists for quality assurance',
    content: `You are a senior software engineer with expertise in code quality and review processes.

Review Context:
Programming Language: {{primary_language}}
Project Type: {{project_type}}
Team Size: {{team_size}}
Code Standards: {{coding_standards}}
Critical Areas: {{focus_areas}}

Create a comprehensive code review checklist including:

1. **Code Quality & Style**
   - Consistent formatting and indentation
   - Naming conventions adherence
   - Code organization and structure
   - Comment quality and necessity
   - Documentation completeness
   - Language-specific best practices

2. **Functionality & Logic**
   - Requirement fulfillment verification
   - Edge case handling
   - Error handling implementation
   - Input validation presence
   - Business logic correctness
   - Algorithm efficiency

3. **Security Considerations**
   - Input sanitization
   - Authentication/authorization checks
   - Data encryption requirements
   - SQL injection prevention
   - XSS protection
   - Sensitive data handling

4. **Performance & Optimization**
   - Algorithm complexity analysis
   - Memory usage optimization
   - Database query efficiency
   - Resource utilization
   - Caching implementation
   - Load handling considerations

5. **Testing & Reliability**
   - Unit test coverage
   - Integration test presence
   - Test case quality
   - Mocking appropriateness
   - Error scenario testing
   - Regression test updates

6. **Maintainability**
   - Code duplication elimination
   - Modular design principles
   - Dependency management
   - Configuration externalization
   - Logging implementation
   - Debugging support

7. **Architecture & Design**
   - Design pattern usage
   - SOLID principles adherence
   - Separation of concerns
   - API design consistency
   - Database schema alignment
   - Integration point validation

8. **Documentation & Communication**
   - README updates
   - API documentation
   - Change log entries
   - Deployment notes
   - Configuration documentation
   - Knowledge transfer needs

Provide specific checkpoints and common pitfalls for each area.`,
    industry_category: 'development',
    use_case_category: 'analysis',
    is_public: true,
    usage_count: 0
  },
  {
    title: 'Software Architecture Decision Record',
    description: 'Document important architectural decisions with rationale and consequences',
    content: `You are a software architect specializing in system design and decision documentation.

Decision Context:
System: {{system_name}}
Decision Topic: {{decision_area}}
Stakeholders: {{decision_makers}}
Business Context: {{business_drivers}}
Technical Context: {{technical_constraints}}

Create an Architecture Decision Record (ADR) including:

1. **Status**
   - Current status (Proposed/Accepted/Deprecated/Superseded)
   - Decision date
   - Decision makers
   - Review date (if applicable)

2. **Context**
   - Business background
   - Technical situation
   - Problem statement
   - Driving forces
   - Constraints and assumptions
   - Requirements that influenced the decision

3. **Decision**
   - Clear statement of the architectural decision
   - Chosen approach description
   - Key implementation details
   - Technology choices
   - Design patterns selected
   - Standards adopted

4. **Options Considered**
   For each alternative:
   - Option description
   - Pros and cons analysis
   - Cost implications
   - Risk assessment
   - Effort estimation
   - Stakeholder impact

5. **Rationale**
   - Why this decision was made
   - Key deciding factors
   - Trade-offs accepted
   - Assumptions validated
   - Risk mitigation approach
   - Alignment with principles

6. **Consequences**
   - Positive outcomes expected
   - Negative trade-offs accepted
   - Implementation requirements
   - Team training needs
   - Tooling implications
   - Monitoring requirements

7. **Implementation Notes**
   - Migration strategy (if applicable)
   - Timeline considerations
   - Resource requirements
   - Dependencies
   - Success criteria
   - Rollback plan

8. **Related Decisions**
   - Previous ADRs referenced
   - Future decisions anticipated
   - Standards documents
   - External references
   - Team discussions

Focus on clarity and completeness to help future team members understand the decision.`,
    industry_category: 'development',
    use_case_category: 'documentation',
    is_public: true,
    usage_count: 0
  },

  // OPERATIONS CATEGORY
  {
    title: 'Standard Operating Procedure (SOP) Template',
    description: 'Create detailed standard operating procedures for business processes',
    content: `You are an operations management consultant specializing in process documentation and standardization.

Process Context:
Process Name: {{process_name}}
Department: {{responsible_department}}
Frequency: {{process_frequency}}
Stakeholders: {{involved_parties}}
Compliance Requirements: {{regulatory_needs}}

Create a comprehensive Standard Operating Procedure including:

1. **Document Information**
   - SOP title and identifier
   - Version number and date
   - Author and approver
   - Review schedule
   - Distribution list
   - Related documents

2. **Process Overview**
   - Purpose and scope
   - Process owner identification
   - Key stakeholders
   - Input requirements
   - Expected outputs
   - Success criteria

3. **Roles & Responsibilities**
   - Position-specific duties
   - Authority levels
   - Accountability assignments
   - Escalation paths
   - Training requirements
   - Performance standards

4. **Step-by-Step Procedures**
   For each process step:
   - Sequential step numbering
   - Detailed action description
   - Required tools/systems
   - Quality checkpoints
   - Decision points
   - Exception handling

5. **Quality Control Measures**
   - Inspection points
   - Quality standards
   - Testing procedures
   - Approval requirements
   - Documentation needs
   - Error correction protocols

6. **Tools & Resources**
   - Required equipment
   - Software applications
   - Forms and templates
   - Reference materials
   - Contact information
   - Vendor details

7. **Safety & Compliance**
   - Safety precautions
   - Regulatory requirements
   - Risk mitigation measures
   - Emergency procedures
   - Reporting obligations
   - Audit trail requirements

8. **Performance Monitoring**
   - Key performance indicators
   - Measurement methods
   - Reporting procedures
   - Review schedule
   - Improvement opportunities
   - Feedback mechanisms

9. **Troubleshooting Guide**
   - Common problems
   - Root cause analysis
   - Solution procedures
   - Prevention measures
   - Support contacts
   - Escalation procedures

Focus on clarity, completeness, and actionability for consistent process execution.`,
    industry_category: 'operations',
    use_case_category: 'documentation',
    is_public: true,
    usage_count: 0
  },
  {
    title: 'Risk Assessment Matrix Generator',
    description: 'Create comprehensive risk assessments for business operations and projects',
    content: `You are a risk management consultant specializing in enterprise risk assessment and mitigation.

Risk Assessment Context:
Organization/Project: {{entity_name}}
Assessment Scope: {{scope_description}}
Time Horizon: {{assessment_period}}
Risk Categories: {{risk_types}}
Stakeholders: {{key_stakeholders}}

Develop a comprehensive risk assessment including:

1. **Risk Identification Framework**
   - Risk category definitions
   - Identification methodology
   - Stakeholder input process
   - Historical analysis review
   - Industry benchmark comparison
   - External factor consideration

2. **Risk Register Development**
   For each identified risk:
   - Risk description and category
   - Potential causes
   - Impact description
   - Probability assessment
   - Current controls
   - Risk owner assignment

3. **Risk Evaluation Matrix**
   - Probability scale definition (1-5)
   - Impact scale definition (1-5)
   - Risk scoring methodology
   - Risk tolerance thresholds
   - Priority classification
   - Heat map visualization

4. **Risk Analysis**
   - Quantitative impact assessment
   - Qualitative impact description  
   - Interdependency analysis
   - Cumulative risk evaluation
   - Scenario planning
   - Sensitivity analysis

5. **Risk Treatment Strategies**
   For each significant risk:
   - Treatment option evaluation
   - Mitigation strategy design
   - Control implementation plan
   - Resource requirement assessment
   - Timeline development
   - Responsibility assignment

6. **Risk Monitoring Framework**
   - Key risk indicators (KRIs)
   - Monitoring frequency
   - Reporting procedures
   - Escalation triggers
   - Review schedules
   - Performance metrics

7. **Contingency Planning**
   - Crisis response procedures
   - Business continuity plans
   - Communication protocols
   - Recovery strategies
   - Stakeholder notification
   - Resource mobilization

8. **Risk Communication**
   - Risk reporting templates
   - Stakeholder communication plan
   - Training requirements
   - Awareness programs
   - Documentation standards
   - Decision-making protocols

Focus on practical, actionable risk management that protects business objectives.`,
    industry_category: 'operations',
    use_case_category: 'analysis',
    is_public: true,
    usage_count: 0
  },
  {
    title: 'Vendor Evaluation Scorecard',
    description: 'Create comprehensive vendor evaluation criteria and scoring systems',
    content: `You are a procurement and vendor management specialist with expertise in supplier evaluation.

Evaluation Context:
Procurement Category: {{category_type}}
Organization: {{company_name}}
Purchase Value: {{contract_value}}
Contract Duration: {{contract_length}}
Critical Requirements: {{must_have_criteria}}

Develop a comprehensive vendor evaluation framework including:

1. **Evaluation Criteria Framework**
   - Technical capability (Weight: %)
   - Financial stability (Weight: %)
   - Service quality (Weight: %)
   - Cost competitiveness (Weight: %)
   - Risk factors (Weight: %)
   - Strategic alignment (Weight: %)

2. **Technical Evaluation**
   - Solution fit assessment
   - Innovation capability
   - Technical expertise
   - Implementation methodology
   - Quality standards
   - Scalability potential

3. **Financial Assessment**
   - Financial health analysis
   - Credit rating review
   - Insurance coverage
   - Pricing competitiveness
   - Total cost of ownership
   - Payment terms evaluation

4. **Service Quality Metrics**
   - Service level agreements
   - Performance guarantees
   - Support capabilities
   - Response time commitments
   - Customer satisfaction ratings
   - Reference verification

5. **Risk Evaluation**
   - Business continuity planning
   - Compliance standards
   - Security measures
   - Geographic risks
   - Dependency risks
   - Reputation assessment

6. **Scoring Methodology**
   - Scoring scale definition (1-10)
   - Weighting application
   - Minimum threshold criteria
   - Disqualification factors
   - Tie-breaking procedures
   - Documentation requirements

7. **Selection Process**
   - Evaluation team composition
   - Review procedures
   - Decision criteria
   - Approval requirements
   - Communication protocols
   - Appeal process

8. **Implementation Planning**
   - Onboarding procedures
   - Performance monitoring
   - Relationship management
   - Regular review schedule
   - Improvement opportunities
   - Contract management

Provide objective, quantifiable criteria that support fair vendor selection.`,
    industry_category: 'operations',
    use_case_category: 'analysis',
    is_public: true,
    usage_count: 0
  },
  {
    title: 'Performance Dashboard Design Guide',
    description: 'Create effective performance dashboards for business monitoring and decision-making',
    content: `You are a business intelligence and data visualization expert specializing in dashboard design.

Dashboard Context:
Purpose: {{dashboard_purpose}}
Target Audience: {{primary_users}}
Data Sources: {{data_systems}}
Key Metrics: {{primary_kpis}}
Update Frequency: {{refresh_rate}}

Design a comprehensive performance dashboard including:

1. **Dashboard Strategy**
   - Business objectives alignment
   - User persona analysis
   - Use case scenarios
   - Success criteria definition
   - ROI expectations
   - Adoption strategy

2. **Metrics Framework**
   - KPI hierarchy structure
   - Leading vs. lagging indicators
   - Metric definitions
   - Calculation methodologies
   - Data quality requirements
   - Benchmarking standards

3. **Visual Design Principles**
   - Information hierarchy
   - Color coding standards
   - Chart type selection
   - Layout optimization
   - Mobile responsiveness
   - Accessibility considerations

4. **Dashboard Layout**
   - Executive summary section
   - Trend analysis area
   - Detailed metrics display
   - Drill-down capabilities
   - Filter and interaction design
   - Navigation structure

5. **Data Integration Plan**
   - Data source identification
   - ETL process design
   - Data validation rules
   - Refresh scheduling
   - Error handling procedures
   - Data governance protocols

6. **Alert & Notification System**
   - Threshold definitions
   - Alert severity levels
   - Notification methods
   - Escalation procedures
   - Alert management
   - Historical tracking

7. **User Experience Design**
   - Intuitive navigation
   - Contextual help
   - Personalization options
   - Export capabilities
   - Sharing functionality
   - Training materials

8. **Governance & Maintenance**
   - Data stewardship roles
   - Review procedures
   - Update protocols
   - Performance monitoring
   - User feedback collection
   - Continuous improvement

Focus on actionable insights that drive informed business decisions.`,
    industry_category: 'operations',
    use_case_category: 'analysis',
    is_public: true,
    usage_count: 0
  },

  // CUSTOMER SERVICE CATEGORY
  {
    title: 'Customer Service Email Response Templates',
    description: 'Professional email templates for various customer service scenarios',
    content: `You are a customer service expert specializing in written communication and customer satisfaction.

Service Context:
Company: {{company_name}}
Industry: {{industry_type}}
Customer Issue: {{issue_category}}
Urgency Level: {{priority_level}}
Customer Tone: {{customer_sentiment}}

Create professional email response templates including:

1. **Initial Response Templates**
   - Acknowledgment of inquiry
   - Issue confirmation
   - Timeline expectations
   - Next steps communication
   - Empathy and understanding
   - Professional tone setting

2. **Information Gathering**
   - Additional detail requests
   - Clarification questions
   - Documentation requests
   - Account verification
   - Technical information needs
   - Situation assessment

3. **Solution Provision**
   - Step-by-step instructions
   - Alternative options
   - Resource recommendations
   - Best practice guidance
   - Preventive measures
   - Follow-up requirements

4. **Escalation Management**
   - Escalation notifications
   - Manager involvement
   - Timeline adjustments
   - Expectation management
   - Process transparency
   - Continued support assurance

5. **Resolution Communication**
   - Solution summary
   - Action taken explanation
   - Result confirmation
   - Prevention advice
   - Satisfaction verification
   - Relationship rebuilding

6. **Follow-up Templates**
   - Satisfaction surveys
   - Additional assistance offers
   - Relationship maintenance
   - Feedback requests
   - Service improvement
   - Loyalty appreciation

7. **Challenging Situation Responses**
   - Complaint acknowledgment
   - Apology frameworks
   - Compensation offers
   - Policy explanations
   - Compromise solutions
   - Relationship repair

8. **Closing & Next Steps**
   - Professional closings
   - Contact information
   - Additional resources
   - Feedback channels
   - Future support availability
   - Appreciation expressions

Each template should maintain professionalism while showing genuine care for customer satisfaction.`,
    industry_category: 'customer_service',
    use_case_category: 'communication',
    is_public: true,
    usage_count: 0
  },
  {
    title: 'Customer Complaint Resolution Framework',
    description: 'Systematic approach to handling and resolving customer complaints effectively',
    content: `You are a customer experience specialist with expertise in complaint management and service recovery.

Complaint Context:
Business Type: {{business_type}}
Complaint Category: {{complaint_type}}
Customer Segment: {{customer_type}}
Severity Level: {{issue_severity}}
Resolution Timeline: {{response_timeframe}}

Develop a comprehensive complaint resolution framework including:

1. **Initial Response Protocol (First Contact)**
   - Acknowledgment timing standards
   - Empathy expression techniques
   - Information gathering checklist
   - Expectation setting language
   - Ownership demonstration
   - Documentation procedures

2. **Investigation Process**
   - Fact-finding methodology
   - Stakeholder consultation
   - Root cause analysis
   - Evidence collection
   - Impact assessment
   - Timeline development

3. **Resolution Strategy Development**
   - Solution option evaluation
   - Customer preference consideration
   - Company policy alignment
   - Cost-benefit analysis
   - Risk assessment
   - Approval requirements

4. **Communication Framework**
   - Progress update schedule
   - Clear explanation methods
   - Transparency principles
   - Language guidelines
   - Channel preferences
   - Accessibility considerations

5. **Solution Implementation**
   - Action plan execution
   - Quality assurance checks
   - Customer verification
   - Documentation completion
   - System updates
   - Team notifications

6. **Service Recovery Excellence**
   - Compensation guidelines
   - Goodwill gesture options
   - Relationship rebuilding tactics
   - Trust restoration methods
   - Loyalty preservation
   - Future prevention measures

7. **Follow-up & Monitoring**
   - Satisfaction verification
   - Additional needs assessment
   - Relationship temperature check
   - Feedback collection
   - Lesson learned capture
   - Process improvement input

8. **Escalation Management**
   - Escalation triggers
   - Authority levels
   - Handoff procedures
   - Information transfer
   - Customer communication
   - Resolution tracking

Focus on turning complaints into opportunities for customer loyalty and business improvement.`,
    industry_category: 'customer_service',
    use_case_category: 'problem_solving',
    is_public: true,
    usage_count: 0
  },

  // HEALTHCARE CATEGORY
  {
    title: 'Patient Education Material Creator',
    description: 'Develop clear, accessible patient education materials for various health topics',
    content: `You are a healthcare communication specialist with expertise in patient education and health literacy.

Patient Education Context:
Medical Topic: {{health_condition}}
Target Audience: {{patient_demographics}}
Reading Level: {{literacy_level}}
Cultural Considerations: {{cultural_factors}}
Provider Type: {{healthcare_setting}}

Create comprehensive patient education materials including:

1. **Condition Overview**
   - Simple condition explanation
   - Common terminology definitions
   - Prevalence and risk factors
   - Symptoms description
   - Impact on daily life
   - Prognosis information

2. **Treatment Information**
   - Treatment options overview
   - Medication explanations
   - Procedure descriptions
   - Side effect management
   - Recovery expectations
   - Alternative approaches

3. **Self-Care Instructions**
   - Daily management techniques
   - Lifestyle modifications
   - Symptom monitoring
   - When to seek help
   - Emergency warning signs
   - Prevention strategies

4. **Visual Learning Aids**
   - Diagram descriptions
   - Step-by-step illustrations
   - Infographic concepts
   - Video script outlines
   - Interactive elements
   - Memory aids

5. **Communication Tools**
   - Questions for providers
   - Symptom tracking sheets
   - Medication logs
   - Appointment preparation
   - Family discussion guides
   - Support group information

6. **Resource Directory**
   - Educational websites
   - Support organizations
   - Mobile applications
   - Community resources
   - Financial assistance
   - Transportation services

7. **Cultural Sensitivity**
   - Language considerations
   - Cultural practices integration
   - Family involvement guidance
   - Religious considerations
   - Community-specific resources
   - Barrier identification

8. **Accessibility Features**
   - Large print options
   - Audio descriptions
   - Multilingual considerations
   - Low-literacy adaptations
   - Technology alternatives
   - Physical limitations

Use plain language, avoid medical jargon, and focus on empowering patients with actionable information.`,
    industry_category: 'healthcare',
    use_case_category: 'patient_communication',
    is_public: true,
    usage_count: 0
  },

  // EDUCATION CATEGORY
  {
    title: 'Learning Objective Design Framework',
    description: 'Create clear, measurable learning objectives using educational best practices',
    content: `You are an instructional designer with expertise in learning theory and curriculum development.

Learning Context:
Course/Module: {{course_name}}
Target Learners: {{learner_profile}}
Subject Area: {{content_domain}}
Learning Level: {{cognitive_level}}
Duration: {{learning_timeframe}}

Design comprehensive learning objectives including:

1. **Objective Framework Structure**
   Using Bloom's Taxonomy:
   - Knowledge (Remember)
   - Comprehension (Understand)  
   - Application (Apply)
   - Analysis (Analyze)
   - Synthesis (Evaluate)
   - Evaluation (Create)

2. **SMART Objective Development**
   - Specific: Clear, precise statements
   - Measurable: Observable behaviors
   - Achievable: Realistic expectations
   - Relevant: Learning goal alignment
   - Time-bound: Completion timeframes

3. **Performance-Based Objectives**
   - Action verb selection
   - Condition specifications
   - Criteria establishment
   - Assessment alignment
   - Success measurement
   - Competency indicators

4. **Cognitive Domain Objectives**
   - Factual knowledge goals
   - Conceptual understanding
   - Procedural skill development
   - Metacognitive awareness
   - Critical thinking skills
   - Problem-solving abilities

5. **Affective Domain Objectives**
   - Attitude development
   - Value formation
   - Interest cultivation
   - Motivation enhancement
   - Appreciation building
   - Character development

6. **Psychomotor Domain Objectives**
   - Physical skill development
   - Motor coordination
   - Technical proficiency
   - Performance fluency
   - Precision improvement
   - Adaptation capability

7. **Assessment Alignment**
   - Formative assessment planning
   - Summative evaluation design
   - Performance criteria
   - Rubric development
   - Feedback mechanisms
   - Progress monitoring

8. **Differentiation Strategies**
   - Multiple learning paths
   - Accommodation planning
   - Extension opportunities
   - Remediation supports
   - Cultural responsiveness
   - Individual needs consideration

Focus on creating objectives that guide effective instruction and meaningful assessment.`,
    industry_category: 'education',
    use_case_category: 'planning',
    is_public: true,
    usage_count: 0
  },

  // FINANCE CATEGORY
  {
    title: 'Financial Risk Assessment Model',
    description: 'Evaluate and quantify financial risks for investment and business decisions',
    content: `You are a financial risk analyst with expertise in risk modeling and investment analysis.

Risk Assessment Context:
Organization/Investment: {{entity_name}}
Assessment Type: {{risk_category}}
Time Horizon: {{analysis_period}}
Regulatory Environment: {{compliance_requirements}}
Stakeholder Interests: {{key_stakeholders}}

Develop a comprehensive financial risk assessment including:

1. **Risk Identification Framework**
   - Market risk factors
   - Credit risk exposures
   - Operational risk sources
   - Liquidity risk indicators
   - Regulatory risk factors
   - Reputational risk elements

2. **Quantitative Risk Metrics**
   - Value at Risk (VaR) calculations
   - Expected shortfall analysis
   - Stress testing scenarios
   - Monte Carlo simulations
   - Sensitivity analysis
   - Scenario modeling

3. **Market Risk Analysis**
   - Interest rate sensitivity
   - Currency exposure assessment
   - Commodity price risks
   - Equity market correlations
   - Volatility measurements
   - Beta calculations

4. **Credit Risk Evaluation**
   - Default probability assessment
   - Credit rating analysis
   - Concentration risk measurement
   - Recovery rate estimation
   - Collateral evaluation
   - Counterparty analysis

5. **Liquidity Risk Assessment**
   - Cash flow projections
   - Funding gap analysis
   - Asset liquidity classification
   - Stress liquidity testing
   - Contingency funding plans
   - Deposit concentration analysis

6. **Operational Risk Framework**
   - Process risk identification
   - System risk assessment
   - Human error analysis
   - Fraud risk evaluation
   - Business continuity planning
   - Key person dependency

7. **Risk Mitigation Strategies**
   - Hedging recommendations
   - Diversification strategies
   - Insurance considerations
   - Capital allocation optimization
   - Risk transfer mechanisms
   - Monitoring systems

8. **Reporting & Governance**
   - Risk dashboard design
   - Key risk indicators (KRIs)
   - Reporting frequency
   - Escalation procedures
   - Governance structure
   - Regulatory reporting

Provide actionable insights for informed financial decision-making and risk management.`,
    industry_category: 'finance',
    use_case_category: 'analysis',
    is_public: true,
    usage_count: 0
  },

  // ANALYTICS CATEGORY
  {
    title: 'Data Analysis Report Template',
    description: 'Structure comprehensive data analysis reports with actionable insights',
    content: `You are a senior data analyst specializing in business intelligence and data-driven decision making.

Analysis Context:
Dataset: {{data_description}}
Business Question: {{analysis_objective}}
Stakeholders: {{report_audience}}
Analysis Type: {{analytical_approach}}
Decision Timeline: {{urgency_level}}

Create a comprehensive data analysis report including:

1. **Executive Summary**
   - Key findings overview
   - Primary recommendations
   - Business impact summary
   - Action priority ranking
   - Resource requirements
   - Timeline considerations

2. **Problem Statement & Objectives**
   - Business context
   - Research questions
   - Success criteria
   - Scope definition
   - Assumptions stated
   - Limitations acknowledged

3. **Data Description & Methodology**
   - Data sources documentation
   - Collection methodology
   - Sample size and characteristics
   - Data quality assessment
   - Analytical techniques used
   - Tool and software specifications

4. **Analysis & Findings**
   - Descriptive statistics
   - Trend identification
   - Pattern recognition
   - Correlation analysis
   - Statistical significance testing
   - Anomaly detection

5. **Visualization & Insights**
   - Chart and graph descriptions
   - Visual storytelling elements
   - Key insight explanations
   - Comparative analysis
   - Benchmarking results
   - Performance indicators

6. **Statistical Analysis**
   - Hypothesis testing results
   - Confidence intervals
   - P-value interpretations
   - Effect size measurements
   - Model performance metrics
   - Validation procedures

7. **Business Implications**
   - Strategic implications
   - Operational impact
   - Financial considerations
   - Risk assessments
   - Opportunity identification
   - Competitive advantages

8. **Recommendations & Next Steps**
   - Prioritized recommendations
   - Implementation roadmap
   - Resource requirements
   - Success metrics
   - Monitoring plan
   - Future analysis needs

9. **Appendices**
   - Detailed methodology
   - Additional visualizations
   - Statistical outputs
   - Data dictionary
   - Technical specifications
   - Supporting documentation

Focus on translating complex data into clear, actionable business insights.`,
    industry_category: 'analytics',
    use_case_category: 'data_analysis',
    is_public: true,
    usage_count: 0
  }
];

/**
 * Seed the database with business prompt templates
 */
async function seedBusinessTemplates() {
  try {
    console.log('🌱 Starting business prompt templates seeding...');

    // Get AI model IDs for recommendations
    const { data: aiModels, error: modelsError } = await supabase
      .from('ai_models')
      .select('id, name, provider');

    if (modelsError) {
      logger.error('Error fetching AI models:', modelsError);
      throw modelsError;
    }

    // Map AI models for recommendations
    const gptModel = aiModels.find(m => m.name.includes('GPT') || m.provider === 'OpenAI');
    const claudeModel = aiModels.find(m => m.name.includes('Claude') || m.provider === 'Anthropic');
    const geminiModel = aiModels.find(m => m.name.includes('Gemini') || m.provider === 'Google');

    // Assign recommended AI models to templates based on their strengths
    const templatesWithAIRecommendations = businessPromptTemplates.map(template => {
      let recommendedModel = null;

      // OpenAI GPT models - best for creative writing, general communication, and structured content
      if (template.use_case_category === 'content_creation' || 
          template.use_case_category === 'communication' ||
          template.use_case_category === 'email_response' ||
          template.industry_category === 'marketing') {
        recommendedModel = gptModel?.id;
      }
      // Anthropic Claude - best for analysis, reasoning, and complex problem-solving
      else if (template.use_case_category === 'analysis' || 
               template.use_case_category === 'strategy' ||
               template.use_case_category === 'problem_solving' ||
               template.use_case_category === 'documentation') {
        recommendedModel = claudeModel?.id;
      }
      // Google Gemini - best for data analysis and technical content
      else if (template.use_case_category === 'data_analysis' ||
               template.industry_category === 'technology' ||
               template.industry_category === 'analytics') {
        recommendedModel = geminiModel?.id;
      }
      // Default to GPT for general use cases
      else {
        recommendedModel = gptModel?.id;
      }

      return {
        ...template,
        recommended_ai_model_id: recommendedModel
      };
    });

    // Insert templates in batches to avoid timeout
    const batchSize = 25;
    let insertedCount = 0;

    for (let i = 0; i < templatesWithAIRecommendations.length; i += batchSize) {
      const batch = templatesWithAIRecommendations.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('prompt_templates')
        .insert(batch)
        .select('id, title');

      if (error) {
        logger.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        throw error;
      }

      insertedCount += data.length;
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}: ${data.length} templates`);
    }

    console.log(`\n🎉 Business prompt templates seeding completed successfully!`);
    console.log(`📊 Summary:`);
    console.log(`   • ${insertedCount} prompt templates seeded`);
    console.log(`   • Templates distributed across ${[...new Set(businessPromptTemplates.map(t => t.industry_category))].length} industry categories`);
    console.log(`   • Templates distributed across ${[...new Set(businessPromptTemplates.map(t => t.use_case_category))].length} use case categories`);
    console.log(`   • AI model recommendations assigned based on use case strengths`);

    return { success: true, count: insertedCount };

  } catch (error) {
    logger.error('❌ Fatal error during business templates seeding:', error);
    throw error;
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedBusinessTemplates()
    .then((result) => {
      console.log('✅ Business templates seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Business templates seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = { seedBusinessTemplates };