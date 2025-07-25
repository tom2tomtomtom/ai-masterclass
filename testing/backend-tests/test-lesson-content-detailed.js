// Test lesson content by navigating to specific lessons
const { chromium } = require('playwright');

async function testLessonContentDetailed() {
  console.log('🔍 Testing lesson content with detailed navigation...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 2000 });
  const page = await browser.newPage();

  try {
    // Navigate to the app
    console.log('📱 Navigating to app...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Check if we need to sign in
    const hasSignIn = await page.locator('input[type="email"]').count() > 0;
    
    if (hasSignIn) {
      console.log('🔐 Signing in...');
      await page.fill('input[type="email"]', 'test@gmail.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
    
    console.log('🏠 Looking for AI Fundamentals course...');
    
    // Look for AI Fundamentals course and click it
    const aiFundamentalsLink = page.locator('text=AI Fundamentals');
    const hasAIFundamentals = await aiFundamentalsLink.count() > 0;
    
    if (hasAIFundamentals) {
      console.log('✅ Found AI Fundamentals course, clicking...');
      await aiFundamentalsLink.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Take screenshot after clicking
      await page.screenshot({ path: '/Users/thomasdowuona-hyde/AI-Masterclass/debug-course-view.png', fullPage: true });
      
      // Look for lessons within the course
      console.log('🔍 Looking for lessons in course...');
      
      const bodyText = await page.locator('body').textContent();
      
      if (bodyText.includes('Debugging and Troubleshooting')) {
        console.log('✅ Found "Debugging and Troubleshooting" lesson!');
        
        // Click on the debugging lesson
        const debugLink = page.locator('text=Debugging and Troubleshooting');
        await debugLink.first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        // Take screenshot of lesson page
        await page.screenshot({ path: '/Users/thomasdowuona-hyde/AI-Masterclass/debug-lesson-page.png', fullPage: true });
        
        // Check the content
        const lessonContent = await page.locator('body').textContent();
        
        console.log('\n📚 LESSON CONTENT ANALYSIS:');
        console.log('='.repeat(60));
        
        if (lessonContent.includes('Debug Like a Pro')) {
          console.log('✅ EXCELLENT: Found "Debug Like a Pro" - Rich content is showing!');
        } else {
          console.log('❌ BAD: No "Debug Like a Pro" content found');
        }
        
        if (lessonContent.includes('Systematic Debug Framework')) {
          console.log('✅ EXCELLENT: Found "Systematic Debug Framework" prompt');
        } else {
          console.log('❌ BAD: No "Systematic Debug Framework" found');
        }
        
        if (lessonContent.includes('{DESCRIBE_YOUR_SPECIFIC_ISSUE}')) {
          console.log('✅ EXCELLENT: Found placeholder customization');
        } else {
          console.log('❌ BAD: No placeholder customization found');
        }
        
        if (lessonContent.includes('Copy-Paste Prompts')) {
          console.log('✅ EXCELLENT: Found copy-paste prompts section');
        } else {
          console.log('❌ BAD: No copy-paste prompts section');
        }
        
        if (lessonContent.includes('Knowledge Check')) {
          console.log('✅ EXCELLENT: Found knowledge check section');
        } else {
          console.log('❌ BAD: No knowledge check section');
        }
        
        if (lessonContent.includes('Practical Tasks')) {
          console.log('✅ EXCELLENT: Found practical tasks section');
        } else {
          console.log('❌ BAD: No practical tasks section');
        }
        
        // Show content preview
        console.log('\n📄 First 500 characters of lesson content:');
        console.log('-'.repeat(50));
        console.log(lessonContent.substring(0, 500) + '...');
        
      } else {
        console.log('❌ Could not find "Debugging and Troubleshooting" lesson in course');
        console.log('\n📋 Available content in course:');
        console.log(bodyText.substring(0, 1000));
      }
      
    } else {
      console.log('❌ Could not find AI Fundamentals course');
      
      // Try clicking on any course to see lessons
      console.log('🔍 Trying to click on any available course...');
      const anyCourse = page.locator('[class*="course"], [data-testid*="course"], .card').first();
      const hasAnyCourse = await anyCourse.count() > 0;
      
      if (hasAnyCourse) {
        await anyCourse.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        const courseContent = await page.locator('body').textContent();
        console.log('\n📋 Content after clicking course:');
        console.log(courseContent.substring(0, 1000));
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: '/Users/thomasdowuona-hyde/AI-Masterclass/debug-error-detailed.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testLessonContentDetailed();