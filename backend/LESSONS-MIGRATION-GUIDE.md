# 🚀 Lessons Schema Migration Guide

## Overview
This guide will help you migrate your lessons table to support all the metadata fields from your YAML front matter, specifically adding the missing `content_length` column and other required fields.

## 🔧 What's Missing
Your seeding script expects these columns that are currently missing:
- `content_length` (INTEGER)
- `level` (INTEGER)  
- `module` (INTEGER)
- `lesson` (INTEGER)
- `course_path` (TEXT)
- `estimated_time` (INTEGER)
- `difficulty` (TEXT)
- `keywords` (JSONB)
- `learning_objectives` (JSONB)
- `deliverables` (JSONB)
- `prerequisites` (JSONB)
- `status` (TEXT)
- `content_type` (TEXT)

## 📋 Step 1: Backup Current Data (Recommended)

Before making schema changes, backup your existing lessons:

```sql
-- In Supabase SQL Editor, run this to see current lessons
SELECT id, title, created_at FROM lessons ORDER BY created_at;
```

## 🗄️ Step 2: Execute Schema Migration

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Navigate to your project
   - Click "SQL Editor" in the left sidebar

2. **Execute Migration Script**
   - Copy the entire contents of `LESSONS-SCHEMA-MIGRATION.sql`
   - Paste into SQL Editor
   - Click "Run" button

3. **Expected Output**
   ```
   Success. No rows returned
   ```

## ✅ Step 3: Validate Migration

Run the validation script to ensure all columns are properly added:

```bash
node validate-lessons-migration.js
```

**Expected Output:**
```
📋 LESSONS SCHEMA MIGRATION VALIDATION
=====================================
🔄 Checking if lessons table exists...
✅ Lessons table exists with X records
🔄 Validating required columns...
✅ All required columns are present and functional
🔄 Testing realistic lesson insertion...
✅ Realistic lesson insertion successful
🔄 Checking constraints and indexes...
✅ Constraints and indexes appear to be working

📊 VALIDATION REPORT
====================
✅ Lessons table exists
✅ All 19 required columns present

🎉 SCHEMA VALIDATION SUCCESSFUL!
✅ Ready for migrated lessons seeding
✅ All required columns present
✅ Data insertion works correctly
```

## 🌱 Step 4: Run Lessons Seeding

Once validation passes, run your seeding script:

```bash
node seed-migrated-lessons.js
```

This should now work without the "content_length column missing" error.

## 🔍 Step 5: Verify Data

Check that lessons were seeded correctly:

```sql
-- Check total lessons
SELECT COUNT(*) as total_lessons FROM lessons;

-- Check sample lesson with new columns
SELECT 
    title,
    description,
    level,
    module,
    lesson,
    difficulty,
    content_length,
    json_array_length(keywords) as keyword_count,
    json_array_length(learning_objectives) as objectives_count
FROM lessons 
LIMIT 3;
```

## 🚨 Troubleshooting

### If Schema Migration Fails:
1. Check you're using the service role key (not anon key)
2. Ensure you have write permissions to the database
3. Try executing the migration in smaller chunks

### If Validation Fails:
1. Clear Supabase schema cache: 
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```
2. Wait 30 seconds and try validation again
3. Check specific error messages for missing columns

### If Seeding Still Fails:
1. Re-run validation to confirm all columns exist
2. Check that your YAML files have the expected structure
3. Verify the courses-complete directory path is correct

## 📊 Migration Details

### New Columns Added:
| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `description` | TEXT | '' | Brief lesson description |
| `level` | INTEGER | 1 | Course level (1, 2, 3...) |
| `module` | INTEGER | 1 | Module within level |
| `lesson` | INTEGER | 1 | Lesson within module |
| `course_path` | TEXT | '' | Structured path identifier |
| `estimated_time` | INTEGER | 45 | Minutes to complete |
| `difficulty` | TEXT | 'intermediate' | beginner/intermediate/advanced |
| `keywords` | JSONB | '[]' | Searchable keywords array |
| `learning_objectives` | JSONB | '[]' | Learning goals array |
| `deliverables` | JSONB | '[]' | Expected outputs array |
| `prerequisites` | JSONB | '[]' | Required prior knowledge |
| `status` | TEXT | 'active' | Publication status |
| `content_type` | TEXT | 'lesson' | Type of content |
| `content_length` | INTEGER | 0 | Character count of content |

### Indexes Created:
- `idx_lessons_level` - For level-based queries
- `idx_lessons_module` - For module-based queries  
- `idx_lessons_lesson` - For lesson-based queries
- `idx_lessons_difficulty` - For difficulty filtering
- `idx_lessons_status` - For status filtering
- `idx_lessons_content_type` - For content type filtering
- `idx_lessons_course_path` - For path-based queries

### Constraints Added:
- Level, module, lesson must be > 0
- Difficulty must be in ('beginner', 'intermediate', 'advanced')
- Status must be in ('active', 'inactive', 'draft', 'archived')
- Content type must be in ('lesson', 'tutorial', 'exercise', 'project', 'assessment')

## 🎯 Next Steps After Success

1. ✅ All lessons should be properly seeded with rich metadata
2. 🔍 Test frontend lesson loading with new structure
3. 📊 Verify that search and filtering work with new columns
4. 🚀 Deploy updated schema to production if needed

The migration is designed to be safe and non-destructive - existing data will be preserved and new columns will have sensible defaults.