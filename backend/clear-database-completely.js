#!/usr/bin/env node

/**
 * Complete Database Clear Script
 * Removes ALL existing content to prepare for complete rebuild
 */

const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function clearDatabaseCompletely() {
  logger.info('🧹 COMPLETE DATABASE CLEAR - PREPARING FOR REBUILD');
  logger.info('==================================================');
  logger.info('⚠️  This will remove ALL existing content from the database');
  logger.info('📊 Current content will be permanently deleted\n');

  try {
    // Step 1: Check current content
    logger.info('1️⃣ Checking current database content...');
    
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title');
    
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('id, title');
    
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, title');

    if (coursesError || modulesError || lessonsError) {
      logger.error('❌ Error checking database:', coursesError || modulesError || lessonsError);
      return false;
    }

    logger.info(`📚 Current courses: ${courses?.length || 0}`);
    logger.info(`🎯 Current modules: ${modules?.length || 0}`);
    logger.info(`📝 Current lessons: ${lessons?.length || 0}`);

    if ((courses?.length || 0) === 0 && (modules?.length || 0) === 0 && (lessons?.length || 0) === 0) {
      logger.info('✅ Database is already empty - no clearing needed');
      return true;
    }

    // Step 2: Clear in dependency order (lessons -> modules -> courses)
    logger.info('\n2️⃣ Clearing database content...');
    
    // Clear lessons first (they depend on modules)
    logger.info('🗑️ Clearing lessons...');
    const { error: lessonsDeleteError } = await supabase
      .from('lessons')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (lessonsDeleteError) {
      logger.error('❌ Error clearing lessons:', lessonsDeleteError);
      return false;
    }
    logger.info('✅ Lessons cleared');

    // Clear modules (they depend on courses)
    logger.info('🗑️ Clearing modules...');
    const { error: modulesDeleteError } = await supabase
      .from('modules')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (modulesDeleteError) {
      logger.error('❌ Error clearing modules:', modulesDeleteError);
      return false;
    }
    logger.info('✅ Modules cleared');

    // Clear courses
    logger.info('🗑️ Clearing courses...');
    const { error: coursesDeleteError } = await supabase
      .from('courses')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (coursesDeleteError) {
      logger.error('❌ Error clearing courses:', coursesDeleteError);
      return false;
    }
    logger.info('✅ Courses cleared');

    // Step 3: Verify clearing
    logger.info('\n3️⃣ Verifying database is empty...');
    
    const { count: courseCount } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true });
    
    const { count: moduleCount } = await supabase
      .from('modules')
      .select('*', { count: 'exact', head: true });
    
    const { count: lessonCount } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true });

    logger.info(`📚 Remaining courses: ${courseCount || 0}`);
    logger.info(`🎯 Remaining modules: ${moduleCount || 0}`);
    logger.info(`📝 Remaining lessons: ${lessonCount || 0}`);

    if ((courseCount || 0) === 0 && (moduleCount || 0) === 0 && (lessonCount || 0) === 0) {
      logger.info('\n🎉 DATABASE COMPLETELY CLEARED!');
      logger.info('✅ Ready for complete content rebuild');
      logger.info('📊 All tables are now empty and ready for seeding');
      return true;
    } else {
      logger.info('\n⚠️ Some content may still remain');
      return false;
    }

  } catch (error) {
    logger.error('❌ Database clearing failed:', error);
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  clearDatabaseCompletely()
    .then(success => {
      if (success) {
        logger.info('\n🚀 READY FOR COMPLETE SYSTEM REBUILD!');
        logger.info('Next step: Create master seeding script for all 3,162 files');
        process.exit(0);
      } else {
        logger.info('\n❌ Database clearing failed');
        process.exit(1);
      }
    })
    .catch(error => {
      logger.error('💥 Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { clearDatabaseCompletely };
