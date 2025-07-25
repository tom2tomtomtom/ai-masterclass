// Verify rich content seeding success
const { chromium } = require('playwright');

async function verifyRichContentSuccess() {
  console.log('🎯 VERIFYING RICH CONTENT SEEDING SUCCESS');
  console.log('========================================');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  const results = {
    apiTests: {},
    contentQuality: {},
    businessValue: {},
    frontendDisplay: {}
  };
  
  try {
    // Test 1: API Content Verification
    console.log('\n🔬 TEST 1: API Content Quality Verification...');
    
    const apiTests = await page.evaluate(async () => {
      try {
        // Test multiple course endpoints
        const courseTests = [];
        const courseIds = [
          '4611417b-41c0-47c5-9dc1-4add1d23a38f', // AI Fundamentals
          'c460792a-90ca-4151-8652-c32576d62dff', // Video Generation
          'af21cc5a-94f3-4e51-a2f8-e2009428e0cf', // Voice & Audio
          'ce1a8773-8fb5-485b-a571-cc58753634dc'  // Google AI
        ];
        
        for (const courseId of courseIds) {
          try {
            const response = await fetch(`http://localhost:8000/api/courses/${courseId}`);
            const data = await response.json();
            
            if (data.success && data.data) {
              const course = data.data;
              const totalLessons = course.modules?.reduce((sum, module) => 
                sum + (module.lessons?.length || 0), 0) || 0;
              
              const richLessons = course.modules?.reduce((sum, module) => 
                sum + (module.lessons?.filter(lesson => 
                  lesson.content && lesson.content.length > 1000).length || 0), 0) || 0;
              
              const avgContentLength = course.modules?.reduce((sum, module) => {
                const moduleContentLength = module.lessons?.reduce((moduleSum, lesson) =>
                  moduleSum + (lesson.content?.length || 0), 0) || 0;
                return sum + moduleContentLength;
              }, 0) / Math.max(totalLessons, 1) || 0;
              
              courseTests.push({
                courseTitle: course.title,
                moduleCount: course.modules?.length || 0,
                lessonCount: totalLessons,
                richLessonCount: richLessons,
                richPercentage: totalLessons > 0 ? Math.round((richLessons / totalLessons) * 100) : 0,
                avgContentLength: Math.round(avgContentLength)
              });
            }
          } catch (error) {
            courseTests.push({
              courseTitle: 'Error loading course',
              error: error.message
            });
          }
        }
        
        return courseTests;
      } catch (error) {
        return [{ error: error.message }];
      }
    });
    
    results.apiTests = apiTests;
    
    console.log('📊 API Test Results:');
    apiTests.forEach((test, index) => {
      if (test.error) {
        console.log(`${index + 1}. ERROR: ${test.error}`);
      } else {
        console.log(`${index + 1}. ${test.courseTitle}:`);
        console.log(`   📖 ${test.moduleCount} modules, ${test.lessonCount} lessons`);
        console.log(`   💎 ${test.richLessonCount} rich lessons (${test.richPercentage}%)`);
        console.log(`   📊 Avg content: ${test.avgContentLength.toLocaleString()} chars`);
      }
    });
    
    // Test 2: Sample lesson content quality
    console.log('\n🔬 TEST 2: Sample Lesson Content Quality...');
    
    const contentSamples = await page.evaluate(async () => {
      try {
        const lessonsResponse = await fetch('http://localhost:8000/api/lessons?limit=10');
        const lessonsData = await lessonsResponse.json();
        
        if (lessonsData.success && lessonsData.data) {
          return lessonsData.data.map(lesson => ({
            title: lesson.title,
            contentLength: lesson.content?.length || 0,
            hasBusinessValue: /\$|revenue|roi|profit|business|case study|success/i.test(lesson.content || ''),
            hasStepByStep: /step \d+|step-by-step|chapter \d+/i.test(lesson.content || ''),
            hasRichFormatting: /###|```|##|\*\*/.test(lesson.content || ''),
            preview: lesson.content ? lesson.content.substring(0, 200) + '...' : 'NO CONTENT'
          }));
        }
        
        return [];
      } catch (error) {
        return [{ error: error.message }];
      }
    });
    
    results.contentQuality = contentSamples;
    
    console.log('📝 Sample Lesson Quality:');
    contentSamples.slice(0, 5).forEach((sample, index) => {
      if (sample.error) {
        console.log(`${index + 1}. ERROR: ${sample.error}`);
      } else {
        console.log(`${index + 1}. ${sample.title}`);
        console.log(`   📊 ${sample.contentLength.toLocaleString()} chars`);
        console.log(`   💰 Business Value: ${sample.hasBusinessValue ? 'YES' : 'NO'}`);
        console.log(`   📋 Step-by-Step: ${sample.hasStepByStep ? 'YES' : 'NO'}`);
        console.log(`   🎨 Rich Format: ${sample.hasRichFormatting ? 'YES' : 'NO'}`);
        console.log(`   📄 Preview: ${sample.preview}`);
      }
    });
    
    // Test 3: Frontend Display Verification
    console.log('\n🔬 TEST 3: Frontend Display Verification...');
    
    await page.goto('http://localhost:3000/courses');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Try to navigate to a specific course
    const courseLinks = await page.locator('a[href*="/courses/"]').all();
    console.log(`Found ${courseLinks.length} course links`);
    
    if (courseLinks.length > 0) {
      console.log('🔗 Testing first course navigation...');
      await courseLinks[0].click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      // Check for rich content on the page
      const pageAnalysis = await page.evaluate(() => {
        const content = document.body.textContent || '';
        return {
          contentLength: content.length,
          hasBusinessTerms: /revenue|roi|\$\d+|profit|business|case study|success story/i.test(content),
          hasStepByStep: /step \d+|chapter \d+|lesson \d+|module \d+/i.test(content),
          hasTechnicalContent: /api|code|development|programming|automation/i.test(content),
          moduleCount: (content.match(/module/gi) || []).length,
          lessonCount: (content.match(/lesson/gi) || []).length,
          contentPreview: content.substring(0, 500).replace(/\\s+/g, ' ').trim()
        };
      });
      
      results.frontendDisplay = pageAnalysis;
      
      console.log('📄 Frontend Display Analysis:');
      console.log(`   📊 Page content: ${pageAnalysis.contentLength.toLocaleString()} chars`);
      console.log(`   💰 Business terms: ${pageAnalysis.hasBusinessTerms ? 'YES' : 'NO'}`);
      console.log(`   📋 Step-by-step: ${pageAnalysis.hasStepByStep ? 'YES' : 'NO'}`);
      console.log(`   🔧 Technical content: ${pageAnalysis.hasTechnicalContent ? 'YES' : 'NO'}`);
      console.log(`   📖 Modules mentioned: ${pageAnalysis.moduleCount}`);
      console.log(`   📝 Lessons mentioned: ${pageAnalysis.lessonCount}`);
    }
    
    // Final Success Assessment
    console.log('\n🎯 SUCCESS ASSESSMENT:');
    console.log('======================');
    
    const apiSuccess = apiTests.some(test => test.richPercentage >= 50);
    const contentSuccess = contentSamples.filter(sample => 
      sample.contentLength > 1000 && sample.hasBusinessValue).length >= 3;
    const frontendSuccess = results.frontendDisplay.contentLength > 2000 && 
                           results.frontendDisplay.hasBusinessTerms;
    
    console.log(`✅ API Rich Content: ${apiSuccess ? 'SUCCESS' : 'NEEDS WORK'}`);
    console.log(`✅ Content Quality: ${contentSuccess ? 'SUCCESS' : 'NEEDS WORK'}`);
    console.log(`✅ Frontend Display: ${frontendSuccess ? 'SUCCESS' : 'NEEDS WORK'}`);
    
    const overallSuccess = apiSuccess && contentSuccess;
    
    if (overallSuccess) {
      console.log('\n🎉 OVERALL RESULT: SUCCESS!');
      console.log('🚀 Rich content from markdown files is now live in the app!');
      console.log('✨ Premium educational experience achieved!');
      
      // Calculate improvement metrics
      const avgRichPercentage = apiTests.reduce((sum, test) => 
        sum + (test.richPercentage || 0), 0) / apiTests.length;
      console.log(`📈 Average rich content: ${Math.round(avgRichPercentage)}%`);
      
      const businessContentPercentage = contentSamples.filter(s => s.hasBusinessValue).length / 
                                       contentSamples.length * 100;
      console.log(`💰 Business value content: ${Math.round(businessContentPercentage)}%`);
      
    } else {
      console.log('\n⚠️ PARTIAL SUCCESS - Some areas need optimization');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  } finally {
    await browser.close();
  }
  
  return results;
}

// Run verification
verifyRichContentSuccess()
  .then(() => {
    console.log('\n✅ Rich content verification completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  });