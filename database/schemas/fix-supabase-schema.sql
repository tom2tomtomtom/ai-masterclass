-- Complete Supabase Database Schema Fix
-- This SQL should be run in the Supabase SQL Editor to fix the schema issues

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS user_task_progress CASCADE;
DROP TABLE IF EXISTS user_quiz_progress CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS prompts CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- 1. Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users table (enhanced)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'learner',
    subscription_tier VARCHAR(50) DEFAULT 'free',
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{}',
    skills JSONB DEFAULT '[]'
);

-- 3. Courses table (with order_index!)
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    level INTEGER NOT NULL DEFAULT 1,
    order_index INTEGER NOT NULL DEFAULT 1,
    estimated_hours INTEGER DEFAULT 0,
    prerequisites JSONB DEFAULT '[]',
    objectives JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Modules table
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 1,
    content JSONB DEFAULT '{}',
    estimated_minutes INTEGER DEFAULT 0,
    module_type VARCHAR(50) NOT NULL DEFAULT 'theory',
    difficulty VARCHAR(50) DEFAULT 'beginner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Lessons table
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL DEFAULT '',
    order_index INTEGER NOT NULL DEFAULT 1,
    estimated_minutes INTEGER DEFAULT 30,
    lesson_type VARCHAR(50) NOT NULL DEFAULT 'tutorial',
    difficulty VARCHAR(50) DEFAULT 'beginner',
    learning_objectives JSONB DEFAULT '[]',
    prerequisites JSONB DEFAULT '[]',
    platform_focus VARCHAR(50) DEFAULT 'mixed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Prompts table
CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    prompt_text TEXT NOT NULL,
    platform VARCHAR(50) NOT NULL DEFAULT 'claude',
    category VARCHAR(50) NOT NULL DEFAULT 'basic',
    use_case VARCHAR(255),
    expected_output TEXT,
    tips TEXT,
    order_index INTEGER NOT NULL DEFAULT 1,
    difficulty VARCHAR(50) DEFAULT 'beginner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Quizzes table
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL DEFAULT 'multiple_choice',
    options JSONB DEFAULT '[]',
    correct_answer VARCHAR(255) NOT NULL,
    explanation TEXT,
    difficulty VARCHAR(50) DEFAULT 'beginner',
    points INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT NOT NULL,
    platform VARCHAR(50) NOT NULL DEFAULT 'claude',
    task_type VARCHAR(50) NOT NULL DEFAULT 'prompt_testing',
    validation_criteria TEXT,
    submission_format VARCHAR(50) DEFAULT 'text',
    estimated_minutes INTEGER DEFAULT 30,
    difficulty VARCHAR(50) DEFAULT 'beginner',
    required_tools JSONB DEFAULT '[]',
    hints TEXT,
    order_index INTEGER NOT NULL DEFAULT 1,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. User Progress table
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    exercise_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'not_started',
    score INTEGER DEFAULT 0,
    completion_percentage INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    last_attempt TIMESTAMP WITH TIME ZONE,
    user_code TEXT,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, exercise_id)
);

-- 10. User Quiz Progress table
CREATE TABLE user_quiz_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    selected_answer VARCHAR(255) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    score INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, quiz_id)
);

-- 11. User Task Progress table
CREATE TABLE user_task_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    submission_content TEXT,
    submission_type VARCHAR(50) NOT NULL DEFAULT 'text',
    status VARCHAR(50) NOT NULL DEFAULT 'submitted',
    feedback TEXT,
    score INTEGER DEFAULT 0,
    attempt_number INTEGER DEFAULT 1,
    time_spent_minutes INTEGER DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_company ON users (company_id);
CREATE INDEX idx_users_role ON users (role);

CREATE INDEX idx_courses_level ON courses (level);
CREATE INDEX idx_courses_status ON courses (status);
CREATE INDEX idx_courses_order ON courses (order_index);

CREATE INDEX idx_modules_course ON modules (course_id);
CREATE INDEX idx_modules_type ON modules (module_type);
CREATE INDEX idx_modules_order ON modules (order_index);

CREATE INDEX idx_lessons_module ON lessons (module_id);
CREATE INDEX idx_lessons_type ON lessons (lesson_type);
CREATE INDEX idx_lessons_platform ON lessons (platform_focus);
CREATE INDEX idx_lessons_order ON lessons (order_index);

