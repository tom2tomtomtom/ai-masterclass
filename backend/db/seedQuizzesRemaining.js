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

const remainingQuizzes = [
  // Lesson 1.3.1: Maintaining Context Across Conversations
  {
    lesson_title: 'Lesson 1.3.1: Maintaining Context Across Conversations',
    title: 'Context Continuity Best Practices',
    description: 'Test your understanding of maintaining context across AI conversations',
    question_text: 'What is the most effective way to maintain context when resuming an AI conversation about a complex project?',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'Assume the AI remembers everything from previous sessions' },
      { value: 'b', text: 'Start with a comprehensive context summary including decisions made and current status' },
      { value: 'c', text: 'Begin with the same prompt you used before' },
      { value: 'd', text: 'Only mention the immediate task you need help with' }
    ],
    correct_answer: 'b',
    explanation: 'AI conversations are independent sessions. Providing comprehensive context including previous decisions and current status ensures continuity and relevant responses.',
    difficulty: 'intermediate',
    points: 1,
    order_index: 1
  },
  {
    lesson_title: 'Lesson 1.3.1: Maintaining Context Across Conversations',
    title: 'Team Context Handoff',
    description: 'Understand how to transfer AI conversation context between team members',
    question_text: 'When handing off an AI conversation to a colleague, what information is most critical to include?',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'Only the final conclusions and recommendations' },
      { value: 'b', text: 'The complete conversation transcript' },
      { value: 'c', text: 'Key decisions made, reasoning behind them, and current project status' },
      { value: 'd', text: 'Just the original problem statement' }
    ],
    correct_answer: 'c',
    explanation: 'Effective handoffs require both the decisions made and the reasoning behind them, plus current status. This allows colleagues to continue effectively without losing context.',
    difficulty: 'intermediate',
    points: 1,
    order_index: 2
  },

  // Lesson 1.3.2: Multi-Turn Conversation Strategies
  {
    lesson_title: 'Lesson 1.3.2: Multi-Turn Conversation Strategies',
    title: 'Strategic Conversation Planning',
    description: 'Test your understanding of planning multi-turn AI conversations',
    question_text: 'What is the main advantage of the "funnel approach" in multi-turn AI conversations?',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'It uses fewer tokens and saves costs' },
      { value: 'b', text: 'It systematically narrows from broad exploration to specific solutions' },
      { value: 'c', text: 'It requires less thinking and planning' },
      { value: 'd', text: 'It always produces better results than single prompts' }
    ],
    correct_answer: 'b',
    explanation: 'The funnel approach systematically explores problems broadly first, then progressively narrows focus to specific solutions, ensuring comprehensive understanding before jumping to answers.',
    difficulty: 'intermediate',
    points: 1,
    order_index: 1
  },
  {
    lesson_title: 'Lesson 1.3.2: Multi-Turn Conversation Strategies',
    title: 'Expert Panel Technique',
    description: 'Understand the expert panel approach for getting multiple perspectives',
    question_text: 'True or False: The expert panel approach involves asking AI to roleplay different professional perspectives on the same problem.',
    question_type: 'true_false',
    options: [
      { value: 'true', text: 'True' },
      { value: 'false', text: 'False' }
    ],
    correct_answer: 'true',
    explanation: 'The expert panel approach has AI take on different professional roles (strategic consultant, operations expert, change manager, etc.) to provide diverse perspectives on the same challenge.',
    difficulty: 'intermediate',
    points: 1,
    order_index: 2
  },

  // Lesson 1.3.3: Building Complex Solutions Through Dialogue
  {
    lesson_title: 'Lesson 1.3.3: Building Complex Solutions Through Dialogue',
    title: 'Solution Development Process',
    description: 'Test your understanding of systematic solution development through dialogue',
    question_text: 'In the solution development framework, what should happen BEFORE generating solution options?',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'Implementation planning' },
      { value: 'b', text: 'Stakeholder communication' },
      { value: 'c', text: 'Thorough problem exploration and understanding' },
      { value: 'd', text: 'Resource allocation' }
    ],
    correct_answer: 'c',
    explanation: 'The framework emphasizes problem exploration first. Understanding root causes, stakeholder impacts, and constraints leads to better solution options than jumping directly to brainstorming.',
    difficulty: 'intermediate',
    points: 1,
    order_index: 1
  },
  {
    lesson_title: 'Lesson 1.3.3: Building Complex Solutions Through Dialogue',
    title: 'Collaborative Problem-Solving',
    description: 'Understand the collaborative approach to AI-assisted problem solving',
    question_text: 'What is the key difference between asking AI for complete solutions versus using collaborative problem-solving dialogue?',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'Collaborative dialogue takes more time' },
      { value: 'b', text: 'Collaborative dialogue leverages AI analysis while maintaining human judgment and creativity' },
      { value: 'c', text: 'Complete solutions are always more accurate' },
      { value: 'd', text: 'There is no significant difference' }
    ],
    correct_answer: 'b',
    explanation: 'Collaborative dialogue leverages AI\'s analytical capabilities while preserving human judgment, creativity, and contextual understanding, leading to better solutions than either approach alone.',
    difficulty: 'advanced',
    points: 1,
    order_index: 2
  },

  // Lesson 1.3.4: Managing AI Memory and Context Limits
  {
    lesson_title: 'Lesson 1.3.4: Managing AI Memory and Context Limits',
    title: 'Context Window Management',
    description: 'Test your understanding of AI context limitations and management strategies',
    question_text: 'What typically happens when an AI conversation exceeds the context window limit?',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'The AI stops responding entirely' },
      { value: 'b', text: 'The AI gives an error message' },
      { value: 'c', text: 'Older parts of the conversation are "forgotten" as new content is added' },
      { value: 'd', text: 'The AI automatically starts a new conversation' }
    ],
    correct_answer: 'c',
    explanation: 'When context limits are reached, older conversation content is dropped to make room for new content, which can cause the AI to "forget" earlier decisions and context.',
    difficulty: 'intermediate',
    points: 1,
    order_index: 1
  },
  {
    lesson_title: 'Lesson 1.3.4: Managing AI Memory and Context Limits',
    title: 'Context Refresh Strategies',
    description: 'Understand effective strategies for managing context across sessions',
    question_text: 'Which strategy is most effective for working on long-term projects with AI assistance?',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'Use one continuous conversation for the entire project' },
      { value: 'b', text: 'Start fresh each time with no reference to previous work' },
      { value: 'c', text: 'Break work into focused sessions with context summaries for continuity' },
      { value: 'd', text: 'Only use AI for simple, single-session tasks' }
    ],
    correct_answer: 'c',
    explanation: 'Breaking work into focused sessions while maintaining context summaries allows you to work within AI limitations while preserving important project continuity.',
    difficulty: 'intermediate',
    points: 1,
    order_index: 2
  },

  // Lesson 1.4.1: Meeting Management Automation
  {
    lesson_title: 'Lesson 1.4.1: Meeting Management Automation',
    title: 'Meeting Optimization ROI',
    description: 'Test your understanding of measuring meeting effectiveness and ROI',
    question_text: 'When calculating meeting ROI, which factors should be included in the cost analysis?',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'Only the direct hourly cost of attendees' },
      { value: 'b', text: 'Hourly cost plus opportunity cost of other work not done' },
      { value: 'c', text: 'Just the cost of the meeting room and technology' },
      { value: 'd', text: 'Only the time spent by the meeting organizer' }
    ],
    correct_answer: 'b',
    explanation: 'True meeting cost includes both the direct hourly cost of all attendees and the opportunity cost of productive work they could have been doing instead.',
    difficulty: 'intermediate',
    points: 1,
    order_index: 1
  },
  {
    lesson_title: 'Lesson 1.4.1: Meeting Management Automation',
    title: 'AI-Powered Meeting Enhancement',
    description: 'Understand how AI can improve meeting effectiveness',
    question_text: 'True or False: AI can help with meeting management both before, during, and after meetings.',
    question_type: 'true_false',
    options: [
      { value: 'true', text: 'True' },
      { value: 'false', text: 'False' }
    ],
    correct_answer: 'true',
    explanation: 'AI can assist pre-meeting (agenda creation, conflict detection), during meetings (structure guidance, decision facilitation), and post-meeting (action item processing, follow-up).',
    difficulty: 'beginner',
    points: 1,
    order_index: 2
  },

  // Lesson 1.4.2: Email and Communication Optimization
  {
    lesson_title: 'Lesson 1.4.2: Email and Communication Optimization',
    title: 'Strategic Communication Planning',
    description: 'Test your understanding of strategic stakeholder communication',
    question_text: 'When designing communication for multiple stakeholders with different interests, what is the most important consideration?',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'Send the same message to everyone for consistency' },
      { value: 'b', text: 'Customize messages for each stakeholder\'s interests and communication style' },
      { value: 'c', text: 'Only communicate with the most senior stakeholders' },
      { value: 'd', text: 'Use the most formal communication style for all stakeholders' }
    ],
    correct_answer: 'b',
    explanation: 'Effective stakeholder communication requires customization for each audience\'s interests, concerns, communication preferences, and information needs while maintaining consistent core messages.',
    difficulty: 'intermediate',
    points: 1,
    order_index: 1
  },
  {
    lesson_title: 'Lesson 1.4.2: Email and Communication Optimization',
    title: 'Crisis Communication Best Practices',
    description: 'Understand principles of effective crisis communication',
    question_text: 'In crisis communication, what should be the primary focus of your message?',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'Avoiding any admission of responsibility' },
      { value: 'b', text: 'Providing technical details about what went wrong' },
      { value: 'c', text: 'Acknowledging the situation, explaining your response, and providing clear next steps' },
      { value: 'd', text: 'Minimizing the perceived impact of the crisis' }
    ],
    correct_answer: 'c',
    explanation: 'Effective crisis communication acknowledges the situation transparently, explains your response and timeline, and provides clear next steps to maintain stakeholder confidence.',
    difficulty: 'intermediate',
    points: 1,
    order_index: 2
  },

  // Lesson 1.4.3: Document Creation and Review
  {
    lesson_title: 'Lesson 1.4.3: Document Creation and Review',
    title: 'Executive Communication Strategy',
    description: 'Test your understanding of effective executive-level communication',
    question_text: 'When writing for executives, what should lead your document?',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'Detailed background and context' },
      { value: 'b', text: 'The process you followed to reach conclusions' },
      { value: 'c', text: 'Strategic impact, recommendation, and business case' },
      { value: 'd', text: 'Technical specifications and requirements' }
    ],
    correct_answer: 'c',
    explanation: 'Executives need strategic impact and recommendations first. They want to understand the business case and implications before diving into background details or technical specifications.',
    difficulty: 'intermediate',
    points: 1,
    order_index: 1
  },
  {
    lesson_title: 'Lesson 1.4.3: Document Creation and Review',
    title: 'Technical Translation Principles',
    description: 'Understand how to effectively translate technical content for business audiences',
    question_text: 'When translating technical content for business audiences, what is the most important principle?',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'Include all technical details for completeness' },
      { value: 'b', text: 'Focus on business implications and outcomes rather than technical processes' },
      { value: 'c', text: 'Use simpler technical terms instead of business language' },
      { value: 'd', text: 'Assume the audience will learn the technical concepts' }
    ],
    correct_answer: 'b',
    explanation: 'Business audiences care about implications, outcomes, and decisions they need to make. Focus on business value and impact rather than technical implementation details.',
    difficulty: 'intermediate',
    points: 1,
    order_index: 2
  },

  // Lesson 1.4.4: Level 1 Capstone Project
  {
    lesson_title: 'Lesson 1.4.4: Level 1 Capstone Project',
    title: 'Capstone Project Success Criteria',
    description: 'Test your understanding of what makes a successful capstone project',
    question_text: 'What demonstrates mastery in a Level 1 AI capstone project?',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'Using the most advanced AI features available' },
      { value: 'b', text: 'Creating the most complex solution possible' },
      { value: 'c', text: 'Integrating multiple AI skills to solve a real workplace challenge with measurable impact' },
      { value: 'd', text: 'Building something completely original that no one has done before' }
    ],
    correct_answer: 'c',
    explanation: 'Mastery is demonstrated by integrating learned skills (prompting, conversation management, practical applications) to solve real problems with measurable business impact.',
    difficulty: 'intermediate',
    points: 1,
    order_index: 1
  },
  {
    lesson_title: 'Lesson 1.4.4: Level 1 Capstone Project',
    title: 'Solution Architecture Design',
    description: 'Understand the key elements of effective AI solution architecture',
    question_text: 'When designing AI integration architecture for a workplace solution, what should be your primary consideration?',
    question_type: 'multiple_choice',
    options: [
      { value: 'a', text: 'Using as many AI tools as possible' },
      { value: 'b', text: 'Balancing solution effectiveness with team capability and adoption feasibility' },
      { value: 'c', text: 'Minimizing human involvement in the process' },
      { value: 'd', text: 'Implementing the most cutting-edge AI techniques' }
    ],
    correct_answer: 'b',
    explanation: 'Effective AI architecture balances solution ambition with practical constraints like team skills, organizational readiness, and change management requirements for successful adoption.',
    difficulty: 'advanced',
    points: 1,
    order_index: 2
  }
];

async function seedRemainingQuizzes() {
  try {
    for (const quiz of remainingQuizzes) {
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
    
    console.log('\n🎉 All remaining quizzes seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding remaining quizzes:', error);
  } finally {
    pool.end();
    process.exit(0);
  }
}

seedRemainingQuizzes();