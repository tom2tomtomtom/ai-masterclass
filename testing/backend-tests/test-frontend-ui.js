// Test actual frontend UI with Playwright to diagnose authentication issue
const { chromium } = require('playwright');

async function testFrontendUI() {
  console.log('🎭 PLAYWRIGHT FRONTEND UI TEST');
  console.log('==============================');
  
  let browser;
  let page;
  
  try {
    // Launch browser
    console.log('🚀 Launching browser...');
    browser = await chromium.launch({ 
      headless: false, // Show browser to see what's happening
      slowMo: 1000 // Slow down for debugging
    });
    
    const context = await browser.newContext();
    page = await context.newPage();
    
    // Capture console logs and errors
    page.on('console', msg => {
      console.log(`[BROWSER CONSOLE ${msg.type()}]: ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
      console.log(`[BROWSER ERROR]: ${error.message}`);
    });
    
    // Navigate to frontend
    console.log('🌐 Navigating to frontend...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Check if we can see the page
    const title = await page.title();
    console.log(`📄 Page title: "${title}"`);
    
    // Look for authentication elements
    console.log('🔍 Looking for authentication elements...');
    
    // Check if there's a signup/login form
    const signupButton = await page.$('button:has-text("Sign Up"), button:has-text("Register"), input[type="submit"][value*="Sign"], input[type="submit"][value*="Register"]');
    const loginButton = await page.$('button:has-text("Login"), button:has-text("Sign In"), input[type="submit"][value*="Login"], input[type="submit"][value*="Sign In"]');
    const emailInput = await page.$('input[type="email"], input[name*="email"], input[placeholder*="email"]');
    const passwordInput = await page.$('input[type="password"], input[name*="password"], input[placeholder*="password"]');
    
    console.log(`   Email input found: ${emailInput ? '✅' : '❌'}`);
    console.log(`   Password input found: ${passwordInput ? '✅' : '❌'}`);
    console.log(`   Signup button found: ${signupButton ? '✅' : '❌'}`);
    console.log(`   Login button found: ${loginButton ? '✅' : '❌'}`);
    
    if (!emailInput || !passwordInput) {
      console.log('❌ Cannot find authentication form. Checking page content...');
      const bodyText = await page.textContent('body');
      console.log(`📄 Page content preview: ${bodyText.substring(0, 200)}...`);
      return;
    }
    
    // Test registration
    console.log('\n📝 Testing user registration...');
    
    // Clear and fill form
    await emailInput.clear();
    await emailInput.fill('playwright-test@gmail.com');
    await passwordInput.clear();
    await passwordInput.fill('playwright123');
    
    // Look for name field if it exists
    const nameInput = await page.$('input[name*="name"], input[placeholder*="name"], input[name="firstName"], input[name="fullName"]');
    if (nameInput) {
      await nameInput.clear();
      await nameInput.fill('Playwright Test User');
    }
    
    console.log('   ✅ Form filled with test data');
    
    // Click signup/register button
    if (signupButton) {
      console.log('   🖱️ Clicking signup button...');
      await signupButton.click();
    } else {
      console.log('   ❌ No signup button found, trying form submission...');
      await page.keyboard.press('Enter');
    }
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    // Check for error messages
    console.log('\n🔍 Checking for error messages...');
    
    const errorMessages = await page.$$eval('[class*="error"], [class*="alert"], .notification, .toast, [role="alert"]', elements => {
      return elements.map(el => el.textContent.trim()).filter(text => text.length > 0);
    });
    
    if (errorMessages.length > 0) {
      console.log('   ❌ Error messages found:');
      errorMessages.forEach(msg => console.log(`      - "${msg}"`));
      
      // Check specifically for "Invalid API key" error
      const hasInvalidApiKey = errorMessages.some(msg => 
        msg.toLowerCase().includes('invalid api key') || 
        msg.toLowerCase().includes('invalid_api_key')
      );
      
      if (hasInvalidApiKey) {
        console.log('\n🔥 CONFIRMED: "Invalid API key" error in UI!');
        console.log('   📋 This indicates the frontend is using incorrect Supabase configuration');
      }
    } else {
      console.log('   ✅ No error messages visible');
    }
    
    // Check network requests
    console.log('\n🌐 Monitoring network requests...');
    
    page.on('response', response => {
      if (response.url().includes('supabase') || response.url().includes('auth')) {
        console.log(`   📡 Network: ${response.status()} ${response.url()}`);
      }
    });
    
    // Try login instead
    console.log('\n🔐 Testing login flow...');
    
    const loginForm = await page.$('form:has(input[type="password"])');
    if (loginForm) {
      // Clear form and try login
      await emailInput.clear();
      await emailInput.fill('freshuser@gmail.com');
      await passwordInput.clear(); 
      await passwordInput.fill('freshpass123');
      
      if (loginButton) {
        console.log('   🖱️ Clicking login button...');
        await loginButton.click();
      } else {
        await page.keyboard.press('Enter');
      }
      
      await page.waitForTimeout(3000);
      
      // Check for new error messages
      const loginErrors = await page.$$eval('[class*="error"], [class*="alert"], .notification, .toast, [role="alert"]', elements => {
        return elements.map(el => el.textContent.trim()).filter(text => text.length > 0);
      });
      
      if (loginErrors.length > 0) {
        console.log('   ❌ Login error messages:');
        loginErrors.forEach(msg => console.log(`      - "${msg}"`));
      } else {
        console.log('   ✅ Login successful or no errors shown');
      }
    }
    
    // Final diagnosis
    console.log('\n🎯 UI DIAGNOSIS COMPLETE');
    console.log('========================');
    
    // Check what Supabase config the frontend is actually using
    const supabaseConfig = await page.evaluate(() => {
      // Try to access environment variables or config
      return {
        supabaseUrl: window.REACT_APP_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
        hasSupabaseKey: !!(window.REACT_APP_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY),
        userAgent: navigator.userAgent,
        location: window.location.href
      };
    });
    
    console.log('Frontend runtime config:', supabaseConfig);
    
  } catch (error) {
    console.error('❌ Playwright test failed:', error);
  } finally {
    if (browser) {
      console.log('\n🔚 Closing browser...');
      await browser.close();
    }
  }
}

// Check if Playwright is available
async function checkPlaywrightAvailable() {
  try {
    require('playwright');
    return true;
  } catch (error) {
    console.log('❌ Playwright not available. Installing...');
    console.log('Run: npm install playwright && npx playwright install');
    return false;
  }
}

async function main() {
  if (await checkPlaywrightAvailable()) {
    await testFrontendUI();
  }
}

main();