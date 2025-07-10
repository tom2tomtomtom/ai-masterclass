-- Performance Optimization Indexes for AI-Masterclass Database (Test Version)
-- These indexes are created without CONCURRENTLY for test environments

-- Composite indexes for common multi-column queries
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users (role, is_active);
CREATE INDEX IF NOT EXISTS idx_users_company_role ON users (company_id, role);

-- Time-based indexes for filtering and ordering
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users (last_login DESC) WHERE last_login IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at DESC);

-- Course and module ordering indexes
CREATE INDEX IF NOT EXISTS idx_courses_level_order ON courses (level ASC, order_index ASC);
CREATE INDEX IF NOT EXISTS idx_modules_course_order ON modules (course_id, order_index ASC);

-- Progress tracking optimization
CREATE INDEX IF NOT EXISTS idx_progress_user_course ON user_progress (user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_status ON user_progress (user_id, status);
CREATE INDEX IF NOT EXISTS idx_progress_completion ON user_progress (completion_percentage DESC) WHERE completion_percentage > 0;
CREATE INDEX IF NOT EXISTS idx_progress_last_attempt ON user_progress (last_attempt DESC) WHERE last_attempt IS NOT NULL;

-- Exercise difficulty and type filtering
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty_type ON exercises (difficulty, exercise_type);
CREATE INDEX IF NOT EXISTS idx_modules_course_type ON modules (course_id, module_type);

-- Code submissions optimization
CREATE INDEX IF NOT EXISTS idx_submissions_user_created ON code_submissions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_exercise_score ON code_submissions (exercise_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_status_created ON code_submissions (status, created_at DESC);

-- Automation workflows optimization
CREATE INDEX IF NOT EXISTS idx_workflows_user_platform ON automation_workflows (user_id, platform);
CREATE INDEX IF NOT EXISTS idx_workflows_status_updated ON automation_workflows (deployment_status, updated_at DESC);

-- AI and tool integrations optimization
CREATE INDEX IF NOT EXISTS idx_ai_provider_active ON ai_integrations (provider, is_active);
CREATE INDEX IF NOT EXISTS idx_tools_category_active ON tool_integrations (category, is_active);

-- JSONB indexes for common searches
CREATE INDEX IF NOT EXISTS idx_users_skills_gin ON users USING GIN (skills);
CREATE INDEX IF NOT EXISTS idx_courses_prerequisites_gin ON courses USING GIN (prerequisites);
CREATE INDEX IF NOT EXISTS idx_exercises_tools_gin ON exercises USING GIN (tools_required);

-- Text search indexes for content
CREATE INDEX IF NOT EXISTS idx_courses_title_gin ON courses USING GIN (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_courses_description_gin ON courses USING GIN (to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_modules_title_gin ON modules USING GIN (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_exercises_title_gin ON exercises USING GIN (to_tsvector('english', title));

-- Partial indexes for active records only
CREATE INDEX IF NOT EXISTS idx_courses_active_level ON courses (level, order_index) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_users_active_company ON users (company_id) WHERE is_active = true;

-- Foreign key indexes for better join performance
CREATE INDEX IF NOT EXISTS idx_modules_course_fk ON modules (course_id);
CREATE INDEX IF NOT EXISTS idx_exercises_module_fk ON exercises (module_id);
CREATE INDEX IF NOT EXISTS idx_progress_module_fk ON user_progress (module_id);
CREATE INDEX IF NOT EXISTS idx_progress_exercise_fk ON user_progress (exercise_id);

-- Performance monitoring helper indexes
CREATE INDEX IF NOT EXISTS idx_submissions_execution_time ON code_submissions (execution_time_ms DESC) WHERE execution_time_ms > 0;
CREATE INDEX IF NOT EXISTS idx_progress_time_spent ON user_progress (time_spent_minutes DESC) WHERE time_spent_minutes > 0;