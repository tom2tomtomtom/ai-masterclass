const { chromium } = require('playwright');

async function runComprehensiveTest() {
  console.log('🎯 COMPREHENSIVE PRODUCTION TEST');
  console.log('================================');
  console.log('Production URL: https://web-production-98afb.up.railway.app');
  console.log('Started:', new Date().toLocaleString());
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const testResults = {
    applicationLoad: false,
    courseContent: false,
    userInteraction: false,
    premiumContent: false,
    errors: [],
    successes: []
  };
  
  // Track console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      testResults.errors.push(msg.text());
    }
  });
  
  try {
    console.log('\n📱 TEST 1: Application Load');
    console.log('──────────────────────────');
    
    const startTime = Date.now();
    await page.goto('https://web-production-98afb.up.railway.app', { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    console.log(`✅ Page loaded in ${loadTime}ms`);
    testResults.applicationLoad = true;
    testResults.successes.push('Application loads successfully');
    
    // Take screenshot
    await page.screenshot({ path: '/Users/thomasdowuona-hyde/AI-Masterclass/production-test-screenshot.png', fullPage: true });
    console.log('✅ Screenshot saved');
    
    console.log('\n📚 TEST 2: Course Content Visibility');
    console.log('───────────────────────────────────');
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    // Check for course-related content
    const title = await page.title();
    console.log(`Page title: "${title}"`);
    
    const hasCoursesHeading = await page.locator('text=/courses/i').count() > 0;
    const hasAIContent = await page.locator('text=/AI/i').count() > 0;
    const hasLessonsContent = await page.locator('text=/lesson/i').count() > 0;
    
    console.log(`Course headings found: ${hasCoursesHeading}`);
    console.log(`AI content found: ${hasAIContent}`);
    console.log(`Lesson content found: ${hasLessonsContent}`);
    
    if (hasCoursesHeading || hasAIContent || hasLessonsContent) {
      testResults.courseContent = true;
      testResults.successes.push('Course content is visible');
      console.log('✅ Course content detected');
    } else {
      testResults.errors.push('No course content visible');
      console.log('❌ No course content detected');
    }
    
    console.log('\n🎯 TEST 3: Navigation and Interaction');
    console.log('────────────────────────────────────');
    
    // Look for clickable course elements
    const clickableElements = await page.locator('[role="button"], button, .course, .lesson').count();
    console.log(`Clickable elements found: ${clickableElements}`);
    
    if (clickableElements > 0) {
      testResults.userInteraction = true;
      testResults.successes.push('Interactive elements available');
      console.log('✅ Interactive elements detected');
    }
    
    console.log('\n📊 TEST 4: Content Volume Check');
    console.log('──────────────────────────────');
    
    const bodyText = await page.locator('body').textContent();
    const wordCount = bodyText.split(/\s+/).length;
    console.log(`Visible content word count: ${wordCount.toLocaleString()}`);
    
    // If we have substantial content, it suggests the premium content is loaded
    if (wordCount > 1000) {
      testResults.premiumContent = true;
      testResults.successes.push('Substantial content volume detected');
      console.log('✅ Substantial content volume detected');
    } else {
      testResults.errors.push('Low content volume - premium content may not be loaded');
      console.log('⚠️  Low content volume detected');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    testResults.errors.push(error.message);
  }
  
  await browser.close();
  
  console.log('\n🎯 TEST RESULTS SUMMARY');
  console.log('======================');
  console.log(`✅ Successes: ${testResults.successes.length}`);
  testResults.successes.forEach(success => console.log(`   - ${success}`));
  console.log(`❌ Errors: ${testResults.errors.length}`);
  testResults.errors.forEach(error => console.log(`   - ${error}`));
  
  const overallSuccess = testResults.applicationLoad && testResults.courseContent;
  console.log(`\n🎯 OVERALL STATUS: ${overallSuccess ? '✅ PASSING' : '❌ NEEDS ATTENTION'}`);
  
  return {
    success: overallSuccess,
    details: testResults
  };
}

runComprehensiveTest().then(result => {
  if (result.success) {
    console.log('\n🚀 Production deployment is working! Ready for full user testing.');
  } else {
    console.log('\n🔧 Issues detected. Deployment may need updates.');
  }
  console.log('\nTest completed:', new Date().toLocaleString());
}).catch(error => {
  console.error('Test execution failed:', error);
});