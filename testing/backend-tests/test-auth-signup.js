// Test sign up with new credentials
const { chromium } = require('playwright');

async function testSignUp() {
  console.log('📝 TESTING SIGN UP WITH NEW CREDENTIALS');
  console.log('=======================================');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const page = await browser.newPage();
  
  // Capture network requests
  page.on('request', request => {
    if (request.url().includes('supabase') && request.method() === 'POST') {
      console.log(`🌐 REQUEST: ${request.method()} ${request.url()}`);
    }
  });
  
  // Capture responses
  page.on('response', async response => {
    if (response.url().includes('supabase') && response.request().method() === 'POST') {
      console.log(`📥 RESPONSE: ${response.status()} ${response.url()}`);
      try {
        const text = await response.text();
        if (text.includes('error')) {
          console.log(`❌ Error: ${text.substring(0, 200)}...`);
        } else if (text.includes('access_token') || text.includes('user')) {
          console.log(`✅ Success: User created/authenticated`);
        }
      } catch (e) {
        console.log(`📥 Response received`);
      }
    }
  });
  
  try {
    console.log('🔗 Loading auth page...');
    await page.goto('http://localhost:3000/auth');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Look for sign up tab/mode
    const signUpTab = page.locator('text="Sign Up"');
    if (await signUpTab.count() > 0) {
      console.log('🔘 Switching to Sign Up mode...');
      await signUpTab.click();
      await page.waitForTimeout(1000);
    }
    
    // Fill sign up form
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await emailInput.fill('newuser@test.com');
    await passwordInput.fill('securepassword123');
    
    // Look for sign up button (not sign in)
    const signUpButton = page.locator('button:has-text("Sign Up")').first();
    
    console.log('🔘 Attempting sign up...');
    await signUpButton.click();
    
    // Wait for response
    await page.waitForTimeout(5000);
    
    // Check final state
    const currentUrl = page.url();
    const messages = await page.locator('text=/success|error|created|invalid/i').allInnerTexts();
    
    console.log(`Current URL: ${currentUrl}`);
    console.log(`Messages: ${JSON.stringify(messages)}`);
    
    if (currentUrl !== 'http://localhost:3000/auth' && !messages.some(m => m.toLowerCase().includes('error'))) {
      console.log('🎉 SUCCESS: Authentication appears to be working!');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    console.log('🏁 Test completed.');
    await page.waitForTimeout(2000);
    await browser.close();
  }
}

testSignUp();