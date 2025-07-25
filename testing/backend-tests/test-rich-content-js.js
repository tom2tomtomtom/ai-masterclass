// Test rich content with proper JS handling
const { chromium } = require('playwright');

async function testRichContentJS() {
  console.log('🎯 TESTING RICH CONTENT ACCESS (JavaScript Enabled)');
  console.log('='.repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 2000,
    args: ['--enable-javascript']
  });
  const page = await browser.newPage();
  
  try {
    console.log('1️⃣ Loading homepage and waiting for React to load...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Wait for React app to load by waiting for specific content
    await page.waitForSelector('text=Master AI-Powered Development', { timeout: 10000 });
    await page.waitForTimeout(5000); // Extra wait for dynamic content
    
    // Take initial screenshot
    await page.screenshot({ 
      path: '/Users/thomasdowuona-hyde/AI-Masterclass/test-homepage.png', 
      fullPage: true 
    });
    
    console.log('2️⃣ Checking if courses are loaded...');
    const bodyText = await page.locator('body').textContent();
    
    if (bodyText.includes('Google AI & Gemini Mastery')) {
      console.log('✅ Courses are loaded, looking for Google AI course...');
      
      // Wait for and click the specific "Start Learning" button for Google AI
      await page.waitForSelector('text=Google AI & Gemini Mastery', { timeout: 5000 });
      
      // Find the Google AI course card and click its Start Learning button
      const googleAICard = page.locator('[class*="course"], .course-card').filter({ hasText: 'Google AI & Gemini Mastery' });
      
      if (await googleAICard.count() > 0) {
        console.log('✅ Found Google AI course card, clicking Start Learning...');
        const startLearningBtn = googleAICard.locator('button:has-text("Start Learning")');
        
        if (await startLearningBtn.count() > 0) {
          await startLearningBtn.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(3000);
          
          // Take screenshot of course page
          await page.screenshot({ 
            path: '/Users/thomasdowuona-hyde/AI-Masterclass/test-course-page.png', 
            fullPage: true 
          });
          
          console.log('3️⃣ Looking for lessons on course page...');
          const coursePageText = await page.locator('body').textContent();
          
          if (coursePageText.includes('Introduction')) {
            console.log('✅ Found lessons, clicking Introduction lesson...');
            
            // Try to find and click introduction lesson
            const introSelectors = [
              'text=Introduction to Google AI & Gemini',
              'text=Introduction to Google AI',
              '[class*="lesson"]:has-text("Introduction")',
              'div:has-text("Introduction")'
            ];
            
            let lessonClicked = false;
            for (const selector of introSelectors) {
              try {
                const lessonElement = page.locator(selector);
                if (await lessonElement.count() > 0) {
                  console.log(`✅ Clicking lesson with selector: ${selector}`);
                  await lessonElement.first().click();
                  await page.waitForLoadState('networkidle');
                  await page.waitForTimeout(3000);
                  lessonClicked = true;
                  break;
                }
              } catch (e) {
                console.log(`❌ Selector "${selector}" failed: ${e.message}`);
                continue;
              }
            }
            
            if (lessonClicked) {
              // Take screenshot of lesson content
              await page.screenshot({ 
                path: '/Users/thomasdowuona-hyde/AI-Masterclass/test-lesson-content.png', 
                fullPage: true 
              });
              
              console.log('4️⃣ Analyzing lesson content...');
              const lessonText = await page.locator('body').textContent();
              
              // Check for rich content elements
              const hasRichHeader = lessonText.includes('Google AI & Gemini Mastery → Unlock Advanced AI Capabilities');
              const hasCopyPastePrompts = lessonText.includes('Copy-Paste Prompts');
              const hasPlaceholders = lessonText.includes('{YOUR_INDUSTRY/MARKET}');
              const hasQuiz = lessonText.includes('Knowledge Check');
              const hasTasks = lessonText.includes('Practical Tasks');
              const hasMarketResearch = lessonText.includes('Real-Time Market Research');
              const hasGenericContent = lessonText.includes('This is lesson content') || lessonText.includes('placeholder');
              
              console.log('\\n📊 RICH CONTENT ANALYSIS:');
              console.log(`   Rich content header: ${hasRichHeader ? '✅' : '❌'}`);
              console.log(`   Copy-paste prompts: ${hasCopyPastePrompts ? '✅' : '❌'}`);
              console.log(`   Customizable placeholders: ${hasPlaceholders ? '✅' : '❌'}`);
              console.log(`   Interactive quiz: ${hasQuiz ? '✅' : '❌'}`);
              console.log(`   Practical tasks: ${hasTasks ? '✅' : '❌'}`);
              console.log(`   Market research prompt: ${hasMarketResearch ? '✅' : '❌'}`);
              console.log(`   Generic/placeholder content: ${hasGenericContent ? '❌ FOUND' : '✅ NOT FOUND'}`);
              
              const richContentScore = [hasRichHeader, hasCopyPastePrompts, hasPlaceholders, hasQuiz, hasTasks, hasMarketResearch].filter(Boolean).length;
              
              console.log(`\\n🎯 RICH CONTENT SCORE: ${richContentScore}/6`);
              
              if (richContentScore >= 5) {
                console.log('🎉 EXCELLENT: Rich content is displaying perfectly!');
              } else if (richContentScore >= 3) {
                console.log('⚠️  PARTIAL: Some rich content is missing');
                console.log('\\n📄 LESSON CONTENT PREVIEW:');
                console.log(lessonText.substring(0, 1200));
              } else {
                console.log('❌ POOR: Rich content not displaying correctly');
                console.log('\\n📄 FULL LESSON CONTENT:');
                console.log(lessonText.substring(0, 2000));
                
                // Let's also check what's in the database
                console.log('\\n🔍 Checking database content...');
                return { needsDatabaseCheck: true, lessonContent: lessonText };
              }
              
            } else {
              console.log('❌ Could not click on Introduction lesson');
              console.log('📄 Available content on course page:');
              console.log(coursePageText.substring(0, 1000));
            }
            
          } else {
            console.log('❌ No Introduction lesson found on course page');
            console.log('📄 Course page content:');
            console.log(coursePageText.substring(0, 1000));
          }
          
        } else {
          console.log('❌ Start Learning button not found in Google AI card');
        }
        
      } else {
        console.log('❌ Google AI course card not found');
      }
      
    } else {
      console.log('❌ Courses not loaded properly');
      console.log('📄 Page content preview:');
      console.log(bodyText.substring(0, 500));
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\\n📸 Screenshots saved:');
    console.log('   - test-homepage.png');
    console.log('   - test-course-page.png'); 
    console.log('   - test-lesson-content.png');
  }
}

testRichContentJS();