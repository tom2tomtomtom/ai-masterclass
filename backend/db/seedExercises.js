require('dotenv').config({ path: __dirname + '/../.env' });
const { Pool } = require('pg');

const dbName = process.argv[2]; // Get database name from command line argument

if (!dbName) {
  console.error('Error: Database name not provided as argument.');
  process.exit(1);
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: dbName, // Use the provided database name
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const exercises = [
  {
    module_title: 'Module 1.1: AI Fundamentals',
    title: 'Exercise 1.1.1: AI Strengths & Limitations',
    description: 'Identify and list the core strengths and limitations of current AI models.',
    instructions: { text: 'Research current AI capabilities and list 5 strengths and 5 limitations. Submit your findings as a text document.' },
    estimated_minutes: 60,
    difficulty: 'beginner',
    exercise_type: 'prompting',
    tools_required: ['Claude', 'ChatGPT', 'Gemini'],
    apis_required: []
  },
  {
    module_title: 'Module 1.2: Basic Prompting',
    title: 'Exercise 1.2.1: Expense Report Automation Prompt',
    description: 'Create a prompt to extract data from an expense receipt.',
    instructions: { text: 'Design a prompt for an LLM to extract vendor name, date, total amount, and itemized details from a receipt image. Assume the LLM can process images.' },
    estimated_minutes: 90,
    difficulty: 'beginner',
    exercise_type: 'prompting',
    tools_required: ['Claude', 'ChatGPT', 'Gemini'],
    apis_required: []
  },
  {
    module_title: 'Module 1.3: Conversation Management',
    title: 'Exercise 1.3.1: Contract Review Conversation Flow',
    description: 'Outline a multi-turn conversation with an AI for contract review.',
    instructions: { text: 'Design a 3-step conversational flow for reviewing a contract: initial analysis, risk assessment deep dive, and comparison to a standard template.' },
    estimated_minutes: 90,
    difficulty: 'beginner',
    exercise_type: 'prompting',
    tools_required: ['Claude', 'ChatGPT', 'Gemini'],
    apis_required: []
  },
  {
    module_title: 'Module 1.4: Practical Applications',
    title: 'Capstone Project: AI-Powered Meeting Management System',
    description: 'Design an AI-powered meeting management system.',
    instructions: { text: 'Choose one of the real corporate problems from Module 1.4 (Meeting Management, Employee Onboarding, or Expense/Procurement Approval) and design an AI-powered solution. Document your prompting process, iterations, and measurable improvements to the existing process. Submit a detailed plan outlining your solution.' },
    estimated_minutes: 240,
    difficulty: 'beginner',
    exercise_type: 'project',
    tools_required: ['Claude', 'ChatGPT', 'Gemini', 'Zapier', 'Copilot Studio'],
    apis_required: []
  },
];

async function seedExercises() {
  for (const exercise of exercises) {
    const { rows: moduleRows } = await pool.query('SELECT id FROM modules WHERE title = $1', [exercise.module_title]);
    if (moduleRows.length > 0) {
      const moduleId = moduleRows[0].id;
      await pool.query(
        'INSERT INTO exercises (module_id, title, description, instructions, estimated_minutes, difficulty, exercise_type, tools_required, apis_required) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [moduleId, exercise.title, exercise.description, exercise.instructions, exercise.estimated_minutes, exercise.difficulty, exercise.exercise_type, JSON.stringify(exercise.tools_required), JSON.stringify(exercise.apis_required)]
      );
    }
  }
  console.log('Exercises seeded');
  pool.end();
  process.exit(0);
}

seedExercises().catch(err => {
  console.error(err);
  pool.end();
  process.exit(1);
});