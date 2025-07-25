// Debug what lesson data actually exists in database
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

async function debugLessonData() {
  console.log('🔍 Debugging lesson data in database...');
  
  try {
    // Get all lessons
    console.log('\n📚 Checking all lessons...');
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .order('created_at');
      
    if (lessonsError) {
      console.error('❌ Error fetching lessons:', lessonsError);
      return;
    }
    
    console.log(`Found ${lessons.length} lessons total`);
    
    // Look for our specific lessons
    const debugLesson = lessons.find(l => l.title.includes('Debugging') || l.title.includes('Troubleshooting'));
    const googleLesson = lessons.find(l => l.title.includes('Google') || l.title.includes('Gemini'));
    
    if (debugLesson) {
      console.log('\n🐛 DEBUGGING LESSON FOUND:');
      console.log('- ID:', debugLesson.id);
      console.log('- Title:', debugLesson.title);
      console.log('- Course ID:', debugLesson.course_id);
      console.log('- Content length:', debugLesson.content ? debugLesson.content.length : 'NO CONTENT');
      console.log('- Content preview:', debugLesson.content ? debugLesson.content.substring(0, 100) + '...' : 'N/A');
    } else {
      console.log('\n❌ NO DEBUGGING LESSON FOUND');
      
      // Show all lesson titles to see what exists
      console.log('\n📋 All lesson titles:');
      lessons.forEach((lesson, index) => {
        console.log(`${index + 1}. "${lesson.title}" (Course: ${lesson.course_id})`);
      });
    }
    
    if (googleLesson) {
      console.log('\n🌐 GOOGLE AI LESSON FOUND:');
      console.log('- ID:', googleLesson.id);
      console.log('- Title:', googleLesson.title);
      console.log('- Course ID:', googleLesson.course_id);
      console.log('- Content length:', googleLesson.content ? googleLesson.content.length : 'NO CONTENT');
      console.log('- Content preview:', googleLesson.content ? googleLesson.content.substring(0, 100) + '...' : 'N/A');
    } else {
      console.log('\n❌ NO GOOGLE AI LESSON FOUND');
    }
    
    // Check prompts
    console.log('\n📋 Checking prompts...');
    const { data: prompts, error: promptsError } = await supabase
      .from('prompts')
      .select('*');
      
    if (promptsError) {
      console.error('❌ Error fetching prompts:', promptsError);
    } else {
      console.log(`Found ${prompts.length} prompts total`);
      if (prompts.length > 0) {
        console.log('Sample prompt:', prompts[0].title);
        console.log('Linked to lesson_id:', prompts[0].lesson_id);
      }
    }
    
    // Check quizzes
    console.log('\n🎯 Checking quizzes...');
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select('*');
      
    if (quizzesError) {
      console.error('❌ Error fetching quizzes:', quizzesError);
    } else {
      console.log(`Found ${quizzes.length} quizzes total`);
      if (quizzes.length > 0) {
        console.log('Sample quiz:', quizzes[0].question);
        console.log('Linked to lesson_id:', quizzes[0].lesson_id);
      }
    }
    
    // Check tasks
    console.log('\n✋ Checking tasks...');
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*');
      
    if (tasksError) {
      console.error('❌ Error fetching tasks:', tasksError);
    } else {
      console.log(`Found ${tasks.length} tasks total`);
      if (tasks.length > 0) {
        console.log('Sample task:', tasks[0].title);
        console.log('Linked to lesson_id:', tasks[0].lesson_id);
      }
    }
    
    // Check courses to see the structure
    console.log('\n📚 Checking courses...');
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*');
      
    if (coursesError) {
      console.error('❌ Error fetching courses:', coursesError);
    } else {
      console.log(`Found ${courses.length} courses total`);
      courses.forEach((course, index) => {
        console.log(`${index + 1}. "${course.title}" (ID: ${course.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugLessonData();