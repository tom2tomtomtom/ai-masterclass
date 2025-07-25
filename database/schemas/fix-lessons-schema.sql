-- Fix lessons table schema by adding missing columns
-- This SQL should be run in Supabase SQL Editor

-- Add all potentially missing columns to lessons table
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS content TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS lesson_type VARCHAR(50) DEFAULT 'tutorial',
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50) DEFAULT 'beginner',
ADD COLUMN IF NOT EXISTS learning_objectives JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS prerequisites JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS platform_focus VARCHAR(50) DEFAULT 'mixed',
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons (order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_type ON lessons (lesson_type);
CREATE INDEX IF NOT EXISTS idx_lessons_platform ON lessons (platform_focus);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons (status);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'lessons' 
ORDER BY ordinal_position;