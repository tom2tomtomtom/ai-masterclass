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

const tasks = [
  // Lesson 1.1.1: Understanding AI Capabilities
  {
    lesson_title: 'Lesson 1.1.1: Understanding AI Capabilities',
    title: 'Test AI Capabilities with Your Work',
    description: 'Evaluate AI capabilities using real scenarios from your workplace',
    instructions: `Complete this hands-on assessment of AI capabilities:

**Step 1: Choose a Real Work Scenario**
Pick a specific task or challenge from your current job that you think AI might help with.

**Step 2: Test AI Assessment**
Use the "AI Capability Assessment" prompt from this lesson. Replace the placeholders with your actual:
- Role and responsibilities
- Industry context
- Specific challenges you face

**Step 3: Verify the Assessment**
After getting the AI response:
- Identify 3 capabilities mentioned that you can verify
- Test one simple task the AI claims it can help with
- Note any limitations the AI identified

**Step 4: Document Your Findings**
Create a summary that includes:
- What AI suggested it could help with
- What you tested and the results
- Any limitations you discovered
- Your confidence level in using AI for this type of work`,
    platform: 'mixed',
    task_type: 'prompt_testing',
    validation_criteria: 'Complete documentation of real-world AI capability testing with specific examples and verification',
    submission_format: 'text',
    estimated_minutes: 45,
    difficulty: 'beginner',
    required_tools: ['Claude or ChatGPT', 'Work context/scenario'],
    hints: 'Start with a simple, low-risk task from your job. Focus on learning rather than perfection.',
    order_index: 1,
    is_required: true
  },
  {
    lesson_title: 'Lesson 1.1.1: Understanding AI Capabilities',
    title: 'Create Your AI Limitations Checklist',
    description: 'Develop a personal checklist for recognizing AI limitations',
    instructions: `Create a personalized AI limitations checklist for your work context:

**Step 1: Test Limitations**
Use the "AI Limitation Check" prompt with a real work scenario where accuracy is important.

**Step 2: Identify Risk Areas**
Based on your work and the AI response, identify:
- 3 areas where AI mistakes would be costly
- 3 types of information AI might get wrong
- 3 situations where you'd need human verification

**Step 3: Create Your Checklist**
Develop a quick checklist with:
- Questions to ask before trusting AI output
- Warning signs that indicate you need verification
- Steps to take when accuracy is critical

**Step 4: Test Your Checklist**
Use your checklist on a different AI response and refine it based on what you learn.`,
    platform: 'mixed',
    task_type: 'tool_configuration',
    validation_criteria: 'Personal AI limitations checklist with specific examples from your work context',
    submission_format: 'text',
    estimated_minutes: 30,
    difficulty: 'beginner',
    required_tools: ['AI platform', 'Work scenarios'],
    hints: 'Think about mistakes that would impact your job performance or company reputation.',
    order_index: 2,
    is_required: true
  },

  // Lesson 1.1.2: AI Model Comparison
  {
    lesson_title: 'Lesson 1.1.2: AI Model Comparison',
    title: 'Conduct Your Personal Model Comparison',
    description: 'Compare AI models using your specific work tasks',
    instructions: `Test different AI models with your real work tasks:

**Step 1: Define Your Test Tasks**
Choose 3 specific work tasks:
- One analytical task (reviewing, analyzing)
- One creative task (writing, brainstorming)
- One procedural task (planning, organizing)

**Step 2: Test Each Model**
Use the "Model Selection for Your Work" prompt on:
- Claude (claude.ai)
- ChatGPT (chat.openai.com)
- Gemini (gemini.google.com)

For each model, note:
- Quality of response
- Relevance to your context
- Ease of use
- Specific strengths you notice

**Step 3: Compare Results**
Create a comparison chart showing:
- Which model worked best for each task type
- Specific advantages of each model
- Which you'd choose for different work situations

**Step 4: Make Your Decision**
Choose your primary AI tool and backup option with justification.`,
    platform: 'mixed',
    task_type: 'tool_configuration',
    validation_criteria: 'Complete comparison with test results and documented decision for your work context',
    submission_format: 'text',
    estimated_minutes: 60,
    difficulty: 'intermediate',
    required_tools: ['Claude', 'ChatGPT', 'Gemini', 'Real work tasks'],
    hints: 'Focus on practical differences that matter for your daily work, not theoretical capabilities.',
    order_index: 1,
    is_required: true
  },
  {
    lesson_title: 'Lesson 1.1.2: AI Model Comparison',
    title: 'Implement Your Testing Framework',
    description: 'Create and use a systematic approach to evaluate AI models',
    instructions: `Build and use a testing framework for AI model evaluation:

**Step 1: Create Your Framework**
Use the "Model Testing Framework" prompt to develop a systematic approach including:
- Specific test scenarios from your work
- Evaluation criteria that matter to you
- Scoring system for comparing results

**Step 2: Conduct Systematic Testing**
Run your framework across multiple models:
- Test the same scenario on different models
- Score results using your criteria
- Document specific examples

**Step 3: Analyze Results**
Review your test results to identify:
- Clear winners for specific task types
- Surprising discoveries about model capabilities
- Patterns in model performance

**Step 4: Create Your Model Selection Guide**
Develop a quick reference guide for when to use which model based on your testing.`,
    platform: 'mixed',
    task_type: 'automation_setup',
    validation_criteria: 'Complete testing framework with documented results and model selection guide',
    submission_format: 'text',
    estimated_minutes: 75,
    difficulty: 'intermediate',
    required_tools: ['Multiple AI platforms', 'Work scenarios', 'Testing framework'],
    hints: 'Make your criteria specific and measurable. Focus on what actually matters for your work quality.',
    order_index: 2,
    is_required: false
  },

  // Lesson 1.1.3: Ethical AI Usage
  {
    lesson_title: 'Lesson 1.1.3: Ethical AI Usage',
    title: 'Develop Your AI Ethics Guidelines',
    description: 'Create personal and professional AI usage guidelines',
    instructions: `Create comprehensive AI ethics guidelines for your work:

**Step 1: Assess Your Work Context**
Identify:
- Types of sensitive information you handle
- Company policies about AI usage
- Industry regulations that apply
- Stakeholder expectations

**Step 2: Create Your Guidelines**
Develop specific rules for:
- What information you will/won't share with AI
- When you'll disclose AI assistance
- How you'll verify AI-generated content
- What decisions you'll never let AI make

**Step 3: Test Your Guidelines**
Apply your guidelines to 3 real work scenarios:
- A routine task with no sensitive data
- A client-facing deliverable
- A decision involving confidential information

**Step 4: Refine and Document**
Based on your testing, finalize your AI ethics guidelines and create a quick reference checklist.`,
    platform: 'mixed',
    task_type: 'tool_configuration',
    validation_criteria: 'Personal AI ethics guidelines with practical examples and decision framework',
    submission_format: 'text',
    estimated_minutes: 45,
    difficulty: 'intermediate',
    required_tools: ['Company policies', 'Work scenarios', 'Ethics framework'],
    hints: 'Consider both legal requirements and professional standards. When in doubt, err on the side of caution.',
    order_index: 1,
    is_required: true
  },

  // Lesson 1.1.4: Setting Up Your AI Workspace
  {
    lesson_title: 'Lesson 1.1.4: Setting Up Your AI Workspace',
    title: 'Configure Your Professional AI Workspace',
    description: 'Set up a secure, organized, and productive AI workspace',
    instructions: `Set up your professional AI workspace following security and productivity best practices:

**Step 1: Security Setup**
For each AI platform you plan to use:
- Enable two-factor authentication
- Create strong, unique passwords
- Review and adjust privacy settings
- Set up separate browser profiles if needed

**Step 2: Workspace Organization**
- Create a folder structure for organizing AI conversations
- Set up naming conventions for different types of tasks
- Create bookmarks for frequently used AI tools
- Install any relevant browser extensions

**Step 3: Productivity Optimization**
- Create 5 template prompts for common work tasks
- Set up keyboard shortcuts where available
- Configure notification preferences
- Create a backup system for important conversations

**Step 4: Test Your Setup**
Run through a complete workflow using your new setup and refine based on efficiency and ease of use.`,
    platform: 'mixed',
    task_type: 'tool_configuration',
    validation_criteria: 'Complete AI workspace setup with security measures, organization system, and productivity features',
    submission_format: 'screenshot',
    estimated_minutes: 60,
    difficulty: 'beginner',
    required_tools: ['AI platforms', 'Browser', 'Security apps'],
    hints: 'Take screenshots of your setup for documentation. Test everything before considering it complete.',
    order_index: 1,
    is_required: true
  },

  // Lesson 1.2.1: Prompt Structure Fundamentals
  {
    lesson_title: 'Lesson 1.2.1: Prompt Structure Fundamentals',
    title: 'Apply CLEAR Framework to Your Work',
    description: 'Practice structuring prompts using the CLEAR framework with real work tasks',
    instructions: `Practice the CLEAR framework with your actual work:

**Step 1: Choose Real Work Tasks**
Select 3 different tasks from your job:
- An email that needs improvement
- A meeting that needs better planning  
- A document that needs review

**Step 2: Apply CLEAR Framework**
For each task, create a prompt using CLEAR:
- **C**ontext: Specific work situation
- **L**ength: Desired output length
- **E**xamples: Show what you want
- **A**udience: Who will use/see this
- **R**ole: What role should AI play

**Step 3: Test and Compare**
- Run your CLEAR-structured prompts
- Also try the same tasks with simple, unstructured prompts
- Compare the quality and usefulness of responses

**Step 4: Refine Your Framework**
Based on your results, create your personal template for structuring work-related prompts.`,
    platform: 'mixed',
    task_type: 'prompt_testing',
    validation_criteria: 'Three CLEAR-structured prompts with comparison to unstructured versions and personal template',
    submission_format: 'text',
    estimated_minutes: 50,
    difficulty: 'intermediate',
    required_tools: ['AI platform', 'Real work materials'],
    hints: 'Use actual work content for realistic testing. Focus on measurable improvements in response quality.',
    order_index: 1,
    is_required: true
  },
  {
    lesson_title: 'Lesson 1.2.1: Prompt Structure Fundamentals',
    title: 'Create Work-Specific Prompt Templates',
    description: 'Develop reusable prompt templates for your common work tasks',
    instructions: `Create a library of prompt templates for your regular work:

**Step 1: Identify Recurring Tasks**
List 5-7 tasks you do regularly that AI could help with:
- Email types you write often
- Reports you create
- Analysis you perform
- Planning activities you do

**Step 2: Create Templates**
For each recurring task, create a prompt template with:
- Structured format using CLEAR framework
- Placeholders for variable information
- Clear instructions for consistent results
- Success criteria

**Step 3: Test Your Templates**
Use each template with real work content:
- Fill in the placeholders with actual information
- Evaluate the quality and consistency of results
- Refine templates based on performance

**Step 4: Organize Your Library**
Create an organized system for storing and accessing your prompt templates for future use.`,
    platform: 'mixed',
    task_type: 'automation_setup',
    validation_criteria: 'Complete library of work-specific prompt templates with testing documentation',
    submission_format: 'text',
    estimated_minutes: 75,
    difficulty: 'intermediate',
    required_tools: ['AI platform', 'Template storage system', 'Work examples'],
    hints: 'Start with your most frequent tasks. Make templates specific enough to be useful but flexible for variations.',
    order_index: 2,
    is_required: false
  },

  // Lesson 1.2.2: Context Setting Techniques
  {
    lesson_title: 'Lesson 1.2.2: Context Setting Techniques',
    title: 'Master Context Setting with Real Scenarios',
    description: 'Practice providing effective context using actual work situations',
    instructions: `Master context setting using your real work situations:

**Step 1: Context Mapping**
For a current work project or challenge, identify:
- Situational context (what's happening)
- Audience context (who's involved)
- Constraint context (limitations/requirements)
- Success criteria (what good looks like)

**Step 2: Practice Context Setting**
Use the provided prompts to get AI help with:
- A project status update you need to write
- A customer issue you need to resolve
- A team communication you need to send

**Step 3: Test Context Impact**
For one scenario, try:
- Version 1: Minimal context
- Version 2: Rich, detailed context
- Compare the usefulness of responses

**Step 4: Develop Your Context Checklist**
Create a quick checklist of context questions to ask yourself before writing important prompts.`,
    platform: 'mixed',
    task_type: 'prompt_testing',
    validation_criteria: 'Context mapping exercise with before/after comparison and personal context checklist',
    submission_format: 'text',
    estimated_minutes: 45,
    difficulty: 'intermediate',
    required_tools: ['AI platform', 'Current work scenarios'],
    hints: 'Use real, current situations for the most valuable learning. Focus on context that changes the response quality.',
    order_index: 1,
    is_required: true
  },

  // Lesson 1.2.3: Iterative Prompting
  {
    lesson_title: 'Lesson 1.2.3: Iterative Prompting',
    title: 'Practice Iterative Refinement',
    description: 'Master the art of refining prompts through iterative conversation',
    instructions: `Practice iterative prompting with real work challenges:

**Step 1: Choose a Complex Task**
Select a work task that typically requires multiple revisions:
- A comprehensive report or analysis
- A complex problem that needs solving
- A presentation that needs development

**Step 2: Practice Iteration**
Use the iterative prompting approaches from the lesson:
- Start with a broad initial prompt
- Use at least 4 refinement iterations
- Build on each response rather than starting over
- Focus on specific improvements each time

**Step 3: Document Your Process**
Record:
- Your initial prompt and response
- Each refinement and the resulting improvement
- Final result quality compared to what you'd typically produce
- Time invested vs. time saved

**Step 4: Develop Your Iteration Strategy**
Create a personal approach for iterative prompting that works with your communication style and work needs.`,
    platform: 'mixed',
    task_type: 'prompt_testing',
    validation_criteria: 'Complete iterative prompting session with documentation of process and personal strategy',
    submission_format: 'text',
    estimated_minutes: 60,
    difficulty: 'advanced',
    required_tools: ['AI platform', 'Complex work task'],
    hints: 'Choose a task where quality really matters. Document each step to learn your most effective iteration patterns.',
    order_index: 1,
    is_required: true
  },

  // Lesson 1.2.4: Common Prompting Mistakes
  {
    lesson_title: 'Lesson 1.2.4: Common Prompting Mistakes',
    title: 'Audit and Fix Your Prompting Habits',
    description: 'Identify and correct prompting mistakes in your own work',
    instructions: `Audit your prompting habits and fix common mistakes:

**Step 1: Collect Your Prompts**
Gather 5-10 prompts you've used recently for work tasks.

**Step 2: Mistake Analysis**
Review each prompt for common mistakes:
- Vague instructions
- Missing context
- No quality criteria
- Overcomplication
- Single-shot approach

**Step 3: Rewrite and Compare**
Select your 3 worst prompts and rewrite them avoiding the mistakes:
- Add specific context and instructions
- Include quality criteria
- Simplify overcomplex language
- Plan for iteration if needed

**Step 4: Test Improvements**
Run both versions (original vs. improved) and document:
- Quality difference in responses
- Time saved through better prompting
- Specific improvements you notice

**Step 5: Create Your Prompting Checklist**
Develop a personal checklist to review prompts before sending them.`,
    platform: 'mixed',
    task_type: 'prompt_testing',
    validation_criteria: 'Prompting audit with before/after comparisons and personal improvement checklist',
    submission_format: 'text',
    estimated_minutes: 55,
    difficulty: 'intermediate',
    required_tools: ['AI platform', 'Previous prompts', 'Work examples'],
    hints: 'Be honest about your current prompting habits. Look for patterns in your mistakes to improve systematically.',
    order_index: 1,
    is_required: true
  }
];

async function seedTasks() {
  try {
    for (const task of tasks) {
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
    
    console.log('\n🎉 All tasks seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding tasks:', error);
  } finally {
    pool.end();
    process.exit(0);
  }
}

seedTasks();