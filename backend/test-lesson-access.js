#!/usr/bin/env node
/**
 * 🧪 TEST LESSON ACCESS
 * Simple test to verify lessons are accessible
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const logger = {
  info: (...args) => console.log('🧪', ...args),
  success: (...args) => console.log('✅', ...args),
  error: (...args) => console.log('❌', ...args)
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testLessonAccess() {
  try {
    logger.info('Testing lesson access...');

    // Count total lessons
    const { count, error: countError } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      logger.error('Count failed:', countError.message);
      return;
    }

    logger.success(`Found ${count} lessons in database`);

    // Get sample lessons
    const { data, error } = await supabase
      .from('lessons')
      .select('title, description, level, module, lesson, course_path, difficulty, estimated_time')
      .limit(5);

    if (error) {
      logger.error('Query failed:', error.message);
      return;
    }

    logger.success('Sample lessons:');
    data.forEach((lesson, index) => {
      logger.info(`${index + 1}. ${lesson.title}`);
      logger.info(`   Level ${lesson.level}, Module ${lesson.module}, Lesson ${lesson.lesson}`);
      logger.info(`   Difficulty: ${lesson.difficulty}, Time: ${lesson.estimated_time}min`);
      logger.info(`   Path: ${lesson.course_path}`);
      logger.info('');
    });

    logger.success('✅ Lesson access test successful!');
    return true;

  } catch (error) {
    logger.error('Test failed:', error.message);
    return false;
  }
}

testLessonAccess();