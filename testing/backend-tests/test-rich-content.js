// Test rich content access directly
const { chromium } = require('playwright');

async function testRichContent() {
  console.log('🎯 TESTING RICH CONTENT ACCESS');
  console.log('='.repeat(60));
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();
  
  try {
    console.log('1️⃣ Loading homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('2️⃣ Looking for Google AI & Gemini Mastery course...');
    const googleAICourse = page.locator('text=Google AI & Gemini Mastery');
    
    if (await googleAICourse.count() > 0) {
      console.log('✅ Found Google AI course, clicking...');
      await googleAICourse.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Take screenshot of course page
      await page.screenshot({ 
        path: '/Users/thomasdowuona-hyde/AI-Masterclass/test-course-page.png', 
        fullPage: true 
      });
      
      console.log('3️⃣ Looking for Introduction lesson...');
      const introLesson = page.locator('text=Introduction to Google AI & Gemini');
      
      if (await introLesson.count() > 0) {
        console.log('✅ Found Introduction lesson, clicking...');
        await introLesson.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
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
        } else {
          console.log('❌ POOR: Rich content not displaying correctly');
          console.log('\\n📄 CONTENT PREVIEW (first 800 chars):');
          console.log(bodyText.substring(0, 800));
          console.log('\\n📄 CONTENT PREVIEW (chars 800-1600):');
          console.log(bodyText.substring(800, 1600));
        }
        
      } else {
        console.log('❌ Introduction lesson not found');
        const coursePageText = await page.locator('body').textContent();
        console.log('📄 Course page content preview:', coursePageText.substring(0, 500));
      }
      
    } else {
      console.log('❌ Google AI course not found');
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

testRichContent();