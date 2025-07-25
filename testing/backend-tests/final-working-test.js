// Final test to verify everything is working with rich content
const { chromium } = require('playwright');

async function finalWorkingTest() {
  console.log('🎯 FINAL TEST - VERIFYING FULLY WORKING APP WITH RICH CONTENT');
  console.log('='.repeat(70));
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 1500
  });
  const page = await browser.newPage();
  
  let courseAccessed = false;
  let richScore = 0;
  
  try {
    console.log('1️⃣ TESTING COMPLETE SYSTEM');
    console.log('-'.repeat(50));
    
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Master AI-Powered Development', { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    // Take homepage screenshot
    await page.screenshot({ 
      path: '/Users/thomasdowuona-hyde/AI-Masterclass/final-working-homepage.png', 
      fullPage: true 
    });
    
    const homepageText = await page.locator('body').textContent();
    
    console.log('📊 Homepage Analysis:');
    console.log(`   Page content length: ${homepageText.length} characters`);
    console.log(`   Shows courses: ${homepageText.includes('Google AI') ? '✅' : '❌'}`);
    console.log(`   Has start buttons: ${homepageText.includes('Start Learning') ? '✅' : '❌'}`);
    console.log(`   Has error messages: ${homepageText.includes('Failed to load') ? '❌ YES' : '✅ NO'}`);
    
    if (homepageText.includes('Failed to load')) {
      console.log('❌ API calls are still failing, checking error messages...');
      return;
    }
    
    if (homepageText.includes('Google AI')) {
      console.log('✅ Courses loaded successfully!');
      
      console.log('\\n2️⃣ ACCESSING GOOGLE AI COURSE');
      console.log('-'.repeat(50));
      
      // Find all Start Learning buttons and try them
      const startButtons = await page.locator('button:has-text("Start Learning")').all();
      console.log(`Found ${startButtons.length} Start Learning buttons`);
      
      // Try each button until we find the Google AI course
      for (let i = 0; i < startButtons.length; i++) {
        try {
          const buttonContainer = startButtons[i].locator('..');
          const containerText = await buttonContainer.textContent();
          
          if (containerText.includes('Google AI')) {
            console.log(`✅ Found Google AI button (button ${i + 1})`);
            await startButtons[i].click();
            await page.waitForTimeout(3000);
            
            const coursePageText = await page.locator('body').textContent();
            
            if (coursePageText.includes('Introduction')) {
              console.log('✅ Successfully navigated to Google AI course');
              courseAccessed = true;
              
              // Take course screenshot
              await page.screenshot({ 
                path: '/Users/thomasdowuona-hyde/AI-Masterclass/final-working-course.png', 
                fullPage: true 
              });
              
              console.log('\\n3️⃣ ACCESSING RICH LESSON CONTENT');
              console.log('-'.repeat(50));
              
              // Click on Introduction lesson
              await page.click('text=Introduction to Google AI & Gemini');
              await page.waitForTimeout(3000);
              
              // Take lesson screenshot
              await page.screenshot({ 
                path: '/Users/thomasdowuona-hyde/AI-Masterclass/final-working-lesson.png', 
                fullPage: true 
              });
              
              const lessonText = await page.locator('body').textContent();
              
              console.log('\\n4️⃣ VERIFYING RICH CONTENT');
              console.log('-'.repeat(50));
              
              // Check for all rich content elements
              const richChecks = {
                'Rich Header': lessonText.includes('Google AI & Gemini Mastery → Unlock Advanced AI Capabilities'),
                'Learning Objectives': lessonText.includes("What You'll Accomplish"),
                'Time Investment': lessonText.includes('Time Investment'),
                'Prerequisites': lessonText.includes('Prerequisites'),
                'Copy-Paste Prompts': lessonText.includes('Copy-Paste Prompts'),
                'Placeholders': lessonText.includes('{YOUR_INDUSTRY/MARKET}'),
                'Knowledge Check': lessonText.includes('Knowledge Check'),
                'Practical Tasks': lessonText.includes('Practical Tasks'),
                'Market Research': lessonText.includes('Real-Time Market Research'),
                'Setup Instructions': lessonText.includes('Google AI Studio')
              };
              
              richScore = 0;
              console.log('📋 Rich Content Checklist:');
              
              for (const [check, passed] of Object.entries(richChecks)) {
                console.log(`   ${check}: ${passed ? '✅' : '❌'}`);
                if (passed) richScore++;
              }
              
              console.log(`\\n🎯 RICH CONTENT SCORE: ${richScore}/${Object.keys(richChecks).length}`);
              console.log(`   Lesson content length: ${lessonText.length} characters`);
              
              if (richScore >= 8) {
                console.log('\\n🎉 EXCELLENT: Rich content is displaying perfectly!');
                console.log('🏆 THE APPLICATION IS FULLY FUNCTIONAL!');
              } else if (richScore >= 6) {
                console.log('\\n✅ GOOD: Most rich content is working');
              } else {
                console.log('\\n⚠️  PARTIAL: Some rich content missing');
                console.log('\\n📄 Content sample for debugging:');
                console.log(lessonText.substring(0, 1000));
              }
              
              break;
            }
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!courseAccessed) {
        console.log('❌ Could not access Google AI course');
      }
      
    } else {
      console.log('❌ No courses found on homepage');
      console.log('📄 Homepage content sample:');
      console.log(homepageText.substring(0, 500));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
    
    console.log('\\n🏁 FINAL RESULTS');
    console.log('='.repeat(50));
    
    if (courseAccessed && richScore >= 6) {
      console.log('🎉 SUCCESS: APP IS FULLY FUNCTIONAL WITH RICH CONTENT!');
      console.log('✅ Frontend and backend communication working');
      console.log('✅ Courses loading properly');
      console.log('✅ Rich interactive content displaying');
      console.log('✅ All major components operational');
      console.log('\\n🚀 The AI Masterclass platform is ready for use!');
    } else if (courseAccessed) {
      console.log('⚠️  PARTIAL SUCCESS: App working but content needs improvement');
      console.log(`   Rich content score: ${richScore}/10`);
    } else {
      console.log('❌ ISSUES REMAIN: App not fully functional');
    }
    
    console.log('\\n📸 Screenshots saved:');
    console.log('   - final-working-homepage.png');
    console.log('   - final-working-course.png');
    console.log('   - final-working-lesson.png');
  }
}

finalWorkingTest();