-- User Scenarios Schema
-- Tables for capturing user's work situations and generating personalized content

-- User work scenarios - capturing real work situations
CREATE TABLE user_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL, -- User's detailed work situation
    industry VARCHAR(100), -- Healthcare, Finance, Marketing, etc.
    department VARCHAR(100), -- IT, Sales, HR, Operations, etc.
    role VARCHAR(100), -- Manager, Analyst, Developer, etc.
    team_size INTEGER,
    main_challenge TEXT NOT NULL, -- Primary problem they want to solve
    current_process TEXT, -- How they currently handle this
    desired_outcome TEXT, -- What they want to achieve
    tools_available JSONB DEFAULT '[]', -- Tools they have access to
    time_constraints VARCHAR(100), -- Daily, weekly, monthly
    complexity_level VARCHAR(50) DEFAULT 'medium', -- simple, medium, complex
    priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_scenarios_user ON user_scenarios (user_id);
CREATE INDEX idx_user_scenarios_industry ON user_scenarios (industry);
CREATE INDEX idx_user_scenarios_department ON user_scenarios (department);
CREATE INDEX idx_user_scenarios_active ON user_scenarios (is_active);

-- Generated personalized prompts based on user scenarios
CREATE TABLE personalized_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_scenario_id UUID REFERENCES user_scenarios(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    prompt_text TEXT NOT NULL, -- Customized prompt for their specific situation
    platform VARCHAR(50) NOT NULL, -- claude, chatgpt, gemini, etc.
    scenario_context TEXT, -- How this applies to their specific situation
    expected_outcome TEXT, -- What they should achieve with this prompt
    follow_up_actions TEXT, -- Next steps after using the prompt
    difficulty VARCHAR(50) DEFAULT 'beginner',
    estimated_time_minutes INTEGER DEFAULT 15,
    success_criteria TEXT, -- How to know if it worked
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_personalized_prompts_scenario ON personalized_prompts (user_scenario_id);
CREATE INDEX idx_personalized_prompts_lesson ON personalized_prompts (lesson_id);
CREATE INDEX idx_personalized_prompts_platform ON personalized_prompts (platform);

-- Customized lesson content based on user scenarios
CREATE TABLE personalized_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_scenario_id UUID REFERENCES user_scenarios(id) ON DELETE CASCADE,
    base_lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    customized_content TEXT NOT NULL, -- Lesson content adapted to their scenario
    scenario_examples TEXT, -- Examples using their specific situation
    industry_context TEXT, -- Industry-specific considerations
    role_specific_tips TEXT, -- Tips for their specific role
    estimated_minutes INTEGER DEFAULT 30,
    learning_objectives JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_personalized_lessons_scenario ON personalized_lessons (user_scenario_id);
CREATE INDEX idx_personalized_lessons_base ON personalized_lessons (base_lesson_id);

-- Customized tasks based on user scenarios
CREATE TABLE personalized_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_scenario_id UUID REFERENCES user_scenarios(id) ON DELETE CASCADE,
    base_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    scenario_instructions TEXT NOT NULL, -- Instructions using their specific situation
    real_world_application TEXT, -- How this applies to their actual work
    success_metrics TEXT, -- How to measure success in their context
    adaptation_notes TEXT, -- How the task was adapted for their scenario
    estimated_minutes INTEGER DEFAULT 30,
    difficulty VARCHAR(50) DEFAULT 'beginner',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_personalized_tasks_scenario ON personalized_tasks (user_scenario_id);
CREATE INDEX idx_personalized_tasks_base ON personalized_tasks (base_task_id);

-- Scenario-based quiz questions
CREATE TABLE personalized_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_scenario_id UUID REFERENCES user_scenarios(id) ON DELETE CASCADE,
    base_quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    question_text TEXT NOT NULL, -- Question adapted to their scenario
    scenario_context TEXT, -- Context using their situation
    options JSONB DEFAULT '[]', -- Customized answer options
    correct_answer VARCHAR(255) NOT NULL,
    explanation TEXT, -- Explanation in context of their scenario
    real_world_application TEXT, -- How this applies to their work
    difficulty VARCHAR(50) DEFAULT 'beginner',
    points INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_personalized_quizzes_scenario ON personalized_quizzes (user_scenario_id);
CREATE INDEX idx_personalized_quizzes_base ON personalized_quizzes (base_quiz_id);

-- User scenario progress tracking
CREATE TABLE user_scenario_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_scenario_id UUID REFERENCES user_scenarios(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
    personalization_generated BOOLEAN DEFAULT false,
    content_satisfaction_rating INTEGER, -- 1-5 rating of how relevant the content was
    real_world_success BOOLEAN, -- Did they successfully apply this to their work?
    implementation_notes TEXT, -- Notes about how they implemented it
    challenges_faced TEXT, -- Challenges they encountered
    results_achieved TEXT, -- What they accomplished
    would_recommend BOOLEAN, -- Would they recommend this approach?
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, user_scenario_id, lesson_id)
);

CREATE INDEX idx_user_scenario_progress_user ON user_scenario_progress (user_id);
CREATE INDEX idx_user_scenario_progress_scenario ON user_scenario_progress (user_scenario_id);
CREATE INDEX idx_user_scenario_progress_lesson ON user_scenario_progress (lesson_id);

-- Scenario template library for common work situations
CREATE TABLE scenario_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    industry VARCHAR(100), -- Can be null for cross-industry templates
    department VARCHAR(100), -- Can be null for cross-department templates
    common_roles JSONB DEFAULT '[]', -- Array of roles this applies to
    scenario_template TEXT NOT NULL, -- Template with placeholders
    challenge_categories JSONB DEFAULT '[]', -- Types of challenges this addresses
    complexity_level VARCHAR(50) DEFAULT 'medium',
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00, -- % of users who found it helpful
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_scenario_templates_industry ON scenario_templates (industry);
CREATE INDEX idx_scenario_templates_department ON scenario_templates (department);
CREATE INDEX idx_scenario_templates_active ON scenario_templates (is_active);

-- Mapping user scenarios to templates they were based on
CREATE TABLE user_scenario_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_scenario_id UUID REFERENCES user_scenarios(id) ON DELETE CASCADE,
    scenario_template_id UUID REFERENCES scenario_templates(id) ON DELETE CASCADE,
    customization_notes TEXT, -- How the template was customized
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_scenario_id, scenario_template_id)
);

CREATE INDEX idx_user_scenario_templates_scenario ON user_scenario_templates (user_scenario_id);
CREATE INDEX idx_user_scenario_templates_template ON user_scenario_templates (scenario_template_id);