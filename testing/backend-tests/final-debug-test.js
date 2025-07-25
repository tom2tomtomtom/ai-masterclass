// Final debug test with Playwright to see what config is actually being used
const { chromium } = require('playwright');

async function finalDebugTest() {
  console.log('🔍 FINAL DEBUG: CHECKING ACTUAL CONFIG IN BROWSER');
  console.log('================================================');
  
  const browser = await chromium.launch({ headless: false, devtools: true });
  const page = await browser.newPage();
  
  // Capture console output
  page.on('console', msg => {
    if (msg.text().includes('FRONTEND CONFIG DEBUG') || 
        msg.text().includes('PROCESS ENV DEBUG') ||
        msg.text().includes('Environment:') ||
        msg.text().includes('Supabase')) {
      console.log(`[BROWSER]: ${msg.text()}`);
    }
  });
  
  try {
    console.log('⏳ Waiting for frontend to start...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    console.log('🔗 Navigating to frontend...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('✅ Page loaded. Check console output above for config details.');
    
    // Keep browser open for manual inspection
    console.log('🔍 Browser is open for manual inspection. Check the console tab.');
    console.log('   Press Ctrl+C to close when done.');
    
    // Wait indefinitely
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

finalDebugTest();