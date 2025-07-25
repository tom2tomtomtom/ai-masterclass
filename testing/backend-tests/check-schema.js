const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCurrentSchema() {
  console.log('🔍 Checking current database schema...');
  
  // Try to get existing lessons to see the actual schema
  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('*')
    .limit(1);
  
  if (lessonsError) {
    console.log('❌ Error querying lessons:', lessonsError.message);
  } else {
    console.log('📋 Current lessons table structure:');
    if (lessons.length > 0) {
      console.log('Columns found:', Object.keys(lessons[0]));
    } else {
      console.log('No lessons found, but table exists');
    }
  }
  
  // Check modules table
  const { data: modules, error: modulesError } = await supabase
    .from('modules')
    .select('*')
    .limit(1);
  
  if (modulesError) {
    console.log('❌ Modules table error:', modulesError.message);
  } else {
    console.log('📋 Modules table exists');
    if (modules.length > 0) {
      console.log('Module columns:', Object.keys(modules[0]));
    }
  }
  
  // Check courses table
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('*')
    .limit(1);
  
  if (coursesError) {
    console.log('❌ Courses table error:', coursesError.message);
  } else {
    console.log('📋 Courses table exists');
    if (courses.length > 0) {
      console.log('Course columns:', Object.keys(courses[0]));
    }
  }
  
  // Try to insert a simple lesson to see what columns are required/available
  console.log('\n🧪 Testing minimal lesson insertion...');
  
  // Get a real course ID first
  const { data: realCourses } = await supabase
    .from('courses')
    .select('id')
    .limit(1);
  
  if (realCourses && realCourses.length > 0) {
    const courseId = realCourses[0].id;
    
    const minimalLesson = {
      title: 'Test Lesson Schema Check',
      course_id: courseId
    };
    
    const { data: insertedLesson, error: insertError } = await supabase
      .from('lessons')
      .insert([minimalLesson])
      .select();
    
    if (insertError) {
      console.log('❌ Minimal insertion error:', insertError.message);
      console.log('💡 This tells us what columns are required or missing');
    } else {
      console.log('✅ Minimal lesson inserted successfully!');
      console.log('📋 Inserted lesson structure:', Object.keys(insertedLesson[0]));
      
      // Clean up
      await supabase.from('lessons').delete().eq('id', insertedLesson[0].id);
      console.log('🧹 Test lesson cleaned up');
    }
  }
}

checkCurrentSchema();