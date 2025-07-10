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

const quizzes = [
  // Lesson 1.1.1: Understanding AI Capabilities
  {
    lesson_title: 'Lesson 1.1.1: Understanding AI Capabilities',
    title: 'AI Capabilities Assessment',
    description: 'Test your understanding of what AI can and cannot do',
    question_text: 'Which of these tasks is AI currently BEST at handling?',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'Providing real-time stock market predictions' },
      { value: 'b', text: 'Analyzing patterns in large text documents' },
      { value: 'c', text: 'Making final business decisions independently' },
      { value: 'd', text: 'Accessing your private company database' }
    ],
    correct_answer: 'b',
    explanation: 'AI excels at pattern recognition and text analysis. It cannot predict markets with certainty, should not make final decisions independently, and cannot access private data without explicit access.',
    difficulty: 'beginner',
    points: 1,
    order_index: 1
  },
  {
    lesson_title: 'Lesson 1.1.1: Understanding AI Capabilities',
    title: 'AI Limitations Recognition',
    description: 'Identify key AI limitations in business contexts',
    question_text: 'What is the most important limitation to remember when using AI for business decisions?',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'AI is too slow for business use' },
      { value: 'b', text: 'AI may provide confident-sounding but incorrect information' },
      { value: 'c', text: 'AI cannot understand English properly' },
      { value: 'd', text: 'AI is only useful for technical tasks' }
    ],
    correct_answer: 'b',
    explanation: 'AI can "hallucinate" - provide incorrect information with confidence. This is why verification and human oversight are crucial for important business decisions.',
    difficulty: 'beginner',
    points: 1,
    order_index: 2
  },

  // Lesson 1.1.2: AI Model Comparison
  {
    lesson_title: 'Lesson 1.1.2: AI Model Comparison',
    title: 'Model Selection Criteria',
    description: 'Test your understanding of choosing the right AI model',
    question_text: 'When would you choose Claude over ChatGPT for a work task?',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'When you need creative writing assistance' },
      { value: 'b', text: 'When you need careful analysis and reasoning' },
      { value: 'c', text: 'When you need plugin integrations' },
      { value: 'd', text: 'When you need image generation' }
    ],
    correct_answer: 'b',
    explanation: 'Claude excels at careful analysis, reasoning, and following complex instructions. ChatGPT is better for creative tasks and has more plugin options.',
    difficulty: 'beginner',
    points: 1,
    order_index: 1
  },
  {
    lesson_title: 'Lesson 1.1.2: AI Model Comparison',
    title: 'Model Strengths Understanding',
    description: 'Identify each model\'s key strengths',
    question_text: 'What is Gemini\'s unique advantage over other AI models?',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'Better at creative writing' },
      { value: 'b', text: 'Multimodal capabilities and Google integration' },
      { value: 'c', text: 'Faster response times' },
      { value: 'd', text: 'Better at code generation' }
    ],
    correct_answer: 'b',
    explanation: 'Gemini can process multiple types of input (text, images, code) and integrates well with Google services, making it unique for certain workflows.',
    difficulty: 'beginner',
    points: 1,
    order_index: 2
  },

  // Lesson 1.1.3: Ethical AI Usage
  {
    lesson_title: 'Lesson 1.1.3: Ethical AI Usage',
    title: 'Privacy and Data Protection',
    description: 'Test your understanding of AI privacy considerations',
    question_text: 'You need to analyze customer feedback that contains personal information. What should you do before using AI?',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'Use the data as-is since it\'s for business purposes' },
      { value: 'b', text: 'Remove or anonymize personal information first' },
      { value: 'c', text: 'Only use AI tools that guarantee privacy' },
      { value: 'd', text: 'Ask customers for permission to use AI' }
    ],
    correct_answer: 'b',
    explanation: 'Always anonymize or remove personal information before sharing data with AI tools. This protects privacy while still allowing useful analysis.',
    difficulty: 'beginner',
    points: 1,
    order_index: 1
  },
  {
    lesson_title: 'Lesson 1.1.3: Ethical AI Usage',
    title: 'Accountability and Transparency',
    description: 'Understand professional responsibility when using AI',
    question_text: 'True or False: If AI helps you write a report, you should always disclose this to your manager.',
    question_type: 'true_false',
    options: [
      { value: 'true', text: 'True' },
      { value: 'false', text: 'False' }
    ],
    correct_answer: 'false',
    explanation: 'It depends on your company policy and the context. Always check organizational guidelines, but disclosure is typically required for final deliverables to clients or when accuracy is critical.',
    difficulty: 'intermediate',
    points: 1,
    order_index: 2
  },

  // Lesson 1.1.4: Setting Up Your AI Workspace
  {
    lesson_title: 'Lesson 1.1.4: Setting Up Your AI Workspace',
    title: 'Workspace Organization',
    description: 'Test your knowledge of effective AI workspace setup',
    question_text: 'What is the most important security practice when setting up AI tools for work?',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'Using the same password for all AI tools' },
      { value: 'b', text: 'Sharing accounts with team members' },
      { value: 'c', text: 'Enabling two-factor authentication' },
      { value: 'd', text: 'Using only free AI tools' }
    ],
    correct_answer: 'c',
    explanation: 'Two-factor authentication is crucial for securing AI tool accounts, especially when they may contain sensitive work-related conversations.',
    difficulty: 'beginner',
    points: 1,
    order_index: 1
  },
  {
    lesson_title: 'Lesson 1.1.4: Setting Up Your AI Workspace',
    title: 'Productivity Optimization',
    description: 'Understand how to optimize your AI workspace for productivity',
    question_text: 'Which practice will most improve your AI productivity?',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'Using multiple AI tools simultaneously' },
      { value: 'b', text: 'Creating and organizing reusable prompt templates' },
      { value: 'c', text: 'Always starting fresh conversations' },
      { value: 'd', text: 'Using only one AI tool for everything' }
    ],
    correct_answer: 'b',
    explanation: 'Creating organized, reusable prompt templates saves time and ensures consistency in your AI interactions, dramatically improving productivity.',
    difficulty: 'beginner',
    points: 1,
    order_index: 2
  },

  // Lesson 1.2.1: Prompt Structure Fundamentals
  {
    lesson_title: 'Lesson 1.2.1: Prompt Structure Fundamentals',
    title: 'CLEAR Framework Application',
    description: 'Can you spot what makes prompts work in real business situations?',
    question_text: 'Your colleague Sarah shows you this prompt she\'s about to send: "You are a marketing expert. Write a social media post about our new product launch." What should she add to get a professional result?',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'Context about the product and target market' },
      { value: 'b', text: 'Length specification and posting platform' },
      { value: 'c', text: 'Audience definition and desired action' },
      { value: 'd', text: 'All of the above for a complete prompt' }
    ],
    correct_answer: 'd',
    explanation: 'Sarah\'s prompt will produce generic content because it lacks Context (what product? what company?), Length (Twitter vs LinkedIn have different limits), and Audience (who should this reach?). Adding all these elements will give her a targeted, professional post she can actually use.',
    difficulty: 'intermediate',
    points: 1,
    order_index: 1
  },
  {
    lesson_title: 'Lesson 1.2.1: Prompt Structure Fundamentals',
    title: 'Effective Instruction Writing',
    description: 'Identify well-structured instructions in prompts',
    question_text: 'Which instruction is most likely to produce a useful response?',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'Make this better' },
      { value: 'b', text: 'Write something professional' },
      { value: 'c', text: 'Create a 3-paragraph executive summary highlighting key benefits, target market, and next steps' },
      { value: 'd', text: 'Help with my document' }
    ],
    correct_answer: 'c',
    explanation: 'Option C is specific, actionable, and includes clear formatting requirements. It tells the AI exactly what to produce and how to structure it.',
    difficulty: 'beginner',
    points: 1,
    order_index: 2
  },

  // Lesson 1.2.2: Context Setting Techniques
  {
    lesson_title: 'Lesson 1.2.2: Context Setting Techniques',
    title: 'Context Categories',
    description: 'Can you identify the right context type for better AI responses?',
    question_text: 'You\'re about to ask AI to help draft an important email. You tell it: "This email is going to our biggest client who prefers direct communication and has been frustrated with previous delays." What type of context are you providing?',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'Situational context' },
      { value: 'b', text: 'Audience context' },
      { value: 'c', text: 'Constraint context' },
      { value: 'd', text: 'Technical context' }
    ],
    correct_answer: 'b',
    explanation: 'This is audience context because you\'re describing who will receive the email (biggest client), their communication preferences (direct), and their current emotional state (frustrated). This helps AI craft the right tone and approach for this specific reader.',
    difficulty: 'intermediate',
    points: 1,
    order_index: 1
  },
  {
    lesson_title: 'Lesson 1.2.2: Context Setting Techniques',
    title: 'Context Optimization',
    description: 'Understand how to optimize context for better results',
    question_text: 'When setting context, which approach is most effective?',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'Include every possible detail' },
      { value: 'b', text: 'Focus only on the immediate task' },
      { value: 'c', text: 'Provide relevant background while staying concise' },
      { value: 'd', text: 'Assume the AI knows your situation' }
    ],
    correct_answer: 'c',
    explanation: 'Effective context is comprehensive but focused on what\'s relevant to the task. Too much detail can confuse, too little provides insufficient guidance.',
    difficulty: 'intermediate',
    points: 1,
    order_index: 2
  },

  // Lesson 1.2.3: Iterative Prompting
  {
    lesson_title: 'Lesson 1.2.3: Iterative Prompting',
    title: 'Refinement Strategy',
    description: 'Test your understanding of iterative prompt refinement',
    question_text: 'After getting a response that\'s close but not quite right, what\'s the best next step?',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'Start over with a completely new prompt' },
      { value: 'b', text: 'Accept the response as good enough' },
      { value: 'c', text: 'Build on the response with specific refinements' },
      { value: 'd', text: 'Try a different AI model' }
    ],
    correct_answer: 'c',
    explanation: 'Iterative prompting works best when you build on previous responses with specific refinements, rather than starting over each time.',
    difficulty: 'intermediate',
    points: 1,
    order_index: 1
  },
  {
    lesson_title: 'Lesson 1.2.3: Iterative Prompting',
    title: 'Iteration Best Practices',
    description: 'Understand effective iteration techniques',
    question_text: 'Which refinement technique is most effective for improving AI responses?',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'Saying "make it better" repeatedly' },
      { value: 'b', text: 'Providing specific examples of what you want' },
      { value: 'c', text: 'Using more complex vocabulary' },
      { value: 'd', text: 'Making the prompt longer' }
    ],
    correct_answer: 'b',
    explanation: 'Specific examples are the most effective way to guide AI toward your desired output. They show rather than tell what you\'re looking for.',
    difficulty: 'intermediate',
    points: 1,
    order_index: 2
  },

  // Lesson 1.2.4: Common Prompting Mistakes
  {
    lesson_title: 'Lesson 1.2.4: Common Prompting Mistakes',
    title: 'Mistake Identification',
    description: 'Identify common prompting mistakes to avoid',
    question_text: 'What is the main problem with this prompt: "You are the world\'s greatest expert in business strategy with 50 years of experience and PhDs from Harvard and Stanford..."',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'It\'s too specific about credentials' },
      { value: 'b', text: 'It\'s overcomplicating the role assignment' },
      { value: 'c', text: 'It doesn\'t include enough background' },
      { value: 'd', text: 'It\'s too informal' }
    ],
    correct_answer: 'b',
    explanation: 'This prompt overcompliactes the role assignment. Simple, clear roles like "You are a business strategy consultant" are more effective than elaborate credential lists.',
    difficulty: 'intermediate',
    points: 1,
    order_index: 1
  },
  {
    lesson_title: 'Lesson 1.2.4: Common Prompting Mistakes',
    title: 'Quality Criteria Setting',
    description: 'Test your understanding of setting quality expectations',
    question_text: 'Which prompt provides the clearest quality criteria?',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'Write a good email' },
      { value: 'b', text: 'Write a professional email' },
      { value: 'c', text: 'Write a concise email under 150 words with a clear call-to-action' },
      { value: 'd', text: 'Write the best email possible' }
    ],
    correct_answer: 'c',
    explanation: 'Option C provides specific, measurable criteria: word count limit and requirement for a clear call-to-action. This gives the AI clear quality targets.',
    difficulty: 'beginner',
    points: 1,
    order_index: 2
  }
];

async function seedQuizzes() {
  try {
    for (const quiz of quizzes) {
      // Get lesson ID from title
      const { rows: lessonRows } = await pool.query(
        'SELECT id FROM lessons WHERE title = $1',
        [quiz.lesson_title]
      );
      
      if (lessonRows.length > 0) {
        const lessonId = lessonRows[0].id;
        
        await pool.query(
          'INSERT INTO quizzes (lesson_id, title, description, question_text, question_type, options, correct_answer, explanation, difficulty, points, order_index) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
          [
            lessonId,
            quiz.title,
            quiz.description,
            quiz.question_text,
            quiz.question_type,
            JSON.stringify(quiz.options),
            quiz.correct_answer,
            quiz.explanation,
            quiz.difficulty,
            quiz.points,
            quiz.order_index
          ]
        );
        
        console.log(`✓ Seeded quiz: ${quiz.title}`);
      } else {
        console.log(`⚠ Lesson not found: ${quiz.lesson_title}`);
      }
    }
    
    console.log('\n🎉 All quizzes seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding quizzes:', error);
  } finally {
    pool.end();
    process.exit(0);
  }
}

seedQuizzes();