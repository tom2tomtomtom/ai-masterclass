// Deep dive comprehensive auth and content diagnosis
const { chromium } = require('playwright');

async function deepDiveAuthDiagnosis() {
  console.log('🔍 DEEP DIVE AUTH & CONTENT DIAGNOSIS');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 1000 
  });
  const page = await browser.newPage();

  try {
    // Comprehensive request/response monitoring
    let allRequests = [];
    let allResponses = [];
    let authAttempts = [];
    let apiCalls = [];
    
    page.on('request', request => {
      const requestInfo = {
        method: request.method(),
        url: request.url(),
        headers: request.headers(),
        timestamp: Date.now()
      };
      allRequests.push(requestInfo);
      
      if (request.url().includes('auth')) {
        authAttempts.push(requestInfo);
        console.log('🔐 AUTH REQUEST:', request.method(), request.url());
      }
      
      if (request.url().includes('api')) {
        apiCalls.push(requestInfo);
        console.log('🌐 API REQUEST:', request.method(), request.url());
      }
    });
    
    page.on('response', async response => {
      const responseInfo = {
        status: response.status(),
        url: response.url(),
        headers: response.headers(),
        timestamp: Date.now()
      };
      
      try {
        if (response.url().includes('auth') || response.url().includes('api')) {
          const responseText = await response.text();
          responseInfo.body = responseText.substring(0, 500); // First 500 chars
        }
      } catch (e) {
        responseInfo.body = 'Could not read response body';
      }
      
      allResponses.push(responseInfo);
      
      if (response.url().includes('auth')) {
        console.log('🔐 AUTH RESPONSE:', response.status(), response.url());
        if (responseInfo.body) {
          console.log('   Body preview:', responseInfo.body.substring(0, 200));
        }
      }
      
      if (response.url().includes('api')) {
        console.log('📡 API RESPONSE:', response.status(), response.url());
        if (response.status() >= 400 && responseInfo.body) {
          console.log('   Error body:', responseInfo.body.substring(0, 200));
        }
      }
    });

    // Capture console errors
    let consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const errorText = msg.text();
        consoleErrors.push(errorText);
        console.log('❌ CONSOLE ERROR:', errorText);
      }
    });

    console.log('\n1️⃣ INITIAL PAGE LOAD & API ANALYSIS');
    console.log('-'.repeat(60));
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    // Take initial screenshot
    await page.screenshot({ 
      path: '/Users/thomasdowuona-hyde/AI-Masterclass/debug-auth-step1-initial.png', 
      fullPage: true 
    });
    
    console.log('\n📊 INITIAL API CALL ANALYSIS:');
    const port8000Calls = apiCalls.filter(call => call.url.includes(':8000'));
    const port5001Calls = apiCalls.filter(call => call.url.includes(':5001'));
    const successfulResponses = allResponses.filter(r => r.status === 200 && r.url.includes('api'));
    const failedResponses = allResponses.filter(r => r.status >= 400 && r.url.includes('api'));
    
    console.log(`   API calls to port 8000: ${port8000Calls.length} ${port8000Calls.length > 0 ? '✅' : '❌'}`);
    console.log(`   API calls to port 5001: ${port5001Calls.length} ${port5001Calls.length === 0 ? '✅' : '❌'}`);
    console.log(`   Successful API responses: ${successfulResponses.length} ${successfulResponses.length > 0 ? '✅' : '❌'}`);
    console.log(`   Failed API responses: ${failedResponses.length} ${failedResponses.length === 0 ? '✅' : '❌'}`);
    
    if (failedResponses.length > 0) {
      console.log('\n🚨 FAILED API RESPONSES:');
      failedResponses.forEach((resp, index) => {
        console.log(`   ${index + 1}. ${resp.status} ${resp.url}`);
        if (resp.body && resp.body.length > 10) {
          console.log(`      Body: ${resp.body.substring(0, 100)}...`);
        }
      });
    }

    console.log('\n2️⃣ AUTHENTICATION SYSTEM ANALYSIS');
    console.log('-'.repeat(60));
    
    const bodyText = await page.locator('body').textContent();
    const hasSignInForm = bodyText.includes('Sign In') || await page.locator('input[type="email"]').count() > 0;
    const hasCourses = bodyText.includes('Available Courses') || bodyText.includes('Google AI');
    const hasAuthErrors = bodyText.includes('Invalid API key') || bodyText.includes('Authentication failed');
    
    console.log('📊 AUTH STATE ANALYSIS:');
    console.log(`   Has sign-in form: ${hasSignInForm ? '✅' : '❌'}`);
    console.log(`   Shows courses: ${hasCourses ? '✅' : '❌'}`);
    console.log(`   Has auth errors: ${hasAuthErrors ? '🚨 YES' : '✅ NO'}`);
    
    if (hasAuthErrors) {
      const errorMatches = bodyText.match(/(Invalid API key|Authentication failed|Login failed)[^.]*\./gi);
      if (errorMatches) {
        console.log('🚨 AUTH ERROR DETAILS:');
        errorMatches.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }
    }

    if (hasSignInForm) {
      console.log('\n3️⃣ TESTING AUTHENTICATION FLOW');
      console.log('-'.repeat(60));
      
      console.log('🔐 Attempting sign-in with test credentials...');
      
      // Clear any existing auth data
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      await page.fill('input[type="email"]', 'test@gmail.com');
      await page.fill('input[type="password"]', 'password123');
      
      // Take screenshot before sign-in
      await page.screenshot({ 
        path: '/Users/thomasdowuona-hyde/AI-Masterclass/debug-auth-step2-before-signin.png', 
        fullPage: true 
      });
      
      // Monitor auth-specific requests
      const authRequestsBefore = authAttempts.length;
      
      // Click sign-in and wait for response
      await Promise.all([
        page.waitForResponse(response => 
          response.url().includes('auth') || response.url().includes('sign')
        ).catch(() => console.log('⚠️  No auth response detected')),
        page.click('button:has-text("Sign In")')
      ]);
      
      await page.waitForTimeout(5000);
      
      // Take screenshot after sign-in
      await page.screenshot({ 
        path: '/Users/thomasdowuona-hyde/AI-Masterclass/debug-auth-step3-after-signin.png', 
        fullPage: true 
      });
      
      const authRequestsAfter = authAttempts.length;
      const newAuthRequests = authAttempts.slice(authRequestsBefore);
      
      console.log('\n📊 AUTH FLOW ANALYSIS:');
      console.log(`   Auth requests triggered: ${newAuthRequests.length}`);
      
      if (newAuthRequests.length > 0) {
        console.log('🔐 AUTH REQUESTS DETAILS:');
        newAuthRequests.forEach((req, index) => {
          console.log(`   ${index + 1}. ${req.method} ${req.url}`);
          if (req.headers.authorization) {
            console.log(`      Authorization: ${req.headers.authorization.substring(0, 50)}...`);
          }
        });
      }
      
      // Check post-auth state
      const postAuthText = await page.locator('body').textContent();
      const stillHasSignIn = postAuthText.includes('Sign In') && await page.locator('input[type="email"]').count() > 0;
      const hasSuccessRedirect = !stillHasSignIn && postAuthText.includes('Dashboard');
      const hasNewAuthErrors = postAuthText.includes('Invalid API key') || postAuthText.includes('Authentication failed');
      
      console.log('\n📊 POST-AUTH STATE:');
      console.log(`   Still shows sign-in form: ${stillHasSignIn ? '❌ Auth failed' : '✅ Success'}`);
      console.log(`   Redirected to dashboard: ${hasSuccessRedirect ? '✅' : '❌'}`);
      console.log(`   New auth errors: ${hasNewAuthErrors ? '🚨 YES' : '✅ NO'}`);
      
      if (hasNewAuthErrors) {
        const newErrorMatches = postAuthText.match(/(Invalid API key|Authentication failed|Login failed)[^.]*\./gi);
        if (newErrorMatches) {
          console.log('🚨 NEW AUTH ERRORS:');
          newErrorMatches.forEach((error, index) => {
            console.log(`   ${index + 1}. ${error}`);
          });
        }
      }

      console.log('\n4️⃣ SUPABASE vs JWT TOKEN ANALYSIS');
      console.log('-'.repeat(60));
      
      // Check what's in localStorage/sessionStorage
      const storageData = await page.evaluate(() => {
        const local = {};
        const session = {};
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          local[key] = localStorage.getItem(key);
        }
        
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          session[key] = sessionStorage.getItem(key);
        }
        
        return { localStorage: local, sessionStorage: session };
      });
      
      console.log('🔍 STORAGE ANALYSIS:');
      console.log('   LocalStorage keys:', Object.keys(storageData.localStorage));
      console.log('   SessionStorage keys:', Object.keys(storageData.sessionStorage));
      
      // Check for JWT vs Supabase tokens
      const hasJWTToken = Object.keys(storageData.localStorage).some(key => 
        key.includes('jwt') || key.includes('token') || key.includes('auth_token')
      );
      const hasSupabaseSession = Object.keys(storageData.localStorage).some(key => 
        key.includes('supabase') || key.includes('sb-')
      );
      
      console.log(`   Has JWT tokens: ${hasJWTToken ? '⚠️  YES (potential conflict)' : '✅ NO'}`);
      console.log(`   Has Supabase session: ${hasSupabaseSession ? '✅ YES' : '❌ NO'}`);
      
      if (hasJWTToken) {
        const jwtKeys = Object.keys(storageData.localStorage).filter(key => 
          key.includes('jwt') || key.includes('token') || key.includes('auth_token')
        );
        console.log('⚠️  JWT TOKEN KEYS FOUND:');
        jwtKeys.forEach(key => {
          const value = storageData.localStorage[key];
          console.log(`   ${key}: ${value ? value.substring(0, 50) + '...' : 'null'}`);
        });
      }
      
      if (hasSupabaseSession) {
        const supabaseKeys = Object.keys(storageData.localStorage).filter(key => 
          key.includes('supabase') || key.includes('sb-')
        );
        console.log('✅ SUPABASE SESSION KEYS:');
        supabaseKeys.forEach(key => {
          const value = storageData.localStorage[key];
          console.log(`   ${key}: ${value ? 'Present' : 'null'}`);
        });
      }
    }

    console.log('\n5️⃣ CONTENT LOADING ANALYSIS');
    console.log('-'.repeat(60));
    
    const finalBodyText = await page.locator('body').textContent();
    const showsCourses = finalBodyText.includes('Available Courses') || finalBodyText.includes('Google AI');
    
    if (showsCourses) {
      console.log('✅ Courses are visible, testing content access...');
      
      const hasGoogleAI = finalBodyText.includes('Google AI & Gemini Mastery');
      console.log(`   Google AI course visible: ${hasGoogleAI ? '✅' : '❌'}`);
      
      if (hasGoogleAI) {
        try {
          await page.click('text=Google AI & Gemini Mastery');
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(3000);
          
          await page.screenshot({ 
            path: '/Users/thomasdowuona-hyde/AI-Masterclass/debug-auth-step4-course-page.png', 
            fullPage: true 
          });
          
          const coursePageText = await page.locator('body').textContent();
          const hasIntroLesson = coursePageText.includes('Introduction to Google AI & Gemini');
          
          console.log(`   Course page loaded: ✅`);
          console.log(`   Intro lesson visible: ${hasIntroLesson ? '✅' : '❌'}`);
          
          if (hasIntroLesson) {
            await page.click('text=Introduction to Google AI & Gemini');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(3000);
            
            await page.screenshot({ 
              path: '/Users/thomasdowuona-hyde/AI-Masterclass/debug-auth-step5-lesson-content.png', 
              fullPage: true 
            });
            
            const lessonText = await page.locator('body').textContent();
            
            // Check for rich content
            const hasRichHeader = lessonText.includes('Google AI & Gemini Mastery → Unlock Advanced AI Capabilities');
            const hasPrompts = lessonText.includes('Copy-Paste Prompts');
            const hasPlaceholders = lessonText.includes('{YOUR_INDUSTRY/MARKET}');
            const hasQuiz = lessonText.includes('Knowledge Check');
            const hasTasks = lessonText.includes('Practical Tasks');
            const hasMarketResearch = lessonText.includes('Real-Time Market Research');
            
            console.log('\n📊 RICH CONTENT VERIFICATION:');
            console.log(`   Rich content header: ${hasRichHeader ? '✅' : '❌'}`);
            console.log(`   Copy-paste prompts: ${hasPrompts ? '✅' : '❌'}`);
            console.log(`   Customizable placeholders: ${hasPlaceholders ? '✅' : '❌'}`);
            console.log(`   Interactive quiz: ${hasQuiz ? '✅' : '❌'}`);
            console.log(`   Practical tasks: ${hasTasks ? '✅' : '❌'}`);
            console.log(`   Market research prompt: ${hasMarketResearch ? '✅' : '❌'}`);
            
            const richScore = [hasRichHeader, hasPrompts, hasPlaceholders, hasQuiz, hasTasks, hasMarketResearch]
              .filter(Boolean).length;
              
            console.log(`\n🎯 RICH CONTENT SCORE: ${richScore}/6`);
            
            if (richScore === 6) {
              console.log('🎉 PERFECT: All rich content is displaying!');
            } else if (richScore >= 4) {
              console.log('✅ GOOD: Most rich content is displaying');
            } else if (richScore >= 2) {
              console.log('⚠️  PARTIAL: Some rich content missing');
            } else {
              console.log('❌ POOR: Rich content not displaying correctly');
              console.log('📄 Lesson content preview:', lessonText.substring(0, 500));
            }
          }
        } catch (navError) {
          console.log('❌ Course navigation failed:', navError.message);
        }
      }
    } else {
      console.log('❌ No courses visible - content loading failed');
    }

    console.log('\n6️⃣ COMPREHENSIVE DIAGNOSIS SUMMARY');
    console.log('-'.repeat(60));
    
    const diagnosis = {
      portConfiguration: port8000Calls.length > 0 && port5001Calls.length === 0,
      apiConnectivity: successfulResponses.length > 0 && failedResponses.length === 0,
      authFlow: !hasAuthErrors && authAttempts.length > 0,
      tokenConflict: hasJWTToken && !hasSupabaseSession,
      contentLoading: showsCourses,
      richContent: hasRichHeader && hasPrompts && hasPlaceholders
    };
    
    console.log('🏥 SYSTEM HEALTH DIAGNOSIS:');
    console.log(`   ✅ Port configuration: ${diagnosis.portConfiguration ? 'CORRECT' : 'INCORRECT'}`);
    console.log(`   ✅ API connectivity: ${diagnosis.apiConnectivity ? 'WORKING' : 'FAILING'}`);
    console.log(`   ✅ Auth flow: ${diagnosis.authFlow ? 'WORKING' : 'FAILING'}`);
    console.log(`   ✅ Token system: ${diagnosis.tokenConflict ? 'CONFLICT DETECTED' : 'CLEAN'}`);
    console.log(`   ✅ Content loading: ${diagnosis.contentLoading ? 'WORKING' : 'FAILING'}`);
    console.log(`   ✅ Rich content: ${diagnosis.richContent ? 'DISPLAYING' : 'MISSING'}`);
    
    const healthyComponents = Object.values(diagnosis).filter(Boolean).length;
    console.log(`\n🎯 OVERALL SYSTEM HEALTH: ${healthyComponents}/6`);
    
    if (healthyComponents === 6) {
      console.log('🎉 SYSTEM FULLY OPERATIONAL!');
    } else if (healthyComponents >= 4) {
      console.log('⚠️  SYSTEM MOSTLY WORKING - Minor issues to resolve');
    } else {
      console.log('🚨 SYSTEM NEEDS MAJOR FIXES');
    }
    
    console.log('\n🔧 SPECIFIC ISSUES TO ADDRESS:');
    if (!diagnosis.portConfiguration) {
      console.log('   🚨 Port configuration: Frontend still calling wrong port');
    }
    if (!diagnosis.apiConnectivity) {
      console.log('   🚨 API connectivity: Backend not responding correctly');
    }
    if (!diagnosis.authFlow) {
      console.log('   🚨 Auth flow: Authentication system not working');
    }
    if (diagnosis.tokenConflict) {
      console.log('   🚨 Token conflict: JWT and Supabase tokens conflicting');
    }
    if (!diagnosis.contentLoading) {
      console.log('   🚨 Content loading: Courses not displaying');
    }
    if (!diagnosis.richContent) {
      console.log('   🚨 Rich content: Interactive content not displaying');
    }
    
  } catch (error) {
    console.error('❌ DIAGNOSIS ERROR:', error);
    await page.screenshot({ 
      path: '/Users/thomasdowuona-hyde/AI-Masterclass/debug-auth-error.png', 
      fullPage: true 
    });
  } finally {
    await browser.close();
    console.log('\n📸 Debug screenshots saved:');
    console.log('   - debug-auth-step1-initial.png');
    console.log('   - debug-auth-step2-before-signin.png');
    console.log('   - debug-auth-step3-after-signin.png');
    console.log('   - debug-auth-step4-course-page.png');
    console.log('   - debug-auth-step5-lesson-content.png');
  }
}

deepDiveAuthDiagnosis();