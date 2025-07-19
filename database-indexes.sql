-- AI Masterclass Database Performance Indexes
-- Execute this SQL in Supabase SQL Editor to add performance indexes

-- ==================================================
-- Users Table Indexes
-- ==================================================
CREATE INDEX IF NOT EXISTS idx_users_email_unique ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users (company_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users (is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at DESC);

-- ==================================================
-- Courses Table Indexes  
-- ==================================================
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses (level);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses (status);
CREATE INDEX IF NOT EXISTS idx_courses_order_index ON courses (order_index);
CREATE INDEX IF NOT EXISTS idx_courses_level_order ON courses (level, order_index);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses (status) WHERE status = 'published';

-- ==================================================
-- Modules Table Indexes
-- ==================================================
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules (course_id);
CREATE INDEX IF NOT EXISTS idx_modules_order_index ON modules (order_index);
CREATE INDEX IF NOT EXISTS idx_modules_type ON modules (module_type);
CREATE INDEX IF NOT EXISTS idx_modules_course_order ON modules (course_id, order_index);

-- ==================================================
-- Lessons Table Indexes
-- ==================================================
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons (module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order_index ON lessons (order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_type ON lessons (lesson_type);
CREATE INDEX IF NOT EXISTS idx_lessons_platform ON lessons (platform_focus);
CREATE INDEX IF NOT EXISTS idx_lessons_difficulty ON lessons (difficulty);
CREATE INDEX IF NOT EXISTS idx_lessons_module_order ON lessons (module_id, order_index);

-- For direct course-lesson relationships (if course_id exists)
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons (course_id) WHERE course_id IS NOT NULL;

-- ==================================================
-- Prompts Table Indexes
-- ==================================================
CREATE INDEX IF NOT EXISTS idx_prompts_lesson_id ON prompts (lesson_id);
CREATE INDEX IF NOT EXISTS idx_prompts_platform ON prompts (platform);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts (category);
CREATE INDEX IF NOT EXISTS idx_prompts_order_index ON prompts (order_index);
CREATE INDEX IF NOT EXISTS idx_prompts_lesson_order ON prompts (lesson_id, order_index);

-- ==================================================
-- Quizzes Table Indexes
-- ==================================================
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_id ON quizzes (lesson_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_type ON quizzes (question_type);
CREATE INDEX IF NOT EXISTS idx_quizzes_difficulty ON quizzes (difficulty);
CREATE INDEX IF NOT EXISTS idx_quizzes_order_index ON quizzes (order_index);
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_order ON quizzes (lesson_id, order_index);

-- ==================================================
-- Tasks Table Indexes
-- ==================================================
CREATE INDEX IF NOT EXISTS idx_tasks_lesson_id ON tasks (lesson_id);
CREATE INDEX IF NOT EXISTS idx_tasks_platform ON tasks (platform);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks (task_type);
CREATE INDEX IF NOT EXISTS idx_tasks_difficulty ON tasks (difficulty);
CREATE INDEX IF NOT EXISTS idx_tasks_required ON tasks (is_required);
CREATE INDEX IF NOT EXISTS idx_tasks_lesson_order ON tasks (lesson_id, order_index);

-- ==================================================
-- User Progress Table Indexes
-- ==================================================
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_exercise_id ON user_progress (exercise_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress (status);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_status ON user_progress (user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_progress_updated_at ON user_progress (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_completion ON user_progress (user_id, completion_percentage) WHERE completion_percentage > 0;

-- ==================================================
-- User Quiz Progress Table Indexes
-- ==================================================
CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_user_id ON user_quiz_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_quiz_id ON user_quiz_progress (quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_correct ON user_quiz_progress (is_correct);
CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_submitted ON user_quiz_progress (submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_quiz_progress_user_quiz ON user_quiz_progress (user_id, quiz_id);

-- ==================================================
-- User Task Progress Table Indexes
-- ==================================================
CREATE INDEX IF NOT EXISTS idx_user_task_progress_user_id ON user_task_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_user_task_progress_task_id ON user_task_progress (task_id);
CREATE INDEX IF NOT EXISTS idx_user_task_progress_status ON user_task_progress (status);
CREATE INDEX IF NOT EXISTS idx_user_task_progress_submitted ON user_task_progress (submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_task_progress_user_task ON user_task_progress (user_id, task_id);

-- ==================================================
-- Companies Table Indexes
-- ==================================================
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies (name);

-- ==================================================
-- Composite Indexes for Common Query Patterns
-- ==================================================

-- Course browsing patterns
CREATE INDEX IF NOT EXISTS idx_courses_level_status ON courses (level, status) WHERE status = 'published';

-- Learning path queries
CREATE INDEX IF NOT EXISTS idx_lessons_course_module_order ON lessons (course_id, module_id, order_index) WHERE course_id IS NOT NULL;

-- User progress queries
CREATE INDEX IF NOT EXISTS idx_user_progress_user_updated ON user_progress (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed ON user_progress (user_id, status, updated_at DESC) WHERE status = 'completed';

-- Content search patterns
CREATE INDEX IF NOT EXISTS idx_prompts_platform_category ON prompts (platform, category);
CREATE INDEX IF NOT EXISTS idx_tasks_platform_type ON tasks (platform, task_type);

-- Performance monitoring indexes
CREATE INDEX IF NOT EXISTS idx_lessons_estimated_minutes ON lessons (estimated_minutes) WHERE estimated_minutes IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_courses_estimated_hours ON courses (estimated_hours) WHERE estimated_hours IS NOT NULL;

-- ==================================================
-- Text Search Indexes (for PostgreSQL full-text search)
-- ==================================================

-- Course content search
CREATE INDEX IF NOT EXISTS idx_courses_title_search ON courses USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_lessons_title_search ON lessons USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_lessons_content_search ON lessons USING gin(to_tsvector('english', content));

-- Prompt search
CREATE INDEX IF NOT EXISTS idx_prompts_title_search ON prompts USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_prompts_text_search ON prompts USING gin(to_tsvector('english', prompt_text));

-- ==================================================
-- Vacuum and Analyze for Performance
-- ==================================================

VACUUM ANALYZE users;
VACUUM ANALYZE courses;
VACUUM ANALYZE modules;
VACUUM ANALYZE lessons;
VACUUM ANALYZE prompts;
VACUUM ANALYZE quizzes;
VACUUM ANALYZE tasks;
VACUUM ANALYZE user_progress;
VACUUM ANALYZE user_quiz_progress;
VACUUM ANALYZE user_task_progress;

-- ==================================================
-- Performance Verification Queries
-- ==================================================

-- Check index usage (uncomment to run)
/*
SELECT 
  schemaname,
  tablename,
  attname AS column_name,
  n_distinct,
  correlation
FROM pg_stats 
WHERE schemaname = 'public' 
  AND tablename IN ('courses', 'lessons', 'user_progress')
ORDER BY tablename, attname;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
*/