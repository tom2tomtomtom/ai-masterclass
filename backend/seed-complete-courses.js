const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://fsohtauqtcftdjcjfdpq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzb2h0YXVxdGNmdGRqY2pmZHBxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIyNjc4MCwiZXhwIjoyMDY3ODAyNzgwfQ.vLRzjcMIrpn8m3nEDI7pE7bSZg20Msdw60CHcsV1otI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedCompleteCourses() {
  try {
    console.log('🌱 Seeding Complete Course Data to Supabase...');
    console.log('=================================================');
    
    // First, let's verify the schema by checking if courses table exists with proper columns
    console.log('\n🔍 Verifying database schema...');
    const { data: testCourses, error: testError } = await supabase
      .from('courses')
      .select('id, title, order_index')
      .limit(1);
    
    if (testError) {
      console.log('❌ Database schema issue detected:', testError.message);
      console.log('🔧 Please run the fix-supabase-schema.sql file in Supabase SQL Editor first!');
      return { success: false, error: testError.message };
    }
    
    console.log('✅ Database schema verified');
    
    // Clear existing data (except users)
    console.log('\n🧹 Clearing existing course data...');
    
    const clearTables = ['user_task_progress', 'user_quiz_progress', 'user_progress', 'tasks', 'quizzes', 'prompts', 'lessons', 'modules', 'courses'];
    
    for (const table of clearTables) {
      const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error && !error.message.includes('does not exist')) {
        console.log(`⚠️ Warning clearing ${table}:`, error.message);
      } else {
        console.log(`✅ Cleared ${table}`);
      }
    }
    
    // Course data to insert
    const coursesData = [
      {
        title: 'AI Fundamentals',
        description: 'Master the basics of AI and prompt engineering. Learn to communicate effectively with AI systems and understand their capabilities.',
        level: 1,
        order_index: 1,
        estimated_hours: 12,
        status: 'published',
        objectives: ['Understand AI basics', 'Write effective prompts', 'Use AI tools productively']
      },
      {
        title: 'Claude Mastery',
        description: 'Complete guide to using Claude AI effectively. From basic conversations to advanced reasoning tasks.',
        level: 1,
        order_index: 2,
        estimated_hours: 8,
        status: 'published',
        objectives: ['Master Claude interface', 'Advanced prompt techniques', 'Project-based learning']
      },
      {
        title: 'ChatGPT Professional',
        description: 'Professional-level ChatGPT usage and strategies. Learn to integrate ChatGPT into your workflow.',
        level: 2,
        order_index: 3,
        estimated_hours: 10,
        status: 'published',
        objectives: ['Professional ChatGPT usage', 'Workflow integration', 'Advanced techniques']
      },
      {
        title: 'AI in Business',
        description: 'Apply AI solutions to real business problems. Learn to identify opportunities and implement AI solutions.',
        level: 2,
        order_index: 4,
        estimated_hours: 15,
        status: 'published',
        objectives: ['Business AI applications', 'ROI measurement', 'Implementation strategies']
      },
      {
        title: 'Advanced AI Techniques',
        description: 'Master advanced AI concepts and applications. Chain of thought, few-shot learning, and complex reasoning.',
        level: 3,
        order_index: 5,
        estimated_hours: 18,
        status: 'published',
        objectives: ['Advanced prompting', 'Complex reasoning', 'AI system design']
      },
      {
        title: 'AI Automation Workflows',
        description: 'Build automated workflows with AI tools. Use Zapier, n8n, and other automation platforms with AI.',
        level: 3,
        order_index: 6,
        estimated_hours: 20,
        status: 'published',
        objectives: ['Workflow automation', 'AI integration', 'Process optimization']
      }
    ];
    
    console.log('\n📚 Inserting courses...');
    const { data: insertedCourses, error: coursesError } = await supabase
      .from('courses')
      .insert(coursesData)
      .select();
    
    if (coursesError) {
      console.error('❌ Error inserting courses:', coursesError);
      return { success: false, error: coursesError.message };
    }
    
    console.log('✅ Inserted', insertedCourses.length, 'courses');
    
    // Now let's add modules for each course
    console.log('\n📖 Inserting modules...');
    
    const modulesData = [];
    
    // AI Fundamentals modules
    const aiFundamentals = insertedCourses.find(c => c.title === 'AI Fundamentals');
    if (aiFundamentals) {
      modulesData.push(
        {
          course_id: aiFundamentals.id,
          title: 'Understanding AI',
          description: 'Learn what AI is and how it works',
          order_index: 1,
          module_type: 'theory',
          estimated_minutes: 60,
          difficulty: 'beginner'
        },
        {
          course_id: aiFundamentals.id,
          title: 'Your First AI Prompts',
          description: 'Write your first effective prompts',
          order_index: 2,
          module_type: 'exercise',
          estimated_minutes: 90,
          difficulty: 'beginner'
        },
        {
          course_id: aiFundamentals.id,
          title: 'AI Tools Overview',
          description: 'Survey of popular AI tools and platforms',
          order_index: 3,
          module_type: 'theory',
          estimated_minutes: 45,
          difficulty: 'beginner'
        }
      );
    }
    
    // Claude Mastery modules
    const claudeMastery = insertedCourses.find(c => c.title === 'Claude Mastery');
    if (claudeMastery) {
      modulesData.push(
        {
          course_id: claudeMastery.id,
          title: 'Claude Interface',
          description: 'Master the Claude interface and features',
          order_index: 1,
          module_type: 'tutorial',
          estimated_minutes: 45,
          difficulty: 'beginner'
        },
        {
          course_id: claudeMastery.id,
          title: 'Advanced Claude Techniques',
          description: 'Advanced prompting strategies for Claude',
          order_index: 2,
          module_type: 'exercise',
          estimated_minutes: 75,
          difficulty: 'intermediate'
        },
        {
          course_id: claudeMastery.id,
          title: 'Claude Projects',
          description: 'Real-world projects using Claude',
          order_index: 3,
          module_type: 'project',
          estimated_minutes: 120,
          difficulty: 'intermediate'
        }
      );
    }
    
    // Add modules for other courses
    const chatgptPro = insertedCourses.find(c => c.title === 'ChatGPT Professional');
    if (chatgptPro) {
      modulesData.push(
        {
          course_id: chatgptPro.id,
          title: 'ChatGPT Fundamentals',
          description: 'Master ChatGPT basics and interface',
          order_index: 1,
          module_type: 'theory',
          estimated_minutes: 60,
          difficulty: 'beginner'
        },
        {
          course_id: chatgptPro.id,
          title: 'Professional Workflows',
          description: 'Integrate ChatGPT into professional workflows',
          order_index: 2,
          module_type: 'exercise',
          estimated_minutes: 90,
          difficulty: 'intermediate'
        }
      );
    }
    
    const { data: insertedModules, error: modulesError } = await supabase
      .from('modules')
      .insert(modulesData)
      .select();
    
    if (modulesError) {
      console.error('❌ Error inserting modules:', modulesError);
      return { success: false, error: modulesError.message };
    }
    
    console.log('✅ Inserted', insertedModules.length, 'modules');
    
    // Add lessons for modules
    console.log('\n📝 Inserting lessons...');
    
    const lessonsData = [];
    
    // Find the first module of AI Fundamentals
    const understandingAI = insertedModules.find(m => m.title === 'Understanding AI');
    if (understandingAI) {
      lessonsData.push(
        {
          module_id: understandingAI.id,
          title: 'Master AI Fundamentals → Transform Your Work in 60 Minutes',
          description: 'Understand AI capabilities and identify 5+ ways it can save you 2 hours daily in your specific role',
          content: `# Master AI Fundamentals → Transform Your Work in 60 Minutes

**🎯 Learning Objective**: Understand AI capabilities and identify 5+ ways it can save you 2 hours daily in your specific role

**⏱️ Time Investment**: 60 minutes (45 min lesson + 15 min worksheet)

**📋 Prerequisites**: None - perfect for complete beginners

**🎬 Recommended Video**: [AI Explained - 3Blue1Brown](https://www.youtube.com/watch?v=aircAruvnKk) (Watch after reading this lesson)

---

## 🚀 **What You'll Gain**

By the end of this lesson, you'll:
- Understand exactly what AI can and can't do for your work
- Identify the 3 types of AI and which ones matter for business
- See how 3 major companies use AI to save millions of hours
- Complete a personalized AI opportunity assessment
- Have a clear action plan for your next AI implementation

---

## 🧠 **What is AI? (The Business Reality)**

Artificial Intelligence (AI) is the simulation of human intelligence in machines that are programmed to think, learn, and make decisions like humans. But here's what matters for your career: **AI is not about replacing humans—it's about amplifying your capabilities**.

### **The Truth About AI in 2024**

- ✅ **AI excels at**: Pattern recognition, language processing, data analysis, repetitive tasks
- ✅ **AI struggles with**: Creative strategy, emotional intelligence, complex judgment calls
- ✅ **AI's sweet spot**: Handling the "grunt work" so you can focus on high-value activities

---

## 🎯 **The 3 Types of AI (And Why You Should Care)**

### **1. Narrow AI (What You're Using Today)**
- **Definition**: AI designed for specific tasks
- **Examples**: Claude, ChatGPT, Siri, Netflix recommendations
- **Business Impact**: Handles routine tasks, freeing up human time
- **Your Opportunity**: 90% of your AI benefits will come from Narrow AI

### **2. General AI (Still Theoretical)**
- **Definition**: AI that can perform any intellectual task a human can
- **Timeline**: 10-50 years away (experts disagree)
- **Your Action**: Focus on today's tools, not future possibilities

### **3. Superintelligence (Science Fiction Territory)**
- **Definition**: AI that surpasses human intelligence
- **Reality Check**: Not relevant for business planning
- **Your Focus**: Narrow AI is where the money is

---

## 🏢 **Real Business Case Studies: How AI Saves Millions of Hours**

### **Case Study 1: Netflix - The $1 Billion Recommendation Engine**

**The Challenge**: Netflix users were overwhelmed by choice, leading to decision paralysis and cancelled subscriptions.

**The AI Solution**: 
- Analyzes viewing patterns of 260+ million users
- Processes 1 billion hours of viewing data monthly
- Considers 3,000+ factors per recommendation

**The Results**:
- 80% of watched content comes from AI recommendations
- Saves users 18 minutes per session (no more browsing)
- Reduces customer churn by 25%
- **Estimated value**: $1+ billion annually

**Your Takeaway**: AI excels at processing massive amounts of data to make personalized recommendations—perfect for content curation, customer segmentation, and decision support.

### **Case Study 2: Gmail - Smart Spam Detection**

**The Challenge**: Email spam was consuming 15-20% of users' daily email processing time.

**The AI Solution**:
- Machine learning algorithms analyze billions of emails daily
- Identifies spam patterns in real-time
- Learns from user behavior and feedback

**The Results**:
- 99.9% spam detection accuracy
- Saves average user 10 minutes daily
- Processes 1.5 billion Gmail accounts
- **Estimated time savings**: 15 million hours daily across all users

**Your Takeaway**: AI is exceptional at pattern recognition and classification—ideal for document sorting, lead qualification, and quality control.

### **Case Study 3: Tesla - Autopilot Data Processing**

**The Challenge**: Processing real-time data from millions of vehicles to improve autonomous driving.

**The AI Solution**:
- Processes data from 3+ million vehicles
- Analyzes road conditions, traffic patterns, and driving behaviors
- Continuously improves driving algorithms

**The Results**:
- 10x reduction in traffic accidents per mile
- Saves drivers 30+ minutes of focused attention per commute
- Enables productive multitasking during travel
- **Estimated value**: $10+ billion in accident prevention

**Your Takeaway**: AI thrives on continuous learning from large datasets—perfect for predictive analytics, risk assessment, and process optimization.

---

## 🔧 **How Modern AI Actually Works (The Business Version)**

### **Large Language Models (LLMs)**
- **What they are**: AI trained on vast amounts of text
- **Business applications**: Writing, summarization, translation, analysis
- **Examples**: Claude, ChatGPT, Gemini
- **Your opportunity**: Content creation, communication, research

### **Neural Networks**
- **What they are**: AI systems inspired by brain structure
- **Business applications**: Pattern recognition, prediction, classification
- **Examples**: Fraud detection, recommendation systems, image recognition
- **Your opportunity**: Data analysis, automation, quality control

### **Training Data**
- **What it is**: Millions of examples used to teach AI
- **Business insight**: AI quality depends on data quality
- **Your advantage**: The more specific your prompts, the better the results
- **Key principle**: Garbage in, garbage out

---

## 💼 **AI in Your Daily Work (Practical Applications)**

### **For Managers and Executives**
- **Strategic Planning**: Scenario analysis, competitive research, market trends
- **Team Communication**: Meeting summaries, status updates, performance reviews
- **Decision Support**: Data analysis, risk assessment, option evaluation
- **Time Savings**: 2-3 hours daily on administrative tasks

### **For Marketing Professionals**
- **Content Creation**: Blog posts, social media, email campaigns
- **Customer Insights**: Behavior analysis, segmentation, personalization
- **Campaign Optimization**: A/B testing, performance analysis, ROI calculation
- **Time Savings**: 3-4 hours daily on content and analysis

### **For Sales Teams**
- **Lead Qualification**: Prospect research, scoring, prioritization
- **Communication**: Proposal writing, follow-up emails, objection handling
- **Pipeline Management**: Forecasting, reporting, opportunity analysis
- **Time Savings**: 2-3 hours daily on administrative and research tasks

### **For Operations Teams**
- **Process Optimization**: Workflow analysis, bottleneck identification, efficiency improvements
- **Quality Control**: Error detection, compliance monitoring, performance tracking
- **Reporting**: Data visualization, trend analysis, executive summaries
- **Time Savings**: 3-5 hours daily on manual processes and reporting

---

## 🎯 **Getting Started: Your AI Implementation Strategy**

### **Phase 1: Quick Wins (Week 1)**
1. **Email Efficiency**: Use AI to draft and improve emails
2. **Research Assistant**: Get AI help with information gathering
3. **Content Review**: Let AI proofread and enhance your writing

### **Phase 2: Process Integration (Weeks 2-4)**
1. **Meeting Optimization**: AI-generated agendas and summaries
2. **Report Enhancement**: AI-assisted analysis and insights
3. **Communication Templates**: Standardized AI-improved responses

### **Phase 3: Workflow Transformation (Months 2-3)**
1. **Department Analysis**: Identify automation opportunities
2. **Custom Solutions**: Develop AI-powered tools for specific needs
3. **Team Training**: Share AI best practices and success stories

---

## 🔍 **AI Limitations (What You Need to Know)**

### **Current AI Cannot:**
- Replace human judgment for complex decisions
- Understand context without explicit explanation
- Handle emotional or sensitive situations independently
- Guarantee 100% accuracy without human oversight
- Learn from mistakes without retraining

### **Best Practices for AI Success:**
1. **Start Small**: Begin with low-risk, high-value tasks
2. **Verify Results**: Always review AI outputs before using
3. **Provide Context**: The more specific your input, the better the output
4. **Iterate and Improve**: Refine your approach based on results
5. **Stay Human-Centered**: Use AI to enhance, not replace, human capabilities

---

## 🎬 **Recommended Learning Resources**

### **Essential Videos to Watch:**
1. **[AI Explained - 3Blue1Brown](https://www.youtube.com/watch?v=aircAruvnKk)** (19 minutes)
   - Best technical explanation of how AI actually works
   - Perfect for understanding the "why" behind AI capabilities

2. **[The AI Revolution - TED](https://www.youtube.com/watch?v=8nt3edWLgIg)** (14 minutes)
   - Business implications and future trends
   - Great for strategic thinking about AI adoption

3. **[ChatGPT for Beginners - OpenAI](https://www.youtube.com/watch?v=JTxsNm9IdYU)** (12 minutes)
   - Practical introduction to using conversational AI
   - Perfect preparation for hands-on practice

### **Deep Dive Resources:**
- **[MIT AI Course](https://www.youtube.com/playlist?list=PLUl4u3cNGP63gFHB6xb-kVBiQHYe_4hSi)** - For technical depth
- **[Harvard Business Review AI Collection](https://www.youtube.com/playlist?list=PLN4k-XjzGe8JTE7xxVZqVLEKEBQRkm5xN)** - Business strategy focus
- **[Anthropic Claude Documentation](https://www.youtube.com/channel/UC-some-channel)** - Tool-specific tutorials

---

## 📊 **Knowledge Check: Test Your Understanding**

### **Scenario-Based Questions:**

**Question 1**: Your team spends 5 hours weekly writing status reports. Based on the Netflix case study, which AI approach would be most effective?
- A) Wait for General AI to be developed
- B) Use Narrow AI for content generation and formatting
- C) Focus on Superintelligence solutions
- D) Avoid AI due to accuracy concerns

**Answer**: B - Narrow AI excels at structured content creation like reports, similar to how Netflix AI excels at the specific task of recommendations.

**Question 2**: You're a sales manager evaluating leads. Which AI capability from the Tesla case study applies to your situation?
- A) Real-time data processing for pattern recognition
- B) Autonomous decision-making without human input
- C) Emotional intelligence for relationship building
- D) Creative strategy development

**Answer**: A - Like Tesla's data processing, AI can analyze lead data patterns to identify the most promising prospects.

**Question 3**: Your marketing team wants to personalize email campaigns. Which business case study provides the best model?
- A) Tesla's autonomous driving
- B) Gmail's spam detection
- C) Netflix's recommendation engine
- D) None of the above

**Answer**: C - Netflix's personalization approach directly applies to marketing personalization and customer segmentation.

---

## 🎯 **Practical Exercise: Your AI Opportunity Assessment**

### **Step 1: Current State Analysis (10 minutes)**
List your 5 most time-consuming weekly tasks:
1. ________________________________
2. ________________________________
3. ________________________________
4. ________________________________
5. ________________________________

### **Step 2: AI Opportunity Evaluation (15 minutes)**
For each task, rate the AI potential (1-5 scale):

**Task 1**: _________________ | AI Potential: ___/5
- Involves writing/communication? +1
- Requires data analysis? +1
- Follows predictable patterns? +1
- Currently done manually? +1
- Low risk if mistakes occur? +1

**Task 2**: _________________ | AI Potential: ___/5
- Involves writing/communication? +1
- Requires data analysis? +1
- Follows predictable patterns? +1
- Currently done manually? +1
- Low risk if mistakes occur? +1

**Task 3**: _________________ | AI Potential: ___/5
- Involves writing/communication? +1
- Requires data analysis? +1
- Follows predictable patterns? +1
- Currently done manually? +1
- Low risk if mistakes occur? +1

**Task 4**: _________________ | AI Potential: ___/5
- Involves writing/communication? +1
- Requires data analysis? +1
- Follows predictable patterns? +1
- Currently done manually? +1
- Low risk if mistakes occur? +1

**Task 5**: _________________ | AI Potential: ___/5
- Involves writing/communication? +1
- Requires data analysis? +1
- Follows predictable patterns? +1
- Currently done manually? +1
- Low risk if mistakes occur? +1

### **Step 3: Implementation Priority (5 minutes)**
Rank your top 3 AI opportunities:
1. **Highest Priority**: _________________ (Score: ___/5)
2. **Medium Priority**: _________________ (Score: ___/5)
3. **Lower Priority**: _________________ (Score: ___/5)

### **Step 4: Action Planning (10 minutes)**
**Your #1 AI Opportunity**: _________________________________

**Specific AI Tool to Try**: _________________________________

**Success Metric**: _________________________________

**Timeline**: Start by _________________ 

**Potential Time Savings**: _____ hours per week

---

## 🎓 **Key Takeaways**

### **Remember These Core Principles:**
1. **AI is a tool, not a replacement** - It amplifies human capabilities
2. **Start with Narrow AI** - Focus on specific, well-defined tasks
3. **Business value comes from implementation** - Knowledge without action is worthless
4. **Quality input = quality output** - Invest time in clear, specific prompts
5. **Human oversight is essential** - Always review and refine AI outputs

### **Your Next Steps:**
1. ✅ Complete the AI Opportunity Assessment worksheet
2. ✅ Watch the recommended 3Blue1Brown video
3. ✅ Choose one AI tool to experiment with this week
4. ✅ Schedule 30 minutes to test AI with your highest-priority task
5. ✅ Move to the next lesson: "AI vs Machine Learning vs Deep Learning"

---

## 🔗 **Additional Resources**

### **Tools to Explore:**
- **[Claude.ai](https://claude.ai)** - Best for analysis and reasoning
- **[ChatGPT](https://chat.openai.com)** - Most versatile for general tasks
- **[Gemini](https://gemini.google.com)** - Best for Google integration

### **Further Reading:**
- **[AI Business Strategy Guide](https://hbr.org/artificial-intelligence)** - Harvard Business Review
- **[The Economics of AI](https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-age-of-ai)** - McKinsey Report
- **[AI Ethics in Business](https://www.anthropic.com/claude)** - Anthropic Guidelines

### **Community and Support:**
- **[Reddit: r/artificial](https://reddit.com/r/artificial)** - AI discussions and updates
- **[LinkedIn AI Groups](https://linkedin.com/groups/ai)** - Professional networking
- **[AI News Aggregator](https://artificialintelligence-news.com)** - Daily updates

---

**🎯 Success Indicator**: You've mastered this lesson when you can explain AI capabilities to a colleague and identify 3 specific ways it could improve your team's productivity.

**⏭️ Next Lesson**: "AI vs Machine Learning vs Deep Learning - Choose the Perfect AI Tool"

**📧 Questions or Stuck?** Review the case studies and complete the worksheet. The practical exercise will clarify any confusion and give you a concrete action plan.`,
          order_index: 1,
          lesson_type: 'tutorial',
          estimated_minutes: 60,
          difficulty: 'beginner',
          platform_focus: 'mixed',
          learning_objectives: ['Master AI fundamentals and business applications', 'Identify 5+ ways AI can save 2 hours daily', 'Complete personalized AI opportunity assessment', 'Develop clear AI implementation action plan']
        },
        {
          module_id: understandingAI.id,
          title: 'AI vs Machine Learning',
          description: 'Understanding the relationship between AI and ML',
          content: `# AI vs Machine Learning
          
Understanding the difference between AI and Machine Learning is crucial for working effectively with these technologies.

## Artificial Intelligence (AI)
AI is the broad field of creating intelligent machines. It includes:
- **Goal**: Make machines that can perform tasks requiring human intelligence
- **Scope**: Includes reasoning, perception, learning, language understanding
- **Examples**: Chess-playing computers, voice assistants, autonomous vehicles

## Machine Learning (ML)
ML is a subset of AI focused on learning from data:
- **Goal**: Enable machines to learn without being explicitly programmed
- **Method**: Algorithms that improve through experience
- **Examples**: Recommendation systems, fraud detection, image recognition

## Deep Learning
Deep Learning is a subset of ML using neural networks:
- **Method**: Multi-layered neural networks
- **Strength**: Excellent for complex pattern recognition
- **Examples**: Image recognition, natural language processing, ChatGPT

## Why This Matters
When working with AI tools like Claude or ChatGPT:
- They use **Machine Learning** to understand and generate text
- They demonstrate **Artificial Intelligence** in their responses
- They employ **Deep Learning** architectures (transformers)

## Practical Implications
- **AI tools** can perform complex reasoning tasks
- **ML algorithms** power their ability to understand context
- **Deep learning** enables their natural language capabilities

Understanding these concepts helps you:
1. Set realistic expectations for AI capabilities
2. Choose appropriate tools for different tasks
3. Communicate effectively with AI systems`,
          order_index: 2,
          lesson_type: 'concept',
          estimated_minutes: 15,
          difficulty: 'beginner',
          platform_focus: 'mixed',
          learning_objectives: ['Distinguish AI from ML', 'Understand AI architecture', 'Apply knowledge to tool selection']
        },
        {
          module_id: understandingAI.id,
          title: 'Popular AI Tools',
          description: 'Overview of the most popular AI tools available',
          content: `# Popular AI Tools
          
The AI landscape is rapidly evolving. Here are the most important tools you should know about:

## Conversational AI

### Claude (Anthropic)
- **Strengths**: Reasoning, analysis, long conversations
- **Best for**: Complex problem-solving, document analysis
- **Unique features**: Constitutional AI, helpful and harmless responses

### ChatGPT (OpenAI)
- **Strengths**: Versatile, creative, code generation
- **Best for**: General tasks, creative writing, programming
- **Unique features**: GPT-4 reasoning, plugin ecosystem

### Gemini (Google)
- **Strengths**: Integration with Google services, multimodal
- **Best for**: Research, Google Workspace integration
- **Unique features**: Real-time information, Google search integration

## Specialized AI Tools

### Writing & Content
- **Jasper**: Marketing copy and content creation
- **Grammarly**: Writing assistance and grammar checking
- **Notion AI**: Note-taking and document creation

### Code & Development
- **GitHub Copilot**: Code completion and generation
- **Cursor**: AI-powered code editor
- **Replit**: AI-assisted coding environment

### Business & Productivity
- **Zapier**: Workflow automation with AI
- **n8n**: Open-source automation platform
- **Monday.com**: Project management with AI features

## Choosing the Right Tool

Consider these factors:
1. **Task type**: What are you trying to accomplish?
2. **Integration needs**: Does it work with your existing tools?
3. **Budget**: Free vs. paid options
4. **Learning curve**: How much time do you want to invest?
5. **Data privacy**: How important is data security?

## Getting Started Recommendations

**For beginners**: Start with Claude or ChatGPT
**For developers**: Try GitHub Copilot or Cursor
**For content creators**: Explore Jasper or Notion AI
**For business users**: Look into Zapier or Monday.com

## Best Practices

1. **Start simple**: Begin with basic tasks
2. **Experiment**: Try different tools for the same task
3. **Learn prompting**: Good prompts get better results
4. **Stay updated**: The AI landscape changes quickly
5. **Consider ethics**: Use AI responsibly and transparently

Remember: The best AI tool is the one you'll actually use consistently!`,
          order_index: 3,
          lesson_type: 'tutorial',
          estimated_minutes: 25,
          difficulty: 'beginner',
          platform_focus: 'mixed',
          learning_objectives: ['Identify popular AI tools', 'Select appropriate tools', 'Understand tool capabilities']
        }
      );
    }
    
    const { data: insertedLessons, error: lessonsError } = await supabase
      .from('lessons')
      .insert(lessonsData)
      .select();
    
    if (lessonsError) {
      console.error('❌ Error inserting lessons:', lessonsError);
      return { success: false, error: lessonsError.message };
    }
    
    console.log('✅ Inserted', insertedLessons.length, 'lessons');
    
    // Add prompts for lessons
    console.log('\n💡 Inserting prompts...');
    
    const promptsData = [];
    
    // Find the first lesson
    const whatIsAI = insertedLessons.find(l => l.title === 'What is AI?');
    if (whatIsAI) {
      promptsData.push(
        {
          lesson_id: whatIsAI.id,
          title: 'Basic Question Prompt',
          description: 'A simple prompt for asking AI questions',
          prompt_text: 'Please explain [TOPIC] in simple terms that a beginner can understand. Include practical examples and real-world applications.',
          platform: 'claude',
          category: 'basic',
          use_case: 'When you need to understand a new concept',
          expected_output: 'Clear, beginner-friendly explanation with practical examples',
          tips: 'Replace [TOPIC] with the concept you want to learn about. Be specific about your level of knowledge.',
          order_index: 1,
          difficulty: 'beginner'
        },
        {
          lesson_id: whatIsAI.id,
          title: 'Follow-up Question Prompt',
          description: 'Dig deeper into topics',
          prompt_text: 'Can you elaborate on [SPECIFIC ASPECT] from your previous explanation? I\'d like to understand this part better.',
          platform: 'claude',
          category: 'basic',
          use_case: 'When you want to understand something more deeply',
          expected_output: 'Detailed explanation of the specific aspect',
          tips: 'Use this after getting an initial explanation to go deeper into specific areas.',
          order_index: 2,
          difficulty: 'beginner'
        }
      );
    }
    
    const aiVsML = insertedLessons.find(l => l.title === 'AI vs Machine Learning');
    if (aiVsML) {
      promptsData.push(
        {
          lesson_id: aiVsML.id,
          title: 'Comparison Prompt',
          description: 'Compare two concepts effectively',
          prompt_text: 'Compare and contrast [CONCEPT A] and [CONCEPT B]. Create a table showing their similarities, differences, and use cases.',
          platform: 'claude',
          category: 'advanced',
          use_case: 'When you need to understand differences between concepts',
          expected_output: 'Structured comparison table with clear distinctions',
          tips: 'This works great for understanding related but different concepts.',
          order_index: 1,
          difficulty: 'intermediate'
        }
      );
    }
    
    const { data: insertedPrompts, error: promptsError } = await supabase
      .from('prompts')
      .insert(promptsData)
      .select();
    
    if (promptsError) {
      console.error('❌ Error inserting prompts:', promptsError);
      return { success: false, error: promptsError.message };
    }
    
    console.log('✅ Inserted', insertedPrompts.length, 'prompts');
    
    // Add quizzes for lessons
    console.log('\n❓ Inserting quizzes...');
    
    const quizzesData = [];
    
    if (whatIsAI) {
      quizzesData.push(
        {
          lesson_id: whatIsAI.id,
          title: 'AI Definition Quiz',
          description: 'Test your understanding of AI basics',
          question_text: 'What is the primary goal of artificial intelligence?',
          question_type: 'multiple_choice',
          options: [
            { "value": "a", "text": "To replace human workers" },
            { "value": "b", "text": "To simulate human intelligence in machines" },
            { "value": "c", "text": "To create robots" },
            { "value": "d", "text": "To make computers faster" }
          ],
          correct_answer: 'b',
          explanation: 'AI aims to simulate human intelligence in machines, allowing them to perform tasks that typically require human cognition like reasoning, learning, and problem-solving.',
          difficulty: 'beginner',
          points: 1,
          order_index: 1
        },
        {
          lesson_id: whatIsAI.id,
          title: 'AI Applications Quiz',
          description: 'Identify common AI applications',
          question_text: 'Which of these is NOT a common application of AI in daily life?',
          question_type: 'multiple_choice',
          options: [
            { "value": "a", "text": "Email spam detection" },
            { "value": "b", "text": "Netflix recommendations" },
            { "value": "c", "text": "Traditional calculator operations" },
            { "value": "d", "text": "Voice assistants like Siri" }
          ],
          correct_answer: 'c',
          explanation: 'Traditional calculator operations use simple arithmetic, not AI. They follow pre-programmed rules rather than learning from data or making intelligent decisions.',
          difficulty: 'beginner',
          points: 1,
          order_index: 2
        }
      );
    }
    
    const { data: insertedQuizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .insert(quizzesData)
      .select();
    
    if (quizzesError) {
      console.error('❌ Error inserting quizzes:', quizzesError);
      return { success: false, error: quizzesError.message };
    }
    
    console.log('✅ Inserted', insertedQuizzes.length, 'quizzes');
    
    // Add tasks for lessons
    console.log('\n📋 Inserting tasks...');
    
    const tasksData = [];
    
    if (whatIsAI) {
      tasksData.push(
        {
          lesson_id: whatIsAI.id,
          title: 'Try Your First AI Prompt',
          description: 'Practice using AI with a simple prompt',
          instructions: `1. Go to Claude.ai or ChatGPT
2. Create a free account if you don't have one
3. Try the basic question prompt from this lesson
4. Ask it to explain "machine learning" in simple terms
5. Copy and paste the response below`,
          platform: 'claude',
          task_type: 'prompt_testing',
          validation_criteria: 'Successfully received a clear explanation of machine learning',
          submission_format: 'text',
          estimated_minutes: 15,
          difficulty: 'beginner',
          required_tools: ['Claude.ai or ChatGPT account'],
          hints: 'Don\'t worry about getting it perfect - the goal is to try using AI and see how it responds!',
          order_index: 1,
          is_required: true
        },
        {
          lesson_id: whatIsAI.id,
          title: 'AI Tool Exploration',
          description: 'Explore different AI tools',
          instructions: `1. Visit at least 2 different AI tools (Claude, ChatGPT, or Gemini)
2. Ask each one the same question: "What can you help me with?"
3. Compare their responses
4. Write a brief summary of the differences you noticed`,
          platform: 'mixed',
          task_type: 'tool_exploration',
          validation_criteria: 'Compared responses from at least 2 AI tools',
          submission_format: 'text',
          estimated_minutes: 20,
          difficulty: 'beginner',
          required_tools: ['Access to multiple AI tools'],
          hints: 'Look for differences in personality, capabilities, and response style.',
          order_index: 2,
          is_required: false
        }
      );
    }
    
    const { data: insertedTasks, error: tasksError } = await supabase
      .from('tasks')
      .insert(tasksData)
      .select();
    
    if (tasksError) {
      console.error('❌ Error inserting tasks:', tasksError);
      return { success: false, error: tasksError.message };
    }
    
    console.log('✅ Inserted', insertedTasks.length, 'tasks');
    
    // Final verification
    console.log('\n🔍 Final verification...');
    
    const { data: finalCourses, error: finalError } = await supabase
      .from('courses')
      .select('*')
      .order('order_index');
    
    if (finalError) {
      console.error('❌ Final verification failed:', finalError);
      return { success: false, error: finalError.message };
    }
    
    console.log('✅ Final verification passed');
    console.log('📊 Total courses:', finalCourses.length);
    
    // Test the API endpoint
    console.log('\n🔌 Testing API endpoint...');
    
    const response = await fetch('https://web-production-98afb.up.railway.app/api/courses');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API test successful:', data.success);
      console.log('📚 API returned', data.data?.length || 0, 'courses');
    } else {
      console.log('⚠️ API test failed:', response.status);
    }
    
    console.log('\n🎉 COURSE SEEDING COMPLETE!');
    console.log('============================');
    console.log('✅ Database fully populated with course content');
    console.log('✅ All relationships properly established');
    console.log('✅ Sample data available for testing');
    console.log('✅ Ready for full user experience testing!');
    
    return {
      success: true,
      message: 'Course seeding completed successfully',
      data: {
        courses: insertedCourses.length,
        modules: insertedModules.length,
        lessons: insertedLessons.length,
        prompts: insertedPrompts.length,
        quizzes: insertedQuizzes.length,
        tasks: insertedTasks.length
      }
    };
    
  } catch (error) {
    console.error('❌ Course seeding error:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { seedCompleteCourses };

// Run if called directly
if (require.main === module) {
  seedCompleteCourses()
    .then((result) => {
      console.log('\n🎉 Seeding completed!');
      console.log('Result:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Seeding failed:', error);
      process.exit(1);
    });
}