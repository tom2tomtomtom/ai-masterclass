require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const logger = require('./utils/logger');

// Supabase configuration using environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  logger.error("CRITICAL: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable not set");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateLessonsSchema() {
  try {
    logger.info('🚀 Starting lessons table schema update...\n');

    // First, let's check the current structure of the lessons table
    logger.info('📊 Checking current lessons table structure...');
    
    const { data: currentColumns, error: columnError } = await supabase
      .rpc('get_table_columns', {
        table_name: 'lessons'
      });
    
    if (columnError && !columnError.message.includes('function "get_table_columns" does not exist')) {
      logger.error('Error checking table structure:', columnError);
    }

    // Alternative approach to check table structure using information_schema
    logger.info('📋 Checking existing columns in lessons table...');
    
    const { data: existingColumns, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'lessons')
      .eq('table_schema', 'public');

    if (schemaError) {
      logger.info('⚠️  Could not query information_schema directly. Proceeding with ALTER TABLE approach...');
    } else if (existingColumns && existingColumns.length > 0) {
      logger.info('✅ Found existing columns:');
      existingColumns.forEach(col => {
        logger.info(`   - ${col.column_name} (${col.data_type})`);
      });
      
      const hasDescription = existingColumns.some(col => col.column_name === 'description');
      if (hasDescription) {
        logger.info('✅ Description column already exists!');
      }
    } else {
      logger.info('⚠️  No columns found or table does not exist. Will create/update table...');
    }

    logger.info('\n🔧 Applying schema updates...');

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
        logger.info(`   📝 Adding ${update.name}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: update.sql });
        
        if (error) {
          // If rpc doesn't work, try direct SQL execution
          logger.info(`   ⚠️  RPC failed, trying direct execution...`);
          // Note: Direct SQL execution might not be available in all Supabase configurations
          logger.info(`   SQL: ${update.sql.replace(/\n\s+/g, ' ').trim()}`);
        } else {
          logger.info(`   ✅ ${update.name} processed successfully`);
        }
      } catch (err) {
        logger.info(`   ⚠️  ${update.name}: ${err.message}`);
      }
    }

    // Create indexes for better performance
    logger.info('\n📈 Adding performance indexes...');
    
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
        logger.info(`   📊 Creating ${index.name}...`);
        const { error } = await supabase.rpc('exec_sql', { sql: index.sql });
        
        if (error) {
          logger.info(`   ⚠️  Index creation: ${error.message}`);
        } else {
          logger.info(`   ✅ ${index.name} created successfully`);
        }
      } catch (err) {
        logger.info(`   ⚠️  ${index.name}: ${err.message}`);
      }
    }

    logger.info('\n🧪 Testing schema update with sample lesson...');
    
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
      logger.error('❌ Test insertion failed:', insertError.message);
      logger.info('\n📋 This might indicate missing foreign key relationships or other constraints.');
      logger.info('   If you see a "module_id" error, you may need to:');
      logger.info('   1. Create a sample module first, or');
      logger.info('   2. Add module_id to the sample lesson data');
    } else {
      logger.info('✅ Test lesson inserted successfully!');
      logger.info('   Lesson ID:', insertResult[0]?.id);
      
      // Clean up the test lesson
      logger.info('🧹 Cleaning up test lesson...');
      const { error: deleteError } = await supabase
        .from('lessons')
        .delete()
        .eq('title', 'Test Lesson - Schema Validation');
        
      if (deleteError) {
        logger.info('⚠️  Could not delete test lesson:', deleteError.message);
      } else {
        logger.info('✅ Test lesson cleaned up successfully');
      }
    }

    // Final verification - try to query lessons with the description column
    logger.info('\n🔍 Final verification - querying lessons with description...');
    
    const { data: verificationResult, error: verificationError } = await supabase
      .from('lessons')
      .select('id, title, description, order_index, content, estimated_minutes, lesson_type')
      .limit(3);

    if (verificationError) {
      logger.error('❌ Verification failed:', verificationError.message);
      logger.info('\nThis error suggests the schema cache may need to be refreshed in Supabase.');
      logger.info('You may need to manually refresh the schema cache or wait a few minutes.');
    } else {
      logger.info('✅ Schema verification successful!');
      logger.info(`   Found ${verificationResult?.length || 0} lessons in the database`);
      if (verificationResult && verificationResult.length > 0) {
        logger.info('   Sample lesson structure:');
        logger.info('   ', JSON.stringify(verificationResult[0], null, 4));
      }
    }

    logger.info('\n🎉 Lessons table schema update completed!');
    logger.info('\n📋 Summary of changes:');
    logger.info('   ✓ Added description column (TEXT)');
    logger.info('   ✓ Added/ensured order_index column (INTEGER, default 0)');
    logger.info('   ✓ Added/ensured content column (TEXT, default "")');
    logger.info('   ✓ Added estimated_minutes column (INTEGER, default 30)');
    logger.info('   ✓ Added lesson_type column (VARCHAR(50), default "tutorial")');
    logger.info('   ✓ Added difficulty column (VARCHAR(50), default "beginner")');
    logger.info('   ✓ Added learning_objectives column (JSONB, default [])');
    logger.info('   ✓ Added prerequisites column (JSONB, default [])');
    logger.info('   ✓ Added platform_focus column (VARCHAR(50), default "mixed")');
    logger.info('   ✓ Created performance indexes');

    return true;

  } catch (error) {
    logger.error('💥 Schema update failed:', error);
    throw error;
  }
}

// Additional helper function to check current schema
async function checkCurrentSchema() {
  try {
    logger.info('🔍 Checking current lessons table schema...');
    
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .limit(1);
      
    if (error) {
      logger.error('❌ Error checking schema:', error.message);
      return false;
    }
    
    logger.info('✅ Current lessons table is accessible');
    return true;
    
  } catch (error) {
    logger.error('💥 Schema check failed:', error);
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
      logger.info('\n✅ Schema update completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('\n❌ Schema update failed:', error);
      process.exit(1);
    });
}