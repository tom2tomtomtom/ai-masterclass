const https = require('https');
const { chromium } = require('playwright');

async function testPremiumContentAccess() {
  console.log('🎓 PREMIUM CONTENT ACCESS TEST');
  console.log('==============================');
  console.log('Target: Verify 206K+ words of premium content are accessible');
  console.log('Production URL: https://web-production-98afb.up.railway.app');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const contentTests = {
    basicAccess: false,
    courseCount: 0,
    lessonCount: 0,
    contentVolume: 0,
    premiumKeywords: [],
    errors: []
  };
  
  try {
    console.log('\n📚 Testing Course and Lesson Access...');
    console.log('─────────────────────────────────────');
    
    await page.goto('https://web-production-98afb.up.railway.app');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    contentTests.basicAccess = true;
    
    // Try to access courses
    const bodyText = await page.locator('body').textContent();
    contentTests.contentVolume = bodyText.split(/\s+/).length;
    
    console.log(`Total visible content: ${contentTests.contentVolume.toLocaleString()} words`);
    
    // Look for premium content indicators
    const premiumIndicators = [
      'Claude Mastery',
      'ChatGPT Professional', 
      'Advanced AI Techniques',
      'Problem-Solving Methodology',
      'Business Applications',
      '206K',
      'premium'
    ];
    
    contentTests.premiumKeywords = premiumIndicators.filter(keyword => 
      bodyText.toLowerCase().includes(keyword.toLowerCase())
    );
    
    console.log('Premium content indicators found:', contentTests.premiumKeywords.length);
    contentTests.premiumKeywords.forEach(keyword => 
      console.log(`  ✅ "${keyword}" detected`)
    );
    
    // Look for course elements
    const courseElements = await page.locator('[data-testid*="course"], .course, text=/course/i').count();
    const lessonElements = await page.locator('[data-testid*="lesson"], .lesson, text=/lesson/i').count();
    
    contentTests.courseCount = courseElements;
    contentTests.lessonCount = lessonElements;
    
    console.log(`Course elements found: ${courseElements}`);
    console.log(`Lesson elements found: ${lessonElements}`);
    
    // Try to access API directly
    console.log('\n🔌 Testing Direct API Access...');
    console.log('──────────────────────────────');
    
    const apiTests = [];
    
    // Test courses API
    try {
      await page.goto('https://web-production-98afb.up.railway.app/api/courses');
      const apiResponse = await page.locator('body').textContent();
      
      if (apiResponse.includes('"id"') || apiResponse.includes('courses')) {
        apiTests.push('✅ Courses API accessible');
        
        // Try to parse as JSON
        try {
          const coursesData = JSON.parse(apiResponse);
          if (Array.isArray(coursesData) || (coursesData.data && Array.isArray(coursesData.data))) {
            const courses = Array.isArray(coursesData) ? coursesData : coursesData.data;
            console.log(`✅ Found ${courses.length} courses in API`);
            contentTests.courseCount = Math.max(contentTests.courseCount, courses.length);
          }
        } catch (e) {
          console.log('⚠️  API response not JSON formatted');
        }
      } else {
        apiTests.push('❌ Courses API not accessible');
      }
    } catch (error) {
      apiTests.push('❌ Courses API error: ' + error.message);
      contentTests.errors.push('API access failed: ' + error.message);
    }
    
    apiTests.forEach(test => console.log('  ' + test));
    
  } catch (error) {
    console.error('❌ Test execution error:', error.message);
    contentTests.errors.push(error.message);
  }
  
  await browser.close();
  
  console.log('\n🎯 PREMIUM CONTENT TEST RESULTS');
  console.log('===============================');
  console.log(`Basic Access: ${contentTests.basicAccess ? '✅ Working' : '❌ Failed'}`);
  console.log(`Course Count: ${contentTests.courseCount}`);
  console.log(`Lesson Count: ${contentTests.lessonCount}`);
  console.log(`Content Volume: ${contentTests.contentVolume.toLocaleString()} words`);
  console.log(`Premium Keywords: ${contentTests.premiumKeywords.length}/7 found`);
  console.log(`Errors: ${contentTests.errors.length}`);
  
  // Determine if premium content is accessible
  const isPremiumAccessible = 
    contentTests.basicAccess && 
    contentTests.contentVolume > 5000 && 
    contentTests.premiumKeywords.length >= 3;
    
  console.log(`\n🏆 PREMIUM CONTENT STATUS: ${isPremiumAccessible ? '✅ ACCESSIBLE' : '❌ NEEDS SEEDING'}`);
  
  if (!isPremiumAccessible) {
    console.log('\n🔧 RECOMMENDED ACTIONS:');
    console.log('1. Deploy fixed seed-complete-courses.js to production');
    console.log('2. Run database seeding on Railway');
    console.log('3. Restart production services');
    console.log('4. Re-run this test');
  }
  
  return {
    success: isPremiumAccessible,
    details: contentTests
  };
}

testPremiumContentAccess().then(result => {
  console.log('\nTest completed:', new Date().toLocaleString());
  
  if (result.success) {
    console.log('🎉 Premium content is accessible! Ready for full user experience testing.');
  } else {
    console.log('🚨 Premium content needs to be seeded to production database.');
  }
}).catch(error => {
  console.error('Premium content test failed:', error);
});