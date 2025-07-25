-- =====================================================
-- DEFINITIVE AI MASTERCLASS PLATFORM DATABASE SCHEMA
-- =====================================================
-- This schema matches EXACTLY what the seeding scripts expect
--
-- SEEDING COMPATIBILITY:
-- ✅ seed-master-complete-platform.js
-- ✅ seed-all-modules-complete.js
-- ✅ seed-all-lessons-complete.js
-- ✅ seed-ultimate-complete-platform.js
--
-- CONTENT SUPPORT:
-- • 16 Comprehensive Courses (Foundation + AI Masterclass + Enhanced Foundation)
-- • 49+ Specialized Modules with detailed organization
-- • 130+ Detailed Lessons with rich markdown content
-- • Interactive content (prompts, quizzes, tasks) - optional
-- • User progress tracking - optional
-- =====================================================

-- Enable UUID extension (required for Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE ORGANIZATIONAL TABLES
-- =====================================================

-- Companies table for organizational structure
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Users table with comprehensive user management
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'learner',
    subscription_tier VARCHAR(50) DEFAULT 'free',
    company_id UUID REFERENCES companies(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{}',
    skills JSONB DEFAULT '[]'
);

-- User indexes for performance
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_company ON users (company_id);
CREATE INDEX idx_users_role ON users (role);

-- =====================================================
-- CORE COURSE STRUCTURE TABLES (REQUIRED FOR ALL SEEDING)
-- =====================================================

-- Courses table - EXACTLY matches seeding script expectations
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,                    -- Used by: all seeding scripts
    description TEXT,                               -- Used by: course seeding
    level INTEGER NOT NULL,                         -- Used by: course seeding (1, 2, 3)
    order_index INTEGER NOT NULL,                   -- Used by: course seeding (1-16)
    estimated_hours INTEGER DEFAULT 0,              -- Used by: course seeding
    status VARCHAR(50) DEFAULT 'published',         -- Used by: course seeding
    objectives JSONB DEFAULT '[]',                  -- Used by: course seeding (array of strings)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Course indexes
CREATE INDEX idx_courses_level ON courses (level);
CREATE INDEX idx_courses_status ON courses (status);
CREATE INDEX idx_courses_order ON courses (order_index);

-- Modules table - EXACTLY matches seeding script expectations
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,  -- Used by: module seeding (FK to courses)
    title VARCHAR(255) NOT NULL,                              -- Used by: module seeding
    description TEXT,                                         -- Used by: module seeding
    order_index INTEGER NOT NULL,                             -- Used by: module seeding (1, 2, 3, etc.)
    module_type VARCHAR(50) NOT NULL,                         -- Used by: module seeding ('theory', 'exercise', 'practical', 'technical', 'strategic', etc.)
    estimated_minutes INTEGER DEFAULT 0,                      -- Used by: module seeding
    difficulty VARCHAR(50) DEFAULT 'beginner',                -- Used by: module seeding ('beginner', 'intermediate', 'advanced', 'expert')
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Module indexes
CREATE INDEX idx_modules_course ON modules (course_id);
CREATE INDEX idx_modules_type ON modules (module_type);
CREATE INDEX idx_modules_order ON modules (order_index);

-- =====================================================
-- LESSON CONTENT TABLES (REQUIRED FOR LESSON SEEDING)
-- =====================================================

-- Lessons table - EXACTLY matches seeding script expectations
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,  -- Used by: lesson seeding (FK to modules)
    title VARCHAR(255) NOT NULL,                              -- Used by: lesson seeding (extracted from markdown)
    content TEXT NOT NULL,                                    -- Used by: lesson seeding (full markdown content from files)
    order_index INTEGER NOT NULL,                             -- Used by: lesson seeding (1, 2, 3, etc.)
    lesson_type VARCHAR(50) NOT NULL DEFAULT 'lesson',        -- Used by: lesson seeding ('lesson', 'exercise', 'tutorial', etc.)
    estimated_minutes INTEGER DEFAULT 30,                     -- Used by: lesson seeding (calculated from content length)
    status VARCHAR(50) DEFAULT 'published',                   -- Used by: lesson seeding
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Lesson indexes
CREATE INDEX idx_lessons_module ON lessons (module_id);
CREATE INDEX idx_lessons_type ON lessons (lesson_type);
CREATE INDEX idx_lessons_platform ON lessons (platform_focus);
CREATE INDEX idx_lessons_order ON lessons (order_index);
CREATE INDEX idx_lessons_status ON lessons (status);

-- =====================================================
-- INTERACTIVE CONTENT TABLES (OPTIONAL)
-- =====================================================

-- Prompts table - Copy-paste templates
CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    prompt_text TEXT NOT NULL,
    platform VARCHAR(50) NOT NULL, -- 'claude', 'chatgpt', 'gemini', 'zapier', 'n8n'
    category VARCHAR(50) NOT NULL, -- 'basic', 'advanced', 'business', 'technical'
    use_case VARCHAR(255),
    expected_output TEXT,
    tips TEXT,
    order_index INTEGER NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'beginner',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Prompt indexes
CREATE INDEX idx_prompts_lesson ON prompts (lesson_id);
CREATE INDEX idx_prompts_platform ON prompts (platform);
CREATE INDEX idx_prompts_category ON prompts (category);

-- Quizzes table - Assessment questions
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL, -- 'multiple_choice', 'true_false', 'short_answer'
    options JSONB DEFAULT '[]',
    correct_answer VARCHAR(255) NOT NULL,
    explanation TEXT,
    difficulty VARCHAR(50) DEFAULT 'beginner',
    points INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Quiz indexes
CREATE INDEX idx_quizzes_lesson ON quizzes (lesson_id);
CREATE INDEX idx_quizzes_type ON quizzes (question_type);

-- Tasks table - Practical assignments
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT NOT NULL,
    platform VARCHAR(50) NOT NULL,
    task_type VARCHAR(50) NOT NULL, -- 'prompt_testing', 'automation_setup', 'tool_configuration'
    validation_criteria TEXT,
    submission_format VARCHAR(50), -- 'screenshot', 'text', 'url', 'file'
    estimated_minutes INTEGER DEFAULT 30,
    difficulty VARCHAR(50) DEFAULT 'beginner',
    required_tools JSONB DEFAULT '[]',
    hints TEXT,
    order_index INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Task indexes
CREATE INDEX idx_tasks_lesson ON tasks (lesson_id);
CREATE INDEX idx_tasks_platform ON tasks (platform);
CREATE INDEX idx_tasks_type ON tasks (task_type);

-- =====================================================
-- USER PROGRESS TRACKING TABLES (OPTIONAL)
-- =====================================================

-- User progress for courses/modules/lessons
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed', 'skipped'
    score INTEGER DEFAULT 0,
    completion_percentage INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    last_attempt TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, course_id, module_id)
);

