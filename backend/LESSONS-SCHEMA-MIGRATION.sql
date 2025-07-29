-- ==========================================
-- LESSONS TABLE COMPREHENSIVE SCHEMA MIGRATION
-- ==========================================
-- This script adds all missing columns needed for migrated lessons
-- Safe to run multiple times (uses IF NOT EXISTS pattern)

-- Add missing columns to lessons table with proper data types
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS module INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS lesson INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS course_path TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS estimated_time INTEGER DEFAULT 45,
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'intermediate',
ADD COLUMN IF NOT EXISTS keywords JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS learning_objectives JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS deliverables JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS prerequisites JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'lesson',
ADD COLUMN IF NOT EXISTS content_length INTEGER DEFAULT 0;

-- Ensure proper constraints and indexes
CREATE INDEX IF NOT EXISTS idx_lessons_level ON lessons(level);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module);
CREATE INDEX IF NOT EXISTS idx_lessons_lesson ON lessons(lesson);
CREATE INDEX IF NOT EXISTS idx_lessons_difficulty ON lessons(difficulty);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status);
CREATE INDEX IF NOT EXISTS idx_lessons_content_type ON lessons(content_type);
CREATE INDEX IF NOT EXISTS idx_lessons_course_path ON lessons(course_path);

-- Add check constraints for data integrity
ALTER TABLE lessons 
DROP CONSTRAINT IF EXISTS chk_lessons_level,
ADD CONSTRAINT chk_lessons_level CHECK (level > 0);

ALTER TABLE lessons 
DROP CONSTRAINT IF EXISTS chk_lessons_module,
ADD CONSTRAINT chk_lessons_module CHECK (module > 0);

ALTER TABLE lessons 
DROP CONSTRAINT IF EXISTS chk_lessons_lesson,
ADD CONSTRAINT chk_lessons_lesson CHECK (lesson > 0);

ALTER TABLE lessons 
DROP CONSTRAINT IF EXISTS chk_lessons_difficulty,
ADD CONSTRAINT chk_lessons_difficulty CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'));

ALTER TABLE lessons 
DROP CONSTRAINT IF EXISTS chk_lessons_status,
ADD CONSTRAINT chk_lessons_status CHECK (status IN ('active', 'inactive', 'draft', 'archived'));

ALTER TABLE lessons 
DROP CONSTRAINT IF EXISTS chk_lessons_content_type,
ADD CONSTRAINT chk_lessons_content_type CHECK (content_type IN ('lesson', 'tutorial', 'exercise', 'project', 'assessment'));

-- Update existing lessons to have proper content_length if they have content
UPDATE lessons 
SET content_length = COALESCE(LENGTH(content), 0) 
WHERE content_length = 0 AND content IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN lessons.description IS 'Brief description of the lesson';
COMMENT ON COLUMN lessons.level IS 'Course level (1, 2, 3, etc.)';
COMMENT ON COLUMN lessons.module IS 'Module number within the level';
COMMENT ON COLUMN lessons.lesson IS 'Lesson number within the module';
COMMENT ON COLUMN lessons.course_path IS 'Structured path identifier (e.g., level-1/module-2/lesson-3)';
COMMENT ON COLUMN lessons.estimated_time IS 'Estimated completion time in minutes';
COMMENT ON COLUMN lessons.difficulty IS 'Difficulty level: beginner, intermediate, advanced';
COMMENT ON COLUMN lessons.keywords IS 'Array of keywords/tags for searchability';
COMMENT ON COLUMN lessons.learning_objectives IS 'Array of learning objectives';
COMMENT ON COLUMN lessons.deliverables IS 'Array of expected deliverables';
COMMENT ON COLUMN lessons.prerequisites IS 'Array of prerequisites';
COMMENT ON COLUMN lessons.status IS 'Publication status: active, inactive, draft, archived';
COMMENT ON COLUMN lessons.content_type IS 'Type of content: lesson, tutorial, exercise, project, assessment';
COMMENT ON COLUMN lessons.content_length IS 'Character count of lesson content';

-- Refresh schema cache for immediate availability
NOTIFY pgrst, 'reload schema';