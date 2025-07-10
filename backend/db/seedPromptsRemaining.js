require('dotenv').config({ path: __dirname + '/../.env' });
const { Pool } = require('pg');

const dbName = process.argv[2];

if (!dbName) {
  console.error('Error: Database name not provided as argument.');
  process.exit(1);
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: dbName,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const remainingPrompts = [
  // Lesson 1.3.1: Maintaining Context Across Conversations
  {
    lesson_title: 'Lesson 1.3.1: Maintaining Context Across Conversations',
    title: 'Project Context Refresh',
    description: 'Effectively restart conversations with comprehensive project context',
    prompt_text: `Continuing our work on [PROJECT_NAME]. Here's the current context:

**Project Overview:**
- Objective: {PRIMARY_GOAL}
- Timeline: {PROJECT_TIMELINE}
- Key stakeholders: {STAKEHOLDER_LIST}

**Previous Progress:**
- Decisions made: {KEY_DECISIONS}
- Current status: {WHERE_WE_ARE}
- Completed phases: {WHAT_IS_DONE}

**Current Challenge:**
- Immediate need: {SPECIFIC_TASK}
- Constraints: {CURRENT_LIMITATIONS}
- Success criteria: {HOW_TO_MEASURE_SUCCESS}

**Recent Developments:**
- {DEVELOPMENT_1}
- {DEVELOPMENT_2}

Based on this context, please help me with {SPECIFIC_REQUEST}. Maintain consistency with our previous decisions and approach.`,
    platform: 'claude',
    category: 'context_management',
    use_case: 'Restarting project conversations while maintaining context continuity',
    expected_output: 'Contextually aware response that builds on previous work and decisions',
    tips: 'Be specific about previous decisions and current status. This helps AI understand exactly where you are in the project.',
    order_index: 1,
    difficulty: 'intermediate'
  },
  {
    lesson_title: 'Lesson 1.3.1: Maintaining Context Across Conversations',
    title: 'Team Context Handoff',
    description: 'Transfer conversation context between team members',
    prompt_text: `I need to hand off this AI conversation to a colleague. Please create a context summary for them.

**Original Discussion Context:**
- Topic: {DISCUSSION_TOPIC}
- Participants: {WHO_WAS_INVOLVED}
- Duration/scope: {HOW_LONG_WE_DISCUSSED}

**Key Points Established:**
- {KEY_POINT_1}
- {KEY_POINT_2}
- {KEY_POINT_3}

**Decisions Made:**
- {DECISION_1}
- {DECISION_2}

**Current Status:**
- Where we are: {CURRENT_PROGRESS}
- Next steps identified: {PLANNED_ACTIONS}

**Handoff Context:**
- New team member: {COLLEAGUE_ROLE}
- Their involvement: {WHAT_THEY_NEED_TO_DO}
- Urgency: {TIMELINE_PRESSURE}

Create a comprehensive handoff summary that allows {COLLEAGUE_NAME} to continue our work effectively without losing context.`,
    platform: 'claude',
    category: 'context_management',
    use_case: 'Transferring AI conversation context between team members',
    expected_output: 'Complete context summary enabling seamless handoff to new team member',
    tips: 'Include both content and reasoning from previous discussions. Help the new person understand not just what was decided, but why.',
    order_index: 2,
    difficulty: 'intermediate'
  },

  // Lesson 1.3.2: Multi-Turn Conversation Strategies
  {
    lesson_title: 'Lesson 1.3.2: Multi-Turn Conversation Strategies',
    title: 'Strategic Problem Exploration',
    description: 'Use multi-turn dialogue to thoroughly explore complex problems',
    prompt_text: `I want to systematically explore this complex workplace challenge using a multi-turn approach.

**Initial Problem Statement:**
{DESCRIBE_YOUR_COMPLEX_CHALLENGE}

**Context:**
- Industry/department: {CONTEXT}
- Stakeholders: {WHO_IS_AFFECTED}
- Constraints: {LIMITATIONS}

Let's start with broad exploration, then progressively narrow our focus. 

**Turn 1 Request:**
Help me understand this problem from multiple angles:
1. What are the root causes behind this challenge?
2. What factors am I not considering?
3. How do different stakeholders view this problem?
4. What similar challenges exist that might inform our approach?

After your response, I'll ask you to drill deeper into the most promising areas you identify.`,
    platform: 'claude',
    category: 'problem_solving',
    use_case: 'Systematically exploring complex problems through structured dialogue',
    expected_output: 'Comprehensive problem analysis with multiple perspectives and root cause identification',
    tips: 'Start broad and plan to narrow focus in subsequent turns. This prompt sets up a funnel approach to problem-solving.',
    order_index: 1,
    difficulty: 'advanced'
  },
  {
    lesson_title: 'Lesson 1.3.2: Multi-Turn Conversation Strategies',
    title: 'Expert Panel Consultation',
    description: 'Get multiple expert perspectives on the same challenge',
    prompt_text: `I want to approach this challenge from multiple expert perspectives. 

**Challenge Description:**
{YOUR_SPECIFIC_CHALLENGE}

**Turn 1 - Strategic Consultant Perspective:**
As a strategic management consultant with experience in {YOUR_INDUSTRY}, analyze this challenge:
- What strategic implications do you see?
- What framework would you use to approach this?
- What are the long-term considerations?

**Follow-up Turns I'll Use:**
- Turn 2: "Now, as an operational excellence expert, how would you approach this same challenge?"
- Turn 3: "As a change management specialist, what would you focus on?"
- Turn 4: "Synthesizing all three perspectives, what integrated approach would you recommend?"

Please start with the strategic consultant perspective.`,
    platform: 'claude',
    category: 'perspective_analysis',
    use_case: 'Getting multiple expert viewpoints on complex business challenges',
    expected_output: 'Detailed strategic analysis with framework recommendations and long-term considerations',
    tips: 'Plan your expert perspectives in advance. Choose roles that will give you genuinely different viewpoints on your challenge.',
    order_index: 2,
    difficulty: 'advanced'
  },

  // Lesson 1.3.3: Building Complex Solutions Through Dialogue
  {
    lesson_title: 'Lesson 1.3.3: Building Complex Solutions Through Dialogue',
    title: 'Solution Development Framework',
    description: 'Build comprehensive solutions through systematic dialogue',
    prompt_text: `I want to develop a comprehensive solution to this complex challenge using a systematic approach.

**Challenge Overview:**
- Problem: {DETAILED_PROBLEM_DESCRIPTION}
- Impact: {WHO_IS_AFFECTED_AND_HOW}
- Constraints: {LIMITATIONS_AND_REQUIREMENTS}
- Success criteria: {WHAT_SUCCESS_LOOKS_LIKE}

**Phase 1 - Problem Deep Dive:**
Before we develop solutions, help me fully understand this problem:
1. What are the root causes vs. symptoms?
2. What interconnected factors are at play?
3. What would happen if we don't solve this?
4. What assumptions should we test?
5. What additional information do we need?

Based on your analysis, I'll then ask you to:
- Phase 2: Generate multiple solution approaches
- Phase 3: Evaluate solutions against our criteria
- Phase 4: Develop detailed implementation plan

Let's start with the problem deep dive.`,
    platform: 'claude',
    category: 'solution_development',
    use_case: 'Systematically building comprehensive solutions through structured dialogue',
    expected_output: 'Thorough problem analysis with root causes, interconnections, and information gaps identified',
    tips: 'Resist jumping to solutions. Spend adequate time understanding the problem before moving to solution development.',
    order_index: 1,
    difficulty: 'advanced'
  },
  {
    lesson_title: 'Lesson 1.3.3: Building Complex Solutions Through Dialogue',
    title: 'Implementation Planning Dialogue',
    description: 'Develop detailed implementation plans through collaborative conversation',
    prompt_text: `We've selected our solution approach: {BRIEF_SOLUTION_DESCRIPTION}

Now let's develop a comprehensive implementation plan through dialogue.

**Implementation Context:**
- Timeline available: {TIME_CONSTRAINTS}
- Resources: {AVAILABLE_RESOURCES}
- Stakeholders: {WHO_NEEDS_TO_BE_INVOLVED}
- Risk tolerance: {ORGANIZATIONAL_RISK_APPETITE}

**Turn 1 - Implementation Architecture:**
Help me design the overall implementation approach:
1. What are the logical phases or stages?
2. What are the critical milestones?
3. What dependencies exist between components?
4. What could derail implementation?

**Planned Follow-up Turns:**
- Turn 2: "Detail the first phase timeline and tasks"
- Turn 3: "Identify risks and mitigation strategies"
- Turn 4: "Create stakeholder communication plan"
- Turn 5: "Design success measurement approach"

Start with the implementation architecture.`,
    platform: 'claude',
    category: 'implementation_planning',
    use_case: 'Developing detailed implementation plans through systematic dialogue',
    expected_output: 'Comprehensive implementation architecture with phases, milestones, and dependencies',
    tips: 'Build implementation plans incrementally. Start with the big picture before diving into detailed tasks.',
    order_index: 2,
    difficulty: 'advanced'
  },

  // Lesson 1.3.4: Managing AI Memory and Context Limits
  {
    lesson_title: 'Lesson 1.3.4: Managing AI Memory and Context Limits',
    title: 'Context Compression and Summary',
    description: 'Efficiently compress long conversations while preserving key information',
    prompt_text: `I need to compress our extensive conversation while preserving all critical information for future reference.

**Conversation Summary Request:**
Please analyze our entire conversation and create a compressed summary that includes:

**1. Key Decisions Made:**
- What we decided and why
- Alternatives we considered and rejected
- Decision criteria we used

**2. Important Insights Discovered:**
- Key findings from our analysis
- Unexpected connections or patterns
- Critical assumptions identified

**3. Action Items and Next Steps:**
- Specific tasks to be completed
- Responsibilities and timelines
- Dependencies and prerequisites

**4. Context for Future Conversations:**
- Background information to remember
- Stakeholder considerations
- Constraints and requirements still relevant

**5. Outstanding Questions:**
- Issues that need further exploration
- Information we still need to gather
- Decisions still pending

Format this as a reference document I can use to restart our conversation effectively in a new session.`,
    platform: 'claude',
    category: 'context_management',
    use_case: 'Compressing long conversations while preserving essential information',
    expected_output: 'Comprehensive but concise summary organized for easy reference and context restoration',
    tips: 'Use this when conversations get long or when you need to start fresh sessions. Export the summary for future use.',
    order_index: 1,
    difficulty: 'intermediate'
  },
  {
    lesson_title: 'Lesson 1.3.4: Managing AI Memory and Context Limits',
    title: 'Strategic Context Layering',
    description: 'Efficiently build context in new conversations through strategic layering',
    prompt_text: `I'm starting a new conversation but need to efficiently establish context from previous work.

**Context Layer 1 - Project Foundation:**
- Project: {PROJECT_NAME}
- Objective: {PRIMARY_GOAL}
- My role: {YOUR_ROLE}
- Timeline: {KEY_DATES}

**Context Layer 2 - Current Situation:**
- Phase: {CURRENT_PROJECT_PHASE}
- Recent progress: {WHAT_WAS_ACCOMPLISHED}
- Current challenge: {IMMEDIATE_PROBLEM}

**Context Layer 3 - Key Constraints:**
- Resources: {AVAILABLE_RESOURCES}
- Stakeholders: {KEY_PEOPLE_INVOLVED}
- Requirements: {MUST_HAVES}

**Context Layer 4 - Previous Decisions:**
- Approach chosen: {SELECTED_APPROACH}
- Alternatives rejected: {WHAT_WE_DECIDED_AGAINST}
- Success criteria: {HOW_WE_MEASURE_SUCCESS}

**Current Request:**
Based on this layered context, I need help with {SPECIFIC_CURRENT_TASK}.

Please confirm you understand the context and provide guidance on my current request.`,
    platform: 'claude',
    category: 'context_management',
    use_case: 'Efficiently establishing context in new conversations through strategic information layering',
    expected_output: 'Context-aware response that demonstrates understanding and provides relevant guidance',
    tips: 'Layer context from general to specific. This helps AI understand both the big picture and immediate needs.',
    order_index: 2,
    difficulty: 'intermediate'
  },

  // Lesson 1.4.1: Meeting Management Automation
  {
    lesson_title: 'Lesson 1.4.1: Meeting Management Automation',
    title: 'Advanced Meeting Agenda Generator',
    description: 'Create comprehensive, time-allocated meeting agendas with preparation requirements',
    prompt_text: `Create a comprehensive meeting agenda for this high-stakes meeting:

**Meeting Details:**
- Type: {MEETING_TYPE}
- Duration: {TOTAL_TIME}
- Participants: {LIST_ATTENDEES_WITH_ROLES}
- Meeting objective: {PRIMARY_PURPOSE}

**Context:**
- Background: {RELEVANT_PROJECT_OR_SITUATION_CONTEXT}
- Decisions needed: {SPECIFIC_DECISIONS_REQUIRED}
- Preparation completed: {WHAT_HAS_BEEN_DONE_ALREADY}

**Constraints:**
- Must address: {NON_NEGOTIABLE_TOPICS}
- Time limitations: {HARD_DEADLINES_OR_CONSTRAINTS}
- Stakeholder concerns: {SPECIFIC_ISSUES_TO_ADDRESS}

**Create an agenda that includes:**
1. Time-allocated agenda items with buffer time
2. Clear objectives for each segment
3. Pre-meeting preparation requirements for each attendee
4. Decision points and voting/approval processes
5. Action item capture template
6. Success criteria for the meeting
7. Follow-up responsibilities and timeline

Format as a professional agenda document ready to distribute to participants.`,
    platform: 'claude',
    category: 'meeting_management',
    use_case: 'Creating professional, detailed meeting agendas with time management and preparation requirements',
    expected_output: 'Complete professional meeting agenda with time allocations, objectives, and preparation requirements',
    tips: 'Be specific about decisions needed and stakeholder concerns. This helps create focused, productive agendas.',
    order_index: 1,
    difficulty: 'intermediate'
  },
  {
    lesson_title: 'Lesson 1.4.1: Meeting Management Automation',
    title: 'Meeting ROI Analysis',
    description: 'Analyze and optimize meeting cost-effectiveness',
    prompt_text: `Analyze the cost-effectiveness and ROI of our meeting structure:

**Current Meeting Inventory:**
{LIST_YOUR_RECURRING_MEETINGS_WITH_DETAILS}

For each meeting, provide:
- Frequency: {WEEKLY/MONTHLY/ETC}
- Duration: {TIME_LENGTH}
- Attendees: {NUMBER_AND_AVERAGE_ROLE_LEVEL}
- Current purpose: {STATED_OBJECTIVE}

**Cost Analysis Context:**
- Average hourly rate for calculation: ${ESTIMATED_HOURLY_COST}
- Team productivity priorities: {WHAT_MATTERS_MOST}
- Communication alternatives available: {SLACK_EMAIL_ETC}

**Requested Analysis:**
1. Calculate total time and dollar cost per meeting type per year
2. Assess value delivered vs. cost for each meeting
3. Identify meetings that could be:
   - Eliminated entirely
   - Reduced in frequency or duration
   - Combined with other meetings
   - Converted to asynchronous communication
4. Recommend optimized meeting schedule with projected savings
5. Suggest success metrics for measuring meeting effectiveness improvement

Provide specific recommendations with quantified impact projections.`,
    platform: 'claude',
    category: 'meeting_optimization',
    use_case: 'Analyzing meeting costs and optimizing meeting portfolios for better ROI',
    expected_output: 'Detailed cost analysis with specific recommendations for meeting optimization and projected savings',
    tips: 'Be honest about current meeting effectiveness. Include real costs and time commitments for accurate analysis.',
    order_index: 2,
    difficulty: 'advanced'
  },

  // Lesson 1.4.2: Email and Communication Optimization
  {
    lesson_title: 'Lesson 1.4.2: Email and Communication Optimization',
    title: 'Strategic Stakeholder Communication Plan',
    description: 'Design comprehensive communication strategies for complex projects',
    prompt_text: `Design a strategic communication plan for this complex project:

**Project Overview:**
- Project: {PROJECT_NAME_AND_DESCRIPTION}
- Duration: {PROJECT_TIMELINE}
- Complexity factors: {WHAT_MAKES_THIS_CHALLENGING}

**Stakeholder Analysis:**
{LIST_EACH_STAKEHOLDER_WITH_DETAILS}
- {STAKEHOLDER_1}: Role, influence level, interests, preferred communication style
- {STAKEHOLDER_2}: Role, influence level, interests, preferred communication style
- {STAKEHOLDER_3}: Role, influence level, interests, preferred communication style

**Communication Challenges:**
- Competing interests: {STAKEHOLDER_CONFLICTS}
- Information sensitivity: {WHAT_CAN'T_BE_SHARED_BROADLY}
- Change resistance: {WHO_MIGHT_OPPOSE_CHANGES}
- Geographic/time zone factors: {LOCATION_CONSIDERATIONS}

**Communication Plan Requirements:**
1. Stakeholder-specific communication schedules and methods
2. Key messages for each project phase
3. Escalation communication protocols
4. Success metrics for communication effectiveness
5. Crisis communication backup plans
6. Information sharing guidelines and restrictions

Create a comprehensive communication strategy that ensures all stakeholders stay informed and engaged while managing information sensitivity and potential conflicts.`,
    platform: 'claude',
    category: 'stakeholder_communication',
    use_case: 'Designing comprehensive communication strategies for complex multi-stakeholder projects',
    expected_output: 'Detailed communication plan with stakeholder-specific strategies and success metrics',
    tips: 'Be specific about stakeholder power dynamics and information sensitivity. This helps create realistic, effective communication strategies.',
    order_index: 1,
    difficulty: 'advanced'
  },
  {
    lesson_title: 'Lesson 1.4.2: Email and Communication Optimization',
    title: 'Crisis Communication Response',
    description: 'Create effective crisis communication for various stakeholder groups',
    prompt_text: `Help me create crisis communication for this urgent situation:

**Crisis Details:**
- What happened: {DETAILED_CRISIS_DESCRIPTION}
- When it occurred: {TIMELINE}
- Impact scope: {WHO_IS_AFFECTED_AND_HOW}
- Current status: {WHAT_WE'RE_DOING_NOW}

**Our Response:**
- Immediate actions taken: {EMERGENCY_RESPONSE}
- Root cause analysis: {WHAT_CAUSED_THIS}
- Resolution timeline: {WHEN_WILL_IT_BE_FIXED}
- Prevention measures: {HOW_WE'LL_PREVENT_RECURRENCE}

**Stakeholder Groups Needing Communication:**
1. {STAKEHOLDER_GROUP_1}: Relationship, concerns, information needs
2. {STAKEHOLDER_GROUP_2}: Relationship, concerns, information needs
3. {STAKEHOLDER_GROUP_3}: Relationship, concerns, information needs

**Communication Requirements:**
- Tone: Professional, transparent, confidence-building
- Legal considerations: {COMPLIANCE_OR_LIABILITY_ISSUES}
- Timing: {WHEN_EACH_GROUP_NEEDS_TO_HEAR_FROM_US}

Create customized crisis communications for each stakeholder group that:
- Acknowledge the situation appropriately
- Explain our response and timeline
- Address their specific concerns
- Maintain confidence in our capability
- Provide clear next steps and contact information

Format each as ready-to-send communications.`,
    platform: 'claude',
    category: 'crisis_communication',
    use_case: 'Creating stakeholder-specific crisis communications that manage concerns while maintaining confidence',
    expected_output: 'Multiple crisis communication messages tailored to different stakeholder groups with appropriate tone and content',
    tips: 'Be specific about the crisis impact and your response. Different stakeholders need different levels of detail and reassurance.',
    order_index: 2,
    difficulty: 'advanced'
  },

  // Lesson 1.4.3: Document Creation and Review
  {
    lesson_title: 'Lesson 1.4.3: Document Creation and Review',
    title: 'Executive Proposal Generator',
    description: 'Create compelling executive proposals with strategic justification',
    prompt_text: `Help me create a compelling executive proposal for this strategic initiative:

**Proposal Overview:**
- Initiative: {WHAT_YOU'RE_PROPOSING}
- Business objective: {WHY_THIS_MATTERS}
- Investment required: {RESOURCES_NEEDED}
- Timeline: {IMPLEMENTATION_SCHEDULE}

**Business Context:**
- Current challenge: {PROBLEM_BEING_SOLVED}
- Market opportunity: {EXTERNAL_DRIVERS}
- Competitive factors: {COMPETITIVE_LANDSCAPE}
- Risk factors: {WHAT_COULD_GO_WRONG}

**Executive Audience:**
- Decision makers: {WHO_WILL_DECIDE}
- Their priorities: {WHAT_THEY_CARE_ABOUT}
- Decision criteria: {HOW_THEY_EVALUATE_PROPOSALS}
- Political considerations: {ORGANIZATIONAL_DYNAMICS}

**Supporting Evidence:**
- Financial projections: {REVENUE_COST_SAVINGS_DATA}
- Success metrics: {HOW_TO_MEASURE_SUCCESS}
- Implementation capability: {WHY_WE_CAN_EXECUTE}
- Risk mitigation: {HOW_WE_HANDLE_RISKS}

Create a compelling executive proposal that:
1. Leads with strategic impact and business case
2. Addresses executive concerns proactively
3. Provides clear financial justification
4. Demonstrates implementation feasibility
5. Includes specific next steps and decision timeline

Format as a professional executive brief ready for presentation.`,
    platform: 'claude',
    category: 'executive_communication',
    use_case: 'Creating persuasive executive proposals with strategic justification and business case development',
    expected_output: 'Professional executive proposal with strategic rationale, financial justification, and implementation plan',
    tips: 'Focus on business impact and executive priorities. Lead with outcomes, not features or process details.',
    order_index: 1,
    difficulty: 'advanced'
  },
  {
    lesson_title: 'Lesson 1.4.3: Document Creation and Review',
    title: 'Technical Translation Specialist',
    description: 'Translate complex technical content for business audiences',
    prompt_text: `Help me translate this technical content for a business audience:

**Technical Content to Translate:**
{PASTE_YOUR_TECHNICAL_CONTENT}

**Translation Context:**
- Current audience: {TECHNICAL_AUDIENCE_LEVEL}
- Target audience: {BUSINESS_AUDIENCE_DESCRIPTION}
- Business context: {WHY_THEY_NEED_THIS_INFORMATION}
- Decision they're making: {WHAT_THEY_NEED_TO_DECIDE}

**Translation Requirements:**
- Remove technical jargon while preserving accuracy
- Focus on business impact rather than technical process
- Include relevant analogies or examples for clarity
- Highlight risks and opportunities in business terms
- Provide clear recommendations and next steps

**Audience Considerations:**
- Technical background: {MINIMAL/MODERATE/NONE}
- Time constraints: {HOW_MUCH_DETAIL_THEY_WANT}
- Decision authority: {CAN_THEY_APPROVE_OR_JUST_RECOMMEND}
- Key concerns: {WHAT_KEEPS_THEM_UP_AT_NIGHT}

Create a business-friendly version that:
1. Explains the technical concept in accessible terms
2. Emphasizes business implications and value
3. Addresses likely business concerns and questions
4. Provides clear recommendations with justification
5. Maintains technical accuracy while improving clarity

Preserve all essential information while making it actionable for business decision-makers.`,
    platform: 'claude',
    category: 'technical_translation',
    use_case: 'Converting technical content into business-friendly language while preserving accuracy and impact',
    expected_output: 'Business-friendly translation of technical content with clear implications and recommendations',
    tips: 'Focus on business outcomes and implications. Use analogies and examples that resonate with business audiences.',
    order_index: 2,
    difficulty: 'intermediate'
  },

  // Lesson 1.4.4: Level 1 Capstone Project
  {
    lesson_title: 'Lesson 1.4.4: Level 1 Capstone Project',
    title: 'Capstone Project Analysis Framework',
    description: 'Comprehensive analysis framework for your capstone project challenge',
    prompt_text: `Help me conduct a comprehensive analysis for my Level 1 capstone project:

**Capstone Challenge Selection:**
- Challenge type: {PROCESS_OPTIMIZATION/COMMUNICATION_EXCELLENCE/DECISION_SUPPORT}
- Specific challenge: {DETAILED_DESCRIPTION_OF_YOUR_WORKPLACE_CHALLENGE}

**Current State Analysis:**
- Current process/approach: {HOW_THINGS_WORK_NOW}
- Stakeholders involved: {WHO_IS_AFFECTED}
- Pain points: {SPECIFIC_PROBLEMS_AND_INEFFICIENCIES}
- Resources consumed: {TIME_EFFORT_COST_CURRENTLY_REQUIRED}

**Business Context:**
- Department/team: {ORGANIZATIONAL_CONTEXT}
- Volume/frequency: {HOW_OFTEN_THIS_OCCURS}
- Business impact: {WHY_THIS_MATTERS_TO_THE_ORGANIZATION}
- Success criteria: {HOW_YOU'LL_MEASURE_IMPROVEMENT}

**Constraints and Requirements:**
- Technology limitations: {SYSTEM_CONSTRAINTS}
- Policy restrictions: {COMPLIANCE_REQUIREMENTS}
- Resource constraints: {BUDGET_TIME_PEOPLE_LIMITATIONS}
- Change management factors: {RESISTANCE_OR_ADOPTION_CHALLENGES}

**Analysis Requested:**
1. Root cause analysis of current inefficiencies
2. Stakeholder impact assessment with priorities
3. Opportunity identification for AI integration points
4. Risk analysis with mitigation strategies
5. Success metrics definition and measurement approach
6. Implementation feasibility assessment

Provide a comprehensive analysis that sets the foundation for designing an AI-powered solution to this challenge.`,
    platform: 'claude',
    category: 'capstone_analysis',
    use_case: 'Conducting comprehensive workplace challenge analysis for capstone project development',
    expected_output: 'Thorough analysis with root causes, stakeholder impacts, opportunities, and success metrics for capstone project',
    tips: 'Be honest about current state problems and constraints. This analysis will guide your entire capstone project solution.',
    order_index: 1,
    difficulty: 'advanced'
  },
  {
    lesson_title: 'Lesson 1.4.4: Level 1 Capstone Project',
    title: 'AI Integration Architecture Design',
    description: 'Design comprehensive AI integration architecture for your capstone solution',
    prompt_text: `Design the AI integration architecture for my capstone project solution:

**Challenge Context (from previous analysis):**
- Core challenge: {BRIEF_SUMMARY_OF_CHALLENGE}
- Key stakeholders: {PRIMARY_USERS_AND_AFFECTED_PARTIES}
- Success criteria: {HOW_SUCCESS_WILL_BE_MEASURED}

**Available AI Resources:**
- AI platforms accessible: {CLAUDE_CHATGPT_GEMINI_OTHERS}
- Team AI experience: {CURRENT_SKILL_LEVELS}
- Integration constraints: {TECHNICAL_OR_POLICY_LIMITATIONS}
- Budget considerations: {COST_CONSTRAINTS}

**Solution Requirements:**
- Must address: {NON_NEGOTIABLE_REQUIREMENTS}
- Should address: {NICE_TO_HAVE_FEATURES}
- Cannot compromise: {QUALITY_OR_COMPLIANCE_REQUIREMENTS}

**Design the AI Integration Architecture:**
1. **Workflow Integration Points:**
   - Where AI will be integrated in the current process
   - Specific AI tasks and responsibilities
   - Human oversight and validation points

2. **AI Tool Selection and Allocation:**
   - Which AI platforms for which tasks
   - Rationale for tool selection
   - Backup options and alternatives

3. **Prompt Engineering Strategy:**
   - Custom prompts needed for each integration point
   - Template development for consistent results
   - Quality assurance and validation approaches

4. **Implementation Approach:**
   - Pilot testing strategy
   - Phased rollout plan
   - Training and change management requirements

5. **Success Measurement:**
   - Metrics for each integration point
   - Overall solution effectiveness measures
   - Monitoring and continuous improvement approach

Create a comprehensive AI integration architecture that transforms your current process while managing risk and ensuring adoption.`,
    platform: 'claude',
    category: 'solution_architecture',
    use_case: 'Designing comprehensive AI integration architecture for workplace transformation projects',
    expected_output: 'Detailed AI integration architecture with tool selection, implementation approach, and success metrics',
    tips: 'Balance ambition with feasibility. Design for the current skill level of your team while creating room for growth.',
    order_index: 2,
    difficulty: 'advanced'
  }
];

async function seedRemainingPrompts() {
  try {
    for (const prompt of remainingPrompts) {
      // Get lesson ID from title
      const { rows: lessonRows } = await pool.query(
        'SELECT id FROM lessons WHERE title = $1',
        [prompt.lesson_title]
      );
      
      if (lessonRows.length > 0) {
        const lessonId = lessonRows[0].id;
        
        await pool.query(
          'INSERT INTO prompts (lesson_id, title, description, prompt_text, platform, category, use_case, expected_output, tips, order_index, difficulty) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
          [
            lessonId,
            prompt.title,
            prompt.description,
            prompt.prompt_text,
            prompt.platform,
            prompt.category,
            prompt.use_case,
            prompt.expected_output,
            prompt.tips,
            prompt.order_index,
            prompt.difficulty
          ]
        );
        
        console.log(`✓ Seeded prompt: ${prompt.title}`);
      } else {
        console.log(`⚠ Lesson not found: ${prompt.lesson_title}`);
      }
    }
    
    console.log('\n🎉 All remaining prompts seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding remaining prompts:', error);
  } finally {
    pool.end();
    process.exit(0);
  }
}

seedRemainingPrompts();