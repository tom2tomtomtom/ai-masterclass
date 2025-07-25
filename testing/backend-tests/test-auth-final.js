// Final authentication test with hardcoded fix
const { chromium } = require('playwright');

async function testAuthenticationFlow() {
  console.log('🔐 TESTING AUTHENTICATION WITH HARDCODED KEY FIX');
  console.log('================================================');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const page = await browser.newPage();
  
  // Capture console output
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('AUTH') || 
        text.includes('CONFIG') ||
        text.includes('keyLastChars') ||
        text.includes('Error') ||
        text.includes('Login')) {
      console.log(`[BROWSER ${msg.type()}]: ${text}`);
    }
  });
  
  // Capture network requests
  page.on('request', request => {
    if (request.url().includes('supabase') && request.method() === 'POST') {
      console.log(`🌐 REQUEST: ${request.method()} ${request.url()}`);
      const headers = request.headers();
      if (headers.authorization) {
        console.log(`🔑 Auth Header: ${headers.authorization.slice(0, 50)}...`);
      }
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
          console.log(`❌ Response Error: ${text}`);
        } else if (text.includes('access_token')) {
          console.log(`✅ Response Success: Authentication token received`);
        }
      } catch (e) {
        console.log(`📥 Response received (couldn't parse)`);
      }
    }
  });
  
  try {
    console.log('🔗 Loading frontend...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('🔍 Looking for auth form...');
    
    // Try to find AuthTest component or auth form
    const authTestExists = await page.locator('text=Supabase Auth Test').count();
    const loginExists = await page.locator('text=Login').count();
    const signUpExists = await page.locator('text=Sign').count();
    
    console.log(`AuthTest component: ${authTestExists > 0 ? 'Found' : 'Not found'}`);
    console.log(`Login elements: ${loginExists > 0 ? 'Found' : 'Not found'}`);
    console.log(`Sign up elements: ${signUpExists > 0 ? 'Found' : 'Not found'}`);
    
    // Test auth with test credentials
    if (authTestExists > 0 || loginExists > 0) {
      console.log('📝 Testing authentication...');
      
      // Fill in test credentials
      const emailSelector = 'input[type="email"], input[placeholder*="email" i]';
      const passwordSelector = 'input[type="password"], input[placeholder*="password" i]';
      
      const emailExists = await page.locator(emailSelector).count();
      const passwordExists = await page.locator(passwordSelector).count();
      
      if (emailExists > 0 && passwordExists > 0) {
        await page.fill(emailSelector, 'test@example.com');
        await page.fill(passwordSelector, 'testpassword123');
        
        // Look for sign up button first
        const signUpButton = page.locator('button:has-text("Sign Up"), button:has-text("Test Sign Up")');
        const signUpCount = await signUpButton.count();
        
        if (signUpCount > 0) {
          console.log('🔘 Clicking Sign Up button...');
          await signUpButton.first().click();
          
          // Wait for response
          await page.waitForTimeout(3000);
          console.log('✅ Sign up attempt completed');
        } else {
          console.log('❌ No sign up button found');
        }
      } else {
        console.log('❌ Email or password input not found');
      }
    } else {
      console.log('❌ No authentication form found on page');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    console.log('🏁 Test completed. Closing browser in 5 seconds...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

testAuthenticationFlow();