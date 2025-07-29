#!/usr/bin/env node
/**
 * 🔧 FIX LESSON-COURSE LINKS
 * Update lessons to have proper course_id based on their module_id
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const logger = {
  info: (...args) => console.log('🔧', ...args),
  success: (...args) => console.log('✅', ...args),
  error: (...args) => console.log('❌', ...args),
  progress: (...args) => console.log('🔄', ...args)
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixLessonCourseLinks() {
  try {
    logger.info('🔧 FIXING LESSON-COURSE LINKS');
    logger.info('============================');

    // Get all lessons with module_id but no course_id
    logger.progress('Fetching lessons needing course_id...');
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, title, module_id')
      .not('module_id', 'is', null)
      .is('course_id', null);

    if (lessonsError) {
      logger.error('Failed to fetch lessons:', lessonsError.message);
      return false;
    }

    logger.success(`Found ${lessons.length} lessons to fix`);

    // Get all modules with their course_id
    logger.progress('Fetching modules...');
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('id, course_id, title');

    if (modulesError) {
      logger.error('Failed to fetch modules:', modulesError.message);
      return false;
    }

    logger.success(`Found ${modules.length} modules`);

    // Create module_id -> course_id mapping
    const moduleMap = new Map();
    modules.forEach(module => {
      moduleMap.set(module.id, module.course_id);
    });

    // Update lessons with correct course_id
    let fixedCount = 0;
    
    for (const lesson of lessons) {
      const courseId = moduleMap.get(lesson.module_id);
      
      if (courseId) {
        const { error: updateError } = await supabase
          .from('lessons')
          .update({ course_id: courseId })
          .eq('id', lesson.id);

        if (updateError) {
          logger.error(`Failed to update lesson "${lesson.title}":`, updateError.message);
        } else {
          fixedCount++;
          logger.progress(`✓ Fixed: "${lesson.title}"`);
        }
      } else {
        logger.error(`No course found for module_id: ${lesson.module_id}`);
      }
    }

    logger.info('\n📊 RESULTS');
    logger.info('==========');
    logger.success(`Successfully fixed: ${fixedCount}/${lessons.length} lessons`);

    // Verify the fix
    logger.progress('Verifying fix...');
    const { data: verifyLessons, error: verifyError } = await supabase
      .from('lessons')
      .select(`
        id, title, course_id, 
        courses:course_id (title)
      `)
      .not('course_id', 'is', null);

    if (verifyError) {
      logger.error('Verification failed:', verifyError.message);
    } else {
      logger.success(`Verification: ${verifyLessons.length} lessons now have course_id`);
      
      // Show distribution
      const courseDistribution = {};
      verifyLessons.forEach(lesson => {
        const courseTitle = lesson.courses?.title || 'Unknown';
        courseDistribution[courseTitle] = (courseDistribution[courseTitle] || 0) + 1;
      });

      logger.info('\n📚 Lessons per Course:');
      Object.entries(courseDistribution).forEach(([course, count]) => {
        logger.info(`   ${course}: ${count} lessons`);
      });
    }

    return fixedCount > 0;

  } catch (error) {
    logger.error('Fix failed:', error.message);
    return false;
  }
}

// Execute if run directly
if (require.main === module) {
  fixLessonCourseLinks()
    .then((success) => {
      if (success) {
        logger.info('\n🎉 Course links fixed! Lessons should now appear in courses.');
      } else {
        logger.error('\n❌ Fix failed. Check the logs above.');
      }
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      logger.error('Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { fixLessonCourseLinks };