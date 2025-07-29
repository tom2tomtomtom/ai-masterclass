// Final verification that the port configuration fix worked
const { chromium } = require('playwright');
const logger = require('../utils/logger');

async function finalVerification() {
  logger.info('🔍 FINAL VERIFICATION - Testing complete fix');
  logger.info('='.repeat(60));
  
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
        logger.info('🌐 API REQUEST:', request.method(), request.url());
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('api')) {
        apiResponses.push({
          status: response.status(),
          url: response.url(),
          timestamp: Date.now()
        });
        logger.info('📡 API RESPONSE:', response.status(), response.url());
      }
    });

    logger.info('\n1️⃣ TESTING FRONTEND LOAD WITH CORRECT PORT');
    logger.info('-'.repeat(50));
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000); // Give time for API calls
    
    // Take screenshot
    await page.screenshot({ 
      path: '/Users/thomasdowuona-hyde/AI-Masterclass/final-verification.png', 
      fullPage: true 
    });
    
    logger.info('\n📊 Network Analysis:');
    logger.info('   Total API requests:', apiRequests.length);
    logger.info('   Total API responses:', apiResponses.length);
    
    // Check if requests are going to the right port
    const correctPortRequests = apiRequests.filter(req => req.url.includes(':8000'));
    const wrongPortRequests = apiRequests.filter(req => req.url.includes(':5001'));
    
    logger.info('   Requests to port 8000 (correct):', correctPortRequests.length, '✅');
    logger.info('   Requests to port 5001 (wrong):', wrongPortRequests.length, wrongPortRequests.length === 0 ? '✅' : '❌');
    
    // Check successful responses
    const successfulResponses = apiResponses.filter(resp => resp.status === 200);
    const failedResponses = apiResponses.filter(resp => resp.status >= 400);
    
    logger.info('   Successful responses (200):', successfulResponses.length, successfulResponses.length > 0 ? '✅' : '❌');
    logger.info('   Failed responses (4xx/5xx):', failedResponses.length, failedResponses.length === 0 ? '✅' : '❌');
    
    logger.info('\n2️⃣ TESTING PAGE CONTENT');
    logger.info('-'.repeat(50));
    
    const bodyText = await page.locator('body').textContent();
    
    // Check for error indicators
    const hasConnectionErrors = bodyText.includes('Failed to fetch') || bodyText.includes('Connection refused');
    const hasAPIErrors = bodyText.includes('Invalid API key') || bodyText.includes('Authentication failed');
    const hasCourses = bodyText.includes('Available Courses') || bodyText.includes('Google AI & Gemini Mastery');
    const hasSignIn = bodyText.includes('Sign In');
    
    logger.info('📊 Content Analysis:');
    logger.info('   Has connection errors:', hasConnectionErrors ? '❌ YES' : '✅ NO');
    logger.info('   Has API errors:', hasAPIErrors ? '❌ YES' : '✅ NO');
    logger.info('   Shows courses:', hasCourses ? '✅ YES' : '❌ NO');
    logger.info('   Has sign-in form:', hasSignIn ? '✅ YES' : '❌ NO');
    
    if (hasCourses) {
      logger.info('\n3️⃣ TESTING COURSE NAVIGATION');
      logger.info('-'.repeat(50));
      
      try {
        // Look for Google AI course
        const googleAIExists = await page.locator('text=Google AI & Gemini Mastery').count() > 0;
        
        if (googleAIExists) {
          logger.info('✅ Google AI course found');
          
          await page.click('text=Google AI & Gemini Mastery');
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(3000);
          
          const coursePageText = await page.locator('body').textContent();
          const hasIntroLesson = coursePageText.includes('Introduction to Google AI & Gemini');
          
          logger.info('✅ Navigated to course page');
          logger.info('   Has intro lesson:', hasIntroLesson ? '✅ YES' : '❌ NO');
          
          if (hasIntroLesson) {
            logger.info('\n4️⃣ TESTING RICH CONTENT ACCESS');
            logger.info('-'.repeat(50));
            
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
            
            logger.info('📊 Rich Content Analysis:');
            logger.info('   Rich content header:', hasRichHeader ? '✅' : '❌');
            logger.info('   Copy-paste prompts:', hasPrompts ? '✅' : '❌');
            logger.info('   Customizable placeholders:', hasPlaceholders ? '✅' : '❌');
            logger.info('   Interactive quiz:', hasQuiz ? '✅' : '❌');
            logger.info('   Practical tasks:', hasTasks ? '✅' : '❌');
            
            const richContentScore = [hasRichHeader, hasPrompts, hasPlaceholders, hasQuiz, hasTasks]
              .filter(Boolean).length;
              
            logger.info(`\n🎯 RICH CONTENT SCORE: ${richContentScore}/5`);
            
            if (richContentScore >= 4) {
              logger.info('🎉 EXCELLENT: Rich content is displaying properly!');
            } else if (richContentScore >= 2) {
              logger.info('⚠️  PARTIAL: Some rich content displaying');
            } else {
              logger.info('❌ POOR: Rich content not displaying correctly');
            }
          }
        } else {
          logger.info('❌ Google AI course not found');
        }
      } catch (navError) {
        logger.info('❌ Navigation error:', navError.message);
      }
    }
    
    logger.info('\n5️⃣ FINAL SYSTEM STATUS');
    logger.info('-'.repeat(50));
    
    const systemHealth = {
      portConfiguration: wrongPortRequests.length === 0 && correctPortRequests.length > 0,
      apiConnectivity: successfulResponses.length > 0 && failedResponses.length === 0,
      contentLoading: hasCourses && !hasConnectionErrors,
      noErrors: !hasConnectionErrors && !hasAPIErrors
    };
    
    const healthScore = Object.values(systemHealth).filter(Boolean).length;
    
    logger.info('📊 System Health Check:');
    logger.info(`   Port configuration: ${systemHealth.portConfiguration ? '✅' : '❌'}`);
    logger.info(`   API connectivity: ${systemHealth.apiConnectivity ? '✅' : '❌'}`);
    logger.info(`   Content loading: ${systemHealth.contentLoading ? '✅' : '❌'}`);
    logger.info(`   No errors: ${systemHealth.noErrors ? '✅' : '❌'}`);
    
    logger.info(`\n🏥 OVERALL HEALTH: ${healthScore}/4`);
    
    if (healthScore === 4) {
      logger.info('🎉 SYSTEM FULLY OPERATIONAL!');
      logger.info('✅ Frontend-Backend communication fixed');
      logger.info('✅ Rich content should be accessible');
      logger.info('✅ All fundamental issues resolved');
    } else if (healthScore >= 2) {
      logger.info('⚠️  SYSTEM PARTIALLY OPERATIONAL');
      logger.info('   Some issues remain to be addressed');
    } else {
      logger.info('❌ SYSTEM NEEDS FURTHER FIXES');
      logger.info('   Fundamental issues still exist');
    }
    
  } catch (error) {
    logger.error('❌ VERIFICATION ERROR:', error);
  } finally {
    await browser.close();
    logger.info('\n📸 Final screenshot saved as: final-verification.png');
  }
}

finalVerification();