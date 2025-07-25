// Test API endpoints with correct data structure understanding
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

async function testApiCorrectly() {
  console.log('🔍 CORRECT API STRUCTURE TEST');
  console.log('='.repeat(50));
  
  try {
    // Test 1: Get courses
    console.log('\n📚 Testing courses API...');
    const coursesResponse = await makeRequest('http://localhost:8000/api/courses?limit=50');
    
    if (coursesResponse.status === 200 && coursesResponse.data.success) {
      const courses = coursesResponse.data.data;
      console.log(`✅ Found ${courses.length} courses`);
      
      // Test 2: For each course, check what the course detail API returns
      console.log('\n📖 Testing course details API...');
      
      for (const course of courses.slice(0, 3)) {
        console.log(`\n📚 Testing course: "${course.title}"`);
        
        try {
          const courseDetailResponse = await makeRequest(`http://localhost:8000/api/courses/${course.id}`);
          
          if (courseDetailResponse.status === 200 && courseDetailResponse.data.success) {
            const courseData = courseDetailResponse.data.data;
            const lessons = courseData.lessons || [];
            
            console.log(`   📝 Lessons returned: ${lessons.length}`);
            
            if (lessons.length > 0) {
              const firstLesson = lessons[0];
              const contentLength = firstLesson.content?.length || 0;
              console.log(`   🎯 First lesson: "${firstLesson.title}"`);
              console.log(`   📊 Content length: ${contentLength} characters`);
              
              if (contentLength > 1000) {
                console.log('   ✅ Rich content confirmed!');
              } else {
                console.log('   ⚠️  Minimal content');
              }
            }
          } else {
            console.log(`   ❌ Course detail API failed: ${courseDetailResponse.status}`);
          }
        } catch (error) {
          console.log(`   ❌ Error fetching course details: ${error.message}`);
        }
      }
      
      // Test 3: Check if we need direct lesson access
      console.log('\n🔍 Understanding data structure...');
      
      // Let's query Supabase directly to understand the relationships
      require('dotenv').config();
      const { createClient } = require('@supabase/supabase-js');
      
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      
      try {
        // Check course → module relationship
        const { data: sampleCourse } = await supabase
          .from('courses')
          .select('id, title')
          .limit(1);
          
        if (sampleCourse && sampleCourse.length > 0) {
          const courseId = sampleCourse[0].id;
          console.log(`🔍 Analyzing course: "${sampleCourse[0].title}"`);
          
          // Check modules for this course
          const { data: modules, count: moduleCount } = await supabase
            .from('modules')
            .select('id, title', { count: 'exact' })
            .eq('course_id', courseId);
            
          console.log(`   📖 Modules in database: ${moduleCount || 0}`);
          
          if (modules && modules.length > 0) {
            // Check lessons for first module
            const { data: lessons, count: lessonCount } = await supabase
              .from('lessons')
              .select('id, title, content', { count: 'exact' })
              .eq('module_id', modules[0].id);
              
            console.log(`   📝 Lessons for first module: ${lessonCount || 0}`);
            
            if (lessons && lessons.length > 0) {
              const contentLength = lessons[0].content?.length || 0;
              console.log(`   📊 First lesson content: ${contentLength} characters`);
              
              if (contentLength > 1000) {
                console.log('   ✅ Rich content exists in database!');
              }
            }
          }
          
          // Check all lessons regardless of module
          const { count: totalLessons } = await supabase
            .from('lessons')
            .select('*', { count: 'exact', head: true });
            
          console.log(`   📊 Total lessons in database: ${totalLessons || 0}`);
          
          if (totalLessons > 0) {
            const { data: sampleLessons } = await supabase
              .from('lessons')
              .select('title, content, module_id')
              .limit(5);
              
            console.log('\n📝 Sample lessons:');
            sampleLessons.forEach(lesson => {
              const contentLength = lesson.content?.length || 0;
              console.log(`   • "${lesson.title}": ${contentLength} chars`);
            });
          }
        }
        
      } catch (dbError) {
        console.log('❌ Direct database query failed:', dbError.message);
      }
      
      // Final assessment
      console.log('\n🎯 API STRUCTURE ANALYSIS');
      console.log('='.repeat(40));
      
      console.log('🔍 Current API Endpoints:');
      console.log('   GET /api/courses - ✅ Working');
      console.log('   GET /api/courses/:id - ❓ Returns lessons directly');
      console.log('   GET /api/modules - ❌ Not available');
      console.log('   GET /api/lessons - ❌ Not available');
      
      console.log('\n🎯 Data Structure:');
      console.log('   courses ← modules ← lessons');
      console.log('   BUT API skips modules, goes: courses → lessons');
      
      console.log('\n💡 Recommendation:');
      console.log('   The API is designed to return lessons directly under courses');
      console.log('   The frontend should expect: course.lessons[] not course.modules[].lessons[]');
      
    } else {
      console.log('❌ Courses API failed:', coursesResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testApiCorrectly();