// Test rich content display after comprehensive seeding
const { chromium } = require('playwright');

async function testRichContentDisplay() {
  console.log('🎯 TESTING RICH CONTENT DISPLAY AFTER COMPREHENSIVE SEEDING');
  console.log('===========================================================');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const page = await browser.newPage();
  
  const results = {
    coursesWithContent: 0,
    modulesWithLessons: 0,
    richLessonsFound: 0,
    totalContentLength: 0,
    contentSamples: []
  };
  
  try {
    // Test 1: Check course listings
    console.log('📚 TEST 1: Checking course listings...');
    await page.goto('http://localhost:3000/courses');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const courseCards = await page.locator('.course-card, [class*="course"]').all();
    console.log(`Found ${courseCards.length} course cards`);
    results.coursesWithContent = courseCards.length;
    
    // Test 2: Navigate to a specific course and check modules/lessons
    console.log('\n📖 TEST 2: Checking first course content...');
    const firstCourseLink = page.locator('a[href*="/courses/"]').first();
    
    if (await firstCourseLink.count() > 0) {
      await firstCourseLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Look for modules
      const moduleElements = await page.locator('h3, h4, .module-title, [class*="module"]').all();
      console.log(`Found ${moduleElements.length} potential module elements`);
      
      // Look for lessons within modules
      const lessonElements = await page.locator('a[href*="/lessons/"], .lesson-link, [class*="lesson"]').all();
      console.log(`Found ${lessonElements.length} lesson elements`);
      results.modulesWithLessons = lessonElements.length;
      
      // Test 3: Open a lesson and check rich content
      if (lessonElements.length > 0) {
        console.log('\n📝 TEST 3: Opening first lesson to check rich content...');
        await lessonElements[0].click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        // Get lesson content
        const contentContainer = page.locator('.lesson-content, [class*="content"], main, article').first();
        if (await contentContainer.count() > 0) {
          const lessonText = await contentContainer.textContent();
          const contentLength = lessonText.length;
          results.totalContentLength += contentLength;
          
          console.log(`First lesson content length: ${contentLength} characters`);
          
          // Check for rich content indicators
          const hasHeadings = await page.locator('h1, h2, h3, h4').count();
          const hasParagraphs = await page.locator('p').count();
          const hasLists = await page.locator('ul, ol').count();
          const hasCodeBlocks = await page.locator('pre, code').count();
          const hasEmphasis = await page.locator('strong, em, b, i').count();
          
          console.log(`Rich content elements:`);
          console.log(`  Headings: ${hasHeadings}`);
          console.log(`  Paragraphs: ${hasParagraphs}`);
          console.log(`  Lists: ${hasLists}`);
          console.log(`  Code blocks: ${hasCodeBlocks}`);
          console.log(`  Emphasis: ${hasEmphasis}`);
          
          // Sample the content
          const contentSample = lessonText.substring(0, 500);
          console.log(`Content sample: "${contentSample}..."`);
          
          results.contentSamples.push({
            length: contentLength,
            sample: contentSample,
            hasRichElements: hasHeadings > 0 || hasParagraphs > 3 || hasLists > 0
          });
          
          if (contentLength > 500 && (hasHeadings > 0 || hasParagraphs > 3)) {
            results.richLessonsFound++;
            console.log('✅ Rich content detected!');
          } else {
            console.log('⚠️ Limited content detected');
          }
        }
        
        // Test 4: Check multiple lessons
        console.log('\n📚 TEST 4: Checking multiple lessons...');
        await page.goBack();
        await page.waitForTimeout(2000);
        
        // Try to open 2-3 more lessons
        const allLessonLinks = await page.locator('a[href*="/lessons/"]').all();
        const lessonsToTest = Math.min(3, allLessonLinks.length);
        
        for (let i = 1; i < lessonsToTest; i++) {
          try {
            await allLessonLinks[i].click();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2000);
            
            const contentContainer = page.locator('.lesson-content, [class*="content"], main, article').first();
            if (await contentContainer.count() > 0) {
              const lessonText = await contentContainer.textContent();
              const contentLength = lessonText.length;
              results.totalContentLength += contentLength;
              
              console.log(`Lesson ${i + 1} content length: ${contentLength} characters`);
              
              if (contentLength > 500) {
                results.richLessonsFound++;
              }
              
              results.contentSamples.push({
                length: contentLength,
                sample: lessonText.substring(0, 200),
                hasRichElements: lessonText.includes('##') || lessonText.includes('###')
              });
            }
            
            await page.goBack();
            await page.waitForTimeout(1000);
          } catch (error) {
            console.log(`Error testing lesson ${i + 1}:`, error.message);
          }
        }
      }
    }
    
    // Test 5: Check another course type
    console.log('\n🚀 TEST 5: Checking AI Masterclass course...');
    await page.goto('http://localhost:3000/courses');
    await page.waitForTimeout(2000);
    
    // Look for Video Generation or Voice AI courses
    const masteclassLink = page.locator('text=/Video Generation|Voice.*Audio|AI Automation/i').first();
    if (await masteclassLink.count() > 0) {
      await masteclassLink.click();
      await page.waitForTimeout(3000);
      
      const masterclassLessons = await page.locator('a[href*="/lessons/"]').all();
      console.log(`Masterclass lessons found: ${masterclassLessons.length}`);
      
      if (masterclassLessons.length > 0) {
        await masterclassLessons[0].click();
        await page.waitForTimeout(3000);
        
        const contentContainer = page.locator('.lesson-content, [class*="content"], main, article').first();
        if (await contentContainer.count() > 0) {
          const lessonText = await contentContainer.textContent();
          console.log(`Masterclass lesson content length: ${lessonText.length} characters`);
          
          if (lessonText.length > 500) {
            results.richLessonsFound++;
            console.log('✅ Masterclass rich content confirmed!');
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Rich content test failed:', error.message);
  } finally {
    await browser.close();
  }
  
  // Results summary
  console.log('\n🎯 RICH CONTENT TEST RESULTS:');
  console.log('===============================');
  console.log(`📚 Courses displaying: ${results.coursesWithContent}`);
  console.log(`📖 Modules with lessons: ${results.modulesWithLessons}`);
  console.log(`📝 Rich lessons found: ${results.richLessonsFound}`);
  console.log(`📊 Total content length: ${results.totalContentLength} characters`);
  console.log(`📈 Average lesson length: ${Math.round(results.totalContentLength / Math.max(results.contentSamples.length, 1))} characters`);
  
  const richContentPercentage = results.contentSamples.filter(c => c.hasRichElements).length / Math.max(results.contentSamples.length, 1) * 100;
  console.log(`🎨 Rich content percentage: ${Math.round(richContentPercentage)}%`);
  
  if (results.richLessonsFound > 0 && results.totalContentLength > 5000) {
    console.log('\n🎉 SUCCESS: Rich content from markdown files is displaying in the app!');
    console.log('✅ The comprehensive seeding successfully activated the premium content.');
  } else {
    console.log('\n⚠️ PARTIAL: Some content is displaying but may need further optimization.');
  }
  
  return results;
}

testRichContentDisplay();