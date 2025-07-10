CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

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

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_company ON users (company_id);
CREATE INDEX idx_users_role ON users (role);

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    level INTEGER NOT NULL,
    order_index INTEGER NOT NULL,
    estimated_hours INTEGER DEFAULT 0,
    prerequisites JSONB DEFAULT '[]',
    objectives JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_courses_level ON courses (level);
CREATE INDEX idx_courses_status ON courses (status);

CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    content JSONB NOT NULL,
    estimated_minutes INTEGER DEFAULT 0,
    module_type VARCHAR(50) NOT NULL, -- 'theory', 'exercise', 'project'
    difficulty VARCHAR(50) DEFAULT 'beginner',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_modules_course ON modules (course_id);
CREATE INDEX idx_modules_type ON modules (module_type);

CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    instructions JSONB NOT NULL,
    starter_code TEXT,
    solution_code TEXT,
    test_cases JSONB DEFAULT '[]',
    validation_rules JSONB DEFAULT '{}',
    tools_required JSONB DEFAULT '[]',
    apis_required JSONB DEFAULT '[]',
    estimated_minutes INTEGER DEFAULT 30,
    difficulty VARCHAR(50) DEFAULT 'beginner',
    exercise_type VARCHAR(50) NOT NULL, -- 'coding', 'automation', 'prompting'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_exercises_module ON exercises (module_id);
CREATE INDEX idx_exercises_type ON exercises (exercise_type);

CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL, -- 'not_started', 'in_progress', 'completed', 'skipped'
    score INTEGER DEFAULT 0,
    completion_percentage INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    last_attempt TIMESTAMP,
    user_code TEXT,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, exercise_id)
);

CREATE INDEX idx_progress_user ON user_progress (user_id);
CREATE INDEX idx_progress_course ON user_progress (course_id);
CREATE INDEX idx_progress_status ON user_progress (status);

CREATE TABLE ai_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL, -- 'openai', 'anthropic', 'google'
    api_endpoint VARCHAR(255) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    capabilities JSONB DEFAULT '[]',
    rate_limits JSONB DEFAULT '{}',
    cost_per_request DECIMAL(10,6) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_provider ON ai_integrations (provider);
CREATE INDEX idx_ai_active ON ai_integrations (is_active);

CREATE TABLE tool_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'automation', 'development', 'ai_assistant'
    api_endpoint VARCHAR(255),
    authentication_type VARCHAR(50), -- 'api_key', 'oauth', 'none'
    setup_instructions JSONB DEFAULT '{}',
    sandbox_available BOOLEAN DEFAULT false,
    sandbox_endpoint VARCHAR(255),
    documentation_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tools_category ON tool_integrations (category);
CREATE INDEX idx_tools_active ON tool_integrations (is_active);

CREATE TABLE code_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    submission_code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    execution_result JSONB DEFAULT '{}',
    test_results JSONB DEFAULT '{}',
    ai_feedback TEXT,
    score INTEGER DEFAULT 0,
    execution_time_ms INTEGER DEFAULT 0,
    status VARCHAR(50) NOT NULL, -- 'submitted', 'running', 'completed', 'failed'
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_submissions_user ON code_submissions (user_id);
CREATE INDEX idx_submissions_exercise ON code_submissions (exercise_id);
CREATE INDEX idx_submissions_status ON code_submissions (status);

CREATE TABLE automation_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    workflow_name VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL, -- 'zapier', 'n8n', 'make'
    workflow_config JSONB NOT NULL,
    test_results JSONB DEFAULT '{}',
    deployment_status VARCHAR(50) DEFAULT 'draft',
    webhook_url VARCHAR(255),
    api_connections JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_workflows_user ON automation_workflows (user_id);
CREATE INDEX idx_workflows_platform ON automation_workflows (platform);
CREATE INDEX idx_workflows_status ON automation_workflows (deployment_status);