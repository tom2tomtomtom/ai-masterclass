#!/usr/bin/env node
/**
 * 🔧 ADD MISSING COLUMNS TO LESSONS TABLE
 * Uses individual column additions via Supabase client
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Simple logger
const logger = {
  info: (...args) => console.log('📋', ...args),
  success: (...args) => console.log('✅', ...args),
  warning: (...args) => console.log('⚠️', ...args),
  error: (...args) => console.log('❌', ...args),
  progress: (...args) => console.log('🔄', ...args)
};

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  logger.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addMissingColumns() {
  try {
    logger.info('🔧 ADDING MISSING COLUMNS TO LESSONS TABLE');
    logger.info('==========================================');

    // The columns we need to add based on the migration requirements
    const columnsToAdd = [
      { name: 'description', type: 'TEXT', default: "''" },
      { name: 'level', type: 'INTEGER', default: '1' },
      { name: 'module', type: 'INTEGER', default: '1' },
      { name: 'lesson', type: 'INTEGER', default: '1' },
      { name: 'course_path', type: 'TEXT', default: "''" },
      { name: 'estimated_time', type: 'INTEGER', default: '45' },
      { name: 'difficulty', type: 'TEXT', default: "'intermediate'" },
      { name: 'keywords', type: 'JSONB', default: "'[]'::jsonb" },
      { name: 'learning_objectives', type: 'JSONB', default: "'[]'::jsonb" },
      { name: 'deliverables', type: 'JSONB', default: "'[]'::jsonb" },
      { name: 'prerequisites', type: 'JSONB', default: "'[]'::jsonb" },
      { name: 'status', type: 'TEXT', default: "'active'" },
      { name: 'content_type', type: 'TEXT', default: "'lesson'" },
      { name: 'content_length', type: 'INTEGER', default: '0' }
    ];

    logger.info(`📝 Will attempt to add ${columnsToAdd.length} columns...`);

    // First, let's check what columns currently exist
    logger.progress('Checking current table structure...');
    
    try {
      const { data: currentLesson, error: queryError } = await supabase
        .from('lessons')
        .select('*')
        .limit(1);

      if (queryError) {
        logger.warning(`Could not query lessons table: ${queryError.message}`);
      } else {
        const existingColumns = currentLesson && currentLesson.length > 0 
          ? Object.keys(currentLesson[0])
          : [];
        logger.info(`Current columns: ${existingColumns.join(', ')}`);
      }
    } catch (err) {
      logger.warning(`Column check failed: ${err.message}`);
    }

    // Try a different approach - use raw SQL through a stored procedure
    logger.progress('Attempting to create necessary columns...');

    // Create the ADD COLUMN SQL in a single statement
    const addColumnSQL = `
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

    logger.info('📝 Executing bulk column addition...');
    logger.info('SQL:', addColumnSQL.replace(/\s+/g, ' ').trim());

    // Since direct SQL execution isn't available, let's try to use the database directly
    // We'll output instructions for manual execution

    logger.info('');
    logger.info('🔍 MANUAL EXECUTION REQUIRED');
    logger.info('============================');
    logger.info('Since direct SQL execution is not available, please:');
    logger.info('');
    logger.info('1. Go to: https://supabase.com/dashboard');
    logger.info('2. Navigate to your project');
    logger.info('3. Click "SQL Editor" in the sidebar');
    logger.info('4. Copy and paste the following SQL statement:');
    logger.info('');
    logger.info('-- LESSONS TABLE MIGRATION');
    logger.info(addColumnSQL);
    logger.info('');
    logger.info('5. Click "Run" to execute');
    logger.info('6. After successful execution, run: node validate-lessons-migration.js');
    logger.info('');

    // Also create a simpler test to see if we can detect the columns after manual addition
    logger.info('⏳ Testing current column availability...');
    
    const testData = {
      title: 'Column Test',
      content: 'Testing if basic insertion works'
    };

    try {
      const { data, error } = await supabase
        .from('lessons')
        .insert([testData])
        .select();

      if (error) {
        logger.warning(`Basic insertion test: ${error.message}`);
      } else {
        logger.success('Basic insertion works - table is accessible');
        
        // Clean up
        if (data && data[0]) {
          await supabase.from('lessons').delete().eq('id', data[0].id);
        }
      }
    } catch (err) {
      logger.warning(`Basic test failed: ${err.message}`);
    }

    return false; // Requires manual execution

  } catch (error) {
    logger.error('Column addition failed:', error.message);
    return false;
  }
}

// Execute if run directly
if (require.main === module) {
  addMissingColumns()
    .then((success) => {
      if (!success) {
        logger.info('');
        logger.info('📋 NEXT STEPS:');
        logger.info('1. Execute the SQL in Supabase dashboard');
        logger.info('2. Run: node validate-lessons-migration.js');
        logger.info('3. Run: node seed-migrated-lessons.js');
      }
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      logger.error('Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { addMissingColumns };