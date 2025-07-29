# 🚀 Manual Schema Migration Instructions

## 📋 Overview
The lessons table needs additional columns to support the migrated lesson structure. These columns must be added manually through the Supabase dashboard.

## 🔧 Step-by-Step Instructions

### 1. Access Supabase Dashboard
- Go to: https://supabase.com/dashboard
- Navigate to your AI-Masterclass project
- Click **"SQL Editor"** in the left sidebar

### 2. Execute Migration SQL
Copy and paste this **complete SQL statement** into the SQL Editor:

```sql
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

-- Refresh schema cache for immediate availability
NOTIFY pgrst, 'reload schema';
```

### 3. Execute the SQL
- Click the **"Run"** button in the SQL Editor
- You should see: `Success. No rows returned`

### 4. Verify Migration
After successful execution, run this command in your terminal:

```bash
node validate-lessons-migration.js
```

**Expected Success Output:**
```
🎉 SCHEMA VALIDATION SUCCESSFUL!
✅ Ready for migrated lessons seeding
✅ All required columns present
✅ Data insertion works correctly
```

### 5. Seed the Migrated Lessons
If validation passes, run:

```bash
node seed-migrated-lessons.js
```

## 🚨 Troubleshooting

### If SQL Execution Fails:
1. **Check permissions**: Ensure you're using the service role key
2. **Try in smaller chunks**: Execute ALTER TABLE and CREATE INDEX statements separately
3. **Check existing constraints**: Some constraints might already exist

### If Validation Still Fails:
1. **Clear schema cache**: 
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```
2. **Wait 30 seconds** and try validation again
3. **Check error messages** for specific missing columns

### If Seeding Fails:
1. **Re-run validation** to confirm all columns exist
2. **Check your .env file** for correct Supabase credentials
3. **Verify lesson files** in `Lessons_correct_format/` directory

## 📊 What This Migration Adds

### New Columns (14 total):
- `description` (TEXT) - Brief lesson description
- `level` (INTEGER) - Course level (1, 2, 3...)
- `module` (INTEGER) - Module within level
- `lesson` (INTEGER) - Lesson within module
- `course_path` (TEXT) - Structured path identifier
- `estimated_time` (INTEGER) - Minutes to complete
- `difficulty` (TEXT) - beginner/intermediate/advanced
- `keywords` (JSONB) - Searchable keywords array
- `learning_objectives` (JSONB) - Learning goals array
- `deliverables` (JSONB) - Expected outputs array
- `prerequisites` (JSONB) - Required prior knowledge
- `status` (TEXT) - Publication status
- `content_type` (TEXT) - Type of content
- `content_length` (INTEGER) - Character count

### Performance Indexes (7 total):
- Fast queries by level, module, lesson
- Efficient filtering by difficulty, status, content type
- Optimized course path lookups

### Data Integrity Constraints:
- Level, module, lesson must be > 0
- Difficulty must be valid option
- Status must be valid publication state
- Content type must be recognized type

## ✅ Success Criteria

After successful migration you should have:
1. ✅ All 14 new columns added to lessons table
2. ✅ Performance indexes created
3. ✅ Data integrity constraints active
4. ✅ Schema validation passing
5. ✅ Ready for lesson seeding

The migration preserves all existing data and adds sensible defaults for new columns.