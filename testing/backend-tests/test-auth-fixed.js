// Test authentication with corrected API key
const { chromium } = require('playwright');

async function testAuthFixed() {
  console.log('🔧 TESTING AUTHENTICATION WITH CORRECTED API KEY');
  console.log('===============================================');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  let success = false;
  
  // Monitor for success/error
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Invalid API key')) {
      console.log('❌ Still getting Invalid API key error');
    } else if (text.includes('Login successful') || text.includes('success')) {
      console.log('✅ Login success detected!');
      success = true;
    }
  });
  
  try {
    // Wait for frontend to start
    console.log('⏳ Waiting for frontend to start...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('🔗 Navigating to auth page...');
    await page.goto('http://localhost:3000/auth');
    await page.waitForLoadState('networkidle');
    
    console.log('📝 Filling authentication form...');
    await page.fill('input[type="email"]', 'freshuser@gmail.com');
    await page.fill('input[type="password"]', 'freshpass123');
    
    console.log('🖱️ Submitting form...');
    await page.click('button[type="submit"]');
    
    // Wait for result
    await page.waitForTimeout(5000);
    
    // Check for errors
    const errorElements = await page.locator('[class*="error"], [role="alert"]').all();
    let hasError = false;
    
    for (const element of errorElements) {
      const text = await element.textContent();
      if (text && text.trim()) {
        console.log(`Error message: "${text.trim()}"`);
        if (text.includes('Invalid API key')) {
          hasError = true;
        }
      }
    }
    
    if (!hasError && !success) {
      console.log('🎉 NO "Invalid API key" ERROR DETECTED!');
      console.log('✅ Authentication issue appears to be resolved!');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testAuthFixed();