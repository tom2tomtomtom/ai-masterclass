// Test authentication flow with Playwright
const { chromium } = require('playwright');

async function testAuthFlow() {
  console.log('🎭 TESTING AUTHENTICATION FLOW');
  console.log('==============================');
  
  let browser;
  let page;
  
  try {
    // Launch browser
    browser = await chromium.launch({ 
      headless: false, 
      slowMo: 500 
    });
    
    const context = await browser.newContext();
    page = await context.newPage();
    
    // Capture console messages
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Invalid API key') || text.includes('API key') || text.includes('Supabase') || text.includes('ERROR') || text.includes('error')) {
        console.log(`[BROWSER ${msg.type()}]: ${text}`);
      }
    });
    
    page.on('pageerror', error => {
      console.log(`[BROWSER ERROR]: ${error.message}`);
    });
    
    // Monitor network requests to Supabase
    page.on('response', response => {
      if (response.url().includes('supabase') || response.url().includes('auth')) {
        console.log(`[NETWORK]: ${response.status()} ${response.url()}`);
      }
    });
    
    // Go to frontend
    console.log('🌐 Navigating to frontend...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Look for Sign In button
    console.log('🔍 Looking for Sign In button...');
    const signInButton = await page.locator('button:has-text("Sign In"), a:has-text("Sign In"), [role="button"]:has-text("Sign In")').first();
    
    if (await signInButton.isVisible()) {
      console.log('✅ Sign In button found, clicking...');
      await signInButton.click();
      await page.waitForTimeout(2000);
    } else {
      // Try navigating directly to sign-in route
      console.log('🔗 Trying direct navigation to /signin...');
      await page.goto('http://localhost:3000/signin');
      await page.waitForLoadState('networkidle');
    }
    
    // Alternative routes to try
    const authRoutes = ['/signin', '/login', '/auth/login', '/sign-in', '/auth'];
    
    for (const route of authRoutes) {
      console.log(`🔗 Trying route: ${route}`);
      await page.goto(`http://localhost:3000${route}`);
      await page.waitForTimeout(1000);
      
      // Check if auth form is now visible
      const emailInput = await page.locator('input[type="email"], input[name*="email"]').first();
      const passwordInput = await page.locator('input[type="password"], input[name*="password"]').first();
      
      if (await emailInput.isVisible() && await passwordInput.isVisible()) {
        console.log(`✅ Found auth form at route: ${route}`);
        
        // Test authentication
        console.log('📝 Testing authentication...');
        
        // Fill form
        await emailInput.fill('playwright-test@gmail.com');
        await passwordInput.fill('playwright123');
        
        // Look for submit button
        const submitButton = await page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login"), input[type="submit"]').first();
        
        if (await submitButton.isVisible()) {
          console.log('🖱️ Clicking submit button...');
          await submitButton.click();
          
          // Wait for response
          await page.waitForTimeout(3000);
          
          // Check for error messages
          const errorElements = await page.locator('[class*="error"], [class*="alert"], .notification, [role="alert"]').all();
          
          if (errorElements.length > 0) {
            console.log('❌ Error messages found:');
            for (const el of errorElements) {
              const text = await el.textContent();
              if (text && text.trim()) {
                console.log(`   - "${text.trim()}"`);
                
                if (text.toLowerCase().includes('invalid api key')) {
                  console.log('\n🔥 INVALID API KEY ERROR CONFIRMED IN UI!');
                  console.log('   The frontend is definitely using incorrect Supabase configuration');
                  
                  // Check what the frontend thinks its config is
                  const frontendConfig = await page.evaluate(() => {
                    return {
                      NODE_ENV: process.env.NODE_ENV,
                      REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
                      REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY?.substring(0, 30) + '...',
                      location: window.location.href
                    };
                  });
                  
                  console.log('Frontend runtime config:', frontendConfig);
                  return; // Exit early - we found the issue
                }
              }
            }
          } else {
            console.log('✅ No visible error messages');
          }
        } else {
          console.log('❌ No submit button found');
        }
        
        break; // Found auth form, no need to try other routes
      }
    }
    
    // If we haven't found auth form yet, check page content
    const bodyText = await page.textContent('body');
    console.log('\n📄 Current page content (first 300 chars):');
    console.log(bodyText.substring(0, 300) + '...');
    
    // Final check - try to trigger auth programmatically
    console.log('\n🔬 Testing Supabase client directly in browser...');
    
    const supabaseTest = await page.evaluate(async () => {
      try {
        // Check if Supabase is available
        if (window.supabase || window._supabaseClient) {
          const client = window.supabase || window._supabaseClient;
          
          // Test basic auth function
          const { data, error } = await client.auth.getSession();
          
          return {
            supabaseAvailable: true,
            error: error?.message || null,
            hasSession: !!data.session
          };
        } else {
          return { supabaseAvailable: false, error: 'Supabase client not found' };
        }
      } catch (e) {
        return { supabaseAvailable: false, error: e.message };
      }
    });
    
    console.log('Browser Supabase test:', supabaseTest);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (page) {
      await page.close();
    }
    if (browser) {
      await browser.close();
    }
  }
}

testAuthFlow();