// Diagnose Frontend-Backend Connection Issues
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');
require('dotenv').config();

logger.info('🔍 DIAGNOSING FRONTEND-BACKEND CONNECTION ISSUES');
logger.info('================================================');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnoseConnection() {
  try {
    logger.info('\n1. 🗄️ CHECKING DATABASE CONNECTION...');
    
    // Test database connection
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, status')
      .limit(5);
    
    if (coursesError) {
      logger.error('❌ Database connection failed:', coursesError.message);
      return;
    }
    
    logger.info(`✅ Database connected - Found ${courses.length} courses`);
    courses.forEach(course => {
      logger.info(`   📚 ${course.title} - Status: ${course.status}`);
    });
    
    logger.info('\n2. 🔗 CHECKING COURSE-MODULE-LESSON RELATIONSHIPS...');
    
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
      logger.error('❌ Failed to fetch course structure:', fullError.message);
      return;
    }
    
    const lessonCount = fullCourse.modules.reduce((sum, module) => sum + module.lessons.length, 0);
    const richLessons = fullCourse.modules.reduce((sum, module) => 
      sum + module.lessons.filter(lesson => lesson.content && lesson.content.length > 1000).length, 0);
    
    logger.info(`✅ Course structure verified:`);
    logger.info(`   📖 Course: ${fullCourse.title} (${fullCourse.status})`);
    logger.info(`   📂 Modules: ${fullCourse.modules.length}`);
    logger.info(`   📝 Lessons: ${lessonCount}`);
    logger.info(`   💎 Rich lessons: ${richLessons}`);
    
    // Show sample lesson content
    const sampleLesson = fullCourse.modules[0]?.lessons[0];
    if (sampleLesson) {
      logger.info(`\n   📄 Sample lesson: "${sampleLesson.title}"`);
      logger.info(`   📊 Content length: ${sampleLesson.content?.length || 0} chars`);
      logger.info(`   📋 Status: ${sampleLesson.status}`);
      if (sampleLesson.content) {
        logger.info(`   🔍 Preview: ${sampleLesson.content.substring(0, 200)}...`);
      }
    }
    
    logger.info('\n3. 🌐 CHECKING API ENDPOINT SIMULATION...');
    
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
    
    logger.info('✅ Expected API response structure:');
    logger.info(JSON.stringify(apiResponse, null, 2));
    
    logger.info('\n4. 🚨 IDENTIFYING POTENTIAL ISSUES...');
    
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
      logger.info('✅ No backend issues detected - problem likely in frontend configuration');
      
      logger.info('\n5. 🔧 FRONTEND TROUBLESHOOTING CHECKLIST:');
      logger.info('   □ Check if React app is running on correct port (usually 3000)');
      logger.info('   □ Check if backend API is running on correct port (usually 8000)');
      logger.info('   □ Verify REACT_APP_API_BASE_URL in frontend .env file');
      logger.info('   □ Check browser console for CORS or network errors');
      logger.info('   □ Clear browser cache and cookies');
      logger.info('   □ Check if authentication is working (login/register)');
      logger.info('   □ Test API endpoints directly: http://localhost:8000/api/courses');
      
    } else {
      logger.info('❌ Backend issues detected:');
      issues.forEach(issue => logger.info(`   - ${issue}`));
    }
    
    logger.info('\n6. ✅ SUMMARY:');
    logger.info(`   📊 Database: ${courses.length} courses, ${lessonCount} lessons`);
    logger.info(`   💎 Rich content: ${richLessons}/${lessonCount} lessons have substantial content`);
    logger.info(`   🔍 Backend status: ${issues.length === 0 ? 'HEALTHY' : 'ISSUES FOUND'}`);
    logger.info(`   🎯 Next step: ${issues.length === 0 ? 'Check frontend configuration' : 'Fix backend issues'}`);
    
  } catch (error) {
    logger.error('❌ Diagnostic failed:', error.message);
    logger.error('🔧 Check your .env file and database configuration');
  }
}

// Run diagnosis
diagnoseConnection()
  .then(() => {
    logger.info('\n✅ Diagnosis completed!');
    process.exit(0);
  })
  .catch(error => {
    logger.error('❌ Diagnosis failed:', error.message);
    process.exit(1);
  });