// Find which course our rich content lessons belong to
require('dotenv').config({ path: __dirname + '/.env' });
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function findLessonCourse() {
  logger.info('🔍 Finding which course contains our rich content lessons...');
  
  try {
    // Get our specific lessons
    const { data: lessons } = await supabase
      .from('lessons')
      .select('*')
      .in('title', ['Debugging and Troubleshooting Prompts', 'Introduction to Google AI & Gemini']);
      
    logger.info(`Found ${lessons.length} lessons`);
    
    for (const lesson of lessons) {
      logger.info(`\n📚 Lesson: "${lesson.title}"`);
      logger.info(`- ID: ${lesson.id}`);
      logger.info(`- Course ID: ${lesson.course_id}`);
      
      // Get the course details
      const { data: course } = await supabase
        .from('courses')
        .select('*')
        .eq('id', lesson.course_id)
        .single();
        
      if (course) {
        logger.info(`- Course: "${course.title}"`);
        logger.info(`- Course Description: ${course.description}`);
      }
    }
    
    // Also show all courses and their lesson counts
    logger.info('\n📊 All courses and lesson counts:');
    const { data: allCourses } = await supabase
      .from('courses')
      .select('*');
      
    for (const course of allCourses) {
      const { data: courseLessons } = await supabase
        .from('lessons')
        .select('id, title')
        .eq('course_id', course.id);
        
      logger.info(`\n🎓 "${course.title}" (ID: ${course.id})`);
      logger.info(`   Lessons: ${courseLessons.length}`);
      
      if (courseLessons.length > 0) {
        courseLessons.forEach((lesson, index) => {
          logger.info(`   ${index + 1}. ${lesson.title}`);
        });
      }
    }
    
  } catch (error) {
    logger.error('❌ Error:', error);
  }
}

findLessonCourse();