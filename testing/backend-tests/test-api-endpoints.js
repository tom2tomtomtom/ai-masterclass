// Test API endpoints to verify rich content is accessible
const { chromium } = require('playwright');

async function testAPIEndpoints() {
  console.log('🔧 TESTING API ENDPOINTS FOR RICH CONTENT');
  console.log('=========================================');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable request interception to monitor API calls
  const apiCalls = [];
  
  page.on('response', async response => {
    if (response.url().includes('/api/') || response.url().includes('8000')) {
      try {
        const responseText = await response.text();
        apiCalls.push({
          url: response.url(),
          status: response.status(),
          method: response.request().method(),
          responseLength: responseText.length,
          responseSample: responseText.substring(0, 200)
        });
        console.log(`🌐 API Call: ${response.request().method()} ${response.url()} - ${response.status()} (${responseText.length} chars)`);
        
        // Log course data sample
        if (response.url().includes('courses') && responseText.length > 100) {
          try {
            const data = JSON.parse(responseText);
            if (data.data && Array.isArray(data.data)) {
              console.log(`   📚 Courses returned: ${data.data.length}`);
              if (data.data[0] && data.data[0].modules) {
                console.log(`   📖 First course modules: ${data.data[0].modules.length}`);
                if (data.data[0].modules[0] && data.data[0].modules[0].lessons) {
                  console.log(`   📝 First module lessons: ${data.data[0].modules[0].lessons.length}`);
                }
              }
            }
          } catch (e) {
            // Not JSON
          }
        }
        
      } catch (error) {
        console.log(`🌐 API Call: ${response.request().method()} ${response.url()} - ${response.status()} (couldn't read response)`);
      }
    }
  });
  
  try {
    console.log('🔗 Loading app to trigger API calls...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    console.log('\n📚 Navigating to courses to trigger course API...');
    await page.goto('http://localhost:3000/courses');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);
    
    // Try to manually test API endpoints
    console.log('\n🔬 Testing API endpoints directly...');
    
    // Test courses endpoint
    const coursesResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:8000/api/courses');
        const text = await response.text();
        return { status: response.status, text: text.substring(0, 500) };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('📊 Courses endpoint test:', coursesResponse);
    
    // Test specific course endpoint
    const courseDetailResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:8000/api/courses/1');
        const text = await response.text();
        return { status: response.status, text: text.substring(0, 500) };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('📖 Course detail endpoint test:', courseDetailResponse);
    
    // Test lessons endpoint
    const lessonsResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:8000/api/lessons');
        const text = await response.text();
        return { status: response.status, text: text.substring(0, 500) };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('📝 Lessons endpoint test:', lessonsResponse);
    
    // Check if backend is running
    const healthResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:8000/health');
        const text = await response.text();
        return { status: response.status, text };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('🏥 Backend health check:', healthResponse);
    
  } catch (error) {
    console.error('❌ API endpoint test failed:', error.message);
  } finally {
    await browser.close();
  }
  
  console.log('\n📊 API CALLS SUMMARY:');
  console.log('====================');
  console.log(`Total API calls intercepted: ${apiCalls.length}`);
  
  if (apiCalls.length === 0) {
    console.log('⚠️ No API calls detected - frontend may not be connecting to backend');
    console.log('🔍 Possible issues:');
    console.log('   - Backend server not running on port 8000');
    console.log('   - Frontend not configured to call backend APIs');
    console.log('   - CORS or network connectivity issues');
  } else {
    apiCalls.forEach((call, index) => {
      console.log(`${index + 1}. ${call.method} ${call.url} - ${call.status} (${call.responseLength} chars)`);
    });
  }
}

testAPIEndpoints();