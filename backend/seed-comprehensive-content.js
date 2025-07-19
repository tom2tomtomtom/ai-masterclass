const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://fsohtauqtcftdjcjfdpq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzb2h0YXVxdGNmdGRqY2pmZHBxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIyNjc4MCwiZXhwIjoyMDY3ODAyNzgwfQ.vLRzjcMIrpn8m3nEDI7pE7bSZg20Msdw60CHcsV1otI';

console.log('🚀 Starting comprehensive content seeding...');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Comprehensive course data structure
const comprehensiveCourseData = {
  courses: [
    {
      title: 'AI Fundamentals & Prompt Engineering',
      description: 'Master the foundations of AI and learn to craft effective prompts for maximum productivity',
      level: 1,
      order_index: 1,
      estimated_hours: 12,
      status: 'published',
      modules: [
        {
          title: 'Understanding AI: Concepts and Applications',
          description: 'Learn what AI is, how it works, and its practical applications in business',
          order_index: 1,
          module_type: 'theory',
          estimated_minutes: 60,
          lessons: [
            {
              title: 'What is AI and How Does it Work?',
              description: 'Comprehensive introduction to artificial intelligence fundamentals',
              content: `# What is AI and How Does it Work?

## Introduction to Artificial Intelligence

Artificial Intelligence (AI) is the simulation of human intelligence in machines that are programmed to think like humans and mimic their actions. The term may also be applied to any machine that exhibits traits associated with a human mind such as learning and problem-solving.

### Key Concepts:

**1. Machine Learning**
Machine learning is a subset of AI that provides systems the ability to automatically learn and improve from experience without being explicitly programmed. Think of it as teaching a computer to recognize patterns and make decisions based on data.

**2. Natural Language Processing (NLP)**
NLP is what allows AI systems like ChatGPT and Claude to understand and generate human language. It's the bridge between human communication and computer understanding.

**3. Neural Networks**
These are computing systems inspired by biological neural networks. They're particularly good at recognizing patterns and making predictions based on data.

### How AI Works in Practice:

**Training Phase:**
1. AI systems are trained on massive amounts of data
2. They learn patterns and relationships in this data
3. They develop the ability to make predictions or generate outputs

**Application Phase:**
1. You provide input (like a prompt)
2. The AI processes this using its learned patterns
3. It generates an output based on its understanding

### Types of AI Relevant to Business:

**Narrow AI (What we use today):**
- Designed for specific tasks
- Examples: ChatGPT for writing, image recognition, recommendation systems
- Very good at their specific domain

**General AI (Future concept):**
- Would match human intelligence across all domains
- Currently theoretical
- Not expected for many years

### Why AI Matters for Your Work:

1. **Efficiency**: AI can handle routine tasks much faster than humans
2. **Consistency**: AI doesn't get tired or have bad days
3. **Scale**: AI can work on multiple projects simultaneously
4. **Analysis**: AI can process and find patterns in vast amounts of data
5. **Creativity**: AI can generate ideas and content from different perspectives

### Common Misconceptions:

**❌ "AI will replace all human jobs"**
✅ AI augments human capabilities rather than replacing them

**❌ "AI is perfect and never makes mistakes"**
✅ AI can make errors and needs human oversight

**❌ "You need to be technical to use AI"**
✅ Modern AI tools are designed for non-technical users

### Getting Started with AI:

1. **Start Small**: Begin with simple tasks like writing assistance or research
2. **Learn by Doing**: The best way to understand AI is to use it
3. **Stay Curious**: AI is rapidly evolving, so continuous learning is key
4. **Focus on Applications**: Think about how AI can solve real problems in your work

This foundation will help you understand how to effectively communicate with AI systems and get the best results from your interactions.`,
              order_index: 1,
              estimated_minutes: 30,
              lesson_type: 'tutorial',
              platform_focus: 'mixed'
            },
            {
              title: 'The Prompt Engineering Revolution',
              description: 'Learn the art and science of communicating effectively with AI systems',
              content: `# The Prompt Engineering Revolution

## What is Prompt Engineering?

Prompt engineering is the practice of designing and refining prompts to elicit the best possible responses from AI systems. Think of it as learning a new language—the language of AI communication.

### Why Prompt Engineering Matters:

**The Difference Good Prompts Make:**

❌ **Poor Prompt:** "Write about marketing"
✅ **Good Prompt:** "Write a 500-word blog post about email marketing best practices for small businesses, including 3 specific strategies and real-world examples"

The difference in output quality is dramatic.

### The Anatomy of an Effective Prompt:

**1. Context Setting**
- Who you are
- What you're trying to achieve
- Any relevant background information

**2. Clear Instructions**
- Specific task definition
- Desired format or structure
- Length requirements

**3. Examples (When Helpful)**
- Show the AI what you want
- Provide templates or patterns
- Demonstrate the style you prefer

**4. Constraints and Requirements**
- What to include or avoid
- Tone and style preferences
- Technical specifications

### Essential Prompt Engineering Techniques:

**1. The Role-Playing Technique**
```
"Act as a senior marketing strategist with 10 years of experience in B2B SaaS companies..."
```

**2. The Step-by-Step Approach**
```
"Please approach this in the following steps:
1. Analyze the current situation
2. Identify key opportunities
3. Recommend specific actions
4. Outline implementation timeline"
```

**3. The Format Specification**
```
"Present your response as:
- Executive summary (2-3 sentences)
- Main points (bullet format)
- Action items (numbered list)
- Next steps (timeline format)"
```

**4. The Iterative Refinement**
- Start with a basic prompt
- Analyze the output
- Refine your prompt based on what you learned
- Repeat until you get consistently good results

### Platform-Specific Considerations:

**Claude Strengths:**
- Excellent at long-form analysis
- Strong ethical reasoning
- Great for complex, nuanced tasks

**ChatGPT Strengths:**
- Conversational and iterative
- Strong creative capabilities
- Good for brainstorming and ideation

**Gemini Strengths:**
- Fast and efficient
- Good at factual information
- Strong analytical capabilities

### Common Prompt Engineering Mistakes:

**1. Being Too Vague**
❌ "Help me with my presentation"
✅ "Help me create an outline for a 15-minute presentation about Q4 sales results for my team of 12 sales reps"

**2. Overloading with Information**
❌ Including every possible detail in one massive prompt
✅ Breaking complex tasks into smaller, focused prompts

**3. Not Specifying Format**
❌ Asking for analysis without specifying how you want it structured
✅ Requesting specific formats like tables, bullet points, or step-by-step guides

**4. Ignoring Tone and Style**
❌ Not specifying the intended audience or communication style
✅ Clearly stating whether you want formal, casual, technical, or conversational tone

### Building Your Prompt Library:

**Create Templates for Common Tasks:**

1. **Research Prompt Template:**
```
"Research [TOPIC] and provide:
- Key findings (5-7 bullet points)
- Current trends (3-4 main trends)
- Implications for [YOUR INDUSTRY]
- Recommended next steps
Format as an executive briefing for [AUDIENCE]"
```

2. **Writing Prompt Template:**
```
"Write a [TYPE] about [TOPIC] for [AUDIENCE]:
- Length: [WORD COUNT]
- Tone: [PROFESSIONAL/CASUAL/TECHNICAL]
- Include: [SPECIFIC ELEMENTS]
- Format: [STRUCTURE REQUIREMENTS]
- Call-to-action: [DESIRED ACTION]"
```

3. **Analysis Prompt Template:**
```
"Analyze [SITUATION/DATA] and provide:
- Current state assessment
- Key insights and patterns
- Risk factors and opportunities
- Recommended strategy
- Implementation considerations
Present as a strategic memo for [STAKEHOLDER]"
```

### Measuring Prompt Effectiveness:

**Quality Indicators:**
- Relevance to your actual needs
- Accuracy of information
- Usefulness of insights
- Time saved vs. doing it yourself
- Consistency of good results

**Continuous Improvement:**
- Keep track of prompts that work well
- Note what modifications improve results
- Build a personal library of effective prompts
- Share successful prompts with your team

### The Future of Prompt Engineering:

As AI systems become more sophisticated, prompt engineering will evolve but remain crucial. The ability to communicate effectively with AI will be as important as any technical skill in the modern workplace.

**Key Takeaway:** Prompt engineering is not about tricks or hacks—it's about clear, strategic communication with AI systems to achieve your goals efficiently and effectively.`,
              order_index: 2,
              estimated_minutes: 45,
              lesson_type: 'tutorial',
              platform_focus: 'mixed'
            }
          ]
        },
        {
          title: 'Platform Mastery: Claude, ChatGPT & Gemini',
          description: 'Deep dive into each major AI platform and learn when to use which tool',
          order_index: 2,
          module_type: 'practical',
          estimated_minutes: 90,
          lessons: [
            {
              title: 'Claude AI: The Thoughtful Assistant',
              description: 'Master Claude AI for analysis, reasoning, and ethical decision-making',
              content: `# Claude AI: The Thoughtful Assistant

## Why Claude Stands Out

Claude AI, developed by Anthropic, represents a new approach to AI that prioritizes helpfulness, harmlessness, and honesty. For professionals who need thoughtful, nuanced responses, Claude often provides the most sophisticated analysis available.

### Claude's Core Strengths:

**1. Analytical Depth**
Claude excels at breaking down complex problems and providing multi-layered analysis. It's particularly strong at:
- Strategic business analysis
- Ethical considerations
- Research synthesis
- Long-form writing
- Critical thinking tasks

**2. Nuanced Understanding**
Claude demonstrates sophisticated understanding of context, subtext, and implications:
- Reads between the lines effectively
- Considers multiple perspectives
- Identifies potential unintended consequences
- Provides balanced viewpoints

**3. Conversational Intelligence**
Claude maintains context exceptionally well across long conversations:
- Remembers details from earlier in the conversation
- Builds on previous points naturally
- Adapts its communication style to match yours
- Engages in genuine back-and-forth dialogue

### When to Choose Claude:

**✅ Perfect for:**
- Strategic planning and analysis
- Complex research tasks
- Ethical decision-making
- Long-form content creation
- Sensitive topic discussions
- Multi-step problem solving
- Academic or professional writing

**❌ Less ideal for:**
- Quick, simple tasks
- Creative brainstorming (though still capable)
- Casual conversation
- Technical coding (improving but not its strength)

### Claude's Unique Capabilities:

**1. Constitutional AI Training**
Claude is trained using Constitutional AI, which means:
- More reliable ethical reasoning
- Better at avoiding harmful content
- More thoughtful about complex moral issues
- Transparent about limitations

**2. Extended Context Window**
Claude can handle very long inputs:
- Can process entire documents
- Maintains coherence across lengthy conversations
- Excellent for document analysis and summarization

**3. Careful Reasoning**
Claude tends to think through problems step-by-step:
- Shows its reasoning process
- Considers alternative approaches
- Acknowledges uncertainty when appropriate
- Provides well-structured responses

### Getting the Best Results from Claude:

**1. Provide Rich Context**
Claude works best when you give it plenty of background:
```
"I'm a marketing director at a B2B SaaS company with 50 employees. We're launching a new product feature next quarter and need to develop a go-to-market strategy. Our target audience is IT managers at mid-sized companies. Here's what I need you to analyze..."
```

**2. Ask for Reasoning**
Request that Claude explain its thinking:
```
"Please analyze this situation and walk me through your reasoning process. What factors are you considering, and how are you weighing them?"
```

**3. Encourage Multiple Perspectives**
Claude excels at seeing different viewpoints:
```
"Consider this decision from three perspectives: the customer's view, the business impact, and potential risks. How might each stakeholder see this differently?"
```

**4. Request Structured Analysis**
Claude organizes complex information well:
```
"Break this down into: Current situation, Key challenges, Strategic options, Recommended approach, and Implementation considerations."
```

### Claude's Latest Features and Updates:

**Claude 3 Family:**
- **Claude 3 Haiku**: Fast and cost-effective for simple tasks
- **Claude 3 Sonnet**: Balanced performance for most use cases
- **Claude 3 Opus**: Most powerful for complex reasoning tasks

**Key Improvements:**
- Better at following complex instructions
- Improved coding capabilities
- Enhanced creative abilities
- More accurate factual knowledge

### Best Practices for Claude:

**1. Be Specific About What You Want**
```
❌ "Help me with my presentation"
✅ "Help me structure a 20-minute board presentation about our Q3 results, focusing on revenue growth, customer acquisition, and strategic initiatives. I need talking points for each section."
```

**2. Use Claude for Iterative Development**
Claude excels at building ideas through conversation:
- Start with a broad concept
- Ask Claude to analyze and refine it
- Request specific improvements
- Build complexity gradually

**3. Leverage Claude's Analytical Nature**
Ask questions that require deep thinking:
- "What are the second-order effects of this decision?"
- "What assumptions am I making that might be wrong?"
- "How might this strategy backfire?"
- "What would success look like in 6 months?"

### Real-World Claude Applications:

**Strategic Planning:**
"Analyze our competitive landscape and identify three strategic opportunities we might be overlooking. Consider market trends, customer behavior changes, and our unique capabilities."

**Content Strategy:**
"Review this blog post draft and suggest improvements for clarity, persuasiveness, and engagement. Also identify any logical gaps or unsupported claims."

**Risk Assessment:**
"We're considering entering a new market. What are the potential risks and how might we mitigate them? Think through this systematically."

**Team Communication:**
"Help me write a sensitive email to my team about upcoming restructuring. The tone needs to be honest but reassuring, and I want to maintain trust while being transparent about challenges."

### Claude vs. Other AI Tools:

**Choose Claude When:**
- You need thoughtful, nuanced analysis
- The task involves ethical considerations
- You're working on something important that requires careful thinking
- You want an AI that explains its reasoning
- You need help with complex, multi-faceted problems

**Consider Alternatives When:**
- You need quick, simple answers
- You're doing creative brainstorming
- You need technical coding help
- Speed is more important than depth

### Getting Started with Claude:

1. **Start with Analysis Tasks**: Give Claude something complex to analyze
2. **Engage in Dialogue**: Ask follow-up questions and build on responses
3. **Test Its Reasoning**: Ask it to explain how it reached conclusions
4. **Use for Important Decisions**: Leverage Claude's thoughtful approach for significant choices

Claude's strength lies in its ability to think through complex problems thoughtfully and provide insights that consider multiple angles and potential consequences. It's your best choice when you need an AI that can match the depth of human reasoning.`,
              order_index: 1,
              estimated_minutes: 30,
              lesson_type: 'tutorial',
              platform_focus: 'claude'
            }
          ]
        }
      ]
    },
    {
      title: 'ChatGPT Mastery for Professionals',
      description: 'Complete guide to leveraging ChatGPT for maximum productivity and creativity',
      level: 1,
      order_index: 2,
      estimated_hours: 15,
      status: 'published'
    },
    {
      title: 'Google AI & Gemini Excellence',
      description: 'Harness the power of Google\'s AI ecosystem for advanced applications',
      level: 2,
      order_index: 3,
      estimated_hours: 18,
      status: 'published'
    },
    {
      title: 'Custom GPTs and Advanced Applications',
      description: 'Build custom AI solutions and advanced workflows for your specific needs',
      level: 3,
      order_index: 4,
      estimated_hours: 20,
      status: 'published'
    }
  ]
};

