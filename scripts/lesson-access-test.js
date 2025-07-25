const { chromium } = require('playwright');

async function testLessonAccess() {
  console.log('🎓 LESSON ACCESS TEST WITH PLAYWRIGHT');
  console.log('=====================================\n');

  let browser;
  let page;

  try {
    // Launch browser
    console.log('🚀 Launching browser...');
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 500 // Slow down for visibility
    });
    
    page = await browser.newPage();
    
    // Set up console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ BROWSER ERROR: ${msg.text()}`);
      } else if (msg.type() === 'warning') {
        console.log(`⚠️  BROWSER WARNING: ${msg.text()}`);
      }
    });
    
    // Set up error logging
    page.on('pageerror', error => {
      console.log(`💥 BROWSER CRASH: ${error.message}`);
    });
    
    // Set up network monitoring
    const apiRequests = [];
    page.on('request', request => {
      if (request.url().includes('localhost:8000')) {
        apiRequests.push({
          method: request.method(),
          url: request.url(),
          timestamp: Date.now()
        });
        console.log(`📡 API REQUEST: ${request.method()} ${request.url()}`);
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('localhost:8000')) {
        const status = response.status();
        const url = response.url();
        if (status >= 400) {
          console.log(`❌ API FAILED: ${status} ${url}`);
        } else {
          console.log(`✅ API SUCCESS: ${status} ${url}`);
        }
      }
    });

    // Step 1: Navigate to frontend
    console.log('🌐 Step 1: Navigating to frontend...');
    await page.goto('http://localhost:3001', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for page to load
    await page.waitForTimeout(3000);
    console.log('✅ Frontend loaded successfully');

    // Step 2: Look for course cards/links
    console.log('\n📚 Step 2: Looking for course cards...');
    
    const courseSelectors = [
      'a[href*="course"]',
      'a[href*="module"]', 
      '.course-card a',
      '.course-item a',
      '.module a',
      '[data-testid="course-link"]'
    ];
    
    let courseLinks = [];
    let foundSelector = null;
    
    for (const selector of courseSelectors) {
      const links = await page.$$(selector);
      if (links.length > 0) {
        courseLinks = links;
        foundSelector = selector;
        console.log(`✅ Found ${links.length} course links using selector: ${selector}`);
        break;
      }
    }
    
    if (courseLinks.length === 0) {
      console.log('⚠️ No course links found, looking for clickable course elements...');
      
      // Try to find any clickable elements with course-related text
      const courseTexts = ['vibe', 'coding', 'fundamentals', 'AI', 'course', 'lesson'];
      for (const text of courseTexts) {
        const elements = await page.$$(`text=${text}`);
        if (elements.length > 0) {
          console.log(`✅ Found ${elements.length} elements with text: "${text}"`);
          // Check if any are clickable
          for (const element of elements.slice(0, 3)) {
            const tagName = await element.evaluate(el => el.tagName.toLowerCase());
            const isClickable = await element.evaluate(el => 
              el.onclick || el.href || el.getAttribute('role') === 'button'
            );
            if (tagName === 'a' || tagName === 'button' || isClickable) {
              courseLinks.push(element);
              console.log(`✅ Found clickable element: ${tagName}`);
            }
          }
        }
      }
    }

    // Step 3: Try to access a course
    if (courseLinks.length > 0) {
      console.log(`\n🎯 Step 3: Attempting to access course (found ${courseLinks.length} options)...`);
      
      // Try the first few course links
      for (let i = 0; i < Math.min(3, courseLinks.length); i++) {
        try {
          console.log(`\n🔄 Trying course link ${i + 1}...`);
          
          // Get link details
          const linkText = await courseLinks[i].evaluate(el => el.textContent?.trim() || '');
          const linkHref = await courseLinks[i].evaluate(el => el.href || el.getAttribute('href') || '');
          
          console.log(`📝 Link text: "${linkText}"`);
          console.log(`🔗 Link href: "${linkHref}"`);
          
          // Click the link
          await courseLinks[i].click();
          
          // Wait for navigation
          await page.waitForTimeout(3000);
          
          const currentUrl = page.url();
          console.log(`📍 Navigated to: ${currentUrl}`);
          
          // Check if we're on a course/lesson page
          if (currentUrl.includes('course') || currentUrl.includes('module') || currentUrl.includes('lesson')) {
            console.log('✅ Successfully navigated to course/lesson page!');
            
            // Step 4: Look for lesson content
            console.log('\n📖 Step 4: Looking for lesson content...');
            
            await page.waitForTimeout(2000);
            
            // Check for lesson-related elements
            const lessonSelectors = [
              '.lesson-content',
              '.course-content',
              '.module-content',
              '.content',
              'main',
              '[data-testid="lesson"]',
              '.lesson',
              '.markdown-content'
            ];
            
            let foundContent = false;
            for (const selector of lessonSelectors) {
              const content = await page.$(selector);
              if (content) {
                const contentText = await content.textContent();
                if (contentText && contentText.length > 100) {
                  console.log(`✅ Found lesson content using: ${selector}`);
                  console.log(`📄 Content preview: "${contentText.substring(0, 200)}..."`);
                  foundContent = true;
                  break;
                }
              }
            }
            
            if (!foundContent) {
              console.log('⚠️ No substantial lesson content found');
              
              // Check for any text content on the page
              const bodyText = await page.textContent('body');
              if (bodyText && bodyText.length > 200) {
                console.log(`📄 Page content preview: "${bodyText.substring(0, 300)}..."`);
              }
            }
            
            // Step 5: Look for lesson navigation
            console.log('\n🧭 Step 5: Looking for lesson navigation...');
            
            const navSelectors = [
              '.lesson-nav',
              '.course-nav',
              '.next-lesson',
              '.prev-lesson',
              'nav',
              '.navigation',
              '[data-testid="lesson-nav"]'
            ];
            
            for (const selector of navSelectors) {
              const nav = await page.$(selector);
              if (nav) {
                console.log(`✅ Found navigation using: ${selector}`);
                
                // Look for next/previous buttons
                const nextBtn = await page.$('button:has-text("Next"), a:has-text("Next"), .next');
                const prevBtn = await page.$('button:has-text("Previous"), a:has-text("Previous"), .prev');
                
                if (nextBtn) console.log('✅ Found "Next" button');
                if (prevBtn) console.log('✅ Found "Previous" button');
                
                break;
              }
            }
            
            // Step 6: Try to access lesson list/modules
            console.log('\n📋 Step 6: Looking for lesson list...');
            
            const lessonListSelectors = [
              '.lesson-list',
              '.module-list',
              '.course-outline',
              '.lessons',
              '.modules',
              'ul li a',
              '[data-testid="lesson-list"]'
            ];
            
            for (const selector of lessonListSelectors) {
              const lessonList = await page.$$(selector);
              if (lessonList.length > 0) {
                console.log(`✅ Found ${lessonList.length} lesson items using: ${selector}`);
                
                // Try to click on a lesson
                if (lessonList.length > 1) {
                  console.log('🔄 Trying to access another lesson...');
                  try {
                    await lessonList[1].click();
                    await page.waitForTimeout(2000);
                    
                    const newUrl = page.url();
                    console.log(`📍 Navigated to lesson: ${newUrl}`);
                    
                    // Check for lesson content again
                    const lessonContent = await page.$('.lesson-content, .content, main');
                    if (lessonContent) {
                      const contentText = await lessonContent.textContent();
                      if (contentText && contentText.length > 100) {
                        console.log('✅ Successfully accessed lesson content!');
                        console.log(`📄 Lesson preview: "${contentText.substring(0, 200)}..."`);
                      }
                    }
                  } catch (error) {
                    console.log(`⚠️ Could not access additional lesson: ${error.message}`);
                  }
                }
                break;
              }
            }
            
            break; // Exit the course link loop since we found a working one
            
          } else {
            console.log('⚠️ Did not navigate to a course/lesson page');
            // Go back to try next link
            await page.goBack();
            await page.waitForTimeout(1000);
          }
          
        } catch (error) {
          console.log(`❌ Error accessing course ${i + 1}: ${error.message}`);
          // Try to go back to main page
          try {
            await page.goto('http://localhost:3001');
            await page.waitForTimeout(2000);
          } catch (backError) {
            console.log(`❌ Could not return to main page: ${backError.message}`);
          }
        }
      }
    } else {
      console.log('❌ No course links found to test');
    }

    // Step 7: Test direct API access to lessons
    console.log('\n🔌 Step 7: Testing direct API access to lessons...');
    
    try {
      // Test modules API
      const modulesResponse = await page.evaluate(async () => {
        const response = await fetch('http://localhost:8000/api/modules');
        return {
          status: response.status,
          data: await response.json()
        };
      });
      
      console.log(`📊 Modules API: ${modulesResponse.status}`);
      if (modulesResponse.data && modulesResponse.data.length > 0) {
        console.log(`✅ Found ${modulesResponse.data.length} modules via API`);
        
        // Try to get lessons for first module
        const firstModuleId = modulesResponse.data[0].id;
        console.log(`🔍 Testing lessons for module ID: ${firstModuleId}`);
        
        const lessonsResponse = await page.evaluate(async (moduleId) => {
          const response = await fetch(`http://localhost:8000/api/modules/${moduleId}/lessons`);
          return {
            status: response.status,
            data: await response.json()
          };
        }, firstModuleId);
        
        console.log(`📚 Lessons API: ${lessonsResponse.status}`);
        if (lessonsResponse.data && lessonsResponse.data.length > 0) {
          console.log(`✅ Found ${lessonsResponse.data.length} lessons for module ${firstModuleId}`);
          console.log(`📝 First lesson: "${lessonsResponse.data[0].title}"`);
        }
      }
      
    } catch (error) {
      console.log(`❌ API test failed: ${error.message}`);
    }

    // Final summary
    console.log('\n📊 LESSON ACCESS TEST SUMMARY');
    console.log('==============================');
    console.log(`📡 Total API requests made: ${apiRequests.length}`);
    console.log(`🔗 Course links found: ${courseLinks.length}`);
    
    if (apiRequests.length > 0) {
      console.log('✅ API communication working');
    }
    
    if (courseLinks.length > 0) {
      console.log('✅ Course navigation available');
    }
    
    console.log('\n🎯 RECOMMENDATIONS:');
    console.log('- Check if lesson content is properly loading');
    console.log('- Verify lesson navigation between modules');
    console.log('- Test lesson content rendering (markdown, code blocks, etc.)');
    console.log('- Ensure lesson progress tracking works');

    // Keep browser open for manual inspection
    console.log('\n🔍 Browser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the lesson access tests
testLessonAccess().then(() => {
  console.log('\n🎉 Lesson access tests completed!');
}).catch(error => {
  console.error('❌ Test suite failed:', error);
});
