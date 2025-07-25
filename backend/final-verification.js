// Final verification that the port configuration fix worked
const { chromium } = require('playwright');

async function finalVerification() {
  console.log('🔍 FINAL VERIFICATION - Testing complete fix');
  console.log('='.repeat(60));
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 1500 
  });
  const page = await browser.newPage();

  try {
    // Monitor network requests
    let apiRequests = [];
    let apiResponses = [];
    
    page.on('request', request => {
      if (request.url().includes('api')) {
        apiRequests.push({
          method: request.method(),
          url: request.url(),
          timestamp: Date.now()
        });
        console.log('🌐 API REQUEST:', request.method(), request.url());
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('api')) {
        apiResponses.push({
          status: response.status(),
          url: response.url(),
          timestamp: Date.now()
        });
        console.log('📡 API RESPONSE:', response.status(), response.url());
      }
    });

    console.log('\n1️⃣ TESTING FRONTEND LOAD WITH CORRECT PORT');
    console.log('-'.repeat(50));
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000); // Give time for API calls
    
    // Take screenshot
    await page.screenshot({ 
      path: '/Users/thomasdowuona-hyde/AI-Masterclass/final-verification.png', 
      fullPage: true 
    });
    
    console.log('\n📊 Network Analysis:');
    console.log('   Total API requests:', apiRequests.length);
    console.log('   Total API responses:', apiResponses.length);
    
    // Check if requests are going to the right port
    const correctPortRequests = apiRequests.filter(req => req.url.includes(':8000'));
    const wrongPortRequests = apiRequests.filter(req => req.url.includes(':5001'));
    
    console.log('   Requests to port 8000 (correct):', correctPortRequests.length, '✅');
    console.log('   Requests to port 5001 (wrong):', wrongPortRequests.length, wrongPortRequests.length === 0 ? '✅' : '❌');
    
    // Check successful responses
    const successfulResponses = apiResponses.filter(resp => resp.status === 200);
    const failedResponses = apiResponses.filter(resp => resp.status >= 400);
    
    console.log('   Successful responses (200):', successfulResponses.length, successfulResponses.length > 0 ? '✅' : '❌');
    console.log('   Failed responses (4xx/5xx):', failedResponses.length, failedResponses.length === 0 ? '✅' : '❌');
    
    console.log('\n2️⃣ TESTING PAGE CONTENT');
    console.log('-'.repeat(50));
    
    const bodyText = await page.locator('body').textContent();
    
    // Check for error indicators
    const hasConnectionErrors = bodyText.includes('Failed to fetch') || bodyText.includes('Connection refused');
    const hasAPIErrors = bodyText.includes('Invalid API key') || bodyText.includes('Authentication failed');
    const hasCourses = bodyText.includes('Available Courses') || bodyText.includes('Google AI & Gemini Mastery');
    const hasSignIn = bodyText.includes('Sign In');
    
    console.log('📊 Content Analysis:');
    console.log('   Has connection errors:', hasConnectionErrors ? '❌ YES' : '✅ NO');
    console.log('   Has API errors:', hasAPIErrors ? '❌ YES' : '✅ NO');
    console.log('   Shows courses:', hasCourses ? '✅ YES' : '❌ NO');
    console.log('   Has sign-in form:', hasSignIn ? '✅ YES' : '❌ NO');
    
    if (hasCourses) {
      console.log('\n3️⃣ TESTING COURSE NAVIGATION');
      console.log('-'.repeat(50));
      
      try {
        // Look for Google AI course
        const googleAIExists = await page.locator('text=Google AI & Gemini Mastery').count() > 0;
        
        if (googleAIExists) {
          console.log('✅ Google AI course found');
          
          await page.click('text=Google AI & Gemini Mastery');
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(3000);
          
          const coursePageText = await page.locator('body').textContent();
          const hasIntroLesson = coursePageText.includes('Introduction to Google AI & Gemini');
          
          console.log('✅ Navigated to course page');
          console.log('   Has intro lesson:', hasIntroLesson ? '✅ YES' : '❌ NO');
          
          if (hasIntroLesson) {
            console.log('\n4️⃣ TESTING RICH CONTENT ACCESS');
            console.log('-'.repeat(50));
            
            await page.click('text=Introduction to Google AI & Gemini');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(3000);
            
            const lessonText = await page.locator('body').textContent();
            
            // Check for rich content indicators
            const hasRichHeader = lessonText.includes('Google AI & Gemini Mastery → Unlock Advanced AI Capabilities');
            const hasPrompts = lessonText.includes('Copy-Paste Prompts');
            const hasPlaceholders = lessonText.includes('{YOUR_INDUSTRY/MARKET}');
            const hasQuiz = lessonText.includes('Knowledge Check');
            const hasTasks = lessonText.includes('Practical Tasks');
            
            console.log('📊 Rich Content Analysis:');
            console.log('   Rich content header:', hasRichHeader ? '✅' : '❌');
            console.log('   Copy-paste prompts:', hasPrompts ? '✅' : '❌');
            console.log('   Customizable placeholders:', hasPlaceholders ? '✅' : '❌');
            console.log('   Interactive quiz:', hasQuiz ? '✅' : '❌');
            console.log('   Practical tasks:', hasTasks ? '✅' : '❌');
            
            const richContentScore = [hasRichHeader, hasPrompts, hasPlaceholders, hasQuiz, hasTasks]
              .filter(Boolean).length;
              
            console.log(`\n🎯 RICH CONTENT SCORE: ${richContentScore}/5`);
            
            if (richContentScore >= 4) {
              console.log('🎉 EXCELLENT: Rich content is displaying properly!');
            } else if (richContentScore >= 2) {
              console.log('⚠️  PARTIAL: Some rich content displaying');
            } else {
              console.log('❌ POOR: Rich content not displaying correctly');
            }
          }
        } else {
          console.log('❌ Google AI course not found');
        }
      } catch (navError) {
        console.log('❌ Navigation error:', navError.message);
      }
    }
    
    console.log('\n5️⃣ FINAL SYSTEM STATUS');
    console.log('-'.repeat(50));
    
    const systemHealth = {
      portConfiguration: wrongPortRequests.length === 0 && correctPortRequests.length > 0,
      apiConnectivity: successfulResponses.length > 0 && failedResponses.length === 0,
      contentLoading: hasCourses && !hasConnectionErrors,
      noErrors: !hasConnectionErrors && !hasAPIErrors
    };
    
    const healthScore = Object.values(systemHealth).filter(Boolean).length;
    
    console.log('📊 System Health Check:');
    console.log(`   Port configuration: ${systemHealth.portConfiguration ? '✅' : '❌'}`);
    console.log(`   API connectivity: ${systemHealth.apiConnectivity ? '✅' : '❌'}`);
    console.log(`   Content loading: ${systemHealth.contentLoading ? '✅' : '❌'}`);
    console.log(`   No errors: ${systemHealth.noErrors ? '✅' : '❌'}`);
    
    console.log(`\n🏥 OVERALL HEALTH: ${healthScore}/4`);
    
    if (healthScore === 4) {
      console.log('🎉 SYSTEM FULLY OPERATIONAL!');
      console.log('✅ Frontend-Backend communication fixed');
      console.log('✅ Rich content should be accessible');
      console.log('✅ All fundamental issues resolved');
    } else if (healthScore >= 2) {
      console.log('⚠️  SYSTEM PARTIALLY OPERATIONAL');
      console.log('   Some issues remain to be addressed');
    } else {
      console.log('❌ SYSTEM NEEDS FURTHER FIXES');
      console.log('   Fundamental issues still exist');
    }
    
  } catch (error) {
    console.error('❌ VERIFICATION ERROR:', error);
  } finally {
    await browser.close();
    console.log('\n📸 Final screenshot saved as: final-verification.png');
  }
}

finalVerification();