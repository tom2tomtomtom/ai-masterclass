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

const courses = [
  { title: 'Level 1: Foundation - Basic AI Interaction', description: 'Understand AI capabilities and develop fundamental interaction skills', level: 1, order_index: 1, estimated_hours: 8 },
  { title: 'Level 2: Prompting Mastery - Advanced Techniques', description: 'Master sophisticated prompting techniques and prompt engineering', level: 2, order_index: 2, estimated_hours: 10 },
  { title: 'Level 3: Tool Integration - AI-Powered Development Environment', description: 'Master AI-powered development tools and integrate them into workflows', level: 3, order_index: 3, estimated_hours: 12 },
];

async function seed() {
  for (const course of courses) {
    await pool.query(
      'INSERT INTO courses (title, description, level, order_index, estimated_hours) VALUES ($1, $2, $3, $4, $5)',
      [course.title, course.description, course.level, course.order_index, course.estimated_hours]
    );
  }
  console.log('Database seeded');
  pool.end();
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  pool.end();
  process.exit(1);
});