-- Update lessons table schema to add missing columns
-- Run this SQL directly in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add all missing columns to lessons table (safe - will not error if columns already exist)
DO $$
BEGIN
    -- Add description column
    BEGIN
        ALTER TABLE lessons ADD COLUMN description TEXT;
        RAISE NOTICE 'Added description column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Description column already exists';
    END;
    
    -- Add order_index column
    BEGIN
        ALTER TABLE lessons ADD COLUMN order_index INTEGER DEFAULT 0;
        RAISE NOTICE 'Added order_index column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Order_index column already exists';
    END;
    
    -- Add content column
    BEGIN
        ALTER TABLE lessons ADD COLUMN content TEXT DEFAULT '';
        RAISE NOTICE 'Added content column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Content column already exists';
    END;
    
    -- Add estimated_minutes column
    BEGIN
        ALTER TABLE lessons ADD COLUMN estimated_minutes INTEGER DEFAULT 30;
        RAISE NOTICE 'Added estimated_minutes column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Estimated_minutes column already exists';
    END;
    
    -- Add lesson_type column
    BEGIN
        ALTER TABLE lessons ADD COLUMN lesson_type VARCHAR(50) DEFAULT 'tutorial';
        RAISE NOTICE 'Added lesson_type column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Lesson_type column already exists';
    END;
    
    -- Add difficulty column
    BEGIN
        ALTER TABLE lessons ADD COLUMN difficulty VARCHAR(50) DEFAULT 'beginner';
        RAISE NOTICE 'Added difficulty column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Difficulty column already exists';
    END;
    
    -- Add learning_objectives column
    BEGIN
        ALTER TABLE lessons ADD COLUMN learning_objectives JSONB DEFAULT '[]';
        RAISE NOTICE 'Added learning_objectives column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Learning_objectives column already exists';
    END;
    
    -- Add prerequisites column
    BEGIN
        ALTER TABLE lessons ADD COLUMN prerequisites JSONB DEFAULT '[]';
        RAISE NOTICE 'Added prerequisites column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Prerequisites column already exists';
    END;
    
    -- Add platform_focus column
    BEGIN
        ALTER TABLE lessons ADD COLUMN platform_focus VARCHAR(50) DEFAULT 'mixed';
        RAISE NOTICE 'Added platform_focus column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Platform_focus column already exists';
    END;
    
    -- Add module_id column if it doesn't exist (for lessons that might reference modules)
    BEGIN
        ALTER TABLE lessons ADD COLUMN module_id UUID REFERENCES modules(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added module_id column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Module_id column already exists';
        WHEN undefined_table THEN
            RAISE NOTICE 'Modules table does not exist - skipping module_id foreign key';
    END;
    
    -- Ensure created_at and updated_at columns exist
    BEGIN
        ALTER TABLE lessons ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added created_at column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Created_at column already exists';
    END;
    
    BEGIN
        ALTER TABLE lessons ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added updated_at column';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Updated_at column already exists';
    END;
END $$;

-- Create indexes for better performance (safe - will not error if indexes already exist)
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons (module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons (order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_type ON lessons (lesson_type);
CREATE INDEX IF NOT EXISTS idx_lessons_difficulty ON lessons (difficulty);
CREATE INDEX IF NOT EXISTS idx_lessons_platform ON lessons (platform_focus);
CREATE INDEX IF NOT EXISTS idx_lessons_created_at ON lessons (created_at);

-- Refresh the schema cache to ensure changes are picked up
NOTIFY pgrst, 'reload schema';

-- Test the update by selecting from lessons table with new columns
SELECT 
    COUNT(*) as lesson_count,
    'Schema update completed successfully' as status
FROM lessons;

-- Show the current structure of the lessons table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'lessons' 
    AND table_schema = 'public'
ORDER BY ordinal_position;