// Diagnose Frontend-Backend Connection Issues
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔍 DIAGNOSING FRONTEND-BACKEND CONNECTION ISSUES');
console.log('================================================');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnoseConnection() {
  try {
    console.log('\n1. 🗄️ CHECKING DATABASE CONNECTION...');
    
    // Test database connection
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, status')
      .limit(5);
    
    if (coursesError) {
      console.error('❌ Database connection failed:', coursesError.message);
      return;
    }
    
    console.log(`✅ Database connected - Found ${courses.length} courses`);
    courses.forEach(course => {
      console.log(`   📚 ${course.title} - Status: ${course.status}`);
    });
    
    console.log('\n2. 🔗 CHECKING COURSE-MODULE-LESSON RELATIONSHIPS...');
    
    // Test full course structure
    const { data: fullCourse, error: fullError } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        status,
        modules(
          id,
          title,
          lessons(
            id,
            title,
            content,
            status
          )
        )
      `)
      .eq('id', courses[0].id)
      .single();
    
    if (fullError) {
      console.error('❌ Failed to fetch course structure:', fullError.message);
      return;
    }
    
    const lessonCount = fullCourse.modules.reduce((sum, module) => sum + module.lessons.length, 0);
    const richLessons = fullCourse.modules.reduce((sum, module) => 
      sum + module.lessons.filter(lesson => lesson.content && lesson.content.length > 1000).length, 0);
    
    console.log(`✅ Course structure verified:`);
    console.log(`   📖 Course: ${fullCourse.title} (${fullCourse.status})`);
    console.log(`   📂 Modules: ${fullCourse.modules.length}`);
    console.log(`   📝 Lessons: ${lessonCount}`);
    console.log(`   💎 Rich lessons: ${richLessons}`);
    
    // Show sample lesson content
    const sampleLesson = fullCourse.modules[0]?.lessons[0];
    if (sampleLesson) {
      console.log(`\n   📄 Sample lesson: "${sampleLesson.title}"`);
      console.log(`   📊 Content length: ${sampleLesson.content?.length || 0} chars`);
      console.log(`   📋 Status: ${sampleLesson.status}`);
      if (sampleLesson.content) {
        console.log(`   🔍 Preview: ${sampleLesson.content.substring(0, 200)}...`);
      }
    }
    
    console.log('\n3. 🌐 CHECKING API ENDPOINT SIMULATION...');
    
    // Simulate what the frontend API call should return
    const apiResponse = {
      success: true,
      data: {
        id: fullCourse.id,
        title: fullCourse.title,
        status: fullCourse.status,
        modules: fullCourse.modules.map(module => ({
          id: module.id,
          title: module.title,
          lessons: module.lessons.map(lesson => ({
            id: lesson.id,
            title: lesson.title,
            hasContent: !!(lesson.content && lesson.content.length > 500),
            contentPreview: lesson.content ? lesson.content.substring(0, 100) + '...' : 'No content'
          }))
        }))
      }
    };
    
    console.log('✅ Expected API response structure:');
    console.log(JSON.stringify(apiResponse, null, 2));
    
    console.log('\n4. 🚨 IDENTIFYING POTENTIAL ISSUES...');
    
    const issues = [];
    
    // Check for common issues
    if (!process.env.SUPABASE_URL) {
      issues.push('Missing SUPABASE_URL environment variable');
    }
    
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      issues.push('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
    }
    
    // Check course statuses
    const unpublishedCourses = courses.filter(course => course.status !== 'published');
    if (unpublishedCourses.length > 0) {
      issues.push(`${unpublishedCourses.length} courses not published`);
    }
    
    // Check lesson content
    if (richLessons === 0) {
      issues.push('No rich lesson content found');
    }
    
    if (issues.length === 0) {
      console.log('✅ No backend issues detected - problem likely in frontend configuration');
      
      console.log('\n5. 🔧 FRONTEND TROUBLESHOOTING CHECKLIST:');
      console.log('   □ Check if React app is running on correct port (usually 3000)');
      console.log('   □ Check if backend API is running on correct port (usually 8000)');
      console.log('   □ Verify REACT_APP_API_BASE_URL in frontend .env file');
      console.log('   □ Check browser console for CORS or network errors');
      console.log('   □ Clear browser cache and cookies');
      console.log('   □ Check if authentication is working (login/register)');
      console.log('   □ Test API endpoints directly: http://localhost:8000/api/courses');
      
    } else {
      console.log('❌ Backend issues detected:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    console.log('\n6. ✅ SUMMARY:');
    console.log(`   📊 Database: ${courses.length} courses, ${lessonCount} lessons`);
    console.log(`   💎 Rich content: ${richLessons}/${lessonCount} lessons have substantial content`);
    console.log(`   🔍 Backend status: ${issues.length === 0 ? 'HEALTHY' : 'ISSUES FOUND'}`);
    console.log(`   🎯 Next step: ${issues.length === 0 ? 'Check frontend configuration' : 'Fix backend issues'}`);
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
    console.error('🔧 Check your .env file and database configuration');
  }
}

// Run diagnosis
diagnoseConnection()
  .then(() => {
    console.log('\n✅ Diagnosis completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Diagnosis failed:', error.message);
    process.exit(1);
  });