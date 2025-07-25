// Test lesson data directly from the API
const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => reject(error));
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

async function testLessonsDirectly() {
  console.log('🔍 TESTING LESSON DATA DIRECTLY');
  console.log('='.repeat(40));
  
  try {
    // Test direct lesson endpoint
    console.log('\n📝 Testing lessons endpoint...');
    const lessonsResponse = await makeRequest('http://localhost:8000/api/lessons');
    
    if (lessonsResponse.status === 200 && lessonsResponse.data?.data) {
      const lessons = lessonsResponse.data.data;
      console.log(`✅ Found ${lessons.length} lessons total`);
      
      if (lessons.length > 0) {
        const firstLesson = lessons[0];
        const contentLength = firstLesson.content?.length || 0;
        
        console.log(`🎯 First lesson: "${firstLesson.title}"`);
        console.log(`📊 Content length: ${contentLength} characters`);
        console.log(`🆔 Lesson ID: ${firstLesson.id}`);
        console.log(`🔗 Module ID: ${firstLesson.module_id}`);
        
        if (contentLength > 1000) {
          console.log('✅ RICH CONTENT CONFIRMED - Lessons have substantial content!');
          
          // Show a sample of the content
          const contentPreview = firstLesson.content?.substring(0, 200) + '...';
          console.log(`📖 Content preview:\n${contentPreview}`);
        } else {
          console.log('⚠️  Lesson content appears minimal');
        }
      }
    } else {
      console.log(`❌ Lessons endpoint error: ${lessonsResponse.status}`);
    }
    
    // Test modules endpoint
    console.log('\n📖 Testing modules endpoint...');
    const modulesResponse = await makeRequest('http://localhost:8000/api/modules');
    
    if (modulesResponse.status === 200 && modulesResponse.data?.data) {
      const modules = modulesResponse.data.data;
      console.log(`✅ Found ${modules.length} modules total`);
      
      if (modules.length > 0) {
        const firstModule = modules[0];
        console.log(`📋 First module: "${firstModule.title}"`);
        console.log(`🆔 Module ID: ${firstModule.id}`);
        console.log(`🔗 Course ID: ${firstModule.course_id}`);
        
        // Test specific module lessons
        try {
          const moduleResponse = await makeRequest(`http://localhost:8000/api/modules/${firstModule.id}/lessons`);
          if (moduleResponse.status === 200) {
            const moduleLessons = moduleResponse.data?.data?.length || 0;
            console.log(`📝 This module has ${moduleLessons} lessons`);
          }
        } catch (e) {
          console.log('❌ Could not get module-specific lessons');
        }
      }
    } else {
      console.log(`❌ Modules endpoint error: ${modulesResponse.status}`);
    }
    
    // Final verification
    console.log('\n🎯 FINAL VERIFICATION');
    console.log('─'.repeat(30));
    
    // Check if we have all the data we need
    const lessonsCheck = await makeRequest('http://localhost:8000/api/lessons');
    const modulesCheck = await makeRequest('http://localhost:8000/api/modules');  
    const coursesCheck = await makeRequest('http://localhost:8000/api/courses');
    
    const lessonCount = lessonsCheck.data?.data?.length || 0;
    const moduleCount = modulesCheck.data?.data?.length || 0;
    const courseCount = coursesCheck.data?.data?.length || 0;
    
    console.log(`📚 Total courses: ${courseCount}`);
    console.log(`📖 Total modules: ${moduleCount}`);
    console.log(`📝 Total lessons: ${lessonCount}`);
    
    // Check if any lesson has rich content
    let hasRichContent = false;
    if (lessonCount > 0) {
      const lessons = lessonsCheck.data.data;
      for (const lesson of lessons.slice(0, 5)) {
        const contentLength = lesson.content?.length || 0;
        if (contentLength > 1000) {
          hasRichContent = true;
          break;
        }
      }
    }
    
    console.log(`🎯 Rich content available: ${hasRichContent ? '✅ YES' : '❌ NO'}`);
    
    if (courseCount > 0 && moduleCount > 0 && lessonCount > 0 && hasRichContent) {
      console.log('\n🎉 ALL DATA VERIFIED - APP READY WITH RICH CONTENT!');
      console.log('✅ The backend has all necessary data with substantial lesson content');
    } else {
      console.log('\n⚠️  DATA PARTIALLY AVAILABLE');
      if (!hasRichContent) {
        console.log('   → Rich content may be missing or minimal');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testLessonsDirectly();