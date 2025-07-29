#!/usr/bin/env node
/**
 * 🚀 LESSONS SCHEMA MIGRATION EXECUTOR
 * Executes the comprehensive schema migration SQL directly
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Simple logger for this script
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
  logger.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSchemaMigration() {
  try {
    logger.info('🚀 LESSONS SCHEMA MIGRATION');
    logger.info('============================');

    // Read the SQL migration file
    const sqlPath = path.join(__dirname, 'LESSONS-SCHEMA-MIGRATION.sql');
    
    if (!fs.existsSync(sqlPath)) {
      logger.error(`Migration file not found: ${sqlPath}`);
      process.exit(1);
    }

    const migrationSQL = fs.readFileSync(sqlPath, 'utf8');
    logger.info('📄 Migration SQL loaded');

    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    logger.info(`🔧 Executing ${statements.length} SQL statements...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.length < 5) {
        continue;
      }

      try {
        logger.progress(`Statement ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
        
        const { error } = await supabase.rpc('exec_sql', { 
          query: statement 
        });

        if (error) {
          logger.warning(`Statement ${i + 1} warning: ${error.message}`);
        } else {
          logger.success(`Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        logger.warning(`Statement ${i + 1} error: ${err.message}`);
      }
    }

    // Test the migration by trying to insert a sample lesson with all fields
    logger.info('🧪 Testing migration with sample lesson...');
    
    const testLesson = {
      title: 'Schema Migration Test',
      description: 'Test lesson to verify schema migration',
      content: 'This is test content for schema validation',
      level: 1,
      module: 1,
      lesson: 1,
      course_path: 'level-1/module-1/lesson-1',
      estimated_time: 30,
      difficulty: 'beginner',
      keywords: ['test', 'migration'],
      learning_objectives: ['Verify schema works'],
      deliverables: ['Working schema'],
      prerequisites: [],
      status: 'active',
      content_type: 'lesson',
      content_length: 44
    };

    const { data, error } = await supabase
      .from('lessons')
      .insert([testLesson])
      .select();

    if (error) {
      logger.error(`Test insertion failed: ${error.message}`);
      logger.info('❗ Schema migration may be incomplete');
      return false;
    } else {
      logger.success('Test lesson inserted successfully!');
      
      // Clean up test lesson
      if (data && data[0]) {
        await supabase
          .from('lessons')
          .delete()
          .eq('id', data[0].id);
        logger.success('Test lesson cleaned up');
      }
    }

    logger.info('🎉 SCHEMA MIGRATION COMPLETED!');
    logger.info('Next step: Run validation script');
    logger.info('Command: node validate-lessons-migration.js');
    
    return true;

  } catch (error) {
    logger.error('Migration execution failed:', error.message);
    return false;
  }
}

// Execute migration if run directly
if (require.main === module) {
  executeSchemaMigration()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      logger.error('Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { executeSchemaMigration };