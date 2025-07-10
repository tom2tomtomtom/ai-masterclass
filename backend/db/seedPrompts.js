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

const prompts = [
  // Lesson 1.1.1: Understanding AI Capabilities
  {
    lesson_title: 'Lesson 1.1.1: Understanding AI Capabilities',
    title: 'AI Capability Assessment',
    description: 'Discover 5+ ways AI can save you 2 hours daily in your specific role',
    prompt_text: `I work as a {YOUR_ROLE} in {YOUR_INDUSTRY} and I'm trying to understand how AI can help me with my daily tasks.

My main responsibilities include:
- {LIST_YOUR_MAIN_TASKS}

Current challenges I face:
- {DESCRIBE_YOUR_CHALLENGES}

Please analyze my role and tasks, then provide:
1. Which of my tasks AI can help with (and how)
2. Which tasks AI cannot help with (and why)
3. Specific AI capabilities that would be most valuable for my role
4. Realistic expectations for AI assistance in my work

Be specific about what AI can and cannot do, and avoid overpromising capabilities.`,
    platform: 'claude',
    category: 'assessment',
    use_case: 'Understanding AI potential for your specific role and industry',
    expected_output: 'Detailed analysis of AI capabilities relevant to your work, with realistic expectations',
    tips: 'Be specific about your role and tasks. The more detail you provide, the better the AI can assess relevant capabilities.',
    order_index: 1,
    difficulty: 'beginner'
  },
  {
    lesson_title: 'Lesson 1.1.1: Understanding AI Capabilities',
    title: 'AI Limitation Check',
    description: 'Avoid costly AI mistakes by understanding what can go wrong in your work',
    prompt_text: `I need to understand AI limitations in my work context. Here's a specific scenario from my job:

Scenario: {DESCRIBE_A_SPECIFIC_WORK_SITUATION}

Please help me understand:
1. What parts of this scenario can AI handle well?
2. What parts would be challenging or impossible for AI?
3. What information would AI need to be helpful?
4. What would AI likely get wrong or miss?
5. How should I verify AI's suggestions for this type of work?

Be honest about limitations and potential failure modes.`,
    platform: 'chatgpt',
    category: 'assessment',
    use_case: 'Understanding AI limitations in real work scenarios',
    expected_output: 'Honest assessment of what AI can and cannot do in your specific situation',
    tips: 'Use a real, detailed scenario from your work. This helps you understand practical limitations.',
    order_index: 2,
    difficulty: 'beginner'
  },

  // Lesson 1.1.2: AI Model Comparison
  {
    lesson_title: 'Lesson 1.1.2: AI Model Comparison',
    title: 'Model Selection for Your Work',
    description: 'Stop wasting time with wrong AI tools - pick the perfect one for each task',
    prompt_text: `I need to choose the right AI model for my work tasks. Here's my situation:

My role: {YOUR_ROLE}
Primary tasks I want AI help with:
1. {TASK_1}
2. {TASK_2}
3. {TASK_3}

Work context:
- Industry: {YOUR_INDUSTRY}
- Team size: {TEAM_SIZE}
- Main challenges: {MAIN_CHALLENGES}

Please compare Claude, ChatGPT, and Gemini for my specific needs:
1. Which model would be best for each of my tasks?
2. What are the key differences that matter for my work?
3. Are there specific use cases where one model clearly outperforms others?
4. What should I test with each model to make my decision?

Provide specific recommendations based on my actual work needs.`,
    platform: 'claude',
    category: 'comparison',
    use_case: 'Selecting the right AI model for your specific work requirements',
    expected_output: 'Comparative analysis with specific recommendations for your tasks',
    tips: 'List your most important tasks. Focus on what matters most for your daily work.',
    order_index: 1,
    difficulty: 'beginner'
  },
  {
    lesson_title: 'Lesson 1.1.2: AI Model Comparison',
    title: 'Model Testing Framework',
    description: 'Create a systematic approach to test different AI models',
    prompt_text: `I want to systematically test different AI models for my work. Help me create a testing framework.

My main work tasks:
- {TASK_1_DESCRIPTION}
- {TASK_2_DESCRIPTION}
- {TASK_3_DESCRIPTION}

Success criteria for AI assistance:
- {CRITERIA_1}
- {CRITERIA_2}
- {CRITERIA_3}

Please create a testing plan that includes:
1. Specific test scenarios for each task
2. Evaluation criteria for comparing models
3. Sample prompts to test with each model
4. A scoring system to objectively compare results
5. Timeline for conducting tests

Make it practical and focused on my actual work needs.`,
    platform: 'claude',
    category: 'testing',
    use_case: 'Creating a systematic approach to evaluate AI models for your work',
    expected_output: 'Detailed testing framework with specific scenarios and evaluation criteria',
    tips: 'Focus on measurable criteria that matter for your work quality and efficiency.',
    order_index: 2,
    difficulty: 'beginner'
  },

  // Lesson 1.2.1: Prompt Structure Fundamentals
  {
    lesson_title: 'Lesson 1.2.1: Prompt Structure Fundamentals',
    title: 'Work Email Optimization',
    description: 'Transform unclear emails into clear, actionable messages that get results',
    prompt_text: `You are a professional communication expert. I need help improving my work emails.

CONTEXT: I'm a {YOUR_ROLE} at a {COMPANY_SIZE} company in {INDUSTRY}. I frequently need to send emails about {EMAIL_PURPOSE} to {RECIPIENT_TYPES}.

CURRENT CHALLENGE: My emails often {DESCRIBE_CURRENT_PROBLEM} and I need to {DESIRED_IMPROVEMENT}.

TASK: Help me rewrite this email to be more effective:

[PASTE YOUR EMAIL HERE]

REQUIREMENTS:
- Keep it professional but approachable
- Ensure the main message is clear
- Include a specific call-to-action
- Maintain appropriate tone for {RELATIONSHIP_TYPE}
- Length: {DESIRED_LENGTH}

AUDIENCE: {DESCRIBE_RECIPIENT}

Please provide the rewritten email and explain the key improvements you made.`,
    platform: 'claude',
    category: 'communication',
    use_case: 'Improving professional email communication using structured prompts',
    expected_output: 'Rewritten email with explanation of improvements and communication strategies',
    tips: 'Be specific about your role, audience, and desired outcome. Include the actual email you want to improve.',
    order_index: 1,
    difficulty: 'beginner'
  },
  {
    lesson_title: 'Lesson 1.2.1: Prompt Structure Fundamentals',
    title: 'Meeting Agenda Creator',
    description: 'Turn chaotic meetings into productive sessions with clear agendas',
    prompt_text: `You are a meeting facilitation expert. I need help creating an effective meeting agenda.

CONTEXT: I'm organizing a {MEETING_TYPE} with {ATTENDEE_COUNT} people from {DEPARTMENTS/TEAMS}. This is a {MEETING_FREQUENCY} meeting.

MEETING DETAILS:
- Duration: {MEETING_LENGTH}
- Main objective: {PRIMARY_OBJECTIVE}
- Key decisions needed: {DECISIONS_REQUIRED}
- Background: {RELEVANT_CONTEXT}

ATTENDEES:
- {ATTENDEE_1_ROLE}
- {ATTENDEE_2_ROLE}
- {ATTENDEE_3_ROLE}

TASK: Create a detailed meeting agenda that includes:
1. Time-allocated agenda items
2. Clear objectives for each section
3. Preparation requirements for attendees
4. Decision points and action items template
5. Meeting ground rules

FORMAT: Professional agenda document ready to send to attendees.

CONSTRAINTS: Must fit within {MEETING_LENGTH} and allow time for discussion.`,
    platform: 'claude',
    category: 'meeting_management',
    use_case: 'Creating structured, effective meeting agendas using detailed context',
    expected_output: 'Complete meeting agenda with time allocations, objectives, and preparation requirements',
    tips: 'Include specific attendee roles and meeting objectives. This helps create more targeted agendas.',
    order_index: 2,
    difficulty: 'beginner'
  },

  // NEW: Ready-to-Use Meeting Prompts
  {
    lesson_title: 'Lesson 1.2.1: Prompt Structure Fundamentals',
    title: 'Weekly Team Meeting (Ready-to-Use)',
    description: 'Save 30 minutes of prep time with this plug-and-play agenda',
    prompt_text: `You are a team management expert. Create a focused weekly team meeting agenda.

CONTEXT: I'm leading a weekly team meeting with 6-8 team members. We need to cover project updates, address blockers, and align on priorities for the coming week.

MEETING DETAILS:
- Duration: 45 minutes
- Attendees: Team leads and project contributors
- Format: Hybrid (some remote, some in-person)
- Goal: Clear priorities and unblocked team members

TASK: Create a time-efficient agenda that includes:
1. Quick wins celebration (5 min)
2. Project status updates (15 min)
3. Blocker discussion and solutions (15 min)
4. Next week priorities (8 min)
5. Action items and owners (2 min)

FORMAT:
- Time allocations for each section
- Specific questions to guide discussion
- Template for capturing action items
- Pre-meeting preparation checklist

CONSTRAINTS: Keep discussions focused, ensure everyone contributes, end on time.`,
    platform: 'claude',
    category: 'meeting_management',
    use_case: 'Ready-to-use weekly team meeting agenda that saves prep time',
    expected_output: 'Complete agenda with time blocks, discussion questions, and action item template',
    tips: 'Perfect for team leads who run regular check-ins. Customize the time blocks based on your team size.',
    order_index: 3,
    difficulty: 'beginner'
  },

  {
    lesson_title: 'Lesson 1.2.1: Prompt Structure Fundamentals',
    title: 'Client Update Meeting (Ready-to-Use)',
    description: 'Professional client meetings that build trust and demonstrate progress',
    prompt_text: `You are a client relationship expert. Create a professional client update meeting agenda.

CONTEXT: I'm meeting with a key client to provide project updates. They're busy executives who value efficiency and clear communication about progress, challenges, and next steps.

MEETING DETAILS:
- Duration: 30 minutes
- Attendees: Client stakeholders and project team
- Goal: Demonstrate progress, address concerns, secure continued support
- Relationship: Ongoing project, need to maintain trust

TASK: Create a client-focused agenda that includes:
1. Executive summary of progress (5 min)
2. Key achievements since last meeting (8 min)
3. Current challenges and mitigation plans (10 min)
4. Next milestones and timeline (5 min)
5. Client questions and feedback (2 min)

FORMAT:
- Professional structure suitable for executives
- Clear metrics and progress indicators
- Proactive problem-solving approach
- Specific next steps with dates

CONSTRAINTS: Stay positive but transparent, focus on business value, respect their time.`,
    platform: 'claude',
    category: 'meeting_management',
    use_case: 'Professional client update meetings that demonstrate value and maintain relationships',
    expected_output: 'Executive-level agenda with progress metrics, challenge mitigation, and clear next steps',
    tips: 'Great for account managers and project leads. Always include specific metrics and dates.',
    order_index: 4,
    difficulty: 'beginner'
  },

  // NEW: Ready-to-Use Email Templates
  {
    lesson_title: 'Lesson 1.2.1: Prompt Structure Fundamentals',
    title: 'Project Delay Notification (Ready-to-Use)',
    description: 'Professional delay communication that maintains stakeholder confidence',
    prompt_text: `You are a project communication expert. Help me draft a professional project delay notification.

CONTEXT: I'm a project manager who needs to inform stakeholders about a 2-week delay in our software launch. The delay is due to critical security vulnerabilities discovered during final testing. This affects our go-to-market timeline but ensures product quality.

STAKEHOLDERS: Include senior executives, marketing team, and key clients who are expecting the launch.

TASK: Create a professional email that:
1. Clearly states the new timeline (2 weeks later)
2. Explains the reason (security improvements)
3. Emphasizes our commitment to quality
4. Outlines what we're doing during the delay
5. Provides specific next steps and communication plan

FORMAT: Professional email with:
- Clear, direct subject line
- Executive summary in first paragraph
- Detailed explanation in body
- Action items and next steps
- Confident, solution-focused tone

CONSTRAINTS: Must be transparent but maintain confidence, under 300 words, include specific dates.`,
    platform: 'claude',
    category: 'communication',
    use_case: 'Professional project delay communication that maintains stakeholder trust',
    expected_output: 'Complete email with subject line, clear timeline, reasoning, and next steps',
    tips: 'Perfect for project managers dealing with timeline changes. Emphasizes quality and proactive communication.',
    order_index: 5,
    difficulty: 'beginner'
  },

  {
    lesson_title: 'Lesson 1.2.1: Prompt Structure Fundamentals',
    title: 'Client Proposal Response (Ready-to-Use)',
    description: 'Win more business with compelling proposal responses',
    prompt_text: `You are a business development expert. Help me craft a winning client proposal response.

CONTEXT: I'm responding to an RFP from a potential enterprise client. They're looking for a 6-month consulting engagement to improve their operational efficiency. Budget range is $150K-200K. They've mentioned concerns about timeline and ROI measurement.

CLIENT PROFILE: Fortune 500 manufacturing company, conservative decision-making, previous bad experience with consultants, values proven results and clear communication.

TASK: Create a compelling proposal response that:
1. Addresses their specific operational efficiency needs
2. Provides clear timeline with milestones
3. Includes ROI measurement framework
4. Demonstrates understanding of their industry
5. Builds confidence in our approach

FORMAT: Professional proposal structure with:
- Executive summary (problem + solution)
- Detailed approach and methodology
- Timeline with specific deliverables
- Investment and ROI projections
- Next steps and decision timeline

CONSTRAINTS: Must address their concerns about timeline and ROI, demonstrate manufacturing industry expertise, confident but not overselling tone.`,
    platform: 'claude',
    category: 'business_development',
    use_case: 'Winning client proposals that address concerns and demonstrate value',
    expected_output: 'Complete proposal response with executive summary, approach, timeline, and ROI framework',
    tips: 'Great for consultants and service providers. Customize the industry and concerns for your specific situation.',
    order_index: 6,
    difficulty: 'intermediate'
  },

  // Lesson 1.2.2: Context Setting Techniques
  {
    lesson_title: 'Lesson 1.2.2: Context Setting Techniques',
    title: 'Project Status Update',
    description: 'Turn project chaos into clear stakeholder communication that builds confidence',
    prompt_text: `You are a project management communication specialist. I need help creating a project status update.

SITUATIONAL CONTEXT:
- Project: {PROJECT_NAME}
- Timeline: {PROJECT_TIMELINE}
- Budget: {BUDGET_STATUS}
- Team size: {TEAM_SIZE}
- Current phase: {CURRENT_PHASE}

RECENT DEVELOPMENTS:
- {RECENT_DEVELOPMENT_1}
- {RECENT_DEVELOPMENT_2}
- {RECENT_DEVELOPMENT_3}

CURRENT CHALLENGES:
- {CHALLENGE_1}
- {CHALLENGE_2}

AUDIENCE CONTEXT:
- Primary audience: {PRIMARY_AUDIENCE}
- Their main concerns: {AUDIENCE_CONCERNS}
- Communication frequency: {COMMUNICATION_FREQUENCY}
- Level of detail needed: {DETAIL_LEVEL}

CONSTRAINT CONTEXT:
- Must address: {MUST_ADDRESS}
- Cannot reveal: {CONFIDENTIAL_INFO}
- Deadline for update: {UPDATE_DEADLINE}

TASK: Create a comprehensive project status update that addresses stakeholder concerns while maintaining transparency about challenges and progress.`,
    platform: 'claude',
    category: 'project_management',
    use_case: 'Creating comprehensive project status updates with proper context setting',
    expected_output: 'Professional project status update addressing stakeholder concerns and current project state',
    tips: 'Include specific project details and stakeholder concerns. The more context you provide, the better the update.',
    order_index: 1,
    difficulty: 'beginner'
  },
  {
    lesson_title: 'Lesson 1.2.2: Context Setting Techniques',
    title: 'Customer Issue Resolution',
    description: 'Transform angry customers into satisfied advocates with professional responses',
    prompt_text: `You are a customer service expert. I need help resolving a customer issue.

CUSTOMER CONTEXT:
- Customer type: {CUSTOMER_TYPE}
- Relationship duration: {RELATIONSHIP_LENGTH}
- Account value: {ACCOUNT_VALUE}
- Previous interactions: {PREVIOUS_INTERACTIONS}

ISSUE CONTEXT:
- Problem: {DESCRIBE_PROBLEM}
- Impact on customer: {CUSTOMER_IMPACT}
- When it occurred: {ISSUE_TIMELINE}
- Previous resolution attempts: {PREVIOUS_ATTEMPTS}

BUSINESS CONTEXT:
- Company policy: {RELEVANT_POLICY}
- Available solutions: {AVAILABLE_SOLUTIONS}
- Escalation options: {ESCALATION_OPTIONS}
- Budget for resolution: {RESOLUTION_BUDGET}

RELATIONSHIP CONTEXT:
- Customer's communication style: {COMMUNICATION_STYLE}
- Their urgency level: {URGENCY_LEVEL}
- Preferred resolution method: {PREFERRED_RESOLUTION}

TASK: Help me craft a response that resolves the issue while maintaining the customer relationship and following company guidelines.`,
    platform: 'claude',
    category: 'customer_service',
    use_case: 'Resolving customer issues with comprehensive context setting',
    expected_output: 'Customer service response that addresses the issue while maintaining relationship and following policy',
    tips: 'Provide detailed context about the customer, issue, and company constraints. This helps balance resolution with policy.',
    order_index: 2,
    difficulty: 'beginner'
  },

  // Lesson 1.2.3: Iterative Prompting
  {
    lesson_title: 'Lesson 1.2.3: Iterative Prompting',
    title: 'Document Review Process',
    description: 'Use iterative prompting to refine document reviews',
    prompt_text: `INITIAL PROMPT:
Help me review this document for accuracy and completeness:

[PASTE YOUR DOCUMENT HERE]

FOLLOW-UP ITERATIONS (use these as the AI responds):

ITERATION 1: "That's helpful, but I need more focus on {SPECIFIC_AREA}. Please provide detailed feedback on that section."

ITERATION 2: "Good analysis. Now check specifically for {SPECIFIC_CRITERIA} and highlight any issues."

ITERATION 3: "The feedback is useful, but format it as a checklist I can use for future document reviews."

ITERATION 4: "Perfect. Now create a summary of the top 3 most critical issues that need immediate attention."

CONTEXT FOR YOUR SITUATION:
- Document type: {DOCUMENT_TYPE}
- Intended audience: {AUDIENCE}
- Key quality criteria: {QUALITY_CRITERIA}
- Compliance requirements: {COMPLIANCE_REQUIREMENTS}
- Deadline: {DEADLINE}

Use this iterative approach to progressively refine the document review until you get exactly what you need.`,
    platform: 'claude',
    category: 'document_review',
    use_case: 'Using iterative prompting to thoroughly review documents with multiple refinements',
    expected_output: 'Progressively refined document review with specific focus areas and actionable feedback',
    tips: 'Start broad, then narrow focus with each iteration. Build on the previous response rather than starting over.',
    order_index: 1,
    difficulty: 'intermediate'
  },
  {
    lesson_title: 'Lesson 1.2.3: Iterative Prompting',
    title: 'Problem-Solving Workflow',
    description: 'Use iterative prompting to solve complex work problems',
    prompt_text: `INITIAL PROMPT:
I'm facing a complex work problem that needs systematic analysis. Here's the situation:

Problem: {DESCRIBE_YOUR_PROBLEM}
Context: {RELEVANT_BACKGROUND}
Constraints: {LIMITATIONS_AND_CONSTRAINTS}

Please help me break this down into manageable components and suggest an approach.

FOLLOW-UP ITERATIONS (use these based on AI responses):

ITERATION 1: "That breakdown is helpful. Now focus on {SPECIFIC_COMPONENT} and provide 3 detailed solution options."

ITERATION 2: "I like option {CHOSEN_OPTION}. Walk me through implementing this step-by-step, including potential obstacles."

ITERATION 3: "Good implementation plan. Now help me anticipate what could go wrong and create contingency plans."

ITERATION 4: "Excellent. Finally, help me create a communication plan to keep stakeholders informed about this solution."

PROBLEM CONTEXT:
- Urgency: {URGENCY_LEVEL}
- Stakeholders: {WHO_IS_AFFECTED}
- Success criteria: {HOW_YOU_MEASURE_SUCCESS}
- Available resources: {RESOURCES_AVAILABLE}

Use this iterative approach to systematically solve your complex work problem.`,
    platform: 'claude',
    category: 'problem_solving',
    use_case: 'Systematically solving complex work problems through iterative analysis and refinement',
    expected_output: 'Comprehensive problem-solving approach with detailed implementation and contingency plans',
    tips: 'Let each iteration build on the previous one. Don\'t jump ahead - work through each step thoroughly.',
    order_index: 2,
    difficulty: 'intermediate'
  }
];

async function seedPrompts() {
  try {
    for (const prompt of prompts) {
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
    
    console.log('\n🎉 All prompts seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding prompts:', error);
  } finally {
    pool.end();
    process.exit(0);
  }
}

seedPrompts();