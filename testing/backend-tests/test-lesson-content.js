// Test what lesson content is actually showing in the UI
const { chromium } = require('playwright');

async function testLessonContent() {
  console.log('🔍 Testing lesson content display with Playwright...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();

  try {
    // Navigate to the app
    console.log('📱 Navigating to app...');
    await page.goto('http://localhost:3000');
    
    // Check if we need to sign in
    await page.waitForLoadState('networkidle');
    
    // Look for sign in form or dashboard
    const hasSignIn = await page.locator('input[type="email"]').count() > 0;
    
    if (hasSignIn) {
      console.log('🔐 Found sign-in form, logging in...');
      
      // Fill in test credentials
      await page.fill('input[type="email"]', 'test@gmail.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait for redirect
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
    
    console.log('🏠 Looking for lesson content...');
    
    // Look for lesson cards or navigation
    const lessonCards = await page.locator('.lesson-card, .course-card, [data-testid*="lesson"], [class*="lesson"]').count();
    console.log(`Found ${lessonCards} lesson elements`);
    
    // Take screenshot of current state
    await page.screenshot({ path: '/Users/thomasdowuona-hyde/AI-Masterclass/debug-current-state.png', fullPage: true });
    console.log('📸 Screenshot saved as debug-current-state.png');
    
    // Look for "Debugging and Troubleshooting Prompts" lesson specifically
    const debugLesson = page.locator('text=Debugging and Troubleshooting');
    const debugExists = await debugLesson.count() > 0;
    
    if (debugExists) {
      console.log('✅ Found "Debugging and Troubleshooting" lesson');
      
      // Click on it
      await debugLesson.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Check what content is displayed
      const contentText = await page.locator('body').textContent();
      
      console.log('📋 Current lesson content preview:');
      console.log('='.repeat(50));
      
      // Look for key indicators
      if (contentText.includes('Debug Like a Pro')) {
        console.log('✅ GOOD: Found proper rich content "Debug Like a Pro"');
      } else {
        console.log('❌ BAD: No "Debug Like a Pro" content found');
      }
      
      if (contentText.includes('Systematic Debug Framework')) {
        console.log('✅ GOOD: Found "Systematic Debug Framework" prompt');
      } else {
        console.log('❌ BAD: No "Systematic Debug Framework" prompt found');
      }
      
      if (contentText.includes('{DESCRIBE_YOUR_SPECIFIC_ISSUE}')) {
        console.log('✅ GOOD: Found placeholder customization');
      } else {
        console.log('❌ BAD: No placeholder customization found');
      }
      
      if (contentText.includes('summary') && contentText.length < 500) {
        console.log('❌ BAD: Still showing summary content only');
      }
      
      // Show first 500 characters of actual content
      console.log('\n📄 First 500 characters of displayed content:');
      console.log(contentText.substring(0, 500) + '...');
      
      await page.screenshot({ path: '/Users/thomasdowuona-hyde/AI-Masterclass/debug-lesson-content.png', fullPage: true });
      console.log('📸 Lesson content screenshot saved as debug-lesson-content.png');
      
    } else {
      console.log('❌ Could not find "Debugging and Troubleshooting" lesson');
      
      // List all visible text to see what lessons are available
      const allText = await page.locator('body').textContent();
      console.log('📄 All visible text:');
      console.log(allText.substring(0, 1000));
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: '/Users/thomasdowuona-hyde/AI-Masterclass/debug-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testLessonContent();