// Function to seed comprehensive course content
async function seedComprehensiveContent() {
  try {
    console.log('📊 Starting comprehensive content seeding...');
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await supabase.from('user_task_progress').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('user_quiz_progress').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('user_progress').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('quizzes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('prompts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('lessons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('modules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    let totalWords = 0;
    let totalContent = 0;
    
    // Seed courses and related content
    for (const courseData of comprehensiveCourseData.courses) {
      console.log(`📚 Creating course: ${courseData.title}`);
      
      // Insert course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: courseData.title,
          description: courseData.description,
          level: courseData.level,
          order_index: courseData.order_index,
          estimated_hours: courseData.estimated_hours,
          status: courseData.status
        })
        .select()
        .single();
        
      if (courseError) {
        console.error('Error creating course:', courseError);
        continue;
      }
      
      console.log(`✅ Course created: ${course.id}`);
      
      // Seed modules if they exist
      if (courseData.modules) {
        for (const moduleData of courseData.modules) {
          console.log(`  📁 Creating module: ${moduleData.title}`);
          
          const { data: module, error: moduleError } = await supabase
            .from('modules')
            .insert({
              course_id: course.id,
              title: moduleData.title,
              description: moduleData.description,
              order_index: moduleData.order_index,
              module_type: moduleData.module_type,
              estimated_minutes: moduleData.estimated_minutes
            })
            .select()
            .single();
            
          if (moduleError) {
            console.error('Error creating module:', moduleError);
            continue;
          }
          
          console.log(`  ✅ Module created: ${module.id}`);
          
          // Seed lessons if they exist
          if (moduleData.lessons) {
            for (const lessonData of moduleData.lessons) {
              console.log(`    📝 Creating lesson: ${lessonData.title}`);
              
              const { data: lesson, error: lessonError } = await supabase
                .from('lessons')
                .insert({
                  module_id: module.id,
                  title: lessonData.title,
                  description: lessonData.description,
                  content: lessonData.content,
                  order_index: lessonData.order_index,
                  estimated_minutes: lessonData.estimated_minutes,
                  lesson_type: lessonData.lesson_type,
                  platform_focus: lessonData.platform_focus
                })
                .select()
                .single();
                
              if (lessonError) {
                console.error('Error creating lesson:', lessonError);
                continue;
              }
              
              console.log(`    ✅ Lesson created: ${lesson.id}`);
              totalWords += lessonData.content.length;
              totalContent++;
              
              // Add sample prompts for each lesson
              const samplePrompts = [
                {
                  title: `Essential ${lessonData.platform_focus} Prompt`,
                  description: `Ready-to-use prompt for ${lessonData.title.toLowerCase()}`,
                  prompt_text: `Please help me understand [SPECIFIC TOPIC] by:\n1. Explaining the key concepts in simple terms\n2. Providing a practical example\n3. Suggesting next steps for implementation\n\nContext: I'm working on [YOUR PROJECT/SITUATION] and need to [YOUR SPECIFIC GOAL].`,
                  platform: lessonData.platform_focus === 'mixed' ? 'claude' : lessonData.platform_focus,
                  category: 'basic',
                  use_case: 'Learning and understanding new concepts',
                  expected_output: 'Clear explanation with practical examples and actionable steps',
                  order_index: 1
                },
                {
                  title: `Advanced Analysis Prompt`,
                  description: `Deep-dive prompt for complex analysis`,
                  prompt_text: `Act as a senior consultant and analyze [SITUATION/PROBLEM] by:\n1. Breaking down the current state\n2. Identifying key challenges and opportunities\n3. Recommending specific solutions\n4. Outlining implementation timeline\n\nConsider multiple perspectives and potential risks. Present your analysis in a structured format suitable for executive review.`,
                  platform: lessonData.platform_focus === 'mixed' ? 'claude' : lessonData.platform_focus,
                  category: 'advanced',
                  use_case: 'Strategic analysis and decision-making',
                  expected_output: 'Comprehensive analysis with strategic recommendations',
                  order_index: 2
                }
              ];
              
              for (const promptData of samplePrompts) {
                const { error: promptError } = await supabase
                  .from('prompts')
                  .insert({
                    lesson_id: lesson.id,
                    ...promptData
                  });
                  
                if (promptError) {
                  console.error('Error creating prompt:', promptError);
                }
              }
              
              // Add sample quiz
              const { error: quizError } = await supabase
                .from('quizzes')
                .insert({
                  lesson_id: lesson.id,
                  title: `${lessonData.title} Knowledge Check`,
                  description: `Test your understanding of ${lessonData.title.toLowerCase()}`,
                  question_text: `What is the most important concept covered in "${lessonData.title}"?`,
                  question_type: 'multiple_choice',
                  options: JSON.stringify([
                    { value: 'a', text: 'Understanding the basic principles' },
                    { value: 'b', text: 'Applying the concepts practically' },
                    { value: 'c', text: 'Mastering the advanced techniques' },
                    { value: 'd', text: 'All of the above' }
                  ]),
                  correct_answer: 'd',
                  explanation: 'Effective learning requires understanding principles, practical application, and advanced technique mastery.',
                  order_index: 1
                });
                
              if (quizError) {
                console.error('Error creating quiz:', quizError);
              }
              
              // Add sample task
              const { error: taskError } = await supabase
                .from('tasks')
                .insert({
                  lesson_id: lesson.id,
                  title: `Apply ${lessonData.title} Concepts`,
                  description: `Hands-on practice with ${lessonData.title.toLowerCase()}`,
                  instructions: `Complete this practical exercise:\n\n1. Choose a real scenario from your work\n2. Apply the concepts from "${lessonData.title}"\n3. Document your approach and results\n4. Reflect on what worked well and what could be improved\n\nSubmit a brief summary of your experience and key learnings.`,
                  platform: lessonData.platform_focus === 'mixed' ? 'claude' : lessonData.platform_focus,
                  task_type: 'practical_application',
                  validation_criteria: 'Clear demonstration of concept application with thoughtful reflection',
                  submission_format: 'text',
                  estimated_minutes: lessonData.estimated_minutes || 30,
                  order_index: 1
                });
                
              if (taskError) {
                console.error('Error creating task:', taskError);
              }
            }
          }
        }
      }
    }
    
    // Add additional comprehensive prompts
    console.log('📋 Adding comprehensive prompt library...');
    
    // Get all lessons to add more prompts
    const { data: allLessons } = await supabase
      .from('lessons')
      .select('id, title, platform_focus');
      
    if (allLessons) {
      const additionalPrompts = [
        {
          title: 'Research & Analysis Template',
          description: 'Comprehensive research prompt for any topic',
          prompt_text: `Research [TOPIC] thoroughly and provide:\n\n**Executive Summary** (2-3 sentences)\n- Key findings overview\n\n**Main Analysis** (5-7 bullet points)\n- Current state and trends\n- Key opportunities and challenges\n- Market dynamics and forces\n\n**Strategic Implications**\n- What this means for [YOUR INDUSTRY/COMPANY]\n- Potential impact on business operations\n- Competitive considerations\n\n**Recommendations**\n- 3-5 specific action items\n- Priority level and timeline\n- Resource requirements\n\n**Next Steps**\n- Immediate actions (next 30 days)\n- Medium-term initiatives (3-6 months)\n- Long-term strategic moves (6+ months)\n\nFormat as a professional briefing document suitable for executive review.`,
          platform: 'claude',
          category: 'professional',
          use_case: 'Comprehensive research and strategic analysis',
          expected_output: 'Professional research briefing with actionable insights'
        },
        {
          title: 'Content Creation Powerhouse',
          description: 'All-in-one content development prompt',
          prompt_text: `Create compelling content about [TOPIC] for [TARGET AUDIENCE]:\n\n**Content Specifications:**\n- Format: [BLOG POST/EMAIL/SOCIAL/PRESENTATION]\n- Length: [WORD COUNT]\n- Tone: [PROFESSIONAL/CASUAL/PERSUASIVE/EDUCATIONAL]\n- Goal: [INFORM/PERSUADE/ENTERTAIN/CONVERT]\n\n**Required Elements:**\n- Attention-grabbing headline\n- Clear value proposition\n- Supporting evidence/examples\n- Strong call-to-action\n\n**Constraints:**\n- Must include: [SPECIFIC REQUIREMENTS]\n- Must avoid: [RESTRICTIONS]\n- Brand voice: [DESCRIPTION]\n\n**Additional Context:**\n[BACKGROUND INFORMATION]\n\nProvide the main content plus 3 alternative headline options and suggested social media snippets for promotion.`,
          platform: 'chatgpt',
          category: 'creative',
          use_case: 'Professional content creation and marketing',
          expected_output: 'Complete content package with headlines and promotional materials'
        },
        {
          title: 'Problem-Solving Framework',
          description: 'Systematic approach to complex problem solving',
          prompt_text: `Help me solve this problem systematically: [PROBLEM DESCRIPTION]\n\n**Step 1: Problem Definition**\n- Restate the problem clearly\n- Identify root causes vs. symptoms\n- Define success criteria\n\n**Step 2: Stakeholder Analysis**\n- Who is affected by this problem?\n- What are their interests and concerns?\n- Who has decision-making authority?\n\n**Step 3: Solution Generation**\n- Brainstorm 5-7 potential solutions\n- Consider both conventional and creative approaches\n- Include short-term fixes and long-term solutions\n\n**Step 4: Evaluation Matrix**\n- Assess each solution on: feasibility, cost, timeline, impact\n- Rate from 1-5 and provide reasoning\n- Identify top 3 recommendations\n\n**Step 5: Implementation Plan**\n- Detailed plan for #1 recommendation\n- Key milestones and timelines\n- Resource requirements\n- Risk mitigation strategies\n\n**Step 6: Success Metrics**\n- How will we measure success?\n- What indicators should we track?\n- When should we evaluate progress?\n\nPresent findings as a structured problem-solving report.`,
          platform: 'claude',
          category: 'analytical',
          use_case: 'Complex problem solving and strategic planning',
          expected_output: 'Comprehensive problem-solving analysis with actionable plan'
        }
      ];
      
      // Add these prompts to random lessons
      for (let i = 0; i < additionalPrompts.length && i < allLessons.length; i++) {
        const lesson = allLessons[i];
        const promptData = additionalPrompts[i];
        
        await supabase
          .from('prompts')
          .insert({
            lesson_id: lesson.id,
            title: promptData.title,
            description: promptData.description,
            prompt_text: promptData.prompt_text,
            platform: promptData.platform,
            category: promptData.category,
            use_case: promptData.use_case,
            expected_output: promptData.expected_output,
            order_index: 3
          });
      }
    }
    
    console.log('\n🎉 Comprehensive content seeding completed!');
    console.log(`📊 Final Statistics:`);
    console.log(`   - Total content pieces: ${totalContent}`);
    console.log(`   - Estimated total words: ${totalWords.toLocaleString()}`);
    console.log(`   - Courses: ${comprehensiveCourseData.courses.length}`);
    console.log(`   - Interactive elements: Prompts, Quizzes, Tasks added`);
    
    // Verify content
    const { data: courseCount } = await supabase
      .from('courses')
      .select('id', { count: 'exact' });
      
    const { data: lessonCount } = await supabase
      .from('lessons')
      .select('id', { count: 'exact' });
      
    const { data: promptCount } = await supabase
      .from('prompts')
      .select('id', { count: 'exact' });
      
    console.log(`\n✅ Database Verification:`);
    console.log(`   - Courses in database: ${courseCount?.length || 0}`);
    console.log(`   - Lessons in database: ${lessonCount?.length || 0}`);
    console.log(`   - Prompts in database: ${promptCount?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Error during content seeding:', error);
    throw error;
  }
}

// Run the seeding
if (require.main === module) {
  seedComprehensiveContent()
    .then(() => {
      console.log('🚀 Content seeding completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Content seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedComprehensiveContent };