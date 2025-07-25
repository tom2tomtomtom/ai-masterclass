// Quick auth test with development frontend
const { chromium } = require('playwright');

async function quickTest() {
  console.log('🎭 QUICK AUTH TEST WITH DEVELOPMENT FRONTEND');
  console.log('===========================================');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Monitor auth-related console messages
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Invalid API key') || text.includes('Auth') || text.includes('error') || text.includes('Error')) {
      console.log(`[BROWSER]: ${text}`);
    }
  });
  
  try {
    // Go to auth page
    await page.goto('http://localhost:3000/auth');
    await page.waitForTimeout(3000);
    
    // Fill and submit form
    await page.fill('input[type="email"]', 'test@gmail.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for result
    await page.waitForTimeout(5000);
    
    // Check for errors
    const errors = await page.locator('[class*="error"], [role="alert"]').allTextContents();
    
    if (errors.some(e => e.includes('Invalid API key'))) {
      console.log('❌ STILL GETTING INVALID API KEY ERROR');
      console.log('🔍 Let me check what config the browser is actually using...');
      
      const browserConfig = await page.evaluate(() => {
        // Get the actual config being used
        const envVars = {};
        const keys = Object.keys(process.env || {});
        keys.forEach(key => {
          if (key.startsWith('REACT_APP_')) {
            envVars[key] = process.env[key];
          }
        });
        return envVars;
      });
      
      console.log('Browser environment config:', browserConfig);
    } else {
      console.log('✅ No Invalid API key error!');
    }
    
  } catch (error) {
    console.log(`Test error: ${error.message}`);
  } finally {
    await browser.close();
  }
}

quickTest();