// Test the Google AI & Gemini Mastery course to see our rich content
const { chromium } = require('playwright');

async function testGoogleAICourse() {
  console.log('🔍 Testing Google AI & Gemini Mastery course...');
  
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
    
    console.log('🌐 Looking for Google AI & Gemini Mastery course...');
    
    // Look for Google AI course and click it
    const googleCourseLink = page.locator('text=Google AI & Gemini Mastery');
    const hasGoogleCourse = await googleCourseLink.count() > 0;
    
    if (hasGoogleCourse) {
      console.log('✅ Found Google AI & Gemini Mastery course, clicking...');
      await googleCourseLink.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Take screenshot after clicking
      await page.screenshot({ path: '/Users/thomasdowuona-hyde/AI-Masterclass/debug-google-course-view.png', fullPage: true });
      
      // Look for our specific lesson
      console.log('🔍 Looking for "Introduction to Google AI & Gemini" lesson...');
      
      const bodyText = await page.locator('body').textContent();
      
      if (bodyText.includes('Introduction to Google AI & Gemini')) {
        console.log('✅ Found "Introduction to Google AI & Gemini" lesson!');
        
        // Click on the lesson
        const lessonLink = page.locator('text=Introduction to Google AI & Gemini');
        await lessonLink.first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(4000);
        
        // Take screenshot of lesson page
        await page.screenshot({ path: '/Users/thomasdowuona-hyde/AI-Masterclass/debug-google-lesson-page.png', fullPage: true });
        
        // Check the content
        const lessonContent = await page.locator('body').textContent();
        
        console.log('\n📚 GOOGLE AI LESSON CONTENT ANALYSIS:');
        console.log('='.repeat(60));
        
        if (lessonContent.includes('Google AI & Gemini Mastery → Unlock Advanced AI Capabilities')) {
          console.log('✅ EXCELLENT: Found rich content header!');
        } else {
          console.log('❌ BAD: No rich content header found');
        }
        
        if (lessonContent.includes('Real-Time Market Research')) {
          console.log('✅ EXCELLENT: Found "Real-Time Market Research" prompt');
        } else {
          console.log('❌ BAD: No "Real-Time Market Research" prompt found');
        }
        
        if (lessonContent.includes('{YOUR_INDUSTRY/MARKET}')) {
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
        
        if (lessonContent.includes('What is Google AI/Gemini\'s biggest advantage')) {
          console.log('✅ EXCELLENT: Found Google AI quiz question');
        } else {
          console.log('❌ BAD: No Google AI quiz found');
        }
        
        if (lessonContent.includes('Google AI vs Competition Test')) {
          console.log('✅ EXCELLENT: Found practical task');
        } else {
          console.log('❌ BAD: No practical task found');
        }
        
        // Show content preview
        console.log('\n📄 First 800 characters of lesson content:');
        console.log('-'.repeat(50));
        console.log(lessonContent.substring(0, 800) + '...');
        
      } else {
        console.log('❌ Could not find "Introduction to Google AI & Gemini" lesson in course');
        console.log('\n📋 Available content in course:');
        console.log(bodyText.substring(0, 1000));
      }
      
    } else {
      console.log('❌ Could not find Google AI & Gemini Mastery course');
      
      // Show what courses are available
      const allText = await page.locator('body').textContent();
      console.log('\n📋 Available courses:');
      console.log(allText.substring(0, 1000));
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: '/Users/thomasdowuona-hyde/AI-Masterclass/debug-google-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testGoogleAICourse();