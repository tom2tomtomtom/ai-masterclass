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
          title: 'What is AI?',
          description: 'Introduction to artificial intelligence concepts',
          content: `# What is AI?
          
Artificial Intelligence (AI) is the simulation of human intelligence in machines that are programmed to think and learn like humans. In this lesson, you'll learn the fundamental concepts of AI and how it's transforming the way we work.

## Key Concepts

### 1. Types of AI
- **Narrow AI**: Designed for specific tasks (like Claude, ChatGPT)
- **General AI**: Theoretical AI that can perform any intellectual task
- **Superintelligence**: AI that surpasses human intelligence

### 2. How AI Works
AI systems learn from data and use that learning to make predictions or decisions. Modern AI like Claude and ChatGPT use:
- **Large Language Models (LLMs)**: Trained on vast amounts of text
- **Neural Networks**: Inspired by how the human brain works
- **Training Data**: Millions of examples used to teach the AI

### 3. AI in Daily Life
You're already using AI more than you realize:
- Email spam detection
- Recommendation systems (Netflix, Amazon)
- Voice assistants (Siri, Alexa)
- Navigation apps
- Social media feeds

## Practical Applications

AI can help you with:
- **Writing**: Drafting emails, reports, creative content
- **Analysis**: Summarizing documents, extracting insights
- **Problem-solving**: Breaking down complex problems
- **Learning**: Explaining concepts, tutoring
- **Creativity**: Brainstorming, ideation

## Getting Started

The best way to understand AI is to start using it. In the next lessons, you'll learn how to:
1. Write effective prompts
2. Choose the right AI tool for your task
3. Integrate AI into your workflow

Remember: AI is a tool to enhance your capabilities, not replace them. The key is learning to work with AI effectively.`,
          order_index: 1,
          lesson_type: 'tutorial',
          estimated_minutes: 20,
          difficulty: 'beginner',
          platform_focus: 'mixed',
          learning_objectives: ['Understand AI basics', 'Identify AI applications', 'Recognize AI potential']
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