// Capture debug output from browser console
const { chromium } = require('playwright');

async function testDebugOutput() {
  console.log('🔍 CAPTURING DEBUG OUTPUT FROM BROWSER');
  console.log('=====================================');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const page = await browser.newPage();
  
  // Capture all console output
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('AUTH UTILS CONFIG') || 
        text.includes('FRONTEND CONFIG DEBUG') ||
        text.includes('keyLastChars') ||
        text.includes('Supabase') ||
        text.includes('environment:') ||
        text.includes('CONFIG')) {
      console.log(`[BROWSER ${msg.type()}]: ${text}`);
    }
  });
  
  try {
    console.log('⏳ Waiting for frontend to start...');
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    console.log('🔗 Loading page to see debug output...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('\n✅ Debug output captured above.');
    console.log('💡 If no debug output, the frontend may not be fully started yet.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testDebugOutput();