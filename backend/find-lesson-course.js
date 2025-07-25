// Find which course our rich content lessons belong to
require('dotenv').config({ path: __dirname + '/.env' });
const { createClient } = require('@supabase/supabase-js');

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
  console.log('🔍 Finding which course contains our rich content lessons...');
  
  try {
    // Get our specific lessons
    const { data: lessons } = await supabase
      .from('lessons')
      .select('*')
      .in('title', ['Debugging and Troubleshooting Prompts', 'Introduction to Google AI & Gemini']);
      
    console.log(`Found ${lessons.length} lessons`);
    
    for (const lesson of lessons) {
      console.log(`\n📚 Lesson: "${lesson.title}"`);
      console.log(`- ID: ${lesson.id}`);
      console.log(`- Course ID: ${lesson.course_id}`);
      
      // Get the course details
      const { data: course } = await supabase
        .from('courses')
        .select('*')
        .eq('id', lesson.course_id)
        .single();
        
      if (course) {
        console.log(`- Course: "${course.title}"`);
        console.log(`- Course Description: ${course.description}`);
      }
    }
    
    // Also show all courses and their lesson counts
    console.log('\n📊 All courses and lesson counts:');
    const { data: allCourses } = await supabase
      .from('courses')
      .select('*');
      
    for (const course of allCourses) {
      const { data: courseLessons } = await supabase
        .from('lessons')
        .select('id, title')
        .eq('course_id', course.id);
        
      console.log(`\n🎓 "${course.title}" (ID: ${course.id})`);
      console.log(`   Lessons: ${courseLessons.length}`);
      
      if (courseLessons.length > 0) {
        courseLessons.forEach((lesson, index) => {
          console.log(`   ${index + 1}. ${lesson.title}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

findLessonCourse();