CREATE INDEX idx_prompts_lesson ON prompts (lesson_id);
CREATE INDEX idx_prompts_platform ON prompts (platform);
CREATE INDEX idx_prompts_category ON prompts (category);
CREATE INDEX idx_prompts_order ON prompts (order_index);

CREATE INDEX idx_quizzes_lesson ON quizzes (lesson_id);
CREATE INDEX idx_quizzes_type ON quizzes (question_type);
CREATE INDEX idx_quizzes_order ON quizzes (order_index);

CREATE INDEX idx_tasks_lesson ON tasks (lesson_id);
CREATE INDEX idx_tasks_platform ON tasks (platform);
CREATE INDEX idx_tasks_type ON tasks (task_type);
CREATE INDEX idx_tasks_order ON tasks (order_index);

CREATE INDEX idx_progress_user ON user_progress (user_id);
CREATE INDEX idx_progress_exercise ON user_progress (exercise_id);
CREATE INDEX idx_progress_status ON user_progress (status);

CREATE INDEX idx_user_quiz_progress_user ON user_quiz_progress (user_id);
CREATE INDEX idx_user_quiz_progress_quiz ON user_quiz_progress (quiz_id);

CREATE INDEX idx_user_task_progress_user ON user_task_progress (user_id);
CREATE INDEX idx_user_task_progress_task ON user_task_progress (task_id);
CREATE INDEX idx_user_task_progress_status ON user_task_progress (status);

-- Insert sample data
INSERT INTO companies (name) VALUES ('AI Masterclass Academy');

INSERT INTO courses (title, description, level, order_index, estimated_hours, status) VALUES
('AI Fundamentals', 'Learn the basics of AI and prompt engineering', 1, 1, 10, 'published'),
('Advanced AI Techniques', 'Master advanced AI concepts and applications', 2, 2, 15, 'published'),
('AI in Business', 'Apply AI solutions to real business problems', 3, 3, 20, 'published'),
('Claude Mastery', 'Complete guide to using Claude AI effectively', 1, 4, 8, 'published'),
('ChatGPT Professional', 'Professional-level ChatGPT usage and strategies', 2, 5, 12, 'published'),
('AI Automation Workflows', 'Build automated workflows with AI tools', 3, 6, 18, 'published');

-- Insert sample modules for the first course
INSERT INTO modules (course_id, title, description, order_index, module_type, estimated_minutes) 
SELECT 
    c.id,
    'Getting Started with AI',
    'Introduction to AI concepts and tools',
    1,
    'theory',
    45
FROM courses c WHERE c.title = 'AI Fundamentals';

INSERT INTO modules (course_id, title, description, order_index, module_type, estimated_minutes) 
SELECT 
    c.id,
    'Your First AI Prompts',
    'Learn to write effective prompts',
    2,
    'exercise',
    60
FROM courses c WHERE c.title = 'AI Fundamentals';

INSERT INTO modules (course_id, title, description, order_index, module_type, estimated_minutes) 
SELECT 
    c.id,
    'AI Tools and Platforms',
    'Overview of different AI platforms',
    3,
    'theory',
    30
FROM courses c WHERE c.title = 'AI Fundamentals';

-- Insert sample lessons for the first module
INSERT INTO lessons (module_id, title, description, content, order_index, lesson_type, estimated_minutes, platform_focus)
SELECT 
    m.id,
    'What is AI?',
    'Understanding artificial intelligence basics',
    'This lesson introduces the fundamentals of artificial intelligence and how it can be used in everyday work...',
    1,
    'tutorial',
    15,
    'mixed'
FROM modules m WHERE m.title = 'Getting Started with AI';

INSERT INTO lessons (module_id, title, description, content, order_index, lesson_type, estimated_minutes, platform_focus)
SELECT 
    m.id,
    'AI vs Machine Learning',
    'Understanding the difference between AI and ML',
    'Learn about the distinction between artificial intelligence and machine learning, and when to use each...',
    2,
    'concept',
    20,
    'mixed'
FROM modules m WHERE m.title = 'Getting Started with AI';

INSERT INTO lessons (module_id, title, description, content, order_index, lesson_type, estimated_minutes, platform_focus)
SELECT 
    m.id,
    'Popular AI Tools',
    'Overview of the most popular AI tools available',
    'Explore the landscape of AI tools including Claude, ChatGPT, Gemini, and others...',
    3,
    'tutorial',
    25,
    'mixed'
FROM modules m WHERE m.title = 'Getting Started with AI';

