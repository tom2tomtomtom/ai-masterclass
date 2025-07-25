// Audit actual content displayed in app vs expected rich content
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function auditAppContent() {
  console.log('🔍 AUDITING APP CONTENT - CHECKING RICH CONTENT DISPLAY');
  console.log('======================================================');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const contentAudit = {
    coursesFound: [],
    modulesFound: [],
    lessonsFound: [],
    contentSamples: [],
    missingContent: []
  };
  
  try {
    // Step 1: Check courses page
    console.log('📚 STEP 1: Checking courses display...');
    await page.goto('http://localhost:3000/courses');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Get all course titles and descriptions
    const courseElements = await page.locator('[class*="course"], .course-card, .course-item').all();
    console.log(`Found ${courseElements.length} course elements`);
    
    for (let i = 0; i < Math.min(courseElements.length, 5); i++) {
      const element = courseElements[i];
      const text = await element.textContent();
      const title = text.split('\n')[0] || text.substring(0, 50);
      contentAudit.coursesFound.push(title.trim());
      console.log(`Course ${i + 1}: ${title.trim()}`);
    }
    
    // Step 2: Check first course details
    console.log('\n📖 STEP 2: Checking first course content...');
    const firstCourseLink = page.locator('a[href*="/courses/"]').first();
    if (await firstCourseLink.count() > 0) {
      await firstCourseLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Get modules
      const moduleElements = await page.locator('[class*="module"], .module-card, .module-item').all();
      console.log(`Found ${moduleElements.length} module elements`);
      
      for (let i = 0; i < Math.min(moduleElements.length, 3); i++) {
        const element = moduleElements[i];
        const text = await element.textContent();
        const title = text.split('\n')[0] || text.substring(0, 50);
        contentAudit.modulesFound.push(title.trim());
        console.log(`Module ${i + 1}: ${title.trim()}`);
      }
      
      // Step 3: Check first lesson content
      console.log('\n📝 STEP 3: Checking lesson content...');
      const firstLessonLink = page.locator('a[href*="/lessons/"], button:has-text("Start"), .lesson-link').first();
      if (await firstLessonLink.count() > 0) {
        await firstLessonLink.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        // Get lesson content
        const contentContainer = page.locator('.lesson-content, [class*="content"], main, article').first();
        if (await contentContainer.count() > 0) {
          const lessonText = await contentContainer.textContent();
          const contentLength = lessonText.length;
          const contentSample = lessonText.substring(0, 500);
          
          console.log(`Lesson content length: ${contentLength} characters`);
          console.log(`Content sample: ${contentSample}...`);
          
          contentAudit.contentSamples.push({
            length: contentLength,
            sample: contentSample,
            hasRichElements: lessonText.includes('##') || lessonText.includes('###') || lessonText.includes('```')
          });
          
          // Check for specific rich content indicators
          const hasCodeBlocks = lessonText.includes('```') || await page.locator('code, pre').count() > 0;
          const hasHeadings = lessonText.includes('#') || await page.locator('h1, h2, h3, h4, h5, h6').count() > 0;
          const hasLists = lessonText.includes('-') || await page.locator('ul, ol, li').count() > 0;
          const hasEmphasis = lessonText.includes('**') || await page.locator('strong, em, b, i').count() > 0;
          
          console.log(`Rich content indicators:`);
          console.log(`  Code blocks: ${hasCodeBlocks}`);
          console.log(`  Headings: ${hasHeadings}`);
          console.log(`  Lists: ${hasLists}`);
          console.log(`  Emphasis: ${hasEmphasis}`);
        }
      }
    }
    
    // Step 4: Sample more lessons
    console.log('\n🔍 STEP 4: Sampling additional content...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // Try to find direct lesson links
    const allLessonLinks = await page.locator('a[href*="/lessons/"]').all();
    console.log(`Found ${allLessonLinks.length} lesson links on homepage`);
    
    for (let i = 0; i < Math.min(allLessonLinks.length, 3); i++) {
      try {
        await allLessonLinks[i].click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        const pageContent = await page.textContent('body');
        const contentLength = pageContent.length;
        console.log(`Lesson ${i + 1} length: ${contentLength} chars`);
        
        if (contentLength < 500) {
          console.log(`⚠️  Short content detected: ${pageContent.substring(0, 200)}...`);
        }
        
        await page.goBack();
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log(`Error checking lesson ${i + 1}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Audit failed:', error.message);
  } finally {
    await browser.close();
  }
  
  // Write audit results
  const auditReport = {
    timestamp: new Date().toISOString(),
    summary: {
      coursesFound: contentAudit.coursesFound.length,
      modulesFound: contentAudit.modulesFound.length,
      lessonsChecked: contentAudit.contentSamples.length,
      averageContentLength: contentAudit.contentSamples.reduce((acc, item) => acc + item.length, 0) / contentAudit.contentSamples.length || 0
    },
    details: contentAudit
  };
  
  fs.writeFileSync('/Users/thomasdowuona-hyde/AI-Masterclass/backend/content-audit-report.json', JSON.stringify(auditReport, null, 2));
  
  console.log('\n📊 AUDIT SUMMARY:');
  console.log(`Found ${auditReport.summary.coursesFound} courses displaying`);
  console.log(`Found ${auditReport.summary.modulesFound} modules displaying`);
  console.log(`Checked ${auditReport.summary.lessonsChecked} lessons`);
  console.log(`Average content length: ${Math.round(auditReport.summary.averageContentLength)} characters`);
  console.log(`Audit report saved to: content-audit-report.json`);
  
  return auditReport;
}

auditAppContent();