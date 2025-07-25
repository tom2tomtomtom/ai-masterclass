// Test the newly fixed API endpoints manually
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
          resolve({ status: res.statusCode, data: data, raw: true });
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

async function testNewEndpoints() {
  console.log('🔍 TESTING NEW API ENDPOINTS');
  console.log('='.repeat(50));
  
  console.log('⚠️  NOTE: Backend server needs to be restarted to pick up API changes');
  console.log('📡 If endpoints return 404, please restart the backend server\n');
  
  try {
    // Test 1: Direct courses API (should work)
    console.log('📚 Testing /api/courses...');
    try {
      const coursesResponse = await makeRequest('http://localhost:8000/api/courses?limit=20');
      if (coursesResponse.status === 200 && coursesResponse.data?.success) {
        const courses = coursesResponse.data.data;
        console.log(`✅ Courses API: ${courses.length} courses found`);
        
        // Test course detail with modules
        if (courses.length > 0) {
          const firstCourse = courses[0];
          console.log(`🔍 Testing course detail for: "${firstCourse.title}"`);
          
          const courseDetailResponse = await makeRequest(`http://localhost:8000/api/courses/${firstCourse.id}`);
          
          if (courseDetailResponse.status === 200 && courseDetailResponse.data?.success) {
            const courseData = courseDetailResponse.data.data;
            const modules = courseData.modules || [];
            console.log(`   📖 Modules in course: ${modules.length}`);
            
            if (modules.length > 0) {
              const totalLessons = modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0);
              console.log(`   📝 Total lessons in course: ${totalLessons}`);
              
              if (totalLessons > 0) {
                const firstLesson = modules[0].lessons?.[0];
                if (firstLesson) {
                  const contentLength = firstLesson.content?.length || 0;
                  console.log(`   🎯 First lesson: "${firstLesson.title}" (${contentLength} chars)`);
                  
                  if (contentLength > 1000) {
                    console.log('   ✅ RICH CONTENT CONFIRMED VIA API!');
                  }
                }
              }
            }
          } else {
            console.log(`   ❌ Course detail failed: ${courseDetailResponse.status}`);
          }
        }
      } else {
        console.log(`❌ Courses API failed: ${coursesResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Courses API error: ${error.message}`);
    }
    
    // Test 2: Course modules API
    console.log('\n📖 Testing /api/courses/:id/modules...');
    try {
      // Get first course ID from database directly
      require('dotenv').config();
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      
      const { data: courses } = await supabase.from('courses').select('id').limit(1);
      
      if (courses && courses.length > 0) {
        const courseId = courses[0].id;
        const modulesResponse = await makeRequest(`http://localhost:8000/api/courses/${courseId}/modules`);
        
        if (modulesResponse.status === 200 && modulesResponse.data?.success) {
          const modules = modulesResponse.data.data;
          console.log(`✅ Course modules API: ${modules.length} modules found`);
          
          if (modules.length > 0) {
            const totalLessons = modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0);
            console.log(`   📝 Total lessons: ${totalLessons}`);
          }
        } else {
          console.log(`❌ Course modules API failed: ${modulesResponse.status}`);
        }
      }
    } catch (error) {
      console.log(`❌ Course modules API error: ${error.message}`);
    }
    
    // Test 3: Direct modules API  
    console.log('\n📂 Testing /api/modules...');
    try {
      const modulesResponse = await makeRequest('http://localhost:8000/api/modules');
      
      if (modulesResponse.status === 200 && modulesResponse.data?.success) {
        const modules = modulesResponse.data.data;
        console.log(`✅ Direct modules API: ${modules.length} modules found`);
      } else {
        console.log(`❌ Direct modules API failed: ${modulesResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Direct modules API error: ${error.message}`);
    }
    
    // Test 4: Direct lessons API
    console.log('\n📝 Testing /api/lessons...');
    try {
      const lessonsResponse = await makeRequest('http://localhost:8000/api/lessons');
      
      if (lessonsResponse.status === 200 && lessonsResponse.data?.success) {
        const lessons = lessonsResponse.data.data;
        console.log(`✅ Direct lessons API: ${lessons.length} lessons found`);
        
        if (lessons.length > 0) {
          const richLessons = lessons.filter(lesson => lesson.content && lesson.content.length > 1000);
          console.log(`   📊 Rich content lessons: ${richLessons.length}/${lessons.length}`);
          
          if (richLessons.length > 0) {
            console.log(`   🎯 Average content length: ${Math.floor(richLessons.reduce((sum, lesson) => sum + lesson.content.length, 0) / richLessons.length)} chars`);
            console.log('   ✅ RICH CONTENT AVAILABLE VIA API!');
          }
        }
      } else {
        console.log(`❌ Direct lessons API failed: ${lessonsResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Direct lessons API error: ${error.message}`);
    }
    
    // Final Assessment
    console.log('\n🎯 API ENDPOINT STATUS ASSESSMENT');
    console.log('='.repeat(50));
    
    // Test key endpoints
    const endpointTests = [
      { name: 'Courses API', url: 'http://localhost:8000/api/courses' },
      { name: 'Modules API', url: 'http://localhost:8000/api/modules' }, 
      { name: 'Lessons API', url: 'http://localhost:8000/api/lessons' }
    ];
    
    for (const test of endpointTests) {
      try {
        const response = await makeRequest(test.url);
        const status = response.status === 200 ? '✅ WORKING' : `❌ HTTP ${response.status}`;
        console.log(`   ${test.name}: ${status}`);
      } catch (error) {
        console.log(`   ${test.name}: ❌ ERROR`);
      }
    }
    
    console.log('\n💡 NEXT STEPS:');
    console.log('1. If APIs show 404 errors: Restart backend server');
    console.log('2. Once APIs work: Test frontend integration');
    console.log('3. Run end-to-end test to verify complete functionality');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testNewEndpoints();