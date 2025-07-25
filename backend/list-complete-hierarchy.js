const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://fsohtauqtcftdjcjfdpq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzb2h0YXVxdGNmdGRqY2pmZHBxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjIyNjc4MCwiZXhwIjoyMDY3ODAyNzgwfQ.vLRzjcMIrpn8m3nEDI7pE7bSZg20Msdw60CHcsV1otI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listCompleteHierarchy() {
  try {
    console.log('📚 AI MASTERCLASS PLATFORM - COMPLETE HIERARCHY');
    console.log('===============================================');
    
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
      console.error('❌ Error fetching hierarchy:', coursesError);
      return { success: false, error: coursesError.message };
    }
    
    if (!courses || courses.length === 0) {
      console.log('⚠️ No courses found in database');
      return { success: false, error: 'No courses found' };
    }
    
    console.log(`\n🎯 PLATFORM OVERVIEW`);
    console.log(`📚 Total Courses: ${courses.length}`);
    
    const totalModules = courses.reduce((sum, course) => sum + (course.modules?.length || 0), 0);
    const totalLessons = courses.reduce((sum, course) => 
      sum + course.modules?.reduce((moduleSum, module) => 
        moduleSum + (module.lessons?.length || 0), 0) || 0, 0);
    
    console.log(`📖 Total Modules: ${totalModules}`);
    console.log(`📝 Total Lessons: ${totalLessons}`);
    
    const totalEstimatedHours = courses.reduce((sum, course) => sum + (course.estimated_hours || 0), 0);
    console.log(`⏱️ Total Estimated Hours: ${totalEstimatedHours}`);
    
    console.log('\n' + '='.repeat(80));
    
    // Display complete hierarchy
    courses.forEach((course, courseIndex) => {
      console.log(`\n📚 COURSE ${course.order_index}: ${course.title.toUpperCase()}`);
      console.log(`   Level: ${course.level} | Hours: ${course.estimated_hours} | Status: ${course.status}`);
      console.log(`   Description: ${course.description?.substring(0, 100)}${course.description?.length > 100 ? '...' : ''}`);
      
      if (course.modules && course.modules.length > 0) {
        // Sort modules by order_index
        const sortedModules = course.modules.sort((a, b) => a.order_index - b.order_index);
        
        console.log(`   📖 Modules (${sortedModules.length}):`);
        
        sortedModules.forEach((module, moduleIndex) => {
          console.log(`   │`);
          console.log(`   ├─ ${module.order_index}. ${module.title}`);
          console.log(`   │  Type: ${module.module_type} | Difficulty: ${module.difficulty} | ${module.estimated_minutes}min`);
          
          if (module.lessons && module.lessons.length > 0) {
            // Sort lessons by order_index
            const sortedLessons = module.lessons.sort((a, b) => a.order_index - b.order_index);
            
            console.log(`   │  📝 Lessons (${sortedLessons.length}):`);
            
            sortedLessons.forEach((lesson, lessonIndex) => {
              const isLast = lessonIndex === sortedLessons.length - 1;
              const prefix = isLast ? '   │     └─' : '   │     ├─';
              console.log(`${prefix} ${lesson.order_index}. ${lesson.title}`);
              console.log(`   │        Type: ${lesson.lesson_type} | ${lesson.estimated_minutes}min | Status: ${lesson.status}`);
            });
          } else {
            console.log(`   │  📝 Lessons: None`);
          }
        });
      } else {
        console.log(`   📖 Modules: None`);
      }
      
      console.log(`   └─ End of ${course.title}`);
    });
    
    console.log('\n' + '='.repeat(80));
    
    // Summary statistics by course category
    console.log('\n📊 DETAILED STATISTICS');
    console.log('======================');
    
    const foundationCourses = courses.filter(c => c.order_index <= 8);
    const masterclassCourses = courses.filter(c => c.order_index > 8 && c.order_index <= 13);
    const enhancedFoundationCourses = courses.filter(c => c.order_index > 13);
    
    console.log(`\n🏗️ FOUNDATION COURSES (1-8):`);
    console.log(`   Courses: ${foundationCourses.length}`);
    console.log(`   Modules: ${foundationCourses.reduce((sum, c) => sum + (c.modules?.length || 0), 0)}`);
    console.log(`   Lessons: ${foundationCourses.reduce((sum, c) => sum + c.modules?.reduce((ms, m) => ms + (m.lessons?.length || 0), 0) || 0, 0)}`);
    
    console.log(`\n🚀 AI MASTERCLASS COURSES (9-13):`);
    console.log(`   Courses: ${masterclassCourses.length}`);
    console.log(`   Modules: ${masterclassCourses.reduce((sum, c) => sum + (c.modules?.length || 0), 0)}`);
    console.log(`   Lessons: ${masterclassCourses.reduce((sum, c) => sum + c.modules?.reduce((ms, m) => ms + (m.lessons?.length || 0), 0) || 0, 0)}`);
    
    console.log(`\n🧠 ENHANCED FOUNDATION COURSES (14-16):`);
    console.log(`   Courses: ${enhancedFoundationCourses.length}`);
    console.log(`   Modules: ${enhancedFoundationCourses.reduce((sum, c) => sum + (c.modules?.length || 0), 0)}`);
    console.log(`   Lessons: ${enhancedFoundationCourses.reduce((sum, c) => sum + c.modules?.reduce((ms, m) => ms + (m.lessons?.length || 0), 0) || 0, 0)}`);
    
    // Content analysis
    console.log(`\n📈 CONTENT ANALYSIS:`);
    
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
    
    console.log(`\n   Module Types:`);
    Object.entries(moduleTypes).sort(([,a], [,b]) => b - a).forEach(([type, count]) => {
      console.log(`   • ${type}: ${count} modules`);
    });
    
    console.log(`\n   Difficulty Distribution:`);
    Object.entries(difficultyLevels).sort(([,a], [,b]) => b - a).forEach(([level, count]) => {
      console.log(`   • ${level}: ${count} modules`);
    });
    
    console.log(`\n   Lesson Types:`);
    Object.entries(lessonTypes).sort(([,a], [,b]) => b - a).forEach(([type, count]) => {
      console.log(`   • ${type}: ${count} lessons`);
    });
    
    console.log('\n🎉 HIERARCHY LISTING COMPLETE!');
    
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
    console.error('❌ Hierarchy listing failed:', error);
    return { success: false, error: error.message };
  }
}

// Run the hierarchy listing
if (require.main === module) {
  listCompleteHierarchy()
    .then(result => {
      if (result.success) {
        console.log('\n✅ Hierarchy listing completed successfully!');
      } else {
        console.log('\n❌ Hierarchy listing failed:', result.error);
      }
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('\n💥 Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { listCompleteHierarchy };
