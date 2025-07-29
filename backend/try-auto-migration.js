#!/usr/bin/env node
/**
 * 🤖 AUTOMATED SCHEMA MIGRATION ATTEMPT
 * Tries to execute schema migration automatically
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const logger = {
  info: (...args) => console.log('📋', ...args),
  success: (...args) => console.log('✅', ...args),
  warning: (...args) => console.log('⚠️', ...args),
  error: (...args) => console.log('❌', ...args),
  progress: (...args) => console.log('🔄', ...args)
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function attemptAutomaticMigration() {
  try {
    logger.info('🤖 ATTEMPTING AUTOMATED SCHEMA MIGRATION');
    logger.info('========================================');

    // Try to find existing SQL execution functions
    logger.progress('Checking for available SQL execution methods...');

    // Method 1: Try to call a direct SQL execution RPC
    const sqlStatement = `
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
    `;

    // Try various RPC function names that might exist
    const rpcMethods = [
      'exec_sql',
      'execute_sql', 
      'run_sql',
      'sql_exec',
      'query'
    ];

    let migrationAttempted = false;

    for (const method of rpcMethods) {
      try {
        logger.progress(`Trying RPC method: ${method}...`);
        
        const { data, error } = await supabase.rpc(method, { 
          sql: sqlStatement 
        });

        if (!error) {
          logger.success(`✅ Migration successful using ${method}!`);
          migrationAttempted = true;
          break;
        } else {
          logger.warning(`${method} failed: ${error.message}`);
        }
      } catch (err) {
        logger.warning(`${method} error: ${err.message}`);
      }
    }

    // Method 2: Try creating a temporary SQL function
    if (!migrationAttempted) {
      logger.progress('Attempting to create temporary SQL executor...');
      
      try {
        // Try to create a function that can execute SQL
        const createFunctionSQL = `
          CREATE OR REPLACE FUNCTION temp_execute_migration()
          RETURNS text AS $$
          BEGIN
            EXECUTE '${sqlStatement.replace(/'/g, "''")}';
            RETURN 'Migration completed successfully';
          END;
          $$ LANGUAGE plpgsql;
        `;

        const { error: createError } = await supabase.rpc('exec_sql', { 
          sql: createFunctionSQL 
        });

        if (!createError) {
          // Now try to call the function
          const { data, error: execError } = await supabase.rpc('temp_execute_migration');
          
          if (!execError) {
            logger.success('✅ Migration successful using temporary function!');
            migrationAttempted = true;
            
            // Clean up the temporary function
            await supabase.rpc('exec_sql', { 
              sql: 'DROP FUNCTION IF EXISTS temp_execute_migration();' 
            });
          }
        }
      } catch (err) {
        logger.warning(`Temporary function approach failed: ${err.message}`);
      }
    }

    // Method 3: Try using the database URL directly (if available)
    if (!migrationAttempted) {
      logger.progress('Direct database connection not available in this environment');
    }

    if (!migrationAttempted) {
      logger.warning('❌ Automated migration failed - manual execution required');
      logger.info('');
      logger.info('📋 MANUAL STEPS REQUIRED:');
      logger.info('========================');
      logger.info('1. Open: https://supabase.com/dashboard');
      logger.info('2. Go to your project → SQL Editor');
      logger.info('3. Execute the SQL from: INSTRUCTIONS-MANUAL-SCHEMA-MIGRATION.md');
      logger.info('4. Run: node validate-lessons-migration.js');
      logger.info('');
      return false;
    }

    // If we got here, test the migration
    logger.progress('Testing migration...');
    
    const testLesson = {
      title: 'Automated Migration Test',
      description: 'Test lesson after automated migration',
      content: 'Test content',
      level: 1,
      module: 1,
      lesson: 1,
      course_path: 'level-1/module-1/lesson-1',
      estimated_time: 30,
      difficulty: 'beginner',
      keywords: ['test'],
      learning_objectives: ['Test migration'],
      deliverables: ['Working schema'],
      prerequisites: [],
      status: 'active',
      content_type: 'lesson',
      content_length: 12,
      order_index: 1 // Add this required field
    };

    const { data: testData, error: testError } = await supabase
      .from('lessons')
      .insert([testLesson])
      .select();

    if (testError) {
      logger.error(`Migration test failed: ${testError.message}`);
      return false;
    } else {
      logger.success('✅ Migration test successful!');
      
      // Clean up test lesson
      if (testData && testData[0]) {
        await supabase.from('lessons').delete().eq('id', testData[0].id);
        logger.success('Test lesson cleaned up');
      }
      
      logger.info('🎉 AUTOMATED MIGRATION COMPLETED!');
      logger.info('Next step: Run node validate-lessons-migration.js');
      return true;
    }

  } catch (error) {
    logger.error('Automated migration failed:', error.message);
    return false;
  }
}

// Execute if run directly
if (require.main === module) {
  attemptAutomaticMigration()
    .then((success) => {
      if (success) {
        logger.info('✅ You can now run: node seed-migrated-lessons.js');
      } else {
        logger.info('❌ Please follow manual migration instructions');
      }
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      logger.error('Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { attemptAutomaticMigration };