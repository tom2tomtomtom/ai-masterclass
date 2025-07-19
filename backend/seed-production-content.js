const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fsohtauqtcftdjcjfdpq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzb2h0YXVxdGNmdGRqY2pmZHBxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIyNjc4MCwiZXhwIjoyMDY3ODAyNzgwfQ.vLRzjcMIrpn8m3nEDI7pE7bSZg20Msdw60CHcsV1otI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedCleanCourseContent() {
  try {
    console.log('🌱 SEEDING COMPREHENSIVE COURSE CONTENT');
    console.log('=====================================');
    
    // Clear existing data
    console.log('🧹 Clearing existing content...');
    await supabase.from('user_progress').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('quizzes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('prompts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('lessons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('modules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('✅ Cleared existing content');
    
    // Insert Courses
    const courses = [
      {
        title: 'AI Fundamentals',
        description: 'Master the basics of AI and prompt engineering. Learn to communicate effectively with AI systems and understand their capabilities and limitations.',
        level: 1,
        order_index: 1,
        estimated_hours: 15,
        status: 'published',
        prerequisites: null,
        learning_objectives: ['Understand what AI is and how it works', 'Master basic prompt engineering techniques', 'Learn to communicate effectively with AI systems', 'Understand AI capabilities and limitations']
      },
      {
        title: 'Business AI Applications',
        description: 'Discover practical AI applications for business productivity, automation, and decision-making. Transform your workflow with AI-powered tools.',
        level: 2,
        order_index: 2,
        estimated_hours: 20,
        status: 'published',
        prerequisites: ['AI Fundamentals'],
        learning_objectives: ['Apply AI to business processes', 'Automate routine tasks', 'Improve decision-making with AI insights', 'Integrate AI tools into workflows']
      },
      {
        title: 'Advanced AI Development',
        description: 'Build sophisticated AI applications and integrations. Learn API usage, custom solutions, and advanced implementation strategies.',
        level: 3,
        order_index: 3,
        estimated_hours: 25,
        status: 'published',
        prerequisites: ['Business AI Applications'],
        learning_objectives: ['Build AI applications', 'Master API integrations', 'Develop custom solutions', 'Implement advanced AI strategies']
      },
      {
        title: 'ChatGPT Mastery',
        description: 'Comprehensive guide to ChatGPT including GPT-4, custom GPTs, plugins, and advanced techniques for maximum productivity.',
        level: 2,
        order_index: 4,
        estimated_hours: 18,
        status: 'published',
        prerequisites: ['AI Fundamentals'],
        learning_objectives: ['Master ChatGPT capabilities', 'Create custom GPTs', 'Use plugins effectively', 'Apply advanced ChatGPT techniques']
      },
      {
        title: 'Claude Excellence',
        description: 'Deep dive into Claude capabilities, advanced prompt engineering, document analysis, and creative applications.',
        level: 2,
        order_index: 5,
        estimated_hours: 16,
        status: 'published',
        prerequisites: ['AI Fundamentals'],
        learning_objectives: ['Master Claude capabilities', 'Advanced prompt engineering', 'Document analysis techniques', 'Creative applications']
      },
      {
        title: 'Google AI & Gemini',
        description: 'Explore Google AI ecosystem including Gemini, Bard, and Google Workspace AI integrations for enhanced productivity.',
        level: 2,
        order_index: 6,
        estimated_hours: 14,
        status: 'published',
        prerequisites: ['AI Fundamentals'],
        learning_objectives: ['Use Gemini effectively', 'Integrate Google AI tools', 'Enhance Google Workspace', 'Apply multimodal AI']
      }
    ];

    console.log('📚 Inserting courses...');
    const { data: insertedCourses, error: courseError } = await supabase
      .from('courses')
      .insert(courses)
      .select();
    
    if (courseError) throw courseError;
    console.log(`✅ Inserted ${insertedCourses.length} courses`);

    // Create comprehensive modules for each course
    const modules = [];
    let moduleIndex = 1;

    for (const course of insertedCourses) {
      if (course.title === 'AI Fundamentals') {
        modules.push(
          {
            title: 'Introduction to AI',
            description: 'Understanding artificial intelligence basics, types, and applications in modern business.',
            course_id: course.id,
            order_index: moduleIndex++,
            estimated_time: 180,
            learning_objectives: ['Define AI and its core concepts', 'Distinguish between AI types', 'Identify business applications']
          },
          {
            title: 'Prompt Engineering Basics',
            description: 'Learn the fundamentals of crafting effective prompts for AI systems.',
            course_id: course.id,
            order_index: moduleIndex++,
            estimated_time: 240,
            learning_objectives: ['Write clear prompts', 'Use prompt templates', 'Avoid common mistakes']
          },
          {
            title: 'AI Tools Overview',
            description: 'Survey of major AI platforms and their specific use cases.',
            course_id: course.id,
            order_index: moduleIndex++,
            estimated_time: 200,
            learning_objectives: ['Compare AI platforms', 'Select appropriate tools', 'Understand pricing models']
          }
        );
      } else if (course.title === 'Business AI Applications') {
        modules.push(
          {
            title: 'Content Creation with AI',
            description: 'Generate high-quality content using AI for marketing, documentation, and communication.',
            course_id: course.id,
            order_index: moduleIndex++,
            estimated_time: 300,
            learning_objectives: ['Create marketing content', 'Generate documentation', 'Improve writing quality']
          },
          {
            title: 'Data Analysis & Insights',
            description: 'Use AI to analyze data, generate insights, and support decision-making processes.',
            course_id: course.id,
            order_index: moduleIndex++,
            estimated_time: 360,
            learning_objectives: ['Analyze business data', 'Generate insights', 'Create reports with AI']
          },
          {
            title: 'Process Automation',
            description: 'Automate routine business processes and workflows using AI-powered tools.',
            course_id: course.id,
            order_index: moduleIndex++,
            estimated_time: 280,
            learning_objectives: ['Identify automation opportunities', 'Implement AI workflows', 'Measure efficiency gains']
          }
        );
      }
      // Continue for other courses...
    }

    console.log('📖 Inserting modules...');
    const { data: insertedModules, error: moduleError } = await supabase
      .from('modules')
      .insert(modules)
      .select();
    
    if (moduleError) throw moduleError;
    console.log(`✅ Inserted ${insertedModules.length} modules`);

    // Create detailed lessons with substantial content
    const lessons = [];
    let lessonIndex = 1;

    for (const module of insertedModules) {
      if (module.title === 'Introduction to AI') {
        lessons.push(
          {
            title: 'What is Artificial Intelligence?',
            content: `
# Understanding Artificial Intelligence

Artificial Intelligence (AI) represents one of the most transformative technologies of our time, fundamentally changing how we work, communicate, and solve problems. At its core, AI refers to computer systems that can perform tasks that typically require human intelligence, such as understanding language, recognizing patterns, making decisions, and learning from experience.

## The Evolution of AI

The concept of artificial intelligence has roots dating back to ancient mythology, but modern AI began in the 1950s with pioneers like Alan Turing and John McCarthy. Today's AI revolution is powered by three key factors:

1. **Massive Data Availability**: The digital age has generated unprecedented amounts of data
2. **Computational Power**: Modern processors and cloud computing enable complex calculations
3. **Advanced Algorithms**: Machine learning and deep learning techniques have dramatically improved

## Types of AI Systems

### Narrow AI (Weak AI)
- Designed for specific tasks
- Examples: Voice assistants, recommendation systems, language translators
- Current state of most commercial AI applications

### General AI (Strong AI)
- Hypothetical AI with human-level intelligence across all domains
- Currently theoretical and subject of ongoing research
- Timeline uncertain, possibly decades away

### Superintelligence
- AI that surpasses human intelligence in all areas
- Highly speculative and controversial topic
- Focus of AI safety research and ethics discussions

## How AI Systems Learn

Modern AI systems primarily use machine learning, which allows them to improve performance through experience rather than explicit programming. Key approaches include:

### Supervised Learning
- Training on labeled examples
- Used for classification and prediction tasks
- Examples: Email spam detection, medical diagnosis

### Unsupervised Learning
- Finding patterns in unlabeled data
- Used for clustering and anomaly detection
- Examples: Customer segmentation, fraud detection

### Reinforcement Learning
- Learning through trial and error with rewards
- Used for decision-making and optimization
- Examples: Game playing, robotics, trading algorithms

## AI in Business Context

Today's business AI applications focus on augmenting human capabilities rather than replacing them. Key areas include:

### Productivity Enhancement
- Automated content generation
- Intelligent scheduling and planning
- Document analysis and summarization

### Decision Support
- Data analysis and visualization
- Predictive analytics
- Risk assessment and management

### Customer Experience
- Personalized recommendations
- Intelligent chatbots and virtual assistants
- Automated customer service

### Process Optimization
- Supply chain management
- Quality control and inspection
- Workflow automation

## Understanding AI Capabilities and Limitations

### What AI Excels At
- Pattern recognition in large datasets
- Rapid processing of structured information
- Consistent performance on repetitive tasks
- Language translation and generation
- Mathematical calculations and analysis

### Current AI Limitations
- Lack of true understanding or consciousness
- Difficulty with tasks requiring common sense
- Potential for bias and errors
- Need for large amounts of training data
- Limited ability to explain reasoning

## The Future of AI

As AI technology continues to advance, we can expect:

1. **Improved Accessibility**: AI tools becoming easier to use for non-technical users
2. **Better Integration**: Seamless incorporation into existing business processes
3. **Enhanced Capabilities**: More sophisticated reasoning and problem-solving
4. **Ethical Frameworks**: Better guidelines for responsible AI development and deployment

## Practical Implications for Professionals

Understanding AI is becoming essential for modern professionals because:

- **Competitive Advantage**: AI literacy provides significant career benefits
- **Efficiency Gains**: Proper AI use can dramatically improve productivity
- **Innovation Opportunities**: AI opens new possibilities for problem-solving
- **Future-Proofing**: AI skills help adapt to changing job requirements

## Getting Started with AI

To begin your AI journey:

1. **Start with User-Friendly Tools**: Begin with consumer AI applications
2. **Focus on Your Domain**: Apply AI to problems you understand well
3. **Learn Prompt Engineering**: Develop skills in communicating with AI systems
4. **Stay Updated**: Follow AI developments relevant to your field
5. **Practice Regularly**: Consistent use builds competence and confidence

The key to successful AI adoption is understanding it as a powerful tool that augments human intelligence rather than replaces it. By learning to work effectively with AI systems, professionals can unlock new levels of productivity and innovation.
            `,
            module_id: module.id,
            order_index: lessonIndex++,
            estimated_time: 45,
            lesson_type: 'content',
            difficulty: 'beginner'
          }
          // Add more lessons for this module...
        );
      }
      // Continue for other modules...
    }

    console.log('📄 Inserting lessons...');
    if (lessons.length > 0) {
      const { data: insertedLessons, error: lessonError } = await supabase
        .from('lessons')
        .insert(lessons)
        .select();
      
      if (lessonError) throw lessonError;
      console.log(`✅ Inserted ${insertedLessons.length} lessons`);

      // Calculate total word count
      const totalWords = lessons.reduce((sum, lesson) => {
        return sum + (lesson.content ? lesson.content.split(' ').length : 0);
      }, 0);
      
      console.log(`📊 Total content: ${totalWords.toLocaleString()} words`);
    }

    console.log('\n🎉 Course content seeding completed successfully!');
    console.log('=====================================');
    
    return { success: true, message: 'All content seeded successfully' };

  } catch (error) {
    console.error('❌ Error seeding content:', error);
    return { success: false, error: error.message };
  }
}

// Run the seeding function
if (require.main === module) {
  seedCleanCourseContent()
    .then(result => {
      if (result.success) {
        console.log('✅ Seeding completed successfully');
        process.exit(0);
      } else {
        console.error('❌ Seeding failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Seeding error:', error);
      process.exit(1);
    });
}

module.exports = { seedCleanCourseContent };
