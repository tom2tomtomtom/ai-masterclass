#!/usr/bin/env node
/**
 * 🔍 GET COURSES WITH LESSONS
 * Test which courses actually have lessons
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const logger = {
  info: (...args) => console.log('🔍', ...args),
  success: (...args) => console.log('✅', ...args),
  error: (...args) => console.log('❌', ...args)
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getCoursesWithLessons() {
  try {
    logger.info('FINDING COURSES WITH LESSONS');
    logger.info('============================');

    // Get all lessons with their module info
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select(`
        id, title, module_id,
        modules:module_id (
          id, title, course_id,
          courses:course_id (id, title, level)
        )
      `)
      .not('module_id', 'is', null);

    if (lessonsError) {
      logger.error('Failed to fetch lessons:', lessonsError.message);
      return false;
    }

    logger.success(`Found ${lessons.length} lessons with module info`);

    // Group lessons by course
    const courseMap = new Map();
    
    lessons.forEach(lesson => {
      if (lesson.modules && lesson.modules.courses) {
        const course = lesson.modules.courses;
        if (!courseMap.has(course.id)) {
          courseMap.set(course.id, {
            id: course.id,
            title: course.title,
            level: course.level,
            lessons: []
          });
        }
        courseMap.get(course.id).lessons.push(lesson.title);
      }
    });

    logger.info('\n📚 COURSES WITH LESSONS:');
    logger.info('========================');
    
    const coursesWithLessons = Array.from(courseMap.values());
    coursesWithLessons.sort((a, b) => a.level - b.level);
    
    coursesWithLessons.forEach(course => {
      logger.info(`\n🎓 ${course.title} (Level ${course.level})`);
      logger.info(`   📊 ${course.lessons.length} lessons`);
      course.lessons.slice(0, 3).forEach(lessonTitle => {
        logger.info(`   📝 ${lessonTitle}`);
      });
      if (course.lessons.length > 3) {
        logger.info(`   📝 ... and ${course.lessons.length - 3} more lessons`);
      }
    });

    logger.info(`\n✅ Total: ${coursesWithLessons.length} courses have lessons`);
    
    return coursesWithLessons;

  } catch (error) {
    logger.error('Query failed:', error.message);
    return false;
  }
}

// Execute if run directly
if (require.main === module) {
  getCoursesWithLessons();
}

module.exports = { getCoursesWithLessons };