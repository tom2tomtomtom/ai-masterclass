-- COMPLETE SUPABASE SCHEMA FOR FULL CONTENT FEATURES
-- Run this in Supabase SQL Editor to enable lessons, prompts, quizzes, tasks

-- Add missing columns to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS estimated_hours INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS prerequisites JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS objectives JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'published',
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 1;

-- Create modules table if it doesn't exist
CREATE TABLE IF NOT EXISTS modules (
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

-- Update lessons table with missing columns
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS lesson_type VARCHAR(50) DEFAULT 'tutorial',
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50) DEFAULT 'beginner',
ADD COLUMN IF NOT EXISTS learning_objectives JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS prerequisites JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS platform_focus VARCHAR(50) DEFAULT 'mixed';

-- Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
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

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
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

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
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

-- Create progress tracking tables
CREATE TABLE IF NOT EXISTS user_progress (
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

-- Create user quiz progress table
CREATE TABLE IF NOT EXISTS user_quiz_progress (
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

-- Create user task progress table  
CREATE TABLE IF NOT EXISTS user_task_progress (
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

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses (level);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses (status);
CREATE INDEX IF NOT EXISTS idx_courses_order ON courses (order_index);

CREATE INDEX IF NOT EXISTS idx_modules_course ON modules (course_id);
CREATE INDEX IF NOT EXISTS idx_modules_type ON modules (module_type);
CREATE INDEX IF NOT EXISTS idx_modules_order ON modules (order_index);

CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons (module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons (course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_type ON lessons (lesson_type);
CREATE INDEX IF NOT EXISTS idx_lessons_platform ON lessons (platform_focus);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons (order_index);

CREATE INDEX IF NOT EXISTS idx_prompts_lesson ON prompts (lesson_id);
CREATE INDEX IF NOT EXISTS idx_prompts_platform ON prompts (platform);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts (category);

CREATE INDEX IF NOT EXISTS idx_quizzes_lesson ON quizzes (lesson_id);
CREATE INDEX IF NOT EXISTS idx_tasks_lesson ON tasks (lesson_id);

-- Enable Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY IF NOT EXISTS "Public courses are viewable by everyone" ON courses
    FOR SELECT USING (status = 'published');

CREATE POLICY IF NOT EXISTS "Public modules are viewable by everyone" ON modules
    FOR SELECT USING (
        course_id IN (SELECT id FROM courses WHERE status = 'published')
    );

CREATE POLICY IF NOT EXISTS "Public lessons are viewable by everyone" ON lessons
    FOR SELECT USING (
        course_id IN (SELECT id FROM courses WHERE status = 'published')
        OR module_id IN (
            SELECT m.id FROM modules m
            JOIN courses c ON m.course_id = c.id
            WHERE c.status = 'published'
        )
    );

CREATE POLICY IF NOT EXISTS "Public prompts are viewable by everyone" ON prompts
    FOR SELECT USING (
        lesson_id IN (
            SELECT l.id FROM lessons l
            LEFT JOIN modules m ON l.module_id = m.id
            LEFT JOIN courses c ON m.course_id = c.id OR l.course_id = c.id
            WHERE c.status = 'published'
        )
    );

CREATE POLICY IF NOT EXISTS "Public quizzes are viewable by everyone" ON quizzes
    FOR SELECT USING (
        lesson_id IN (
            SELECT l.id FROM lessons l
            LEFT JOIN modules m ON l.module_id = m.id
            LEFT JOIN courses c ON m.course_id = c.id OR l.course_id = c.id
            WHERE c.status = 'published'
        )
    );

CREATE POLICY IF NOT EXISTS "Public tasks are viewable by everyone" ON tasks
    FOR SELECT USING (
        lesson_id IN (
            SELECT l.id FROM lessons l
            LEFT JOIN modules m ON l.module_id = m.id
            LEFT JOIN courses c ON m.course_id = c.id OR l.course_id = c.id
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

-- Update existing courses with missing fields
UPDATE courses SET 
    status = 'published',
    estimated_hours = COALESCE(duration_minutes / 60, 0),
    order_index = CASE 
        WHEN title ILIKE '%Gemini%' THEN 1
        WHEN title ILIKE '%Claude%' THEN 2  
        WHEN title ILIKE '%ChatGPT%' THEN 3
        WHEN title ILIKE '%Custom%' THEN 4
        WHEN title ILIKE '%Agency%' THEN 5
        ELSE 6
    END;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'SCHEMA UPDATE COMPLETE! Ready for full content seeding with lessons, prompts, quizzes, and tasks.';
END
$$;