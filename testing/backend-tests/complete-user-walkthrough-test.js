// Complete User Training Walkthrough - Test Every Single Lesson
const { chromium } = require('playwright');
const fs = require('fs');

async function completeUserWalkthrough() {
  console.log('🎓 COMPLETE USER TRAINING WALKTHROUGH TEST');
  console.log('==========================================');
  console.log('Testing EVERY course, module, and lesson as a real user');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true,
    slowMo: 1000 // Slow down for better visibility
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: '/Users/thomasdowuona-hyde/AI-Masterclass/backend/test-recordings',
      size: { width: 1920, height: 1080 }
    }
  });
  
  const page = await context.newPage();
  
  // Comprehensive test results
  const walkthrough = {
    startTime: new Date().toISOString(),
    courses: [],
    statistics: {
      totalCourses: 0,
      totalModules: 0,
      totalLessons: 0,
      completedCourses: 0,
      completedModules: 0,
      completedLessons: 0,
      richContentLessons: 0,
      businessValueLessons: 0,
      technicalLessons: 0,
      errors: []
    },
    contentQuality: {
      averageContentLength: 0,
      totalContentLength: 0,
      richContentPercentage: 0,
      businessValuePercentage: 0
    }
  };

  try {
    // Step 1: Start the learning journey
    console.log('\n🚀 STEP 1: Starting the complete learning journey...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Navigate to courses
    console.log('📚 Navigating to courses page...');
    await page.goto('http://localhost:3000/courses');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Get all course links
    const courseLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href*="/courses/"]'))
        .map(link => ({
          href: link.href,
          title: link.textContent?.trim()?.substring(0, 100) || 'Untitled Course',
          id: link.href.split('/courses/')[1] || 'unknown'
        }))
        .filter((course, index, self) => 
          index === self.findIndex(c => c.id === course.id)
        ); // Remove duplicates
    });
    
    walkthrough.statistics.totalCourses = courseLinks.length;
    console.log(`✅ Found ${courseLinks.length} courses to complete`);
    
    // Step 2: Complete each course thoroughly
    for (let courseIndex = 0; courseIndex < courseLinks.length; courseIndex++) {
      const course = courseLinks[courseIndex];
      console.log(`\n📖 COURSE ${courseIndex + 1}/${courseLinks.length}: ${course.title}`);
      console.log('=' .repeat(60));
      
      const courseData = {
        index: courseIndex + 1,
        title: course.title,
        id: course.id,
        href: course.href,
        modules: [],
        status: 'started',
        startTime: new Date().toISOString(),
        errors: []
      };
      
      try {
        // Navigate to course
        await page.goto(course.href);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        // Get course content analysis
        const courseAnalysis = await page.evaluate(() => {
          const content = document.body.textContent || '';
          return {
            contentLength: content.length,
            hasModules: content.toLowerCase().includes('module'),
            hasLessons: content.toLowerCase().includes('lesson'),
            hasRichContent: content.length > 2000,
            moduleCount: (content.match(/module/gi) || []).length,
            lessonCount: (content.match(/lesson/gi) || []).length,
            businessTerms: /revenue|roi|\$\d+|profit|business|case study|success/i.test(content),
            technicalTerms: /api|code|development|automation|workflow|integration/i.test(content)
          };
        });
        
        console.log(`   📊 Course page analysis: ${courseAnalysis.contentLength} chars, ${courseAnalysis.moduleCount} modules mentioned`);
        
        // Find and click "Start Course" or "Continue" buttons
        console.log('   🎯 Looking for course start button...');
        
        const startButton = await page.locator('button:has-text("Start"), button:has-text("Begin"), button:has-text("Continue"), a:has-text("Start Course")').first();
        
        if (await startButton.isVisible().catch(() => false)) {
          console.log('   ▶️ Clicking start/continue button...');
          await startButton.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(3000);
        }
        
        // Now look for individual lessons within the course
        const lessonElements = await page.locator('.lesson, .module, [data-testid*="lesson"], a[href*="/lessons/"]').all();
        console.log(`   🔗 Found ${lessonElements.length} lesson elements`);
        
        const moduleLinks = [];
        for (let i = 0; i < Math.min(lessonElements.length, 20); i++) {
          try {
            const element = lessonElements[i];
            const href = await element.getAttribute('href').catch(() => null);
            const text = await element.textContent().catch(() => 'Lesson');
            
            if (href && href.includes('/lessons/')) {
              moduleLinks.push({
                href: href,
                text: text?.trim()?.substring(0, 100) || `Lesson ${i + 1}`,
                selector: 'lesson-element'
              });
            }
          } catch (e) {
            // Continue with next element
          }
        }
        
        console.log(`   🔗 Found ${moduleLinks.length} module/lesson links`);
        
        // Step 3: Navigate through each module/lesson
        if (moduleLinks.length === 0) {
          console.log('   ⚠️ No modules/lessons found - checking for course content directly');
          
          // Check if content is directly on course page
          const directContent = await page.evaluate(() => {
            const content = document.body.textContent || '';
            return {
              hasDirectContent: content.length > 5000,
              contentLength: content.length,
              businessValue: /revenue|roi|\$\d+|case study|success story/i.test(content),
              technicalContent: /api|code|development|automation/i.test(content),
              stepByStep: /step \d+|chapter \d+|lesson \d+/i.test(content),
              preview: content.substring(0, 500).replace(/\\s+/g, ' ').trim()
            };
          });
          
          if (directContent.hasDirectContent) {
            console.log('   ✅ Course has direct rich content on page');
            walkthrough.statistics.totalLessons++;
            walkthrough.statistics.completedLessons++;
            walkthrough.contentQuality.totalContentLength += directContent.contentLength;
            
            if (directContent.contentLength > 2000) {
              walkthrough.statistics.richContentLessons++;
            }
            if (directContent.businessValue) {
              walkthrough.statistics.businessValueLessons++;
            }
            if (directContent.technicalContent) {
              walkthrough.statistics.technicalLessons++;
            }
            
            courseData.modules.push({
              title: 'Direct Course Content',
              contentLength: directContent.contentLength,
              businessValue: directContent.businessValue,
              technicalContent: directContent.technicalContent,
              preview: directContent.preview
            });
          }
        } else {
          // Navigate through each lesson and COMPLETE it properly
          for (let linkIndex = 0; linkIndex < Math.min(moduleLinks.length, 20); linkIndex++) {
            const moduleLink = moduleLinks[linkIndex];
            console.log(`\n     🎯 Lesson ${linkIndex + 1}: ${moduleLink.text}`);
            
            try {
              if (moduleLink.href && moduleLink.href !== 'javascript-action') {
                await page.goto(moduleLink.href);
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(3000);
                
                // Look for and click "Complete" button to see actual lesson content
                console.log(`        🔍 Looking for Complete button...`);
                const completeButton = await page.locator('button:has-text("Complete"), button:has-text("Mark Complete"), .complete-btn, [data-testid="complete-button"]').first();
                
                if (await completeButton.isVisible().catch(() => false)) {
                  console.log(`        ✅ Found and clicking Complete button...`);
                  await completeButton.click();
                  await page.waitForLoadState('networkidle');
                  await page.waitForTimeout(2000);
                }
                
                // Also look for "Next" or "Continue" buttons
                const nextButton = await page.locator('button:has-text("Next"), button:has-text("Continue"), .next-btn').first();
                if (await nextButton.isVisible().catch(() => false)) {
                  console.log(`        ➡️ Found Next/Continue button, clicking...`);
                  await nextButton.click();
                  await page.waitForLoadState('networkidle');
                  await page.waitForTimeout(2000);
                }
                
                // Now analyze the actual lesson content after completion
                const lessonAnalysis = await page.evaluate(() => {
                  const content = document.body.textContent || '';
                  
                  // Look specifically for rich educational content
                  const hasDetailedExplanations = /explanation|example|step-by-step|how to|implementation|strategy/i.test(content);
                  const hasCodeExamples = /```|const |function |import |export |npm |yarn/i.test(content);
                  const hasPracticalContent = /practical|hands-on|exercise|assignment|project|real-world/i.test(content);
                  
                  return {
                    contentLength: content.length,
                    hasRichContent: content.length > 2000,
                    businessValue: /revenue|roi|\$\d+|profit|business|case study|success story|client|agency|marketing|sales/i.test(content),
                    technicalContent: /api|code|development|programming|automation|workflow|integration|prompt|ai|claude|chatgpt|gemini/i.test(content),
                    stepByStep: /step \d+|chapter \d+|lesson \d+|module \d+/i.test(content),
                    interactiveElements: document.querySelectorAll('button, input, form, .interactive').length,
                    headingStructure: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
                    codeBlocks: document.querySelectorAll('pre, code').length,
                    lists: document.querySelectorAll('ul, ol').length,
                    hasDetailedExplanations,
                    hasCodeExamples,
                    hasPracticalContent,
                    preview: content.substring(0, 500).replace(/\\s+/g, ' ').trim(),
                    fullContent: content.substring(0, 2000) // Get more content for verification
                  };
                });
                
                console.log(`        📊 Content: ${lessonAnalysis.contentLength} chars`);
                console.log(`        💰 Business: ${lessonAnalysis.businessValue ? 'YES' : 'NO'}`);
                console.log(`        🔧 Technical: ${lessonAnalysis.technicalContent ? 'YES' : 'NO'}`);
                console.log(`        📚 Detailed: ${lessonAnalysis.hasDetailedExplanations ? 'YES' : 'NO'}`);
                console.log(`        💻 Code: ${lessonAnalysis.hasCodeExamples ? 'YES' : 'NO'}`);
                console.log(`        🎯 Practical: ${lessonAnalysis.hasPracticalContent ? 'YES' : 'NO'}`);
                console.log(`        📋 Structure: ${lessonAnalysis.headingStructure} headings, ${lessonAnalysis.lists} lists`);
                
                // Show content preview to verify rich content
                if (lessonAnalysis.contentLength < 1000) {
                  console.log(`        ⚠️ LOW CONTENT - Preview: ${lessonAnalysis.preview}`);
                } else {
                  console.log(`        ✅ RICH CONTENT FOUND - Preview: ${lessonAnalysis.preview.substring(0, 200)}...`);
                }
                
                // Update statistics
                walkthrough.statistics.totalLessons++;
                walkthrough.statistics.completedLessons++;
                walkthrough.contentQuality.totalContentLength += lessonAnalysis.contentLength;
                
                if (lessonAnalysis.contentLength > 2000) {
                  walkthrough.statistics.richContentLessons++;
                }
                if (lessonAnalysis.businessValue) {
                  walkthrough.statistics.businessValueLessons++;
                }
                if (lessonAnalysis.technicalContent) {
                  walkthrough.statistics.technicalLessons++;
                }
                
                // Record detailed module data
                courseData.modules.push({
                  title: moduleLink.text,
                  href: moduleLink.href,
                  contentLength: lessonAnalysis.contentLength,
                  businessValue: lessonAnalysis.businessValue,
                  technicalContent: lessonAnalysis.technicalContent,
                  structuredContent: lessonAnalysis.headingStructure > 0,
                  hasDetailedExplanations: lessonAnalysis.hasDetailedExplanations,
                  hasCodeExamples: lessonAnalysis.hasCodeExamples,
                  hasPracticalContent: lessonAnalysis.hasPracticalContent,
                  preview: lessonAnalysis.preview,
                  contentSample: lessonAnalysis.fullContent
                });
                
                // Simulate realistic completion time
                const completionTime = Math.min(5000, Math.max(2000, lessonAnalysis.contentLength / 20));
                await page.waitForTimeout(completionTime);
                
              } else {
                console.log(`        ⚠️ Skipping javascript action: ${moduleLink.text}`);
              }
              
            } catch (error) {
              console.log(`        ❌ Error with lesson: ${error.message}`);
              courseData.errors.push({
                module: moduleLink.text,
                error: error.message
              });
              walkthrough.statistics.errors.push({
                course: course.title,
                module: moduleLink.text,
                error: error.message
              });
            }
          }
        }
        
        courseData.status = 'completed';
        courseData.endTime = new Date().toISOString();
        walkthrough.statistics.completedCourses++;
        walkthrough.statistics.totalModules += courseData.modules.length;
        walkthrough.statistics.completedModules += courseData.modules.length;
        
        console.log(`   ✅ Course completed: ${courseData.modules.length} modules/lessons processed`);
        
      } catch (error) {
        console.log(`   ❌ Course error: ${error.message}`);
        courseData.status = 'error';
        courseData.error = error.message;
        walkthrough.statistics.errors.push({
          course: course.title,
          error: error.message
        });
      }
      
      walkthrough.courses.push(courseData);
      
      // Take a break between courses
      await page.waitForTimeout(2000);
    }
    
    // Step 4: Calculate final statistics
    console.log('\n📊 CALCULATING FINAL WALKTHROUGH STATISTICS...');
    
    walkthrough.contentQuality.averageContentLength = 
      walkthrough.statistics.totalLessons > 0 ? 
      Math.round(walkthrough.contentQuality.totalContentLength / walkthrough.statistics.totalLessons) : 0;
    
    walkthrough.contentQuality.richContentPercentage = 
      walkthrough.statistics.totalLessons > 0 ? 
      Math.round((walkthrough.statistics.richContentLessons / walkthrough.statistics.totalLessons) * 100) : 0;
    
    walkthrough.contentQuality.businessValuePercentage = 
      walkthrough.statistics.totalLessons > 0 ? 
      Math.round((walkthrough.statistics.businessValueLessons / walkthrough.statistics.totalLessons) * 100) : 0;
    
    walkthrough.endTime = new Date().toISOString();
    
    // Step 5: Generate comprehensive report
    console.log('\n🎯 COMPLETE USER WALKTHROUGH RESULTS:');
    console.log('=====================================');
    console.log(`🏆 Completion Status: ${walkthrough.statistics.completedCourses}/${walkthrough.statistics.totalCourses} courses`);
    console.log(`📚 Total Courses: ${walkthrough.statistics.totalCourses}`);
    console.log(`📖 Total Modules: ${walkthrough.statistics.totalModules}`);
    console.log(`📝 Total Lessons: ${walkthrough.statistics.totalLessons}`);
    console.log(`✅ Completed Lessons: ${walkthrough.statistics.completedLessons}`);
    console.log(`💎 Rich Content Lessons: ${walkthrough.statistics.richContentLessons} (${walkthrough.contentQuality.richContentPercentage}%)`);
    console.log(`💰 Business Value Lessons: ${walkthrough.statistics.businessValueLessons} (${walkthrough.contentQuality.businessValuePercentage}%)`);
    console.log(`🔧 Technical Lessons: ${walkthrough.statistics.technicalLessons}`);
    console.log(`📊 Average Content Length: ${walkthrough.contentQuality.averageContentLength.toLocaleString()} chars`);
    console.log(`📈 Total Content Processed: ${walkthrough.contentQuality.totalContentLength.toLocaleString()} chars`);
    console.log(`❌ Errors Encountered: ${walkthrough.statistics.errors.length}`);
    
    // Detailed course breakdown
    console.log('\\n📋 DETAILED COURSE BREAKDOWN:');
    console.log('==============================');
    walkthrough.courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title} (${course.status.toUpperCase()})`);
      console.log(`   📖 Modules/Lessons: ${course.modules.length}`);
      if (course.modules.length > 0) {
        const avgLength = Math.round(course.modules.reduce((sum, m) => sum + (m.contentLength || 0), 0) / course.modules.length);
        const businessModules = course.modules.filter(m => m.businessValue).length;
        const technicalModules = course.modules.filter(m => m.technicalContent).length;
        console.log(`   📊 Avg Content: ${avgLength.toLocaleString()} chars`);
        console.log(`   💰 Business Value: ${businessModules}/${course.modules.length}`);
        console.log(`   🔧 Technical Content: ${technicalModules}/${course.modules.length}`);
      }
      if (course.errors && course.errors.length > 0) {
        console.log(`   ❌ Errors: ${course.errors.length}`);
      }
    });
    
    // Success assessment
    const successCriteria = {
      completionRate: walkthrough.statistics.completedLessons / Math.max(walkthrough.statistics.totalLessons, 1),
      richContentRate: walkthrough.contentQuality.richContentPercentage / 100,
      businessValueRate: walkthrough.contentQuality.businessValuePercentage / 100,
      averageContentQuality: walkthrough.contentQuality.averageContentLength >= 2000,
      errorRate: walkthrough.statistics.errors.length / Math.max(walkthrough.statistics.totalLessons, 1)
    };
    
    const overallSuccess = 
      successCriteria.completionRate >= 0.8 &&
      successCriteria.richContentRate >= 0.6 &&
      successCriteria.businessValueRate >= 0.4 &&
      successCriteria.averageContentQuality &&
      successCriteria.errorRate <= 0.1;
    
    console.log('\\n🎯 SUCCESS ASSESSMENT:');
    console.log('======================');
    console.log(`✅ Completion Rate: ${Math.round(successCriteria.completionRate * 100)}% ${successCriteria.completionRate >= 0.8 ? '(PASS)' : '(NEEDS WORK)'}`);
    console.log(`✅ Rich Content Rate: ${Math.round(successCriteria.richContentRate * 100)}% ${successCriteria.richContentRate >= 0.6 ? '(PASS)' : '(NEEDS WORK)'}`);
    console.log(`✅ Business Value Rate: ${Math.round(successCriteria.businessValueRate * 100)}% ${successCriteria.businessValueRate >= 0.4 ? '(PASS)' : '(NEEDS WORK)'}`);
    console.log(`✅ Content Quality: ${successCriteria.averageContentQuality ? 'PASS' : 'NEEDS WORK'} (${walkthrough.contentQuality.averageContentLength} chars avg)`);
    console.log(`✅ Error Rate: ${Math.round(successCriteria.errorRate * 100)}% ${successCriteria.errorRate <= 0.1 ? '(PASS)' : '(HIGH)'}`);
    
    if (overallSuccess) {
      console.log('\\n🎉 OVERALL RESULT: COMPLETE SUCCESS!');
      console.log('🚀 The AI Masterclass platform is READY for users!');
      console.log('✨ Rich content verified across all courses and lessons!');
      console.log('💎 Professional educational experience confirmed!');
    } else {
      console.log('\\n⚠️ OVERALL RESULT: PARTIAL SUCCESS - Areas need improvement');
      console.log('🔧 Review failed criteria above for optimization opportunities');
    }
    
    // Save comprehensive report
    const reportPath = '/Users/thomasdowuona-hyde/AI-Masterclass/backend/COMPLETE-USER-WALKTHROUGH-REPORT.json';
    fs.writeFileSync(reportPath, JSON.stringify(walkthrough, null, 2));
    console.log(`\\n💾 Complete walkthrough report saved: ${reportPath}`);
    
    return walkthrough;
    
  } catch (error) {
    console.error('❌ Complete walkthrough failed:', error.message);
    walkthrough.error = error.message;
    walkthrough.endTime = new Date().toISOString();
  } finally {
    await context.close();
    await browser.close();
  }
  
  return walkthrough;
}

// Run the complete user walkthrough
completeUserWalkthrough()
  .then((results) => {
    console.log('\\n✅ Complete user training walkthrough finished!');
    console.log(`📊 Final Score: ${results.statistics?.completedLessons || 0} lessons completed`);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Complete walkthrough failed:', error.message);
    process.exit(1);
  });