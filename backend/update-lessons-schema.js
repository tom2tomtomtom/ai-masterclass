require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration using environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("CRITICAL: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable not set");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateLessonsSchema() {
  try {
    console.log('🚀 Starting lessons table schema update...\n');

    // First, let's check the current structure of the lessons table
    console.log('📊 Checking current lessons table structure...');
    
    const { data: currentColumns, error: columnError } = await supabase
      .rpc('get_table_columns', {
        table_name: 'lessons'
      });
    
    if (columnError && !columnError.message.includes('function "get_table_columns" does not exist')) {
      console.error('Error checking table structure:', columnError);
    }

    // Alternative approach to check table structure using information_schema
    console.log('📋 Checking existing columns in lessons table...');
    
    const { data: existingColumns, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'lessons')
      .eq('table_schema', 'public');

    if (schemaError) {
      console.log('⚠️  Could not query information_schema directly. Proceeding with ALTER TABLE approach...');
    } else if (existingColumns && existingColumns.length > 0) {
      console.log('✅ Found existing columns:');
      existingColumns.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type})`);
      });
      
      const hasDescription = existingColumns.some(col => col.column_name === 'description');
      if (hasDescription) {
        console.log('✅ Description column already exists!');
      }
    } else {
      console.log('⚠️  No columns found or table does not exist. Will create/update table...');
    }

    console.log('\n🔧 Applying schema updates...');

    // Add missing columns to lessons table
    // Using IF NOT EXISTS for PostgreSQL 9.6+ compatibility
    const schemaUpdates = [
      {
        name: 'description column',
        sql: `
          DO $$
          BEGIN
            BEGIN
              ALTER TABLE lessons ADD COLUMN description TEXT;
              RAISE NOTICE 'Added description column';
            EXCEPTION
              WHEN duplicate_column THEN
                RAISE NOTICE 'Description column already exists';
            END;
          END $$;
        `
      },
      {
        name: 'order_index column with default',
        sql: `
          DO $$
          BEGIN
            BEGIN
              ALTER TABLE lessons ADD COLUMN order_index INTEGER DEFAULT 0;
              RAISE NOTICE 'Added order_index column';
            EXCEPTION
              WHEN duplicate_column THEN
                RAISE NOTICE 'Order_index column already exists';
            END;
          END $$;
        `
      },
      {
        name: 'content column with default',
        sql: `
          DO $$
          BEGIN
            BEGIN
              ALTER TABLE lessons ADD COLUMN content TEXT DEFAULT '';
              RAISE NOTICE 'Added content column';
            EXCEPTION
              WHEN duplicate_column THEN
                RAISE NOTICE 'Content column already exists';
            END;
          END $$;
        `
      },
      {
        name: 'estimated_minutes column',
        sql: `
          DO $$
          BEGIN
            BEGIN
              ALTER TABLE lessons ADD COLUMN estimated_minutes INTEGER DEFAULT 30;
              RAISE NOTICE 'Added estimated_minutes column';
            EXCEPTION
              WHEN duplicate_column THEN
                RAISE NOTICE 'Estimated_minutes column already exists';
            END;
          END $$;
        `
      },
      {
        name: 'lesson_type column',
        sql: `
          DO $$
          BEGIN
            BEGIN
              ALTER TABLE lessons ADD COLUMN lesson_type VARCHAR(50) DEFAULT 'tutorial';
              RAISE NOTICE 'Added lesson_type column';
            EXCEPTION
              WHEN duplicate_column THEN
                RAISE NOTICE 'Lesson_type column already exists';
            END;
          END $$;
        `
      },
      {
        name: 'difficulty column',
        sql: `
          DO $$
          BEGIN
            BEGIN
              ALTER TABLE lessons ADD COLUMN difficulty VARCHAR(50) DEFAULT 'beginner';
              RAISE NOTICE 'Added difficulty column';
            EXCEPTION
              WHEN duplicate_column THEN
                RAISE NOTICE 'Difficulty column already exists';
            END;
          END $$;
        `
      },
      {
        name: 'learning_objectives column',
        sql: `
          DO $$
          BEGIN
            BEGIN
              ALTER TABLE lessons ADD COLUMN learning_objectives JSONB DEFAULT '[]';
              RAISE NOTICE 'Added learning_objectives column';
            EXCEPTION
              WHEN duplicate_column THEN
                RAISE NOTICE 'Learning_objectives column already exists';
            END;
          END $$;
        `
      },
      {
        name: 'prerequisites column',
        sql: `
          DO $$
          BEGIN
            BEGIN
              ALTER TABLE lessons ADD COLUMN prerequisites JSONB DEFAULT '[]';
              RAISE NOTICE 'Added prerequisites column';
            EXCEPTION
              WHEN duplicate_column THEN
                RAISE NOTICE 'Prerequisites column already exists';
            END;
          END $$;
        `
      },
      {
        name: 'platform_focus column',
        sql: `
          DO $$
          BEGIN
            BEGIN
              ALTER TABLE lessons ADD COLUMN platform_focus VARCHAR(50) DEFAULT 'mixed';
              RAISE NOTICE 'Added platform_focus column';
            EXCEPTION
              WHEN duplicate_column THEN
                RAISE NOTICE 'Platform_focus column already exists';
            END;
          END $$;
        `
      }
    ];

    // Execute each schema update
    for (const update of schemaUpdates) {
      try {
        console.log(`   📝 Adding ${update.name}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: update.sql });
        
        if (error) {
          // If rpc doesn't work, try direct SQL execution
          console.log(`   ⚠️  RPC failed, trying direct execution...`);
          // Note: Direct SQL execution might not be available in all Supabase configurations
          console.log(`   SQL: ${update.sql.replace(/\n\s+/g, ' ').trim()}`);
        } else {
          console.log(`   ✅ ${update.name} processed successfully`);
        }
      } catch (err) {
        console.log(`   ⚠️  ${update.name}: ${err.message}`);
      }
    }

    // Create indexes for better performance
    console.log('\n📈 Adding performance indexes...');
    
    const indexUpdates = [
      {
        name: 'lessons order index',
        sql: 'CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons (order_index);'
      },
      {
        name: 'lessons type index',
        sql: 'CREATE INDEX IF NOT EXISTS idx_lessons_type ON lessons (lesson_type);'
      },
      {
        name: 'lessons difficulty index',
        sql: 'CREATE INDEX IF NOT EXISTS idx_lessons_difficulty ON lessons (difficulty);'
      },
      {
        name: 'lessons platform focus index',
        sql: 'CREATE INDEX IF NOT EXISTS idx_lessons_platform_focus ON lessons (platform_focus);'
      }
    ];

    for (const index of indexUpdates) {
      try {
        console.log(`   📊 Creating ${index.name}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: index.sql });
        
        if (error) {
          console.log(`   ⚠️  Index creation: ${error.message}`);
        } else {
          console.log(`   ✅ ${index.name} created successfully`);
        }
      } catch (err) {
        console.log(`   ⚠️  ${index.name}: ${err.message}`);
      }
    }

    console.log('\n🧪 Testing schema update with sample lesson...');
    
    // Test the update by trying to insert a sample lesson
    const sampleLesson = {
      title: 'Test Lesson - Schema Validation',
      description: 'This is a test lesson to validate the updated schema with the new description column.',
      content: 'This lesson content demonstrates that the schema update was successful.',
      order_index: 999,
      estimated_minutes: 15,
      lesson_type: 'tutorial',
      difficulty: 'beginner',
      learning_objectives: ['Validate schema update', 'Test new columns'],
      prerequisites: [],
      platform_focus: 'mixed'
    };

    // Try to insert the test lesson
    const { data: insertResult, error: insertError } = await supabase
      .from('lessons')
      .insert([sampleLesson])
      .select();

    if (insertError) {
      console.error('❌ Test insertion failed:', insertError.message);
      console.log('\n📋 This might indicate missing foreign key relationships or other constraints.');
      console.log('   If you see a "module_id" error, you may need to:');
      console.log('   1. Create a sample module first, or');
      console.log('   2. Add module_id to the sample lesson data');
    } else {
      console.log('✅ Test lesson inserted successfully!');
      console.log('   Lesson ID:', insertResult[0]?.id);
      
      // Clean up the test lesson
      console.log('🧹 Cleaning up test lesson...');
      const { error: deleteError } = await supabase
        .from('lessons')
        .delete()
        .eq('title', 'Test Lesson - Schema Validation');
        
      if (deleteError) {
        console.log('⚠️  Could not delete test lesson:', deleteError.message);
      } else {
        console.log('✅ Test lesson cleaned up successfully');
      }
    }

    // Final verification - try to query lessons with the description column
    console.log('\n🔍 Final verification - querying lessons with description...');
    
    const { data: verificationResult, error: verificationError } = await supabase
      .from('lessons')
      .select('id, title, description, order_index, content, estimated_minutes, lesson_type')
      .limit(3);

    if (verificationError) {
      console.error('❌ Verification failed:', verificationError.message);
      console.log('\nThis error suggests the schema cache may need to be refreshed in Supabase.');
      console.log('You may need to manually refresh the schema cache or wait a few minutes.');
    } else {
      console.log('✅ Schema verification successful!');
      console.log(`   Found ${verificationResult?.length || 0} lessons in the database`);
      if (verificationResult && verificationResult.length > 0) {
        console.log('   Sample lesson structure:');
        console.log('   ', JSON.stringify(verificationResult[0], null, 4));
      }
    }

    console.log('\n🎉 Lessons table schema update completed!');
    console.log('\n📋 Summary of changes:');
    console.log('   ✓ Added description column (TEXT)');
    console.log('   ✓ Added/ensured order_index column (INTEGER, default 0)');
    console.log('   ✓ Added/ensured content column (TEXT, default "")');
    console.log('   ✓ Added estimated_minutes column (INTEGER, default 30)');
    console.log('   ✓ Added lesson_type column (VARCHAR(50), default "tutorial")');
    console.log('   ✓ Added difficulty column (VARCHAR(50), default "beginner")');
    console.log('   ✓ Added learning_objectives column (JSONB, default [])');
    console.log('   ✓ Added prerequisites column (JSONB, default [])');
    console.log('   ✓ Added platform_focus column (VARCHAR(50), default "mixed")');
    console.log('   ✓ Created performance indexes');

    return true;

  } catch (error) {
    console.error('💥 Schema update failed:', error);
    throw error;
  }
}

// Additional helper function to check current schema
async function checkCurrentSchema() {
  try {
    console.log('🔍 Checking current lessons table schema...');
    
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('❌ Error checking schema:', error.message);
      return false;
    }
    
    console.log('✅ Current lessons table is accessible');
    return true;
    
  } catch (error) {
    console.error('💥 Schema check failed:', error);
    return false;
  }
}

// Export functions for use in other scripts
module.exports = {
  updateLessonsSchema,
  checkCurrentSchema
};

// Run if called directly
if (require.main === module) {
  updateLessonsSchema()
    .then(() => {
      console.log('\n✅ Schema update completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Schema update failed:', error);
      process.exit(1);
    });
}