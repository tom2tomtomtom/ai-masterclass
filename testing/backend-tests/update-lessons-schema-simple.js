require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration using environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("CRITICAL: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable not set");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function updateLessonsSchemaSimple() {
  try {
    console.log('🚀 Starting simple lessons table schema update...\n');

    // Since direct SQL execution might be limited, we'll try a different approach
    // Let's first check if we can access the lessons table at all
    console.log('📊 Testing current lessons table access...');
    
    const { data: testData, error: testError } = await supabase
      .from('lessons')
      .select('id, title')
      .limit(1);
    
    if (testError) {
      console.log('❌ Cannot access lessons table:', testError.message);
      
      if (testError.message.includes('relation "lessons" does not exist')) {
        console.log('📝 Lessons table does not exist. Creating it...');
        // If you can run SQL directly in Supabase, use this SQL:
        console.log('\n📋 Please run this SQL in your Supabase SQL Editor:');
        console.log('');
        console.log(getCreateLessonsTableSQL());
        return false;
      }
      
      if (testError.message.includes('description')) {
        console.log('🔧 Description column missing. Adding it via SQL...');
        console.log('\n📋 Please run this SQL in your Supabase SQL Editor:');
        console.log('');
        console.log(getAddDescriptionColumnSQL());
        return false;
      }
    } else {
      console.log('✅ Lessons table is accessible');
    }

    // Try to insert a test record to see what columns are missing
    console.log('\n🧪 Testing schema by attempting to insert a sample lesson...');
    
    const testLesson = {
      title: 'Schema Test Lesson',
      description: 'This tests if the description column exists',
      content: 'Test content',
      order_index: 999
    };

    const { data: insertData, error: insertError } = await supabase
      .from('lessons')
      .insert([testLesson])
      .select();

    if (insertError) {
      console.log('❌ Insert failed:', insertError.message);
      
      if (insertError.message.includes('description')) {
        console.log('\n🔧 The "description" column is missing!');
        console.log('📋 Please run this SQL in your Supabase SQL Editor to add missing columns:');
        console.log('');
        console.log(getAllMissingColumnsSQL());
      } else if (insertError.message.includes('module_id')) {
        console.log('\n⚠️  Insert failed due to foreign key constraint (module_id required)');
        console.log('✅ This actually means the description column exists!');
        console.log('🔧 The error is because lessons require a valid module_id');
        
        // Try to find an existing module to use
        const { data: moduleData, error: moduleError } = await supabase
          .from('modules')
          .select('id')
          .limit(1);
          
        if (moduleError || !moduleData || moduleData.length === 0) {
          console.log('📝 No modules found. You may need to create modules first.');
          console.log('📋 Or run the complete schema setup with sample data:');
          console.log('');
          console.log('-- Run this in Supabase SQL Editor to create sample data:');
          console.log(getSampleDataSQL());
        } else {
          // Try insert with module_id
          const testLessonWithModule = {
            ...testLesson,
            module_id: moduleData[0].id
          };
          
          const { data: insertData2, error: insertError2 } = await supabase
            .from('lessons')
            .insert([testLessonWithModule])
            .select();
            
          if (insertError2) {
            console.log('❌ Insert with module_id failed:', insertError2.message);
          } else {
            console.log('✅ Test lesson inserted successfully!');
            console.log('🎉 Schema appears to be working correctly');
            
            // Clean up
            await supabase
              .from('lessons')
              .delete()
              .eq('id', insertData2[0].id);
            console.log('🧹 Test lesson cleaned up');
          }
        }
      } else {
        console.log('\n❓ Unexpected error. Please check your schema:');
        console.log(insertError.message);
      }
    } else {
      console.log('✅ Test lesson inserted successfully!');
      console.log('🎉 Schema appears to be working correctly');
      
      // Clean up
      if (insertData && insertData.length > 0) {
        await supabase
          .from('lessons')
          .delete()
          .eq('id', insertData[0].id);
        console.log('🧹 Test lesson cleaned up');
      }
    }

    // Final verification - try to select with description column
    console.log('\n🔍 Final verification - checking if description column is accessible...');
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('lessons')
      .select('id, title, description, order_index')
      .limit(1);

    if (verifyError) {
      if (verifyError.message.includes('description')) {
        console.log('❌ Description column is not accessible in the schema cache');
        console.log('📋 Please run this SQL to add the missing column:');
        console.log('');
        console.log(getAddDescriptionColumnSQL());
        return false;
      } else {
        console.log('⚠️  Other error:', verifyError.message);
      }
    } else {
      console.log('✅ Description column is accessible!');
      console.log('🎉 Schema update appears successful');
      
      if (verifyData && verifyData.length > 0) {
        console.log('📋 Sample lesson data:');
        console.log(JSON.stringify(verifyData[0], null, 2));
      }
    }

    return true;

  } catch (error) {
    console.error('💥 Schema update failed:', error);
    throw error;
  }
}

