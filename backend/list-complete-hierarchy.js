require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

// Supabase configuration
const supabaseUrl = 'process.env.SUPABASE_URL';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseServiceKey) {
      throw new Error('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY');
    };

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listCompleteHierarchy() {
  try {
    logger.info('📚 AI MASTERCLASS PLATFORM - COMPLETE HIERARCHY');
    logger.info('===============================================');
    
    // Get all courses with their modules and lessons
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        description,
        level,
        order_index,
        estimated_hours,
        status,
        modules (
          id,
          title,
          description,
          order_index,
          module_type,
          estimated_minutes,
          difficulty,
          lessons (
            id,
            title,
            order_index,
            lesson_type,
            estimated_minutes,
            status
          )
        )
      `)
      .order('order_index');
    
    if (coursesError) {
      logger.error('❌ Error fetching hierarchy:', coursesError);
      return { success: false, error: coursesError.message };
    }
    
    if (!courses || courses.length === 0) {
      logger.info('⚠️ No courses found in database');
      return { success: false, error: 'No courses found' };
    }
    
    logger.info(`\n🎯 PLATFORM OVERVIEW`);
    logger.info(`📚 Total Courses: ${courses.length}`);
    
    const totalModules = courses.reduce((sum, course) => sum + (course.modules?.length || 0), 0);
    const totalLessons = courses.reduce((sum, course) => 
      sum + course.modules?.reduce((moduleSum, module) => 
        moduleSum + (module.lessons?.length || 0), 0) || 0, 0);
    
    logger.info(`📖 Total Modules: ${totalModules}`);
    logger.info(`📝 Total Lessons: ${totalLessons}`);
    
    const totalEstimatedHours = courses.reduce((sum, course) => sum + (course.estimated_hours || 0), 0);
    logger.info(`⏱️ Total Estimated Hours: ${totalEstimatedHours}`);
    
    logger.info('\n' + '='.repeat(80));
    
    // Display complete hierarchy
    courses.forEach((course, courseIndex) => {
      logger.info(`\n📚 COURSE ${course.order_index}: ${course.title.toUpperCase()}`);
      logger.info(`   Level: ${course.level} | Hours: ${course.estimated_hours} | Status: ${course.status}`);
      logger.info(`   Description: ${course.description?.substring(0, 100)}${course.description?.length > 100 ? '...' : ''}`);
      
      if (course.modules && course.modules.length > 0) {
        // Sort modules by order_index
        const sortedModules = course.modules.sort((a, b) => a.order_index - b.order_index);
        
        logger.info(`   📖 Modules (${sortedModules.length}):`);
        
        sortedModules.forEach((module, moduleIndex) => {
          logger.info(`   │`);
          logger.info(`   ├─ ${module.order_index}. ${module.title}`);
          logger.info(`   │  Type: ${module.module_type} | Difficulty: ${module.difficulty} | ${module.estimated_minutes}min`);
          
          if (module.lessons && module.lessons.length > 0) {
            // Sort lessons by order_index
            const sortedLessons = module.lessons.sort((a, b) => a.order_index - b.order_index);
            
            logger.info(`   │  📝 Lessons (${sortedLessons.length}):`);
            
            sortedLessons.forEach((lesson, lessonIndex) => {
              const isLast = lessonIndex === sortedLessons.length - 1;
              const prefix = isLast ? '   │     └─' : '   │     ├─';
              logger.info(`${prefix} ${lesson.order_index}. ${lesson.title}`);
              logger.info(`   │        Type: ${lesson.lesson_type} | ${lesson.estimated_minutes}min | Status: ${lesson.status}`);
            });
          } else {
            logger.info(`   │  📝 Lessons: None`);
          }
        });
      } else {
        logger.info(`   📖 Modules: None`);
      }
      
      logger.info(`   └─ End of ${course.title}`);
    });
    
    logger.info('\n' + '='.repeat(80));
    
    // Summary statistics by course category
    logger.info('\n📊 DETAILED STATISTICS');
    logger.info('======================');
    
    const foundationCourses = courses.filter(c => c.order_index <= 8);
    const masterclassCourses = courses.filter(c => c.order_index > 8 && c.order_index <= 13);
    const enhancedFoundationCourses = courses.filter(c => c.order_index > 13);
    
    logger.info(`\n🏗️ FOUNDATION COURSES (1-8):`);
    logger.info(`   Courses: ${foundationCourses.length}`);
    logger.info(`   Modules: ${foundationCourses.reduce((sum, c) => sum + (c.modules?.length || 0), 0)}`);
    logger.info(`   Lessons: ${foundationCourses.reduce((sum, c) => sum + c.modules?.reduce((ms, m) => ms + (m.lessons?.length || 0), 0) || 0, 0)}`);
    
    logger.info(`\n🚀 AI MASTERCLASS COURSES (9-13):`);
    logger.info(`   Courses: ${masterclassCourses.length}`);
    logger.info(`   Modules: ${masterclassCourses.reduce((sum, c) => sum + (c.modules?.length || 0), 0)}`);
    logger.info(`   Lessons: ${masterclassCourses.reduce((sum, c) => sum + c.modules?.reduce((ms, m) => ms + (m.lessons?.length || 0), 0) || 0, 0)}`);
    
    logger.info(`\n🧠 ENHANCED FOUNDATION COURSES (14-16):`);
    logger.info(`   Courses: ${enhancedFoundationCourses.length}`);
    logger.info(`   Modules: ${enhancedFoundationCourses.reduce((sum, c) => sum + (c.modules?.length || 0), 0)}`);
    logger.info(`   Lessons: ${enhancedFoundationCourses.reduce((sum, c) => sum + c.modules?.reduce((ms, m) => ms + (m.lessons?.length || 0), 0) || 0, 0)}`);
    
    // Content analysis
    logger.info(`\n📈 CONTENT ANALYSIS:`);
    
    const moduleTypes = {};
    const lessonTypes = {};
    const difficultyLevels = {};
    
    courses.forEach(course => {
      course.modules?.forEach(module => {
        moduleTypes[module.module_type] = (moduleTypes[module.module_type] || 0) + 1;
        difficultyLevels[module.difficulty] = (difficultyLevels[module.difficulty] || 0) + 1;
        
        module.lessons?.forEach(lesson => {
          lessonTypes[lesson.lesson_type] = (lessonTypes[lesson.lesson_type] || 0) + 1;
        });
      });
    });
    
    logger.info(`\n   Module Types:`);
    Object.entries(moduleTypes).sort(([,a], [,b]) => b - a).forEach(([type, count]) => {
      logger.info(`   • ${type}: ${count} modules`);
    });
    
    logger.info(`\n   Difficulty Distribution:`);
    Object.entries(difficultyLevels).sort(([,a], [,b]) => b - a).forEach(([level, count]) => {
      logger.info(`   • ${level}: ${count} modules`);
    });
    
    logger.info(`\n   Lesson Types:`);
    Object.entries(lessonTypes).sort(([,a], [,b]) => b - a).forEach(([type, count]) => {
      logger.info(`   • ${type}: ${count} lessons`);
    });
    
    logger.info('\n🎉 HIERARCHY LISTING COMPLETE!');
    
    return {
      success: true,
      totalCourses: courses.length,
      totalModules: totalModules,
      totalLessons: totalLessons,
      totalHours: totalEstimatedHours,
      foundationCourses: foundationCourses.length,
      masterclassCourses: masterclassCourses.length,
      enhancedFoundationCourses: enhancedFoundationCourses.length
    };
    
  } catch (error) {
    logger.error('❌ Hierarchy listing failed:', error);
    return { success: false, error: error.message };
  }
}

// Run the hierarchy listing
if (require.main === module) {
  listCompleteHierarchy()
    .then(result => {
      if (result.success) {
        logger.info('\n✅ Hierarchy listing completed successfully!');
      } else {
        logger.info('\n❌ Hierarchy listing failed:', result.error);
      }
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      logger.error('\n💥 Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { listCompleteHierarchy };
