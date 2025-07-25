const { chromium } = require('playwright');

async function validateFinalDeployment() {
  console.log('🎯 FINAL DEPLOYMENT VALIDATION');
  console.log('==============================');
  console.log('Production URL: https://web-production-98afb.up.railway.app');
  console.log('Goal: Verify 206K+ words premium content is accessible');
  console.log('Started:', new Date().toLocaleString());
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 }); // Visible browser for demonstration
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const validationResults = {
    platformAccess: false,
    courseContent: false,
    premiumContent: false,
    userExperience: false,
    contentVolume: 0,
    coursesFound: 0,
    lessonsFound: 0,
    premiumIndicators: [],
    errors: [],
    successes: []
  };
  
  // Track all console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      validationResults.errors.push('Console Error: ' + msg.text());
    }
  });
  
  try {
    console.log('\n🌐 STEP 1: Platform Access Test');
    console.log('═══════════════════════════════');
    
    const startTime = Date.now();
    await page.goto('https://web-production-98afb.up.railway.app');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    validationResults.platformAccess = true;
    validationResults.successes.push(`Platform loads in ${loadTime}ms`);
    console.log(`✅ Platform accessible - loaded in ${loadTime}ms`);
    
    // Take initial screenshot
    await page.screenshot({ path: '/Users/thomasdowuona-hyde/AI-Masterclass/final-validation-01-homepage.png', fullPage: true });
    console.log('📷 Homepage screenshot saved');
    
    console.log('\n📚 STEP 2: Content Volume Analysis');
    console.log('══════════════════════════════════');
    
    // Wait for content to fully load
    await page.waitForTimeout(5000);
    
    const bodyText = await page.locator('body').textContent();
    const words = bodyText.split(/\s+/).filter(word => word.length > 0);
    validationResults.contentVolume = words.length;
    
    console.log(`📊 Total content volume: ${validationResults.contentVolume.toLocaleString()} words`);
    
    if (validationResults.contentVolume >= 5000) {
      validationResults.courseContent = true;
      validationResults.successes.push(`Substantial content volume: ${validationResults.contentVolume.toLocaleString()} words`);
      console.log('✅ Substantial content volume detected');
    } else {
      validationResults.errors.push('Low content volume - may indicate seeding issues');
      console.log('⚠️  Low content volume - may indicate seeding issues');
    }
    
    console.log('\n🎓 STEP 3: Premium Content Detection');
    console.log('═══════════════════════════════════');
    
    // Look for premium content indicators
    const premiumKeywords = [
      'Claude Mastery',
      'ChatGPT Professional',
      'Advanced AI Techniques', 
      'Problem-Solving Methodology',
      'Business Applications',
      'AI Fundamentals',
      'Automation Workflows'
    ];
    
    for (const keyword of premiumKeywords) {
      if (bodyText.toLowerCase().includes(keyword.toLowerCase())) {
        validationResults.premiumIndicators.push(keyword);
        console.log(`  ✅ Found: "${keyword}"`);
      } else {
        console.log(`  ❌ Missing: "${keyword}"`);
      }
    }
    
    const premiumPercentage = (validationResults.premiumIndicators.length / premiumKeywords.length) * 100;
    console.log(`📈 Premium content detection: ${premiumPercentage.toFixed(1)}% (${validationResults.premiumIndicators.length}/${premiumKeywords.length})`);
    
    if (validationResults.premiumIndicators.length >= 4) {
      validationResults.premiumContent = true;
      validationResults.successes.push(`Premium content detected: ${validationResults.premiumIndicators.length} indicators`);
      console.log('✅ Premium content successfully detected');
    } else {
      validationResults.errors.push('Insufficient premium content indicators - database seeding may be incomplete');
      console.log('❌ Insufficient premium content - database seeding may be incomplete');
    }
    
    console.log('\n🖱️  STEP 4: User Experience Testing');
    console.log('══════════════════════════════════');
    
    // Look for interactive elements
    const buttons = await page.locator('button, [role="button"]').count();
    const links = await page.locator('a[href]').count();
    const courseElements = await page.locator('[class*="course"], [data-testid*="course"]').count();
    
    validationResults.coursesFound = courseElements;
    
    console.log(`🎯 Interactive elements found:`);
    console.log(`   Buttons: ${buttons}`);
    console.log(`   Links: ${links}`);
    console.log(`   Course elements: ${courseElements}`);
    
    if (buttons > 0 && links > 0) {
      validationResults.userExperience = true;
      validationResults.successes.push('Interactive user interface elements present');
      console.log('✅ Interactive elements detected');
    }
    
    // Try to find and click on a course
    try {
      const firstCourse = page.locator('text=/course/i, [class*="course"], [data-testid*="course"]').first();
      if (await firstCourse.count() > 0) {
        console.log('🎯 Testing course navigation...');
        await firstCourse.click();
        await page.waitForTimeout(3000);
        
        // Take screenshot of course detail
        await page.screenshot({ path: '/Users/thomasdowuona-hyde/AI-Masterclass/final-validation-02-course-detail.png', fullPage: true });
        console.log('📷 Course detail screenshot saved');
        
        // Check if lesson content is visible
        const lessonElements = await page.locator('text=/lesson/i, [class*="lesson"], [data-testid*="lesson"]').count();
        validationResults.lessonsFound = lessonElements;
        
        if (lessonElements > 0) {
          validationResults.successes.push(`Course navigation working - ${lessonElements} lessons found`);
          console.log(`✅ Course navigation working - ${lessonElements} lessons found`);
        }
      }
    } catch (navError) {
      validationResults.errors.push('Course navigation test failed: ' + navError.message);
      console.log('⚠️  Course navigation test failed:', navError.message);
    }
    
    console.log('\n🔍 STEP 5: API Endpoint Testing');
    console.log('════════════════════════════════');
    
    // Test API endpoints
    try {
      await page.goto('https://web-production-98afb.up.railway.app/api/courses');
      const apiResponse = await page.locator('body').textContent();
      
      if (apiResponse.includes('id') || apiResponse.includes('title') || apiResponse.includes('course')) {
        validationResults.successes.push('API endpoints responding');
        console.log('✅ API endpoints responding');
        
        // Try to count courses in API response
        try {
          const apiData = JSON.parse(apiResponse);
          const courseCount = Array.isArray(apiData) ? apiData.length : (apiData.data ? apiData.data.length : 0);
          if (courseCount > 0) {
            validationResults.coursesFound = Math.max(validationResults.coursesFound, courseCount);
            console.log(`✅ API reports ${courseCount} courses available`);
          }
        } catch (e) {
          console.log('ℹ️  API response format varies from standard JSON');
        }
      } else {
        validationResults.errors.push('API endpoints may not be functioning correctly');
        console.log('❌ API endpoints may not be functioning correctly');
      }
    } catch (apiError) {
      validationResults.errors.push('API testing failed: ' + apiError.message);
      console.log('❌ API testing failed:', apiError.message);
    }
    
  } catch (error) {
    validationResults.errors.push('Critical validation error: ' + error.message);
    console.log('❌ Critical validation error:', error.message);
  }
  
  await browser.close();
  
  // FINAL ASSESSMENT
  console.log('\n🎯 FINAL DEPLOYMENT VALIDATION RESULTS');
  console.log('═════════════════════════════════════');
  
  const overallScore = [
    validationResults.platformAccess,
    validationResults.courseContent,
    validationResults.premiumContent,
    validationResults.userExperience
  ].filter(Boolean).length;
  
  console.log('📊 VALIDATION SUMMARY:');
  console.log(`   Platform Access: ${validationResults.platformAccess ? '✅' : '❌'}`);
  console.log(`   Course Content: ${validationResults.courseContent ? '✅' : '❌'}`);
  console.log(`   Premium Content: ${validationResults.premiumContent ? '✅' : '❌'}`);
  console.log(`   User Experience: ${validationResults.userExperience ? '✅' : '❌'}`);
  console.log(`   Content Volume: ${validationResults.contentVolume.toLocaleString()} words`);
  console.log(`   Courses Found: ${validationResults.coursesFound}`);
  console.log(`   Lessons Found: ${validationResults.lessonsFound}`);
  console.log(`   Premium Indicators: ${validationResults.premiumIndicators.length}/7`);
  
  console.log('\n✅ SUCCESSES:');
  validationResults.successes.forEach(success => console.log(`   ✅ ${success}`));
  
  if (validationResults.errors.length > 0) {
    console.log('\n❌ ISSUES DETECTED:');
    validationResults.errors.forEach(error => console.log(`   ❌ ${error}`));
  }
  
  const isFullyOperational = overallScore === 4 && validationResults.contentVolume > 5000;
  
  console.log(`\n🏆 OVERALL STATUS: ${isFullyOperational ? '✅ FULLY OPERATIONAL' : '⚠️  NEEDS ATTENTION'}`);
  console.log(`📊 Validation Score: ${overallScore}/4`);
  
  if (isFullyOperational) {
    console.log('\n🎉 DEPLOYMENT VALIDATION SUCCESSFUL!');
    console.log('🌟 The AI Masterclass platform is fully operational with premium content');
    console.log('📚 206K+ words of educational content should now be accessible');
    console.log('👥 Ready for full user experience testing');
  } else {
    console.log('\n🔧 DEPLOYMENT NEEDS ATTENTION:');
    console.log('1. Verify git changes were pushed to GitHub');
    console.log('2. Confirm Railway deployment completed successfully'); 
    console.log('3. Run database seeding: node backend/seed-complete-courses.js');
    console.log('4. Check Railway application logs for errors');
    console.log('5. Re-run this validation after fixes');
  }
  
  console.log('\nValidation completed:', new Date().toLocaleString());
  return isFullyOperational;
}

// Run the validation
validateFinalDeployment().then(success => {
  console.log(`\n🏁 Final Result: ${success ? 'SUCCESS' : 'NEEDS WORK'}`);
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Validation failed:', error);
  process.exit(1);
});