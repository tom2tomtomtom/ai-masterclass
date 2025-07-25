// Test frontend rendering with known content IDs
const { chromium } = require('playwright');

async function testFrontendRendering() {
  console.log('🎯 TESTING FRONTEND RENDERING WITH KNOWN IDs');
  console.log('='.repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 1000
  });
  const page = await browser.newPage();
  
  try {
    // First, let's verify the API works
    console.log('1️⃣ Testing API directly from browser...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const apiTest = await page.evaluate(async () => {
      try {
        const coursesResponse = await fetch('http://localhost:8000/api/courses');
        const coursesData = await coursesResponse.json();
        
        if (coursesData.data && coursesData.data.length > 0) {
          // Find Google AI course
          const googleAICourse = coursesData.data.find(c => c.title.includes('Google AI'));
          if (googleAICourse) {
            // Get lessons for this course
            const lessonsResponse = await fetch(`http://localhost:8000/api/courses/${googleAICourse.id}/lessons`);
            const lessonsData = await lessonsResponse.json();
            
            if (lessonsData.data && lessonsData.data.length > 0) {
              const introLesson = lessonsData.data[0]; // First lesson
              
              // Get full lesson content
              const lessonResponse = await fetch(`http://localhost:8000/api/lessons/${introLesson.id}`);
              const lessonData = await lessonResponse.json();
              
              return {
                success: true,
                courseId: googleAICourse.id,
                courseTitle: googleAICourse.title,
                lessonId: introLesson.id,
                lessonTitle: introLesson.title,
                lessonContentLength: lessonData.data?.content?.length || 0,
                hasRichContent: lessonData.data?.content?.includes('Copy-Paste Prompts') || false
              };
            }
          }
        }
        return { success: false, error: 'No courses or lessons found' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    console.log('📊 API Test Results:', apiTest);
    
    if (apiTest.success) {
      console.log('2️⃣ Testing direct lesson URL access...');
      
      // Try to navigate directly to the lesson
      const lessonUrl = `http://localhost:3000/lessons/${apiTest.lessonId}`;
      console.log(`   Navigating to: ${lessonUrl}`);
      
      await page.goto(lessonUrl, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(5000);
      
      // Take screenshot
      await page.screenshot({ 
        path: '/Users/thomasdowuona-hyde/AI-Masterclass/test-lesson-direct-url.png', 
        fullPage: true 
      });
      
      const pageContent = await page.locator('body').textContent();
      
      console.log('3️⃣ Analyzing lesson page...');
      console.log(`   Page content length: ${pageContent.length}`);
      console.log(`   Contains lesson title: ${pageContent.includes(apiTest.lessonTitle)}`);
      console.log(`   Contains rich content header: ${pageContent.includes('Google AI & Gemini Mastery → Unlock Advanced AI Capabilities')}`);
      console.log(`   Contains copy-paste prompts: ${pageContent.includes('Copy-Paste Prompts')}`);
      console.log(`   Contains JavaScript error: ${pageContent.includes('You need to enable JavaScript')}`);
      console.log(`   Contains loading text: ${pageContent.includes('Loading')}`);
      
      if (pageContent.includes('Copy-Paste Prompts')) {
        console.log('🎉 SUCCESS: Rich content is displaying on the lesson page!');
        
        // Check for interactive elements
        const hasQuiz = pageContent.includes('Knowledge Check');
        const hasTasks = pageContent.includes('Practical Tasks');
        const hasPlaceholders = pageContent.includes('{YOUR_INDUSTRY/MARKET}');
        
        console.log('\\n📊 RICH CONTENT VERIFICATION:');
        console.log(`   Interactive quiz: ${hasQuiz ? '✅' : '❌'}`);
        console.log(`   Practical tasks: ${hasTasks ? '✅' : '❌'}`);
        console.log(`   Customizable placeholders: ${hasPlaceholders ? '✅' : '❌'}`);
        
        if (hasQuiz && hasTasks && hasPlaceholders) {
          console.log('\\n🏆 PERFECT: All rich content is displaying correctly!');
        }
        
      } else if (pageContent.includes('Loading')) {
        console.log('⚠️  Page is still loading content...');
        console.log('📄 Page content preview:');
        console.log(pageContent.substring(0, 800));
        
      } else if (pageContent.includes('You need to enable JavaScript')) {
        console.log('❌ JavaScript not executing properly');
        console.log('📄 Page content:');
        console.log(pageContent.substring(0, 400));
        
      } else {
        console.log('❌ Rich content not displaying correctly');
        console.log('📄 Page content preview:');
        console.log(pageContent.substring(0, 1200));
      }
      
      // Test course page as well
      console.log('4️⃣ Testing course page...');
      const courseUrl = `http://localhost:3000/courses/${apiTest.courseId}`;
      console.log(`   Navigating to: ${courseUrl}`);
      
      await page.goto(courseUrl, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(3000);
      
      await page.screenshot({ 
        path: '/Users/thomasdowuona-hyde/AI-Masterclass/test-course-direct-url.png', 
        fullPage: true 
      });
      
      const coursePageContent = await page.locator('body').textContent();
      console.log(`   Course page length: ${coursePageContent.length}`);
      console.log(`   Contains course title: ${coursePageContent.includes(apiTest.courseTitle)}`);
      console.log(`   Contains lessons: ${coursePageContent.includes('Introduction')}`);
      
    } else {
      console.log('❌ API test failed:', apiTest.error);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\\n📸 Screenshots saved:');
    console.log('   - test-lesson-direct-url.png');
    console.log('   - test-course-direct-url.png');
  }
}

testFrontendRendering();