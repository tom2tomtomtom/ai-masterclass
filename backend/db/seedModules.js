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

const modules = [
  { course_title: 'Level 1: Foundation - Basic AI Interaction', title: 'Module 1.1: AI Fundamentals', description: 'Understand what LLMs can and cannot do', order_index: 1, estimated_minutes: 120, module_type: 'theory', difficulty: 'beginner', content: {} },
  { course_title: 'Level 1: Foundation - Basic AI Interaction', title: 'Module 1.2: Basic Prompting', description: 'Write clear, effective prompts', order_index: 2, estimated_minutes: 180, module_type: 'exercise', difficulty: 'beginner', content: {} },
  { course_title: 'Level 1: Foundation - Basic AI Interaction', title: 'Module 1.3: Conversation Management', description: 'Maintain context across long conversations', order_index: 3, estimated_minutes: 120, module_type: 'exercise', difficulty: 'beginner', content: {} },
  { course_title: 'Level 1: Foundation - Basic AI Interaction', title: 'Module 1.4: Practical Applications', description: 'Capstone Project for Level 1', order_index: 4, estimated_minutes: 60, module_type: 'project', difficulty: 'beginner', content: {} },
];

async function seedModules() {
  for (const module of modules) {
    // Fetch the course ID based on the title
    const { rows: courseRows } = await pool.query('SELECT id FROM courses WHERE title = $1', [module.course_title]);
    if (courseRows.length > 0) {
      const courseId = courseRows[0].id;
      await pool.query(
        'INSERT INTO modules (course_id, title, description, order_index, estimated_minutes, module_type, difficulty, content) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [courseId, module.title, module.description, module.order_index, module.estimated_minutes, module.module_type, module.difficulty, module.content]
      );
    }
  }
  console.log('Modules seeded');
  pool.end();
  process.exit(0);
}

seedModules().catch(err => {
  console.error(err);
  pool.end();
  process.exit(1);
});
