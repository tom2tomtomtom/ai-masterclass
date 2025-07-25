// Test authentication on /auth route
const { chromium } = require('playwright');

async function testAuthRoute() {
  console.log('🔐 TESTING AUTHENTICATION ON /auth ROUTE');
  console.log('=========================================');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const page = await browser.newPage();
  
  // Capture console output
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('AUTH') || 
        text.includes('Error') ||
        text.includes('Login') ||
        text.includes('CONFIG') ||
        text.includes('Invalid')) {
      console.log(`[BROWSER ${msg.type()}]: ${text}`);
    }
  });
  
  // Capture network requests to Supabase
  page.on('request', request => {
    if (request.url().includes('supabase') && request.method() === 'POST') {
      console.log(`🌐 REQUEST: ${request.method()} ${request.url()}`);
      const headers = request.headers();
      if (headers.apikey) {
        console.log(`🗝️  API Key (last 20): ${headers.apikey.slice(-20)}`);
      }
    }
  });
  
  // Capture responses
  page.on('response', async response => {
    if (response.url().includes('supabase') && response.request().method() === 'POST') {
      console.log(`📥 RESPONSE: ${response.status()} ${response.url()}`);
      try {
        const text = await response.text();
        if (text.includes('error') || text.includes('Invalid')) {
          console.log(`❌ Response Error: ${text.substring(0, 200)}...`);
        } else if (text.includes('access_token')) {
          console.log(`✅ Response Success: Authentication token received`);
        } else {
          console.log(`📄 Response: ${text.substring(0, 100)}...`);
        }
      } catch (e) {
        console.log(`📥 Response received (couldn't parse)`);
      }
    }
  });
  
  try {
    console.log('🔗 Loading auth page...');
    await page.goto('http://localhost:3000/auth');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('📝 Testing sign up...');
    
    // Look for email and password inputs
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const signUpButton = page.locator('button:has-text("Sign Up"), button[type="submit"]');
    
    const emailCount = await emailInput.count();
    const passwordCount = await passwordInput.count();
    const buttonCount = await signUpButton.count();
    
    console.log(`Email inputs found: ${emailCount}`);
    console.log(`Password inputs found: ${passwordCount}`);
    console.log(`Sign up buttons found: ${buttonCount}`);
    
    if (emailCount > 0 && passwordCount > 0 && buttonCount > 0) {
      // Fill form
      await emailInput.first().fill('test@example.com');
      await passwordInput.first().fill('testpassword123');
      
      console.log('🔘 Clicking sign up...');
      await signUpButton.first().click();
      
      // Wait for network activity
      await page.waitForTimeout(5000);
      
      // Check for any success/error messages
      const messages = await page.locator('text=/error|success|invalid|login/i').allInnerTexts();
      if (messages.length > 0) {
        console.log('📄 Messages found:', messages);
      }
      
      console.log('✅ Sign up test completed');
    } else {
      console.log('❌ Required form elements not found');
      
      // Take a screenshot for debugging
      const content = await page.content();
      console.log('📄 Page content preview:', content.substring(0, 500));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    console.log('🏁 Test completed. Closing browser...');
    await page.waitForTimeout(3000);
    await browser.close();
  }
}

testAuthRoute();