// Helper functions to generate SQL
function getCreateLessonsTableSQL() {
  return `-- Create lessons table with all necessary columns
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL DEFAULT '',
    order_index INTEGER NOT NULL DEFAULT 1,
    estimated_minutes INTEGER DEFAULT 30,
    lesson_type VARCHAR(50) NOT NULL DEFAULT 'tutorial',
    difficulty VARCHAR(50) DEFAULT 'beginner',
    learning_objectives JSONB DEFAULT '[]',
    prerequisites JSONB DEFAULT '[]',
    platform_focus VARCHAR(50) DEFAULT 'mixed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons (module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons (order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_type ON lessons (lesson_type);
CREATE INDEX IF NOT EXISTS idx_lessons_platform ON lessons (platform_focus);`;
}

function getAddDescriptionColumnSQL() {
  return `-- Add missing columns to lessons table
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS content TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS lesson_type VARCHAR(50) DEFAULT 'tutorial',
ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50) DEFAULT 'beginner',
ADD COLUMN IF NOT EXISTS learning_objectives JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS prerequisites JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS platform_focus VARCHAR(50) DEFAULT 'mixed';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons (order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_type ON lessons (lesson_type);
CREATE INDEX IF NOT EXISTS idx_lessons_platform ON lessons (platform_focus);`;
}

function getAllMissingColumnsSQL() {
  return `-- Add ALL potentially missing columns to lessons table
DO $$
BEGIN
    -- Add description column
    BEGIN
        ALTER TABLE lessons ADD COLUMN description TEXT;
    EXCEPTION
        WHEN duplicate_column THEN
        -- Column already exists, do nothing
    END;
    
    -- Add order_index column
    BEGIN
        ALTER TABLE lessons ADD COLUMN order_index INTEGER DEFAULT 0;
    EXCEPTION
        WHEN duplicate_column THEN
        -- Column already exists, do nothing
    END;
    
    -- Add content column
    BEGIN
        ALTER TABLE lessons ADD COLUMN content TEXT DEFAULT '';
    EXCEPTION
        WHEN duplicate_column THEN
        -- Column already exists, do nothing
    END;
    
    -- Add estimated_minutes column
    BEGIN
        ALTER TABLE lessons ADD COLUMN estimated_minutes INTEGER DEFAULT 30;
    EXCEPTION
        WHEN duplicate_column THEN
        -- Column already exists, do nothing
    END;
    
    -- Add lesson_type column
    BEGIN
        ALTER TABLE lessons ADD COLUMN lesson_type VARCHAR(50) DEFAULT 'tutorial';
    EXCEPTION
        WHEN duplicate_column THEN
        -- Column already exists, do nothing
    END;
    
    -- Add difficulty column
    BEGIN
        ALTER TABLE lessons ADD COLUMN difficulty VARCHAR(50) DEFAULT 'beginner';
    EXCEPTION
        WHEN duplicate_column THEN
        -- Column already exists, do nothing
    END;
    
    -- Add learning_objectives column
    BEGIN
        ALTER TABLE lessons ADD COLUMN learning_objectives JSONB DEFAULT '[]';
    EXCEPTION
        WHEN duplicate_column THEN
        -- Column already exists, do nothing
    END;
    
    -- Add prerequisites column
    BEGIN
        ALTER TABLE lessons ADD COLUMN prerequisites JSONB DEFAULT '[]';
    EXCEPTION
        WHEN duplicate_column THEN
        -- Column already exists, do nothing
    END;
    
    -- Add platform_focus column
    BEGIN
        ALTER TABLE lessons ADD COLUMN platform_focus VARCHAR(50) DEFAULT 'mixed';
    EXCEPTION
        WHEN duplicate_column THEN
        -- Column already exists, do nothing
    END;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons (order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_type ON lessons (lesson_type);
CREATE INDEX IF NOT EXISTS idx_lessons_platform ON lessons (platform_focus);

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';`;
}

function getSampleDataSQL() {
  return `-- Create sample course and module data for testing
INSERT INTO courses (title, description, level, order_index, estimated_hours, status) 
VALUES ('Test Course', 'A test course for schema validation', 1, 1, 2, 'published')
ON CONFLICT (title) DO NOTHING;

INSERT INTO modules (course_id, title, description, order_index, module_type, estimated_minutes) 
SELECT 
    c.id,
    'Test Module',
    'A test module for schema validation',
    1,
    'theory',
    60
FROM courses c WHERE c.title = 'Test Course'
ON CONFLICT DO NOTHING;`;
}

// Export for use in other scripts
module.exports = {
  updateLessonsSchemaSimple,
  getCreateLessonsTableSQL,
  getAddDescriptionColumnSQL,
  getAllMissingColumnsSQL,
  getSampleDataSQL
};

// Run if called directly
if (require.main === module) {
  updateLessonsSchemaSimple()
    .then((success) => {
      if (success) {
        console.log('\n✅ Schema validation completed successfully');
      } else {
        console.log('\n⚠️  Schema update required - please run the provided SQL');
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Schema update failed:', error);
      process.exit(1);
    });
}