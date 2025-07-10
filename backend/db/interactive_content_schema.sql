-- Interactive Textbook Content Schema
-- Tables for lessons, prompts, quizzes, and tasks

-- Lessons table - Rich text content with embedded prompts
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL, -- Rich text content with embedded prompts
    order_index INTEGER NOT NULL,
    estimated_minutes INTEGER DEFAULT 30,
    lesson_type VARCHAR(50) NOT NULL, -- 'tutorial', 'concept', 'practice'
    difficulty VARCHAR(50) DEFAULT 'beginner',
    learning_objectives JSONB DEFAULT '[]',
    prerequisites JSONB DEFAULT '[]',
    platform_focus VARCHAR(50), -- 'claude', 'chatgpt', 'gemini', 'zapier', 'n8n', 'mixed'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lessons_module ON lessons (module_id);
CREATE INDEX idx_lessons_type ON lessons (lesson_type);
CREATE INDEX idx_lessons_platform ON lessons (platform_focus);

-- Prompts table - Copy-paste templates organized by platform
CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    prompt_text TEXT NOT NULL, -- The actual prompt to copy-paste
    platform VARCHAR(50) NOT NULL, -- 'claude', 'chatgpt', 'gemini', 'zapier', 'n8n'
    category VARCHAR(50) NOT NULL, -- 'basic', 'advanced', 'business', 'technical'
    use_case VARCHAR(255), -- Brief description of when to use this prompt
    expected_output TEXT, -- Example of what the AI should return
    tips TEXT, -- Tips for using this prompt effectively
    order_index INTEGER NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'beginner',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_prompts_lesson ON prompts (lesson_id);
CREATE INDEX idx_prompts_platform ON prompts (platform);
CREATE INDEX idx_prompts_category ON prompts (category);

-- Quizzes table - Multiple choice, true/false, and short answer questions
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL, -- 'multiple_choice', 'true_false', 'short_answer'
    options JSONB DEFAULT '[]', -- For multiple choice: [{"value": "a", "text": "Option A"}, ...]
    correct_answer VARCHAR(255) NOT NULL, -- For MC: "a", for T/F: "true"/"false"
    explanation TEXT, -- Explanation of the correct answer
    difficulty VARCHAR(50) DEFAULT 'beginner',
    points INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_quizzes_lesson ON quizzes (lesson_id);
CREATE INDEX idx_quizzes_type ON quizzes (question_type);

-- Tasks table - Practical tasks with completion tracking
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT NOT NULL, -- Step-by-step instructions
    platform VARCHAR(50) NOT NULL, -- Platform where task should be completed
    task_type VARCHAR(50) NOT NULL, -- 'prompt_testing', 'automation_setup', 'tool_configuration'
    validation_criteria TEXT, -- What constitutes successful completion
    submission_format VARCHAR(50), -- 'screenshot', 'text', 'url', 'file'
    estimated_minutes INTEGER DEFAULT 30,
    difficulty VARCHAR(50) DEFAULT 'beginner',
    required_tools JSONB DEFAULT '[]', -- Tools/platforms needed
    hints TEXT, -- Helpful hints for completing the task
    order_index INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT true, -- Must complete to progress
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tasks_lesson ON tasks (lesson_id);
CREATE INDEX idx_tasks_platform ON tasks (platform);
CREATE INDEX idx_tasks_type ON tasks (task_type);

-- User lesson progress tracking
CREATE TABLE user_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
    completion_percentage INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    last_accessed TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_user_lesson_progress_user ON user_lesson_progress (user_id);
CREATE INDEX idx_user_lesson_progress_lesson ON user_lesson_progress (lesson_id);
CREATE INDEX idx_user_lesson_progress_status ON user_lesson_progress (status);

-- User quiz attempts and scores
CREATE TABLE user_quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    answer VARCHAR(255) NOT NULL, -- User's answer
    is_correct BOOLEAN NOT NULL,
    attempt_number INTEGER DEFAULT 1,
    time_taken_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_quiz_attempts_user ON user_quiz_attempts (user_id);
CREATE INDEX idx_user_quiz_attempts_quiz ON user_quiz_attempts (quiz_id);

-- User task submissions and completion
CREATE TABLE user_task_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    submission_content TEXT, -- Screenshot URL, text description, etc.
    submission_type VARCHAR(50) NOT NULL, -- 'screenshot', 'text', 'url', 'file'
    status VARCHAR(50) NOT NULL DEFAULT 'submitted', -- 'submitted', 'approved', 'rejected', 'needs_revision'
    feedback TEXT, -- Instructor or AI feedback
    score INTEGER DEFAULT 0,
    attempt_number INTEGER DEFAULT 1,
    time_spent_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_task_submissions_user ON user_task_submissions (user_id);
CREATE INDEX idx_user_task_submissions_task ON user_task_submissions (task_id);
CREATE INDEX idx_user_task_submissions_status ON user_task_submissions (status);

-- User prompt usage tracking
CREATE TABLE user_prompt_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    prompt_id UUID REFERENCES prompts(id) ON DELETE CASCADE,
    copied_at TIMESTAMP DEFAULT NOW(),
    platform_used VARCHAR(50), -- Where they used the prompt
    effectiveness_rating INTEGER, -- 1-5 rating of how well it worked
    notes TEXT, -- User's notes about the prompt
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_prompt_usage_user ON user_prompt_usage (user_id);
CREATE INDEX idx_user_prompt_usage_prompt ON user_prompt_usage (prompt_id);