-- Progress indexes
CREATE INDEX idx_progress_user ON user_progress (user_id);
CREATE INDEX idx_progress_course ON user_progress (course_id);
CREATE INDEX idx_progress_status ON user_progress (status);

-- User lesson progress tracking
CREATE TABLE user_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'not_started',
    completion_percentage INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    last_accessed TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- User lesson progress indexes
CREATE INDEX idx_user_lesson_progress_user ON user_lesson_progress (user_id);
CREATE INDEX idx_user_lesson_progress_lesson ON user_lesson_progress (lesson_id);
CREATE INDEX idx_user_lesson_progress_status ON user_lesson_progress (status);

-- User quiz attempts
CREATE TABLE user_quiz_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    answer VARCHAR(255) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    attempt_number INTEGER DEFAULT 1,
    time_taken_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Quiz progress indexes
CREATE INDEX idx_user_quiz_progress_user ON user_quiz_progress (user_id);
CREATE INDEX idx_user_quiz_progress_quiz ON user_quiz_progress (quiz_id);

-- User task submissions
CREATE TABLE user_task_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    submission_content TEXT,
    submission_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted',
    feedback TEXT,
    score INTEGER DEFAULT 0,
    attempt_number INTEGER DEFAULT 1,
    time_spent_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Task progress indexes
CREATE INDEX idx_user_task_progress_user ON user_task_progress (user_id);
CREATE INDEX idx_user_task_progress_task ON user_task_progress (task_id);
CREATE INDEX idx_user_task_progress_status ON user_task_progress (status);

-- =====================================================
-- SEEDING VERIFICATION QUERIES
-- =====================================================

-- Use these queries to verify successful seeding:

-- Check course count: SELECT COUNT(*) FROM courses;
-- Check module count: SELECT COUNT(*) FROM modules;  
-- Check lesson count: SELECT COUNT(*) FROM lessons;
-- Check course structure: SELECT c.title, COUNT(m.id) as modules FROM courses c LEFT JOIN modules m ON c.id = m.course_id GROUP BY c.id, c.title ORDER BY c.order_index;
-- Check lesson distribution: SELECT m.title, COUNT(l.id) as lessons FROM modules m LEFT JOIN lessons l ON m.id = l.module_id GROUP BY m.id, m.title;
