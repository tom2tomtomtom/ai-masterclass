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

const remainingTasks = [
  // Lesson 1.3.1: Maintaining Context Across Conversations
  {
    lesson_title: 'Lesson 1.3.1: Maintaining Context Across Conversations',
    title: 'Practice Context Continuity',
    description: 'Master the art of maintaining context across multiple AI sessions',
    instructions: `Practice maintaining context across AI conversations with a real project:

**Step 1: Start a Complex Project Conversation**
Choose an ongoing work project and have a comprehensive AI conversation about it:
- Use the "Project Context Refresh" prompt
- Work through initial analysis and planning
- Make several decisions with AI assistance
- Export or save the conversation summary

**Step 2: Break and Resume**
Wait at least 24 hours, then start a new AI conversation:
- Use context refresh techniques from the lesson
- Reference previous decisions and reasoning
- Continue building on your prior work
- Note any context loss or confusion

**Step 3: Test Team Handoff**
Use the "Team Context Handoff" prompt to create a handoff summary:
- Document all key decisions and reasoning
- Share with a colleague (or imagine sharing)
- Test whether someone else could continue your work

**Step 4: Evaluate Context Management**
Assess your context management effectiveness:
- What context was successfully preserved?
- What got lost in the handoff?
- How could you improve your context management?
- What documentation practices work best?

Document your learning and create personal guidelines for context management.`,
    platform: 'mixed',
    task_type: 'prompt_testing',
    validation_criteria: 'Successfully maintain project context across sessions with documented handoff process',
    submission_format: 'text',
    estimated_minutes: 60,
    difficulty: 'intermediate',
    required_tools: ['AI platforms', 'Real work project', 'Documentation system'],
    hints: 'Use a real project where context matters. The more authentic the scenario, the better you\'ll learn.',
    order_index: 1,
    is_required: true
  },

  // Lesson 1.3.2: Multi-Turn Conversation Strategies
  {
    lesson_title: 'Lesson 1.3.2: Multi-Turn Conversation Strategies',
    title: 'Apply Strategic Conversation Patterns',
    description: 'Use advanced conversation strategies to solve complex work challenges',
    instructions: `Apply strategic conversation patterns to a complex workplace challenge:

**Step 1: Choose Your Challenge**
Select a complex work challenge that doesn't have an obvious solution:
- Strategic decision with multiple factors
- Cross-functional coordination problem
- Long-term planning challenge
- Stakeholder alignment issue

**Step 2: Apply the Funnel Approach**
Use the systematic exploration pattern:
- Turn 1: Broad problem exploration
- Turn 2: Narrow to specific aspects
- Turn 3: Focus on key solution areas
- Turn 4: Develop actionable recommendations

**Step 3: Test Expert Panel Method**
Apply different expert perspectives to the same challenge:
- Strategic consultant viewpoint
- Operational expert perspective
- Change management specialist view
- Synthesize all perspectives

**Step 4: Compare Approaches**
Document the differences between:
- Single-prompt solution request
- Funnel approach results
- Expert panel insights
- Quality and depth of final recommendations

**Step 5: Develop Your Strategy**
Create your personal framework for complex problem-solving conversations based on what worked best.`,
    platform: 'claude',
    task_type: 'prompt_testing',
    validation_criteria: 'Complete application of multiple strategic conversation patterns with comparison analysis',
    submission_format: 'text',
    estimated_minutes: 90,
    difficulty: 'advanced',
    required_tools: ['Claude or ChatGPT', 'Complex work challenge', 'Analysis framework'],
    hints: 'Choose a challenge that genuinely puzzles you. The conversation patterns work best with real complexity.',
    order_index: 1,
    is_required: true
  },

  // Lesson 1.3.3: Building Complex Solutions Through Dialogue
  {
    lesson_title: 'Lesson 1.3.3: Building Complex Solutions Through Dialogue',
    title: 'Collaborative Solution Development',
    description: 'Build a comprehensive solution through systematic AI dialogue',
    instructions: `Use collaborative dialogue to develop a comprehensive solution to a significant workplace challenge:

**Step 1: Solution Challenge Selection**
Choose a substantial challenge that requires comprehensive solutions:
- Cross-departmental process improvement
- Strategic initiative planning
- System implementation project
- Organizational change initiative

**Step 2: Apply Solution Development Framework**
Work through all four phases systematically:
- Phase 1: Problem exploration (what, why, who, constraints)
- Phase 2: Option generation (multiple approaches, alternatives)
- Phase 3: Solution evaluation (criteria, trade-offs, risks)
- Phase 4: Implementation planning (steps, timeline, resources)

**Step 3: Use Advanced Dialogue Techniques**
Apply the techniques from the lesson:
- "What if" exploration for scenario testing
- Perspective shifts for different viewpoints
- Constraint relaxation for creative solutions
- Stress testing for robustness

**Step 4: Quality Assurance**
Put your solution through rigorous testing:
- Implementation reality check
- Political and practical challenges
- Success measurement design
- Risk assessment and mitigation

**Step 5: Create Implementation Plan**
Develop a complete plan ready for real-world application with timeline, resources, and success metrics.`,
    platform: 'claude',
    task_type: 'automation_setup',
    validation_criteria: 'Complete solution with systematic development process, quality assurance, and implementation plan',
    submission_format: 'text',
    estimated_minutes: 120,
    difficulty: 'advanced',
    required_tools: ['Claude', 'Significant workplace challenge', 'Solution framework'],
    hints: 'Don\'t rush through the phases. Each phase builds the foundation for better solutions in the next phase.',
    order_index: 1,
    is_required: true
  },

  // Lesson 1.3.4: Managing AI Memory and Context Limits
  {
    lesson_title: 'Lesson 1.3.4: Managing AI Memory and Context Limits',
    title: 'Context Management System Implementation',
    description: 'Develop and test your personal context management system',
    instructions: `Create and test a comprehensive context management system:

**Step 1: Context Management Assessment**
Evaluate your current approach:
- How do you currently handle long AI conversations?
- What context gets lost and causes problems?
- What conversations would benefit from better context management?

**Step 2: Design Your System**
Create your personal context management approach:
- Conversation chunking strategy (when to start new sessions)
- Context summarization templates
- Information distillation processes
- Context refresh techniques for new sessions

**Step 3: Test Context Compression**
Practice with a long, complex conversation:
- Have an extended AI conversation (15+ exchanges)
- Use the "Context Compression and Summary" prompt
- Test how well the summary preserves essential information
- Try resuming work using only the summary

**Step 4: Test Strategic Context Layering**
Practice efficient context building:
- Use the "Strategic Context Layering" prompt
- Test different layering approaches
- Measure how much context you can efficiently convey
- Compare effectiveness of different structures

**Step 5: Create Your Context Toolkit**
Develop reusable templates and processes:
- Context refresh templates for different project types
- Summary templates for different conversation types
- Personal checklists for context management
- Quality criteria for context effectiveness`,
    platform: 'mixed',
    task_type: 'tool_configuration',
    validation_criteria: 'Complete context management system with tested templates and documented best practices',
    submission_format: 'text',
    estimated_minutes: 75,
    difficulty: 'intermediate',
    required_tools: ['Multiple AI platforms', 'Long conversations', 'Template system'],
    hints: 'Test your system with real work scenarios. The best context management feels natural and saves time.',
    order_index: 1,
    is_required: true
  },

  // Lesson 1.4.1: Meeting Management Automation
  {
    lesson_title: 'Lesson 1.4.1: Meeting Management Automation',
    title: 'Complete Meeting Management Transformation',
    description: 'Transform your meeting management using comprehensive AI assistance',
    instructions: `Transform your meeting management process using AI automation:

**Step 1: Meeting Portfolio Analysis**
Analyze your current meeting situation:
- List all recurring meetings you attend or run
- Use the "Meeting ROI Analysis" prompt for cost evaluation
- Identify your biggest meeting pain points
- Set improvement targets and success metrics

**Step 2: Implement AI-Powered Agenda Creation**
Transform your agenda creation process:
- Use the "Advanced Meeting Agenda Generator" for upcoming meetings
- Create templates for your common meeting types
- Test the difference in meeting quality and preparation
- Gather feedback from meeting participants

**Step 3: Deploy Action Item Processing**
Automate your post-meeting workflows:
- Use AI to process meeting notes into clear action items
- Create follow-up communication templates
- Implement tracking systems for action item completion
- Measure improvement in follow-through rates

**Step 4: Optimize Meeting Effectiveness**
Apply advanced meeting optimization:
- Test conflict detection and resolution approaches
- Implement preparation requirement systems
- Create meeting effectiveness feedback loops
- Design metrics for ongoing improvement

**Step 5: Measure and Refine**
Evaluate your meeting management transformation:
- Calculate time savings and quality improvements
- Measure stakeholder satisfaction changes
- Document lessons learned and best practices
- Create scalable processes for team adoption`,
    platform: 'mixed',
    task_type: 'automation_setup',
    validation_criteria: 'Complete meeting management transformation with measured improvements and scalable processes',
    submission_format: 'text',
    estimated_minutes: 100,
    difficulty: 'intermediate',
    required_tools: ['AI platforms', 'Meeting management tools', 'Measurement system'],
    hints: 'Start with your most problematic meetings. Success here will motivate adoption across other meetings.',
    order_index: 1,
    is_required: true
  },

  // Lesson 1.4.2: Email and Communication Optimization
  {
    lesson_title: 'Lesson 1.4.2: Email and Communication Optimization',
    title: 'Strategic Communication System Implementation',
    description: 'Build and deploy a comprehensive AI-powered communication system',
    instructions: `Build a comprehensive AI-powered communication system:

**Step 1: Communication Audit**
Assess your current communication challenges:
- Analyze your email volume and processing time
- Identify recurring communication types
- Map stakeholder communication requirements
- Define improvement goals and success metrics

**Step 2: Strategic Communication Planning**
Develop systematic communication approaches:
- Use the "Strategic Stakeholder Communication Plan" for a current project
- Create communication templates for different stakeholder types
- Design escalation and crisis communication protocols
- Test messaging effectiveness with real stakeholders

**Step 3: Email Optimization Implementation**
Transform your email management:
- Create email processing workflows using AI assistance
- Develop response templates for common email types
- Implement inbox management and prioritization systems
- Measure time savings and response quality improvements

**Step 4: Crisis Communication Preparedness**
Prepare for challenging communication situations:
- Use the "Crisis Communication Response" prompt with scenarios
- Create crisis communication templates for different situations
- Develop stakeholder notification and coordination protocols
- Test your crisis communication approach with simulated scenarios

**Step 5: Communication Excellence Integration**
Integrate all elements into a complete system:
- Create comprehensive communication playbooks
- Train team members on new communication approaches
- Implement feedback and continuous improvement processes
- Measure communication effectiveness and stakeholder satisfaction`,
    platform: 'mixed',
    task_type: 'automation_setup',
    validation_criteria: 'Complete communication system with templates, protocols, and measured improvements',
    submission_format: 'text',
    estimated_minutes: 110,
    difficulty: 'advanced',
    required_tools: ['AI platforms', 'Communication scenarios', 'Template system'],
    hints: 'Focus on your highest-impact communication challenges first. Build systems that others can adopt.',
    order_index: 1,
    is_required: true
  },

  // Lesson 1.4.3: Document Creation and Review
  {
    lesson_title: 'Lesson 1.4.3: Document Creation and Review',
    title: 'Professional Document Excellence System',
    description: 'Create a comprehensive AI-powered document creation and review system',
    instructions: `Build a comprehensive document excellence system using AI:

**Step 1: Document Portfolio Assessment**
Evaluate your current document creation process:
- Identify types of documents you create regularly
- Assess current time investment and quality levels
- Map audience types and their specific needs
- Define improvement goals for efficiency and quality

**Step 2: Executive Communication Mastery**
Transform your high-level communication:
- Use the "Executive Proposal Generator" for a real proposal
- Apply the "Technical Translation Specialist" to complex content
- Create executive communication templates
- Test effectiveness with executive audiences

**Step 3: Document Creation Workflow**
Systematize your document creation process:
- Develop AI-assisted planning and outlining processes
- Create quality review and improvement workflows
- Build audience-specific optimization approaches
- Implement collaborative document development protocols

**Step 4: Quality Assurance Implementation**
Create systematic quality assurance:
- Develop comprehensive document review checklists
- Create audience-specific evaluation criteria
- Implement multiple review passes for different aspects
- Test quality improvements with real stakeholders

**Step 5: Document Excellence Integration**
Build a complete document excellence system:
- Create reusable templates and workflows
- Develop training materials for team adoption
- Implement feedback loops for continuous improvement
- Measure document effectiveness and audience satisfaction`,
    platform: 'claude',
    task_type: 'automation_setup',
    validation_criteria: 'Complete document excellence system with workflows, quality assurance, and measured improvements',
    submission_format: 'text',
    estimated_minutes: 95,
    difficulty: 'intermediate',
    required_tools: ['Claude', 'Real documents', 'Quality framework'],
    hints: 'Start with your most important document types. Focus on documents where quality really matters.',
    order_index: 1,
    is_required: true
  },

  // Lesson 1.4.4: Level 1 Capstone Project
  {
    lesson_title: 'Lesson 1.4.4: Level 1 Capstone Project',
    title: 'Level 1 Capstone Project Execution',
    description: 'Complete your comprehensive Level 1 capstone project demonstrating mastery of all AI skills',
    instructions: `Execute your complete Level 1 capstone project:

**Phase 1: Comprehensive Challenge Analysis (Week 1)**
Complete thorough analysis of your chosen workplace challenge:
- Use the "Capstone Project Analysis Framework" prompt
- Conduct stakeholder interviews and requirements gathering
- Document current state with quantified pain points
- Define success criteria and measurement approach
- Create business case for AI integration

**Phase 2: AI Solution Architecture Design (Week 2)**
Design your comprehensive AI integration:
- Use the "AI Integration Architecture Design" prompt
- Map AI integration points to workflow steps
- Design custom prompts and templates for each use case
- Create quality assurance and validation processes
- Plan implementation timeline and change management

**Phase 3: Pilot Implementation and Testing (Week 3)**
Execute controlled pilot of your AI solution:
- Implement solution with limited scope/users
- Collect quantitative and qualitative feedback
- Measure improvements against baseline metrics
- Document challenges and refinement needs
- Validate business impact projections

**Phase 4: Refinement and Scale Planning (Week 4)**
Optimize and prepare for full implementation:
- Refine solution based on pilot learnings
- Create comprehensive implementation plan
- Develop training and adoption materials
- Design ongoing monitoring and improvement processes
- Document replication approach for other areas

**Final Deliverables:**
- Comprehensive project report with business impact analysis
- Reusable AI asset library (prompts, templates, workflows)
- Implementation playbook for scaling solution
- Capstone presentation demonstrating integrated AI mastery`,
    platform: 'mixed',
    task_type: 'automation_setup',
    validation_criteria: 'Complete capstone project with measured business impact, reusable assets, and demonstrated AI mastery',
    submission_format: 'text',
    estimated_minutes: 240,
    difficulty: 'advanced',
    required_tools: ['Multiple AI platforms', 'Real workplace challenge', 'Implementation framework'],
    hints: 'Choose a challenge that genuinely matters to your organization. Real impact demonstrates true mastery.',
    order_index: 1,
    is_required: true
  }
];

async function seedRemainingTasks() {
  try {
    for (const task of remainingTasks) {
      // Get lesson ID from title
      const { rows: lessonRows } = await pool.query(
        'SELECT id FROM lessons WHERE title = $1',
        [task.lesson_title]
      );
      
      if (lessonRows.length > 0) {
        const lessonId = lessonRows[0].id;
        
        await pool.query(
          'INSERT INTO tasks (lesson_id, title, description, instructions, platform, task_type, validation_criteria, submission_format, estimated_minutes, difficulty, required_tools, hints, order_index, is_required) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
          [
            lessonId,
            task.title,
            task.description,
            task.instructions,
            task.platform,
            task.task_type,
            task.validation_criteria,
            task.submission_format,
            task.estimated_minutes,
            task.difficulty,
            JSON.stringify(task.required_tools),
            task.hints,
            task.order_index,
            task.is_required
          ]
        );
        
        console.log(`✓ Seeded task: ${task.title}`);
      } else {
        console.log(`⚠ Lesson not found: ${task.lesson_title}`);
      }
    }
    
    console.log('\n🎉 All remaining tasks seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding remaining tasks:', error);
  } finally {
    pool.end();
    process.exit(0);
  }
}

seedRemainingTasks();