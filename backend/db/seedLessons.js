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

const lessons = [
  // Module 1.1: AI Fundamentals
  {
    module_title: 'Module 1.1: AI Fundamentals',
    title: 'Lesson 1.1.1: Understanding AI Capabilities',
    description: 'Learn what AI can and cannot do with practical examples',
    content: `# Understanding AI Capabilities

## What AI Models Can Do
AI models like Claude, ChatGPT, and Gemini excel at:
- **Text Analysis**: Understanding context, sentiment, and meaning
- **Content Generation**: Writing, editing, and creative tasks
- **Problem Solving**: Breaking down complex problems into steps
- **Code Assistance**: Writing, debugging, and explaining code
- **Language Translation**: Converting between languages
- **Data Processing**: Extracting insights from structured data

## What AI Models Cannot Do
Understanding limitations is crucial:
- **Real-time Information**: Models have knowledge cutoffs
- **Personal Data Access**: Cannot access your private information
- **Perfect Accuracy**: May make mistakes or hallucinate
- **Physical Actions**: Cannot directly interact with the physical world
- **True Understanding**: Process patterns, not genuine comprehension

## Key Concepts to Remember
1. **Tokens**: AI models process text as tokens (roughly 3-4 characters)
2. **Context Window**: Limited memory of previous conversation
3. **Training Data**: Models learn from data, not real-time experience
4. **Bias**: May reflect biases present in training data`,
    order_index: 1,
    estimated_minutes: 30,
    lesson_type: 'concept',
    difficulty: 'beginner',
    learning_objectives: [
      'Identify AI strengths and limitations',
      'Understand key AI concepts',
      'Set realistic expectations for AI assistance'
    ],
    platform_focus: 'mixed'
  },
  {
    module_title: 'Module 1.1: AI Fundamentals',
    title: 'Lesson 1.1.2: AI Model Comparison',
    description: 'Compare different AI models and their specific strengths',
    content: `# Choose the Perfect AI Tool → Stop Wasting Time with Wrong Models

## 🎯 **Why This Matters**
Using the wrong AI tool wastes 20+ minutes per task and produces mediocre results. Learn this simple decision framework and pick the perfect tool every time.

## 🏆 **What You'll Accomplish**
By the end of this lesson, you'll be able to:
- Choose the best AI tool for any business task in 30 seconds
- Avoid the 3 most common tool selection mistakes
- Save 15+ minutes per project by using optimal AI models

## ⏱️ **Time Investment**
- **Reading**: 6 minutes
- **Practice**: 4 minutes
- **Total**: 10 minutes

## 📋 **Before You Start**
**Prerequisites**: Basic understanding of AI capabilities (Lesson 1.1.1)
**You'll Need**: Access to at least one AI platform for testing

## 🔍 **Quick Preview**
Here's what you'll master:
1. **30-Second Decision Framework** - Pick the right tool instantly
2. **Tool Strengths Map** - Know what each AI does best
3. **Common Mistakes** - Avoid time-wasting tool choices

---

## 🎯 **The 30-Second AI Tool Decision Framework**

### **Step 1: What's Your Task Type?** (10 seconds)
- **Writing & Analysis**: Claude
- **Quick Questions & Brainstorming**: ChatGPT
- **Current Information & Research**: Gemini

### **Step 2: How Current Must Information Be?** (10 seconds)
- **Real-time data needed**: Gemini
- **General knowledge sufficient**: Claude or ChatGPT
- **Historical analysis**: Claude

### **Step 3: What's Your Output Length?** (10 seconds)
- **Long-form content (500+ words)**: Claude
- **Medium content (100-500 words)**: ChatGPT
- **Quick answers (<100 words)**: Any tool

## 🔧 **AI Tool Strengths Map**

### **Claude: The Deep Thinker**
**Perfect For**:
- Strategic planning documents
- Complex data analysis
- Long-form writing (reports, proposals)
- Code review and debugging

**Business Example**: "Analyze our Q3 sales data and create a 5-page strategic plan"

### **ChatGPT: The Quick Helper**
**Perfect For**:
- Team communication
- Creative brainstorming
- Quick problem-solving
- Meeting summaries

**Business Example**: "Draft a friendly email declining this vendor proposal"

### **Gemini: The Current Info Expert**
**Perfect For**:
- Market research
- Competitor analysis
- Current event context
- Real-time data needs

**Business Example**: "What are the latest trends in our industry this month?"

## ❌ **3 Common Mistakes to Avoid**

### **Mistake 1: Using Claude for Current Events**
**Problem**: Claude's knowledge has a cutoff date
**Solution**: Use Gemini for anything happening recently

### **Mistake 2: Using ChatGPT for Long Analysis**
**Problem**: Tends to be verbose without depth
**Solution**: Use Claude for detailed analysis and strategic thinking

### **Mistake 3: Using Gemini for Creative Writing**
**Problem**: Optimized for information, not creativity
**Solution**: Use ChatGPT for creative and conversational content

## 💡 **Real-World Decision Examples**

### **Scenario 1: Quarterly Business Review**
**Task**: Create comprehensive Q4 performance analysis
**Best Choice**: Claude (long-form analysis, strategic thinking)
**Why**: Needs deep analysis and structured, professional output

### **Scenario 2: Team Meeting Agenda**
**Task**: Quick agenda for tomorrow's team check-in
**Best Choice**: ChatGPT (quick, conversational, practical)
**Why**: Fast turnaround, team communication focus

### **Scenario 3: Competitor Research**
**Task**: Latest competitor product launches and pricing
**Best Choice**: Gemini (current information, market data)
**Why**: Needs real-time, up-to-date market information

## ✅ **Quick Selection Checklist**
Before choosing an AI tool, ask:
- [ ] Do I need current/real-time information? → Gemini
- [ ] Is this a long, complex analysis? → Claude
- [ ] Do I need a quick, conversational response? → ChatGPT
- [ ] Am I writing something creative or strategic? → Claude or ChatGPT
- [ ] Do I need to research recent events? → Gemini

## 🎯 **Practice Exercise**
For each scenario, choose the best AI tool:
1. "Write a 3-page proposal for a new marketing strategy"
2. "Find out what our competitors announced this week"
3. "Draft a quick thank-you email to a client"

**Answers**: 1) Claude, 2) Gemini, 3) ChatGPT

## 🚀 **Next Steps**
1. **Test** the decision framework with your current work task
2. **Bookmark** the tool strengths map for quick reference
3. **Move to Lesson 1.1.3** to learn about AI limitations and safety`,
    order_index: 2,
    estimated_minutes: 25,
    lesson_type: 'concept',
    difficulty: 'beginner',
    learning_objectives: [
      'Compare AI model capabilities',
      'Select appropriate model for tasks',
      'Understand model-specific strengths'
    ],
    platform_focus: 'mixed'
  },
  {
    module_title: 'Module 1.1: AI Fundamentals',
    title: 'Lesson 1.1.3: Ethical AI Usage',
    description: 'Learn responsible AI practices and ethical considerations',
    content: `# Ethical AI Usage

## Core Principles
1. **Transparency**: Be clear about AI assistance
2. **Accountability**: Take responsibility for AI-generated content
3. **Privacy**: Protect sensitive information
4. **Fairness**: Avoid discriminatory applications
5. **Accuracy**: Verify important information

## Best Practices
### Information Handling
- Never share confidential company data
- Avoid personal information of others
- Be cautious with sensitive financial data
- Anonymize data when possible

### Content Creation
- Always disclose AI assistance when required
- Review and verify AI-generated content
- Add human insight and context
- Take responsibility for final output

### Decision Making
- Use AI as a tool, not a decision maker
- Apply critical thinking to AI suggestions
- Consider multiple perspectives
- Verify facts and figures independently

## Common Ethical Pitfalls
- **Over-reliance**: Accepting AI output without verification
- **Bias Amplification**: Not considering AI's training biases
- **Privacy Violations**: Sharing confidential information
- **Misrepresentation**: Not disclosing AI assistance
- **Lazy Thinking**: Letting AI replace critical thinking

## Professional Guidelines
- Check your organization's AI policy
- Understand legal requirements in your industry
- Consider client expectations and contracts
- Maintain professional standards and quality`,
    order_index: 3,
    estimated_minutes: 20,
    lesson_type: 'concept',
    difficulty: 'beginner',
    learning_objectives: [
      'Apply ethical AI principles',
      'Identify potential risks and pitfalls',
      'Develop responsible AI practices'
    ],
    platform_focus: 'mixed'
  },
  {
    module_title: 'Module 1.1: AI Fundamentals',
    title: 'Lesson 1.1.4: Setting Up Your AI Workspace',
    description: 'Practical setup for accessing and organizing AI tools',
    content: `# Setting Up Your AI Workspace

## Account Setup
### Claude (Anthropic)
1. Visit claude.ai
2. Sign up with email or Google account
3. Choose between free and paid plans
4. Consider Claude Pro for higher usage limits

### ChatGPT (OpenAI)
1. Go to chat.openai.com
2. Create account or sign in
3. Explore free tier limitations
4. Consider Plus subscription for GPT-4 access

### Gemini (Google)
1. Visit gemini.google.com
2. Sign in with Google account
3. Integrated with Google Workspace
4. Access through Google AI Studio for advanced features

## Workspace Organization
### Browser Setup
- Use separate browser profiles for different clients
- Bookmark frequently used AI tools
- Install relevant browser extensions
- Set up shortcuts for quick access

### Conversation Management
- Create descriptive conversation titles
- Use folders or tags to organize chats
- Export important conversations
- Regular cleanup of outdated chats

### Security Practices
- Use strong, unique passwords
- Enable two-factor authentication
- Review privacy settings regularly
- Log out of shared devices

## Productivity Tips
### Keyboard Shortcuts
- Learn platform-specific shortcuts
- Use text expansion tools for common prompts
- Set up hotkeys for frequent actions
- Create template responses

### Integration Setup
- Connect to calendar for scheduling
- Set up email templates with AI assistance
- Create document templates
- Link to project management tools`,
    order_index: 4,
    estimated_minutes: 35,
    lesson_type: 'tutorial',
    difficulty: 'beginner',
    learning_objectives: [
      'Set up AI tool accounts',
      'Organize AI workspace effectively',
      'Implement security best practices'
    ],
    platform_focus: 'mixed'
  },

  // Module 1.2: Basic Prompting
  {
    module_title: 'Module 1.2: Basic Prompting',
    title: 'Lesson 1.2.1: Prompt Structure Fundamentals',
    description: 'Learn the basic structure of effective prompts',
    content: `# Master Prompt Structure → Get 3x Better AI Results in 15 Minutes

## 🎯 **Why This Matters**
Poorly structured prompts waste 15+ minutes per AI interaction and produce generic results. Master this framework and get precise, useful responses in under 2 minutes.

## 🏆 **What You'll Accomplish**
By the end of this lesson, you'll be able to:
- Write prompts that get exactly what you need on the first try
- Save 10+ minutes per AI interaction
- Get professional-quality outputs for any business task

## ⏱️ **Time Investment**
- **Reading**: 8 minutes
- **Practice**: 7 minutes
- **Total**: 15 minutes

## 📋 **Before You Start**
**Prerequisites**: Basic familiarity with any AI tool (Claude, ChatGPT, or Gemini)
**You'll Need**: Access to one AI platform for practice

## 🔍 **Quick Preview**
Here's what you'll master:
1. **CLEAR Framework** - 5-second structure check for any prompt
2. **Professional Templates** - Copy-paste structures for common tasks
3. **Quality Indicators** - Know when your prompt will work before sending

---

## 🎯 **The CLEAR Framework**
Every effective prompt needs these 5 elements:

### **C** - Context (What's the situation?)
**Bad**: "Write an email"
**Good**: "I'm a project manager updating stakeholders about a 2-week delay"

### **L** - Length (How much output?)
**Bad**: No specification
**Good**: "Keep it under 150 words" or "Provide 5 bullet points"

### **E** - Examples (Show what you want)
**Bad**: "Make it professional"
**Good**: "Like this: 'Due to supply chain issues, we're adjusting our timeline...'"

### **A** - Audience (Who will see this?)
**Bad**: Generic output
**Good**: "For senior executives who prefer direct communication"

### **R** - Role (What expert should AI be?)
**Bad**: No role specified
**Good**: "You are a business communication expert"

## 🔧 **Professional Prompt Template**
```
You are a [SPECIFIC EXPERT ROLE].

CONTEXT: [Your situation in 1-2 sentences]

TASK: [Specific action you want]

FORMAT: [How you want the response structured]

AUDIENCE: [Who will use this output]

CONSTRAINTS: [Length, tone, or other requirements]
```

## 💡 **Real-World Example**

**Scenario**: You need to email your team about a budget cut

### ❌ **Weak Prompt**
"Write an email about budget cuts"

### ✅ **Strong Prompt**
"You are a team communication expert.

CONTEXT: I'm a department manager who needs to inform my 12-person team that our Q4 budget has been reduced by 20%. This affects our planned software purchases but not salaries.

TASK: Write a team email that explains the situation transparently while maintaining morale.

FORMAT: Professional email with clear subject line, 3 short paragraphs, and specific next steps.

AUDIENCE: Mixed experience levels, some are worried about job security.

CONSTRAINTS: Under 200 words, reassuring but honest tone."

### **Result**: Professional, targeted email that addresses concerns and provides clarity.

## ✅ **Success Indicators**
Your prompt is ready when it includes:
- [ ] Specific role for the AI
- [ ] Clear context about your situation
- [ ] Exact task you want completed
- [ ] Format requirements (length, structure)
- [ ] Audience information

## 🎯 **Practice Exercise: Transform Weak Prompts**

### **Challenge 1: Presentation Help**
**Weak Prompt**: "Help me with a presentation"

**Your Turn**: Use the CLEAR framework to transform this. Consider:
- What role should AI play?
- What's the presentation about?
- Who's the audience?
- What format do you need?

<details>
<summary>💡 **Sample Strong Version** (Click to reveal)</summary>

"You are a business presentation expert.

CONTEXT: I'm a marketing manager presenting Q4 campaign results to senior executives next Tuesday.

TASK: Help me create a compelling 10-minute presentation outline.

FORMAT: Slide-by-slide structure with key talking points for each slide.

AUDIENCE: C-level executives who want strategic insights and ROI data.

CONSTRAINTS: Must include specific metrics, keep technical details minimal, focus on business impact."

</details>

### **Challenge 2: Your Real Work**
**Apply this now**: Take a current work challenge and write a strong prompt using our template.

**Success Check**: Your prompt should include all 5 CLEAR elements and take under 2 minutes to write.

## 📊 **Progress Tracker**
Track your prompt-writing improvement:
- [ ] **Week 1**: Can write structured prompts using CLEAR framework
- [ ] **Week 2**: Get useful responses on first try 80% of the time
- [ ] **Week 3**: Save 10+ minutes per AI interaction
- [ ] **Week 4**: Colleagues ask for your prompt-writing tips

## 🎉 **Success Stories**

> **"This framework saved me 2 hours on my quarterly report. Instead of generic content, I got exactly what I needed for my board presentation."** - Sarah, Operations Manager

> **"My team now uses the CLEAR template for all AI requests. Our productivity with AI tools increased 300%."** - Mike, Project Lead

## 🚀 **Next Steps**
1. **Bookmark** the prompt template above
2. **Practice** with one work task today (set a 5-minute timer)
3. **Share** the template with one colleague
4. **Move to Lesson 1.2.2** to learn advanced context techniques

**Quick Win**: Use the template for your next AI interaction and notice the difference in response quality!`,
    order_index: 1,
    estimated_minutes: 25,
    lesson_type: 'concept',
    difficulty: 'beginner',
    learning_objectives: [
      'Understand prompt structure',
      'Apply CLEAR framework',
      'Write effective instructions'
    ],
    platform_focus: 'mixed'
  },
  {
    module_title: 'Module 1.2: Basic Prompting',
    title: 'Lesson 1.2.2: Context Setting Techniques',
    description: 'Master the art of providing context for better AI responses',
    content: `# Master Context Setting → Get Exactly What You Need from AI

## 🎯 **Why This Matters**
Generic context = generic results. Specific context = professional outputs you can use immediately. This technique alone improves AI response quality by 300%.

## 🏆 **What You'll Accomplish**
By the end of this lesson, you'll be able to:
- Provide context that gets professional-quality responses
- Avoid the #1 mistake that wastes time in AI conversations
- Use the 3-layer context method for complex requests

## ⏱️ **Time Investment**
- **Reading**: 10 minutes
- **Practice**: 5 minutes
- **Total**: 15 minutes

## 📋 **Before You Start**
**Prerequisites**: Understanding of basic prompt structure (Lesson 1.2.1)
**You'll Need**: A current work challenge to practice with

---

## 🎯 **The 3-Layer Context Method**

### **Layer 1: Situation** (What's happening?)
Tell AI your current business situation in 1-2 sentences.

**Example**: "I'm a project manager dealing with a 2-week delay on a client project due to technical issues."

### **Layer 2: Audience** (Who's involved?)
Describe who will see or use the AI's output.

**Example**: "This update goes to senior executives who are concerned about budget impact."

### **Layer 3: Constraints** (What are the limits?)
Share your limitations, requirements, or company policies.

**Example**: "Must be transparent about challenges but maintain confidence in our solution."

## 💡 **Real-World Example: Meeting Minutes**

### ❌ **Weak Context**
"Help me write meeting minutes"

### ✅ **Strong Context Using 3 Layers**
**Situation**: "I'm a project manager who just finished our weekly sprint planning with 8 developers. We covered sprint goals, task assignments, and 3 major blockers."

**Audience**: "These minutes go to stakeholders who weren't present, including our VP of Engineering and client liaison."

**Constraints**: "Must be professional, highlight progress made, and clearly identify action items with owners and deadlines."

**Result**: Professional minutes that stakeholders can act on immediately.

## 🔧 **Quick Context Checklist**
Before sending any prompt, verify you've included:
- [ ] **Situation**: What's your current challenge?
- [ ] **Audience**: Who will use this output?
- [ ] **Constraints**: What are your limitations?

## 🎯 **Practice Exercise**
Transform this weak request using the 3-layer method:
"Help me respond to this customer complaint email"

**Your turn**: Add situation, audience, and constraints to make it actionable.

## 🚀 **Next Steps**
1. **Apply** the 3-layer method to your current work challenge
2. **Compare** results with and without proper context
3. **Move to Lesson 1.2.3** to learn iterative refinement techniques

---

<details>
<summary>📚 **Advanced Context Techniques** (Click to expand)</summary>

### **Context Categories for Complex Requests**

#### **Situational Context**
- Current business challenge
- Team dynamics and relationships
- Project status and timeline
- Available resources and budget

#### **Audience Context**
- Decision-making authority
- Technical expertise level
- Communication preferences
- Current concerns or priorities

#### **Constraint Context**
- Time limitations and deadlines
- Budget restrictions
- Technical requirements
- Company policies and compliance
- Brand guidelines and tone

### **Context Optimization Tips**
1. **Start with the big picture** - Set the scene first
2. **Include relevant constraints** - What can't you do?
3. **Specify the audience** - Who needs to understand this?
4. **Mention success criteria** - What does good look like?
5. **Keep it concise but complete** - Every word should add value

</details>`,
    order_index: 2,
    estimated_minutes: 30,
    lesson_type: 'tutorial',
    difficulty: 'beginner',
    learning_objectives: [
      'Provide effective context',
      'Identify relevant background information',
      'Structure context for clarity'
    ],
    platform_focus: 'mixed'
  },
  {
    module_title: 'Module 1.2: Basic Prompting',
    title: 'Lesson 1.2.3: Iterative Prompting',
    description: 'Learn to refine prompts through conversation',
    content: `# Master AI Conversations → Turn Good Responses into Perfect Results

## 🎯 **Why This Matters**
Most people accept the first AI response and miss 80% of the tool's potential. Learn this conversation technique and get exactly what you need every time.

## 🏆 **What You'll Accomplish**
By the end of this lesson, you'll be able to:
- Transform mediocre AI responses into professional-quality outputs
- Use the 3-step refinement method for any business task
- Save 30+ minutes by getting it right instead of starting over

## ⏱️ **Time Investment**
- **Reading**: 8 minutes
- **Practice**: 7 minutes
- **Total**: 15 minutes

## 📋 **Before You Start**
**Prerequisites**: Understanding of prompt structure (Lesson 1.2.1) and context setting (Lesson 1.2.2)
**You'll Need**: Access to any AI platform for practice

## 🔍 **Quick Preview**
Here's what you'll master:
1. **3-Step Refinement Method** - Systematic improvement process
2. **5 Power Phrases** - Get better responses instantly
3. **Real Conversation Flow** - See the complete transformation

---

## 🎯 **The 3-Step Refinement Method**

### **Step 1: Evaluate (30 seconds)**
Ask yourself:
- What parts of the response are useful?
- What's missing or unclear?
- What tone/format changes are needed?

### **Step 2: Refine (1 minute)**
Use specific feedback:
- "That's good, but I need..."
- "Can you make it more..."
- "Add a section about..."

### **Step 3: Build (30 seconds)**
Reference what worked:
- "Keep the structure from your last response, but..."
- "That format is perfect, now add..."
- "Use that tone, but focus on..."

## 🔧 **5 Power Phrases for Instant Improvement**

### **1. "That's close, but make it more [SPECIFIC]"**
**Example**: "That's close, but make it more executive-focused with strategic impact"

### **2. "Keep [WHAT WORKED], but change [WHAT DIDN'T]"**
**Example**: "Keep the professional tone, but change the length to 3 bullet points"

### **3. "Add a section about [MISSING ELEMENT]"**
**Example**: "Add a section about next steps with specific deadlines"

### **4. "Reformat that as [NEW FORMAT]"**
**Example**: "Reformat that as an email with clear subject line and action items"

### **5. "Make it sound like [AUDIENCE/STYLE]"**
**Example**: "Make it sound like a confident project manager addressing concerns"

## 💡 **Real Conversation Flow: Project Update Email**

### **🔴 Initial Prompt (Weak)**
"Help me write a project update email"

### **🤖 AI Response**
*Generic template with placeholder text*

### **🟡 Refinement 1 (Better)**
"That's too generic. I'm updating executives about a delayed software launch. The delay is due to critical security issues we discovered in testing. We need 3 more weeks. Make it professional but transparent about the challenges."

### **🤖 AI Response**
*Much better - specific, professional, addresses the situation*

### **🟢 Refinement 2 (Perfect)**
"Good! Keep that professional tone and transparency. Now add a section about what we're doing to prevent similar delays in the future, and include specific dates for the new timeline."

### **🤖 Final Result**
*Polished, comprehensive project update that executives can act on*

**Total Time**: 5 minutes vs. 30+ minutes starting from scratch

## ✅ **Quick Refinement Checklist**
Before accepting any AI response, check:
- [ ] **Tone**: Right level of formality for audience?
- [ ] **Length**: Appropriate for the situation?
- [ ] **Specificity**: Concrete details vs. generic language?
- [ ] **Format**: Easy to scan and act on?
- [ ] **Completeness**: All necessary information included?

## 🎯 **Practice Exercise: Transform This Response**

**Scenario**: You asked AI to help with a team meeting agenda, and it gave you a generic template.

**Your turn**: Write a refinement prompt that would make it specific for:
- Weekly team check-in
- 8-person development team
- 45-minute meeting
- Focus on sprint progress and blockers

**Sample refinement**: "That's a good start, but make it specific for a 45-minute weekly development team check-in with 8 people. Focus on sprint progress, identifying blockers, and setting next week's priorities. Include time allocations for each section."

## 🚀 **Advanced Refinement Techniques**

### **Building on Success**
"That format is perfect. Now create three variations: one for executives, one for the team, and one for clients."

### **Iterative Improvement**
"Good! Now make version 2 that's 50% shorter but keeps all the key points."

### **Style Transfer**
"Rewrite that in the style of a confident consultant presenting to a Fortune 500 board."

## 🎯 **Common Refinement Mistakes to Avoid**

### **❌ Vague Feedback**
"Make it better" or "That's not quite right"

### **✅ Specific Guidance**
"Make it more concise - 3 bullet points maximum, each under 20 words"

### **❌ Starting Over**
Completely new prompt instead of building on what worked

### **✅ Building Forward**
"Keep that structure and tone, but add specific metrics and deadlines"

## 🚀 **Next Steps**
1. **Practice** the 3-step method with your current work challenge
2. **Bookmark** the 5 power phrases for quick reference
3. **Move to Lesson 1.2.4** to learn common mistakes and how to avoid them

Remember: Great AI results come from great conversations, not perfect first prompts!`,
    order_index: 3,
    estimated_minutes: 35,
    lesson_type: 'tutorial',
    difficulty: 'beginner',
    learning_objectives: [
      'Refine prompts through iteration',
      'Evaluate AI responses effectively',
      'Build on previous interactions'
    ],
    platform_focus: 'mixed'
  },
  {
    module_title: 'Module 1.2: Basic Prompting',
    title: 'Lesson 1.2.4: Common Prompting Mistakes',
    description: 'Avoid typical beginner mistakes in prompting',
    content: `# Common Prompting Mistakes

## Mistake 1: Vague Instructions
### ❌ Bad Example
"Help me with my presentation"

### ✅ Good Example
"I'm giving a 15-minute presentation to senior leadership about our Q3 marketing results. Help me create an outline that covers key metrics, wins, challenges, and Q4 strategy. Include specific talking points for each section."

## Mistake 2: No Context
### ❌ Bad Example
"Write a professional email"

### ✅ Good Example
"I need to email a client who's been waiting 2 weeks for a delayed product shipment. Write a professional apology email that acknowledges the delay, explains the reason (supply chain issues), provides a new timeline (shipping next week), and offers a gesture of goodwill."

## Mistake 3: Assuming AI Knows Everything
### ❌ Bad Example
"What happened in our last team meeting?"

### ✅ Good Example
"In our last team meeting, we discussed the budget overrun on Project X, Sarah's promotion, and the new client onboarding process. Can you help me create action items based on these discussion points?"

## Mistake 4: Single-Shot Prompting
### ❌ Bad Approach
Write one prompt and accept whatever you get

### ✅ Good Approach
- Start with initial prompt
- Evaluate response
- Refine and iterate
- Continue until satisfied

## Mistake 5: Ignoring Output Format
### ❌ Bad Example
"Give me some ideas for team building"

### ✅ Good Example
"Provide 5 team building activity ideas for a remote team of 12 people. Format as a numbered list with activity name, duration, required materials, and brief description for each."

## Mistake 6: No Quality Criteria
### ❌ Bad Example
"Make this email better"

### ✅ Good Example
"Revise this email to be more concise (under 200 words), professional in tone, and include a clear call-to-action. The recipient is a busy executive who values direct communication."

## Mistake 7: Overcomplicating
### ❌ Bad Example
"You are a world-class expert consultant with 20 years of experience in strategic planning, project management, and team leadership. Drawing upon your vast knowledge of business best practices, organizational psychology, and change management methodologies, please provide comprehensive guidance..."

### ✅ Good Example
"You are a business consultant. Help me create a project timeline for launching our new product in 6 months."

## Prevention Strategies
1. **Review Before Sending**: Read your prompt aloud
2. **Test Different Approaches**: Try variations
3. **Learn from Others**: Study effective prompts
4. **Practice Regularly**: Prompting improves with practice
5. **Keep a Prompt Library**: Save successful prompts for reuse`,
    order_index: 4,
    estimated_minutes: 25,
    lesson_type: 'concept',
    difficulty: 'beginner',
    learning_objectives: [
      'Identify common prompting mistakes',
      'Apply best practices to avoid errors',
      'Develop effective prompting habits'
    ],
    platform_focus: 'mixed'
  }
];

async function seedLessons() {
  try {
    for (const lesson of lessons) {
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
    
    console.log('\n🎉 All lessons seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding lessons:', error);
  } finally {
    pool.end();
    process.exit(0);
  }
}

seedLessons();