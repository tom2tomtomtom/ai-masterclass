// Test rich content access with fixed selectors
const { chromium } = require('playwright');

async function testRichContentFixed() {
  console.log('🎯 TESTING RICH CONTENT ACCESS');
  console.log('='.repeat(60));
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();
  
  try {
    console.log('1️⃣ Loading homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('2️⃣ Looking for Google AI course card...');
    // Look for the Start Learning button in the Google AI course card
    const startLearningButtons = page.locator('button:has-text("Start Learning")');
    const buttonCount = await startLearningButtons.count();
    
    console.log(`Found ${buttonCount} "Start Learning" buttons`);
    
    if (buttonCount > 0) {
      // Click the second button (index 1) which should be Google AI & Gemini Mastery
      console.log('✅ Clicking Google AI & Gemini Mastery Start Learning button...');
      await startLearningButtons.nth(1).click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Take screenshot of course page
      await page.screenshot({ 
        path: '/Users/thomasdowuona-hyde/AI-Masterclass/test-course-page.png', 
        fullPage: true 
      });
      
      console.log('3️⃣ Looking for lessons on course page...');
      const pageText = await page.locator('body').textContent();
      
      if (pageText.includes('Introduction to Google AI')) {
        console.log('✅ Found lessons, looking for Introduction lesson...');
        
        // Try different selectors for the lesson
        const lessonSelectors = [
          'text=Introduction to Google AI & Gemini',
          'text=Introduction to Google AI', 
          'h3:has-text("Introduction")',
          'div:has-text("Introduction to Google AI")',
          '[data-testid="lesson"]:has-text("Introduction")'
        ];
        
        let lessonClicked = false;
        for (const selector of lessonSelectors) {
          try {
            const lessonElement = page.locator(selector);
            if (await lessonElement.count() > 0) {
              console.log(`✅ Found lesson with selector: ${selector}`);
              await lessonElement.first().click();
              await page.waitForLoadState('networkidle');
              await page.waitForTimeout(3000);
              lessonClicked = true;
              break;
            }
          } catch (e) {
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
          const bodyText = await page.locator('body').textContent();
          
          // Check for rich content elements
          const hasRichHeader = bodyText.includes('Google AI & Gemini Mastery → Unlock Advanced AI Capabilities');
          const hasCopyPastePrompts = bodyText.includes('Copy-Paste Prompts');
          const hasPlaceholders = bodyText.includes('{YOUR_INDUSTRY/MARKET}');
          const hasQuiz = bodyText.includes('Knowledge Check');
          const hasTasks = bodyText.includes('Practical Tasks');
          const hasMarketResearch = bodyText.includes('Real-Time Market Research');
          const hasGenericContent = bodyText.includes('This is lesson content');
          const hasPlaceholderContent = bodyText.includes('placeholder') || bodyText.includes('Lorem ipsum');
          
          console.log('\\n📊 RICH CONTENT ANALYSIS:');
          console.log(`   Rich content header: ${hasRichHeader ? '✅' : '❌'}`);
          console.log(`   Copy-paste prompts: ${hasCopyPastePrompts ? '✅' : '❌'}`);
          console.log(`   Customizable placeholders: ${hasPlaceholders ? '✅' : '❌'}`);
          console.log(`   Interactive quiz: ${hasQuiz ? '✅' : '❌'}`);
          console.log(`   Practical tasks: ${hasTasks ? '✅' : '❌'}`);
          console.log(`   Market research prompt: ${hasMarketResearch ? '✅' : '❌'}`);
          console.log(`   Generic/placeholder content: ${hasGenericContent || hasPlaceholderContent ? '❌' : '✅'}`);
          
          const richContentScore = [hasRichHeader, hasCopyPastePrompts, hasPlaceholders, hasQuiz, hasTasks, hasMarketResearch].filter(Boolean).length;
          
          console.log(`\\n🎯 RICH CONTENT SCORE: ${richContentScore}/6`);
          
          if (richContentScore >= 5) {
            console.log('🎉 EXCELLENT: Rich content is displaying perfectly!');
          } else if (richContentScore >= 3) {
            console.log('⚠️  PARTIAL: Some rich content is missing');
            console.log('\\n📄 LESSON CONTENT PREVIEW (first 1000 chars):');
            console.log(bodyText.substring(0, 1000));
          } else {
            console.log('❌ POOR: Rich content not displaying correctly');
            console.log('\\n📄 LESSON CONTENT PREVIEW (first 1200 chars):');
            console.log(bodyText.substring(0, 1200));
            console.log('\\n📄 LESSON CONTENT PREVIEW (chars 1200-2400):');
            console.log(bodyText.substring(1200, 2400));
          }
          
        } else {
          console.log('❌ Could not click on Introduction lesson');
          console.log('📄 Course page content preview:', pageText.substring(0, 800));
        }
        
      } else {
        console.log('❌ No lessons found on course page');
        console.log('📄 Course page content preview:', pageText.substring(0, 800));
      }
      
    } else {
      console.log('❌ No Start Learning buttons found');
      const homePageText = await page.locator('body').textContent();
      console.log('📄 Homepage content preview:', homePageText.substring(0, 500));
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
    console.log('\\n📸 Screenshots saved:');
    console.log('   - test-course-page.png');
    console.log('   - test-lesson-content.png');
  }
}

testRichContentFixed();