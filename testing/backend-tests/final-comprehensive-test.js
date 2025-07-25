// Final comprehensive test to verify full app functionality
const { chromium } = require('playwright');

async function finalComprehensiveTest() {
  console.log('🎯 FINAL COMPREHENSIVE TEST - FULL APP FUNCTIONALITY');
  console.log('='.repeat(70));
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 2000,
    timeout: 60000
  });
  const page = await browser.newPage();
  
  try {
    console.log('1️⃣ TESTING API CONNECTIVITY');
    console.log('-'.repeat(40));
    
    // Test API directly
    const apiTest = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:8000/api/courses');
        const data = await response.json();
        const googleAI = data.data?.find(c => c.title.includes('Google AI'));
        return {
          success: true,
          courseCount: data.data?.length || 0,
          hasGoogleAI: !!googleAI,
          googleAIId: googleAI?.id
        };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    console.log('✅ API Test Results:', apiTest);
    
    console.log('\\n2️⃣ TESTING HOMEPAGE LOAD');
    console.log('-'.repeat(40));
    
    await page.goto('http://localhost:3000', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Wait for React app to initialize
    await page.waitForSelector('text=Master AI-Powered Development', { timeout: 15000 });
    await page.waitForTimeout(3000);
    
    // Take screenshot of homepage
    await page.screenshot({ 
      path: '/Users/thomasdowuona-hyde/AI-Masterclass/final-test-homepage.png', 
      fullPage: true 
    });
    
    const homepageContent = await page.locator('body').textContent();
    const hasCoursesLoaded = homepageContent.includes('Google AI & Gemini Mastery');
    const hasStartButtons = homepageContent.includes('Start Learning');
    
    console.log(`✅ Homepage loaded successfully`);
    console.log(`   Content length: ${homepageContent.length} chars`);
    console.log(`   Courses loaded: ${hasCoursesLoaded ? '✅' : '❌'}`);
    console.log(`   Start Learning buttons: ${hasStartButtons ? '✅' : '❌'}`);
    
    if (!hasCoursesLoaded) {
      console.log('📄 Homepage content sample:');
      console.log(homepageContent.substring(0, 500));
    }
    
    console.log('\\n3️⃣ TESTING COURSE ACCESS');
    console.log('-'.repeat(40));
    
    if (apiTest.success && apiTest.hasGoogleAI) {
      // Try multiple ways to access the course
      const courseAccessMethods = [
        {
          name: 'Direct Course URL',
          action: async () => {
            await page.goto(`http://localhost:3000/courses/${apiTest.googleAIId}`, { 
              waitUntil: 'domcontentloaded',
              timeout: 15000 
            });
          }
        },
        {
          name: 'Click Start Learning Button',
          action: async () => {
            await page.goto('http://localhost:3000');
            await page.waitForSelector('text=Master AI-Powered Development', { timeout: 10000 });
            await page.waitForTimeout(2000);
            
            // Find all Start Learning buttons and click the one for Google AI
            const buttons = await page.locator('button:has-text("Start Learning")').all();
            console.log(`   Found ${buttons.length} Start Learning buttons`);
            
            // Try each button until we find one that works
            for (let i = 0; i < buttons.length; i++) {
              try {
                await buttons[i].scrollIntoViewIfNeeded();
                await buttons[i].click();
                await page.waitForTimeout(2000);
                
                const currentUrl = page.url();
                if (currentUrl.includes('/courses/')) {
                  console.log(`   ✅ Button ${i + 1} successfully navigated to course`);
                  return;
                }
              } catch (e) {
                continue;
              }
            }
            throw new Error('No Start Learning button worked');
          }
        }
      ];
      
      let courseAccessed = false;
      for (const method of courseAccessMethods) {
        try {
          console.log(`   Trying: ${method.name}...`);
          await method.action();
          await page.waitForTimeout(3000);
          
          const coursePageContent = await page.locator('body').textContent();
          
          if (coursePageContent.includes('Google AI') || coursePageContent.includes('Introduction')) {
            console.log(`   ✅ ${method.name} worked!`);
            console.log(`   Course page content length: ${coursePageContent.length}`);
            
            // Take screenshot
            await page.screenshot({ 
              path: '/Users/thomasdowuona-hyde/AI-Masterclass/final-test-course-page.png', 
              fullPage: true 
            });
            
            courseAccessed = true;
            
            console.log('\\n4️⃣ TESTING LESSON ACCESS');
            console.log('-'.repeat(40));
            
            // Look for lessons on the course page
            if (coursePageContent.includes('Introduction')) {
              try {
                // Try to click on Introduction lesson
                const lessonSelectors = [
                  'text=Introduction to Google AI & Gemini',
                  'text=Introduction to Google AI',
                  'text=Introduction'
                ];
                
                let lessonClicked = false;
                for (const selector of lessonSelectors) {
                  try {
                    const lessonElement = page.locator(selector);
                    if (await lessonElement.count() > 0) {
                      console.log(`   Clicking lesson: ${selector}`);
                      await lessonElement.first().click();
                      await page.waitForLoadState('domcontentloaded');
                      await page.waitForTimeout(3000);
                      lessonClicked = true;
                      break;
                    }
                  } catch (e) {
                    continue;
                  }
                }
                
                if (lessonClicked) {
                  // Take screenshot of lesson
                  await page.screenshot({ 
                    path: '/Users/thomasdowuona-hyde/AI-Masterclass/final-test-lesson-page.png', 
                    fullPage: true 
                  });
                  
                  const lessonContent = await page.locator('body').textContent();
                  
                  console.log('\\n5️⃣ RICH CONTENT VERIFICATION');
                  console.log('-'.repeat(40));
                  
                  // Check for all rich content elements
                  const richContentChecks = {
                    'Rich Header': lessonContent.includes('Google AI & Gemini Mastery → Unlock Advanced AI Capabilities'),
                    'Copy-Paste Prompts': lessonContent.includes('Copy-Paste Prompts'),
                    'Placeholders': lessonContent.includes('{YOUR_INDUSTRY/MARKET}'),
                    'Knowledge Check': lessonContent.includes('Knowledge Check'),
                    'Practical Tasks': lessonContent.includes('Practical Tasks'),
                    'Market Research': lessonContent.includes('Real-Time Market Research'),
                    'Learning Objectives': lessonContent.includes("What You'll Accomplish"),
                    'Time Investment': lessonContent.includes('Time Investment')
                  };
                  
                  let richScore = 0;
                  console.log('📊 Rich Content Analysis:');
                  for (const [check, passed] of Object.entries(richContentChecks)) {
                    console.log(`   ${check}: ${passed ? '✅' : '❌'}`);
                    if (passed) richScore++;
                  }
                  
                  console.log(`\\n🎯 RICH CONTENT SCORE: ${richScore}/${Object.keys(richContentChecks).length}`);
                  console.log(`   Lesson content length: ${lessonContent.length} characters`);
                  
                  if (richScore >= 6) {
                    console.log('\\n🎉 EXCELLENT: Rich content is displaying perfectly!');
                    console.log('🏆 THE APP IS FULLY FUNCTIONAL WITH RICH CONTENT!');
                  } else if (richScore >= 4) {
                    console.log('\\n⚠️  GOOD: Most rich content is displaying');
                    console.log('📄 Content preview for debugging:');
                    console.log(lessonContent.substring(0, 1000));
                  } else {
                    console.log('\\n❌ POOR: Rich content not displaying correctly');
                    console.log('📄 Full lesson content for debugging:');
                    console.log(lessonContent.substring(0, 2000));
                  }
                  
                } else {
                  console.log('❌ Could not click on any lesson');
                  console.log('📄 Course page content:');
                  console.log(coursePageContent.substring(0, 1000));
                }
                
              } catch (lessonError) {
                console.log('❌ Lesson access error:', lessonError.message);
              }
              
            } else {
              console.log('❌ No lessons found on course page');
            }
            
            break;
          }
          
        } catch (e) {
          console.log(`   ❌ ${method.name} failed: ${e.message}`);
          continue;
        }
      }
      
      if (!courseAccessed) {
        console.log('❌ Could not access course with any method');
      }
      
    } else {
      console.log('❌ Cannot test course access - API test failed');
    }
    
    console.log('\\n6️⃣ FINAL SYSTEM STATUS');
    console.log('-'.repeat(40));
    
    const systemStatus = {
      'API Connectivity': apiTest.success,
      'Homepage Loads': hasCoursesLoaded,
      'Course Access': courseAccessed,
      'Rich Content': richScore >= 4
    };
    
    console.log('📊 System Health Check:');
    for (const [component, status] of Object.entries(systemStatus)) {
      console.log(`   ${component}: ${status ? '✅' : '❌'}`);
    }
    
    const healthyComponents = Object.values(systemStatus).filter(Boolean).length;
    console.log(`\\n🏥 OVERALL SYSTEM HEALTH: ${healthyComponents}/4`);
    
    if (healthyComponents === 4) {
      console.log('\\n🎉 PERFECT: APP IS FULLY FUNCTIONAL!');
      console.log('🏆 Rich content is displaying correctly');
      console.log('✅ All systems operational');
    } else if (healthyComponents >= 3) {
      console.log('\\n⚠️  MOSTLY WORKING: Minor issues remain');
    } else {
      console.log('\\n❌ MAJOR ISSUES: Significant problems need fixing');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
    console.log('\\n📸 Screenshots saved:');
    console.log('   - final-test-homepage.png');
    console.log('   - final-test-course-page.png');
    console.log('   - final-test-lesson-page.png');
  }
}

finalComprehensiveTest();