#!/usr/bin/env node
/**
 * 🔗 LINK LESSONS TO COURSES
 * Associates migrated lessons with appropriate courses and modules
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const logger = {
  info: (...args) => console.log('🔗', ...args),
  success: (...args) => console.log('✅', ...args),
  warning: (...args) => console.log('⚠️', ...args),
  error: (...args) => console.log('❌', ...args),
  progress: (...args) => console.log('🔄', ...args)
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function linkLessonsToCoursesAndModules() {
  try {
    logger.info('🔗 LINKING LESSONS TO COURSES AND MODULES');
    logger.info('==========================================');

    // Step 1: Get all courses and modules
    logger.progress('Fetching courses...');
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .order('level', { ascending: true });

    if (coursesError) {
      logger.error('Failed to fetch courses:', coursesError.message);
      return false;
    }

    logger.success(`Found ${courses.length} courses`);

    // Step 2: Get all modules
    logger.progress('Fetching modules...');
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('*')
      .order('course_id, order_index');

    if (modulesError) {
      logger.error('Failed to fetch modules:', modulesError.message);
      return false;
    }

    logger.success(`Found ${modules.length} modules`);

    // Step 3: Get all lessons that need linking
    logger.progress('Fetching lessons...');
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .is('course_id', null);

    if (lessonsError) {
      logger.error('Failed to fetch lessons:', lessonsError.message);
      return false;
    }

    logger.success(`Found ${lessons.length} lessons to link`);

    // Step 4: Create mapping strategy
    const courseMap = new Map();
    const moduleMap = new Map();

    // Group courses and modules by level for easier matching
    courses.forEach(course => {
      if (!courseMap.has(course.level)) {
        courseMap.set(course.level, []);
      }
      courseMap.get(course.level).push(course);
    });

    modules.forEach(module => {
      const key = `${module.course_id}`;
      if (!moduleMap.has(key)) {
        moduleMap.set(key, []);
      }
      moduleMap.get(key).push(module);
    });

    // Step 5: Link lessons intelligently
    let linkedCount = 0;
    
    for (const lesson of lessons) {
      try {
        let selectedCourse = null;
        let selectedModule = null;

        // Strategy 1: Use lesson's level property if it exists
        if (lesson.level) {
          const levelCourses = courseMap.get(lesson.level);
          if (levelCourses && levelCourses.length > 0) {
            selectedCourse = levelCourses[0]; // Take first course for that level
          }
        }

        // Strategy 2: Match by title keywords if no level
        if (!selectedCourse) {
          // Look for keywords in lesson title to match with courses
          const title = lesson.title.toLowerCase();
          
          for (const course of courses) {
            const courseTitle = course.title.toLowerCase();
            
            if (title.includes('chatgpt') && courseTitle.includes('chatgpt')) {
              selectedCourse = course;
              break;
            }
            if (title.includes('claude') && courseTitle.includes('claude')) {
              selectedCourse = course;
              break;
            }
            if (title.includes('gemini') && courseTitle.includes('gemini')) {
              selectedCourse = course;
              break;
            }
            if (title.includes('visual') && courseTitle.includes('visual')) {
              selectedCourse = course;
              break;
            }
            if (title.includes('enterprise') && courseTitle.includes('enterprise')) {
              selectedCourse = course;
              break;
            }
          }
        }

        // Strategy 3: Default to Level 2 Platform Mastery if no match
        if (!selectedCourse) {
          selectedCourse = courses.find(c => 
            c.title.toLowerCase().includes('platform mastery') && c.level === 2
          ) || courses.find(c => c.level === 2) || courses[0];
        }

        // Find appropriate module for the selected course
        if (selectedCourse) {
          const courseModules = moduleMap.get(selectedCourse.id);
          if (courseModules && courseModules.length > 0) {
            // Try to match module by lesson content
            selectedModule = courseModules.find(m => {
              const moduleTitle = m.title.toLowerCase();
              const lessonTitle = lesson.title.toLowerCase();
              
              if (lessonTitle.includes('chatgpt') && moduleTitle.includes('chatgpt')) return true;
              if (lessonTitle.includes('claude') && moduleTitle.includes('claude')) return true;
              if (lessonTitle.includes('gemini') && moduleTitle.includes('gemini')) return true;
              return false;
            }) || courseModules[0]; // Default to first module
          }
        }

        // Update the lesson with course and module associations
        if (selectedCourse) {
          const updateData = {
            course_id: selectedCourse.id,
            module_id: selectedModule?.id || null
          };

          const { error: updateError } = await supabase
            .from('lessons')
            .update(updateData)
            .eq('id', lesson.id);

          if (updateError) {
            logger.warning(`Failed to link lesson "${lesson.title}":`, updateError.message);
          } else {
            linkedCount++;
            logger.progress(`✓ Linked: "${lesson.title}" → Course: ${selectedCourse.title}${selectedModule ? `, Module: ${selectedModule.title}` : ''}`);
          }
        }

      } catch (error) {
        logger.warning(`Error processing lesson "${lesson.title}":`, error.message);
      }
    }

    // Step 6: Verify the linking
    logger.info('\n📊 LINKING RESULTS');
    logger.info('==================');
    logger.success(`Successfully linked: ${linkedCount}/${lessons.length} lessons`);

    // Show distribution by course
    const { data: updatedLessons } = await supabase
      .from('lessons')
      .select(`
        id, title, course_id,
        courses:course_id (title, level)
      `)
      .not('course_id', 'is', null);

    if (updatedLessons) {
      const courseDistribution = {};
      updatedLessons.forEach(lesson => {
        const courseTitle = lesson.courses?.title || 'Unknown';
        if (!courseDistribution[courseTitle]) {
          courseDistribution[courseTitle] = 0;
        }
        courseDistribution[courseTitle]++;
      });

      logger.info('\n📚 Lessons per Course:');
      Object.entries(courseDistribution).forEach(([course, count]) => {
        logger.info(`   ${course}: ${count} lessons`);
      });
    }

    logger.info('\n🎉 Lesson linking completed!');
    logger.info('📱 Frontend should now display lessons within courses');
    
    return linkedCount > 0;

  } catch (error) {
    logger.error('Lesson linking failed:', error.message);
    return false;
  }
}

// Execute if run directly
if (require.main === module) {
  linkLessonsToCoursesAndModules()
    .then((success) => {
      if (success) {
        logger.info('\n✅ Next step: Refresh your browser to see lessons in the UI!');
      } else {
        logger.error('\n❌ Lesson linking failed. Check the logs above.');
      }
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      logger.error('Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { linkLessonsToCoursesAndModules };