-- Insert sample prompts
INSERT INTO prompts (lesson_id, title, description, prompt_text, platform, category, use_case, expected_output, order_index)
SELECT 
    l.id,
    'Basic Question Prompt',
    'A simple prompt for asking AI questions',
    'Please explain [TOPIC] in simple terms that a beginner can understand. Include practical examples.',
    'claude',
    'basic',
    'When you need to understand a new concept',
    'Clear, beginner-friendly explanation with examples',
    1
FROM lessons l WHERE l.title = 'What is AI?';

INSERT INTO prompts (lesson_id, title, description, prompt_text, platform, category, use_case, expected_output, order_index)
SELECT 
    l.id,
    'Comparison Prompt',
    'Compare two concepts effectively',
    'Compare and contrast [CONCEPT A] and [CONCEPT B]. Create a table showing their similarities and differences.',
    'claude',
    'advanced',
    'When you need to understand differences between concepts',
    'Structured comparison table with clear distinctions',
    2
FROM lessons l WHERE l.title = 'AI vs Machine Learning';

-- Insert sample quizzes
INSERT INTO quizzes (lesson_id, title, description, question_text, question_type, options, correct_answer, explanation, order_index)
SELECT 
    l.id,
    'AI Definition Quiz',
    'Test your understanding of AI basics',
    'What is the primary goal of artificial intelligence?',
    'multiple_choice',
    '[{"value": "a", "text": "To replace human workers"}, {"value": "b", "text": "To simulate human intelligence"}, {"value": "c", "text": "To create robots"}, {"value": "d", "text": "To make computers faster"}]',
    'b',
    'AI aims to simulate human intelligence in machines, allowing them to perform tasks that typically require human cognition.',
    1
FROM lessons l WHERE l.title = 'What is AI?';

-- Insert sample tasks
INSERT INTO tasks (lesson_id, title, description, instructions, platform, task_type, validation_criteria, submission_format, order_index)
SELECT 
    l.id,
    'Try Your First AI Prompt',
    'Practice using AI with a simple prompt',
    'Go to Claude.ai or ChatGPT and try the basic question prompt you learned. Ask it to explain "machine learning" in simple terms.',
    'claude',
    'prompt_testing',
    'Successfully received a clear explanation of machine learning',
    'text',
    1
FROM lessons l WHERE l.title = 'What is AI?';

-- Enable Row Level Security (RLS)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to course content
CREATE POLICY "Public courses are viewable by everyone" ON courses
    FOR SELECT USING (status = 'published');

CREATE POLICY "Public modules are viewable by everyone" ON modules
    FOR SELECT USING (
        course_id IN (SELECT id FROM courses WHERE status = 'published')
    );

CREATE POLICY "Public lessons are viewable by everyone" ON lessons
    FOR SELECT USING (
        module_id IN (
            SELECT m.id FROM modules m
            JOIN courses c ON m.course_id = c.id
            WHERE c.status = 'published'
        )
    );

CREATE POLICY "Public prompts are viewable by everyone" ON prompts
    FOR SELECT USING (
        lesson_id IN (
            SELECT l.id FROM lessons l
            JOIN modules m ON l.module_id = m.id
            JOIN courses c ON m.course_id = c.id
            WHERE c.status = 'published'
        )
    );

CREATE POLICY "Public quizzes are viewable by everyone" ON quizzes
    FOR SELECT USING (
        lesson_id IN (
            SELECT l.id FROM lessons l
            JOIN modules m ON l.module_id = m.id
            JOIN courses c ON m.course_id = c.id
            WHERE c.status = 'published'
        )
    );

CREATE POLICY "Public tasks are viewable by everyone" ON tasks
    FOR SELECT USING (
        lesson_id IN (
            SELECT l.id FROM lessons l
            JOIN modules m ON l.module_id = m.id
            JOIN courses c ON m.course_id = c.id
            WHERE c.status = 'published'
        )
    );

-- Grant permissions
GRANT SELECT ON courses TO anon, authenticated;
GRANT SELECT ON modules TO anon, authenticated;
GRANT SELECT ON lessons TO anon, authenticated;
GRANT SELECT ON prompts TO anon, authenticated;
GRANT SELECT ON quizzes TO anon, authenticated;
GRANT SELECT ON tasks TO anon, authenticated;

-- Progress tables need authentication
GRANT ALL ON user_progress TO authenticated;
GRANT ALL ON user_quiz_progress TO authenticated;
GRANT ALL ON user_task_progress TO authenticated;

-- Refresh schema cache (if needed)
NOTIFY pgrst, 'reload schema';