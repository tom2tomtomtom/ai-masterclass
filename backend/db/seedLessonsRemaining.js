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

const remainingLessons = [
  // Module 1.3: Conversation Management
  {
    module_title: 'Module 1.3: Conversation Management',
    title: 'Lesson 1.3.1: Maintaining Context Across Conversations',
    description: 'Learn to maintain context and build on previous AI responses',
    content: `# Maintaining Context Across Conversations

## Why Context Matters
In professional work, conversations with AI often span multiple interactions. Maintaining context ensures:
- **Consistency**: AI responses align with previous discussions
- **Efficiency**: No need to re-explain background information
- **Quality**: Better responses based on accumulated understanding
- **Continuity**: Smooth workflow across work sessions

## Context Management Strategies

### 1. Conversation Starters
Begin each session by referencing previous work:
\`\`\`
"Continuing from our previous discussion about [PROJECT/TOPIC], 
I now need to [SPECIFIC_TASK]. Here's what we established before:
- [KEY_POINT_1]
- [KEY_POINT_2]
- [KEY_POINT_3]"
\`\`\`

### 2. Reference Previous Decisions
Always mention earlier conclusions:
\`\`\`
"Based on our earlier analysis where we decided [PREVIOUS_DECISION], 
I need help with the next step: [NEW_TASK]"
\`\`\`

### 3. Progress Updates
Keep AI informed of developments:
\`\`\`
"Update: Since our last conversation, [WHAT_HAPPENED]. 
This changes our approach because [IMPACT]. 
Please adjust your recommendations accordingly."
\`\`\`

## Common Context Loss Scenarios

### Scenario 1: Multi-Day Projects
**Problem**: Working on a complex project over several days
**Solution**: Start each session with a brief project summary

### Scenario 2: Iterative Development
**Problem**: Refining ideas through multiple conversations
**Solution**: Reference the evolution of ideas and current status

### Scenario 3: Team Collaboration
**Problem**: Multiple team members using AI for the same project
**Solution**: Share conversation summaries and key decisions

## Best Practices for Context Continuity

### Documentation Strategy
- Keep a running summary of key AI interactions
- Note important decisions and reasoning
- Track what works and what doesn't
- Export important conversations

### Context Refresh Techniques
1. **Quick Summary**: 2-3 sentences about the project status
2. **Key Constraints**: Current limitations or requirements
3. **Recent Changes**: What's different since last interaction
4. **Next Goal**: What you're trying to accomplish now`,
    order_index: 1,
    estimated_minutes: 30,
    lesson_type: 'concept',
    difficulty: 'intermediate',
    learning_objectives: [
      'Maintain context across multiple AI conversations',
      'Reference previous decisions effectively',
      'Build continuity in long-term projects'
    ],
    platform_focus: 'mixed'
  },
  {
    module_title: 'Module 1.3: Conversation Management',
    title: 'Lesson 1.3.2: Multi-Turn Conversation Strategies',
    description: 'Master advanced techniques for extended AI conversations',
    content: `# Multi-Turn Conversation Strategies

## The Art of Extended AI Dialogue
Professional work often requires extended conversations to fully develop ideas, solve complex problems, or create comprehensive solutions. Mastering multi-turn strategies improves outcomes significantly.

## Strategic Conversation Patterns

### 1. The Funnel Approach
Start broad, then narrow focus:
- **Turn 1**: "Help me understand [BROAD_TOPIC]"
- **Turn 2**: "Focus specifically on [NARROW_ASPECT]"
- **Turn 3**: "Now help me solve [SPECIFIC_PROBLEM]"
- **Turn 4**: "Create actionable steps for [SOLUTION]"

### 2. The Building Block Method
Each turn builds on the previous:
- **Turn 1**: Establish foundation
- **Turn 2**: Add layer of complexity
- **Turn 3**: Integrate new elements
- **Turn 4**: Synthesize complete solution

### 3. The Expert Panel Approach
Use different "expert" perspectives:
- **Turn 1**: "As a [ROLE_1], what do you think about..."
- **Turn 2**: "Now, as a [ROLE_2], how would you approach..."
- **Turn 3**: "Combining both perspectives, recommend..."

## Advanced Conversation Techniques

### Guided Discovery
Let AI help you explore options:
\`\`\`
"I'm facing [CHALLENGE]. Rather than jumping to solutions, 
help me first understand:
1. What are the underlying causes?
2. What factors should I consider?
3. What are my options?

Then we'll work together to evaluate the best approach."
\`\`\`

### Iterative Refinement
Use feedback loops to improve:
\`\`\`
"That's a good start. Now refine it by:
- Making it more specific to [CONTEXT]
- Adding consideration for [CONSTRAINT]
- Adjusting the tone for [AUDIENCE]"
\`\`\`

### Devil's Advocate Testing
Challenge ideas to strengthen them:
\`\`\`
"Play devil's advocate with this proposal:
- What could go wrong?
- What am I not considering?
- How would a skeptic respond?
- What evidence would strengthen this?"
\`\`\`

## Managing Long Conversations

### Conversation Checkpoints
Regularly summarize progress:
- "Let me summarize what we've established so far..."
- "The key insights from our discussion are..."
- "Before we continue, let's confirm we agree on..."

### Topic Transitions
Smooth transitions between related topics:
- "Building on that point, let's now consider..."
- "That raises an important related question..."
- "Now that we've covered X, let's explore Y..."

### Conversation Closure
End productively:
- "Summarize the key actionable insights from our discussion"
- "What are the most important next steps?"
- "What should I prioritize from everything we've covered?"`,
    order_index: 2,
    estimated_minutes: 35,
    lesson_type: 'tutorial',
    difficulty: 'intermediate',
    learning_objectives: [
      'Plan and structure extended AI conversations',
      'Use strategic conversation patterns',
      'Manage complex multi-turn dialogues effectively'
    ],
    platform_focus: 'mixed'
  },
  {
    module_title: 'Module 1.3: Conversation Management',
    title: 'Lesson 1.3.3: Building Complex Solutions Through Dialogue',
    description: 'Use conversation to develop comprehensive solutions to work challenges',
    content: `# Building Complex Solutions Through Dialogue

## The Collaborative Problem-Solving Approach
Rather than asking AI for complete solutions, use dialogue to build better answers together. This approach leverages AI's analytical capabilities while maintaining human judgment and creativity.

## The Solution Development Framework

### Phase 1: Problem Exploration
**Goal**: Thoroughly understand the challenge
\`\`\`
"I'm facing a complex challenge: [BRIEF_DESCRIPTION]

Before we develop solutions, help me fully understand this problem:
1. What are all the factors I should consider?
2. Who are the stakeholders affected?
3. What constraints or limitations exist?
4. What would success look like?
5. What similar problems exist that might inform our approach?"
\`\`\`

### Phase 2: Option Generation
**Goal**: Develop multiple potential approaches
\`\`\`
"Based on our analysis, let's brainstorm solution approaches:
- Generate 5 different ways to address this challenge
- Consider both incremental and transformational options
- Include approaches that address root causes vs. symptoms
- Think about short-term and long-term solutions"
\`\`\`

### Phase 3: Solution Evaluation
**Goal**: Assess options systematically
\`\`\`
"Let's evaluate these options using these criteria:
- Feasibility given our constraints
- Potential impact on stakeholders
- Resource requirements
- Risk factors
- Timeline for implementation
- Measurable success indicators

Create a comparison matrix showing how each option performs."
\`\`\`

### Phase 4: Implementation Planning
**Goal**: Develop actionable next steps
\`\`\`
"For our chosen approach, help me create:
- Detailed implementation steps
- Timeline with milestones
- Resource requirements
- Risk mitigation strategies
- Success metrics and monitoring plan
- Communication plan for stakeholders"
\`\`\`

## Advanced Dialogue Techniques

### The "What If" Exploration
Test scenarios and assumptions:
\`\`\`
"What if [ASSUMPTION] turns out to be wrong?"
"What if we had [DIFFERENT_CONSTRAINT]?"
"What if [STAKEHOLDER] doesn't support this?"
"What if we get twice the budget/half the time?"
\`\`\`

### The Perspective Shift
View problems from different angles:
\`\`\`
"How would [DIFFERENT_ROLE] view this problem?"
"What would [COMPETITOR/EXPERT] do in this situation?"
"If this were [DIFFERENT_INDUSTRY], how would they approach it?"
"What would we do if this were 10x bigger/smaller?"
\`\`\`

### The Constraint Relaxation
Explore beyond current limitations:
\`\`\`
"If we had unlimited resources, what would the ideal solution look like?"
"What if we could change [FIXED_CONSTRAINT]?"
"What would we do if we started from scratch?"
"How would we approach this with future technology?"
\`\`\`

## Quality Assurance Through Dialogue

### Solution Stress Testing
\`\`\`
"Let's stress-test this solution:
- What are the weakest points?
- Where might it fail under pressure?
- What external factors could derail it?
- How robust is it to changing conditions?"
\`\`\`

### Implementation Reality Check
\`\`\`
"Thinking practically about implementation:
- What political challenges might we face?
- What could go wrong during rollout?
- What skills or resources are we missing?
- What would make this fail despite good planning?"
\`\`\`

### Success Measurement Design
\`\`\`
"Help me design measurement for this solution:
- What metrics will show we're succeeding?
- How will we know if we need to adjust course?
- What early warning signs should we watch for?
- How will we measure both intended and unintended consequences?"
\`\`\``,
    order_index: 3,
    estimated_minutes: 40,
    lesson_type: 'tutorial',
    difficulty: 'advanced',
    learning_objectives: [
      'Build complex solutions through structured dialogue',
      'Use AI as a collaborative problem-solving partner',
      'Apply systematic approaches to solution development'
    ],
    platform_focus: 'claude'
  },
  {
    module_title: 'Module 1.3: Conversation Management',
    title: 'Lesson 1.3.4: Managing AI Memory and Context Limits',
    description: 'Work effectively within AI context limitations',
    content: `# Managing AI Memory and Context Limits

## Understanding AI Memory Limitations
AI models have finite "memory" within each conversation. Understanding and working with these limitations is crucial for professional use.

## How AI Context Works

### Context Windows
- **What it is**: The amount of text AI can "remember" in a conversation
- **Typical sizes**: 8,000-100,000+ tokens (roughly 6,000-75,000+ words)
- **What happens**: Older parts of conversation get "forgotten" as new content is added
- **Professional impact**: Long conversations may lose important earlier context

### Token Management
Tokens include:
- Your prompts and questions
- AI responses
- System instructions
- All conversation history

### Signs of Context Limit Issues
- AI seems to "forget" earlier decisions
- Responses become less relevant to your project
- AI asks for information you already provided
- Quality of responses decreases over time

## Strategies for Context Management

### 1. Conversation Chunking
Break long projects into focused sessions:
\`\`\`
Session 1: Problem analysis and requirements
Session 2: Solution brainstorming and evaluation
Session 3: Implementation planning
Session 4: Risk assessment and mitigation
\`\`\`

### 2. Context Summarization
Regularly compress conversation history:
\`\`\`
"Before we continue, please summarize the key points we've established:
- Main objectives and constraints
- Decisions we've made and why
- Current status and next steps
- Important considerations to remember"
\`\`\`

### 3. Information Distillation
Extract and preserve essential information:
\`\`\`
"Create a reference document from our conversation containing:
- Project overview and goals
- Key requirements and constraints
- Approved approaches and rejected alternatives
- Action items and responsible parties
- Success criteria and metrics"
\`\`\`

## Advanced Context Strategies

### Context Refresh Technique
Start new sessions with concentrated context:
\`\`\`
"Context: I'm working on [PROJECT] with these key parameters:
- Objective: [CLEAR_GOAL]
- Constraints: [KEY_LIMITATIONS]
- Stakeholders: [WHO_IS_INVOLVED]
- Current status: [WHERE_WE_ARE]
- Previous decisions: [KEY_CONCLUSIONS]

Now I need help with: [SPECIFIC_CURRENT_TASK]"
\`\`\`

### Progressive Context Building
Layer context gradually in new conversations:
- **Layer 1**: Basic project context
- **Layer 2**: Key requirements and constraints
- **Layer 3**: Previous analysis and decisions
- **Layer 4**: Current specific challenge

### Context Handoff Documentation
Create handoff summaries for team use:
\`\`\`
"Create a handoff document that would allow a new team member to:
- Understand the project context
- Continue from where we left off
- Know what's been decided and why
- Have access to key insights and recommendations"
\`\`\`

## Platform-Specific Context Management

### Claude
- Excellent at maintaining context within sessions
- Good at following complex instructions across turns
- Benefits from explicit context reminders

### ChatGPT
- Strong conversational flow
- May need more frequent context refreshers
- Good at building on previous responses

### Gemini
- Effective at factual context maintenance
- Benefits from structured context organization
- Good at handling multimodal context (text + images)

## Best Practices for Long-Term Projects

### Documentation Strategy
- Export important conversation summaries
- Maintain a project knowledge base
- Track key decisions and rationale
- Update context documents regularly

### Session Planning
- Define session objectives upfront
- Allocate context "budget" for background vs. new work
- Plan logical conversation breakpoints
- Prepare context summaries for future sessions

### Quality Monitoring
- Watch for signs of context degradation
- Test AI understanding periodically
- Refresh context when quality drops
- Start new conversations for major topic shifts`,
    order_index: 4,
    estimated_minutes: 30,
    lesson_type: 'concept',
    difficulty: 'advanced',
    learning_objectives: [
      'Understand AI context and memory limitations',
      'Manage long conversations effectively',
      'Preserve important context across sessions'
    ],
    platform_focus: 'mixed'
  },

  // Module 1.4: Practical Applications
  {
    module_title: 'Module 1.4: Practical Applications',
    title: 'Lesson 1.4.1: Meeting Management Automation',
    description: 'Apply AI to solve real meeting management challenges',
    content: `# Meeting Management Automation

## The Meeting Management Challenge
Most professionals spend 15-30% of their time in meetings, yet poor meeting management creates inefficiency, frustration, and wasted resources. AI can dramatically improve meeting effectiveness.

## Common Meeting Problems AI Can Solve
1. **Double bookings and scheduling conflicts**
2. **Meetings without clear agendas or objectives**
3. **Poor preparation leading to ineffective discussions**
4. **Action items that get lost or ignored**
5. **Inconsistent follow-up and accountability**

## AI-Powered Meeting Solutions

### 1. Pre-Meeting Optimization
**Schedule Conflict Detection**
\`\`\`
"Analyze this week's calendar and identify:
- Potential double bookings or conflicts
- Back-to-back meetings with no buffer time
- Meetings scheduled during typical focus work hours
- Opportunities to batch similar meetings together

Calendar data: [PASTE_CALENDAR_ENTRIES]

Suggest optimal rescheduling to improve productivity."
\`\`\`

**Agenda Generation**
\`\`\`
"Create a comprehensive meeting agenda for:
- Meeting purpose: [SPECIFIC_OBJECTIVE]
- Duration: [TIME_AVAILABLE]
- Attendees: [LIST_WITH_ROLES]
- Background: [RELEVANT_CONTEXT]

Include:
- Time-allocated discussion items
- Clear decision points
- Pre-meeting preparation requirements
- Expected outcomes and deliverables"
\`\`\`

### 2. During-Meeting Support
**Real-Time Structure**
\`\`\`
"I'm in a meeting about [TOPIC] and we're getting off track. 
Help me redirect the conversation by:
- Suggesting a polite way to refocus on [MAIN_OBJECTIVE]
- Providing 3 key questions to drive toward decisions
- Creating a parking lot summary for off-topic items"
\`\`\`

**Decision Facilitation**
\`\`\`
"We're discussing [DECISION_POINT] and have these options:
[LIST_OPTIONS]

Help facilitate decision-making by:
- Clarifying the criteria for evaluation
- Highlighting key trade-offs
- Suggesting a decision-making framework
- Identifying what information we need to decide"
\`\`\`

### 3. Post-Meeting Excellence
**Action Item Processing**
\`\`\`
"Process these meeting notes into clear action items:
[PASTE_RAW_NOTES]

For each action item, specify:
- Specific, measurable task
- Responsible person
- Due date
- Success criteria
- Dependencies on other tasks
- Required resources or support"
\`\`\`

**Follow-Up Communication**
\`\`\`
"Create a meeting follow-up email that:
- Summarizes key decisions made
- Lists all action items with owners and dates
- Highlights any issues that need escalation
- Includes next meeting date/agenda if applicable

Meeting context: [BRIEF_MEETING_SUMMARY]
Tone: Professional but friendly
Recipients: [ATTENDEE_TYPES]"
\`\`\`

## Advanced Meeting AI Applications

### Meeting Effectiveness Analysis
\`\`\`
"Analyze this series of meeting notes and identify:
- Recurring issues or bottlenecks
- Decisions that keep getting revisited
- Topics that consistently run over time
- Participants who need more/less involvement

Meeting notes: [SERIES_OF_MEETING_SUMMARIES]

Recommend improvements to our meeting process."
\`\`\`

### Strategic Meeting Planning
\`\`\`
"Help me design a meeting series to accomplish [LARGE_OBJECTIVE]:
- Break down into logical meeting sequence
- Identify key decision points and milestones
- Suggest optimal participants for each session
- Create preparation requirements and materials
- Design success metrics for the overall process"
\`\`\`

### Meeting ROI Optimization
\`\`\`
"Evaluate the cost-effectiveness of our recurring meetings:

Meeting details:
- [MEETING_TYPE]: [FREQUENCY], [DURATION], [ATTENDEE_COUNT]
- [MEETING_TYPE]: [FREQUENCY], [DURATION], [ATTENDEE_COUNT]

Calculate:
- Time cost based on [AVERAGE_HOURLY_RATE]
- Value delivered in terms of decisions/progress
- Opportunities to reduce time or participants
- Alternative approaches (async, smaller groups, etc.)"
\`\`\`

## Implementation Roadmap

### Week 1: Foundation
- Implement agenda templates for recurring meetings
- Create action item tracking system
- Establish meeting preparation standards

### Week 2: Optimization
- Analyze current meeting effectiveness
- Implement scheduling optimization
- Create meeting quality feedback loops

### Week 3: Advanced Features
- Deploy automated follow-up systems
- Implement meeting ROI tracking
- Create cross-team meeting coordination

### Week 4: Refinement
- Gather feedback and adjust processes
- Train team on new meeting standards
- Measure and report improvements

## Measuring Success
- **Preparation Quality**: % of meetings with proper agendas
- **Action Item Completion**: % of tasks completed on time
- **Meeting Satisfaction**: Participant feedback scores
- **Time Efficiency**: Average meeting duration vs. scheduled time
- **Decision Velocity**: Time from discussion to decision
- **Follow-Through**: % of decisions that lead to action`,
    order_index: 1,
    estimated_minutes: 45,
    lesson_type: 'practice',
    difficulty: 'intermediate',
    learning_objectives: [
      'Apply AI to solve meeting management problems',
      'Create systematic meeting improvement processes',
      'Measure and optimize meeting effectiveness'
    ],
    platform_focus: 'mixed'
  },
  {
    module_title: 'Module 1.4: Practical Applications',
    title: 'Lesson 1.4.2: Email and Communication Optimization',
    description: 'Transform your professional communication with AI assistance',
    content: `# Email and Communication Optimization

## The Communication Challenge
Professionals spend 20-30% of their workweek managing email and other communications. Poor communication leads to misunderstandings, delays, and relationship damage. AI can dramatically improve communication effectiveness.

## AI-Enhanced Communication Strategy

### 1. Email Efficiency Transformation
**Inbox Processing**
\`\`\`
"Help me process this batch of emails efficiently:

[PASTE_EMAIL_SUBJECTS_AND_SENDERS]

Categorize each email by:
- Action required (response, task, escalation, filing)
- Urgency level (immediate, today, this week, when convenient)
- Time estimate for proper response
- Suggested processing order for maximum efficiency"
\`\`\`

**Response Optimization**
\`\`\`
"Improve this email response for clarity and professionalism:

Original email: [PASTE_EMAIL_RECEIVED]
My draft response: [PASTE_YOUR_DRAFT]

Please:
- Ensure all questions are answered clearly
- Improve tone for [RELATIONSHIP_TYPE]
- Add any missing context or next steps
- Optimize for the recipient's communication style"
\`\`\`

### 2. Message Crafting Excellence
**Professional Email Templates**
\`\`\`
"Create an email template for [EMAIL_TYPE]:
- Purpose: [SPECIFIC_COMMUNICATION_GOAL]
- Audience: [RECIPIENT_DESCRIPTION]
- Tone: [PROFESSIONAL_RELATIONSHIP_LEVEL]
- Key information to include: [ESSENTIAL_POINTS]
- Desired action from recipient: [SPECIFIC_REQUEST]

Make it reusable with placeholders for customization."
\`\`\`

**Difficult Conversation Management**
\`\`\`
"Help me write a diplomatic email addressing this sensitive situation:
- Issue: [PROBLEM_DESCRIPTION]
- Recipient: [PERSON_AND_RELATIONSHIP]
- My goals: [DESIRED_OUTCOMES]
- Constraints: [WHAT_I_CAN'T_SAY_OR_DO]
- Context: [RELEVANT_BACKGROUND]

Create a message that addresses the issue while maintaining the relationship."
\`\`\`

### 3. Communication Strategy Development
**Stakeholder Communication Planning**
\`\`\`
"Design a communication strategy for this project:
- Project: [BRIEF_DESCRIPTION]
- Stakeholders: [LIST_WITH_INTERESTS_AND_INFLUENCE]
- Timeline: [DURATION_AND_MILESTONES]
- Potential challenges: [ANTICIPATED_ISSUES]

Create:
- Communication schedule and frequency for each stakeholder
- Key messages for different phases
- Escalation communication protocols
- Success metrics for communication effectiveness"
\`\`\`

**Message Sequencing**
\`\`\`
"I need to communicate [COMPLEX_SITUATION] to multiple stakeholders.
Help me sequence the communications:

Stakeholders: [LIST_WITH_RELATIONSHIPS]
Situation: [DETAILED_CONTEXT]

Design:
- Optimal order for sharing information
- Timing between communications
- Customized messages for each audience
- Coordination to prevent mixed messages"
\`\`\`

## Advanced Communication Applications

### Cross-Cultural Communication
\`\`\`
"Adapt this message for [CULTURAL_CONTEXT]:
Original message: [YOUR_MESSAGE]
Recipient culture: [SPECIFIC_CULTURE_OR_REGION]
Business context: [FORMAL/INFORMAL_RELATIONSHIP]

Adjust for:
- Cultural communication preferences
- Appropriate level of directness
- Relationship-building elements
- Potential misunderstandings to avoid"
\`\`\`

### Crisis Communication
\`\`\`
"Help me craft crisis communication for this situation:
- Crisis: [PROBLEM_DESCRIPTION]
- Impact: [WHO_IS_AFFECTED_AND_HOW]
- Our response: [WHAT_WE'RE_DOING]
- Timeline: [WHEN_RESOLUTION_EXPECTED]

Create messages for:
- Internal team notification
- Customer communication
- Leadership briefing
- External stakeholder update

Each should be appropriately detailed and toned for the audience."
\`\`\`

### Communication Analytics
\`\`\`
"Analyze my communication patterns and suggest improvements:

Recent email data:
- Average response time: [TIME]
- Common email types: [LIST]
- Frequent recipients: [ROLES]
- Communication challenges: [ISSUES_I_FACE]

Identify:
- Opportunities to streamline communications
- Templates I should create
- Process improvements
- Skills I should develop"
\`\`\`

## Implementation Framework

### Phase 1: Foundation (Week 1)
- Create email processing system
- Develop core message templates
- Establish communication standards

### Phase 2: Optimization (Week 2)
- Implement response time improvement
- Deploy difficult conversation protocols
- Create stakeholder communication templates

### Phase 3: Advanced Applications (Week 3)
- Add cross-cultural adaptation capabilities
- Implement crisis communication protocols
- Deploy communication analytics

### Phase 4: Mastery (Week 4)
- Fine-tune all systems based on results
- Train team on new communication standards
- Establish ongoing improvement processes

## Communication Quality Metrics

### Efficiency Measures
- **Response Time**: Average time to respond to communications
- **Email Volume**: Reduction in back-and-forth exchanges
- **Processing Speed**: Time to clear inbox daily

### Effectiveness Measures
- **Clarity**: Recipient understanding (measured through follow-up questions)
- **Action Rate**: % of emails that generate desired response
- **Relationship Quality**: Stakeholder satisfaction with communications

### Professional Impact
- **Project Communication**: On-time delivery of project communications
- **Stakeholder Engagement**: Level of stakeholder participation and buy-in
- **Crisis Response**: Speed and effectiveness of crisis communications`,
    order_index: 2,
    estimated_minutes: 40,
    lesson_type: 'practice',
    difficulty: 'intermediate',
    learning_objectives: [
      'Optimize email and communication workflows',
      'Create professional communication templates',
      'Develop strategic communication approaches'
    ],
    platform_focus: 'mixed'
  },
  {
    module_title: 'Module 1.4: Practical Applications',
    title: 'Lesson 1.4.3: Document Creation and Review',
    description: 'Use AI to create, review, and improve professional documents',
    content: `# Document Creation and Review

## The Document Quality Challenge
Professional documents represent your expertise and attention to detail. Poor documents damage credibility, create confusion, and waste time. AI can elevate document quality while reducing creation time.

## AI-Powered Document Creation

### 1. Strategic Document Planning
**Document Architecture**
\`\`\`
"Help me plan a comprehensive [DOCUMENT_TYPE] for [PURPOSE]:

Context:
- Audience: [PRIMARY_AND_SECONDARY_READERS]
- Objective: [WHAT_DOCUMENT_SHOULD_ACCOMPLISH]
- Scope: [WHAT_TO_INCLUDE_AND_EXCLUDE]
- Constraints: [LENGTH_TIMELINE_FORMAT_REQUIREMENTS]

Create:
- Logical document outline with sections and subsections
- Key points to cover in each section
- Appropriate level of detail for each audience
- Quality criteria for evaluating success"
\`\`\`

**Content Strategy Development**
\`\`\`
"Design a content strategy for this [DOCUMENT_TYPE]:
- Main message: [CORE_ARGUMENT_OR_INFORMATION]
- Supporting evidence: [AVAILABLE_DATA_AND_SOURCES]
- Audience concerns: [WHAT_READERS_CARE_ABOUT]
- Desired outcome: [WHAT_SHOULD_HAPPEN_AFTER_READING]

Recommend:
- Narrative flow that builds to conclusion
- Evidence placement for maximum impact
- Potential objections and how to address them
- Call-to-action strategy"
\`\`\`

### 2. Content Development Excellence
**Section Writing Assistance**
\`\`\`
"Help me write the [SECTION_NAME] section of my [DOCUMENT_TYPE]:

Section purpose: [WHAT_THIS_SECTION_SHOULD_ACCOMPLISH]
Key points to cover:
- [POINT_1]
- [POINT_2]
- [POINT_3]

Available information: [RELEVANT_DATA_OR_CONTEXT]
Target length: [WORD_COUNT_OR_PAGE_LIMIT]
Tone: [PROFESSIONAL_LEVEL_AND_STYLE]

Create compelling content that flows logically and supports the overall document objectives."
\`\`\`

**Technical Translation**
\`\`\`
"Translate this technical content for [TARGET_AUDIENCE]:

Technical content: [PASTE_TECHNICAL_INFORMATION]
Current audience level: [EXPERT/TECHNICAL_PROFESSIONAL]
Target audience: [BUSINESS_EXECUTIVES/GENERAL_AUDIENCE/ETC]

Adjust:
- Technical jargon to accessible language
- Level of detail appropriate for audience
- Focus on business impact rather than technical details
- Examples that resonate with target audience"
\`\`\`

### 3. Document Review and Improvement
**Comprehensive Quality Review**
\`\`\`
"Perform a comprehensive review of this document:

[PASTE_DOCUMENT_OR_SECTION]

Evaluate:
- Clarity and logical flow
- Completeness of information
- Appropriateness for intended audience
- Grammar, style, and professional presentation
- Persuasiveness and impact

Provide specific recommendations for improvement."
\`\`\`

**Audience-Specific Optimization**
\`\`\`
"Optimize this document for [SPECIFIC_AUDIENCE]:

Document: [PASTE_CONTENT]
Audience details:
- Role/position: [DECISION_MAKERS/IMPLEMENTERS/ETC]
- Knowledge level: [EXPERT/INTERMEDIATE/NOVICE]
- Primary concerns: [WHAT_THEY_CARE_ABOUT]
- Decision criteria: [HOW_THEY_EVALUATE_PROPOSALS]

Adjust content, tone, and structure to maximize effectiveness with this audience."
\`\`\`

## Advanced Document Applications

### Collaborative Document Development
\`\`\`
"Help coordinate document development with multiple contributors:

Document: [DOCUMENT_TYPE_AND_PURPOSE]
Contributors:
- [NAME/ROLE]: Responsible for [SECTIONS/EXPERTISE]
- [NAME/ROLE]: Responsible for [SECTIONS/EXPERTISE]

Create:
- Clear section assignments and requirements
- Quality standards and style guidelines
- Review and integration timeline
- Conflict resolution process for disagreements"
\`\`\`

### Document Series Coordination
\`\`\`
"Plan a coordinated series of documents for [OVERALL_OBJECTIVE]:

Documents needed:
- [DOCUMENT_1]: [PURPOSE_AND_AUDIENCE]
- [DOCUMENT_2]: [PURPOSE_AND_AUDIENCE]
- [DOCUMENT_3]: [PURPOSE_AND_AUDIENCE]

Ensure:
- Consistent messaging across all documents
- Appropriate level of detail for each audience
- Logical sequence and cross-references
- Unified branding and style"
\`\`\`

### Document Impact Analysis
\`\`\`
"Analyze the potential impact and effectiveness of this document:

Document: [PASTE_DOCUMENT_OR_SUMMARY]
Context: [HOW_IT_WILL_BE_USED]
Stakeholders: [WHO_WILL_READ_AND_ACT_ON_IT]

Predict:
- Likely reader reactions and questions
- Potential implementation challenges
- Areas where additional support materials might be needed
- Success metrics for measuring document effectiveness"
\`\`\`

## Specialized Document Types

### Proposal Development
\`\`\`
"Create a winning proposal structure for [OPPORTUNITY]:
- Requirement: [WHAT_THEY_WANT]
- Our solution: [WHAT_WE_OFFER]
- Competition: [WHO_WE'RE_COMPETING_AGAINST]
- Evaluation criteria: [HOW_THEY'LL_DECIDE]

Design proposal that:
- Clearly addresses all requirements
- Highlights our unique value proposition
- Anticipates and addresses concerns
- Creates compelling case for selection"
\`\`\`

### Policy and Procedure Documentation
\`\`\`
"Transform this process into clear policy documentation:

Current process: [DESCRIBE_HOW_THINGS_WORK_NOW]
Stakeholders: [WHO_IS_INVOLVED]
Compliance requirements: [RELEVANT_REGULATIONS_OR_STANDARDS]
Pain points: [CURRENT_PROBLEMS_TO_ADDRESS]

Create documentation that:
- Provides clear, step-by-step procedures
- Defines roles and responsibilities
- Includes decision trees for complex situations
- Addresses compliance and quality requirements"
\`\`\`

### Executive Communication
\`\`\`
"Create executive-level summary of this detailed information:

Detailed content: [PASTE_FULL_INFORMATION]
Executive audience: [C-LEVEL/VP-LEVEL/BOARD]
Decision needed: [WHAT_THEY_NEED_TO_DECIDE]
Timeline: [WHEN_DECISION_IS_NEEDED]

Create one-page summary that:
- Leads with recommendation and rationale
- Provides essential context without unnecessary detail
- Highlights key risks and opportunities
- Includes clear next steps and timeline"
\`\`\`

## Document Quality Assurance

### Pre-Publication Checklist
- **Content Accuracy**: Facts, figures, and references verified
- **Audience Alignment**: Appropriate detail and tone for readers
- **Logical Flow**: Ideas build logically toward conclusion
- **Professional Presentation**: Grammar, formatting, and style
- **Completeness**: All required information included
- **Actionability**: Clear next steps for readers

### Success Metrics
- **Reader Comprehension**: Feedback on clarity and understanding
- **Action Generation**: % of readers who take desired actions
- **Efficiency**: Time saved in document creation process
- **Quality**: Reduction in revisions and clarification requests
- **Professional Impact**: Enhanced credibility and influence`,
    order_index: 3,
    estimated_minutes: 35,
    lesson_type: 'practice',
    difficulty: 'intermediate',
    learning_objectives: [
      'Create high-quality professional documents with AI assistance',
      'Develop systematic document review processes',
      'Optimize documents for specific audiences and purposes'
    ],
    platform_focus: 'claude'
  },
  {
    module_title: 'Module 1.4: Practical Applications',
    title: 'Lesson 1.4.4: Level 1 Capstone Project',
    description: 'Apply all Level 1 skills to solve a comprehensive workplace challenge',
    content: `# Level 1 Capstone Project: Complete Workplace AI Integration

## Project Overview
This capstone project integrates all Level 1 skills to solve a comprehensive workplace challenge. You'll demonstrate mastery of AI fundamentals, prompting techniques, conversation management, and practical applications.

## Project Objectives
By completing this capstone, you will:
- **Apply integrated AI skills** to a real workplace challenge
- **Demonstrate systematic problem-solving** using AI assistance
- **Create reusable processes** for ongoing AI integration
- **Measure and document** the impact of AI adoption
- **Develop expertise** that can be shared with colleagues

## Capstone Challenge Selection
Choose ONE comprehensive challenge from your actual work environment:

### Option A: Process Optimization Challenge
Transform an inefficient workplace process using AI:
- **Example processes**: Employee onboarding, expense approval, project status reporting, customer support ticketing
- **Requirements**: Current process takes significant time, involves multiple people, has quality issues
- **Deliverable**: Redesigned process with AI integration points

### Option B: Communication Excellence Challenge  
Solve a persistent communication problem using AI:
- **Example problems**: Meeting effectiveness, stakeholder updates, cross-team coordination, customer communication
- **Requirements**: Current communication creates confusion, delays, or relationship issues
- **Deliverable**: Communication system with AI-powered templates and workflows

### Option C: Decision Support Challenge
Create an AI-powered decision support system for complex choices:
- **Example decisions**: Vendor selection, resource allocation, strategic planning, risk assessment
- **Requirements**: Decisions currently take too long, lack systematic analysis, or have inconsistent quality
- **Deliverable**: Decision framework with AI analysis and recommendation processes

## Capstone Project Framework

### Phase 1: Comprehensive Analysis (Week 1)
**Challenge Definition**
\`\`\`
"Help me thoroughly analyze this workplace challenge:

Current situation:
- Process/problem description: [DETAILED_DESCRIPTION]
- Stakeholders involved: [WHO_IS_AFFECTED]
- Current approach: [HOW_IT_WORKS_NOW]
- Pain points: [SPECIFIC_PROBLEMS]
- Success criteria: [WHAT_IMPROVEMENT_LOOKS_LIKE]

Business context:
- Department/team: [ORGANIZATIONAL_CONTEXT]
- Volume/frequency: [HOW_OFTEN_THIS_OCCURS]
- Resource constraints: [LIMITATIONS_TO_CONSIDER]
- Compliance requirements: [REGULATORY_OR_POLICY_CONSTRAINTS]

Provide comprehensive analysis including:
1. Root cause analysis of current problems
2. Stakeholder impact assessment
3. Opportunity identification for AI integration
4. Risk factors and mitigation strategies
5. Success metrics and measurement approach"
\`\`\`

### Phase 2: Solution Architecture (Week 2)
**AI Integration Design**
\`\`\`
"Design a comprehensive AI-powered solution for this challenge:

Challenge context: [SUMMARY_FROM_PHASE_1]
Available AI tools: [CLAUDE_CHATGPT_GEMINI_OTHERS]
Technical constraints: [SYSTEM_LIMITATIONS]
User skill levels: [TEAM_AI_EXPERIENCE]

Create solution architecture including:
1. Specific AI integration points in the workflow
2. Custom prompts and templates for each use case
3. Quality assurance and validation processes
4. Training requirements for team members
5. Implementation timeline and milestones
6. Success measurement and monitoring plan"
\`\`\```

### Phase 3: Pilot Implementation (Week 3)
**Controlled Testing**
\`\`\`
"Help me plan and execute a pilot test of this AI solution:

Solution design: [SUMMARY_FROM_PHASE_2]
Pilot scope: [WHAT_WILL_BE_TESTED]
Pilot participants: [WHO_WILL_BE_INVOLVED]
Test duration: [TIMELINE]

Create pilot plan including:
1. Specific scenarios to test
2. Data collection and feedback mechanisms
3. Comparison metrics (before vs. during pilot)
4. Risk management for pilot period
5. Documentation requirements
6. Go/no-go criteria for full implementation"
\`\`\`

### Phase 4: Refinement and Scale (Week 4)
**Solution Optimization**
\`\`\`
"Based on pilot results, help me refine and scale this solution:

Pilot results:
- What worked well: [SUCCESSES]
- What needed improvement: [CHALLENGES]
- Unexpected outcomes: [SURPRISES]
- User feedback: [STAKEHOLDER_RESPONSES]

Metrics achieved:
- Efficiency gains: [TIME_SAVINGS_OR_QUALITY_IMPROVEMENTS]
- User satisfaction: [FEEDBACK_SCORES]
- Business impact: [MEASURABLE_RESULTS]

Create final implementation plan including:
1. Refined solution based on pilot learnings
2. Change management strategy for full rollout
3. Training and support materials
4. Ongoing monitoring and improvement processes
5. Documentation for replication in other areas"
\`\`\`

## Deliverables and Documentation

### 1. Comprehensive Project Report
Document your complete AI integration journey:
- **Executive Summary**: Business impact and recommendations
- **Challenge Analysis**: Problem definition and root causes
- **Solution Design**: AI integration architecture and rationale
- **Implementation Results**: Pilot outcomes and measurements
- **Lessons Learned**: What worked, what didn't, and why
- **Future Recommendations**: Next steps and scaling opportunities

### 2. Reusable AI Asset Library
Create assets others can use:
- **Prompt Templates**: Customizable prompts for similar challenges
- **Process Documentation**: Step-by-step AI integration workflows
- **Training Materials**: Guides for teaching others your approach
- **Quality Checklists**: Validation criteria for AI outputs

### 3. Impact Measurement Dashboard
Quantify the value of AI integration:
- **Efficiency Metrics**: Time savings, error reduction, throughput improvement
- **Quality Metrics**: Accuracy, consistency, stakeholder satisfaction
- **Business Metrics**: Cost savings, revenue impact, competitive advantage
- **Learning Metrics**: Skill development, knowledge transfer, capability building

## Success Criteria
Your capstone project demonstrates mastery when you achieve:

### Technical Mastery
- [ ] **AI Tool Proficiency**: Effective use of multiple AI platforms
- [ ] **Prompt Engineering**: Sophisticated, context-aware prompts
- [ ] **Conversation Management**: Complex, multi-turn problem-solving
- [ ] **Quality Assurance**: Validation and verification of AI outputs

### Business Impact
- [ ] **Problem Solving**: Measurable improvement to workplace challenge
- [ ] **Process Innovation**: Demonstrable workflow enhancement
- [ ] **Stakeholder Value**: Clear benefits to people affected by the solution
- [ ] **Scalability**: Potential for replication and expansion

### Professional Development
- [ ] **Systematic Approach**: Structured methodology for AI integration
- [ ] **Documentation**: Clear, actionable documentation for others
- [ ] **Knowledge Transfer**: Ability to teach approach to colleagues
- [ ] **Continuous Improvement**: Framework for ongoing optimization

## Capstone Presentation
Conclude your Level 1 experience by presenting your project:
- **Problem and Solution Overview** (5 minutes)
- **AI Integration Demonstration** (10 minutes)
- **Results and Impact Analysis** (10 minutes)
- **Lessons Learned and Recommendations** (5 minutes)
- **Q&A and Discussion** (10 minutes)

This capstone project establishes you as an AI-capable professional ready to tackle complex challenges and lead AI adoption in your organization.`,
    order_index: 4,
    estimated_minutes: 120,
    lesson_type: 'project',
    difficulty: 'advanced',
    learning_objectives: [
      'Integrate all Level 1 AI skills in a comprehensive project',
      'Demonstrate systematic AI problem-solving approach',
      'Create measurable business impact through AI adoption',
      'Develop reusable processes and documentation for team use'
    ],
    platform_focus: 'mixed'
  }
];

async function seedRemainingLessons() {
  try {
    for (const lesson of remainingLessons) {
      // Get module ID from title
      const { rows: moduleRows } = await pool.query(
        'SELECT id FROM modules WHERE title = $1',
        [lesson.module_title]
      );
      
      if (moduleRows.length > 0) {
        const moduleId = moduleRows[0].id;
        
        await pool.query(
          'INSERT INTO lessons (module_id, title, description, content, order_index, estimated_minutes, lesson_type, difficulty, learning_objectives, platform_focus) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
          [
            moduleId,
            lesson.title,
            lesson.description,
            lesson.content,
            lesson.order_index,
            lesson.estimated_minutes,
            lesson.lesson_type,
            lesson.difficulty,
            JSON.stringify(lesson.learning_objectives),
            lesson.platform_focus
          ]
        );
        
        console.log(`✓ Seeded lesson: ${lesson.title}`);
      } else {
        console.log(`⚠ Module not found: ${lesson.module_title}`);
      }
    }
    
    console.log('\n🎉 All remaining lessons seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding remaining lessons:', error);
  } finally {
    pool.end();
    process.exit(0);
  }
}

seedRemainingLessons();