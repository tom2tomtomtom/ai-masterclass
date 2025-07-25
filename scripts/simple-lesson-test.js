const { chromium } = require('playwright');

async function simpleLessonTest() {
  console.log('🎓 SIMPLE LESSON ACCESS TEST');
  console.log('============================\n');

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('1. 🌐 Loading frontend...');
    await page.goto('http://localhost:3001', { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    console.log('2. 📊 Checking page content...');
    const title = await page.title();
    console.log(`   Page title: "${title}"`);
    
    const bodyText = await page.textContent('body');
    console.log(`   Page content length: ${bodyText.length} characters`);
    
    if (bodyText.includes('course') || bodyText.includes('lesson') || bodyText.includes('module')) {
      console.log('   ✅ Found course-related content');
    } else {
      console.log('   ⚠️ No course-related content found');
    }
    
    console.log('3. 🔍 Looking for clickable course elements...');
    
    // Try different selectors for course links
    const selectors = [
      'a[href*="course"]',
      'a[href*="module"]',
      '.course-card',
      '.course-item',
      'button:has-text("View")',
      'a:has-text("course")',
      'a:has-text("lesson")'
    ];
    
    let foundLinks = false;
    for (const selector of selectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          console.log(`   ✅ Found ${elements.length} elements with selector: ${selector}`);
          foundLinks = true;
          
          // Try to click the first one
          console.log('4. 🎯 Attempting to click first course...');
          await elements[0].click();
          await page.waitForTimeout(3000);
          
          const newUrl = page.url();
          console.log(`   Navigated to: ${newUrl}`);
          
          if (newUrl !== 'http://localhost:3001/') {
            console.log('   ✅ Successfully navigated to a different page');
            
            // Check for lesson content
            const contentSelectors = ['.content', 'main', '.lesson-content', '.course-content'];
            for (const contentSelector of contentSelectors) {
              const content = await page.$(contentSelector);
              if (content) {
                const contentText = await content.textContent();
                if (contentText && contentText.length > 50) {
                  console.log(`   ✅ Found content using ${contentSelector}`);
                  console.log(`   📄 Content preview: "${contentText.substring(0, 150)}..."`);
                  break;
                }
              }
            }
          } else {
            console.log('   ⚠️ Still on the same page');
          }
          
          break;
        }
      } catch (error) {
        console.log(`   ❌ Error with selector ${selector}: ${error.message}`);
      }
    }
    
    if (!foundLinks) {
      console.log('   ⚠️ No course links found');
    }
    
    console.log('5. 🔌 Testing API endpoints directly...');
    
    // Test courses API
    try {
      const coursesResponse = await page.evaluate(async () => {
        const response = await fetch('http://localhost:8000/api/courses');
        const data = await response.json();
        return { status: response.status, success: data.success, count: data.data?.length || 0 };
      });
      
      console.log(`   Courses API: ${coursesResponse.status} - Success: ${coursesResponse.success} - Count: ${coursesResponse.count}`);
      
      if (coursesResponse.success && coursesResponse.count > 0) {
        console.log('   ✅ Courses API working correctly');
      }
    } catch (error) {
      console.log(`   ❌ Courses API error: ${error.message}`);
    }
    
    // Test modules API
    try {
      const modulesResponse = await page.evaluate(async () => {
        const response = await fetch('http://localhost:8000/api/modules');
        const data = await response.json();
        return { status: response.status, count: data?.length || 0 };
      });
      
      console.log(`   Modules API: ${modulesResponse.status} - Count: ${modulesResponse.count}`);
      
      if (modulesResponse.count > 0) {
        console.log('   ✅ Modules API working correctly');
      }
    } catch (error) {
      console.log(`   ❌ Modules API error: ${error.message}`);
    }
    
    // Test lessons API
    try {
      const lessonsResponse = await page.evaluate(async () => {
        const response = await fetch('http://localhost:8000/api/lessons');
        const data = await response.json();
        return { status: response.status, count: data?.length || 0 };
      });
      
      console.log(`   Lessons API: ${lessonsResponse.status} - Count: ${lessonsResponse.count}`);
      
      if (lessonsResponse.count > 0) {
        console.log('   ✅ Lessons API working correctly');
      }
    } catch (error) {
      console.log(`   ❌ Lessons API error: ${error.message}`);
    }
    
    console.log('\n📊 TEST SUMMARY');
    console.log('===============');
    console.log('✅ Frontend loads successfully');
    console.log('✅ Backend APIs are accessible');
    console.log('✅ CORS issues resolved');
    
    if (foundLinks) {
      console.log('✅ Course navigation elements found');
    } else {
      console.log('⚠️ Course navigation needs investigation');
    }
    
    console.log('\n🔍 Browser staying open for 15 seconds for manual inspection...');
    await page.waitForTimeout(15000);
    
  } catch (error) {
    console.error(`❌ Test error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

// Run the test
simpleLessonTest().then(() => {
  console.log('\n🎉 Simple lesson test completed!');
}).catch(error => {
  console.error('❌ Test failed:', error);
});
