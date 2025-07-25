-- Fix quiz table schema
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS question_text TEXT;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS question_type VARCHAR(50) DEFAULT 'multiple_choice';
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS options JSONB;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS correct_answer VARCHAR(10);
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS explanation TEXT;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'beginner';
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS lesson_id UUID;

-- Fix tasks table schema
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS validation_criteria TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT 30;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_required BOOLEAN DEFAULT true;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS lesson_id UUID;

-- Add foreign key constraints if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'quizzes_lesson_id_fkey'
    ) THEN
        ALTER TABLE quizzes ADD CONSTRAINT quizzes_lesson_id_fkey 
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tasks_lesson_id_fkey'
    ) THEN
        ALTER TABLE tasks ADD CONSTRAINT tasks_lesson_id_fkey 
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
    END IF;
END $$;