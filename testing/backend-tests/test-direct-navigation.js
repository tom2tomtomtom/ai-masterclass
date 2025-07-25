// Test by navigating directly to course and lesson URLs
const { chromium } = require('playwright');

async function testDirectNavigation() {
  console.log('🎯 TESTING DIRECT NAVIGATION TO RICH CONTENT');
  console.log('='.repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 1500
  });
  const page = await browser.newPage();
  
  try {
    console.log('1️⃣ Testing homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ 
      path: '/Users/thomasdowuona-hyde/AI-Masterclass/test-homepage-direct.png', 
      fullPage: true 
    });
    
    console.log('2️⃣ Trying to click Google AI Start Learning button directly...');
    
    // Try multiple approaches to click the Google AI course
    const strategies = [
      async () => {
        // Strategy 1: Click the 4th Start Learning button (Google AI is 4th visible)
        const startBtns = page.locator('button:has-text("Start Learning")');
        const count = await startBtns.count();
        console.log(`   Found ${count} Start Learning buttons`);
        if (count >= 4) {
          await startBtns.nth(3).click(); // 0-indexed, so 3 = 4th button
          return true;
        }
        return false;
      },
      async () => {
        // Strategy 2: Find the card with Google AI text and click its button
        const googleAIText = page.locator('text=Google AI & Gemini Mastery');
        if (await googleAIText.count() > 0) {
          const card = googleAIText.locator('..').locator('..'); // Go up to card container
          const btn = card.locator('button:has-text("Start Learning")');
          if (await btn.count() > 0) {
            await btn.click();
            return true;
          }
        }
        return false;
      },
      async () => {
        // Strategy 3: Try direct URL navigation
        await page.goto('http://localhost:3000/course/google-ai-gemini-mastery', { waitUntil: 'networkidle' });
        return true;
      },
      async () => {
        // Strategy 4: Try alternative course URL formats
        const urls = [
          'http://localhost:3000/courses/google-ai-gemini-mastery',
          'http://localhost:3000/courses/2', // Assuming it's course ID 2
          'http://localhost:3000/course/2'
        ];
        
        for (const url of urls) {
          try {
            await page.goto(url, { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
            const text = await page.locator('body').textContent();
            if (text.includes('Google AI') || text.includes('lesson')) {
              console.log(`   Success with URL: ${url}`);
              return true;
            }
          } catch (e) {
            continue;
          }
        }
        return false;
      }
    ];
    
    let courseAccessed = false;
    for (let i = 0; i < strategies.length; i++) {
      try {
        console.log(`   Trying strategy ${i + 1}...`);
        if (await strategies[i]()) {
          console.log(`   ✅ Strategy ${i + 1} worked!`);
          courseAccessed = true;
          break;
        }
      } catch (e) {
        console.log(`   ❌ Strategy ${i + 1} failed: ${e.message}`);
        continue;
      }
    }
    
    if (courseAccessed) {
      await page.waitForTimeout(3000);
      
      // Take screenshot of course page
      await page.screenshot({ 
        path: '/Users/thomasdowuona-hyde/AI-Masterclass/test-course-page-direct.png', 
        fullPage: true 
      });
      
      console.log('3️⃣ Analyzing course page content...');
      const courseText = await page.locator('body').textContent();
      
      console.log(`   Course page length: ${courseText.length} characters`);
      console.log(`   Contains "Introduction": ${courseText.includes('Introduction')}`);
      console.log(`   Contains "Google AI": ${courseText.includes('Google AI')}`);
      console.log(`   Contains "lesson": ${courseText.includes('lesson')}`);
      
      if (courseText.includes('Introduction')) {
        console.log('4️⃣ Found lessons, trying to access Introduction lesson...');
        
        // Try direct lesson URL navigation
        const lessonUrls = [
          'http://localhost:3000/lesson/introduction-to-google-ai-gemini',
          'http://localhost:3000/lessons/introduction-to-google-ai-gemini',
          'http://localhost:3000/course/google-ai-gemini-mastery/lesson/1',
          'http://localhost:3000/courses/2/lessons/1',
          'http://localhost:3000/lesson/1'
        ];
        
        let lessonAccessed = false;
        for (const url of lessonUrls) {
          try {
            console.log(`   Trying lesson URL: ${url}`);
            await page.goto(url, { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
            
            const lessonText = await page.locator('body').textContent();
            if (lessonText.includes('Google AI') || lessonText.length > 1000) {
              console.log(`   ✅ Lesson accessed with URL: ${url}`);
              lessonAccessed = true;
              
              // Take screenshot of lesson
              await page.screenshot({ 
                path: '/Users/thomasdowuona-hyde/AI-Masterclass/test-lesson-content-direct.png', 
                fullPage: true 
              });
              
              console.log('5️⃣ Analyzing lesson content...');
              
              // Check for rich content elements
              const hasRichHeader = lessonText.includes('Google AI & Gemini Mastery → Unlock Advanced AI Capabilities');
              const hasCopyPastePrompts = lessonText.includes('Copy-Paste Prompts');
              const hasPlaceholders = lessonText.includes('{YOUR_INDUSTRY/MARKET}');
              const hasQuiz = lessonText.includes('Knowledge Check');
              const hasTasks = lessonText.includes('Practical Tasks');
              const hasMarketResearch = lessonText.includes('Real-Time Market Research');
              const hasGenericContent = lessonText.includes('This is lesson content') || lessonText.includes('Lorem ipsum');
              
              console.log('\\n📊 RICH CONTENT ANALYSIS:');
              console.log(`   Rich content header: ${hasRichHeader ? '✅' : '❌'}`);
              console.log(`   Copy-paste prompts: ${hasCopyPastePrompts ? '✅' : '❌'}`);
              console.log(`   Customizable placeholders: ${hasPlaceholders ? '✅' : '❌'}`);
              console.log(`   Interactive quiz: ${hasQuiz ? '✅' : '❌'}`);
              console.log(`   Practical tasks: ${hasTasks ? '✅' : '❌'}`);
              console.log(`   Market research prompt: ${hasMarketResearch ? '✅' : '❌'}`);
              console.log(`   Generic content: ${hasGenericContent ? '❌ FOUND' : '✅ NOT FOUND'}`);
              
              const richContentScore = [hasRichHeader, hasCopyPastePrompts, hasPlaceholders, hasQuiz, hasTasks, hasMarketResearch].filter(Boolean).length;
              
              console.log(`\\n🎯 RICH CONTENT SCORE: ${richContentScore}/6`);
              console.log(`   Lesson content length: ${lessonText.length} characters`);
              
              if (richContentScore >= 5) {
                console.log('🎉 EXCELLENT: Rich content is displaying perfectly!');
              } else if (richContentScore >= 3) {
                console.log('⚠️  PARTIAL: Some rich content is missing');
              } else {
                console.log('❌ POOR: Rich content not displaying correctly');
              }
              
              console.log('\\n📄 LESSON CONTENT SAMPLE:');
              console.log(lessonText.substring(0, 1500));
              
              break;
            }
          } catch (e) {
            continue;
          }
        }
        
        if (!lessonAccessed) {
          console.log('❌ Could not access any lesson directly');
        }
        
      } else {
        console.log('❌ No lessons found on course page');
        console.log('📄 Course page content sample:');
        console.log(courseText.substring(0, 800));
      }
      
    } else {
      console.log('❌ Could not access Google AI course');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\\n📸 Screenshots saved:');
    console.log('   - test-homepage-direct.png');
    console.log('   - test-course-page-direct.png');
    console.log('   - test-lesson-content-direct.png');
  }
}

testDirectNavigation();